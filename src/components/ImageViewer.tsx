'use client'

import React, { useState, useRef, useEffect } from 'react';
import { FaSearchPlus, FaSearchMinus, FaExpand, FaCompress, FaDownload, FaRedo } from 'react-icons/fa';
import styled from 'styled-components';

interface ImageViewerProps {
  imageUrl: string;
  alt?: string;
  className?: string;
  showControls?: boolean;
  initialZoom?: number;
  maxZoom?: number;
  minZoom?: number;
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
  width: 100%;
  height: 100%;
  transform: scale(${props => props.scale}) translate(${props => props.translateX}px, ${props => props.translateY}px);
  transform-origin: center center;
  transition: transform 0.1s ease-out;
  cursor: ${props => props.scale > 1 ? 'grab' : 'default'};
  
  &:active {
    cursor: ${props => props.scale > 1 ? 'grabbing' : 'default'};
  }
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
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
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.05);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
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

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
`;

const ImageViewer: React.FC<ImageViewerProps> = ({
  imageUrl,
  alt = 'Medical scan image',
  className,
  showControls = true,
  initialZoom = 1,
  maxZoom = 5,
  minZoom = 0.5
}) => {
  const [scale, setScale] = useState(initialZoom);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoading(true);
  }, [imageUrl]);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev * 1.2, maxZoom));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev / 1.2, minZoom));
  };

  const handleReset = () => {
    setScale(initialZoom);
    setTranslateX(0);
    setTranslateY(0);
  };

  const handleRotate = () => {
    // Simple rotation by 90 degrees
    setScale(prev => prev);
    // Note: For actual rotation, you'd need to modify the image transform
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `scan-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - translateX, y: e.clientY - translateY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setTranslateX(e.clientX - dragStart.x);
      setTranslateY(e.clientY - dragStart.y);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prev => Math.max(minZoom, Math.min(maxZoom, prev * delta)));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <ViewerContainer
      ref={containerRef}
      className={className}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {isLoading && (
        <LoadingOverlay>
          Loading image...
        </LoadingOverlay>
      )}
      
      <ImageContainer
        scale={scale}
        translateX={translateX}
        translateY={translateY}
      >
        <Image
          src={imageUrl}
          alt={alt}
          onLoad={handleImageLoad}
          draggable={false}
        />
      </ImageContainer>

      {showControls && (
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

      <ZoomInfo>
        Zoom: {Math.round(scale * 100)}%
      </ZoomInfo>
    </ViewerContainer>
  );
};

export default ImageViewer;
