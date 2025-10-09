'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import {
  FaMousePointer, FaSquare, FaDrawPolygon, FaMapMarkerAlt, FaTrashAlt, FaSave, FaEdit, FaDownload, FaUndo, FaRedo, FaCircle, FaDotCircle, FaBroom,
  FaMinus, FaArrowRight, FaFont, FaPaintBrush, FaRuler, FaAngleRight, FaInfoCircle, FaExclamationTriangle, FaCheckCircle,
  FaVectorSquare, FaPen, FaPencilRuler, FaRulerCombined, FaDrawPolygon as FaPolygon, FaCrosshairs, FaTextWidth, FaHighlighter
} from 'react-icons/fa'
import styled from 'styled-components'

export interface Annotation {
  id: string
  type: 'rectangle' | 'circle' | 'ellipse' | 'polygon' | 'point' | 'line' | 'arrow' | 'text' | 'freehand' | 'measure-line' | 'measure-circle' | 'measure-freehand'
  label: string
  color: string
  coordinates: { 
    x: number
    y: number
    width?: number
    height?: number
    radius?: number
    radiusX?: number
    radiusY?: number
    points?: { x: number; y: number }[]
    startX?: number
    startY?: number
    endX?: number
    endY?: number
    text?: string
    fontSize?: number
  }
  createdAt: Date
  createdBy: string
  metadata?: {
    measurements?: {
      length?: number
      area?: number
      angle?: number
      unit?: 'px' | 'mm'
    }
    confidence?: number
    tags?: string[]
    validation?: {
      isValid: boolean
      errors: string[]
      warnings: string[]
    }
  }
}

export interface AnnotationCanvasProps {
  imageUrl: string
  readOnly?: boolean
  onAnnotationsChange?: (annotations: Annotation[]) => void
  initialAnnotations?: Annotation[]
  selectedPreset?: string | null
  selectedColor?: string | null
  pixelSpacing?: number // Pixel spacing in mm/pixel (default: 0.1)
}

const CanvasContainer = styled.div<{ $isDrawing?: boolean }>`
  position: relative;
  width: 100%;
  height: 100%;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  cursor: ${props => props.$isDrawing ? 'crosshair' : 'default'};
`

const AnnotationImage = styled.img<{ $isDrawing?: boolean }>`
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  user-select: none;
  touch-action: none;
  pointer-events: ${props => props.$isDrawing ? 'none' : 'auto'};
`

const AnnotationOverlay = styled.div<{ $isDrawing?: boolean; $isPolygonDrawing?: boolean; $tool?: string }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: ${props => props.$tool === 'select' ? 'none' : 'auto'};
  z-index: 10;
  cursor: ${props => props.$isDrawing ? 'crosshair' : props.$isPolygonDrawing ? 'crosshair' : 'default'};
  
  /* Ensure overlay covers the entire container, including areas where image doesn't fill */
  background: transparent;
`

const Toolbar = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(30, 30, 30, 0.95);
  border-radius: 8px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  z-index: 100;
  border: 1px solid rgba(255, 255, 255, 0.1);
`

const ToolButton = styled.button<{ $active?: boolean }>`
  width: 40px;
  height: 40px;
  background: ${props => props.$active ? '#0694fb' : 'transparent'};
  border: 1px solid ${props => props.$active ? '#0694fb' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 6px;
  color: ${props => props.$active ? 'white' : '#8aa'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;

  &:hover {
    background: ${props => props.$active ? '#0582d9' : 'rgba(255, 255, 255, 0.08)'};
    color: white;
    border-color: ${props => props.$active ? '#0582d9' : 'rgba(255, 255, 255, 0.2)'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const AnnotationShape = styled.div<{ $color: string; $type: string }>`
  position: absolute;
  border: 3px solid ${props => props.$color};
  background: ${props => props.$type === 'point' ? props.$color : `rgba(${props.$color === '#0694fb' ? '6, 148, 251' : '255, 255, 255'}, 0.15)`};
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 20;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.3);

  &:hover {
    border-color: ${props => props.$color === '#0694fb' ? '#0582d9' : '#0694fb'};
    background: ${props => props.$type === 'point' ? props.$color : `rgba(${props.$color === '#0694fb' ? '6, 148, 251' : '255, 255, 255'}, 0.25)`};
    transform: scale(1.02);
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.4), 0 0 0 2px rgba(255, 255, 255, 0.4);
  }

  ${props => props.$type === 'point' && `
    width: 10px;
    height: 10px;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.5), 0 0 0 2px rgba(255, 255, 255, 0.5);
  `}

  ${props => props.$type === 'rectangle' && `
    border-radius: 4px;
  `}

  ${props => props.$type === 'polygon' && `
    background: transparent;
    border-radius: 0;
  `}
`

const CircleAnnotation = styled.div<{ $color: string }>`
  position: absolute;
  border: 3px solid ${props => props.$color};
  background: rgba(${props => props.$color === '#0694fb' ? '6, 148, 251' : '255, 255, 255'}, 0.15);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 20;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.3);

  &:hover {
    border-color: ${props => props.$color === '#0694fb' ? '#0582d9' : '#0694fb'};
    background: rgba(${props => props.$color === '#0694fb' ? '6, 148, 251' : '255, 255, 255'}, 0.25);
    transform: scale(1.02);
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.4), 0 0 0 2px rgba(255, 255, 255, 0.4);
  }
`

const EllipseAnnotation = styled.div<{ $color: string }>`
  position: absolute;
  border: 3px solid ${props => props.$color};
  background: rgba(${props => props.$color === '#0694fb' ? '6, 148, 251' : '255, 255, 255'}, 0.15);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 20;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.3);

  &:hover {
    border-color: ${props => props.$color === '#0694fb' ? '#0582d9' : '#0694fb'};
    background: rgba(${props => props.$color === '#0694fb' ? '6, 148, 251' : '255, 255, 255'}, 0.25);
    transform: scale(1.02);
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.4), 0 0 0 2px rgba(255, 255, 255, 0.4);
  }
`

const PointAnnotation = styled.div<{ $color: string }>`
  position: absolute;
  background: ${props => props.$color};
  border: 2px solid rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 20;
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.5), 0 0 0 2px rgba(255, 255, 255, 0.5);

  &:hover {
    background: ${props => props.$color === '#0694fb' ? '#0582d9' : '#0694fb'};
    transform: scale(1.2);
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.6), 0 0 0 3px rgba(255, 255, 255, 0.6);
  }
`

const PolygonAnnotation = styled.svg<{ $color: string; $isPreview?: boolean }>`
  position: absolute;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 20;
  pointer-events: ${props => props.$isPreview ? 'none' : 'all'}; /* Only allow clicks on final annotations, not previews */

  &:hover {
    transform: scale(1.02);
  }
`

const AnnotationLabel = styled.div<{ $color: string }>`
  position: absolute;
  top: -25px;
  left: 0;
  background: ${props => props.$color};
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  z-index: 30;
  pointer-events: none;
`

const DrawingPreview = styled.div<{ $color: string; $type: string }>`
  position: absolute;
  border: 2px dashed ${props => props.$color};
  background: rgba(${props => props.$color === '#0694fb' ? '6, 148, 251' : '255, 255, 255'}, 0.1);
  pointer-events: none;
  z-index: 15;
`


const Tooltip = styled.div<{ $visible: boolean; $position: { x: number; y: number } }>`
  position: absolute;
  left: ${props => props.$position.x}px;
  top: ${props => props.$position.y}px;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  z-index: 1000;
  pointer-events: none;
  opacity: ${props => props.$visible ? 1 : 0};
  transform: translateY(-100%) translateY(-8px);
  transition: opacity 0.2s ease;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 4px solid transparent;
    border-top-color: rgba(0, 0, 0, 0.9);
  }
`

const VisualFeedback = styled.div<{ $visible: boolean; $position: { x: number; y: number }; $type: string }>`
  position: absolute;
  left: ${props => props.$position.x}px;
  top: ${props => props.$position.y}px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: ${props => 
    props.$type === 'drawing' ? 'rgba(6, 148, 251, 0.8)' :
    props.$type === 'hover' ? 'rgba(255, 255, 255, 0.6)' :
    'rgba(255, 0, 0, 0.8)'
  };
  border: 2px solid white;
  z-index: 999;
  opacity: ${props => props.$visible ? 1 : 0};
  transform: translate(-50%, -50%);
  transition: all 0.2s ease;
  pointer-events: none;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
`

const ValidationIndicator = styled.div<{ $isValid: boolean; $hasWarnings: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: ${props => 
    props.$isValid ? '#4CAF50' : 
    props.$hasWarnings ? '#FFC107' : '#F44336'
  };
  
  svg {
    font-size: 10px;
  }
`

const MeasurementDisplay = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 11px;
  
  .measurement-item {
    display: flex;
    align-items: center;
    gap: 4px;
  color: #8aa;
    
    .value {
      color: #0694fb;
      font-weight: 600;
    }
    
    .unit {
      color: #666;
      font-size: 10px;
    }
  }
`

const DrawingProgress = styled.div<{ $visible: boolean }>`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  z-index: 1000;
  opacity: ${props => props.$visible ? 1 : 0};
  transition: opacity 0.3s ease;
  pointer-events: none;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
  
  .progress-bar {
    width: 200px;
    height: 4px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
    margin-top: 8px;
    overflow: hidden;
    
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #0694fb, #4CAF50);
      border-radius: 2px;
      transition: width 0.3s ease;
    }
  }
`

const AnnotationCanvas: React.FC<AnnotationCanvasProps> = ({
  imageUrl,
  readOnly = false,
  onAnnotationsChange,
  initialAnnotations = [],
  selectedPreset = 'Lesion',
  selectedColor = '#0694fb',
  pixelSpacing = 0.1 // Default pixel spacing: 0.1 mm/pixel
}) => {
  const [annotations, setAnnotations] = useState<Annotation[]>(initialAnnotations)
  const [currentTool, setCurrentTool] = useState<'select' | 'rectangle' | 'circle' | 'ellipse' | 'polygon' | 'point' | 'line' | 'arrow' | 'text' | 'freehand' | 'measure-line' | 'measure-circle' | 'measure-freehand'>('rectangle')
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawingStart, setDrawingStart] = useState<{ x: number; y: number } | null>(null)
  const [drawingCurrent, setDrawingCurrent] = useState<{ x: number; y: number } | null>(null)
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null)
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null)
  const [polygonPoints, setPolygonPoints] = useState<{ x: number; y: number }[]>([])
  const [isPolygonDrawing, setIsPolygonDrawing] = useState(false)
  const [freehandPoints, setFreehandPoints] = useState<{ x: number; y: number }[]>([])
  const [isFreehandDrawing, setIsFreehandDrawing] = useState(false)
  const [textInput, setTextInput] = useState('')
  const [isTextMode, setIsTextMode] = useState(false)
  const [history, setHistory] = useState<Annotation[][]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [tooltip, setTooltip] = useState<{ visible: boolean; text: string; position: { x: number; y: number } }>({
    visible: false,
    text: '',
    position: { x: 0, y: 0 }
  })
  const [visualFeedback, setVisualFeedback] = useState<{ visible: boolean; position: { x: number; y: number }; type: string }>({
    visible: false,
    position: { x: 0, y: 0 },
    type: 'hover'
  })
  const [drawingProgress, setDrawingProgress] = useState<{ visible: boolean; progress: number; text: string }>({
    visible: false,
    progress: 0,
    text: ''
  })
  const [measurementUnit, setMeasurementUnit] = useState<'px' | 'mm'>('mm')
  
  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Notify parent of annotation changes (using useCallback to avoid infinite loops)
  const notifyParent = useCallback((newAnnotations: Annotation[]) => {
    if (onAnnotationsChange) {
      onAnnotationsChange(newAnnotations)
    }
  }, [onAnnotationsChange])

  // Add to history for undo/redo functionality
  const addToHistory = useCallback((newAnnotations: Annotation[]) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1)
      newHistory.push([...newAnnotations])
      return newHistory.slice(-50) // Keep only last 50 states
    })
    setHistoryIndex(prev => Math.min(prev + 1, 49))
  }, [historyIndex])

  // Undo function
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setAnnotations([...history[newIndex]])
      setSelectedAnnotation(null) // Clear selection when undoing
      notifyParent([...history[newIndex]])
    }
  }, [historyIndex, history, notifyParent])

  // Redo function
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      setAnnotations([...history[newIndex]])
      setSelectedAnnotation(null) // Clear selection when redoing
      notifyParent([...history[newIndex]])
    }
  }, [historyIndex, history, notifyParent])

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts when not in text input mode
      if (isTextMode) return
      
      // Ctrl+Z or Cmd+Z for undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      }
      
      // Ctrl+Y or Cmd+Y for redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault()
        redo()
      }
      
      // Ctrl+Shift+Z or Cmd+Shift+Z for redo (alternative)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault()
        redo()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo, isTextMode])

  // Update annotations when initialAnnotations change (only on mount or when truly different)
  useEffect(() => {
    if (initialAnnotations && initialAnnotations.length > 0) {
      setAnnotations(initialAnnotations)
      addToHistory(initialAnnotations)
    }
  }, [initialAnnotations, addToHistory]) // Only run on mount

  // Handle image load to get dimensions
  const handleImageLoad = useCallback(() => {
    if (imageRef.current) {
      const rect = imageRef.current.getBoundingClientRect()
      console.log('🎨 Image loaded, dimensions:', { width: rect.width, height: rect.height })
      setImageDimensions({ width: rect.width, height: rect.height })
    }
  }, [])

  // Enhanced coordinate validation
  const validateCoordinates = useCallback((coords: { x: number; y: number }, bounds?: { width: number; height: number }) => {
    if (!bounds && imageRef.current) {
      bounds = {
        width: imageRef.current.naturalWidth,
        height: imageRef.current.naturalHeight
      }
    }
    
    if (!bounds) return { x: 0, y: 0 }
    
    return {
      x: Math.max(0, Math.min(bounds.width, coords.x)),
      y: Math.max(0, Math.min(bounds.height, coords.y))
    }
  }, [])

  // Convert annotation coordinates from natural image coordinates to display coordinates
  // This ensures annotations maintain their position relative to the image regardless of display size
  const getDisplayCoordinates = useCallback((annotation: Annotation) => {
    if (!imageRef.current) {
      return annotation.coordinates
    }
    
    const rect = imageRef.current.getBoundingClientRect()
    let naturalWidth = imageRef.current.naturalWidth
    let naturalHeight = imageRef.current.naturalHeight
    
    // Guard against zero natural dimensions by falling back to rect
    if (naturalWidth <= 0 || naturalHeight <= 0) {
      naturalWidth = Math.max(1, Math.floor(rect.width))
      naturalHeight = Math.max(1, Math.floor(rect.height))
    }
    
    // Calculate scale factors from natural image to display coordinates
    const scaleX = rect.width / naturalWidth
    const scaleY = rect.height / naturalHeight
    
    // Convert natural image coordinates to display coordinates
    const displayCoords: any = {
      x: annotation.coordinates.x * scaleX,
      y: annotation.coordinates.y * scaleY
    }
    
    // Add shape-specific coordinates
    if (annotation.coordinates.width !== undefined) {
      displayCoords.width = annotation.coordinates.width * scaleX
    }
    if (annotation.coordinates.height !== undefined) {
      displayCoords.height = annotation.coordinates.height * scaleY
    }
    if (annotation.coordinates.radius !== undefined) {
      displayCoords.radius = annotation.coordinates.radius * Math.min(scaleX, scaleY)
    }
    if (annotation.coordinates.radiusX !== undefined) {
      displayCoords.radiusX = annotation.coordinates.radiusX * scaleX
    }
    if (annotation.coordinates.radiusY !== undefined) {
      displayCoords.radiusY = annotation.coordinates.radiusY * scaleY
    }
    if (annotation.coordinates.points) {
      displayCoords.points = annotation.coordinates.points.map(point => ({
        x: point.x * scaleX,
        y: point.y * scaleY
      }))
    }
    if (annotation.coordinates.startX !== undefined) {
      displayCoords.startX = annotation.coordinates.startX * scaleX
    }
    if (annotation.coordinates.startY !== undefined) {
      displayCoords.startY = annotation.coordinates.startY * scaleY
    }
    if (annotation.coordinates.endX !== undefined) {
      displayCoords.endX = annotation.coordinates.endX * scaleX
    }
    if (annotation.coordinates.endY !== undefined) {
      displayCoords.endY = annotation.coordinates.endY * scaleY
    }
    
    if (annotation.coordinates.text !== undefined) {
      displayCoords.text = annotation.coordinates.text
    }
    if (annotation.coordinates.fontSize !== undefined) {
      displayCoords.fontSize = annotation.coordinates.fontSize
    }
    
    return displayCoords
  }, [])

  // Get mouse position relative to image (in natural image coordinates) with enhanced validation
  const getMousePosition = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    try {
      if (!imageRef.current) {
        return { x: 0, y: 0 }
      }
      
      const rect = imageRef.current.getBoundingClientRect()
      let naturalWidth = imageRef.current.naturalWidth
      let naturalHeight = imageRef.current.naturalHeight
      
      // Validate image dimensions; if invalid, fallback to rect dimensions to keep tools responsive
      if (naturalWidth <= 0 || naturalHeight <= 0) {
        console.warn('Invalid image natural dimensions, falling back to rect:', { naturalWidth, naturalHeight, rectWidth: rect.width, rectHeight: rect.height })
        naturalWidth = Math.max(1, Math.floor(rect.width))
        naturalHeight = Math.max(1, Math.floor(rect.height))
      }
      if (rect.width <= 0 || rect.height <= 0) {
        console.warn('Invalid image rect dimensions; ignoring event')
        return { x: 0, y: 0 }
      }
      
      // Calculate scale factors from display to natural image coordinates
      const scaleX = naturalWidth / rect.width
      const scaleY = naturalHeight / rect.height
      
      // Get client coordinates (support both mouse and touch events)
      let clientX: number, clientY: number
      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX
        clientY = e.touches[0].clientY
      } else if ('changedTouches' in e && e.changedTouches.length > 0) {
        clientX = e.changedTouches[0].clientX
        clientY = e.changedTouches[0].clientY
      } else {
        clientX = (e as React.MouseEvent).clientX
        clientY = (e as React.MouseEvent).clientY
      }
      
      // Calculate position relative to the displayed image
      const relativeX = clientX - rect.left
      const relativeY = clientY - rect.top
      
      // Clamp coordinates to image bounds to prevent out-of-bounds annotations
      const clampedX = Math.max(0, Math.min(rect.width, relativeX))
      const clampedY = Math.max(0, Math.min(rect.height, relativeY))
      
      // Convert to natural image coordinates (this is what gets stored)
      const position = {
        x: clampedX * scaleX,
        y: clampedY * scaleY
      }
      
      
      // Final validation
      return validateCoordinates(position, { width: naturalWidth, height: naturalHeight })
    } catch (error) {
      console.error('Error getting mouse position:', error)
      return { x: 0, y: 0 }
    }
  }, [validateCoordinates])

  // Find annotation at specific position
  const findAnnotationAtPosition = useCallback((position: { x: number; y: number }) => {
    const tolerance = 10 // pixels
    return annotations.find(annotation => {
      const displayCoords = getDisplayCoordinates(annotation)
              const distance = Math.sqrt(
        Math.pow(position.x - displayCoords.x, 2) + Math.pow(position.y - displayCoords.y, 2)
      )
      return distance <= tolerance
    })
  }, [annotations, getDisplayCoordinates])

  // Delete annotation
  const deleteAnnotation = useCallback((id: string) => {
    try {
      if (!id) {
        console.error('Invalid annotation ID for deletion')
      return
    }
    
      setAnnotations(prevAnnotations => {
        const updatedAnnotations = prevAnnotations.filter(ann => ann.id !== id)
        setSelectedAnnotation(null)
        addToHistory(updatedAnnotations)
        notifyParent(updatedAnnotations)
        return updatedAnnotations
      })
    } catch (error) {
      console.error('Error deleting annotation:', error)
    }
  }, [notifyParent, addToHistory])

  // Clear all annotations
  const clearAllAnnotations = useCallback(() => {
    try {
      setAnnotations([])
      setSelectedAnnotation(null)
      addToHistory([])
      notifyParent([])
    } catch (error) {
      console.error('Error clearing annotations:', error)
    }
  }, [notifyParent, addToHistory])

  const hideDrawingProgress = useCallback(() => {
    setDrawingProgress(prev => ({ ...prev, visible: false }))
  }, [])

  // Validate polygon points
  const validatePolygon = useCallback((points: { x: number; y: number }[]) => {
    if (points.length < 3) return false
    
    // Check for minimum area (prevent degenerate polygons)
    const minArea = 100 // Minimum area in pixels
    let area = 0
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length
      area += points[i].x * points[j].y
      area -= points[j].x * points[i].y
    }
    area = Math.abs(area) / 2
    
    return area >= minArea
  }, [])

  // Complete polygon drawing
  const completePolygon = useCallback(() => {
    try {
      if (polygonPoints.length >= 3) {
        // Validate polygon before creating
        if (!validatePolygon(polygonPoints)) {
          console.warn('Polygon validation failed - area too small or degenerate')
          return
        }
        
        // Ensure polygon is closed by adding the first point at the end if not already there
        const closedPoints = [...polygonPoints]
        const firstPoint = closedPoints[0]
        const lastPoint = closedPoints[closedPoints.length - 1]
        
        // Check if polygon is already closed (first and last points are the same)
        const isAlreadyClosed = firstPoint.x === lastPoint.x && firstPoint.y === lastPoint.y
        
        if (!isAlreadyClosed) {
          closedPoints.push({ x: firstPoint.x, y: firstPoint.y })
        }
        
        // Calculate bounding box
        const minX = Math.min(...closedPoints.map(p => p.x))
        const minY = Math.min(...closedPoints.map(p => p.y))
        const maxX = Math.max(...closedPoints.map(p => p.x))
        const maxY = Math.max(...closedPoints.map(p => p.y))
        
        const newAnnotation: Annotation = {
          id: `annotation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'polygon',
          label: selectedPreset || 'Polygon',
          color: selectedColor || '#0694fb',
          coordinates: {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY,
            points: closedPoints
          },
          createdAt: new Date(),
          createdBy: 'user'
        }
        
        setAnnotations(prevAnnotations => {
          const updatedAnnotations = [...prevAnnotations, newAnnotation]
          addToHistory(updatedAnnotations)
          notifyParent(updatedAnnotations)
          return updatedAnnotations
        })
      }
    } catch (error) {
      console.error('Error completing polygon:', error)
    } finally {
      // Reset polygon state - use setTimeout to ensure state is reset after render
      console.log('🧹 Resetting polygon state after completion')
      setTimeout(() => {
        setPolygonPoints([])
        setIsPolygonDrawing(false)
        // Also clear any selection/dragging so next tool starts cleanly
        setSelectedAnnotation(null)
        setIsDragging(false)
        setDragOffset({ x: 0, y: 0 })
        hideDrawingProgress()
        console.log('✅ Polygon state reset complete')
      }, 0)
    }
  }, [polygonPoints, selectedPreset, selectedColor, notifyParent, validatePolygon, addToHistory, hideDrawingProgress])

  // Cancel polygon drawing
  const cancelPolygon = useCallback(() => {
    setPolygonPoints([])
    setIsPolygonDrawing(false)
    hideDrawingProgress()
  }, [hideDrawingProgress])

  // Handle tool change with proper cleanup
  const handleToolChange = useCallback((newTool: 'select' | 'rectangle' | 'circle' | 'ellipse' | 'polygon' | 'point' | 'line' | 'arrow' | 'text' | 'freehand' | 'measure-line' | 'measure-circle' | 'measure-freehand') => {
    console.log('🔧 Tool change:', { from: currentTool, to: newTool, isPolygonDrawing, isDrawing })
    
    // Always reset all drawing states when changing tools
    console.log('🧹 Resetting all drawing states for tool change')
    setPolygonPoints([])
    setIsPolygonDrawing(false)
    setIsDrawing(false)
    setDrawingStart(null)
    setDrawingCurrent(null)
    setSelectedAnnotation(null)
    hideDrawingProgress()
    
    // Set new tool
    setCurrentTool(newTool)
  }, [currentTool, isPolygonDrawing, isDrawing, hideDrawingProgress])

  // Reset polygon state when tool changes away from polygon
  useEffect(() => {
    console.log('🔄 useEffect - tool change check:', { currentTool, isPolygonDrawing })
    if (currentTool !== 'polygon' && isPolygonDrawing) {
      console.log('🧹 useEffect - canceling polygon due to tool change')
      cancelPolygon()
    }
  }, [currentTool, isPolygonDrawing, cancelPolygon])

  // Remove last polygon point
  const removeLastPolygonPoint = useCallback(() => {
    setPolygonPoints(prev => {
      if (prev.length <= 1) {
        // If only one point left, cancel the polygon
        setIsPolygonDrawing(false)
        return []
      }
      return prev.slice(0, -1)
    })
  }, [])

  // Handle double click to complete polygon
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    if (currentTool === 'polygon' && isPolygonDrawing) {
      e.preventDefault()
      completePolygon()
    }
  }, [currentTool, isPolygonDrawing, completePolygon])

  // Handle right click to remove last point
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    if (currentTool === 'polygon' && isPolygonDrawing) {
      e.preventDefault()
      removeLastPolygonPoint()
    }
  }, [currentTool, isPolygonDrawing, removeLastPolygonPoint])

  // Enhanced keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default for our shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault()
            if (e.shiftKey) {
              redo()
            } else {
              undo()
            }
            break
          case 'y':
            e.preventDefault()
            redo()
            break
          case 'a':
            e.preventDefault()
            if (e.shiftKey) {
              clearAllAnnotations()
            }
            break
        }
      }
      
      // Tool shortcuts
      if (!e.ctrlKey && !e.metaKey) {
        switch (e.key) {
          case 'v':
            handleToolChange('select')
            break
          case 'r':
            handleToolChange('rectangle')
            break
          case 'c':
            handleToolChange('circle')
            break
          case 'e':
            handleToolChange('ellipse')
            break
          case 'p':
            handleToolChange('polygon')
            break
          case 'o':
            handleToolChange('point')
            break
          case 'l':
            handleToolChange('line')
            break
          case 'a':
            handleToolChange('arrow')
            break
          case 't':
            handleToolChange('text')
            break
          case 'f':
            handleToolChange('freehand')
            break
          case 'm':
            // Cycle through measurement tools
            if (e.shiftKey) {
              handleToolChange('measure-freehand')
            } else if (e.altKey) {
              handleToolChange('measure-circle')
            } else {
              handleToolChange('measure-line')
            }
            break
          case 'Delete':
          case 'Backspace':
            if (selectedAnnotation) {
              deleteAnnotation(selectedAnnotation)
            }
            break
        }
      }
      
      // Polygon-specific shortcuts
      if (currentTool === 'polygon' && isPolygonDrawing) {
        switch (e.key) {
          case 'Enter':
        e.preventDefault()
        completePolygon()
            break
          case 'Escape':
        e.preventDefault()
        cancelPolygon()
            break
        }
      }
    }

      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isPolygonDrawing, currentTool, completePolygon, cancelPolygon, undo, redo, clearAllAnnotations, selectedAnnotation, deleteAnnotation, handleToolChange])

  // Cleanup polygon state when switching tools
  useEffect(() => {
    if (currentTool !== 'polygon' && isPolygonDrawing) {
      cancelPolygon()
    }
  }, [currentTool, isPolygonDrawing, cancelPolygon])


  // Convert pixel measurements to mm
  const convertToMm = useCallback((pixelValue: number) => {
    return pixelValue * pixelSpacing
  }, [pixelSpacing])

  // Format measurement value with appropriate unit
  const formatMeasurement = useCallback((value: number, isArea: boolean = false) => {
    if (measurementUnit === 'mm') {
      const mmValue = convertToMm(value)
      return isArea ? `${mmValue.toFixed(2)}mm²` : `${mmValue.toFixed(2)}mm`
    } else {
      return isArea ? `${value.toFixed(1)}px²` : `${value.toFixed(1)}px`
    }
  }, [measurementUnit, convertToMm])

  // Calculate measurements for annotations
  const calculateMeasurements = useCallback((annotation: Annotation) => {
    const measurements: any = {}
    
    switch (annotation.type) {
      case 'line':
      case 'arrow':
      case 'measure-line':
        if (annotation.coordinates.startX !== undefined && annotation.coordinates.startY !== undefined &&
            annotation.coordinates.endX !== undefined && annotation.coordinates.endY !== undefined) {
          const dx = annotation.coordinates.endX - annotation.coordinates.startX
          const dy = annotation.coordinates.endY - annotation.coordinates.startY
          measurements.length = Math.sqrt(dx * dx + dy * dy)
          measurements.angle = Math.atan2(dy, dx) * (180 / Math.PI)
        }
        break
        
      case 'rectangle':
        if (annotation.coordinates.width !== undefined && annotation.coordinates.height !== undefined) {
          measurements.area = annotation.coordinates.width * annotation.coordinates.height
          measurements.length = Math.sqrt(
            Math.pow(annotation.coordinates.width, 2) + Math.pow(annotation.coordinates.height, 2)
          )
        }
        break
        
      case 'circle':
      case 'measure-circle':
        if (annotation.coordinates.radius !== undefined) {
          measurements.area = Math.PI * Math.pow(annotation.coordinates.radius, 2)
          measurements.length = 2 * Math.PI * annotation.coordinates.radius
        }
        break
        
      case 'ellipse':
        if (annotation.coordinates.radiusX !== undefined && annotation.coordinates.radiusY !== undefined) {
          measurements.area = Math.PI * annotation.coordinates.radiusX * annotation.coordinates.radiusY
          // Approximate circumference
          measurements.length = Math.PI * (3 * (annotation.coordinates.radiusX + annotation.coordinates.radiusY) - 
            Math.sqrt((3 * annotation.coordinates.radiusX + annotation.coordinates.radiusY) * 
            (annotation.coordinates.radiusX + 3 * annotation.coordinates.radiusY)))
        }
        break
        
      case 'polygon':
        if (annotation.coordinates.points && annotation.coordinates.points.length > 2) {
          // Calculate polygon area using shoelace formula
          let area = 0
          const points = annotation.coordinates.points
          for (let i = 0; i < points.length; i++) {
            const j = (i + 1) % points.length
            area += points[i].x * points[j].y
            area -= points[j].x * points[i].y
          }
          measurements.area = Math.abs(area) / 2
          
          // Calculate perimeter
          let perimeter = 0
          for (let i = 0; i < points.length; i++) {
            const j = (i + 1) % points.length
            const dx = points[j].x - points[i].x
            const dy = points[j].y - points[i].y
            perimeter += Math.sqrt(dx * dx + dy * dy)
          }
          measurements.length = perimeter
        }
        break
        
      case 'freehand':
      case 'measure-freehand':
        if (annotation.coordinates.points && annotation.coordinates.points.length > 1) {
          // Calculate perimeter (total length of the path)
          let perimeter = 0
          const points = annotation.coordinates.points
          for (let i = 0; i < points.length - 1; i++) {
            const dx = points[i + 1].x - points[i].x
            const dy = points[i + 1].y - points[i].y
            perimeter += Math.sqrt(dx * dx + dy * dy)
          }
          measurements.length = perimeter
          
          // For measurement freehand, also calculate approximate area using shoelace formula
          if (annotation.type === 'measure-freehand' && points.length > 2) {
            let area = 0
            for (let i = 0; i < points.length; i++) {
              const j = (i + 1) % points.length
              area += points[i].x * points[j].y
              area -= points[j].x * points[i].y
            }
            measurements.area = Math.abs(area) / 2
          }
        }
        break
    }
    
    // Add unit to measurements
    measurements.unit = measurementUnit
    
    return measurements
  }, [measurementUnit])

  const validateAnnotation = useCallback((annotation: Annotation) => {
    const errors: string[] = []
    const warnings: string[] = []
    
    // Basic validation
    if (!annotation.label || annotation.label.trim() === '') {
      errors.push('Label is required')
    }
    
    if (!annotation.coordinates) {
      errors.push('Coordinates are required')
      return { isValid: false, errors, warnings }
    }
    
    // Type-specific validation
    switch (annotation.type) {
      case 'rectangle':
        if (!annotation.coordinates.width || !annotation.coordinates.height) {
          errors.push('Width and height are required for rectangles')
        } else {
          if (annotation.coordinates.width < 5 || annotation.coordinates.height < 5) {
            warnings.push('Rectangle is very small - consider zooming in')
          }
        }
        break
        
      case 'circle':
        if (!annotation.coordinates.radius) {
          errors.push('Radius is required for circles')
        } else if (annotation.coordinates.radius < 3) {
          warnings.push('Circle is very small - consider zooming in')
        }
        break
        
      case 'ellipse':
        if (!annotation.coordinates.radiusX || !annotation.coordinates.radiusY) {
          errors.push('RadiusX and radiusY are required for ellipses')
        } else if (annotation.coordinates.radiusX < 3 || annotation.coordinates.radiusY < 3) {
          warnings.push('Ellipse is very small - consider zooming in')
        }
        break
        
      case 'line':
      case 'arrow':
        if (annotation.coordinates.startX === undefined || annotation.coordinates.startY === undefined ||
            annotation.coordinates.endX === undefined || annotation.coordinates.endY === undefined) {
          errors.push('Start and end coordinates are required for lines/arrows')
        } else {
          const length = Math.sqrt(
            Math.pow(annotation.coordinates.endX - annotation.coordinates.startX, 2) +
            Math.pow(annotation.coordinates.endY - annotation.coordinates.startY, 2)
          )
          if (length < 10) {
            warnings.push('Line/arrow is very short')
          }
        }
        break
        
      case 'polygon':
        if (!annotation.coordinates.points || annotation.coordinates.points.length < 3) {
          errors.push('At least 3 points are required for polygons')
        } else if (annotation.coordinates.points.length > 20) {
          warnings.push('Polygon has many points - consider simplifying')
        }
        break
        
      case 'freehand':
        if (!annotation.coordinates.points || annotation.coordinates.points.length < 2) {
          errors.push('At least 2 points are required for freehand drawings')
        } else if (annotation.coordinates.points.length > 1000) {
          warnings.push('Freehand drawing has many points - consider simplifying')
        }
        break
        
      case 'text':
        if (!annotation.coordinates.text || annotation.coordinates.text.trim() === '') {
          errors.push('Text content is required')
        }
        break
    }
    
    // Check if annotation is within image bounds
    if (imageDimensions) {
      const { x, y } = annotation.coordinates
      if (x < 0 || y < 0 || x > imageDimensions.width || y > imageDimensions.height) {
        warnings.push('Annotation extends outside image bounds')
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }, [imageDimensions])

  const showTooltip = useCallback((text: string, x: number, y: number) => {
    setTooltip({ visible: true, text, position: { x, y } })
  }, [])

  const hideTooltip = useCallback(() => {
    setTooltip(prev => ({ ...prev, visible: false }))
  }, [])

  const showVisualFeedback = useCallback((type: string, x: number, y: number) => {
    setVisualFeedback({ visible: true, position: { x, y }, type })
  }, [])

  const hideVisualFeedback = useCallback(() => {
    setVisualFeedback(prev => ({ ...prev, visible: false }))
  }, [])

  const showDrawingProgress = useCallback((text: string, progress: number) => {
    setDrawingProgress({ visible: true, text, progress })
  }, [])

  // Handle mouse/touch down with enhanced tool support
  const handleMouseDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    console.log('🖱️ Mouse/Touch down:', { 
      currentTool, 
      isPolygonDrawing, 
      isDrawing, 
      readOnly,
      polygonPointsLength: polygonPoints.length,
      isFreehandDrawing,
      freehandPointsLength: freehandPoints.length
    })
    
    if (readOnly) {
      console.log('❌ Mouse down blocked: read-only mode')
      return
    }
    
    // Handle select tool for dragging annotations
    if (currentTool === 'select') {
      const position = getMousePosition(e)
      const clickedAnnotation = findAnnotationAtPosition(position)
      if (clickedAnnotation) {
        setSelectedAnnotation(clickedAnnotation.id)
        setIsDragging(true)
        const displayCoords = getDisplayCoordinates(clickedAnnotation)
        setDragOffset({
          x: position.x - displayCoords.x,
          y: position.y - displayCoords.y
        })
        // Add current state to history before starting drag
        addToHistory(annotations)
        return
      } else {
        setSelectedAnnotation(null)
        return
      }
    }
    
    // Force reset any lingering states that might block drawing
    if (isPolygonDrawing && currentTool !== 'polygon') {
      console.log('🔧 Force resetting polygon state for non-polygon tool')
      setPolygonPoints([])
      setIsPolygonDrawing(false)
    }
    
    if (isFreehandDrawing && currentTool !== 'freehand') {
      console.log('🔧 Force resetting freehand state for non-freehand tool')
      setFreehandPoints([])
      setIsFreehandDrawing(false)
    }
    
    // CRITICAL: Always clear drag state when switching to any drawing tool
    if (currentTool !== 'select' as any) {
      console.log('🔧 Force clearing drag state for drawing tool:', currentTool)
      setIsDragging(false)
      setSelectedAnnotation(null)
      setDragOffset({ x: 0, y: 0 })
    }
    
    try {
      e.preventDefault()
      const position = getMousePosition(e)
      // Coordinates are resolved by getMousePosition which already falls back when image natural sizes are 0
      
      // Show visual feedback
      showVisualFeedback('drawing', position.x, position.y)
      
      // Drag state is already cleared above for non-select tools

      // Handle different tools
      switch (currentTool) {
        case 'polygon':
        if (!isPolygonDrawing) {
          console.log('🎯 Starting new polygon at:', position)
          setPolygonPoints([position])
          setIsPolygonDrawing(true)
          showDrawingProgress('Drawing polygon...', 0)
        } else {
          setPolygonPoints(prev => {
            const minDistance = 5
            const isTooClose = prev.some(point => {
              const distance = Math.sqrt(
                Math.pow(position.x - point.x, 2) + Math.pow(position.y - point.y, 2)
              )
              return distance < minDistance
            })
            
              if (isTooClose || prev.length >= 50) {
                return prev
            }
            
            const newPoints = [...prev, position]
            const progress = Math.min((newPoints.length / 10) * 100, 100)
            showDrawingProgress(`Polygon: ${newPoints.length} points`, progress)
            return newPoints
          })
        }
          break
          
        case 'freehand':
          console.log('🎨 Starting freehand drawing at:', position)
          setIsFreehandDrawing(true)
          setFreehandPoints([position])
          showDrawingProgress('Drawing freehand...', 0)
          break
          
        case 'measure-line':
          console.log('📏 Starting measurement line at:', position)
          setIsDrawing(true)
          setDrawingStart(position)
          setDrawingCurrent(position)
          showDrawingProgress('Measuring line...', 0)
          break
          
        case 'measure-circle':
          console.log('📏 Starting measurement circle at:', position)
          setIsDrawing(true)
          setDrawingStart(position)
          setDrawingCurrent(position)
          showDrawingProgress('Measuring circle...', 0)
          break
          
        case 'measure-freehand':
          console.log('📏 Starting measurement freehand at:', position)
          setIsFreehandDrawing(true)
          setFreehandPoints([position])
          showDrawingProgress('Measuring freehand...', 0)
          break
          
        case 'text':
          console.log('📝 Starting text annotation at:', position)
          setIsTextMode(true)
          setDrawingStart(position)
          showTooltip('Click to add text annotation', position.x, position.y)
          break
          
        default:
      console.log('🎨 Starting drawing with tool:', currentTool, 'at position:', position)
      setIsDrawing(true)
      setDrawingStart(position)
      setDrawingCurrent(position)
      showDrawingProgress(`Drawing ${currentTool}...`, 0)
          break
      }
    } catch (error) {
      console.error('Error in handleMouseDown:', error)
    }
  }, [readOnly, currentTool, getMousePosition, isPolygonDrawing, isDrawing, polygonPoints.length, isFreehandDrawing, freehandPoints.length, annotations, getDisplayCoordinates, showVisualFeedback, showDrawingProgress, showTooltip, addToHistory, findAnnotationAtPosition])

  // Create annotation object with enhanced features
  const createAnnotation = useCallback((
    start: { x: number; y: number },
    end: { x: number; y: number },
    type: 'rectangle' | 'circle' | 'ellipse' | 'polygon' | 'point' | 'line' | 'arrow' | 'text' | 'freehand' | 'measure-line' | 'measure-circle' | 'measure-freehand',
    additionalData?: any
  ): Annotation | null => {
    try {
      // Validate inputs
      if (!start || !type) {
        console.error('Invalid annotation parameters:', { start, end, type })
        return null
      }

      const width = Math.abs(end.x - start.x)
      const height = Math.abs(end.y - start.y)
      
      // Simple coordinate calculation - allow any size
      const x = Math.min(start.x, end.x)
      const y = Math.min(start.y, end.y)
      
      // For very small annotations, ensure they're at least 1px visible
      const finalWidth = Math.max(width, 1)
      const finalHeight = Math.max(height, 1)
      
      let coordinates: any = { x, y }
      
      switch (type) {
        case 'rectangle':
          coordinates = { x, y, width: finalWidth, height: finalHeight }
          break
        case 'circle':
          const radius = Math.max(finalWidth, finalHeight) / 2
          coordinates = { 
            x: x + finalWidth / 2, 
            y: y + finalHeight / 2, 
            radius 
          }
          break
        case 'ellipse':
          coordinates = { 
            x: x + finalWidth / 2, 
            y: y + finalHeight / 2, 
            radiusX: finalWidth / 2, 
            radiusY: finalHeight / 2 
          }
          break
        case 'point':
          coordinates = { x: start.x, y: start.y, width: 0, height: 0 }
          break
        case 'line':
        case 'arrow':
          coordinates = {
            startX: start.x,
            startY: start.y,
            endX: end.x,
            endY: end.y
          }
          break
        case 'text':
          coordinates = {
            x: start.x,
            y: start.y,
            text: additionalData?.text || 'Text',
            fontSize: additionalData?.fontSize || 16
          }
          break
        case 'freehand':
          coordinates = {
            points: additionalData?.points || [start]
          }
          break
        case 'measure-line':
          coordinates = {
            startX: start.x,
            startY: start.y,
            endX: end.x,
            endY: end.y
          }
          break
        case 'measure-circle':
          coordinates = {
            x: x + finalWidth / 2,
            y: y + finalHeight / 2,
            radius: Math.max(finalWidth, finalHeight) / 2
          }
          break
        case 'measure-freehand':
          coordinates = {
            points: additionalData?.points || [start]
          }
          break
        case 'polygon':
          // Polygon is handled by completePolygon function
          coordinates = { x, y, width: finalWidth, height: finalHeight }
          break
        default:
          console.error('Unknown annotation type:', type)
          return null
      }
      
      const annotation: Annotation = {
        id: `annotation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        label: selectedPreset || 'Annotation',
        color: selectedColor || '#0694fb',
        coordinates,
        createdAt: new Date(),
        createdBy: 'user',
        metadata: {
          measurements: {},
          confidence: 1.0,
          tags: []
        }
      }
      
      // Calculate measurements
      annotation.metadata!.measurements = calculateMeasurements(annotation)
      
      // Add validation
      annotation.metadata!.validation = validateAnnotation(annotation)
      
      return annotation
    } catch (error) {
      console.error('Error creating annotation:', error)
      return null
    }
  }, [selectedPreset, selectedColor, calculateMeasurements, validateAnnotation])

  // Handle mouse/touch move with enhanced tool support
  const handleMouseMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    try {
      e.preventDefault()
      const position = getMousePosition(e)
      
      // Handle dragging annotations (only when the Select tool is active)
      if (currentTool === 'select' && isDragging && selectedAnnotation) {
        const annotation = annotations.find(a => a.id === selectedAnnotation)
        if (annotation) {
          // Update annotation position
          const newAnnotations = annotations.map(a => {
            if (a.id === selectedAnnotation) {
              const updatedCoords = { ...a.coordinates }
              updatedCoords.x = position.x - dragOffset.x
              updatedCoords.y = position.y - dragOffset.y
              return { ...a, coordinates: updatedCoords }
            }
            return a
          })
          setAnnotations(newAnnotations)
          notifyParent(newAnnotations)
        }
        return
      }
      
      // Handle freehand drawing
      if (isFreehandDrawing) {
        setFreehandPoints(prev => {
          const minDistance = 2
          const lastPoint = prev[prev.length - 1]
          if (lastPoint) {
            const distance = Math.sqrt(
              Math.pow(position.x - lastPoint.x, 2) + Math.pow(position.y - lastPoint.y, 2)
            )
            if (distance >= minDistance && prev.length < 1000) { // Limit points for performance
              return [...prev, position]
            }
          }
          return prev
        })
        return
      }
      
      // Handle regular drawing tools
      if (isDrawing && drawingStart) {
      setDrawingCurrent(position)
      }
    } catch (error) {
      console.error('Error in handleMouseMove:', error)
    }
  }, [isDrawing, drawingStart, getMousePosition, isDragging, selectedAnnotation, annotations, dragOffset, notifyParent, isFreehandDrawing, currentTool])

  // Handle mouse/touch up with enhanced tool support
  const handleMouseUp = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    try {
      e.preventDefault()
      // Coordinates are resolved by getMousePosition which already falls back when image natural sizes are 0
    
      // Handle dragging end
      if (isDragging) {
        setIsDragging(false)
        setDragOffset({ x: 0, y: 0 })
        // Add current state to history when dragging ends
        addToHistory(annotations)
      return
    }
    
      // Handle freehand drawing end
      if (isFreehandDrawing && freehandPoints.length > 1) {
        const toolType = currentTool === 'measure-freehand' ? 'measure-freehand' : 'freehand'
        const newAnnotation = createAnnotation(
          freehandPoints[0], 
          freehandPoints[freehandPoints.length - 1], 
          toolType,
          { points: freehandPoints }
        )
        
        if (newAnnotation) {
          setAnnotations(prevAnnotations => {
            const updatedAnnotations = [...prevAnnotations, newAnnotation]
            addToHistory(updatedAnnotations)
            notifyParent(updatedAnnotations)
            return updatedAnnotations
          })
        }
        
        setIsFreehandDrawing(false)
        setFreehandPoints([])
        return
      }
      
      // Handle text mode
      if (isTextMode && drawingStart) {
        const text = prompt('Enter text:', 'Text')
        if (text) {
          const newAnnotation = createAnnotation(
            drawingStart, 
            drawingStart, 
            'text',
            { text, fontSize: 16 }
          )
          
          if (newAnnotation) {
            setAnnotations(prevAnnotations => {
              const updatedAnnotations = [...prevAnnotations, newAnnotation]
              addToHistory(updatedAnnotations)
              notifyParent(updatedAnnotations)
              return updatedAnnotations
            })
          }
        }
        
        setIsTextMode(false)
        setDrawingStart(null)
        return
      }
      
      // Handle regular drawing tools
      if (isDrawing && drawingStart && drawingCurrent) {
      // Use drawingCurrent instead of getMousePosition(e) to ensure consistency with preview
      const endPosition = drawingCurrent
      
      if (currentTool !== 'select') {
          const newAnnotation = createAnnotation(
            drawingStart, 
            endPosition, 
            currentTool as 'rectangle' | 'circle' | 'ellipse' | 'polygon' | 'point' | 'line' | 'arrow' | 'text' | 'freehand' | 'measure-line' | 'measure-circle' | 'measure-freehand'
          )
        
        if (newAnnotation) {
          setAnnotations(prevAnnotations => {
            const updatedAnnotations = [...prevAnnotations, newAnnotation]
              addToHistory(updatedAnnotations)
            notifyParent(updatedAnnotations)
            return updatedAnnotations
          })
          }
        }
      }
    } catch (error) {
      console.error('Error in handleMouseUp:', error)
    } finally {
      // Reset drawing state
      setIsDrawing(false)
      setDrawingStart(null)
      setDrawingCurrent(null)
      setIsFreehandDrawing(false)
      setFreehandPoints([])
      setIsTextMode(false)
      hideDrawingProgress()
    }
  }, [isDrawing, drawingStart, drawingCurrent, currentTool, createAnnotation, notifyParent, addToHistory, isDragging, isFreehandDrawing, freehandPoints, isTextMode, hideDrawingProgress, annotations])

  // Global mouse up handler to ensure drawing completes even if mouse leaves overlay
  useEffect(() => {
    const handleGlobalMouseUp = (e: MouseEvent) => {
      if (isDrawing) {
        setIsDrawing(false)
        setDrawingStart(null)
        setDrawingCurrent(null)
      }
    }

    if (isDrawing) {
      // Add a small delay to prevent immediate triggering
      const timeoutId = setTimeout(() => {
        document.addEventListener('mouseup', handleGlobalMouseUp)
      }, 10)
      
      return () => {
        clearTimeout(timeoutId)
        document.removeEventListener('mouseup', handleGlobalMouseUp)
      }
    }
  }, [isDrawing])


  // Get drawing preview dimensions in image coordinates
  const getDrawingPreview = () => {
    if (!drawingStart || !drawingCurrent) return null
    
    const width = Math.abs(drawingCurrent.x - drawingStart.x)
    const height = Math.abs(drawingCurrent.y - drawingStart.y)
    const x = Math.min(drawingStart.x, drawingCurrent.x)
    const y = Math.min(drawingStart.y, drawingCurrent.y)
    
    // Ensure minimum size for visibility during drawing
    const finalWidth = Math.max(width, 1)
    const finalHeight = Math.max(height, 1)
    
    return { x, y, width: finalWidth, height: finalHeight }
  }

  // Get circle preview dimensions in image coordinates (centered)
  const getCirclePreview = () => {
    if (!drawingStart || !drawingCurrent) return null
    
    const width = Math.abs(drawingCurrent.x - drawingStart.x)
    const height = Math.abs(drawingCurrent.y - drawingStart.y)
    const x = Math.min(drawingStart.x, drawingCurrent.x)
    const y = Math.min(drawingStart.y, drawingCurrent.y)
    
    // Ensure minimum size for visibility during drawing
    const finalWidth = Math.max(width, 1)
    const finalHeight = Math.max(height, 1)
    const radius = Math.max(finalWidth, finalHeight) / 2
    
    return { 
      x: x + finalWidth / 2, 
      y: y + finalHeight / 2, 
      radius 
    }
  }

  // Get drawing preview dimensions in display coordinates
  // Converts from natural image coordinates to display coordinates for real-time preview
  const getDisplayDrawingPreview = () => {
    const preview = getDrawingPreview()
    if (!preview || !imageRef.current) {
      return null
    }
    
    const rect = imageRef.current.getBoundingClientRect()
    const naturalWidth = imageRef.current.naturalWidth
    const naturalHeight = imageRef.current.naturalHeight
    
    // Calculate scale factors from natural image to display coordinates
    const scaleX = rect.width / naturalWidth
    const scaleY = rect.height / naturalHeight
    
    const displayPreview = {
      x: preview.x * scaleX,
      y: preview.y * scaleY,
      width: preview.width * scaleX,
      height: preview.height * scaleY
    }
    
    return displayPreview
  }

  // Get circle preview dimensions in display coordinates (centered)
  const getDisplayCirclePreview = () => {
    const preview = getCirclePreview()
    if (!preview || !imageRef.current) {
      return null
    }
    
    const rect = imageRef.current.getBoundingClientRect()
    let naturalWidth = imageRef.current.naturalWidth
    let naturalHeight = imageRef.current.naturalHeight
    
    // Guard against zero natural dimensions by falling back to rect
    if (naturalWidth <= 0 || naturalHeight <= 0) {
      naturalWidth = Math.max(1, Math.floor(rect.width))
      naturalHeight = Math.max(1, Math.floor(rect.height))
    }
    
    // Calculate scale factors from natural image to display coordinates
    const scaleX = rect.width / naturalWidth
    const scaleY = rect.height / naturalHeight
    
    return {
      x: preview.x * scaleX,
      y: preview.y * scaleY,
      radius: preview.radius * Math.min(scaleX, scaleY)
    }
  }

  // Get actual start and end points for line/arrow tools in display coordinates
  const getDisplayLinePreview = () => {
    if (!drawingStart || !drawingCurrent || !imageRef.current) {
      return null
    }
    
    const rect = imageRef.current.getBoundingClientRect()
    let naturalWidth = imageRef.current.naturalWidth
    let naturalHeight = imageRef.current.naturalHeight
    
    // Guard against zero natural dimensions by falling back to rect
    if (naturalWidth <= 0 || naturalHeight <= 0) {
      naturalWidth = Math.max(1, Math.floor(rect.width))
      naturalHeight = Math.max(1, Math.floor(rect.height))
    }
    
    // Calculate scale factors from natural image to display coordinates
    const scaleX = rect.width / naturalWidth
    const scaleY = rect.height / naturalHeight
    
    return {
      x1: drawingStart.x * scaleX,
      y1: drawingStart.y * scaleY,
      x2: drawingCurrent.x * scaleX,
      y2: drawingCurrent.y * scaleY
    }
  }



  return (
    <CanvasContainer ref={containerRef} $isDrawing={isDrawing}>
      <AnnotationImage
        ref={imageRef}
        src={imageUrl}
        alt="Annotate"
        onLoad={handleImageLoad}
        draggable={false}
        $isDrawing={isDrawing}
      />
      
        <AnnotationOverlay
          $isDrawing={isDrawing}
          $isPolygonDrawing={isPolygonDrawing}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onDoubleClick={handleDoubleClick}
          onContextMenu={handleContextMenu}
          onMouseLeave={() => {
            // Don't cancel drawing when mouse leaves - let it continue until mouse up
            // This prevents accidental cancellation during drag operations
          }}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
        />
      
      {/* Drawing Preview */}
      {(() => {
        const shouldRender = isDrawing && getDisplayDrawingPreview()
        const preview = getDisplayDrawingPreview()
        
        if (!shouldRender) return null
        
        // Render different preview shapes based on current tool
        const renderPreviewShape = () => {
          switch (currentTool) {
            case 'rectangle':
              return (
                <AnnotationShape
                  $color={selectedColor || '#0694fb'}
                  $type="rectangle"
                  style={{
                    left: `${preview!.x}px`,
                    top: `${preview!.y}px`,
                    width: `${preview!.width}px`,
                    height: `${preview!.height}px`,
                    opacity: 0.8,
                    borderStyle: 'dashed',
                    borderWidth: '3px',
                  }}
                />
              )
            
            case 'circle':
              const radius = Math.max(preview!.width, preview!.height) / 2
              return (
                <CircleAnnotation
                  $color={selectedColor || '#0694fb'}
                  style={{
                    left: `${preview!.x}px`,
                    top: `${preview!.y}px`,
                    width: `${preview!.width}px`,
                    height: `${preview!.height}px`,
                    opacity: 0.8,
                    borderStyle: 'dashed',
                    borderWidth: '3px',
                  }}
                />
              )
            
            case 'ellipse':
              return (
                <EllipseAnnotation
                  $color={selectedColor || '#0694fb'}
                  style={{
                    left: `${preview!.x}px`,
                    top: `${preview!.y}px`,
                    width: `${preview!.width}px`,
                    height: `${preview!.height}px`,
                    opacity: 0.8,
                    borderStyle: 'dashed',
                    borderWidth: '3px',
                  }}
                />
              )
            
            case 'point':
              return (
                <PointAnnotation
                  $color={selectedColor || '#0694fb'}
                  style={{
                    left: `${preview!.x + preview!.width / 2 - 5}px`,
                    top: `${preview!.y + preview!.height / 2 - 5}px`,
                    width: '10px',
                    height: '10px',
                    opacity: 0.8,
                  }}
                />
              )
            
            case 'line':
              const linePreview = getDisplayLinePreview()
              if (!linePreview) return null
              return (
                <svg
                  style={{
                    position: 'absolute',
                    left: '0px',
                    top: '0px',
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    zIndex: 20
                  }}
                >
                  <line
                    x1={linePreview.x1}
                    y1={linePreview.y1}
                    x2={linePreview.x2}
                    y2={linePreview.y2}
                    stroke={selectedColor || '#0694fb'}
                    strokeWidth="3"
                    strokeDasharray="8,4"
                    strokeLinecap="round"
                    opacity="0.8"
                  />
                </svg>
              )
            
            case 'arrow':
              const arrowPreview = getDisplayLinePreview()
              if (!arrowPreview) return null
              return (
                <svg
                  style={{
                    position: 'absolute',
                    left: '0px',
                    top: '0px',
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    zIndex: 20
                  }}
                >
                  <defs>
                    <marker
                      id="arrowhead-preview"
                      markerWidth="10"
                      markerHeight="7"
                      refX="9"
                      refY="3.5"
                      orient="auto"
                    >
                      <polygon
                        points="0 0, 10 3.5, 0 7"
                        fill={selectedColor || '#0694fb'}
                        opacity="0.8"
                      />
                    </marker>
                  </defs>
                  <line
                    x1={arrowPreview.x1}
                    y1={arrowPreview.y1}
                    x2={arrowPreview.x2}
                    y2={arrowPreview.y2}
                    stroke={selectedColor || '#0694fb'}
                    strokeWidth="3"
                    strokeDasharray="8,4"
                    strokeLinecap="round"
                    markerEnd="url(#arrowhead-preview)"
                    opacity="0.8"
                  />
                </svg>
              )
            
            case 'text':
              return (
                <div
                  style={{
                    position: 'absolute',
                    left: `${preview!.x}px`,
                    top: `${preview!.y}px`,
                    color: selectedColor || '#0694fb',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    opacity: 0.8,
                    border: `2px dashed ${selectedColor || '#0694fb'}`,
                    padding: '4px 8px',
                    borderRadius: '4px',
                    background: 'rgba(0,0,0,0.3)',
                    pointerEvents: 'none',
                    zIndex: 20
                  }}
                >
                  Text
                </div>
              )
            
            case 'freehand':
              // Freehand preview is handled by the existing freehand drawing logic
              return null
            
            case 'measure-line':
              const measureLinePreview = getDisplayLinePreview()
              if (!measureLinePreview) return null
              return (
                <svg
                  style={{
                    position: 'absolute',
                    left: '0px',
                    top: '0px',
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    zIndex: 20
                  }}
                >
                  <line
                    x1={measureLinePreview.x1}
                    y1={measureLinePreview.y1}
                    x2={measureLinePreview.x2}
                    y2={measureLinePreview.y2}
                    stroke={selectedColor || '#0694fb'}
                    strokeWidth="3"
                    strokeDasharray="8,4"
                    strokeLinecap="round"
                    opacity="0.8"
                  />
                  {/* Measurement text */}
                  <text
                    x={(measureLinePreview.x1 + measureLinePreview.x2) / 2}
                    y={(measureLinePreview.y1 + measureLinePreview.y2) / 2 - 10}
                    fill={selectedColor || '#0694fb'}
                    fontSize="12"
                    fontWeight="bold"
                    textAnchor="middle"
                    style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
                  >
                    {formatMeasurement(Math.sqrt(Math.pow(measureLinePreview.x2 - measureLinePreview.x1, 2) + Math.pow(measureLinePreview.y2 - measureLinePreview.y1, 2)))}
                  </text>
                </svg>
              )
            
            case 'measure-circle':
              const circlePreview = getDisplayCirclePreview()
              if (!circlePreview) return null
              return (
                <svg
                  style={{
                    position: 'absolute',
                    left: '0px',
                    top: '0px',
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    zIndex: 20
                  }}
                >
                  <circle
                    cx={circlePreview.x}
                    cy={circlePreview.y}
                    r={circlePreview.radius}
                    stroke={selectedColor || '#0694fb'}
                    strokeWidth="3"
                    strokeDasharray="8,4"
                    fill="none"
                    opacity="0.8"
                  />
                  <text
                    x={circlePreview.x}
                    y={circlePreview.y - circlePreview.radius - 10}
                    fill={selectedColor || '#0694fb'}
                    fontSize="12"
                    fontWeight="bold"
                    textAnchor="middle"
                    style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
                  >
                    R: {formatMeasurement(circlePreview.radius)}
                  </text>
                </svg>
              )
            
            case 'measure-freehand':
              // Freehand preview is handled by the existing freehand drawing logic
              return null
            
            case 'polygon':
              // Polygon preview is handled separately below
              return null
            
            default:
              return null
          }
        }
        
        return renderPreviewShape()
      })()}
      
      {/* Polygon Drawing Preview */}
      {isPolygonDrawing && polygonPoints.length > 0 && (
        <PolygonAnnotation
          $color={selectedColor || '#0694fb'}
          $isPreview={true}
          style={{
            left: '0px',
            top: '0px',
            width: '100%',
            height: '100%',
            opacity: polygonPoints.length >= 3 ? 0.8 : 0.5,
          }}
        >
          <polygon
            points={(() => {
              if (!imageRef.current) return '0,0'
              const rect = imageRef.current.getBoundingClientRect()
              const scaleX = rect.width / imageRef.current.naturalWidth
              const scaleY = rect.height / imageRef.current.naturalHeight
              
              // Create closed polygon by adding first point at the end if not already there
              const displayPoints = polygonPoints.map(point => ({
                x: point.x * scaleX,
                y: point.y * scaleY
              }))
              
              // Add first point at the end to close the polygon
              if (displayPoints.length > 0) {
                displayPoints.push(displayPoints[0])
              }
              
              return displayPoints.map(p => `${p.x},${p.y}`).join(' ')
            })()}
            fill="none"
            stroke={selectedColor || '#0694fb'}
            strokeWidth="3"
            strokeDasharray="5,5"
            strokeLinejoin="round"
            strokeLinecap="round"
            filter="drop-shadow(0 0 1px rgba(0,0,0,0.5)) drop-shadow(0 0 1px rgba(255,255,255,0.5))"
          />
          {/* Render points */}
          {polygonPoints.map((point, index) => {
            if (!imageRef.current) return null
            const rect = imageRef.current.getBoundingClientRect()
            const scaleX = rect.width / imageRef.current.naturalWidth
            const scaleY = rect.height / imageRef.current.naturalHeight
            const isReady = polygonPoints.length >= 3
            return (
              <circle
                key={index}
                cx={point.x * scaleX}
                cy={point.y * scaleY}
                r="5"
                fill={isReady ? selectedColor || '#0694fb' : '#ff6b6b'}
                stroke="white"
                strokeWidth="2"
                filter="drop-shadow(0 0 2px rgba(0,0,0,0.7))"
              />
            )
          })}
          
          {/* Show completion hint when ready */}
          {polygonPoints.length >= 3 && (
            <text
              x="10"
              y="30"
              fill={selectedColor || '#0694fb'}
              fontSize="14"
              fontWeight="bold"
              style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
            >
              ✓ Ready to complete (Double-click or Enter)
            </text>
          )}
        </PolygonAnnotation>
      )}
      
      {/* Freehand Drawing Preview */}
      {isFreehandDrawing && freehandPoints.length > 0 && (
        <svg
          style={{
            position: 'absolute',
            left: '0px',
            top: '0px',
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 20
          }}
        >
          <path
            d={(() => {
              if (freehandPoints.length < 2 || !imageRef.current) return ''
              
              const rect = imageRef.current.getBoundingClientRect()
              let naturalWidth = imageRef.current.naturalWidth
              let naturalHeight = imageRef.current.naturalHeight
              
              // Guard against zero natural dimensions by falling back to rect
              if (naturalWidth <= 0 || naturalHeight <= 0) {
                naturalWidth = Math.max(1, Math.floor(rect.width))
                naturalHeight = Math.max(1, Math.floor(rect.height))
              }
              
              // Calculate scale factors from natural image to display coordinates
              const scaleX = rect.width / naturalWidth
              const scaleY = rect.height / naturalHeight
              
              let path = `M ${freehandPoints[0].x * scaleX} ${freehandPoints[0].y * scaleY}`
              for (let i = 1; i < freehandPoints.length; i++) {
                path += ` L ${freehandPoints[i].x * scaleX} ${freehandPoints[i].y * scaleY}`
              }
              return path
            })()}
            stroke={selectedColor || '#0694fb'}
            strokeWidth="3"
            strokeDasharray="8,4"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.8"
          />
        </svg>
      )}
      
      {/* Annotations */}
      {annotations.map(annotation => {
        const displayCoords = getDisplayCoordinates(annotation)
        
        // Render different shapes based on type
        const renderAnnotationShape = () => {
          const shouldCapture = currentTool === 'select'
          switch (annotation.type) {
            case 'rectangle':
              return (
                <AnnotationShape
                  $color={annotation.color}
                  $type={annotation.type}
                  style={{
                    left: `${displayCoords.x}px`,
                    top: `${displayCoords.y}px`,
                    width: `${displayCoords.width}px`,
                    height: `${displayCoords.height}px`,
                    pointerEvents: shouldCapture ? 'auto' : 'none'
                  }}
                  onClick={() => !readOnly && shouldCapture && setSelectedAnnotation(annotation.id)}
                />
              )
            
            case 'circle':
              return (
                <CircleAnnotation
                  $color={annotation.color}
                  style={{
                    left: `${displayCoords.x - displayCoords.radius}px`,
                    top: `${displayCoords.y - displayCoords.radius}px`,
                    width: `${displayCoords.radius * 2}px`,
                    height: `${displayCoords.radius * 2}px`,
                    pointerEvents: shouldCapture ? 'auto' : 'none'
                  }}
                  onClick={() => !readOnly && shouldCapture && setSelectedAnnotation(annotation.id)}
                />
              )
            
            case 'ellipse':
              return (
                <EllipseAnnotation
                  $color={annotation.color}
                  style={{
                    left: `${displayCoords.x - displayCoords.radiusX}px`,
                    top: `${displayCoords.y - displayCoords.radiusY}px`,
                    width: `${displayCoords.radiusX * 2}px`,
                    height: `${displayCoords.radiusY * 2}px`,
                    pointerEvents: shouldCapture ? 'auto' : 'none'
                  }}
                  onClick={() => !readOnly && shouldCapture && setSelectedAnnotation(annotation.id)}
                />
              )
            
            case 'point':
              return (
                <PointAnnotation
                  $color={annotation.color}
                  style={{
                    left: `${displayCoords.x - 4}px`,
                    top: `${displayCoords.y - 4}px`,
                    width: '8px',
                    height: '8px',
                    pointerEvents: shouldCapture ? 'auto' : 'none'
                  }}
                  onClick={() => !readOnly && shouldCapture && setSelectedAnnotation(annotation.id)}
                />
              )
            
            case 'polygon':
              return (
                <PolygonAnnotation
                  $color={annotation.color}
                  $isPreview={false}
                  style={{
                    left: '0px',
                    top: '0px',
                    width: '100%',
                    height: '100%',
                    pointerEvents: shouldCapture ? 'auto' : 'none'
                  }}
                  onClick={() => !readOnly && shouldCapture && setSelectedAnnotation(annotation.id)}
                >
                  <polygon
                    points={displayCoords.points?.map((p: { x: number; y: number }) => `${p.x},${p.y}`).join(' ')}
                    fill="none"
                    stroke={annotation.color}
                    strokeWidth="3"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    filter="drop-shadow(0 0 1px rgba(0,0,0,0.5)) drop-shadow(0 0 1px rgba(255,255,255,0.5))"
                  />
                </PolygonAnnotation>
              )
            
            case 'line':
              return (
                <svg
                  style={{
                    position: 'absolute',
                    left: '0px',
                    top: '0px',
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    zIndex: 20
                  }}
                >
                  <line
                    x1={displayCoords.startX}
                    y1={displayCoords.startY}
                    x2={displayCoords.endX}
                    y2={displayCoords.endY}
                    stroke={annotation.color}
                    strokeWidth="3"
                    strokeLinecap="round"
                    filter="drop-shadow(0 0 1px rgba(0,0,0,0.5)) drop-shadow(0 0 1px rgba(255,255,255,0.5))"
                  />
                </svg>
              )
            
            case 'arrow':
              return (
                <svg
                  style={{
                    position: 'absolute',
                    left: '0px',
                    top: '0px',
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    zIndex: 20
                  }}
                >
                  <defs>
                    <marker
                      id={`arrowhead-${annotation.id}`}
                      markerWidth="10"
                      markerHeight="7"
                      refX="9"
                      refY="3.5"
                      orient="auto"
                    >
                      <polygon
                        points="0 0, 10 3.5, 0 7"
                        fill={annotation.color}
                      />
                    </marker>
                  </defs>
                  <line
                    x1={displayCoords.startX}
                    y1={displayCoords.startY}
                    x2={displayCoords.endX}
                    y2={displayCoords.endY}
                    stroke={annotation.color}
                    strokeWidth="3"
                    strokeLinecap="round"
                    markerEnd={`url(#arrowhead-${annotation.id})`}
                    filter="drop-shadow(0 0 1px rgba(0,0,0,0.5)) drop-shadow(0 0 1px rgba(255,255,255,0.5))"
                  />
                </svg>
              )
            
            case 'text':
              return (
                <div
                  style={{
                    position: 'absolute',
                    left: `${displayCoords.x}px`,
                    top: `${displayCoords.y}px`,
                    color: annotation.color,
                    fontSize: `${displayCoords.fontSize || 16}px`,
                    fontWeight: 'bold',
                    pointerEvents: 'none',
                    zIndex: 20,
                    textShadow: '1px 1px 2px rgba(0,0,0,0.8), -1px -1px 2px rgba(255,255,255,0.8)',
                    background: 'rgba(0,0,0,0.7)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    border: `2px solid ${annotation.color}`
                  }}
                >
                  {displayCoords.text || 'Text'}
                </div>
              )
            
            case 'freehand':
              return (
                <svg
                  style={{
                    position: 'absolute',
                    left: '0px',
                    top: '0px',
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    zIndex: 20
                  }}
                >
                  <path
                    d={(() => {
                      if (!displayCoords.points || displayCoords.points.length < 2) return ''
                      let path = `M ${displayCoords.points[0].x} ${displayCoords.points[0].y}`
                      for (let i = 1; i < displayCoords.points.length; i++) {
                        path += ` L ${displayCoords.points[i].x} ${displayCoords.points[i].y}`
                      }
                      return path
                    })()}
                    stroke={annotation.color}
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="drop-shadow(0 0 1px rgba(0,0,0,0.5)) drop-shadow(0 0 1px rgba(255,255,255,0.5))"
                  />
                </svg>
              )
            
            case 'measure-line':
              return (
                <svg
                  style={{
                    position: 'absolute',
                    left: '0px',
                    top: '0px',
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    zIndex: 20
                  }}
                >
                  <line
                    x1={displayCoords.startX}
                    y1={displayCoords.startY}
                    x2={displayCoords.endX}
                    y2={displayCoords.endY}
                    stroke={annotation.color}
                    strokeWidth="3"
                    strokeDasharray="8,4"
                    strokeLinecap="round"
                    filter="drop-shadow(0 0 1px rgba(0,0,0,0.5)) drop-shadow(0 0 1px rgba(255,255,255,0.5))"
                  />
                  {/* Measurement text */}
                  <text
                    x={(displayCoords.startX + displayCoords.endX) / 2}
                    y={(displayCoords.startY + displayCoords.endY) / 2 - 10}
                    fill={annotation.color}
                    fontSize="12"
                    fontWeight="bold"
                    textAnchor="middle"
                    style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
                  >
                    {formatMeasurement(annotation.metadata?.measurements?.length || 0)}
                  </text>
                </svg>
              )
            
            case 'measure-circle':
              return (
                <svg
                  style={{
                    position: 'absolute',
                    left: '0px',
                    top: '0px',
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    zIndex: 20
                  }}
                >
                  <circle
                    cx={displayCoords.x}
                    cy={displayCoords.y}
                    r={displayCoords.radius}
                    stroke={annotation.color}
                    strokeWidth="3"
                    strokeDasharray="8,4"
                    fill="none"
                    filter="drop-shadow(0 0 1px rgba(0,0,0,0.5)) drop-shadow(0 0 1px rgba(255,255,255,0.5))"
                  />
                  {/* Measurement text */}
                  <text
                    x={displayCoords.x}
                    y={displayCoords.y - displayCoords.radius - 10}
                    fill={annotation.color}
                    fontSize="12"
                    fontWeight="bold"
                    textAnchor="middle"
                    style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
                  >
                    R: {formatMeasurement(displayCoords.radius)}
                  </text>
                  <text
                    x={displayCoords.x}
                    y={displayCoords.y + displayCoords.radius + 20}
                    fill={annotation.color}
                    fontSize="12"
                    fontWeight="bold"
                    textAnchor="middle"
                    style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
                  >
                    A: {formatMeasurement(annotation.metadata?.measurements?.area || 0, true)}
                  </text>
                </svg>
              )
            
            case 'measure-freehand':
              return (
                <svg
                  style={{
                    position: 'absolute',
                    left: '0px',
                    top: '0px',
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    zIndex: 20
                  }}
                >
                  <path
                    d={(() => {
                      if (!displayCoords.points || displayCoords.points.length < 2) return ''
                      let path = `M ${displayCoords.points[0].x} ${displayCoords.points[0].y}`
                      for (let i = 1; i < displayCoords.points.length; i++) {
                        path += ` L ${displayCoords.points[i].x} ${displayCoords.points[i].y}`
                      }
                      return path
                    })()}
                    stroke={annotation.color}
                    strokeWidth="3"
                    strokeDasharray="8,4"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="drop-shadow(0 0 1px rgba(0,0,0,0.5)) drop-shadow(0 0 1px rgba(255,255,255,0.5))"
                  />
                  {/* Measurement text */}
                  <text
                    x={displayCoords.points[0].x}
                    y={displayCoords.points[0].y - 10}
                    fill={annotation.color}
                    fontSize="12"
                    fontWeight="bold"
                    textAnchor="middle"
                    style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
                  >
                    P: {formatMeasurement(annotation.metadata?.measurements?.length || 0)}
                  </text>
                </svg>
              )
            
            
            default:
              return null
          }
        }
        
        return (
          <React.Fragment key={annotation.id}>
            {renderAnnotationShape()}
            <AnnotationLabel
              $color={annotation.color}
              style={{
                left: `${displayCoords.x}px`,
                top: `${displayCoords.y - 25}px`,
              }}
            >
              {annotation.label}
            </AnnotationLabel>
          </React.Fragment>
        )
      })}
      
      {/* Toolbar */}
      {!readOnly && (
        <Toolbar>
          <ToolButton
            $active={currentTool === 'select'}
            onClick={() => handleToolChange('select')}
            title="Select/Move"
          >
            <FaMousePointer />
          </ToolButton>
          <ToolButton
            $active={currentTool === 'rectangle'}
            onClick={() => handleToolChange('rectangle')}
            title="Draw Rectangle"
          >
            <FaVectorSquare />
          </ToolButton>
          <ToolButton
            $active={currentTool === 'circle'}
            onClick={() => handleToolChange('circle')}
            title="Draw Circle"
          >
            <FaCircle />
          </ToolButton>
          <ToolButton
            $active={currentTool === 'ellipse'}
            onClick={() => handleToolChange('ellipse')}
            title="Draw Ellipse"
          >
            <FaDotCircle />
          </ToolButton>
          <ToolButton
            $active={currentTool === 'polygon'}
            onClick={() => handleToolChange('polygon')}
            title="Draw Polygon"
          >
            <FaPolygon />
          </ToolButton>
          <ToolButton
            $active={currentTool === 'point'}
            onClick={() => handleToolChange('point')}
            title="Draw Point"
          >
            <FaCrosshairs />
          </ToolButton>
          <ToolButton
            $active={currentTool === 'line'}
            onClick={() => handleToolChange('line')}
            title="Draw Line"
          >
            <FaPen />
          </ToolButton>
          <ToolButton
            $active={currentTool === 'arrow'}
            onClick={() => handleToolChange('arrow')}
            title="Draw Arrow"
          >
            <FaArrowRight />
          </ToolButton>
          <ToolButton
            $active={currentTool === 'text'}
            onClick={() => handleToolChange('text')}
            title="Add Text"
          >
            <FaTextWidth />
          </ToolButton>
          <ToolButton
            $active={currentTool === 'freehand'}
            onClick={() => handleToolChange('freehand')}
            title="Freehand Drawing"
          >
            <FaHighlighter />
          </ToolButton>
          
          {/* Measurement Tools */}
          <ToolButton
            $active={currentTool === 'measure-line'}
            onClick={() => handleToolChange('measure-line')}
            title="Measure Line Length"
          >
            <FaPencilRuler />
          </ToolButton>
          <ToolButton
            $active={currentTool === 'measure-circle'}
            onClick={() => handleToolChange('measure-circle')}
            title="Measure Circle Radius & Area"
          >
            <FaRulerCombined />
          </ToolButton>
          <ToolButton
            $active={currentTool === 'measure-freehand'}
            onClick={() => handleToolChange('measure-freehand')}
            title="Measure Freehand Perimeter & Area"
          >
            <FaRuler />
          </ToolButton>
          
          {/* Action buttons */}
          <ToolButton
            onClick={undo}
            title="Undo"
            disabled={historyIndex <= 0}
          >
            <FaUndo />
          </ToolButton>
          <ToolButton
            onClick={redo}
            title="Redo"
            disabled={historyIndex >= history.length - 1}
          >
            <FaRedo />
          </ToolButton>
          
          {selectedAnnotation && (
            <ToolButton
              onClick={() => deleteAnnotation(selectedAnnotation)}
              title="Delete Selected"
            >
              <FaTrashAlt />
            </ToolButton>
          )}
          <ToolButton
            onClick={clearAllAnnotations}
            title="Clear All Annotations"
            disabled={annotations.length === 0}
          >
            <FaBroom />
          </ToolButton>
          
        </Toolbar>
      )}
      
      
      {/* Tooltip */}
      <Tooltip $visible={tooltip.visible} $position={tooltip.position}>
        {tooltip.text}
      </Tooltip>
      
      {/* Visual Feedback */}
      <VisualFeedback 
        $visible={visualFeedback.visible} 
        $position={visualFeedback.position} 
        $type={visualFeedback.type}
      />
      
      {/* Drawing Progress */}
      <DrawingProgress $visible={drawingProgress.visible}>
        <div>{drawingProgress.text}</div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${drawingProgress.progress}%` }}
          />
        </div>
      </DrawingProgress>
    </CanvasContainer>
  )
}

export default AnnotationCanvas