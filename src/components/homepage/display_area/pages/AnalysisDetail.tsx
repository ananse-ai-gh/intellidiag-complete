'use client'

import React, { useEffect, useMemo, useState, useRef } from 'react'
import styled from 'styled-components'
import { usePathname } from 'next/navigation'
import ImageViewer from '@/components/ImageViewer'
import { 
  FaCogs, FaDownload, FaPlay, FaSpinner, 
  FaPen, FaSquare, FaFont, FaHands, FaComment, FaEllipsisV,
  FaRuler, FaSearchPlus, FaSearchMinus, FaExpand, FaCompress,
  FaMagic, FaBrain, FaEye, FaEdit, FaTrash, FaCheck,
  FaArrowRight, FaTag, FaCog, FaPlusCircle, FaMousePointer,
  FaCircle, FaDrawPolygon, FaMapMarkerAlt, FaArrowUp,
  FaPaintBrush, FaWind, FaSeedling,
  FaFillDrip, FaTooth, FaIntercom, FaCut,
  FaRulerCombined, FaRoute,
  FaUndo, FaRedo, FaBookmark, FaCheckCircle,
  FaTimesCircle, FaFileExport, FaEyeSlash, FaSlidersH,
  FaChevronDown, FaChevronRight, FaChevronLeft, FaBars, FaTimes
} from 'react-icons/fa'
import { SmartThumbnail, isDicomFile } from '@/utils/fileUtils'
import api, { scansAPI } from '@/services/api'

const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #0a0a0a;
  color: white;
`

const ContentArea = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`

// Tools sidebar on the left
const ToolsSidebar = styled.div`
  width: 280px;
  background: #1a1a1a;
  border-right: 1px solid #2a2a2a;
  display: flex;
  flex-direction: column;
`

// Main viewer area
const MainViewerArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

// Thumbnails at the top
const ThumbnailBar = styled.div`
  height: 70px;
  background: #1a1a1a;
  border-bottom: 1px solid #2a2a2a;
  display: flex;
  align-items: center;
  padding: 10px 12px;
  overflow-x: auto;
  gap: 8px;
`

// Viewer container
const ViewerArea = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
`

// Image viewer container
const ImageViewerArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

const SidebarHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid #2a2a2a;
`

const SidebarTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: white;
  margin-bottom: 8px;
`

const ImageCount = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #8aa;
`

const CountBadge = styled.div`
  background: #0694fb;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
`

const ThumbnailGrid = styled.div`
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const ThumbnailItem = styled.div<{ $isSelected: boolean }>`
  position: relative;
  cursor: pointer;
  border-radius: 6px;
  overflow: hidden;
  transition: all 0.2s ease;
  transform: ${props => props.$isSelected ? 'scale(1.05)' : 'scale(1)'};
  border: ${props => props.$isSelected ? '2px solid #0694fb' : '1px solid rgba(255,255,255,0.2)'};
  box-shadow: ${props => props.$isSelected ? '0 0 15px rgba(6, 148, 251, 0.4)' : '0 2px 8px rgba(0,0,0,0.3)'};
  width: 50px;
  height: 50px;
  flex-shrink: 0;
  background: #2a2a2a;
  
  &:hover {
    transform: scale(1.05);
    border-color: #0694fb;
    box-shadow: 0 0 15px rgba(6, 148, 251, 0.4);
  }
`

const ThumbnailImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: contrast(1.2) brightness(1.1) saturate(0.9);
  transition: filter 0.2s ease;
  
  &:hover {
    filter: contrast(1.3) brightness(1.2) saturate(1.0);
  }
`

const AddImageButton = styled.button`
  width: 50px;
  height: 50px;
  min-width: 50px;
  background: rgba(6, 148, 251, 0.1);
  border: 2px dashed #0694fb;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #0694fb;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  
  &:hover {
    background: rgba(6, 148, 251, 0.2);
    transform: scale(1.05);
    box-shadow: 0 0 15px rgba(6, 148, 251, 0.4);
  }
`

const MainViewer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #0a0a0a;
`

const Toolbar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #1a1a1a;
  border-bottom: 1px solid #2a2a2a;
`

const ToolGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
`

const ToolButton = styled.button<{ $isActive?: boolean }>`
  width: 40px;
  height: 40px;
  background: ${props => props.$isActive ? '#0694fb' : 'rgba(255, 255, 255, 0.1)'};
  border: 1px solid ${props => props.$isActive ? '#0694fb' : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 8px;
  color: ${props => props.$isActive ? 'white' : '#8aa'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 8px;
  
  &:hover {
    background: ${props => props.$isActive ? '#0582d9' : 'rgba(255, 255, 255, 0.2)'};
    color: white;
    transform: translateY(-1px);
  }
`

const SpecialButton = styled.button`
  background: #0694fb;
  border: none;
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #0582d9;
    transform: translateY(-1px);
  }
`

const ViewerContainer = styled.div`
  flex: 1;
  position: relative;
  background: #000;
  overflow: hidden;
`

const ImageOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 10;
`

const AnnotationBox = styled.div<{ $x: number; $y: number; $width: number; $height: number }>`
  position: absolute;
  left: ${props => props.$x}px;
  top: ${props => props.$y}px;
  width: ${props => props.$width}px;
  height: ${props => props.$height}px;
  border: 2px solid #0694fb;
  background: rgba(6, 148, 251, 0.1);
  pointer-events: auto;
  cursor: move;
`

const AnnotationText = styled.div`
  position: absolute;
  top: -30px;
  left: 0;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  max-width: 300px;
  line-height: 1.4;
`

const MeasurementLine = styled.div<{ $x1: number; $y1: number; $x2: number; $y2: number }>`
  position: absolute;
  left: ${props => Math.min(props.$x1, props.$x2)}px;
  top: ${props => Math.min(props.$y1, props.$y2)}px;
  width: ${props => Math.abs(props.$x2 - props.$x1)}px;
  height: ${props => Math.abs(props.$y2 - props.$y1)}px;
  border: 2px dashed #00ff00;
  pointer-events: auto;
  
  &::after {
    content: '15cm';
    position: absolute;
    top: -20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 255, 0, 0.8);
    color: white;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 10px;
    font-weight: 600;
  }
`

const RightSidebar = styled.div`
  width: 360px;
  background: #1a1a1a;
  border-left: 1px solid #2a2a2a;
  display: flex;
  flex-direction: column;
`

const SidebarSection = styled.div`
  padding: 16px;
  border-bottom: 1px solid #2a2a2a;
`

const SectionTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: white;
  margin-bottom: 12px;
`

const ModelCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: #0694fb;
  }
`

const ModelHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`

const ModelIcon = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 4px;
  background: linear-gradient(135deg, #00ff88, #0694fb);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: white;
`

const ModelName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: white;
`

const ModelId = styled.div`
  font-size: 12px;
  color: #8aa;
`

const ModelTag = styled.div<{ $color: string }>`
  background: ${props => props.$color};
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  margin-top: 4px;
  display: inline-block;
`

const ScanDetails = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
`

const ScanTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: white;
  margin-bottom: 4px;
`

const ScanSubtitle = styled.div`
  font-size: 12px;
  color: #8aa;
`

const ConfidenceSection = styled.div`
  margin-bottom: 16px;
`

const ConfidenceLabel = styled.div`
  font-size: 14px;
  color: #8aa;
  margin-bottom: 8px;
`

const ConfidenceScore = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: #00ff88;
  margin-bottom: 12px;
`

const ConfidenceBreakdown = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const ConfidenceItem = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #8aa;
`

const ResultsButton = styled.button`
  width: 100%;
  background: #0694fb;
  border: none;
  color: white;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 16px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #0582d9;
    transform: translateY(-1px);
  }
`

const ResultsText = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 12px;
  font-size: 13px;
  line-height: 1.6;
  color: #ccc;
  max-height: 200px;
  overflow-y: auto;
`

// New styled components for professional left panel
const CollapsibleToolsSidebar = styled.div<{ $collapsed: boolean }>`
  width: ${props => props.$collapsed ? '60px' : '280px'};
  background: #1a1a1a;
  border-right: 1px solid #2a2a2a;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  overflow: hidden;
`

const PanelToggleButton = styled.button`
  width: 40px;
  height: 40px;
  background: #0694fb;
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 12px 10px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #0582d9;
    transform: scale(1.05);
  }
`

const AccordionSection = styled.div`
  border-bottom: 1px solid #2a2a2a;
`

const AccordionHeader = styled.button`
  width: 100%;
  background: transparent;
  border: none;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  color: white;
  font-size: 14px;
  font-weight: 600;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`

const AccordionIcon = styled.div`
  transition: transform 0.3s ease;
  transform: ${props => props.className?.includes('expanded') ? 'rotate(90deg)' : 'rotate(0deg)'};
`

const AccordionContent = styled.div<{ $expanded: boolean }>`
  max-height: ${props => props.$expanded ? '1000px' : '0'};
  overflow: hidden;
  transition: max-height 0.3s ease;
  background: rgba(0, 0, 0, 0.1);
`

const ToolGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(40px, 40px));
  gap: 8px;
  padding: 12px 16px;
  align-items: start;
  justify-content: start;
`

const CompactToolGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 16px;
  align-items: start;
`

const InputGroup = styled.div`
  padding: 12px 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`

const LabeledInput = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  
  span {
    font-size: 12px;
    color: #8aa;
    min-width: 50px;
  }
  
  input, select {
    flex: 1;
    background: #2a2a2a;
    color: white;
    border: 1px solid #444;
    border-radius: 4px;
    padding: 4px 8px;
    font-size: 12px;
    
    &:focus {
      outline: none;
      border-color: #0694fb;
    }
  }
`

const PresetButtons = styled.div`
  display: flex;
  gap: 4px;
  margin-top: 8px;
  
  button {
    background: #333;
    color: #8aa;
    border: 1px solid #555;
    border-radius: 4px;
    padding: 4px 8px;
    font-size: 10px;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      background: #444;
      color: white;
    }
  }
`

const StyledSelect = styled.select`
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: #ffffff;
  font-size: 14px;
  font-family: var(--font-primary);
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239c9c9c' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  padding-right: 40px;

  & option {
    background: #1a2a3a;
    color: #ffffff;
    padding: 8px;
  }

  &:focus {
    outline: none;
    border-color: #0694fb;
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 0 3px rgba(6, 148, 251, 0.15);
  }

  &:hover {
    border-color: rgba(255, 255, 255, 0.2);
  }

  @media (min-width: 481px) and (max-width: 768px) {
    padding: 14px 16px;
    font-size: 15px;
    padding-right: 40px;
  }

  @media (min-width: 769px) {
    padding: 16px 16px;
    font-size: 16px;
    padding-right: 40px;
  }
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: #ffffff;
  font-size: 14px;
  font-family: var(--font-primary);
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);

  &::placeholder {
    color: #9c9c9c;
  }

  &:focus {
    outline: none;
    border-color: #0694fb;
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 0 3px rgba(6, 148, 251, 0.15);
  }

  &:hover {
    border-color: rgba(255, 255, 255, 0.2);
  }

  @media (min-width: 481px) and (max-width: 768px) {
    padding: 14px 16px;
    font-size: 15px;
  }

  @media (min-width: 769px) {
    padding: 16px 16px;
    font-size: 16px;
  }
`;

const AnalysisDetail: React.FC = () => {
  const pathname = usePathname()
  const analysisId = pathname.split('/').pop()

  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('pending')
  const [meta, setMeta] = useState<any>(null)
  const [files, setFiles] = useState<any[]>([])
  const [selected, setSelected] = useState(0)
  const [polling, setPolling] = useState(false)
  const [activeTool, setActiveTool] = useState('select')
  const [annotations, setAnnotations] = useState<any[]>([])
  const [measurements, setMeasurements] = useState<any[]>([])
  const [scan, setScan] = useState<any>(null)
  const [patient, setPatient] = useState<any>(null)
  
  // Image dimensions state for coordinate normalization
  const [currentImageDimensions, setCurrentImageDimensions] = useState<{width: number, height: number} | null>(null)
  
  // Function to get current image dimensions
  const updateImageDimensions = React.useCallback(() => {
    const imgElement = document.querySelector('.image-viewer img') as HTMLImageElement
    if (imgElement) {
      setCurrentImageDimensions({
        width: imgElement.naturalWidth || imgElement.clientWidth,
        height: imgElement.naturalHeight || imgElement.clientHeight
      })
      console.log('📏 Updated image dimensions:', imgElement.naturalWidth || imgElement.clientWidth, 'x', imgElement.naturalHeight || imgElement.clientHeight)
    }
  }, [])
  
  // Professional annotation tool states
  const [overlayVisible, setOverlayVisible] = useState(true)
  const [overlayOpacity, setOverlayOpacity] = useState(80)
  const [brushSize, setBrushSize] = useState(10)
  const [brushHardness, setBrushHardness] = useState(0.8)
  const [activeLabel, setActiveLabel] = useState('Tumor')
  const [labels, setLabels] = useState([
    { id: 'Tumor', name: 'Tumor', color: '#ff0000', opacity: 100, visible: true, voxelCount: 0 },
    { id: 'Liver', name: 'Liver', color: '#00ff00', opacity: 100, visible: true, voxelCount: 0 },
    { id: 'Bone', name: 'Bone', color: '#ffff00', opacity: 100, visible: true, voxelCount: 0 },
    { id: 'Background', name: 'Background', color: '#0000ff', opacity: 100, visible: true, voxelCount: 0 }
  ])
  // Image-specific annotation storage
  const [imageAnnotations, setImageAnnotations] = useState<{[imageIndex: number]: {
    shapes: any[],
    textAnnotations: any[],
    measurements: any[],
    history: any[],
    historyIndex: number
  }}>({})
  
  const [bookmarks, setBookmarks] = useState<any[]>([])
  const [studyState, setStudyState] = useState<'pending' | 'accepted' | 'rejected'>('pending')
  
  // Dataset export states
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [exportFormat, setExportFormat] = useState('yolo')
  const [includeMeasurements, setIncludeMeasurements] = useState(false)
  const [exporting, setExporting] = useState(false)
  
  // Panel collapse states
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false)
  const [accordionStates, setAccordionStates] = useState({
    selection: true,
    roi: true,
    measuring: true,
    workflow: false
  })
  
  // Get current image annotations with initialization
  const currentImageAnnotations = imageAnnotations[selected] || {
    shapes: [],
    textAnnotations: [],
    measurements: [],
    history: [],
    historyIndex: -1
  }
  
  // Derived state for current image
  const drawingShapes = currentImageAnnotations?.shapes || []
  const textAnnotations = currentImageAnnotations?.textAnnotations || []
  const measurementLines = currentImageAnnotations?.measurements || []
  const history = currentImageAnnotations?.history || []
  const historyIndex = currentImageAnnotations?.historyIndex || -1
  
  // Initialize annotations for the current image and update image dimensions
  React.useEffect(() => {
    if (!imageAnnotations[selected] && Array.isArray(files) && files.length > 0) {
      setImageAnnotations(prev => ({
        ...prev,
        [selected]: {
          shapes: [],
          textAnnotations: [],
          measurements: [],
          history: [],
          historyIndex: -1
        }
      }))
    }
    
    // Update image dimensions when files load or selection changes
    if (Array.isArray(files) && files.length > 0) {
      // Small delay to allow image to load
      const timer = setTimeout(() => {
        updateImageDimensions()
      }, 500)
      
      return () => clearTimeout(timer)
    }
  }, [selected, imageAnnotations, files, updateImageDimensions])
  
  // Unified Tool System State
  const [toolState, setToolState] = useState({
    isDrawing: false,
    isPanning: false,
    currentPath: [] as any[],
    currentShape: null as any,
    currentMeasurement: null as any,
    lastPoint: { x: 0, y: 0 },
    startPoint: { x: 0, y: 0 }
  })
  
  // Auto-save annotations debounce timer
  const saveTimer = React.useRef<NodeJS.Timeout | null>(null)

  // Debounced save function
  const debouncedSaveAnnotations = React.useCallback(async (imageIndex: number, annotationData: any) => {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current)
    }
    
    saveTimer.current = setTimeout(async () => {
      if (analysisId) {
        try {
          await scansAPI.saveAnnotations(analysisId, imageIndex, annotationData)
          console.log(`💾 Auto-saved annotations for image ${imageIndex}`)
        } catch (error) {
          console.error('Failed to auto-save annotations:', error)
        }
      }
    }, 2000) // Save after 2 seconds of inactivity
  }, [analysisId])

  // Setter functions for current image annotation updates
  const setDrawingShapes = (update: any) => {
    setImageAnnotations(prev => {
      const newAnnotations = {
        ...prev,
        [selected]: {
          ...prev[selected],
          shapes: typeof update === 'function' ? update(prev[selected]?.shapes || []) : update
        }
      }
      
      // Auto-save after update
      const currentAnnotations = newAnnotations[selected]
      if (currentAnnotations && analysisId) {
        debouncedSaveAnnotations(selected, {
          shapes: currentAnnotations.shapes,
          textAnnotations: currentAnnotations.textAnnotations,
          measurements: currentAnnotations.measurements
        })
      }
      
      return newAnnotations
    })
  }
  
  const setTextAnnotations = (update: any) => {
    setImageAnnotations(prev => {
      const newAnnotations = {
        ...prev,
        [selected]: {
          ...prev[selected],
          textAnnotations: typeof update === 'function' ? update(prev[selected]?.textAnnotations || []) : update
        }
      }
      
      // Auto-save after update
      const currentAnnotations = newAnnotations[selected]
      if (currentAnnotations && analysisId) {
        debouncedSaveAnnotations(selected, {
          shapes: currentAnnotations.shapes,
          textAnnotations: currentAnnotations.textAnnotations,
          measurements: currentAnnotations.measurements
        })
      }
      
      return newAnnotations
    })
  }
  
  const setMeasurementLines = (update: any) => {
    setImageAnnotations(prev => {
      const newAnnotations = {
        ...prev,
        [selected]: {
          ...prev[selected],
          measurements: typeof update === 'function' ? update(prev[selected]?.measurements || []) : update
        }
      }
      
      // Auto-save after update
      const currentAnnotations = newAnnotations[selected]
      if (currentAnnotations && analysisId) {
        debouncedSaveAnnotations(selected, {
          shapes: currentAnnotations.shapes,
          textAnnotations: currentAnnotations.textAnnotations,
          measurements: currentAnnotations.measurements
        })
      }
      
      return newAnnotations
    })
  }
  
  const setHistory = (update: any) => {
    setImageAnnotations(prev => ({
      ...prev,
      [selected]: {
        ...prev[selected],
        history: typeof update === 'function' ? update(prev[selected]?.history || []) : update
      }
    }))
  }
  
  const setHistoryIndex = (update: any) => {
    setImageAnnotations(prev => ({
      ...prev,
      [selected]: {
        ...prev[selected],
        historyIndex: typeof update === 'function' ? update(prev[selected]?.historyIndex || -1) : update
      }
    }))
  }
  
  // Viewer References
  const [viewerContainer, setViewerContainer] = useState<HTMLDivElement | null>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const imageRef = useRef<HTMLImageElement>(null)
  
  // Modal State
  const [showTextModal, setShowTextModal] = useState(false)
  const [modalType, setModalType] = useState<'text' | 'comment' | 'roi-label'>('text')
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 })
  const [modalText, setModalText] = useState('')
  const [selectedShapeForLabel, setSelectedShapeForLabel] = useState<any>(null)
  
  // ROI Validation Feedback
  const [showValidationMessage, setShowValidationMessage] = useState(false)
  const [validationMessage, setValidationMessage] = useState('')
  
  // Image Processing State
  const [imageCanvas, setImageCanvas] = useState<HTMLCanvasElement | null>(null)
  const [imageContext, setImageContext] = useState<CanvasRenderingContext2D | null>(null)
  const [originalImageData, setOriginalImageData] = useState<ImageData | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Measurement State
  const [measurementUnit, setMeasurementUnit] = useState<'pixels' | 'mm' | 'cm'>('mm')
  
  // Toggle accordion section
  const toggleAccordion = (section: string) => {
    setAccordionStates(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev]
    }))
  }
  
  // Toggle left panel
  const toggleLeftPanel = () => {
    setLeftPanelCollapsed(!leftPanelCollapsed)
  }
  const [pixelToMmRatio, setPixelToMmRatio] = useState(0.5) // Default: 2 pixels per mm (typical for high-res medical imaging)
  const [measurementResults, setMeasurementResults] = useState<any[]>([])

  // Enhanced measurement unit handling
  const handleMeasurementUnitChange = (unit: 'pixels' | 'mm' | 'cm') => {
    setMeasurementUnit(unit)
    // Reset scale when switching back to pixels
    if (unit === 'pixels') {
      setPixelToMmRatio(0.5)
    }
  }

  // Enhanced pixel ratio handling with validation
  const handlePixelRatioChange = (value: number) => {
    const clampedValue = Math.max(0.01, Math.min(1000, value))
    setPixelToMmRatio(clampedValue)
  }
  
  // Selection State
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null)
  const [selectedAnnotationType, setSelectedAnnotationType] = useState<'shape' | 'text' | 'measurement' | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        
        if (!analysisId) {
          console.error('❌ No analysis ID provided')
          return
        }

        console.log('🔍 Loading analysis data for ID:', analysisId)
        
        // Fetch scan data
        const scanResponse = await api.get(`/api/scans/${analysisId}`)
        const scanData = scanResponse.data?.data
        
        if (!scanData) {
          console.error('❌ No scan data found')
          return
        }
        
        console.log('📋 Scan data loaded:', scanData)
        setScan(scanData)
        
        // Fetch patient data if patient id exists (handle both camelCase and snake_case)
        let patientData = null
        const pid = scanData.patientId || scanData.patient_id
        if (pid) {
          try {
            const patientResponse = await api.get(`/api/patients/${pid}`)
            // API returns patient under data.patient with camelCase keys
            patientData = patientResponse.data?.data?.patient
            console.log('👤 Patient data loaded:', patientData)
            setPatient(patientData)
          } catch (error) {
            console.warn('⚠️ Could not load patient data:', error)
          }
        }
        
        // Fetch images for this scan
        try {
          const imagesResponse = await api.get(`/api/scans/${analysisId}/images`)
          console.log('🔍 Raw images response:', imagesResponse.data)
          const imagesData = imagesResponse.data?.data?.images || []
          console.log('🖼️ Images loaded:', imagesData)
          
          // Validate image URLs
          const validatedImages = imagesData.map((img: any, index: number) => {
            console.log(`🔍 Validating image ${index}:`, {
              url: img.url,
              name: img.name,
              urlValid: img.url && typeof img.url === 'string' && img.url.startsWith('http'),
              nameValid: img.name && typeof img.name === 'string'
            })
            return img
          })
          
          setFiles(validatedImages)
        } catch (error) {
          console.warn('⚠️ Could not load images:', error)
          setFiles([])
        }
        
        // Fetch saved annotations for this scan
        try {
          const annotationsResponse = await scansAPI.getAnnotations(analysisId)
          const annotationsData = annotationsResponse.data?.data?.annotations || {}
          console.log('📝 Loaded annotations:', annotationsData)
          
          // Convert loaded annotations to our imageAnnotations format
          const loadedImageAnnotations: {[imageIndex: number]: any} = {}
          
          Object.entries(annotationsData).forEach(([imageIndexStr, imageAnnotations]: [string, any]) => {
            const imageIndex = parseInt(imageIndexStr)
            loadedImageAnnotations[imageIndex] = {
              shapes: imageAnnotations.shapes || [],
              textAnnotations: imageAnnotations.textAnnotations || [],
              measurements: imageAnnotations.measurements || [],
              history: [],
              historyIndex: -1
            }
          })
          
          setImageAnnotations(loadedImageAnnotations)
          console.log('✅ Successfully loaded annotations for', Object.keys(loadedImageAnnotations).length, 'images')
        } catch (error) {
          console.warn('⚠️ Could not load annotations:', error)
          setImageAnnotations({})
        }
        
        // Set metadata with patient data (robust to key variants)
        const firstName = patientData?.firstName ?? patientData?.first_name ?? patientData?.firstname ?? ''
        const lastName = patientData?.lastName ?? patientData?.last_name ?? patientData?.lastname ?? ''
        const patientName = `${firstName} ${lastName}`.trim() || (patientData?.patientId ?? patientData?.patientid ?? patientData?.id ?? 'Unknown Patient')
        const computedPatientId = patientData?.patientId ?? patientData?.patientid ?? patientData?.id ?? (scanData.patientId || scanData.patient_id || '')
        setMeta({
          patient: patientName,
          patientId: computedPatientId,
          caseId: scanData.scan_id || analysisId,
          scanType: scanData.scan_type || 'Medical Scan',
          confidence: scanData.confidence || 0,
          findings: scanData.findings || scanData.aiFindings || 'No analysis results available.',
          status: scanData.aiStatus || scanData.status || 'pending'
        })
        
        setStatus(scanData.aiStatus || scanData.status || 'pending')
        
        // Clear annotations and measurements for now
        setAnnotations([])
        setMeasurements([])
        
      } catch (error) {
        console.error('❌ Error loading analysis data:', error)
        setMeta({
          patient: 'Error Loading',
          caseId: analysisId,
          scanType: 'Unknown',
          confidence: 0,
          findings: 'Error loading analysis data. Please try again.',
          status: 'error'
        })
        setStatus('error')
      } finally {
        setLoading(false)
      }
    }
    
    if (analysisId) load()
  }, [analysisId])

  // Cleanup auto-save timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current)
      }
    }
  }, [])

  // Dataset export function
  const handleExportAnnotations = async () => {
    if (!analysisId) return
    
    try {
      setExporting(true)
      console.log(`📤 Exporting annotations as ${exportFormat} format...`)
      
      const response = await scansAPI.exportAnnotations(analysisId, exportFormat, includeMeasurements)
      const exportData = response.data?.data
      
      if (exportData) {
        // Create downloadable file
        let filename: string
        let contentType: string
        let content: string
        
        switch (exportFormat.toLowerCase()) {
          case 'yolo':
            filename = `annotations_yolo_${analysisId}.txt`
            contentType = 'text/plain'
            // Combine all YOLO files into one
            content = Object.entries(exportData.files)
              .map(([fileName, fileContent]) => `# ${fileName}\n${fileContent}`)
              .join('\n\n')
            break
            
          case 'coco':
            filename = `annotations_coco_${analysisId}.json`
            contentType = 'application/json'
            content = JSON.stringify(exportData, null, 2)
            break
            
          case 'pascal_voc':
            filename = `annotations_pascal_voc_${analysisId}.xml`
            contentType = 'application/xml'
            // Combine all XML files into one
            content = Object.entries(exportData.files)
              .map(([fileName, fileContent]) => `<!-- ${fileName} -->\n${fileContent}`)
              .join('\n\n')
            break
            
          default:
            filename = `annotations_${analysisId}.txt`
            contentType = 'text/plain'
            content = JSON.stringify(exportData, null, 2)
        }
        
        // Create and download file
        const blob = new Blob([content], { type: contentType })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        
        console.log(`✅ Successfully exported ${exportFormat.toUpperCase()} dataset`)
        setShowExportDialog(false)
      }
    } catch (error) {
      console.error('Failed to export annotations:', error)
    } finally {
      setExporting(false)
    }
  }

  const startAnalysis = async () => {
    try {
      console.log('🚀 Starting AI analysis for scan:', analysisId)
      setStatus('processing')
      setPolling(false)

      const response = await api.post(`/api/scans/${analysisId}/analyze`)
      console.log('✅ Analysis started successfully:', response.data)
      
      // Start polling for updates
      setPolling(true)
      
    } catch (error: any) {
      console.error('❌ Failed to start analysis:', error)
      setStatus('failed')
      alert(`Analysis failed: ${error.response?.data?.message || error.message || 'Unknown error'}`)
    }
  }

  // Poll for analysis status updates
  useEffect(() => {
    if (!analysisId || !polling) return
    if (status !== 'processing') return
    
    console.log('🔄 Starting polling for analysis status')
    
    let retryCount = 0
    const maxRetries = 3
    
    const pollInterval = setInterval(async () => {
      try {
        const response = await api.get(`/api/scans/${analysisId}/analysis-status`)
        const data = response.data?.data
        
        if (data?.analysisStatus) {
          setStatus(data.analysisStatus)
          
          // Update metadata with new results
          if (data.confidence !== undefined) {
            setMeta((prev: any) => ({ ...prev, confidence: data.confidence }))
          }
          if (data.findings) {
            setMeta((prev: any) => ({ ...prev, findings: data.findings }))
          }
        }
        
        if (data?.analysisStatus === 'completed' || data?.analysisStatus === 'failed') {
          console.log('✅ Analysis completed, stopping polling')
          clearInterval(pollInterval)
          setPolling(false)
        }
        
        retryCount = 0 // Reset on successful request
        
      } catch (error: any) {
        retryCount++
        console.error(`❌ Error polling analysis status (attempt ${retryCount}/${maxRetries}):`, error)
        
        if (retryCount >= maxRetries) {
          console.error('❌ Max retries reached, marking analysis as failed')
          setStatus('failed')
          clearInterval(pollInterval)
          setPolling(false)
          
          const errorMessage = error.response?.data?.message || error.message || 'Failed to check analysis status'
          alert(`Analysis failed: ${errorMessage}`)
        }
      }
    }, 2000)
    
    return () => {
      console.log('🛑 Cleaning up polling interval')
      clearInterval(pollInterval)
      setPolling(false)
    }
  }, [analysisId, polling, status])

  // Drawing and annotation functions
  const getMousePos = (e: React.MouseEvent) => {
    if (!viewerContainer) return { x: 0, y: 0 }
    const rect = viewerContainer.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
  }

  // Convert screen coordinates to image coordinates
  const screenToImageCoords = (screenX: number, screenY: number) => {
    return {
      x: (screenX - pan.x) / zoom,
      y: (screenY - pan.y) / zoom
    }
  }

  // Convert image coordinates to screen coordinates
  const imageToScreenCoords = (imageX: number, imageY: number) => {
    return {
      x: imageX * zoom + pan.x,
      y: imageY * zoom + pan.y
    }
  }

  const saveToHistory = () => {
    const newState = {
      shapes: [...drawingShapes],
      textAnnotations: [...textAnnotations],
      measurements: [...measurementLines]
    }
    setHistory((prev: any[]) => [...prev.slice(0, historyIndex + 1), newState])
    setHistoryIndex((prev: number) => prev + 1)
  }

  // Initialize history with current state
  useEffect(() => {
    if (history.length === 0) {
      const initialState = {
        shapes: [...drawingShapes],
        textAnnotations: [...textAnnotations],
        measurements: [...measurementLines]
      }
      setHistory([initialState])
      setHistoryIndex(0)
    }
  }, [])

  const undo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1]
      setDrawingShapes(prevState.shapes)
      setTextAnnotations(prevState.textAnnotations)
      setMeasurementLines(prevState.measurements)
      setHistoryIndex((prev: number) => prev - 1)
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1]
      setDrawingShapes(nextState.shapes)
      setTextAnnotations(nextState.textAnnotations)
      setMeasurementLines(nextState.measurements)
      setHistoryIndex((prev: number) => prev + 1)
    }
  }

  // Unified Tool System - Mouse Down Handler
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only handle events for drawing tools, let ImageViewer handle select tool
    if (activeTool === 'select') {
      return // Let ImageViewer handle this
    }
    
    console.log('Mouse down event, activeTool:', activeTool)
    e.preventDefault()
    e.stopPropagation()
    
    const pos = getMousePos(e)
    const color = labels.find(l => l.id === activeLabel)?.color || '#ff0000'

    // Update tool state
    setToolState(prev => ({
      ...prev,
      isDrawing: true,
      startPoint: pos,
      lastPoint: pos
    }))

    // Handle different tool types
    switch (activeTool) {
      case 'brush':
        // Initialize image canvas if not already done
        if (!imageCanvas) {
          initializeImageCanvas()
        }
        
        // Apply brush effect
        const brushColor = labels.find(l => l.id === activeLabel)?.color || '#ff0000'
        applyBrushEffect(pos.x, pos.y, brushSize, brushColor, overlayOpacity / 100)
        break


      case 'rectangle':
      case 'ellipse':
      case 'polygon':
      case 'lasso':
      case 'length':
        setToolState(prev => ({
          ...prev,
          currentShape: {
            type: activeTool,
            start: pos,
            end: pos,
            points: [pos],
            color,
            opacity: overlayOpacity / 100
          }
        }))
        break

      case 'marker':
        const newMarker = {
          id: Date.now(),
          type: 'marker',
          x: pos.x,
          y: pos.y,
          color
        }
        setDrawingShapes((prev: any[]) => [...prev, newMarker])
        saveToHistory()
        // No automatic label prompt for markers
        break

      case 'text':
        setModalType('text')
        setModalPosition(pos)
        setModalText('')
        setShowTextModal(true)
        break

      case 'comment':
        setModalType('comment')
        setModalPosition(pos)
        setModalText('')
        setShowTextModal(true)
        break

      case 'arrow':
        setToolState(prev => ({
          ...prev,
          currentShape: {
            type: 'arrow',
            start: pos,
            end: pos,
            color
          }
        }))
        break


      case 'polyline':
        setToolState(prev => ({
          ...prev,
          currentMeasurement: {
            type: 'polyline',
            points: [pos],
            color: '#00ff00'
          }
        }))
        break

      case 'threshold':
        // Initialize image canvas if not already done
        if (!imageCanvas) {
          initializeImageCanvas()
        }
        
        // Apply threshold effect
        const thresholdValue = 30 // Default threshold
        applyThresholdEffect(pos.x, pos.y, thresholdValue)
        break

      case 'regionGrow':
        // Initialize image canvas if not already done
        if (!imageCanvas) {
          initializeImageCanvas()
        }
        
        // Apply region growing effect
        const tolerance = 50 // Default tolerance
        applyRegionGrowEffect(pos.x, pos.y, tolerance)
        break

      case 'fill':
        // Initialize image canvas if not already done
        if (!imageCanvas) {
          initializeImageCanvas()
        }
        
        // Apply fill effect
        const fillColor = labels.find(l => l.id === activeLabel)?.color || '#ff0000'
        applyFillEffect(pos.x, pos.y, fillColor)
        break

      case 'smooth':
        // Initialize image canvas if not already done
        if (!imageCanvas) {
          initializeImageCanvas()
        }
        
        // Apply smooth effect
        const smoothRadius = brushSize * 2
        applySmoothEffect(pos.x, pos.y, smoothRadius)
        break

      case 'interpolate':
        // Initialize image canvas if not already done
        if (!imageCanvas) {
          initializeImageCanvas()
        }
        
        // Apply interpolate effect
        const interpolateRadius = brushSize * 3
        applyInterpolateEffect(pos.x, pos.y, interpolateRadius)
        break

        case 'ellipseStats':
          // Ellipse statistics - start drawing ellipse
          console.log('Ellipse Stats tool selected, starting to draw at:', pos)
          setToolState(prev => ({
            ...prev,
            isDrawing: true,
            currentShape: {
              type: 'ellipse',
              start: pos,
              end: pos,
              color: '#00ffff'
            }
          }))
          break

      case 'probe':
        // Probe tool - click to get pixel value
        const probeValue = getPixelValue(pos.x, pos.y)
        const newProbe = {
          id: Date.now(),
          type: 'probe',
          x: pos.x,
          y: pos.y,
          pixelValue: probeValue,
          formattedValue: `${probeValue.toFixed(1)} HU`,
          color: '#ff00ff',
          timestamp: new Date().toISOString()
        }
        setMeasurementResults(prev => [...prev, newProbe])
        saveToHistory()
        break

      case 'volume':
        // Volume tool - click to calculate volume
        const volumeValue = getPixelValue(pos.x, pos.y)
        const newVolume = {
          id: Date.now(),
          type: 'volume',
          x: pos.x,
          y: pos.y,
          pixelValue: volumeValue,
          formattedValue: `${volumeValue.toFixed(1)} HU`,
          color: '#8800ff',
          timestamp: new Date().toISOString()
        }
        setMeasurementResults(prev => [...prev, newVolume])
        saveToHistory()
        break

      default:
        // For unimplemented tools, just log
        console.log(`Tool ${activeTool} not yet implemented`)
        break
    }
  }

  // Unified Tool System - Mouse Move Handler
  const handleMouseMove = (e: React.MouseEvent) => {
    // Only handle events for drawing tools, let ImageViewer handle select tool
    if (activeTool === 'select') {
      return // Let ImageViewer handle this
    }
    
    e.preventDefault()
    e.stopPropagation()
    
    const pos = getMousePos(e)

    // Update last point
    setToolState(prev => ({
      ...prev,
      lastPoint: pos
    }))

    // Handle different tool types during drawing
    if (toolState.isDrawing) {
      switch (activeTool) {
        case 'brush':
          // Apply brush effect during mouse move
          if (!imageCanvas) {
            initializeImageCanvas()
          }
          const brushColor = labels.find(l => l.id === activeLabel)?.color || '#ff0000'
          applyBrushEffect(pos.x, pos.y, brushSize, brushColor, overlayOpacity / 100)
          break

        case 'rectangle':
        case 'ellipse':
        case 'length':
        case 'arrow':
          setToolState(prev => ({
            ...prev,
            currentShape: {
              ...prev.currentShape,
              end: pos
            }
          }))
          break

        case 'ellipseStats':
          // Ellipse statistics tool - update ellipse shape during drawing
          console.log('Ellipse Stats tool, updating ellipse during drag:', pos)
          setToolState(prev => ({
            ...prev,
            currentShape: {
              ...prev.currentShape,
              end: pos
            }
          }))
          break

        case 'polygon':
        case 'lasso':
          setToolState(prev => ({
            ...prev,
            currentShape: {
              ...prev.currentShape,
              points: [...prev.currentShape.points, pos]
            }
          }))
          break


        case 'polyline':
          setToolState(prev => ({
            ...prev,
            currentMeasurement: {
              ...prev.currentMeasurement,
              points: [...prev.currentMeasurement.points, pos]
            }
          }))
          break
      }
    }
    
    // Handle polyline tool that doesn't use isDrawing
    if (activeTool === 'polyline' && toolState.currentMeasurement) {
      setToolState(prev => ({
        ...prev,
        currentMeasurement: {
          ...prev.currentMeasurement,
          points: [...prev.currentMeasurement.points, pos]
        }
      }))
    }
  }

  // Unified Tool System - Mouse Up Handler
  const handleMouseUp = (e: React.MouseEvent) => {
    // Only handle events for drawing tools, let ImageViewer handle select tool
    if (activeTool === 'select') {
      return // Let ImageViewer handle this
    }
    
    e.preventDefault()
    e.stopPropagation()

    if (toolState.isDrawing) {
      switch (activeTool) {
        case 'brush':
          // Brush tool doesn't need to save path - effects are applied directly to image
          break

        case 'rectangle':
        console.log('Rectangle mouse up triggered, activeTool:', activeTool, 'currentShape:', toolState.currentShape)
        if (toolState.currentShape) {
          // Calculate detailed rectangle coordinates
          const minX = Math.min(toolState.currentShape.start.x, toolState.currentShape.end.x)
          const maxX = Math.max(toolState.currentShape.start.x, toolState.currentShape.end.x)
          const minY = Math.min(toolState.currentShape.start.y, toolState.currentShape.end.y)
          const maxY = Math.max(toolState.currentShape.start.y, toolState.currentShape.end.y)
          
          const newShape = {
            ...toolState.currentShape,
            id: Date.now(),
            // Enhanced coordinate data for dataset creation
            coordinates: {
              // Corner points
              topLeft: { x: minX, y: minY },
              topRight: { x: maxX, y: minY },
              bottomLeft: { x: minX, y: maxY },
              bottomRight: { x: maxX, y: maxY },
              // Center point
              center: { 
                x: (minX + maxX) / 2, 
                y: (minY + maxY) / 2 
              },
              // Dimensions
              width: maxX - minX,
              height: maxY - minY,
              // Bounding box (min-max format)
              bounds: {
                minX, maxX, minY, maxY
              },
              // Normalized coordinates (0-1 range)
              normalized: {
                topLeft: { X: minX / (currentImageDimensions?.width || 1), Y: minY / (currentImageDimensions?.height || 1) },
                topRight: { X: maxX / (currentImageDimensions?.width || 1), Y: minY / (currentImageDimensions?.height || 1) },
                bottomLeft: { X: minX / (currentImageDimensions?.width || 1), Y: maxY / (currentImageDimensions?.height || 1) },
                bottomRight: { X: maxX / (currentImageDimensions?.width || 1), Y: maxY / (currentImageDimensions?.height || 1) },
                center: { X: ((minX + maxX) / 2) / (currentImageDimensions?.width || 1), Y: ((minY + maxY) / 2) / (currentImageDimensions?.height || 1) },
                width: (maxX - minX) / (currentImageDimensions?.width || 1),
                height: (maxY - minY) / (currentImageDimensions?.height || 1)
              }
            },
            // Image metadata
            imageSize: currentImageDimensions,
            createdAt: new Date().toISOString()
          }

          // Validate ROI before creating
          console.log('Validating rectangle ROI:', newShape)
          const isValid = validateROI(newShape)
          console.log('Rectangle ROI validation result:', isValid)
          if (isValid) {
            // Regular rectangle ROI
            setDrawingShapes((prev: any[]) => [...prev, newShape])
            saveToHistory()
            
            // Automatically prompt for label
            setSelectedShapeForLabel(newShape)
            setModalType('roi-label')
            setModalText('')
            setShowTextModal(true)
          } else {
            // Show feedback for invalid ROI
            setValidationMessage('ROI too small. Please draw a larger area (minimum 20x20 pixels).')
            setShowValidationMessage(true)
            setTimeout(() => setShowValidationMessage(false), 3000)
          }
        }
        break

      case 'ellipse':
        console.log('Ellipse mouse up triggered, activeTool:', activeTool, 'currentShape:', toolState.currentShape)
        if (toolState.currentShape) {
          // Calculate detailed ellipse coordinates
          const centerX = (toolState.currentShape.start.x + toolState.currentShape.end.x) / 2
          const centerY = (toolState.currentShape.start.y + toolState.currentShape.end.y) / 2
          const radiusX = Math.abs(toolState.currentShape.end.x - toolState.currentShape.start.x) / 2
          const radiusY = Math.abs(toolState.currentShape.end.y - toolState.currentShape.start.y) / 2
          
          const minX = centerX - radiusX
          const maxX = centerX + radiusX
          const minY = centerY - radiusY
          const maxY = centerY + radiusY
          
          const newShape = {
            ...toolState.currentShape,
            id: Date.now(),
            // Enhanced coordinate data for dataset creation
            coordinates: {
              // Center and radii
              center: { x: centerX, y: centerY },
              radiusX: radiusX,
              radiusY: radiusY,
              // Bounding box
              bounds: {
                minX, maxX, minY, maxY
              },
              // Corner points of bounding box
              topLeft: { x: minX, y: minY },
              topRight: { x: maxX, y: minY },
              bottomLeft: { x: minX, y: maxY },
              bottomRight: { x: maxX, y: maxY },
              // Dimensions
              width: maxX - minX,
              height: maxY - minY,
              // Normalized coordinates (0-1 range)
              normalized: {
                center: { X: centerX / (currentImageDimensions?.width || 1), Y: centerY / (currentImageDimensions?.height || 1) },
                radiusX: radiusX / (currentImageDimensions?.width || 1),
                radiusY: radiusY / (currentImageDimensions?.height || 1),
                topLeft: { X: minX / (currentImageDimensions?.width || 1), Y: minY / (currentImageDimensions?.height || 1) },
                topRight: { X: maxX / (currentImageDimensions?.width || 1), Y: minY / (currentImageDimensions?.height || 1) },
                bottomLeft: { X: minX / (currentImageDimensions?.width || 1), Y: maxY / (currentImageDimensions?.height || 1) },
                bottomRight: { X: maxX / (currentImageDimensions?.width || 1), Y: maxY / (currentImageDimensions?.height || 1) },
                width: (maxX - minX) / (currentImageDimensions?.width || 1),
                height: (maxY - minY) / (currentImageDimensions?.height || 1)
              }
            },
            // Image metadata
            imageSize: currentImageDimensions,
            createdAt: new Date().toISOString()
          }

          // Validate ROI before creating
          console.log('Validating ellipse ROI:', newShape)
          const isValid = validateROI(newShape)
          console.log('Ellipse ROI validation result:', isValid)
          if (isValid) {
            // Check if this ellipse was drawn with the ellipseStats tool
            if (activeTool === 'ellipse') {
              console.log('Processing ellipseStats tool in mouse up')
                // Calculate ellipse statistics
                const centerX = (newShape.start.x + newShape.end.x) / 2
                const centerY = (newShape.start.y + newShape.end.y) / 2
                const radiusX = Math.abs(newShape.end.x - newShape.start.x) / 2
                const radiusY = Math.abs(newShape.end.y - newShape.start.y) / 2
                
                console.log('Creating ellipse measurement:', { centerX, centerY, radiusX, radiusY })
                
                const stats = calculateEllipseStats({ x: centerX, y: centerY }, radiusX, radiusY)
                
                const ellipseMeasurement = {
                  id: Date.now(),
                  type: 'ellipseStats',
                  center: { x: centerX, y: centerY },
                  radiusX: radiusX,
                  radiusY: radiusY,
                  area: stats.area,
                  circumference: stats.circumference,
                  majorAxis: stats.majorAxis,
                  minorAxis: stats.minorAxis,
                  eccentricity: stats.eccentricity,
                  color: newShape.color,
                  timestamp: new Date().toISOString()
                }
                
                console.log('Adding ellipse measurement to state:', ellipseMeasurement)
                setMeasurementLines((prev: any[]) => {
                  const newLines = [...prev, ellipseMeasurement]
                  console.log('Updated measurementLines (length):', newLines.length, 'measurements')
                  console.log('measurementLines after addition:', newLines)
                  return newLines
                })
                setMeasurementResults(prev => [...prev, ellipseMeasurement])
                saveToHistory()
                
                console.log('Ellipse measurement added to measurementLines and measurementResults')
              } else {
                // Regular ellipse ROI
                setDrawingShapes((prev: any[]) => [...prev, newShape])
                saveToHistory()
                
                // Automatically prompt for label
                setSelectedShapeForLabel(newShape)
                setModalType('roi-label')
                setModalText('')
                setShowTextModal(true)
              }
            } else {
              // Show feedback for invalid ROI
              setValidationMessage('ROI too small. Please draw a larger area (minimum 20x20 pixels).')
              setShowValidationMessage(true)
              setTimeout(() => setShowValidationMessage(false), 3000)
            }
          }
          break

        case 'length':
          if (toolState.currentShape) {
            const newShape = {
              ...toolState.currentShape,
              id: Date.now()
            }
            
            // Calculate distance for length measurement
            const distance = calculateDistance(newShape.start, newShape.end)
            const measurement = {
              id: Date.now(),
              type: 'length',
              start: newShape.start,
              end: newShape.end,
              distance: distance,
              formattedDistance: formatMeasurement(distance),
              color: newShape.color,
              timestamp: new Date().toISOString()
            }
            
            // Validate measurement before creating
            if (distance >= MIN_DISTANCE) {
              setMeasurementLines((prev: any[]) => [...prev, measurement])
              setMeasurementResults(prev => [...prev, measurement])
              saveToHistory()
            } else {
              setValidationMessage('Measurement too short. Please draw a longer line (minimum 15 pixels).')
              setShowValidationMessage(true)
              setTimeout(() => setShowValidationMessage(false), 3000)
            }
          }
          break

        case 'arrow':
          if (toolState.currentShape) {
            const newShape = {
              ...toolState.currentShape,
              id: Date.now()
            }
            
            // Validate ROI before creating
            if (validateROI(newShape)) {
              setDrawingShapes((prev: any[]) => [...prev, newShape])
              saveToHistory()
              // No automatic label prompt for arrows
            } else {
              // Show feedback for invalid ROI
              setValidationMessage('Arrow too short. Please draw a longer arrow (minimum 15 pixels).')
              setShowValidationMessage(true)
              setTimeout(() => setShowValidationMessage(false), 3000)
            }
          }
          break

        case 'polygon':
        case 'lasso':
          if (toolState.currentShape && toolState.currentShape.points.length > 2) {
            // Calculate detailed polygon coordinates
            const points = toolState.currentShape.points
            const xs = points.map((p: any) => p.x)
            const ys = points.map((p: any) => p.y)
            const minX = Math.min(...xs)
            const maxX = Math.max(...xs)
            const minY = Math.min(...ys)
            const maxY = Math.max(...ys)
            
            // Calculate polygon area
            let area = 0
            for (let i = 0; i < points.length; i++) {
              const j = (i + 1) % points.length
              area += (points[i].x * points[j].y - points[j].x * points[i].y)
            }
            area = Math.abs(area) / 2
            
            const newShape = {
              ...toolState.currentShape,
              id: Date.now(),
              // Enhanced coordinate data for dataset creation
              coordinates: {
                // All polygon points
                points: points,
                // Bounding box of polygon
                bounds: { minX, maxX, minY, maxY },
                // Center of mass (approximate)
                center: {
                  x: points.reduce((sum: number, p: any) => sum + p.x, 0) / points.length,
                  y: points.reduce((sum: number, p: any) => sum + p.y, 0) / points.length
                },
                // Dimensions of bounding box
                width: maxX - minX,
                height: maxY - minY,
                // Polygon area
                area: area,
                // Number of points
                pointCount: points.length,
                // Normalized coordinates (0-1 range)
                normalized: {
                  points: points.map((p: any) => ({
                    X: p.x / (currentImageDimensions?.width || 1),
                    Y: p.y / (currentImageDimensions?.height || 1)
                  })),
                  bounds: {
                    minX: minX / (currentImageDimensions?.width || 1),
                    maxX: maxX / (currentImageDimensions?.width || 1),
                    minY: minY / (currentImageDimensions?.height || 1),
                    maxY: maxY / (currentImageDimensions?.height || 1)
                  },
                  center: {
                    X: (points.reduce((sum: number, p: any) => sum + p.x, 0) / points.length) / (currentImageDimensions?.width || 1),
                    Y: (points.reduce((sum: number, p: any) => sum + p.y, 0) / points.length) / (currentImageDimensions?.height || 1)
                  },
                  width: (maxX - minX) / (currentImageDimensions?.width || 1),
                  height: (maxY - minY) / (currentImageDimensions?.height || 1),
                  area: area / ((currentImageDimensions?.width || 1) * (currentImageDimensions?.height || 1))
                }
              },
              // Image metadata
              imageSize: currentImageDimensions,
              createdAt: new Date().toISOString()
            }
            
            // Validate ROI before creating
            if (validateROI(newShape)) {
              setDrawingShapes((prev: any[]) => [...prev, newShape])
              saveToHistory()
              
              // Automatically prompt for label
              setSelectedShapeForLabel(newShape)
              setModalType('roi-label')
              setModalText('')
              setShowTextModal(true)
            } else {
              // Show feedback for invalid ROI
              setValidationMessage('ROI too small. Please draw a larger area with more meaningful shape.')
              setShowValidationMessage(true)
              setTimeout(() => setShowValidationMessage(false), 3000)
            }
          }
          break


        case 'polyline':
          if (toolState.currentMeasurement && toolState.currentMeasurement.points.length > 1) {
            const newMeasurement = {
              ...toolState.currentMeasurement,
              id: Date.now()
            }
            
            // Calculate total length for polyline measurement
            let totalLength = 0
            for (let i = 0; i < newMeasurement.points.length - 1; i++) {
              totalLength += calculateDistance(newMeasurement.points[i], newMeasurement.points[i + 1])
            }
            
            const measurement = {
              ...newMeasurement,
              totalLength: totalLength,
              formattedLength: formatMeasurement(totalLength)
            }
            
            // Validate measurement before creating
            if (totalLength >= MIN_DISTANCE) {
              setMeasurementLines((prev: any[]) => [...prev, measurement])
              setMeasurementResults(prev => [...prev, measurement])
              saveToHistory()
            } else {
              // Show feedback for invalid measurement
              setValidationMessage('Polyline too short. Please draw a longer polyline.')
              setShowValidationMessage(true)
              setTimeout(() => setShowValidationMessage(false), 3000)
            }
          }
          break
      }

      // Reset tool state (reset currentShape for all tools - measurements persist via measurementLines)
      setToolState(prev => ({
        ...prev,
        isDrawing: false,
        currentPath: [],
        currentShape: null,
        currentMeasurement: null
      }))
    }
  }


  const handleWheel = (e: React.WheelEvent) => {
    // Only handle wheel events for drawing tools, let ImageViewer handle select tool
    if (activeTool === 'select') {
      return // Let ImageViewer handle this
    }
    
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setZoom(prev => Math.max(0.1, Math.min(5, prev * delta)))
  }

  const resetView = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  const exportAnnotations = () => {
    const data = {
      shapes: drawingShapes,
      textAnnotations,
      measurements: measurementLines,
      metadata: {
        patient: meta?.patient,
        caseId: meta?.caseId,
        exportDate: new Date().toISOString()
      }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `annotations-${meta?.caseId || analysisId}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportReport = () => {
    const blob = new Blob([meta?.findings || ''], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analysis-${analysisId}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Modal handlers
  const handleModalSubmit = () => {
    if (modalText.trim()) {
      const color = labels.find(l => l.id === activeLabel)?.color || '#ff0000'
      
      if (modalType === 'text') {
        const newText = {
          id: Date.now(),
          type: 'text',
          x: modalPosition.x,
          y: modalPosition.y,
          text: modalText.trim(),
          color
        }
        setTextAnnotations((prev: any[]) => [...prev, newText])
      } else if (modalType === 'comment') {
        const newComment = {
          id: Date.now(),
          type: 'comment',
          x: modalPosition.x,
          y: modalPosition.y,
          text: modalText.trim(),
          color: '#ffff00',
          timestamp: new Date().toISOString()
        }
        setTextAnnotations((prev: any[]) => [...prev, newComment])
      } else if (modalType === 'roi-label' && selectedShapeForLabel) {
        // Update the shape with the new label
        setDrawingShapes((prev: any[]) => prev.map(shape => 
          shape.id === selectedShapeForLabel.id 
            ? { ...shape, label: modalText.trim() }
            : shape
        ))
      }
      
      saveToHistory()
    }
    
    setShowTextModal(false)
    setModalText('')
    setSelectedShapeForLabel(null)
  }

  const handleModalCancel = () => {
    setShowTextModal(false)
    setModalText('')
    setSelectedShapeForLabel(null)
  }

  const handleModalKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleModalSubmit()
    } else if (e.key === 'Escape') {
      handleModalCancel()
    }
  }

  // Annotation selection and deletion
  const handleAnnotationClick = (e: React.MouseEvent, id: string, type: 'shape' | 'text' | 'measurement') => {
    e.stopPropagation()
    
    // Completely prevent double-click events
    if (e.detail > 1) {
      e.preventDefault()
      e.stopPropagation()
      return
    }
    
    setSelectedAnnotation(id)
    setSelectedAnnotationType(type)
  }

  // Double-click functionality removed - labels are now automatically prompted on ROI creation

  // ROI validation constants
  const MIN_ROI_SIZE = 20 // Minimum width/height in pixels
  const MIN_DISTANCE = 15 // Minimum distance between points
  const MIN_POLYGON_POINTS = 3 // Minimum points for polygon/lasso
  const MIN_POLYGON_AREA = 100 // Minimum area for polygon/lasso (pixels squared)

  // Calculate polygon area using shoelace formula
  const calculatePolygonArea = (points: any[]): number => {
    if (points.length < 3) return 0
    
    let area = 0
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length
      area += points[i].x * points[j].y
      area -= points[j].x * points[i].y
    }
    return Math.abs(area) / 2
  }

  // Check if polygon has meaningful area (not just a line or dot)
  const hasValidPolygonArea = (points: any[]): boolean => {
    if (points.length < 3) return false
    
    // Calculate bounding box
    const xs = points.map(p => p.x)
    const ys = points.map(p => p.y)
    const minX = Math.min(...xs)
    const maxX = Math.max(...xs)
    const minY = Math.min(...ys)
    const maxY = Math.max(...ys)
    
    const width = maxX - minX
    const height = maxY - minY
    
    // Must have reasonable dimensions
    if (width < 10 || height < 10) return false
    
    // Calculate actual polygon area
    const area = calculatePolygonArea(points)
    return area >= MIN_POLYGON_AREA
  }

  // Validate ROI shape before creation
  const validateROI = (shape: any): boolean => {
    switch (shape.type) {
      case 'rectangle':
      case 'ellipse':
      case 'length':
        const width = Math.abs(shape.end.x - shape.start.x)
        const height = Math.abs(shape.end.y - shape.start.y)
        console.log(`ROI validation - Type: ${shape.type}, Width: ${width}, Height: ${height}, MIN_ROI_SIZE: ${MIN_ROI_SIZE}`)
        const isValid = width >= MIN_ROI_SIZE && height >= MIN_ROI_SIZE
        console.log(`ROI validation result: ${isValid}`)
        return isValid

      case 'polygon':
      case 'lasso':
        if (shape.points.length < MIN_POLYGON_POINTS) return false
        
        // Check for meaningful area instead of strict distance
        return hasValidPolygonArea(shape.points)

      case 'arrow':
        const arrowDistance = Math.sqrt(
          Math.pow(shape.end.x - shape.start.x, 2) + 
          Math.pow(shape.end.y - shape.start.y, 2)
        )
        return arrowDistance >= MIN_DISTANCE

      case 'marker':
        // Markers are always valid (single point)
        return true

      default:
        return true
    }
  }

  // Image Processing Functions
  const initializeImageCanvas = () => {
    // Find the image element in the ImageViewer
    const imageElement = document.querySelector('img') as HTMLImageElement
    if (!imageElement) return
    
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    canvas.width = imageElement.naturalWidth || imageElement.width
    canvas.height = imageElement.naturalHeight || imageElement.height
    
    // Draw the image onto the canvas
    ctx.drawImage(imageElement, 0, 0)
    
    // Store original image data for restoration
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    
    setImageCanvas(canvas)
    setImageContext(ctx)
    setOriginalImageData(imageData)
  }

  const applyBrushEffect = (x: number, y: number, radius: number, color: string, opacity: number) => {
    if (!imageContext || !imageCanvas) return
    
    const ctx = imageContext
    ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = opacity
    
    // Create brush effect with soft edges
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
    gradient.addColorStop(0, color)
    gradient.addColorStop(1, 'transparent')
    
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fill()
    
    // Update the displayed image
    const imageElement = document.querySelector('img') as HTMLImageElement
    if (imageElement) {
      imageElement.src = imageCanvas.toDataURL()
    }
  }


  const applyThresholdEffect = (x: number, y: number, threshold: number) => {
    if (!imageContext || !imageCanvas) return
    
    const ctx = imageContext
    const imageData = ctx.getImageData(0, 0, imageCanvas.width, imageCanvas.height)
    const data = imageData.data
    
    // Get pixel value at click point
    const pixelIndex = (Math.floor(y) * imageCanvas.width + Math.floor(x)) * 4
    const r = data[pixelIndex]
    const g = data[pixelIndex + 1]
    const b = data[pixelIndex + 2]
    const intensity = (r + g + b) / 3
    
    // Apply threshold to similar pixels
    for (let i = 0; i < data.length; i += 4) {
      const pixelIntensity = (data[i] + data[i + 1] + data[i + 2]) / 3
      if (Math.abs(pixelIntensity - intensity) <= threshold) {
        data[i] = 255     // R
        data[i + 1] = 0   // G
        data[i + 2] = 0   // B
        data[i + 3] = 255 // A
      }
    }
    
    ctx.putImageData(imageData, 0, 0)
    
    // Update the displayed image
    const imageElement = document.querySelector('img') as HTMLImageElement
    if (imageElement) {
      imageElement.src = imageCanvas.toDataURL()
    }
  }

  const applyRegionGrowEffect = (x: number, y: number, tolerance: number) => {
    if (!imageContext || !imageCanvas) return
    
    const ctx = imageContext
    const imageData = ctx.getImageData(0, 0, imageCanvas.width, imageCanvas.height)
    const data = imageData.data
    const width = imageCanvas.width
    const height = imageCanvas.height
    
    // Get seed pixel
    const seedIndex = (Math.floor(y) * width + Math.floor(x)) * 4
    const seedR = data[seedIndex]
    const seedG = data[seedIndex + 1]
    const seedB = data[seedIndex + 2]
    
    // Flood fill algorithm
    const visited = new Set<number>()
    const queue = [{ x: Math.floor(x), y: Math.floor(y) }]
    
    while (queue.length > 0) {
      const { x: px, y: py } = queue.shift()!
      const index = (py * width + px) * 4
      
      if (px < 0 || px >= width || py < 0 || py >= height || visited.has(index)) continue
      visited.add(index)
      
      const r = data[index]
      const g = data[index + 1]
      const b = data[index + 2]
      
      // Check if pixel is within tolerance
      const distance = Math.sqrt(
        Math.pow(r - seedR, 2) + 
        Math.pow(g - seedG, 2) + 
        Math.pow(b - seedB, 2)
      )
      
      if (distance <= tolerance) {
        // Mark pixel
        data[index] = 0     // R
        data[index + 1] = 255   // G
        data[index + 2] = 0   // B
        data[index + 3] = 255 // A
        
        // Add neighbors to queue
        queue.push({ x: px + 1, y: py })
        queue.push({ x: px - 1, y: py })
        queue.push({ x: px, y: py + 1 })
        queue.push({ x: px, y: py - 1 })
      }
    }
    
    ctx.putImageData(imageData, 0, 0)
    
    // Update the displayed image
    const imageElement = document.querySelector('img') as HTMLImageElement
    if (imageElement) {
      imageElement.src = imageCanvas.toDataURL()
    }
  }

  const applyFillEffect = (x: number, y: number, fillColor: string) => {
    if (!imageContext || !imageCanvas) return
    
    const ctx = imageContext
    const imageData = ctx.getImageData(0, 0, imageCanvas.width, imageCanvas.height)
    const data = imageData.data
    const width = imageCanvas.width
    const height = imageCanvas.height
    
    // Get target color
    const targetIndex = (Math.floor(y) * width + Math.floor(x)) * 4
    const targetR = data[targetIndex]
    const targetG = data[targetIndex + 1]
    const targetB = data[targetIndex + 2]
    
    // Parse fill color
    const fillR = parseInt(fillColor.slice(1, 3), 16)
    const fillG = parseInt(fillColor.slice(3, 5), 16)
    const fillB = parseInt(fillColor.slice(5, 7), 16)
    
    // Flood fill
    const visited = new Set<number>()
    const queue = [{ x: Math.floor(x), y: Math.floor(y) }]
    
    while (queue.length > 0) {
      const { x: px, y: py } = queue.shift()!
      const index = (py * width + px) * 4
      
      if (px < 0 || px >= width || py < 0 || py >= height || visited.has(index)) continue
      visited.add(index)
      
      const r = data[index]
      const g = data[index + 1]
      const b = data[index + 2]
      
      // Check if pixel matches target color
      if (r === targetR && g === targetG && b === targetB) {
        data[index] = fillR
        data[index + 1] = fillG
        data[index + 2] = fillB
        
        // Add neighbors to queue
        queue.push({ x: px + 1, y: py })
        queue.push({ x: px - 1, y: py })
        queue.push({ x: px, y: py + 1 })
        queue.push({ x: px, y: py - 1 })
      }
    }
    
    ctx.putImageData(imageData, 0, 0)
    
    // Update the displayed image
    const imageElement = document.querySelector('img') as HTMLImageElement
    if (imageElement) {
      imageElement.src = imageCanvas.toDataURL()
    }
  }

  const applySmoothEffect = (x: number, y: number, radius: number) => {
    if (!imageContext || !imageCanvas) return
    
    const ctx = imageContext
    const imageData = ctx.getImageData(0, 0, imageCanvas.width, imageCanvas.height)
    const data = imageData.data
    const width = imageCanvas.width
    const height = imageCanvas.height
    
    // Apply Gaussian blur in the specified region
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const px = Math.floor(x + dx)
        const py = Math.floor(y + dy)
        
        if (px >= 0 && px < width && py >= 0 && py < height) {
          const distance = Math.sqrt(dx * dx + dy * dy)
          if (distance <= radius) {
            const index = (py * width + px) * 4
            
            // Simple smoothing (average with neighbors)
            let r = 0, g = 0, b = 0, count = 0
            
            for (let sy = -1; sy <= 1; sy++) {
              for (let sx = -1; sx <= 1; sx++) {
                const spx = px + sx
                const spy = py + sy
                if (spx >= 0 && spx < width && spy >= 0 && spy < height) {
                  const sindex = (spy * width + spx) * 4
                  r += data[sindex]
                  g += data[sindex + 1]
                  b += data[sindex + 2]
                  count++
                }
              }
            }
            
            data[index] = r / count
            data[index + 1] = g / count
            data[index + 2] = b / count
          }
        }
      }
    }
    
    ctx.putImageData(imageData, 0, 0)
    
    // Update the displayed image
    const imageElement = document.querySelector('img') as HTMLImageElement
    if (imageElement) {
      imageElement.src = imageCanvas.toDataURL()
    }
  }

  const applyInterpolateEffect = (x: number, y: number, radius: number) => {
    if (!imageContext || !imageCanvas) return
    
    const ctx = imageContext
    const imageData = ctx.getImageData(0, 0, imageCanvas.width, imageCanvas.height)
    const data = imageData.data
    const width = imageCanvas.width
    const height = imageCanvas.height
    
    // Find edge pixels in the region
    const edgePixels: { x: number; y: number; r: number; g: number; b: number }[] = []
    
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const px = Math.floor(x + dx)
        const py = Math.floor(y + dy)
        
        if (px >= 0 && px < width && py >= 0 && py < height) {
          const distance = Math.sqrt(dx * dx + dy * dy)
          if (distance <= radius) {
            const index = (py * width + px) * 4
            
            // Simple edge detection (gradient)
            const centerR = data[index]
            const centerG = data[index + 1]
            const centerB = data[index + 2]
            
            let maxDiff = 0
            for (let sy = -1; sy <= 1; sy++) {
              for (let sx = -1; sx <= 1; sx++) {
                if (sx === 0 && sy === 0) continue
                const spx = px + sx
                const spy = py + sy
                if (spx >= 0 && spx < width && spy >= 0 && spy < height) {
                  const sindex = (spy * width + spx) * 4
                  const diff = Math.abs(data[sindex] - centerR) + 
                              Math.abs(data[sindex + 1] - centerG) + 
                              Math.abs(data[sindex + 2] - centerB)
                  maxDiff = Math.max(maxDiff, diff)
                }
              }
            }
            
            if (maxDiff > 50) { // Edge threshold
              edgePixels.push({ x: px, y: py, r: centerR, g: centerG, b: centerB })
            }
          }
        }
      }
    }
    
    // Interpolate between edge pixels
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const px = Math.floor(x + dx)
        const py = Math.floor(y + dy)
        
        if (px >= 0 && px < width && py >= 0 && py < height) {
          const distance = Math.sqrt(dx * dx + dy * dy)
          if (distance <= radius) {
            const index = (py * width + px) * 4
            
            // Find closest edge pixels
            let minDist1 = Infinity, minDist2 = Infinity
            let closest1 = edgePixels[0], closest2 = edgePixels[0]
            
            for (const edge of edgePixels) {
              const dist = Math.sqrt(Math.pow(edge.x - px, 2) + Math.pow(edge.y - py, 2))
              if (dist < minDist1) {
                minDist2 = minDist1
                closest2 = closest1
                minDist1 = dist
                closest1 = edge
              } else if (dist < minDist2) {
                minDist2 = dist
                closest2 = edge
              }
            }
            
            if (closest1 && closest2) {
              // Interpolate between the two closest edge pixels
              const totalDist = minDist1 + minDist2
              const weight1 = minDist2 / totalDist
              const weight2 = minDist1 / totalDist
              
              data[index] = closest1.r * weight1 + closest2.r * weight2
              data[index + 1] = closest1.g * weight1 + closest2.g * weight2
              data[index + 2] = closest1.b * weight1 + closest2.b * weight2
            }
          }
        }
      }
    }
    
    ctx.putImageData(imageData, 0, 0)
    
    // Update the displayed image
    const imageElement = document.querySelector('img') as HTMLImageElement
    if (imageElement) {
      imageElement.src = imageCanvas.toDataURL()
    }
  }

  // Measurement Functions
  const calculateDistance = (point1: any, point2: any): number => {
    const dx = point2.x - point1.x
    const dy = point2.y - point1.y
    return Math.sqrt(dx * dx + dy * dy)
  }

  const convertToUnit = (pixels: number): number => {
    // Ensure pixelToMmRatio is valid
    const ratio = Math.max(0.01, Math.min(1000, pixelToMmRatio)) || 1
    
    switch (measurementUnit) {
      case 'mm':
        return pixels / ratio // Convert pixels to mm
      case 'cm':
        return (pixels / ratio) / 10 // Convert pixels to cm
      default:
        return pixels
    }
  }

  const formatMeasurement = (pixels: number): string => {
    const value = convertToUnit(pixels)
    const unit = measurementUnit === 'pixels' ? 'px' : measurementUnit
    
    // Format with appropriate precision based on unit
    let formatted: string
    if (measurementUnit === 'pixels') {
      formatted = value.toFixed(0) // Whole numbers for pixels
    } else if (value >= 1000) {
      formatted = value.toFixed(0) // Whole numbers for large values
    } else if (value >= 100) {
      formatted = value.toFixed(1) // 1 decimal for hundreds
    } else if (value >= 10) {
      formatted = value.toFixed(2) // 2 decimals for tens
    } else {
      formatted = value.toFixed(3) // 3 decimals for small values
    }
    
    return `${formatted} ${unit}`
  }


  const calculateEllipseStats = (center: any, radiusX: number, radiusY: number) => {
    console.log('Calculating ellipse stats - radiusX:', radiusX, 'radiusY:', radiusY)
    
    // Ensure minimum radius to prevent division by zero
    const safeRadiusX = Math.max(radiusX, 1)
    const safeRadiusY = Math.max(radiusY, 1)
    
    const area = Math.PI * safeRadiusX * safeRadiusY
    const circumference = Math.PI * (3 * (safeRadiusX + safeRadiusY) - Math.sqrt((3 * safeRadiusX + safeRadiusY) * (safeRadiusX + 3 * safeRadiusY)))
    const majorAxis = Math.max(safeRadiusX, safeRadiusY) * 2
    const minorAxis = Math.min(safeRadiusX, safeRadiusY) * 2
    
    // Ensure majorAxis is not zero to prevent NaN eccentricity
    const eccentricity = majorAxis > 0 ? Math.sqrt(1 - Math.pow(minorAxis / majorAxis, 2)) : 0
    
    console.log('Ellipse calculations - area:', area, 'circumference:', circumference, 'majorAxis:', majorAxis, 'minorAxis:', minorAxis, 'eccentricity:', eccentricity)
    
    return {
      area: formatMeasurement(area),
      circumference: formatMeasurement(circumference),
      majorAxis: formatMeasurement(majorAxis),
      minorAxis: formatMeasurement(minorAxis),
      eccentricity: eccentricity.toFixed(3)
    }
  }

  const getPixelValue = (x: number, y: number): number => {
    // This would typically get the actual pixel value from the image
    // For now, return a mock value
    return Math.random() * 255
  }

  const calculateVolume = (points: any[]): number => {
    if (points.length < 3) return 0
    
    // Use shoelace formula for area, then estimate volume
    let area = 0
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length
      area += points[i].x * points[j].y
      area -= points[j].x * points[i].y
    }
    area = Math.abs(area) / 2
    
    // Estimate depth (this would be more sophisticated in a real implementation)
    const depth = Math.sqrt(area) * 0.1
    
    return area * depth
  }

  // Get label position for ROI shapes
  const getLabelPosition = (shape: any) => {
    switch (shape.type) {
      case 'rectangle':
      case 'ellipse':
      case 'length':
        return {
          x: Math.min(shape.start.x, shape.end.x) - 5,
          y: Math.min(shape.start.y, shape.end.y) - 30
        }
      case 'polygon':
      case 'lasso':
        return {
          x: Math.min(...shape.points.map((p: any) => p.x)) - 5,
          y: Math.min(...shape.points.map((p: any) => p.y)) - 30
        }
      case 'arrow':
        return {
          x: Math.min(shape.start.x, shape.end.x) - 5,
          y: Math.min(shape.start.y, shape.end.y) - 30
        }
      case 'marker':
        return {
          x: shape.x - 5,
          y: shape.y - 30
        }
      default:
        return { x: 0, y: 0 }
    }
  }

  const deleteSelectedAnnotation = () => {
    if (selectedAnnotation && selectedAnnotationType) {
      if (selectedAnnotationType === 'shape') {
        setDrawingShapes((prev: any[]) => prev.filter(shape => shape.id !== selectedAnnotation))
      } else if (selectedAnnotationType === 'text') {
        setTextAnnotations((prev: any[]) => prev.filter(annotation => annotation.id !== selectedAnnotation))
      } else if (selectedAnnotationType === 'measurement') {
        setMeasurementLines((prev: any[]) => prev.filter(measurement => measurement.id !== selectedAnnotation))
      }
      
      saveToHistory()
      setSelectedAnnotation(null)
      setSelectedAnnotationType(null)
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedAnnotation) {
          deleteSelectedAnnotation()
        }
      } else if (e.key === 'Escape') {
        setSelectedAnnotation(null)
        setSelectedAnnotationType(null)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selectedAnnotation, selectedAnnotationType, deleteSelectedAnnotation])

  if (loading) {
    return (
      <MainContainer>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100vh',
          color: '#ccc',
          fontSize: '16px'
        }}>
          Loading analysis...
        </div>
      </MainContainer>
    )
  }

  return (
    <>
      {/* Text/Comment Input Modal */}
      {showTextModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
          }}
          onClick={handleModalCancel}
        >
          <div
            style={{
              backgroundColor: '#1a1a1a',
              border: '1px solid #2a2a2a',
              borderRadius: '12px',
              padding: '24px',
              minWidth: '400px',
              maxWidth: '600px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
              transform: 'scale(1)',
              animation: 'modalSlideIn 0.2s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '20px',
              paddingBottom: '16px',
              borderBottom: '1px solid #2a2a2a'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: modalType === 'comment' ? '#ffff00' : '#0694fb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '12px'
              }}>
                {modalType === 'comment' ? '💬' : '📝'}
              </div>
              <div>
                <h3 style={{
                  margin: 0,
                  color: 'white',
                  fontSize: '18px',
                  fontWeight: '600'
                }}>
                  {modalType === 'comment' ? 'Add Comment' : 
                   modalType === 'roi-label' ? 'Label ROI' : 'Add Text Annotation'}
                </h3>
                <p style={{
                  margin: '4px 0 0 0',
                  color: '#8aa',
                  fontSize: '14px'
                }}>
                  {modalType === 'comment' 
                    ? 'Add a comment with timestamp for this location' 
                    : modalType === 'roi-label'
                    ? 'Add a descriptive label for this region of interest'
                    : 'Add text annotation at the selected position'
                  }
                </p>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px'
              }}>
                {modalType === 'comment' ? 'Comment' : 'Text'}
              </label>
              <textarea
                value={modalText}
                onChange={(e) => setModalText(e.target.value)}
                onKeyDown={handleModalKeyDown}
                placeholder={modalType === 'comment' 
                  ? 'Enter your comment here...' 
                  : modalType === 'roi-label'
                  ? 'e.g., Malignant, Benign, Lesion, Tumor...'
                  : 'Enter text annotation here...'
                }
                style={{
                  width: '100%',
                  minHeight: '120px',
                  padding: '12px',
                  backgroundColor: '#2a2a2a',
                  border: '1px solid #444',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
                autoFocus
              />
              <div style={{
                marginTop: '8px',
                fontSize: '12px',
                color: '#8aa'
              }}>
                Press <kbd style={{
                  backgroundColor: '#444',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '11px'
                }}>Ctrl+Enter</kbd> to submit, <kbd style={{
                  backgroundColor: '#444',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '11px'
                }}>Esc</kbd> to cancel
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px'
            }}>
              <button
                onClick={handleModalCancel}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'transparent',
                  border: '1px solid #444',
                  borderRadius: '6px',
                  color: '#8aa',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = '#666'
                  e.currentTarget.style.color = 'white'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = '#444'
                  e.currentTarget.style.color = '#8aa'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleModalSubmit}
                disabled={!modalText.trim()}
                style={{
                  padding: '10px 20px',
                  backgroundColor: modalType === 'comment' ? '#ffff00' : '#0694fb',
                  border: 'none',
                  borderRadius: '6px',
                  color: modalType === 'comment' ? '#000' : 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: modalText.trim() ? 'pointer' : 'not-allowed',
                  opacity: modalText.trim() ? 1 : 0.5,
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  if (modalText.trim()) {
                    e.currentTarget.style.transform = 'translateY(-1px)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)'
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                {modalType === 'comment' ? 'Add Comment' : 'Add Text'}
              </button>
            </div>
          </div>
        </div>
      )}

    <MainContainer>
      {/* Content Area */}
      <ContentArea>
        {/* Tools Sidebar - Left */}
        <CollapsibleToolsSidebar $collapsed={leftPanelCollapsed}>
          <PanelToggleButton onClick={toggleLeftPanel} title="Toggle Sidebar">
            {leftPanelCollapsed ? <FaChevronRight size={14} /> : <FaChevronLeft size={14} />}
          </PanelToggleButton>
          
          {!leftPanelCollapsed && (
            <>
              <SidebarHeader>
                <SidebarTitle>Annotation Tools</SidebarTitle>
                <div style={{ fontSize: '12px', color: '#8aa' }}>
                  Active: {activeTool.charAt(0).toUpperCase() + activeTool.slice(1)}
                </div>
              </SidebarHeader>
              
              {/* Accordion Sections */}
              <div style={{ overflow: 'auto', flex: 1 }}>
                {/* Selection & Visibility Accordion */}
                <AccordionSection>
                  <AccordionHeader onClick={() => toggleAccordion('selection')}>
                    <span>Selection & Visibility</span>
                    <AccordionIcon className={accordionStates.selection ? 'expanded' : ''}>
                      <FaChevronRight size={12} />
                    </AccordionIcon>
                  </AccordionHeader>
                  <AccordionContent $expanded={accordionStates.selection}>
                    
                    <CompactToolGrid>
                      <ToolButton $isActive={activeTool === 'select'} onClick={() => setActiveTool('select')} title="Select/Move (V)">
                        <FaMousePointer size={14} />
                      </ToolButton>
                      <ToolButton $isActive={overlayVisible} onClick={() => setOverlayVisible(!overlayVisible)} title="Overlay Toggle (O)">
                        <FaEye size={14} />
                      </ToolButton>
                    </CompactToolGrid>
                    
                    <InputGroup>
                      <LabeledInput>
                        <FaSlidersH size={12} style={{ color: '#8aa' }} />
                        <span>Opacity:</span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={overlayOpacity}
                          onChange={(e) => setOverlayOpacity(Number(e.target.value))}
                          title="Overlay Opacity"
                        />
                        <span>{overlayOpacity}%</span>
                      </LabeledInput>
                    </InputGroup>
                    
                  </AccordionContent>
                </AccordionSection>

                {/* ROI & Markup Accordion */}
                <AccordionSection>
                  <AccordionHeader onClick={() => toggleAccordion('roi')}>
                    <span>ROI & Markup</span>
                    <AccordionIcon className={accordionStates.roi ? 'expanded' : ''}>
                      <FaChevronRight size={12} />
                    </AccordionIcon>
                  </AccordionHeader>
                  <AccordionContent $expanded={accordionStates.roi}>
                    <ToolGrid>
                      <ToolButton $isActive={activeTool === 'rectangle'} onClick={() => setActiveTool('rectangle')} title="Rectangle ROI (R)">
                        <FaSquare size={14} />
                      </ToolButton>
                      <ToolButton $isActive={activeTool === 'ellipse'} onClick={() => setActiveTool('ellipse')} title="Ellipse ROI (E)">
                        <FaCircle size={14} />
                      </ToolButton>
                      <ToolButton $isActive={activeTool === 'polygon'} onClick={() => setActiveTool('polygon')} title="Polygon ROI (P)">
                        <FaDrawPolygon size={14} />
                      </ToolButton>
                      <ToolButton $isActive={activeTool === 'lasso'} onClick={() => setActiveTool('lasso')} title="Freehand Lasso (L)">
                        <FaHands size={14} />
                      </ToolButton>
                      <ToolButton $isActive={activeTool === 'marker'} onClick={() => setActiveTool('marker')} title="Point/Marker (M)">
                        <FaMapMarkerAlt size={14} />
                      </ToolButton>
                      <ToolButton $isActive={activeTool === 'arrow'} onClick={() => setActiveTool('arrow')} title="Arrow/Leader (A)">
                        <FaArrowUp size={14} />
                      </ToolButton>
                      <ToolButton $isActive={activeTool === 'text'} onClick={() => setActiveTool('text')} title="Text (T)">
                        <FaFont size={14} />
                      </ToolButton>
                      <ToolButton $isActive={activeTool === 'comment'} onClick={() => setActiveTool('comment')} title="Comment (C)">
                        <FaComment size={14} />
                      </ToolButton>
                    </ToolGrid>
                  </AccordionContent>
                </AccordionSection>


                {/* Measuring Accordion */}
                <AccordionSection>
                  <AccordionHeader onClick={() => toggleAccordion('measuring')}>
                    <span>Measuring</span>
                    <AccordionIcon className={accordionStates.measuring ? 'expanded' : ''}>
                      <FaChevronRight size={12} />
                    </AccordionIcon>
                  </AccordionHeader>
                  <AccordionContent $expanded={accordionStates.measuring}>
                    
                    <CompactToolGrid>
                      <ToolButton $isActive={activeTool === 'length'} onClick={() => setActiveTool('length')} title="Length/Caliper (D)">
                        <FaRulerCombined size={14} />
                      </ToolButton>
                      <ToolButton $isActive={activeTool === 'polyline'} onClick={() => setActiveTool('polyline')} title="Polyline Length (Y)">
                        <FaRoute size={14} />
                      </ToolButton>
                    </CompactToolGrid>
                    
                    {/* Measurement Unit Controls */}
                    <InputGroup>
                      <LabeledInput>
                        <FaRuler size={12} style={{ color: '#8aa' }} />
                        <span>Units:</span>
                        <StyledSelect
                          value={measurementUnit}
                          onChange={(e) => handleMeasurementUnitChange(e.target.value as 'pixels' | 'mm' | 'cm')}
                        >
                          <option value="pixels">Pixels</option>
                          <option value="mm">Millimeters</option>
                          <option value="cm">Centimeters</option>
                        </StyledSelect>
                      </LabeledInput>
                      
                      {measurementUnit !== 'pixels' && (
                        <div>
                          <LabeledInput>
                            <FaRuler size={12} style={{ color: '#8aa' }} />
                            <span>Scale:</span>
                            <StyledInput
                              type="number"
                              value={pixelToMmRatio}
                              onChange={(e) => handlePixelRatioChange(parseFloat(e.target.value) || 0.5)}
                              onBlur={(e) => {
                                const value = parseFloat(e.target.value)
                                if (isNaN(value) || value <= 0) {
                                  setPixelToMmRatio(0.5) // Reset to default if invalid
                                } else {
                                  setPixelToMmRatio(Math.max(0.01, Math.min(1000, value))) // Clamp between 0.01 and 1000
                                }
                              }}
                              min="0.01"
                              max="1000"
                              step="0.1"
                              title="Scale ratio: pixels per millimeter (0.01-1000)"
                              placeholder="0.5"
                            />
                            <span style={{ fontSize: '12px', color: '#8aa', paddingLeft: '8px' }}>px/mm</span>
                          </LabeledInput>
                          
                          <PresetButtons>
                            <button
                              type="button"
                              onClick={() => setPixelToMmRatio(0.5)}
                              title="2 pixels per mm (high-res medical imaging)"
                            >
                              2px/mm
                            </button>
                            <button
                              type="button"
                              onClick={() => setPixelToMmRatio(1)}
                              title="1 pixel per mm (standard medical imaging)"
                            >
                              1px/mm
                            </button>
                            <button
                              type="button"
                              onClick={() => setPixelToMmRatio(2)}
                              title="0.5 pixels per mm (lower-res imaging)"
                            >
                              0.5px/mm
                            </button>
                          </PresetButtons>
                        </div>
                      )}
                    </InputGroup>
                    
                  </AccordionContent>
                </AccordionSection>

                {/* Review & Workflow Accordion */}
                <AccordionSection>
                  <AccordionHeader onClick={() => toggleAccordion('workflow')}>
                    <span>Review & Workflow</span>
                    <AccordionIcon className={accordionStates.workflow ? 'expanded' : ''}>
                      <FaChevronRight size={12} />
                    </AccordionIcon>
                  </AccordionHeader>
                  <AccordionContent $expanded={accordionStates.workflow}>
                    
                    <ToolGrid>
                      <ToolButton onClick={undo} title="Undo (⌘Z)" disabled={historyIndex <= 0}>
                        <FaUndo size={14} />
                      </ToolButton>
                      <ToolButton onClick={redo} title="Redo (⌘⇧Z)" disabled={historyIndex >= history.length - 1}>
                        <FaRedo size={14} />
                      </ToolButton>
                      <ToolButton 
                        onClick={deleteSelectedAnnotation} 
                        title="Delete Selected (Delete)" 
                        disabled={!selectedAnnotation}
                        style={{ 
                          backgroundColor: selectedAnnotation ? '#ff4444' : 'transparent',
                          color: selectedAnnotation ? 'white' : '#8aa'
                        }}
                      >
                        <FaTrash size={14} />
                      </ToolButton>
                      <ToolButton onClick={() => {
                        const newBookmark = {
                          id: Date.now(),
                          timestamp: new Date().toISOString(),
                          zoom,
                          pan,
                          objects: (drawingShapes || []).length,
                          annotations: (textAnnotations || []).length
                        }
                        setBookmarks(prev => [...prev, newBookmark])
                      }} title="Bookmark/Key Image (K)">
                        <FaBookmark size={14} />
                      </ToolButton>
                      <ToolButton 
                        $isActive={studyState === 'accepted'} 
                        onClick={() => setStudyState(studyState === 'accepted' ? 'pending' : 'accepted')} 
                        title="Accept"
                      >
                        <FaCheckCircle size={14} />
                      </ToolButton>
                      <ToolButton 
                        $isActive={studyState === 'rejected'} 
                        onClick={() => setStudyState(studyState === 'rejected' ? 'pending' : 'rejected')} 
                        title="Reject"
                      >
                        <FaTimesCircle size={14} />
                      </ToolButton>
                      <ToolButton onClick={exportAnnotations} title="Export">
                        <FaFileExport size={14} />
                      </ToolButton>
                    </ToolGrid>
                    
                  </AccordionContent>
                </AccordionSection>
              </div>
            </>
          )}
        </CollapsibleToolsSidebar>

        {/* Main Viewer Area */}
        <MainViewerArea>
          {/* Thumbnails at the top */}
          <ThumbnailBar>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginRight: '16px' }}>
              <SidebarTitle style={{ fontSize: '14px', margin: 0 }}>Images</SidebarTitle>
              <CountBadge>{Array.isArray(files) ? files.length : 0}</CountBadge>
            </div>
            
            {Array.isArray(files) && files.length > 0 ? (
              files.map((file, index) => (
                <ThumbnailItem 
                  key={index} 
                  $isSelected={index === selected}
                  onClick={() => setSelected(index)}
                >
                  <ThumbnailImage src={file.url} alt={file.name} />
                </ThumbnailItem>
              ))
            ) : (
              <div style={{ 
                color: '#8aa',
                fontSize: '12px',
                padding: '20px'
              }}>
                No images available
              </div>
            )}
            
            <AddImageButton>
              <FaPlusCircle size={16} />
              <div style={{ fontSize: '10px', marginTop: '4px' }}>Add</div>
            </AddImageButton>
          </ThumbnailBar>

          {/* Viewer Area */}
          <ViewerArea>
            {/* Image Viewer */}
            <ImageViewerArea>
              <div
                ref={setViewerContainer}
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  overflow: 'hidden',
                  cursor: activeTool === 'select' ? 'grab' : 
                          activeTool === 'brush' ? 'crosshair' :
                          activeTool === 'marker' ? 'crosshair' :
                          activeTool === 'text' ? 'text' :
                          'crosshair'
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onWheel={handleWheel}
                onDoubleClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
              >
            {Array.isArray(files) && files.length > 0 ? (
            (() => {
              const currentFile = files[selected]
              return (
                      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                        <div style={{ 
                          pointerEvents: activeTool === 'select' ? 'auto' : 'none',
                          width: '100%', 
                          height: '100%' 
                        }}>
            <ImageViewer 
                    imageUrl={currentFile?.url} 
                            showControls={activeTool === 'select'} 
                    inlineDicomViewer={isDicomFile(currentFile?.url, currentFile?.name)}
                    alt={currentFile?.name || 'Medical scan'}
                  />
              </div>
                        
                        {/* Annotations Overlay - Inside ImageViewer */}
                        {overlayVisible && (
                          <div
                            style={{
                      position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              pointerEvents: activeTool === 'select' ? 'none' : 'auto',
                              zIndex: 10,
                              opacity: overlayOpacity / 100
                            }}
                          >
                            {/* Render existing shapes */}
                            {(drawingShapes || []).map(shape => {
                              const isSelected = selectedAnnotation === shape.id && selectedAnnotationType === 'shape'
                              
                              if (shape.type === 'marker') {
                                return (
                                  <div
                                    key={shape.id}
                                    onClick={(e) => handleAnnotationClick(e, shape.id, 'shape')}
                                    onDoubleClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                    style={{
                                      position: 'absolute',
                                      left: shape.x,
                                      top: shape.y,
                                      width: '12px',
                                      height: '12px',
                                      background: shape.color,
                                      borderRadius: '50%',
                                      border: isSelected ? '3px solid #0694fb' : '2px solid white',
                                      transform: 'translate(-50%, -50%)',
                                      pointerEvents: 'auto',
                                      cursor: 'pointer',
                                      boxShadow: isSelected ? '0 0 8px rgba(6, 148, 251, 0.6)' : 'none',
                                      transition: 'all 0.2s ease'
                                    }}
                                  />
                                )
                              }
                              if (shape.type === 'rectangle') {
                                // Use stored coordinates if available, otherwise fall back to start/end calculation
                                const coords = shape.coordinates || {
                                  topLeft: { X: Math.min(shape.start.x, shape.end.x), Y: Math.min(shape.start.y, shape.end.y) },
                                  width: Math.abs(shape.end.x - shape.start.x),
                                  height: Math.abs(shape.end.y - shape.start.y)
                                }
                                
                                return (
                                  <div key={shape.id}>
                                    <div
                                      onClick={(e) => handleAnnotationClick(e, shape.id, 'shape')}
                                      onDoubleClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                      style={{
                                        position: 'absolute',
                                        left: coords.topLeft.x,
                                        top: coords.topLeft.y,
                                        width: coords.width,
                                        height: coords.height,
                                        border: isSelected ? '3px solid #0694fb' : `2px solid ${shape.color}`,
                                        background: `${shape.color}20`,
                                        pointerEvents: 'auto',
                                        cursor: 'pointer',
                                        boxShadow: isSelected ? '0 0 8px rgba(6, 148, 251, 0.6)' : 'none'
                                      }}
                                    />
                                    {shape.label && (
                                      <div
                                        style={{
                                          position: 'absolute',
                                          left: Math.min(shape.start.x, shape.end.x) - 5,
                                          top: Math.min(shape.start.y, shape.end.y) - 30,
                                          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                                          color: 'white',
                                          padding: '4px 8px',
                                          borderRadius: '6px',
                                          fontSize: '12px',
                                          fontWeight: 'bold',
                                          pointerEvents: 'none',
                                          zIndex: 20,
                                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                                          border: '1px solid rgba(255, 255, 255, 0.1)',
                                          backdropFilter: 'blur(4px)',
                                          letterSpacing: '0.5px'
                                        }}
                                      >
                                        {shape.label.split(' ').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}
              </div>
                                    )}
                                  </div>
                                )
                              }
                              if (shape.type === 'ellipse') {
                                // Use stored coordinates if available, otherwise fall back to start/end calculation
                                const coords = shape.coordinates || {
                                  topLeft: { X: Math.min(shape.start.x, shape.end.x), Y: Math.min(shape.start.y, shape.end.y) },
                                  width: Math.abs(shape.end.x - shape.start.x),
                                  height: Math.abs(shape.end.y - shape.start.y)
                                }
                                
                                return (
                                  <div key={shape.id}>
                                    <div
                                      onClick={(e) => handleAnnotationClick(e, shape.id, 'shape')}
                                      onDoubleClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                      style={{
                                        position: 'absolute',
                                        left: coords.topLeft.X,
                                        top: coords.topLeft.Y,
                                        width: coords.width,
                                        height: coords.height,
                                        border: isSelected ? '3px solid #0694fb' : `2px solid ${shape.color}`,
                                        background: `${shape.color}20`,
                                        borderRadius: '50%',
                                        pointerEvents: 'auto',
                                        cursor: 'pointer',
                                        boxShadow: isSelected ? '0 0 8px rgba(6, 148, 251, 0.6)' : 'none'
                                      }}
                                    />
                                    {shape.label && (() => {
                                      const labelPos = getLabelPosition(shape)
                                      return (
                                        <div
                                          style={{
                                            position: 'absolute',
                                            left: labelPos.x,
                                            top: labelPos.y,
                                            background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                                            color: 'white',
                                            padding: '4px 8px',
                                            borderRadius: '6px',
                                            fontSize: '11px',
                                            fontWeight: '600',
                                            pointerEvents: 'none',
                                            zIndex: 20,
                                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.2)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            backdropFilter: 'blur(4px)',
                                          letterSpacing: '0.5px'
                                          }}
                                        >
                                          {shape.label.split(' ').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}
                                        </div>
                                      )
                                    })()}
                                  </div>
                                )
                              }
                              if (shape.type === 'length') {
                                return (
                                  <div key={shape.id}>
                                    <div
                                      onClick={(e) => handleAnnotationClick(e, shape.id, 'shape')}
                                      onDoubleClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                      style={{
                                        position: 'absolute',
                                        left: Math.min(shape.start.x, shape.end.x),
                                        top: Math.min(shape.start.y, shape.end.y),
                                        width: Math.abs(shape.end.x - shape.start.x),
                                        height: Math.abs(shape.end.y - shape.start.y),
                                        border: isSelected ? '3px dashed #0694fb' : `2px dashed ${shape.color}`,
                                        pointerEvents: 'auto',
                                        cursor: 'pointer',
                                        boxShadow: isSelected ? '0 0 8px rgba(6, 148, 251, 0.6)' : 'none'
                                      }}
                                    />
                                    {shape.label && (() => {
                                      const labelPos = getLabelPosition(shape)
                                      return (
                                        <div
                                          style={{
                                            position: 'absolute',
                                            left: labelPos.x,
                                            top: labelPos.y,
                                            background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                                            color: 'white',
                                            padding: '4px 8px',
                                            borderRadius: '6px',
                                            fontSize: '11px',
                                            fontWeight: '600',
                                            pointerEvents: 'none',
                                            zIndex: 20,
                                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.2)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            backdropFilter: 'blur(4px)',
                                          letterSpacing: '0.5px'
                                          }}
                                        >
                                          {shape.label.split(' ').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}
                                        </div>
                                      )
                                    })()}
                                  </div>
                                )
                              }
                              if (shape.type === 'arrow') {
                                return (
                                  <div key={shape.id}>
                                    <svg
                                      onClick={(e) => handleAnnotationClick(e, shape.id, 'shape')}
                                      onDoubleClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                      style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        pointerEvents: 'auto',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      <defs>
                                        <marker
                                          id={`arrowhead-${shape.id}`}
                                          markerWidth="10"
                                          markerHeight="7"
                                          refX="9"
                                          refY="3.5"
                                          orient="auto"
                                        >
                                          <polygon
                                            points="0 0, 10 3.5, 0 7"
                                            fill={shape.color}
                                          />
                                        </marker>
                                      </defs>
                                      <line
                                        x1={shape.start.x}
                                        y1={shape.start.y}
                                        x2={shape.end.x}
                                        y2={shape.end.y}
                                      stroke={isSelected ? '#0694fb' : shape.color}
                                      strokeWidth={isSelected ? "3" : "2"}
                                      markerEnd={`url(#arrowhead-${shape.id})`}
                                      style={{
                                        filter: isSelected ? 'drop-shadow(0 0 8px rgba(6, 148, 251, 0.6))' : 'none',
                                        transition: 'all 0.2s ease'
                                      }}
                                      />
                                    </svg>
                                    {shape.label && (() => {
                                      const labelPos = getLabelPosition(shape)
                                      return (
                                        <div
                                          style={{
                                            position: 'absolute',
                                            left: labelPos.x,
                                            top: labelPos.y,
                                            background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                                            color: 'white',
                                            padding: '4px 8px',
                                            borderRadius: '6px',
                                            fontSize: '11px',
                                            fontWeight: '600',
                                            pointerEvents: 'none',
                                            zIndex: 20,
                                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.2)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            backdropFilter: 'blur(4px)',
                                          letterSpacing: '0.5px'
                                          }}
                                        >
                                          {shape.label.split(' ').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}
                                        </div>
                                      )
                                    })()}
                                  </div>
                                )
                              }
                              if (shape.type === 'polygon') {
                                return (
                                  <div key={shape.id}>
                                    <svg
                                      onClick={(e) => handleAnnotationClick(e, shape.id, 'shape')}
                                      onDoubleClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                      style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        pointerEvents: 'auto',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      <polygon
                                        points={shape.points.map((p: any) => `${p.x},${p.y}`).join(' ')}
                                        fill={`${shape.color}20`}
                                      stroke={isSelected ? '#0694fb' : shape.color}
                                      strokeWidth={isSelected ? "3" : "2"}
                                      style={{
                                        filter: isSelected ? 'drop-shadow(0 0 8px rgba(6, 148, 251, 0.6))' : 'none',
                                        transition: 'all 0.2s ease'
                                      }}
                                      />
                                    </svg>
                                    {shape.label && (() => {
                                      const labelPos = getLabelPosition(shape)
                                      return (
                                        <div
                                          style={{
                                            position: 'absolute',
                                            left: labelPos.x,
                                            top: labelPos.y,
                                            background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                                            color: 'white',
                                            padding: '4px 8px',
                                            borderRadius: '6px',
                                            fontSize: '11px',
                                            fontWeight: '600',
                                            pointerEvents: 'none',
                                            zIndex: 20,
                                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.2)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            backdropFilter: 'blur(4px)',
                                          letterSpacing: '0.5px'
                                          }}
                                        >
                                          {shape.label.split(' ').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}
                                        </div>
                                      )
                                    })()}
                                  </div>
                                )
                              }
                              if (shape.type === 'lasso') {
                                return (
                                  <div key={shape.id}>
                                    <svg
                                      onClick={(e) => handleAnnotationClick(e, shape.id, 'shape')}
                                      onDoubleClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                      style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        pointerEvents: 'auto',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      <path
                                        d={`M ${shape.points[0].x} ${shape.points[0].y} ${shape.points.map((p: any) => `L ${p.x} ${p.y}`).join(' ')}`}
                                        fill="none"
                                      stroke={isSelected ? '#0694fb' : shape.color}
                                      strokeWidth={isSelected ? "3" : "2"}
                                      style={{
                                        filter: isSelected ? 'drop-shadow(0 0 8px rgba(6, 148, 251, 0.6))' : 'none',
                                        transition: 'all 0.2s ease'
                                      }}
                                      />
                                    </svg>
                                    {shape.label && (() => {
                                      const labelPos = getLabelPosition(shape)
                                      return (
                                        <div
                                          style={{
                                            position: 'absolute',
                                            left: labelPos.x,
                                            top: labelPos.y,
                                            background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                                            color: 'white',
                                            padding: '4px 8px',
                                            borderRadius: '6px',
                                            fontSize: '11px',
                                            fontWeight: '600',
                                            pointerEvents: 'none',
                                            zIndex: 20,
                                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.2)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            backdropFilter: 'blur(4px)',
                                          letterSpacing: '0.5px'
                                          }}
                                        >
                                          {shape.label.split(' ').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}
                                        </div>
                                      )
                                    })()}
                                  </div>
                                )
                              }
                              if (shape.type === 'threshold') {
                                return (
                                  <div
                                    key={shape.id}
                                    style={{
                                      position: 'absolute',
                                      left: shape.x,
                                      top: shape.y,
                                      width: '16px',
                                      height: '16px',
                                      background: shape.color,
                                      borderRadius: '50%',
                                      border: '2px solid white',
                                      transform: 'translate(-50%, -50%)',
                                      pointerEvents: 'auto',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '10px',
                                      fontWeight: 'bold',
                                      color: 'white'
                                    }}
                                    title={`Threshold: ${shape.value}`}
                                  >
                                    T
              </div>
                                )
                              }
                              if (shape.type === 'regionGrow') {
                                return (
                                  <div
                                    key={shape.id}
                                    style={{
                                      position: 'absolute',
                                      left: shape.x,
                                      top: shape.y,
                                      width: '16px',
                                      height: '16px',
                                      background: shape.color,
                                      borderRadius: '50%',
                                      border: '2px solid white',
                                      transform: 'translate(-50%, -50%)',
                                      pointerEvents: 'auto',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '10px',
                                      fontWeight: 'bold',
                                      color: 'white'
                                    }}
                                    title={`Region Grow (Tolerance: ${shape.tolerance})`}
                                  >
                                    R
                                  </div>
                                )
                              }
                              if (shape.type === 'fill') {
                                return (
                                  <div
                                    key={shape.id}
                                    style={{
                                      position: 'absolute',
                                      left: shape.x,
                                      top: shape.y,
                                      width: '16px',
                                      height: '16px',
                                      background: shape.color,
                                      borderRadius: '50%',
                                      border: '2px solid white',
                                      transform: 'translate(-50%, -50%)',
                                      pointerEvents: 'auto',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '10px',
                                      fontWeight: 'bold',
                                      color: 'white'
                                    }}
                                    title="Fill Tool"
                                  >
                                    F
                                  </div>
                                )
                              }
                              if (shape.type === 'smooth') {
                                return (
                                  <div
                                    key={shape.id}
                                    style={{
                                      position: 'absolute',
                                      left: shape.x,
                                      top: shape.y,
                                      width: '16px',
                                      height: '16px',
                                      background: shape.color,
                                      borderRadius: '50%',
                                      border: '2px solid white',
                                      transform: 'translate(-50%, -50%)',
                                      pointerEvents: 'auto',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '10px',
                                      fontWeight: 'bold',
                                      color: 'white'
                                    }}
                                    title="Smooth Tool"
                                  >
                                    S
                                  </div>
                                )
                              }
                              if (shape.type === 'interpolate') {
                                return (
                                  <div
                                    key={shape.id}
                                    style={{
                                      position: 'absolute',
                                      left: shape.x,
                                      top: shape.y,
                                      width: '16px',
                                      height: '16px',
                                      background: shape.color,
                                      borderRadius: '50%',
                                      border: '2px solid white',
                                      transform: 'translate(-50%, -50%)',
                                      pointerEvents: 'auto',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '10px',
                                      fontWeight: 'bold',
                                      color: 'white'
                                    }}
                                    title="Interpolate Tool"
                                  >
                                    I
                                  </div>
                                )
                              }
                              if (shape.type === 'ellipseStats') {
                                return (
                                  <div
                                    key={shape.id}
                                    style={{
                                      position: 'absolute',
                                      left: shape.center.x - shape.radiusX,
                                      top: shape.center.y - shape.radiusY,
                                      width: shape.radiusX * 2,
                                      height: shape.radiusY * 2,
                                      borderRadius: '50%',
                                      background: 'transparent',
                                      cursor: 'pointer',
                                      border: selectedAnnotation === shape.id ? `3px solid #fff` : `2px solid ${shape.color}`,
                                      boxShadow: selectedAnnotation === shape.id ? '0 0 10px rgba(255,255,255,0.8)' : 'none'
                                    }}
                                    onClick={(e) => handleAnnotationClick(e, shape.id, 'shape')}
                                    title={`Ellipse Stats: Area: ${shape.area}, Circumference: ${shape.circumference}, Major Axis: ${shape.majorAxis}, Minor Axis: ${shape.minorAxis}, Eccentricity: ${shape.eccentricity}`}
                                  />
                                )
                              }
                              if (shape.type === 'probe') {
                                return (
                                  <div
                                    key={shape.id}
                                    style={{
                                      position: 'absolute',
                                      left: shape.x,
                                      top: shape.y,
                                      width: '16px',
                                      height: '16px',
                                      background: shape.color,
                                      borderRadius: '50%',
                                      border: '2px solid white',
                                      transform: 'translate(-50%, -50%)',
                                      pointerEvents: 'auto',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '10px',
                                      fontWeight: 'bold',
                                      color: 'white'
                                    }}
                                    title="Probe Tool - Click to get pixel value"
                                  >
                                    P
                                  </div>
                                )
                              }
                              if (shape.type === 'volume') {
                                return (
                                  <div
                                    key={shape.id}
                                    style={{
                                      position: 'absolute',
                                      left: shape.x,
                                      top: shape.y,
                                      width: '16px',
                                      height: '16px',
                                      background: shape.color,
                                      borderRadius: '50%',
                                      border: '2px solid white',
                                      transform: 'translate(-50%, -50%)',
                                      pointerEvents: 'auto',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '10px',
                                      fontWeight: 'bold',
                                      color: 'white'
                                    }}
                                    title="Volume Tool - Click to calculate volume"
                                  >
                                    V
                                  </div>
                                )
                              }
                              return null
                            })}

                            {/* Render existing measurements */}
                            {console.log('measurementLines array:', measurementLines)}
                            {(measurementLines || []).map(measurement => {
                              console.log('Rendering measurement type:', measurement.type, 'object:', measurement)
                              if (measurement.type === 'length') {
                                const midX = (measurement.start.x + measurement.end.x) / 2
                                const midY = (measurement.start.y + measurement.end.y) / 2
                                
                                return (
                                  <svg
                                    key={measurement.id}
                                    style={{
                                      position: 'absolute',
                                      top: 0,
                                      left: 0,
                                      width: '100%',
                                      height: '100%',
                                      pointerEvents: 'none'
                                    }}
                                  >
                                    {/* Measurement line */}
                                    <line
                                      x1={measurement.start.x}
                                      y1={measurement.start.y}
                                      x2={measurement.end.x}
                                      y2={measurement.end.y}
                                      stroke={measurement.color}
                                      strokeWidth="2"
                                    />
                                    
                                    {/* Start point */}
                                    <circle
                                      cx={measurement.start.x}
                                      cy={measurement.start.y}
                                      r="4"
                                      fill={measurement.color}
                                    />
                                    
                                    {/* End point */}
                                    <circle
                                      cx={measurement.end.x}
                                      cy={measurement.end.y}
                                      r="4"
                                      fill={measurement.color}
                                    />
                                    
                                    {/* Distance label */}
                                    <text
                                      x={midX}
                                      y={midY - 10}
                                      textAnchor="middle"
                                      fill={measurement.color}
                                      fontSize="12"
                                      fontWeight="bold"
                                      style={{
                                        textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                                      }}
                                    >
                                      {measurement.formattedDistance}
                                    </text>
                                  </svg>
                                )
                              }
                              
                              
                              if (measurement.type === 'polyline') {
                                const midPointIndex = Math.floor(measurement.points.length / 2)
                                const midPoint = measurement.points[midPointIndex]
                                
              return (
                                  <svg
                                    key={measurement.id}
                                    style={{
                                      position: 'absolute',
                                      top: 0,
                                      left: 0,
                                      width: '100%',
                                      height: '100%',
                                      pointerEvents: 'none'
                                    }}
                                  >
                                    <path
                                      d={`M ${measurement.points[0].x} ${measurement.points[0].y} ${measurement.points.map((p: any) => `L ${p.x} ${p.y}`).join(' ')}`}
                                      fill="none"
                                      stroke={measurement.color}
                                      strokeWidth="2"
                                    />
                                    {measurement.points.map((point: any, index: number) => (
                                      <circle
                                        key={index}
                                        cx={point.x}
                                        cy={point.y}
                                        r="3"
                                        fill={measurement.color}
                                      />
                                    ))}
                                    {/* Total length label */}
                                    <text
                                      x={midPoint.x}
                                      y={midPoint.y - 10}
                                      textAnchor="middle"
                                      fill={measurement.color}
                                      fontSize="12"
                                      fontWeight="bold"
                                      style={{
                                        textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                                      }}
                                    >
                                      {measurement.formattedLength}
                                    </text>
                                  </svg>
                                )
                              }
                              
                              if (measurement.type === 'ellipseStats') {
                                console.log('Rendering ellipse stats measurement:', measurement)
                                return (
                                  <svg
                                    key={measurement.id}
                                    style={{
                      position: 'absolute',
                                      top: 0,
                                      left: 0,
                                      width: '100%',
                                      height: '100%',
                                      pointerEvents: 'none'
                                    }}
                                  >
                                    {/* Ellipse outline */}
                                    <ellipse
                                      cx={measurement.center.x}
                                      cy={measurement.center.y}
                                      rx={measurement.radiusX}
                                      ry={measurement.radiusY}
                                      fill="none"
                                      stroke={measurement.color}
                                      strokeWidth="2"
                                      strokeDasharray="5,5"
                                    />
                                    
                                    {/* Center point */}
                                    <circle
                                      cx={measurement.center.x}
                                      cy={measurement.center.y}
                                      r="3"
                                      fill={measurement.color}
                                    />
                                    
                                    {/* Area label */}
                                    <text
                                      x={measurement.center.x}
                                      y={measurement.center.y - measurement.radiusY - 20}
                                      textAnchor="middle"
                                      fill={measurement.color}
                                      fontSize="11"
                                      fontWeight="bold"
                                      style={{
                                        textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                                      }}
                                    >
                                      Area: {measurement.area}
                                    </text>
                                    
                                    {/* Circumference label */}
                                    <text
                                      x={measurement.center.x}
                                      y={measurement.center.y - measurement.radiusY - 5}
                                      textAnchor="middle"
                                      fill={measurement.color}
                                      fontSize="11"
                                      fontWeight="bold"
                                      style={{
                                        textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                                      }}
                                    >
                                      Circ: {measurement.circumference}
                                    </text>
                                    
                                    {/* Major/Minor axes label */}
                                    <text
                                      x={measurement.center.x}
                                      y={measurement.center.y + measurement.radiusY + 15}
                                      textAnchor="middle"
                                      fill={measurement.color}
                                      fontSize="11"
                                      fontWeight="bold"
                                      style={{
                                        textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                                      }}
                                    >
                                      {measurement.majorAxis} × {measurement.minorAxis}
                                    </text>
                                    
                                    {/* Eccentricity label */}
                                    <text
                                      x={measurement.center.x}
                                      y={measurement.center.y + measurement.radiusY + 30}
                                      textAnchor="middle"
                                      fill={measurement.color}
                                      fontSize="11"
                                      fontWeight="bold"
                                      style={{
                                        textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                                      }}
                                    >
                                      e: {measurement.eccentricity}
                                    </text>
                                  </svg>
                                )
                              }
                              return null
                            })}

                            {/* Render text annotations */}
                            {(textAnnotations || []).map(annotation => {
                              const isSelected = selectedAnnotation === annotation.id && selectedAnnotationType === 'text'
                              
              return (
                                <div
                                  key={annotation.id}
                                  onClick={(e) => handleAnnotationClick(e, annotation.id, 'text')}
                                  onDoubleClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                  style={{
                      position: 'absolute',
                                    left: annotation.x,
                                    top: annotation.y,
                                    color: annotation.type === 'comment' ? '#000000' : annotation.color,
                                    background: annotation.type === 'comment' ? 'rgba(255,255,0,0.9)' : 'rgba(0,0,0,0.7)',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                                    fontWeight: '600',
                                    pointerEvents: 'auto',
                                    cursor: 'pointer',
                                    transform: 'translate(-50%, -50%)',
                                    border: isSelected ? '2px solid #0694fb' : (annotation.type === 'comment' ? '1px solid #ffff00' : 'none'),
                                    maxWidth: '200px',
                                    wordWrap: 'break-word',
                                    boxShadow: isSelected ? '0 0 8px rgba(6, 148, 251, 0.6)' : 'none'
                                  }}
                                  title={annotation.timestamp ? `Added: ${new Date(annotation.timestamp).toLocaleString()}` : ''}
                                >
                                  {annotation.type === 'comment' && '💬 '}
                                  {annotation.text}
                                </div>
                              )
                            })}

                            {/* Render current shape being drawn */}
                            {toolState.currentShape && (
                              <>
                                {toolState.currentShape.type === 'rectangle' && (
                                  <div
                                    style={{
                                      position: 'absolute',
                                      left: Math.min(toolState.currentShape.start.x, toolState.currentShape.end.x),
                                      top: Math.min(toolState.currentShape.start.y, toolState.currentShape.end.y),
                                      width: Math.abs(toolState.currentShape.end.x - toolState.currentShape.start.x),
                                      height: Math.abs(toolState.currentShape.end.y - toolState.currentShape.start.y),
                                      border: `2px solid ${toolState.currentShape.color}`,
                                      background: `${toolState.currentShape.color}20`,
                                      pointerEvents: 'none'
                                    }}
                                  />
                                )}
                                {toolState.currentShape.type === 'ellipse' && (
                                  <svg
                                    style={{
                                      position: 'absolute',
                                      top: 0,
                                      left: 0,
                                      width: '100%',
                                      height: '100%',
                                      pointerEvents: 'none'
                                    }}
                                  >
                                    {/* Ellipse outline */}
                                    <ellipse
                                      cx={(toolState.currentShape.start.x + toolState.currentShape.end.x) / 2}
                                      cy={(toolState.currentShape.start.y + toolState.currentShape.end.y) / 2}
                                      rx={Math.abs(toolState.currentShape.end.x - toolState.currentShape.start.x) / 2}
                                      ry={Math.abs(toolState.currentShape.end.y - toolState.currentShape.start.y) / 2}
                                      fill="none"
                                      stroke={toolState.currentShape.color}
                                      strokeWidth="2"
                                      strokeDasharray="5,5"
                                    />
                                    
                                    {/* Center point */}
                                    <circle
                                      cx={(toolState.currentShape.start.x + toolState.currentShape.end.x) / 2}
                                      cy={(toolState.currentShape.start.y + toolState.currentShape.end.y) / 2}
                                      r="3"
                                      fill={toolState.currentShape.color}
                                    />
                                  </svg>
                                )}
                                {toolState.currentShape.type === 'length' && (
                                  <svg
                                    style={{
                                      position: 'absolute',
                                      top: 0,
                                      left: 0,
                                      width: '100%',
                                      height: '100%',
                                      pointerEvents: 'none'
                                    }}
                                  >
                                    {/* Measurement line */}
                                    <line
                                      x1={toolState.currentShape.start.x}
                                      y1={toolState.currentShape.start.y}
                                      x2={toolState.currentShape.end.x}
                                      y2={toolState.currentShape.end.y}
                                      stroke={toolState.currentShape.color}
                                      strokeWidth="2"
                                      strokeDasharray="5,5"
                                    />
                                    
                                    {/* Start point */}
                                    <circle
                                      cx={toolState.currentShape.start.x}
                                      cy={toolState.currentShape.start.y}
                                      r="4"
                                      fill={toolState.currentShape.color}
                                    />
                                    
                                    {/* End point */}
                                    <circle
                                      cx={toolState.currentShape.end.x}
                                      cy={toolState.currentShape.end.y}
                                      r="4"
                                      fill={toolState.currentShape.color}
                                    />
                                    
                                    {/* Distance label */}
                                    <text
                                      x={(toolState.currentShape.start.x + toolState.currentShape.end.x) / 2}
                                      y={(toolState.currentShape.start.y + toolState.currentShape.end.y) / 2 - 10}
                                      textAnchor="middle"
                                      fill={toolState.currentShape.color}
                                      fontSize="12"
                                      fontWeight="bold"
                                      style={{
                                        textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                                      }}
                                    >
                                      {formatMeasurement(calculateDistance(toolState.currentShape.start, toolState.currentShape.end))}
                                    </text>
                                  </svg>
                                )}
                                {toolState.currentShape.type === 'arrow' && (
                                  <svg
                                    style={{
                                      position: 'absolute',
                                      top: 0,
                                      left: 0,
                                      width: '100%',
                                      height: '100%',
                                      pointerEvents: 'none'
                                    }}
                                  >
                                    <defs>
                                      <marker
                                        id="arrowhead"
                                        markerWidth="10"
                                        markerHeight="7"
                                        refX="9"
                                        refY="3.5"
                                        orient="auto"
                                      >
                                        <polygon
                                          points="0 0, 10 3.5, 0 7"
                                          fill={toolState.currentShape.color}
                                        />
                                      </marker>
                                    </defs>
                                    <line
                                      x1={toolState.currentShape.start.x}
                                      y1={toolState.currentShape.start.y}
                                      x2={toolState.currentShape.end.x}
                                      y2={toolState.currentShape.end.y}
                                      stroke={toolState.currentShape.color}
                                      strokeWidth="2"
                                      markerEnd="url(#arrowhead)"
                                    />
                                  </svg>
                                )}
                                {toolState.currentShape.type === 'polygon' && toolState.currentShape.points.length > 2 && (
                                  <svg
                                    style={{
                                      position: 'absolute',
                                      top: 0,
                                      left: 0,
                                      width: '100%',
                                      height: '100%',
                                      pointerEvents: 'none'
                                    }}
                                  >
                                    <polygon
                                      points={toolState.currentShape.points.map((p: any) => `${p.x},${p.y}`).join(' ')}
                                      fill={`${toolState.currentShape.color}20`}
                                      stroke={toolState.currentShape.color}
                                      strokeWidth="2"
                                    />
                                  </svg>
                                )}
                                {toolState.currentShape.type === 'lasso' && toolState.currentShape.points.length > 1 && (
                                  <svg
                                    style={{
                                      position: 'absolute',
                                      top: 0,
                                      left: 0,
                                      width: '100%',
                                      height: '100%',
                                      pointerEvents: 'none'
                                    }}
                                  >
                                    <path
                                      d={`M ${toolState.currentShape.points[0].x} ${toolState.currentShape.points[0].y} ${toolState.currentShape.points.map((p: any) => `L ${p.x} ${p.y}`).join(' ')}`}
                                      fill="none"
                                      stroke={toolState.currentShape.color}
                                      strokeWidth="2"
                                    />
                                  </svg>
                                )}
                              </>
                            )}

                            {/* Render current measurement being drawn */}
                            {toolState.currentMeasurement && (
                              <>
                                {toolState.currentMeasurement.type === 'polyline' && toolState.currentMeasurement.points.length > 1 && (
                                  <svg
                                    style={{
                                      position: 'absolute',
                                      top: 0,
                                      left: 0,
                                      width: '100%',
                                      height: '100%',
                                      pointerEvents: 'none'
                                    }}
                                  >
                                    <path
                                      d={`M ${toolState.currentMeasurement.points[0].x} ${toolState.currentMeasurement.points[0].y} ${toolState.currentMeasurement.points.map((p: any) => `L ${p.x} ${p.y}`).join(' ')}`}
                                      fill="none"
                                      stroke={toolState.currentMeasurement.color}
                                      strokeWidth="2"
                                    />
                                    {toolState.currentMeasurement.points.map((point: any, index: number) => (
                                      <circle
                                        key={index}
                                        cx={point.x}
                                        cy={point.y}
                                        r="3"
                                        fill={toolState.currentMeasurement.color}
                                      />
                                    ))}
                                  </svg>
                                )}
                              </>
                            )}

                            {/* Render existing brush paths */}
                            {(drawingShapes || []).map(shape => {
                              if (shape.type === 'brush' || shape.type === 'eraser') {
                                return (
                                  <svg
                                    key={shape.id}
                                    style={{
                                      position: 'absolute',
                                      top: 0,
                                      left: 0,
                                      width: '100%',
                                      height: '100%',
                                      pointerEvents: 'none'
                                    }}
                                  >
                                    <path
                                      d={`M ${shape.points[0].x} ${shape.points[0].y} ${shape.points.map((p: any) => `L ${p.x} ${p.y}`).join(' ')}`}
                                      stroke={shape.color}
                                      strokeWidth={shape.brushSize}
                                      fill="none"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      opacity={shape.opacity}
                                    />
                                  </svg>
                                )
                              }
                              return null
                            })}

                            {/* Render current brush path */}
                            {toolState.currentPath.length > 1 && (
                              <svg
                                style={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  width: '100%',
                                  height: '100%',
                                  pointerEvents: 'none'
                                }}
                              >
                                <path
                                  d={`M ${toolState.currentPath[0].x} ${toolState.currentPath[0].y} ${toolState.currentPath.map(p => `L ${p.x} ${p.y}`).join(' ')}`}
                                  stroke={labels.find(l => l.id === activeLabel)?.color || '#ff0000'}
                                  strokeWidth={brushSize}
                                  fill="none"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                    </div>
                  )}
                </div>
              )
            })()
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: '#8aa',
                fontSize: '16px',
                textAlign: 'center',
                padding: '40px'
              }}>
                <div>
                  <FaEye size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                  <div>No images available for this scan</div>
                  <div style={{ fontSize: '14px', marginTop: '8px', opacity: 0.7 }}>
                    Upload images to view them here
                  </div>
                </div>
          </div>
            )}
              </div>
            </ImageViewerArea>
            
            {/* Annotations Overlay - Disabled for now */}
            {/* <ImageOverlay>
              {Array.isArray(annotations) && annotations.map(annotation => (
                <AnnotationBox
                  key={annotation.id}
                  $x={annotation.x}
                  $y={annotation.y}
                  $width={annotation.width}
                  $height={annotation.height}
                >
                  <AnnotationText>{annotation.text}</AnnotationText>
                </AnnotationBox>
              ))}
              
              {Array.isArray(measurements) && measurements.map(measurement => (
                <MeasurementLine
                  key={measurement.id}
                  $x1={measurement.x1}
                  $y1={measurement.y1}
                  $x2={measurement.x2}
                  $y2={measurement.y2}
                />
              ))}
            </ImageOverlay> */}
          </ViewerArea>
        </MainViewerArea>

        {/* Right Sidebar - Analysis */}
        <RightSidebar>
          {/* AI Model Selection */}
          <SidebarSection>
            <SectionTitle>Selected AI model</SectionTitle>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <button style={{
                background: '#0694fb',
                border: 'none',
                color: 'white',
                padding: '6px 12px',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer'
              }}>
                Add Model
              </button>
              <button style={{
                background: 'transparent',
                border: '1px solid #0694fb',
                color: '#0694fb',
                padding: '6px 12px',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer'
              }}>
                Change Model
              </button>
            </div>
            
            {/* AI Models - In a real implementation, these would come from the database */}
            <ModelCard>
              <ModelHeader>
                <ModelIcon>
                  <FaBrain size={12} />
                </ModelIcon>
                <div>
                  <ModelName>Brain Scan Segmentation</ModelName>
                  <ModelId>Model id: {meta?.caseId || analysisId}</ModelId>
            </div>
              </ModelHeader>
              <ModelTag $color="#0694fb">Brain Tumor</ModelTag>
            </ModelCard>
            
            <ModelCard>
              <ModelHeader>
                <ModelIcon>
                  <FaBrain size={12} />
                </ModelIcon>
                <div>
                  <ModelName>Brain Tumor LLM</ModelName>
                  <ModelId>Model id: {meta?.caseId || analysisId}</ModelId>
    </div>
              </ModelHeader>
              <ModelTag $color="#00ff88">Brain Tumor</ModelTag>
            </ModelCard>
          </SidebarSection>

          {/* Properties & Labels Panel */}
          <SidebarSection>
            <SectionTitle>Properties & Labels</SectionTitle>
            
            {/* Active Label */}
                            <div style={{ marginBottom: '16px' }}>
                                <div style={{ fontSize: '12px', color: '#8aa', marginBottom: '8px' }}>Active Label</div>
                                <StyledSelect
                                    value={activeLabel}
                                    onChange={(e) => setActiveLabel(e.target.value)}
                                >
                                    {labels.map(label => (
                                        <option key={label.id} value={label.id}>{label.name}</option>
                                    ))}
                                </StyledSelect>
                            </div>

            {/* Label List */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', color: '#8aa', marginBottom: '8px' }}>Label Management</div>
              {labels.map(label => (
                <div key={label.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px',
                  background: activeLabel === label.id ? 'rgba(6, 148, 251, 0.1)' : 'transparent',
                  border: activeLabel === label.id ? '1px solid #0694fb' : '1px solid transparent',
                  borderRadius: '4px',
                  marginBottom: '4px',
                  cursor: 'pointer'
                }} onClick={() => setActiveLabel(label.id)}>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    background: label.color,
                    borderRadius: '2px',
                    opacity: label.visible ? 1 : 0.3
                  }} />
                  <div style={{ flex: 1, fontSize: '12px' }}>
                    <div style={{ color: 'white' }}>{label.name}</div>
                    <div style={{ color: '#8aa', fontSize: '10px' }}>
                      {label.voxelCount} voxels
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={label.opacity}
                      onChange={(e) => {
                        setLabels(prev => prev.map(l => 
                          l.id === label.id ? { ...l, opacity: Number(e.target.value) } : l
                        ))
                      }}
                      style={{ width: '40px' }}
                      title="Opacity"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setLabels(prev => prev.map(l => 
                          l.id === label.id ? { ...l, visible: !l.visible } : l
                        ))
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: label.visible ? '#0694fb' : '#8aa',
                        cursor: 'pointer',
                        padding: '2px'
                      }}
                      title={label.visible ? 'Hide' : 'Show'}
                    >
                      <FaEye size={10} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Label */}
            <div style={{ marginBottom: '16px' }}>
              <button style={{
                width: '100%',
                background: 'transparent',
                border: '1px dashed #0694fb',
                color: '#0694fb',
                padding: '8px',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}>
                <FaPlusCircle size={10} />
                Add New Label
              </button>
            </div>

            {/* Statistics */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', color: '#8aa', marginBottom: '8px' }}>Statistics</div>
              <div style={{ fontSize: '11px', color: '#8aa', lineHeight: '1.4' }}>
                <div>Total Voxels: {labels.reduce((sum, label) => sum + label.voxelCount, 0)}</div>
                <div>Active Label: {activeLabel}</div>
                <div>Overlay Opacity: {overlayOpacity}%</div>
                <div>Brush Size: {brushSize}px</div>
              </div>
            </div>
          </SidebarSection>
          <SidebarSection>
            <ScanDetails>
              <ScanTitle>{meta?.scanType}</ScanTitle>
              <ScanSubtitle>{meta?.patient} / {meta?.caseId}</ScanSubtitle>
            </ScanDetails>
          </SidebarSection>

          {/* Confidence Score */}
          <SidebarSection>
            <ConfidenceSection>
              <ConfidenceLabel>Confidence Score</ConfidenceLabel>
              <ConfidenceScore>{meta?.confidence?.toFixed(2)}%</ConfidenceScore>
              <ConfidenceBreakdown>
                <ConfidenceItem>
                  <span>Benign</span>
                  <span>{meta?.confidence?.toFixed(2)}%</span>
                </ConfidenceItem>
                <ConfidenceItem>
                  <span>Malignant</span>
                  <span>{meta?.confidence?.toFixed(2)}%</span>
                </ConfidenceItem>
                <ConfidenceItem>
                  <span>Other</span>
                  <span>{meta?.confidence?.toFixed(2)}%</span>
                </ConfidenceItem>
              </ConfidenceBreakdown>
            </ConfidenceSection>
          </SidebarSection>

          {/* Scan Results */}
          <SidebarSection style={{ flex: 1 }}>
            <ResultsButton>
              Scan Results
            </ResultsButton>
            <ResultsText>
              {meta?.findings}
            </ResultsText>
          </SidebarSection>

          {/* Dataset Export Section */}
          <SidebarSection>
            <SectionTitle>Dataset Export</SectionTitle>
            <div style={{ marginBottom: '12px' }}>
              <button
                onClick={() => setShowExportDialog(true)}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                  border: 'none',
                  color: 'white',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(76, 175, 80, 0.4)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(76, 175, 80, 0.3)'
                }}
              >
                <FaFileExport size={16} />
                Export Annotations
              </button>
            </div>
            <div style={{ fontSize: '12px', color: '#888', lineHeight: '1.4' }}>
              Export annotations in YOLO, COCO, or Pascal VOC formats for training AI models.
            </div>
          </SidebarSection>
        </RightSidebar>
      </ContentArea>
    </MainContainer>
    
    {/* ROI Validation Message */}
    {showValidationMessage && (
      <div
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          zIndex: 1000,
          fontSize: '14px',
          fontWeight: '500',
          maxWidth: '300px',
          animation: 'slideIn 0.3s ease-out'
        }}
      >
        {validationMessage}
      </div>
    )}
    
    {/* Dataset Export Dialog */}
    {showExportDialog && (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          backdropFilter: 'blur(8px)'
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowExportDialog(false)
          }
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
            padding: '24px',
            borderRadius: '16px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            minWidth: '400px',
            maxWidth: '500px'
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px'
          }}>
            <h3 style={{
              margin: 0,
              color: 'white',
              fontSize: '18px',
              fontWeight: '600'
            }}>
              Export Annotations Dataset
            </h3>
            <button
              onClick={() => setShowExportDialog(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#888',
                fontSize: '20px',
                cursor: 'pointer',
                padding: '0',
                width: '24px',
                height: '24px'
              }}
            >
              <FaTimes />
            </button>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              color: 'white',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              Dataset Format
            </label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '14px'
              }}
            >
              <option value="yolo">YOLO Format (.txt)</option>
              <option value="coco">COCO Format (.json)</option>
              <option value="pascal_voc">Pascal VOC Format (.xml)</option>
            </select>
            <div style={{
              fontSize: '12px',
              color: '#888',
              marginTop: '6px',
              lineHeight: '1.4'
            }}>
              {exportFormat === 'yolo' && 'Best for object detection training with normalized coordinates.'}
              {exportFormat === 'coco' && 'Comprehensive format with metadata and categories.'}
              {exportFormat === 'pascal_voc' && 'Industry standard XML format for detailed annotations.'}
            </div>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              color: 'white',
              fontSize: '14px'
            }}>
              <input
                type="checkbox"
                checked={includeMeasurements}
                onChange={(e) => setIncludeMeasurements(e.target.checked)}
                style={{ transform: 'scale(1.2)' }}
              />
              Include Measurement Annotations
            </label>
            <div style={{
              fontSize: '12px',
              color: '#888',
              marginTop: '6px',
              marginLeft: '24px'
            }}>
              Include ruler measurements, angles, and statistical shapes in the dataset.
            </div>
          </div>
          
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end'
          }}>
            <button
              onClick={() => setShowExportDialog(false)}
              style={{
                background: 'transparent',
                border: '1px solid #888',
                color: '#888',
                padding: '10px 20px',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = '#ccc'
                e.currentTarget.style.color = '#ccc'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = '#888'
                e.currentTarget.style.color = '#888'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleExportAnnotations}
              disabled={exporting}
              style={{
                background: exporting 
                  ? '#666' 
                  : 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                border: 'none',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: exporting ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {exporting ? <FaSpinner /> : <FaFileExport />}
              {exporting ? 'Exporting...' : 'Export Dataset'}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}

export default AnalysisDetail