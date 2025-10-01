'use client'

import React, { useState, useRef, useEffect } from 'react';
import { FaSearchPlus, FaSearchMinus, FaExpand, FaCompress, FaDownload, FaRedo, FaFileMedical, FaInfoCircle } from 'react-icons/fa';
import styled from 'styled-components';
import { isDicomFile } from '@/utils/fileUtils';
import { supabase } from '@/lib/supabase';
import DicomViewer from './DicomViewer';

interface ImageViewerProps {
  imageUrl: string;
  alt?: string;
  className?: string;
  showControls?: boolean;
  initialZoom?: number;
  maxZoom?: number;
  minZoom?: number;
  inlineDicomViewer?: boolean; // New prop for inline DICOM viewing
  externalTransform?: { scale: number; translateX: number; translateY: number };
  disableInteractions?: boolean;
  onTransformChange?: (transform: { scale: number; translateX: number; translateY: number }) => void;
}

const ViewerContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  background: #000;
  overflow: hidden;
  border-radius: 8px;
  user-select: none;
`;

const ImageContainer = styled.div<{ scale: number; translateX: number; translateY: number }>`
  position: relative;
  transform: translate(${props => props.translateX}px, ${props => props.translateY}px) scale(${props => props.scale});
  transform-origin: 0 0;
  transition: transform 0.1s ease-out;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Image = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  filter: contrast(1.1) brightness(1.1);
  transition: all 0.3s ease;
`;

const Controls = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  gap: 8px;
  background: rgba(0, 0, 0, 0.7);
  padding: 8px;
  border-radius: 6px;
  backdrop-filter: blur(10px);
`;

const ControlButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.05);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ZoomInfo = styled.div`
  position: absolute;
  bottom: 16px;
  left: 16px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  backdrop-filter: blur(10px);
`;


// Inline DICOM Viewer Components
const DicomContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
  color: white;
  padding: 40px;
  text-align: center;
`;

const DicomIcon = styled.div`
  font-size: 80px;
  color: #0694fb;
  margin-bottom: 24px;
  opacity: 0.9;
`;

const DicomTitle = styled.h3`
  color: #0694fb;
  margin: 0 0 16px 0;
  font-size: 24px;
  font-weight: 600;
`;

const DicomMessage = styled.div`
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 24px;
  opacity: 0.9;
  max-width: 500px;
`;

const DicomButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
`;

const DicomButton = styled.button`
  background: rgba(6, 148, 251, 0.2);
  border: 1px solid rgba(6, 148, 251, 0.5);
  color: #0694fb;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(6, 148, 251, 0.3);
    transform: translateY(-2px);
  }
`;

const DicomMetadata = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 16px;
  margin-top: 20px;
  text-align: left;
  font-size: 14px;
  line-height: 1.5;
`;

const MetadataRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const MetadataLabel = styled.span`
  color: #8aa;
  font-weight: 500;
`;

const MetadataValue = styled.span`
  color: #fff;
`;

const ImageViewer: React.FC<ImageViewerProps> = ({
  imageUrl,
  alt = 'Medical scan image',
  className,
  showControls = true,
  initialZoom = 1,
  maxZoom = 5,
  minZoom = 0.5,
  inlineDicomViewer = false,
  externalTransform,
  disableInteractions,
  onTransformChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [scale, setScale] = useState(initialZoom);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDicomViewer, setShowDicomViewer] = useState(false);
  const [dicomMetadata, setDicomMetadata] = useState<any>(null);

  const isDicom = isDicomFile(imageUrl);

  // Debug logging
  console.log('🔍 ImageViewer file analysis:', {
    imageUrl,
    alt,
    isDicom,
    inlineDicomViewer,
    willUseDicomViewer: isDicom && inlineDicomViewer
  });

  useEffect(() => {
    setIsLoading(true);
    if (!externalTransform) {
      setScale(initialZoom);
      setTranslateX(0);
      setTranslateY(0);
    } else {
      setScale(externalTransform.scale);
      setTranslateX(externalTransform.translateX);
      setTranslateY(externalTransform.translateY);
    }
    setRotation(0);
  }, [imageUrl, initialZoom, externalTransform]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleImageLoad = () => {
    console.log('🖼️ Regular image loaded successfully');
    setIsLoading(false);
  };

  const handleImageError = () => {
    console.log('❌ Regular image failed to load');
    setIsLoading(false);
  };

  const handleZoomIn = () => {
    if (disableInteractions) return;
    
    const newScale = Math.min(scale * 1.2, maxZoom);
    setScale(newScale);
    
    if (onTransformChange) {
      onTransformChange({
        scale: newScale,
        translateX,
        translateY
      });
    }
  };

  const handleZoomOut = () => {
    if (disableInteractions) return;
    
    const newScale = Math.max(scale / 1.2, minZoom);
    setScale(newScale);
    
    if (onTransformChange) {
      onTransformChange({
        scale: newScale,
        translateX,
        translateY
      });
    }
  };

  const handleReset = () => {
    if (disableInteractions) return;
    
    setScale(initialZoom);
    setTranslateX(0);
    setTranslateY(0);
    setRotation(0);
    
    if (onTransformChange) {
      onTransformChange({
        scale: initialZoom,
        translateX: 0,
        translateY: 0
      });
    }
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = alt || 'image';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 && !disableInteractions) { // Left click only
      setIsDragging(true);
      setDragStart({ x: e.clientX - translateX, y: e.clientY - translateY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && !disableInteractions) {
      const newTranslateX = e.clientX - dragStart.x;
      const newTranslateY = e.clientY - dragStart.y;
      setTranslateX(newTranslateX);
      setTranslateY(newTranslateY);
      
      // Notify parent of transform changes
      if (onTransformChange) {
        onTransformChange({
          scale,
          translateX: newTranslateX,
          translateY: newTranslateY
        });
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (disableInteractions) return;
    
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(minZoom, Math.min(maxZoom, scale * delta));
    setScale(newScale);
    
    // Notify parent of transform changes
    if (onTransformChange) {
      onTransformChange({
        scale: newScale,
        translateX,
        translateY
      });
    }
  };

  const handleDicomDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = alt || 'dicom-file';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenOHIF = () => {
    window.open('https://viewer.ohif.org/', '_blank');
  };

  const handleShowMetadata = () => {
    // For now, show basic metadata
    // In a real implementation, you'd fetch DICOM metadata from the API
    setDicomMetadata({
      fileName: alt || 'DICOM File',
      fileSize: 'Unknown',
      modality: 'Unknown',
      studyDate: 'Unknown',
      patientName: 'Unknown'
    });
  };

  const effectiveScale = externalTransform ? externalTransform.scale : scale;
  const effectiveTranslateX = externalTransform ? externalTransform.translateX : translateX;
  const effectiveTranslateY = externalTransform ? externalTransform.translateY : translateY;

  const attachHandlers = !disableInteractions && !externalTransform;

  return (
    <ViewerContainer
      ref={containerRef}
      className={className}
      onMouseDown={attachHandlers ? handleMouseDown : undefined}
      onMouseMove={attachHandlers ? handleMouseMove : undefined}
      onMouseUp={attachHandlers ? handleMouseUp : undefined}
      onMouseLeave={attachHandlers ? handleMouseUp : undefined}
      onWheel={attachHandlers ? handleWheel : undefined}
    >
      {isDicom && inlineDicomViewer ? (
        <DicomViewer
          dicomUrl={imageUrl}
          fileName={alt || 'DICOM File'}
          showControls={showControls}
        />
      ) : isDicom ? (
        <DicomContainer>
          <DicomIcon>
            <FaFileMedical />
          </DicomIcon>
          <DicomTitle>DICOM File</DicomTitle>
          <DicomMessage>
            This is a DICOM medical imaging file.<br />
            Click below to open in the DICOM viewer.
          </DicomMessage>
          <DicomButton onClick={() => setShowDicomViewer(true)}>
            Open DICOM Viewer
          </DicomButton>
        </DicomContainer>
      ) : (
        <>
          <ImageContainer
            scale={effectiveScale}
            translateX={effectiveTranslateX}
            translateY={effectiveTranslateY}
          >
            <Image
              src={imageUrl}
              alt={alt}
              onLoad={handleImageLoad}
              onError={handleImageError}
              draggable={false}
              style={{ transform: `rotate(${rotation}deg)` }}
            />
          </ImageContainer>
        </>
      )}

      {showControls && !isDicom && !externalTransform && !disableInteractions && (
        <Controls>
          <ControlButton onClick={handleZoomIn} disabled={scale >= maxZoom}>
            <FaSearchPlus />
          </ControlButton>
          <ControlButton onClick={handleZoomOut} disabled={scale <= minZoom}>
            <FaSearchMinus />
          </ControlButton>
          <ControlButton onClick={handleReset}>
            <FaCompress />
          </ControlButton>
          <ControlButton onClick={handleRotate}>
            <FaRedo />
          </ControlButton>
          <ControlButton onClick={handleDownload}>
            <FaDownload />
          </ControlButton>
          <ControlButton onClick={toggleFullscreen}>
            {isFullscreen ? <FaCompress /> : <FaExpand />}
          </ControlButton>
        </Controls>
      )}

      {showControls && !isDicom && (
        <ZoomInfo>
          Zoom: {Math.round(scale * 100)}%
        </ZoomInfo>
      )}
    </ViewerContainer>
  );
};

export default ImageViewer;