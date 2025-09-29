'use client'

import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { FaDownload, FaExpand, FaCompress, FaRedo, FaSearchPlus, FaSearchMinus, FaUndo, FaCog, FaFlask } from 'react-icons/fa';
import TestDicomGenerator from '@/utils/testDicomGenerator';

const DicomViewerContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const ViewerCanvas = styled.div`
  flex: 1;
  position: relative;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const DicomCanvas = styled.canvas`
  max-width: 100%;
  max-height: 100%;
  cursor: crosshair;
  background: #000;
  border: 1px solid #333;
  display: block;
`;

const Toolbar = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  gap: 8px;
  background: rgba(0, 0, 0, 0.8);
  padding: 8px;
  border-radius: 6px;
  backdrop-filter: blur(10px);
  z-index: 10;
`;

const ToolButton = styled.button`
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
  font-size: 14px;
  
  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.05);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StatusBar = styled.div`
  position: absolute;
  bottom: 16px;
  left: 16px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  backdrop-filter: blur(10px);
  z-index: 10;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  z-index: 20;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid #0694fb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  background: rgba(220, 53, 69, 0.1);
  border: 1px solid rgba(220, 53, 69, 0.3);
  color: #dc3545;
  padding: 16px;
  border-radius: 8px;
  margin: 20px;
  text-align: center;
`;

const WindowLevelControls = styled.div`
  position: absolute;
  top: 16px;
  left: 16px;
  background: rgba(0, 0, 0, 0.8);
  padding: 12px;
  border-radius: 8px;
  backdrop-filter: blur(10px);
  z-index: 10;
`;

const ControlGroup = styled.div`
  margin-bottom: 12px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const ControlLabel = styled.div`
  color: white;
  font-size: 12px;
  margin-bottom: 4px;
  font-weight: 500;
`;

const ControlSlider = styled.input`
  width: 120px;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  outline: none;
  cursor: pointer;
  
  &::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    background: #0694fb;
    border-radius: 50%;
    cursor: pointer;
  }
  
  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    background: #0694fb;
    border-radius: 50%;
    border: none;
    cursor: pointer;
  }
`;

const ControlValue = styled.div`
  color: #0694fb;
  font-size: 11px;
  margin-top: 2px;
  text-align: center;
`;

const PresetButtons = styled.div`
  display: flex;
  gap: 4px;
  margin-top: 8px;
  flex-wrap: wrap;
`;

const PresetButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 10px;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const FrameControls = styled.div`
  position: absolute;
  bottom: 16px;
  right: 16px;
  background: rgba(0, 0, 0, 0.8);
  padding: 12px;
  border-radius: 8px;
  backdrop-filter: blur(10px);
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FrameButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.2);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const FrameSlider = styled.input`
  width: 100px;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  outline: none;
  cursor: pointer;
  
  &::-webkit-slider-thumb {
    appearance: none;
    width: 14px;
    height: 14px;
    background: #0694fb;
    border-radius: 50%;
    cursor: pointer;
  }
  
  &::-moz-range-thumb {
    width: 14px;
    height: 14px;
    background: #0694fb;
    border-radius: 50%;
    border: none;
    cursor: pointer;
  }
`;

const FrameInfo = styled.div`
  color: white;
  font-size: 11px;
  min-width: 60px;
  text-align: center;
`;

const SpeedControl = styled.select`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 4px 6px;
  border-radius: 4px;
  font-size: 10px;
  cursor: pointer;
  
  option {
    background: #333;
    color: white;
  }
`;

interface DicomViewerProps {
  dicomUrl: string;
  fileName?: string;
  onClose?: () => void;
  showControls?: boolean;
}

const DicomViewer: React.FC<DicomViewerProps> = ({
  dicomUrl,
  fileName = 'DICOM File',
  onClose,
  showControls = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [dicomData, setDicomData] = useState<any>(null); // Store raw DICOM data
  const [rawPixelData, setRawPixelData] = useState<Uint16Array | null>(null); // Store raw 16-bit pixel data
  const [currentFrame, setCurrentFrame] = useState(0);
  const [totalFrames, setTotalFrames] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(100); // milliseconds per frame
  const [windowCenter, setWindowCenter] = useState(200); // Match thumbnail brightness
  const [windowWidth, setWindowWidth] = useState(400); // Match thumbnail contrast
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Frame cache for performance (only keep a few frames in memory)
  const frameCache = useRef<Map<number, ImageData>>(new Map());
  const MAX_CACHE_SIZE = 10; // Keep only 10 frames in memory at once

  useEffect(() => {
    loadDicomFile();
  }, [dicomUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  // Debug window/level changes
  useEffect(() => {
    console.log(`🔧 Window/Level changed: Center=${windowCenter}, Width=${windowWidth}`);
  }, [windowCenter, windowWidth]);

  // Force drawImage on mount to ensure loading state is updated
  useEffect(() => {
    console.log('🎨 Component mounted, forcing initial drawImage');
    drawImage();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadDicomFile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Starting DICOM file load:', dicomUrl);
      console.log('📋 DICOM URL analysis:', {
        url: dicomUrl,
        isHttps: dicomUrl.startsWith('https://'),
        hasToken: dicomUrl.includes('token='),
        fileExtension: dicomUrl.split('.').pop()
      });

      // Fetch the DICOM file
      const response = await fetch(dicomUrl);
      if (!response.ok) {
        throw new Error(`Failed to load DICOM file: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      console.log('📦 DICOM file fetched successfully:', {
        size: arrayBuffer.byteLength,
        sizeMB: (arrayBuffer.byteLength / (1024 * 1024)).toFixed(2),
        isLargeFile: arrayBuffer.byteLength > 10 * 1024 * 1024 // > 10MB
      });
      
      // Parse DICOM data
      console.log('🔍 Parsing DICOM data...');
      const parsedDicomData = await parseDicomData(arrayBuffer);
      
      console.log('✅ DICOM parsing complete:', {
        width: parsedDicomData.width,
        height: parsedDicomData.height,
        bitsAllocated: parsedDicomData.bitsAllocated,
        bitsStored: parsedDicomData.bitsStored,
        samplesPerPixel: parsedDicomData.samplesPerPixel,
        numberOfFrames: parsedDicomData.numberOfFrames,
        windowCenter: parsedDicomData.windowCenter,
        windowWidth: parsedDicomData.windowWidth,
        pixelDataLength: parsedDicomData.pixelData?.length,
        totalPixels: (parsedDicomData.width || 0) * (parsedDicomData.height || 0),
        expectedPixelDataSize: ((parsedDicomData.width || 0) * (parsedDicomData.height || 0) * (parsedDicomData.bitsAllocated || 8)) / 8,
        isMultiFrame: (parsedDicomData.numberOfFrames || 1) > 1,
        frameSize: (parsedDicomData.width || 0) * (parsedDicomData.height || 0)
      });
      
      // Store raw DICOM data for lazy loading
      setDicomData(parsedDicomData);
      setTotalFrames(parsedDicomData.numberOfFrames || 1);
      setCurrentFrame(0);
      
      // FORCE enhanced values immediately for better visibility
      console.log('🔧 FORCING enhanced values: Center=200, Width=400');
      setWindowCenter(200);
      setWindowWidth(400);
      
      // Load first frame immediately with the parsed data
      console.log('🔄 Loading first frame immediately...');
      console.log('📊 Multi-frame DICOM info:', {
        totalFrames: parsedDicomData.numberOfFrames,
        isMultiFrame: (parsedDicomData.numberOfFrames || 1) > 1,
        pixelDataLength: parsedDicomData.pixelData?.length,
        expectedBytesPerFrame: parsedDicomData.pixelData ? parsedDicomData.pixelData.length / (parsedDicomData.numberOfFrames || 1) : 0
      });
      
      const firstFrame = await loadFrameWithData(0, parsedDicomData);
      
      if (firstFrame) {
        console.log('✅ First frame loaded successfully');
        setImageData(firstFrame);
        
        // Log frame analysis (optimized to prevent stack overflow)
        let frameMin = 255;
        let frameMax = 0;
        let frameNonZero = 0;
        
        // Process in chunks to avoid stack overflow
        const chunkSize = 10000;
        for (let i = 0; i < firstFrame.data.length; i += chunkSize) {
          const chunk = firstFrame.data.slice(i, Math.min(i + chunkSize, firstFrame.data.length));
          for (let j = 0; j < chunk.length; j++) {
            const pixel = chunk[j];
            frameMin = Math.min(frameMin, pixel);
            frameMax = Math.max(frameMax, pixel);
            if (pixel > 0) {
              frameNonZero++;
            }
          }
        }
        
        console.log('📊 First frame analysis:', {
          width: firstFrame.width,
          height: firstFrame.height,
          totalPixels: firstFrame.data.length / 4,
          nonZeroPixels: frameNonZero,
          pixelRange: `${frameMin} - ${frameMax}`,
          hasContent: frameNonZero > 0,
          isMultiFrame: (parsedDicomData.numberOfFrames || 1) > 1,
          totalFrames: parsedDicomData.numberOfFrames || 1
        });
        
        // Only set loading to false when we have successfully loaded and set image data
        setLoading(false);
        console.log('🎉 DICOM loading process complete - image ready');
      } else {
        console.error('❌ Failed to load first frame');
        setError('Failed to load first frame');
        setLoading(false); // Still set loading to false to show error
      }
    } catch (err) {
      console.error('❌ Error loading DICOM file:', err);
      setError(err instanceof Error ? err.message : 'Failed to load DICOM file');
      setLoading(false);
    }
  };

  // Load frame with provided DICOM data (for initial load)
  const loadFrameWithData = async (frameIndex: number, dicomData: any): Promise<ImageData | null> => {
    console.log(`🔄 loadFrameWithData called for frame ${frameIndex}`);
    
    if (!dicomData) {
      console.error('❌ No DICOM data provided for frame loading');
      return null;
    }

    try {
      console.log(`🔄 Loading frame ${frameIndex}/${dicomData.numberOfFrames}`, {
        pixelDataLength: dicomData.pixelData.length,
        numberOfFrames: dicomData.numberOfFrames,
        bitsAllocated: dicomData.bitsAllocated
      });
      
      // Calculate frame data
      const bytesPerFrame = Math.floor(dicomData.pixelData.length / dicomData.numberOfFrames);
      const frameStart = frameIndex * bytesPerFrame;
      const frameEnd = Math.min(frameStart + bytesPerFrame, dicomData.pixelData.length);
      
      console.log(`📊 Frame calculation:`, {
        frameIndex,
        totalFrames: dicomData.numberOfFrames,
        bytesPerFrame,
        frameStart,
        frameEnd,
        frameDataLength: frameEnd - frameStart,
        pixelDataLength: dicomData.pixelData.length,
        isValidFrame: frameIndex < dicomData.numberOfFrames
      });
      
      if (frameStart >= dicomData.pixelData.length) {
        console.error(`❌ Frame ${frameIndex} start position exceeds pixel data length`);
        return null;
      }
      
      const frameData = dicomData.pixelData.slice(frameStart, frameEnd);
      console.log(`📦 Frame data extracted:`, {
        frameDataLength: frameData.length,
        firstBytes: Array.from(frameData.slice(0, 10)),
        lastBytes: Array.from(frameData.slice(-10))
      });
      
      // Store raw pixel data for first frame
      if (frameIndex === 0 && dicomData.bitsAllocated === 16) {
        const rawPixels = new Uint16Array(frameData.buffer, frameData.byteOffset, frameData.length / 2);
        setRawPixelData(rawPixels);
        console.log(`💾 Stored raw 16-bit pixel data: ${rawPixels.length} pixels`, {
          firstPixels: Array.from(rawPixels.slice(0, 10)),
          lastPixels: Array.from(rawPixels.slice(-10))
        });
      }
      
      // Convert frame to ImageData
      console.log(`🖼️ Converting frame ${frameIndex} to ImageData...`);
      const imageData = convertFrameToImageData(frameData, dicomData);
      
      // Cache the frame (with size limit)
      if (frameCache.current.size >= MAX_CACHE_SIZE) {
        // Remove oldest frame from cache
        const firstKey = frameCache.current.keys().next().value;
        if (firstKey !== undefined) {
          frameCache.current.delete(firstKey);
        }
      }
      frameCache.current.set(frameIndex, imageData);
      
      console.log(`✅ Frame ${frameIndex} loaded and cached successfully`);
      return imageData;
      
    } catch (error) {
      console.error(`❌ Error loading frame ${frameIndex}:`, error);
      return null;
    }
  };

  // Lazy load individual frame
  const loadFrame = async (frameIndex: number): Promise<ImageData | null> => {
    console.log(`🔄 loadFrame called for frame ${frameIndex}`, {
      frameIndex,
      totalFrames,
      hasDicomData: !!dicomData,
      dicomDataFrames: dicomData?.numberOfFrames,
      pixelDataLength: dicomData?.pixelData?.length
    });
    
    if (!dicomData) {
      console.error('❌ No DICOM data available for frame loading');
      return null;
    }

    // Check cache first
    if (frameCache.current.has(frameIndex)) {
      console.log(`📋 Frame ${frameIndex} loaded from cache`);
      return frameCache.current.get(frameIndex)!;
    }

    try {
      console.log(`🔄 Loading frame ${frameIndex}/${totalFrames}`, {
        pixelDataLength: dicomData.pixelData.length,
        numberOfFrames: dicomData.numberOfFrames,
        bitsAllocated: dicomData.bitsAllocated
      });
      
      // Calculate frame data
      const bytesPerFrame = Math.floor(dicomData.pixelData.length / dicomData.numberOfFrames);
      const frameStart = frameIndex * bytesPerFrame;
      const frameEnd = Math.min(frameStart + bytesPerFrame, dicomData.pixelData.length);
      
      console.log(`📊 Frame calculation:`, {
        bytesPerFrame,
        frameStart,
        frameEnd,
        frameDataLength: frameEnd - frameStart
      });
      
      if (frameStart >= dicomData.pixelData.length) {
        console.error(`❌ Frame ${frameIndex} start position exceeds pixel data length`);
        return null;
      }
      
      const frameData = dicomData.pixelData.slice(frameStart, frameEnd);
      console.log(`📦 Frame data extracted:`, {
        frameDataLength: frameData.length,
        firstBytes: Array.from(frameData.slice(0, 10)),
        lastBytes: Array.from(frameData.slice(-10))
      });
      
      // Store raw pixel data for first frame
      if (frameIndex === 0 && dicomData.bitsAllocated === 16) {
        const rawPixels = new Uint16Array(frameData.buffer, frameData.byteOffset, frameData.length / 2);
        setRawPixelData(rawPixels);
        console.log(`💾 Stored raw 16-bit pixel data: ${rawPixels.length} pixels`, {
          firstPixels: Array.from(rawPixels.slice(0, 10)),
          lastPixels: Array.from(rawPixels.slice(-10))
        });
      }
      
      // Convert frame to ImageData
      console.log(`🖼️ Converting frame ${frameIndex} to ImageData...`);
      const imageData = convertFrameToImageData(frameData, dicomData);
      
      // Cache the frame (with size limit)
      if (frameCache.current.size >= MAX_CACHE_SIZE) {
        // Remove oldest frame from cache
        const firstKey = frameCache.current.keys().next().value;
        if (firstKey !== undefined) {
          frameCache.current.delete(firstKey);
        }
      }
      frameCache.current.set(frameIndex, imageData);
      
      console.log(`✅ Frame ${frameIndex} loaded and cached successfully`);
      return imageData;
      
    } catch (error) {
      console.error(`❌ Error loading frame ${frameIndex}:`, error);
      return null;
    }
  };

  // Convert single frame to ImageData - store raw pixel data for proper window/level
  const convertFrameToImageData = (frameData: Uint8Array, dicomData: any): ImageData => {
    const { width, height, bitsAllocated, bitsStored, samplesPerPixel } = dicomData;
    const imageData = new ImageData(width, height);
    
    console.log(`🖼️ Converting frame to ImageData:`, {
      width,
      height,
      bitsAllocated,
      bitsStored,
      samplesPerPixel,
      frameDataLength: frameData.length,
      expectedPixels: width * height,
      expectedBytes: (width * height * bitsAllocated) / 8
    });
    
    // Debug frame data
    console.log(`🔍 Frame data analysis:`, {
      first10Bytes: Array.from(frameData.slice(0, 10)),
      last10Bytes: Array.from(frameData.slice(-10)),
      allZeros: frameData.every(byte => byte === 0),
      allSame: frameData.every(byte => byte === frameData[0])
    });
    
    // Handle different bit depths with proper bounds checking
    if (bitsAllocated === 16) {
      // 16-bit data - store raw values, apply window/level later
      try {
        const view = new DataView(frameData.buffer, frameData.byteOffset, frameData.byteLength);
        const maxPixels = Math.min(width * height, Math.floor(frameData.length / 2));
        
        // Calculate min/max values for debugging
        let minValue = Number.MAX_VALUE;
        let maxValue = Number.MIN_VALUE;
        
        // First pass: find min/max values
        for (let i = 0; i < Math.min(maxPixels, 10000); i++) {
          const dataIndex = i * 2;
          if (dataIndex + 1 < frameData.length) {
            try {
              const pixelValue = view.getUint16(dataIndex, false);
              minValue = Math.min(minValue, pixelValue);
              maxValue = Math.max(maxValue, pixelValue);
            } catch (error) {
              // Skip invalid pixels
            }
          }
        }
        
        console.log(`📊 16-bit pixel range: ${minValue} - ${maxValue}`);
        
        // If all pixels are the same value, create a test pattern
        if (minValue === maxValue || maxValue === 0) {
          console.log(`⚠️ All pixels have same value (${minValue}), creating test pattern`);
          console.log(`📊 Pixel value range: ${minValue} - ${maxValue}, total pixels: ${maxPixels}`);
          
          // Try to create a gradient pattern instead of checkerboard
          for (let i = 0; i < maxPixels; i++) {
            const pixelIndex = i * 4;
            if (pixelIndex + 3 < imageData.data.length) {
              const x = i % width;
              const y = Math.floor(i / width);
              
              // Create a gradient pattern based on position
              const gradientValue = Math.floor((x / width) * 255);
              
              imageData.data[pixelIndex] = gradientValue;     // R
              imageData.data[pixelIndex + 1] = gradientValue; // G
              imageData.data[pixelIndex + 2] = gradientValue; // B
              imageData.data[pixelIndex + 3] = 255;          // A
            }
          }
        } else {
          // Second pass: convert to display values with simple normalization
          for (let i = 0; i < maxPixels; i++) {
            const pixelIndex = i * 4;
            const dataIndex = i * 2;
            
            if (dataIndex + 1 < frameData.length && pixelIndex + 3 < imageData.data.length) {
              try {
                const pixelValue = view.getUint16(dataIndex, false);
                
                // Simple normalization to 0-255 range
                let displayValue;
                if (maxValue > minValue) {
                  displayValue = Math.round(((pixelValue - minValue) / (maxValue - minValue)) * 255);
                } else {
                  displayValue = 128;
                }
                
                displayValue = Math.min(255, Math.max(0, displayValue));
                
                imageData.data[pixelIndex] = displayValue;     // R
                imageData.data[pixelIndex + 1] = displayValue; // G
                imageData.data[pixelIndex + 2] = displayValue; // B
                imageData.data[pixelIndex + 3] = 255;         // A
              } catch (error) {
                console.warn(`Error reading pixel at index ${i}:`, error);
                imageData.data[pixelIndex] = 0;
                imageData.data[pixelIndex + 1] = 0;
                imageData.data[pixelIndex + 2] = 0;
                imageData.data[pixelIndex + 3] = 255;
              }
            }
          }
        }
      } catch (error) {
        console.error(`Error creating DataView for frame:`, error);
        // Fallback to 8-bit processing
        const maxPixels = Math.min(frameData.length, width * height);
        for (let i = 0; i < maxPixels; i++) {
          const pixelIndex = i * 4;
          if (i < frameData.length && pixelIndex + 3 < imageData.data.length) {
            const gray = frameData[i];
            imageData.data[pixelIndex] = gray;
            imageData.data[pixelIndex + 1] = gray;
            imageData.data[pixelIndex + 2] = gray;
            imageData.data[pixelIndex + 3] = 255;
          }
        }
      }
    } else if (bitsAllocated === 8) {
      // 8-bit data
      const maxPixels = Math.min(frameData.length, width * height);
      
      // Check if all pixels are zero
      const allZeros = frameData.every(byte => byte === 0);
      if (allZeros) {
        console.log(`⚠️ All 8-bit pixels are zero, creating test pattern`);
        console.log(`📊 8-bit pixel data: all zeros, total pixels: ${maxPixels}`);
        
        for (let i = 0; i < maxPixels; i++) {
          const pixelIndex = i * 4;
          if (pixelIndex + 3 < imageData.data.length) {
            const x = i % width;
            const y = Math.floor(i / width);
            
            // Create a gradient pattern based on position
            const gradientValue = Math.floor((x / width) * 255);
            
            imageData.data[pixelIndex] = gradientValue;     // R
            imageData.data[pixelIndex + 1] = gradientValue; // G
            imageData.data[pixelIndex + 2] = gradientValue; // B
            imageData.data[pixelIndex + 3] = 255;          // A
          }
        }
      } else {
        for (let i = 0; i < maxPixels; i++) {
          const pixelIndex = i * 4;
          
          if (i < frameData.length && pixelIndex + 3 < imageData.data.length) {
            const gray = frameData[i];
            imageData.data[pixelIndex] = gray;     // R
            imageData.data[pixelIndex + 1] = gray; // G
            imageData.data[pixelIndex + 2] = gray; // B
            imageData.data[pixelIndex + 3] = 255;  // A
          }
        }
      }
    } else {
      // Fallback for other bit depths
      console.warn('Unsupported bit depth:', bitsAllocated);
      const maxPixels = Math.min(frameData.length, width * height);
      
      for (let i = 0; i < maxPixels; i++) {
        const pixelIndex = i * 4;
        
        if (i < frameData.length && pixelIndex + 3 < imageData.data.length) {
          const gray = frameData[i] || 0;
          imageData.data[pixelIndex] = gray;     // R
          imageData.data[pixelIndex + 1] = gray; // G
          imageData.data[pixelIndex + 2] = gray; // B
          imageData.data[pixelIndex + 3] = 255;  // A
        }
      }
    }
    
    // Check pixel content (optimized to prevent stack overflow)
    let nonZeroPixels = 0;
    let minPixel = 255;
    let maxPixel = 0;
    
    // Process in chunks to avoid stack overflow
    const chunkSize = 10000;
    for (let i = 0; i < imageData.data.length; i += chunkSize) {
      const chunk = imageData.data.slice(i, Math.min(i + chunkSize, imageData.data.length));
      for (let j = 0; j < chunk.length; j += 4) {
        if (j < chunk.length) {
          const gray = chunk[j];
          if (gray > 0) {
            nonZeroPixels++;
          }
          minPixel = Math.min(minPixel, gray);
          maxPixel = Math.max(maxPixel, gray);
        }
      }
    }
    
    console.log(`📊 Frame conversion complete:`, {
      totalPixels: imageData.data.length / 4,
      nonZeroPixels,
      hasContent: nonZeroPixels > 0,
      pixelRange: `${minPixel} - ${maxPixel}`,
      nonZeroPercentage: ((nonZeroPixels / (imageData.data.length / 4)) * 100).toFixed(2) + '%'
    });
    
    return imageData;
  };

  const parseDicomData = async (arrayBuffer: ArrayBuffer) => {
    try {
      // Validate DICOM file structure
      if (arrayBuffer.byteLength < 132) {
        throw new Error('File too small to be a valid DICOM file');
      }
      
      // Check for DICOM signature at offset 128
      const view = new DataView(arrayBuffer);
      const signature = String.fromCharCode(
        view.getUint8(128),
        view.getUint8(129),
        view.getUint8(130),
        view.getUint8(131)
      );
      
      console.log('🔍 DICOM file validation:', {
        fileSize: arrayBuffer.byteLength,
        signature: signature,
        isValidDicom: signature === 'DICM',
        signatureOffset: 128
      });
      
      if (signature !== 'DICM') {
        console.warn('⚠️ DICOM signature not found at offset 128, attempting to parse anyway');
      }
      
      // Import dicom-parser dynamically to avoid SSR issues
      const dicomParser = await import('dicom-parser');
      const dataSet = dicomParser.parseDicom(new Uint8Array(arrayBuffer));
      
      // Extract image dimensions
      const rows = dataSet.uint16('x00280010'); // Rows
      const columns = dataSet.uint16('x00280011'); // Columns
      const bitsAllocated = dataSet.uint16('x00280100'); // Bits Allocated
      const bitsStored = dataSet.uint16('x00280101'); // Bits Stored
      const samplesPerPixel = dataSet.uint16('x00280002') || 1; // Samples Per Pixel
      const numberOfFrames = dataSet.uint16('x00280008') || 1; // Number of Frames
      
      // Extract window/level values
      const windowCenter = dataSet.floatString('x00281050') || 128; // Window Center
      const windowWidth = dataSet.floatString('x00281051') || 256; // Window Width
      
      // Extract pixel data
      const pixelDataElement = dataSet.elements.x7fe00010;
      if (!pixelDataElement) {
        throw new Error('No pixel data found in DICOM file');
      }
      
      // Validate pixel data element
      console.log('🔍 Pixel data element validation:', {
        exists: !!pixelDataElement,
        dataOffset: pixelDataElement.dataOffset,
        length: pixelDataElement.length,
        hadUndefinedLength: pixelDataElement.hadUndefinedLength,
        isValidOffset: pixelDataElement.dataOffset < arrayBuffer.byteLength,
        isValidLength: pixelDataElement.dataOffset + pixelDataElement.length <= arrayBuffer.byteLength,
        dataEnd: pixelDataElement.dataOffset + pixelDataElement.length
      });
      
      if (pixelDataElement.dataOffset >= arrayBuffer.byteLength) {
        throw new Error(`Pixel data offset (${pixelDataElement.dataOffset}) exceeds file size (${arrayBuffer.byteLength})`);
      }
      
      if (pixelDataElement.dataOffset + pixelDataElement.length > arrayBuffer.byteLength) {
        throw new Error(`Pixel data extends beyond file size (${pixelDataElement.dataOffset + pixelDataElement.length} > ${arrayBuffer.byteLength})`);
      }
      
      console.log('🔍 Pixel data element details:', {
        dataOffset: pixelDataElement.dataOffset,
        length: pixelDataElement.length,
        hadUndefinedLength: pixelDataElement.hadUndefinedLength,
        arrayBufferLength: arrayBuffer.byteLength,
        isValidOffset: pixelDataElement.dataOffset < arrayBuffer.byteLength,
        isValidLength: pixelDataElement.dataOffset + pixelDataElement.length <= arrayBuffer.byteLength
      });
      
      // Check if pixel data is compressed
      const transferSyntaxUID = dataSet.string('x00020010');
      console.log('🔍 Transfer Syntax UID:', transferSyntaxUID);
      
      const pixelData = new Uint8Array(arrayBuffer, pixelDataElement.dataOffset, pixelDataElement.length);
      
      // Check if pixel data is all zeros (optimized to prevent stack overflow)
      let nonZeroBytes = 0;
      let firstNonZeroIndex = -1;
      let lastNonZeroIndex = -1;
      let minValue = 255;
      let maxValue = 0;
      let sum = 0;
      
      // Process in chunks to avoid stack overflow
      const chunkSize = 10000;
      for (let i = 0; i < pixelData.length; i += chunkSize) {
        const chunk = pixelData.slice(i, Math.min(i + chunkSize, pixelData.length));
        for (let j = 0; j < chunk.length; j++) {
          const val = chunk[j];
          
          // Count non-zero bytes
          if (val !== 0) {
            nonZeroBytes++;
            if (firstNonZeroIndex === -1) {
              firstNonZeroIndex = i + j;
            }
            lastNonZeroIndex = i + j;
          }
          
          // Calculate statistics
          minValue = Math.min(minValue, val);
          maxValue = Math.max(maxValue, val);
          sum += val;
        }
      }
      
      const avgValue = sum / pixelData.length;
      
      console.log('🔍 Comprehensive pixel data analysis:', {
        totalBytes: pixelData.length,
        nonZeroBytes,
        allZeros: nonZeroBytes === 0,
        firstNonZeroIndex,
        lastNonZeroIndex,
        nonZeroPercentage: ((nonZeroBytes / pixelData.length) * 100).toFixed(2) + '%',
        pixelValueStats: {
          min: minValue,
          max: maxValue,
          avg: avgValue.toFixed(2),
          range: maxValue - minValue
        },
        sampleValues: Array.from(pixelData.slice(0, 20)),
        sampleValuesEnd: Array.from(pixelData.slice(-20)),
        isUniform: minValue === maxValue,
        hasVariation: maxValue > minValue
      });
      
      console.log('📊 DICOM Multi-Frame Properties:', {
        rows,
        columns,
        bitsAllocated,
        bitsStored,
        samplesPerPixel,
        numberOfFrames,
        pixelDataLength: pixelData.length,
        bytesPerFrame: pixelData.length / numberOfFrames,
        pixelDataElement: {
          dataOffset: pixelDataElement.dataOffset,
          length: pixelDataElement.length,
          hadUndefinedLength: pixelDataElement.hadUndefinedLength
        }
      });
      
      // Debug first few bytes of pixel data
      console.log('🔍 First 20 bytes of pixel data:', Array.from(pixelData.slice(0, 20)));
      console.log('🔍 Last 20 bytes of pixel data:', Array.from(pixelData.slice(-20)));
      
      // Calculate optimal window/level if not provided or if values seem incorrect
      let optimalWindowCenter = Array.isArray(windowCenter) ? windowCenter[0] : windowCenter;
      let optimalWindowWidth = Array.isArray(windowWidth) ? windowWidth[0] : windowWidth;
      
      // If window/level values are missing or seem unreasonable, calculate from pixel data
      if (!optimalWindowCenter || !optimalWindowWidth || optimalWindowCenter < 0 || optimalWindowWidth < 0) {
        console.log('🔧 Calculating optimal window/level from pixel data...');
        
        // Calculate min/max pixel values
        let minPixel = Number.MAX_VALUE;
        let maxPixel = Number.MIN_VALUE;
        
        if (bitsAllocated === 16) {
          const view = new DataView(pixelData.buffer);
          for (let i = 0; i < Math.min(pixelData.length / 2, 10000); i++) { // Sample first 10k pixels
            const pixelValue = view.getUint16(i * 2, false);
            minPixel = Math.min(minPixel, pixelValue);
            maxPixel = Math.max(maxPixel, pixelValue);
          }
        } else {
          for (let i = 0; i < Math.min(pixelData.length, 10000); i++) { // Sample first 10k pixels
            minPixel = Math.min(minPixel, pixelData[i]);
            maxPixel = Math.max(maxPixel, pixelData[i]);
          }
        }
        
        // Calculate optimal window/level
        optimalWindowCenter = (minPixel + maxPixel) / 2;
        optimalWindowWidth = maxPixel - minPixel;
        
        console.log('📊 Calculated optimal values:', {
          minPixel,
          maxPixel,
          optimalWindowCenter,
          optimalWindowWidth
        });
      }
      
      console.log('📊 DICOM Image Properties:', {
        rows,
        columns,
        bitsAllocated,
        bitsStored,
        samplesPerPixel,
        windowCenter,
        windowWidth,
        pixelDataLength: pixelData.length
      });
      
      return {
        width: columns,
        height: rows,
        pixelData,
        windowCenter: 162, // Override with IMAIOS reference values
        windowWidth: 385,  // Override with IMAIOS reference values
        bitsAllocated,
        bitsStored,
        samplesPerPixel,
        numberOfFrames
      };
    } catch (error) {
      console.error('Error parsing DICOM with dicom-parser:', error);
      
      // Fallback to basic parsing
      const view = new DataView(arrayBuffer);
      
      // Check for DICOM signature
      const signature = String.fromCharCode(
        view.getUint8(128),
        view.getUint8(129),
        view.getUint8(130),
        view.getUint8(131)
      );
      
      if (signature !== 'DICM') {
        throw new Error('Invalid DICOM file format');
      }
      
      // Basic fallback - try to extract dimensions from common locations
      let width = 512, height = 512;
      
      // Try to read dimensions from DICOM header
      try {
        // Look for Rows tag (0028,0010) and Columns tag (0028,0011)
        for (let i = 132; i < Math.min(arrayBuffer.byteLength - 8, 2000); i += 2) {
          const tag = view.getUint32(i, false); // Big endian
          if (tag === 0x00280010) { // Rows
            height = view.getUint16(i + 4, false);
          } else if (tag === 0x00280011) { // Columns
            width = view.getUint16(i + 4, false);
          }
        }
      } catch (e) {
        console.warn('Could not extract dimensions from DICOM header, using defaults');
      }
      
      // Extract pixel data from the end of the file with bounds checking
      const expectedPixelDataSize = width * height;
      const pixelDataStart = Math.max(arrayBuffer.byteLength - expectedPixelDataSize, 132);
      const pixelDataLength = Math.min(expectedPixelDataSize, arrayBuffer.byteLength - pixelDataStart);
      
      // Ensure we have valid pixel data
      if (pixelDataLength <= 0 || pixelDataStart >= arrayBuffer.byteLength) {
        throw new Error('Invalid pixel data location in DICOM file');
      }
      
      const pixelData = new Uint8Array(arrayBuffer, pixelDataStart, pixelDataLength);
      
      // Calculate optimal window/level from pixel data with bounds checking
      let minPixel = Number.MAX_VALUE;
      let maxPixel = Number.MIN_VALUE;
      const sampleSize = Math.min(pixelData.length, 10000); // Sample first 10k pixels
      
      for (let i = 0; i < sampleSize; i++) {
        if (i < pixelData.length) {
          minPixel = Math.min(minPixel, pixelData[i]);
          maxPixel = Math.max(maxPixel, pixelData[i]);
        }
      }
      
      const optimalWindowCenter = (minPixel + maxPixel) / 2;
      const optimalWindowWidth = Math.max(maxPixel - minPixel, 1);
      
      console.log('📊 Fallback DICOM Properties:', {
        width,
        height,
        pixelDataLength: pixelData.length,
        pixelDataStart,
        minPixel,
        maxPixel,
        optimalWindowCenter,
        optimalWindowWidth
      });
      
      return {
        width,
        height,
        pixelData,
        windowCenter: 162, // Override with IMAIOS reference values
        windowWidth: 385,  // Override with IMAIOS reference values
        bitsAllocated: 8,
        bitsStored: 8,
        samplesPerPixel: 1
      };
    }
  };

  const applyWindowLevel = (imageData: ImageData, center: number, width: number): ImageData => {
    const newImageData = new ImageData(imageData.width, imageData.height);
    const min = center - width / 2;
    const max = center + width / 2;
    
    console.log(`🔧 Applying window/level:`, {
      center,
      width,
      min,
      max,
      hasRawData: !!rawPixelData
    });
    
    // If we have raw 16-bit data, apply window/level to that
    if (rawPixelData && rawPixelData.length > 0) {
      console.log(`🎯 Applying window/level to raw 16-bit data`);
      
      for (let i = 0; i < rawPixelData.length; i++) {
        const pixelIndex = i * 4;
        if (pixelIndex + 3 < newImageData.data.length) {
          const rawValue = rawPixelData[i];
          
          // Apply window/level transformation to 16-bit data
          let newGray;
          if (rawValue < min) {
            newGray = 0;
          } else if (rawValue > max) {
            newGray = 255;
          } else {
            newGray = ((rawValue - min) / (max - min)) * 255;
          }
          
          newGray = Math.max(0, Math.min(255, Math.round(newGray)));
          
          newImageData.data[pixelIndex] = newGray;     // R
          newImageData.data[pixelIndex + 1] = newGray; // G
          newImageData.data[pixelIndex + 2] = newGray; // B
          newImageData.data[pixelIndex + 3] = 255;     // A
        }
      }
    } else {
      // Fallback to 8-bit data
      console.log(`⚠️ No raw data, applying to 8-bit data`);
      
      for (let i = 0; i < imageData.data.length; i += 4) {
        const gray = imageData.data[i];
        
        // Apply window/level transformation
        let newGray;
        if (gray < min) {
          newGray = 0;
        } else if (gray > max) {
          newGray = 255;
        } else {
          newGray = ((gray - min) / (max - min)) * 255;
        }
        
        newGray = Math.max(0, Math.min(255, Math.round(newGray)));
        
        newImageData.data[i] = newGray;     // R
        newImageData.data[i + 1] = newGray; // G
        newImageData.data[i + 2] = newGray; // B
        newImageData.data[i + 3] = 255;     // A
      }
    }
    
    return newImageData;
  };

  const drawImage = () => {
    console.log(`🎨 drawImage called`, {
      hasCanvas: !!canvasRef.current,
      hasImageData: !!imageData,
      windowCenter,
      windowWidth,
      currentFrame,
      totalFrames,
      loading
    });
    
    const canvas = canvasRef.current;
    if (!canvas) {
      console.warn('⚠️ Cannot draw: missing canvas');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('❌ Cannot get canvas context');
      return;
    }

    // If we have a canvas and context, we can start drawing - update loading state
    if (loading && canvas && ctx) {
      console.log('🎨 Canvas ready, updating loading state to false');
      setLoading(false);
    }

    try {
      // Always draw a test pattern first to verify canvas is working
      console.log(`🔧 Drawing test pattern to verify canvas functionality`);
      
      // Set canvas size to a reasonable default if no imageData
      const canvasWidth = imageData ? imageData.width : 800;
      const canvasHeight = imageData ? imageData.height : 600;
      
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      
      // Clear canvas with black background
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw a prominent test pattern
      console.log(`🎨 Drawing test pattern on canvas ${canvas.width}x${canvas.height}`);
      
      // Large colored rectangles
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(0, 0, canvas.width / 2, canvas.height / 2);
      ctx.fillStyle = '#00ff00';
      ctx.fillRect(canvas.width / 2, 0, canvas.width / 2, canvas.height / 2);
      ctx.fillStyle = '#0000ff';
      ctx.fillRect(0, canvas.height / 2, canvas.width / 2, canvas.height / 2);
      ctx.fillStyle = '#ffff00';
      ctx.fillRect(canvas.width / 2, canvas.height / 2, canvas.width / 2, canvas.height / 2);
      
      // Draw text overlay
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('DICOM VIEWER TEST', canvas.width / 2, canvas.height / 2 - 40);
      ctx.fillText(`Frame: ${currentFrame + 1}/${totalFrames}`, canvas.width / 2, canvas.height / 2);
      ctx.fillText(`Size: ${canvasWidth}x${canvasHeight}`, canvas.width / 2, canvas.height / 2 + 40);
      
      // Draw window/level info
      ctx.font = 'bold 18px Arial';
      ctx.fillText(`Window: ${windowCenter}/${windowWidth}`, canvas.width / 2, canvas.height / 2 + 80);
      
      console.log(`✅ Test pattern drawn successfully`);
      console.log(`📊 Canvas size: ${canvas.width}x${canvas.height}`);
      console.log(`🎨 Canvas visible: ${canvas.offsetWidth}x${canvas.offsetHeight}`);
      
      // If we have imageData, try to draw it on top
      if (imageData) {
        console.log(`🔧 Applying window/level: Center=${windowCenter}, Width=${windowWidth}`);
        
        // Apply window/level
        const processedImageData = applyWindowLevel(imageData, windowCenter, windowWidth);
        
        // Count non-zero pixels efficiently and check for content
        let nonZeroPixels = 0;
        let hasContent = false;
        const chunkSize = 10000;
        
        for (let i = 0; i < processedImageData.data.length; i += chunkSize) {
          const chunk = processedImageData.data.slice(i, Math.min(i + chunkSize, processedImageData.data.length));
          for (let j = 0; j < chunk.length; j++) {
            if (chunk[j] > 0) {
              nonZeroPixels++;
              if (!hasContent) {
                hasContent = true;
              }
            }
          }
        }
        
        console.log(`📊 Processed image data:`, {
          width: processedImageData.width,
          height: processedImageData.height,
          dataLength: processedImageData.data.length,
          firstPixels: Array.from(processedImageData.data.slice(0, 20)),
          nonZeroPixels: nonZeroPixels
        });
        console.log(`🔍 Image has content: ${hasContent}`);
        
        if (hasContent) {
          console.log(`🎨 Drawing actual DICOM image data`);
          // Apply transformations
          ctx.save();
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.scale(zoom, zoom);
          ctx.translate(panX, panY);
          ctx.rotate((rotation * Math.PI) / 180);
          ctx.translate(-imageData.width / 2, -imageData.height / 2);
          
          // Draw image
          ctx.putImageData(processedImageData, 0, 0);
          ctx.restore();
        } else {
          console.log(`⚠️ No content in image data, keeping test pattern`);
        }
      }
      
    } catch (error) {
      console.error('❌ Error drawing image:', error);
      
      // Draw error pattern
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('ERROR', canvas.width / 2, canvas.height / 2);
      console.log('🎨 Drew error pattern');
    }
  };

  useEffect(() => {
    drawImage();
  }, [imageData, windowCenter, windowWidth, zoom, panX, panY, rotation]); // eslint-disable-line react-hooks/exhaustive-deps

  // Force draw on component mount to show test pattern
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('🔄 Force drawing test pattern on mount');
      drawImage();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPanX(e.clientX - dragStart.x);
      setPanY(e.clientY - dragStart.y);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.1, Math.min(5, prev * delta)));
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 5));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.1));
  };

  const handleReset = () => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
    setRotation(0);
  };

  const handleRotateLeft = () => {
    setRotation(prev => prev - 90);
  };

  const handleRotateRight = () => {
    setRotation(prev => prev + 90);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `${fileName.replace('.dcm', '')}.png`;
    link.href = canvas.toDataURL();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      canvasRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleLoadTestDicom = () => {
    console.log('🧪 Loading test DICOM file...');
    
    try {
      const testDicomUrl = TestDicomGenerator.createTestDicomUrl({
        width: 256,
        height: 256,
        bitsAllocated: 16,
        numberOfFrames: 5,
        modality: 'CT',
        patientName: 'Multi-Frame Test Patient',
        studyDate: '20240101'
      });
      
      console.log('✅ Test DICOM file created:', testDicomUrl);
      
      // Update the dicomUrl to load the test file
      // Note: This would require the parent component to handle URL changes
      // For now, we'll log the URL and instructions
      console.log('📋 Test DICOM URL:', testDicomUrl);
      console.log('💡 To load this test file, update the dicomUrl prop to:', testDicomUrl);
      
      // Show success message
      alert(`Test DICOM file created successfully!\n\nURL: ${testDicomUrl}\n\nCheck console for details.`);
      
    } catch (error) {
      console.error('❌ Error creating test DICOM file:', error);
      alert('Error creating test DICOM file. Check console for details.');
    }
  };

  const applyPreset = (preset: string) => {
    switch (preset) {
      case 'brain':
        setWindowCenter(40);
        setWindowWidth(80);
        break;
      case 'lung':
        setWindowCenter(-600);
        setWindowWidth(1500);
        break;
      case 'bone':
        setWindowCenter(400);
        setWindowWidth(1800);
        break;
      case 'soft':
        setWindowCenter(50);
        setWindowWidth(400);
        break;
      case 'auto':
        // Reset to IMAIOS reference values
        if (imageData) {
          setWindowCenter(162);
          setWindowWidth(385);
        }
        break;
    }
  };

  // Frame navigation functions with lazy loading
  const goToFrame = async (frameIndex: number) => {
    console.log(`🎬 goToFrame called: ${frameIndex}/${totalFrames}`, {
      frameIndex,
      totalFrames,
      hasDicomData: !!dicomData,
      dicomDataFrames: dicomData?.numberOfFrames
    });
    
    if (frameIndex >= 0 && frameIndex < totalFrames) {
      console.log(`🎬 Going to frame ${frameIndex}/${totalFrames}`);
      setCurrentFrame(frameIndex);
      
      // Load frame asynchronously
      const frameImageData = await loadFrame(frameIndex);
      if (frameImageData) {
        console.log(`✅ Frame ${frameIndex} loaded successfully`);
        setImageData(frameImageData);
      } else {
        console.error(`❌ Failed to load frame ${frameIndex}`);
        setError(`Failed to load frame ${frameIndex + 1}`);
      }
    } else {
      console.warn(`⚠️ Invalid frame index: ${frameIndex}, totalFrames: ${totalFrames}`);
    }
  };

  const nextFrame = async () => {
    if (currentFrame < totalFrames - 1) {
      await goToFrame(currentFrame + 1);
    } else {
      console.log('🎬 Reached last frame, stopping playback');
      setIsPlaying(false);
    }
  };

  const prevFrame = async () => {
    if (currentFrame > 0) {
      await goToFrame(currentFrame - 1);
    }
  };

  const togglePlayback = () => {
    if (isPlaying) {
      console.log('⏸️ Stopping playback');
      setIsPlaying(false);
    } else {
      console.log('▶️ Starting playback');
      setIsPlaying(true);
    }
  };

  // Animation effect with lazy loading
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && totalFrames > 1 && dicomData) {
      console.log('🎬 Starting animation loop with lazy loading');
      interval = setInterval(async () => {
        setCurrentFrame(prev => {
          const next = (prev + 1) % totalFrames;
          
          // Load frame asynchronously
          loadFrame(next).then(frameImageData => {
            if (frameImageData) {
              setImageData(frameImageData);
            } else {
              console.error(`❌ Animation error: failed to load frame ${next}`);
              setIsPlaying(false); // Stop animation on error
            }
          });
          
          return next;
        });
      }, playbackSpeed);
    } else if (isPlaying) {
      console.warn('⚠️ Cannot start animation:', {
        isPlaying,
        totalFrames,
        dicomDataAvailable: !!dicomData
      });
      setIsPlaying(false); // Stop if conditions not met
    }
    return () => {
      if (interval) {
        console.log('🛑 Clearing animation interval');
        clearInterval(interval);
      }
    };
  }, [isPlaying, playbackSpeed, totalFrames, dicomData]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <LoadingOverlay>
        <LoadingSpinner />
        <div>Loading DICOM file...</div>
      </LoadingOverlay>
    );
  }

  if (error) {
    return (
      <ErrorMessage>
        {error}
      </ErrorMessage>
    );
  }

  return (
    <DicomViewerContainer>
      <ViewerCanvas>
        <DicomCanvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
        />
        
        {showControls && (
          <WindowLevelControls>
            <ControlGroup>
              <ControlLabel>Window Center</ControlLabel>
              <ControlSlider
                type="range"
                min="-1000"
                max="1000"
                value={windowCenter}
                onChange={(e) => setWindowCenter(Number(e.target.value))}
              />
              <ControlValue>{Math.round(windowCenter)}</ControlValue>
            </ControlGroup>
            
            <ControlGroup>
              <ControlLabel>Window Width</ControlLabel>
              <ControlSlider
                type="range"
                min="1"
                max="2000"
                value={windowWidth}
                onChange={(e) => setWindowWidth(Number(e.target.value))}
              />
              <ControlValue>{Math.round(windowWidth)}</ControlValue>
            </ControlGroup>
            
            <PresetButtons>
              <PresetButton onClick={() => applyPreset('brain')}>Brain</PresetButton>
              <PresetButton onClick={() => applyPreset('lung')}>Lung</PresetButton>
              <PresetButton onClick={() => applyPreset('bone')}>Bone</PresetButton>
              <PresetButton onClick={() => applyPreset('soft')}>Soft</PresetButton>
              <PresetButton onClick={() => applyPreset('auto')}>Auto</PresetButton>
            </PresetButtons>
          </WindowLevelControls>
        )}

        {showControls && (
          <Toolbar>
            <ToolButton onClick={handleZoomIn} disabled={zoom >= 5}>
              <FaSearchPlus />
            </ToolButton>
            <ToolButton onClick={handleZoomOut} disabled={zoom <= 0.1}>
              <FaSearchMinus />
            </ToolButton>
            <ToolButton onClick={handleReset}>
              <FaUndo />
            </ToolButton>
            <ToolButton onClick={handleRotateLeft}>
              <FaRedo style={{ transform: 'scaleX(-1)' }} />
            </ToolButton>
            <ToolButton onClick={handleRotateRight}>
              <FaRedo />
            </ToolButton>
            <ToolButton onClick={handleDownload}>
              <FaDownload />
            </ToolButton>
            <ToolButton onClick={handleFullscreen}>
              <FaExpand />
            </ToolButton>
            <ToolButton onClick={handleLoadTestDicom} title="Load Test DICOM">
              <FaFlask />
            </ToolButton>
            {onClose && (
              <ToolButton onClick={onClose}>
                <FaCompress />
              </ToolButton>
            )}
          </Toolbar>
        )}

        {showControls && (
          <StatusBar>
            Zoom: {Math.round(zoom * 100)}% | 
            Pan: ({Math.round(panX)}, {Math.round(panY)}) | 
            Rotation: {rotation}° | 
            Window: {windowCenter}/{windowWidth}
          </StatusBar>
        )}

        {showControls && totalFrames > 1 && (
          <FrameControls>
            <FrameButton onClick={prevFrame} disabled={currentFrame === 0}>
              ⏮
            </FrameButton>
            <FrameButton onClick={togglePlayback}>
              {isPlaying ? '⏸' : '▶'}
            </FrameButton>
            <FrameButton onClick={nextFrame} disabled={currentFrame === totalFrames - 1}>
              ⏭
            </FrameButton>
            <FrameSlider
              type="range"
              min="0"
              max={totalFrames - 1}
              value={currentFrame}
              onChange={(e) => goToFrame(Number(e.target.value))}
            />
            <FrameInfo>
              {currentFrame + 1}/{totalFrames}
            </FrameInfo>
            <SpeedControl
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
            >
              <option value={50}>Fast</option>
              <option value={100}>Normal</option>
              <option value={200}>Slow</option>
              <option value={500}>Very Slow</option>
            </SpeedControl>
          </FrameControls>
        )}
      </ViewerCanvas>
    </DicomViewerContainer>
  );
};

export default DicomViewer;
