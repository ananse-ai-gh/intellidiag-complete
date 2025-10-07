'use client'

import React, { useEffect, useMemo, useState, useRef } from 'react'
import styled from 'styled-components'
import { usePathname, useRouter } from 'next/navigation'
import ImageViewer from '@/components/ImageViewer'
import AnalysisResultsDisplay from '@/components/AnalysisResultsDisplay'
import ExportModal from '@/components/ExportModal'
import { useAnalysisManager } from '@/hooks/useAnalysisManager'
import { generateAndPrintReport, AnalysisReportData } from '@/utils/pdfGenerator'
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
  FaBookmark, FaCheckCircle,
  FaTimesCircle, FaFileExport, FaEyeSlash, FaSlidersH,
  FaChevronDown, FaChevronRight, FaChevronLeft, FaBars, FaTimes,
  FaClock, FaFileMedical, FaUndo, FaRedo, FaSave, FaTrashAlt
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

// Main viewer area
const MainViewerArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0; /* Prevent flex item from growing beyond container */
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
  min-width: 0; /* Prevent flex item from growing beyond container */
`

// Image viewer container (fixed width to prevent growth when panels toggle)
const ImageViewerArea = styled.div`
  /* Fill the entire ViewerArea width */
  flex: 1 1 auto;
  width: 100%;
  max-width: 100%;
  /* fill container height */
  max-height: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0; /* Prevent flex item from growing beyond container */

  @media (max-width: 1100px) {
    flex: 1 1 auto;
    width: 100%;
    max-height: 100%;
    height: 100%;
  }
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
  
  &:hover:not(:disabled) {
    background: rgba(6, 148, 251, 0.2);
    transform: scale(1.05);
    box-shadow: 0 0 15px rgba(6, 148, 251, 0.4);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
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

const ResultsText = styled.div`
  font-size: 13px;
  color: #ccc;
  line-height: 1.5;
  background: rgba(255, 255, 255, 0.05);
  padding: 12px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`

const BackButton = styled.button`
  position: fixed;
  top: max(12px, env(safe-area-inset-top));
  left: max(12px, env(safe-area-inset-left));
  z-index: 1100;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255,255,255,0.16);
  border-radius: 10px;
  background: linear-gradient(180deg, rgba(20,20,20,0.8) 0%, rgba(12,12,12,0.8) 100%);
  color: #e6f2ff;
  cursor: pointer;
  box-shadow: 0 6px 18px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  transition: transform 0.15s ease, box-shadow 0.2s ease, border-color 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    border-color: rgba(6,148,251,0.5);
    box-shadow: 0 10px 22px rgba(6,148,251,0.22), inset 0 1px 0 rgba(255,255,255,0.08);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 4px 12px rgba(0,0,0,0.4);
  }

  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    top: max(10px, env(safe-area-inset-top));
    left: max(10px, env(safe-area-inset-left));
    border-radius: 8px;
  }
`

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  border: none;
  
  ${props => {
    switch (props.$variant) {
      case 'primary':
        return `
          background: #0694fb;
          color: white;
          
          &:hover {
            background: #0582d9;
            transform: scale(1.05);
          }
        `
      case 'danger':
        return `
          background: #f44336;
          color: white;
          
          &:hover {
            background: #d32f2f;
            transform: scale(1.05);
          }
        `
      default:
        return `
          background: transparent;
          color: #8aa;
          border: 1px solid #2a2a2a;
          
          &:hover {
            background: rgba(255, 255, 255, 0.05);
            color: white;
          }
        `
    }
  }}
`

// Analysis Results Panel Components
const AnalysisHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const AnalysisTitle = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: white;
  display: flex;
  align-items: center;
`

const AnalysisSubtitle = styled.div`
  font-size: 12px;
  color: #8aa;
  font-weight: 400;
`

const StatusIndicator = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const StatusBadge = styled.div<{ $status: string }>`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 6px;
    font-size: 12px;
  font-weight: 600;
  background: ${props => {
    switch (props.$status) {
      case 'completed': return 'rgba(76, 175, 80, 0.1)'
      case 'processing': return 'rgba(255, 193, 7, 0.1)'
      case 'failed': return 'rgba(244, 67, 54, 0.1)'
      case 'pending': return 'rgba(255, 152, 0, 0.1)'
      default: return 'rgba(255, 255, 255, 0.05)'
    }
  }};
  border: 1px solid ${props => {
    switch (props.$status) {
      case 'completed': return 'rgba(76, 175, 80, 0.3)'
      case 'processing': return 'rgba(255, 193, 7, 0.3)'
      case 'failed': return 'rgba(244, 67, 54, 0.3)'
      case 'pending': return 'rgba(255, 152, 0, 0.3)'
      default: return 'rgba(255, 255, 255, 0.1)'
    }
  }};
  color: ${props => {
    switch (props.$status) {
      case 'completed': return '#4CAF50'
      case 'processing': return '#ffc107'
      case 'failed': return '#f44336'
      case 'pending': return '#ff9800'
      default: return '#8aa'
    }
  }};
`

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
`

const ProgressFill = styled.div<{ $progress: number }>`
  height: 100%;
  width: ${props => Math.max(0, Math.min(100, props.$progress))}%;
  background: linear-gradient(90deg, #0694fb, #4CAF50);
  border-radius: 2px;
  transition: width 0.4s ease;
`

const ProgressMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6px;
  font-size: 11px;
  color: #8aa;
`

const StageChips = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 6px;
`

const StageChip = styled.div<{ $active?: boolean }>`
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 10px;
  border: 1px solid ${props => props.$active ? 'rgba(6, 148, 251, 0.6)' : 'rgba(255, 255, 255, 0.15)'};
  color: ${props => props.$active ? '#fff' : '#8aa'};
  background: ${props => props.$active ? 'rgba(6, 148, 251, 0.18)' : 'transparent'};
`

const ConfidenceSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`
  
const ConfidenceLabel = styled.div`
  font-size: 12px;
    color: #8aa;
  font-weight: 500;
`

const ConfidenceScore = styled.div`
  font-size: 24px;
  font-weight: 700;
      color: white;
`

const ConfidenceBar = styled.div`
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
`

const ConfidenceFill = styled.div<{ $percentage: number }>`
  height: 100%;
  width: ${props => props.$percentage}%;
  background: ${props => {
    if (props.$percentage >= 90) return 'linear-gradient(90deg, #4CAF50, #8BC34A)'
    if (props.$percentage >= 75) return 'linear-gradient(90deg, #8BC34A, #CDDC39)'
    if (props.$percentage >= 60) return 'linear-gradient(90deg, #CDDC39, #FFC107)'
    if (props.$percentage >= 40) return 'linear-gradient(90deg, #FFC107, #FF9800)'
    return 'linear-gradient(90deg, #FF9800, #f44336)'
  }};
  border-radius: 4px;
  transition: width 0.3s ease;
`

const ConfidenceDescription = styled.div`
  font-size: 11px;
  color: #8aa;
  font-weight: 500;
`

const FindingsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const FindingsTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: white;
  display: flex;
  align-items: center;
`

const FindingsContent = styled.div`
  font-size: 13px;
  color: #ccc;
  line-height: 1.5;
  background: rgba(255, 255, 255, 0.05);
  padding: 12px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`

const RecommendationsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const RecommendationsTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: white;
  display: flex;
  align-items: center;
`

const RecommendationsContent = styled.div`
  font-size: 13px;
  color: #ccc;
  line-height: 1.5;
  background: rgba(76, 175, 80, 0.05);
  padding: 12px;
  border-radius: 6px;
  border: 1px solid rgba(76, 175, 80, 0.2);
`

const LLMNotesSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const LLMNotesTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: white;
  display: flex;
  align-items: center;
`

const LLMNotesContent = styled.div`
  font-size: 13px;
  color: #e8f5e8;
  line-height: 1.6;
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.08) 0%, rgba(139, 195, 74, 0.05) 100%);
  padding: 16px;
  border-radius: 8px;
  border: 1px solid rgba(76, 175, 80, 0.3);
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.1);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #4CAF50, #8BC34A);
    border-radius: 8px 8px 0 0;
  }
`

const LLMNotesFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 4px;
`

const LLMNotesLabel = styled.div`
  font-size: 10px;
  color: #8aa;
  font-style: italic;
  background: rgba(76, 175, 80, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid rgba(76, 175, 80, 0.2);
`

const ScanNotesSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const ScanNotesTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: white;
  display: flex;
  align-items: center;
`

const ScanNotesContent = styled.div`
  font-size: 13px;
  color: #fff3e0;
  line-height: 1.6;
  background: linear-gradient(135deg, rgba(255, 152, 0, 0.08) 0%, rgba(255, 193, 7, 0.05) 100%);
  padding: 16px;
  border-radius: 8px;
  border: 1px solid rgba(255, 152, 0, 0.3);
  box-shadow: 0 2px 8px rgba(255, 152, 0, 0.1);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #ff9800, #ffc107);
    border-radius: 8px 8px 0 0;
  }
`

const ScanNotesFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 4px;
`

const ScanNotesLabel = styled.div`
  font-size: 10px;
  color: #8aa;
  font-style: italic;
  background: rgba(255, 152, 0, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid rgba(255, 152, 0, 0.2);
`

const MetadataSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const MetadataTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: white;
  display: flex;
  align-items: center;
`

const MetadataGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`

const MetadataItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`

const MetadataLabel = styled.div`
  font-size: 10px;
    color: #8aa;
  font-weight: 500;
`

const MetadataValue = styled.div`
    font-size: 12px;
    color: white;
  font-weight: 600;
`

const ActionButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

// Loading animation components
const LoadingOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 100;
  border-radius: 8px;
  backdrop-filter: blur(4px);
`

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid rgba(6, 148, 251, 0.3);
  border-top: 3px solid #0694fb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`

const LoadingText = styled.div`
  color: #8aa;
  font-size: 14px;
  text-align: center;
  line-height: 1.4;
`

const LoadingProgress = styled.div`
  width: 200px;
  height: 2px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 1px;
  margin-top: 12px;
  overflow: hidden;
  
  &::after {
    content: '';
    display: block;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, #0694fb, transparent);
    animation: loading-bar 1.5s ease-in-out infinite;
  }
  
  @keyframes loading-bar {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`

const AnalysisContent = styled.div<{ $isLoading: boolean }>`
  transition: opacity 0.3s ease, transform 0.3s ease;
  opacity: ${props => props.$isLoading ? 0.3 : 1};
  transform: ${props => props.$isLoading ? 'translateY(10px)' : 'translateY(0)'};
`

// Image transition components
const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
`

const ImageSlide = styled.div<{ $isActive: boolean; $direction: 'left' | 'right' }>`
  position: absolute;
  inset: 0;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
  transform: ${props => 
    props.$isActive 
      ? 'translateX(0)' 
      : props.$direction === 'left' 
        ? 'translateX(-100%)' 
        : 'translateX(100%)'
  };
  opacity: ${props => props.$isActive ? 1 : 0};
`

const ThumbnailContainer = styled.div<{ $isSelected: boolean; $isLoading: boolean }>`
  position: relative;
  cursor: pointer;
  border-radius: 6px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: ${props => props.$isSelected ? 'scale(1.05)' : 'scale(1)'};
  border: ${props => props.$isSelected ? '2px solid #0694fb' : '1px solid rgba(255,255,255,0.2)'};
  box-shadow: ${props => props.$isSelected ? '0 0 15px rgba(6, 148, 251, 0.4)' : '0 2px 8px rgba(0,0,0,0.3)'};
  width: 50px;
  height: 50px;
  
  &:hover {
    transform: ${props => props.$isSelected ? 'scale(1.05)' : 'scale(1.02)'};
    border-color: #0694fb;
    box-shadow: 0 0 15px rgba(6, 148, 251, 0.4);
  }
  
  ${props => props.$isLoading && `
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background: rgba(6, 148, 251, 0.1);
      border: 2px solid #0694fb;
      border-radius: 6px;
      animation: pulse 1.5s ease-in-out infinite;
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 0.8; }
    }
  `}
`

const SidebarActionButton = styled.button<{ $variant: 'primary' | 'secondary' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  border: none;
    
  ${props => props.$variant === 'primary' ? `
    background: linear-gradient(135deg, #0694fb 0%, #0582d9 100%);
      color: white;
    box-shadow: 0 2px 8px rgba(6, 148, 251, 0.3);

  &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(6, 148, 251, 0.4);
    }
  ` : `
    background: transparent;
    color: #8aa;
    border: 1px solid rgba(255, 255, 255, 0.2);
    
    &:hover {
  background: rgba(255, 255, 255, 0.05);
      color: white;
    }
  `}
`

// Main AnalysisDetail Component
const AnalysisDetail = () => {
  // Router and pathname
  const router = useRouter()
  const pathname = usePathname()
  const analysisId = pathname?.split('/').pop()

  // State management - must be declared before useAnalysisManager
  const [meta, setMeta] = useState<any>({})
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [exportFormat, setExportFormat] = useState('yolo')
  const [files, setFiles] = useState<any[]>([])
  const [selected, setSelected] = useState(0)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [notesExpanded, setNotesExpanded] = useState(false)
  const [isOutputModalOpen, setIsOutputModalOpen] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [isLoadingImage, setIsLoadingImage] = useState(false)
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false)
  const [previousSelected, setPreviousSelected] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Analysis management
  const {
    currentAnalysis,
    analysisHistory,
    isRunning: isAnalysisRunning,
    progress: analysisProgress,
    error: analysisError,
    startAnalysis,
    cancelAnalysis,
    clearError,
    getAnalysisByType,
    isAnalysisCached,
    hasCompletedAnalysis
  } = useAnalysisManager(analysisId || '', selected)

  // Track when analysis manager is actively loading data
  const [isAnalysisManagerLoading, setIsAnalysisManagerLoading] = useState(false)

  // Debug: Log when selected image changes
  useEffect(() => {
    console.log(`🖼️ Selected image changed to index: ${selected}`)
    console.log(`📊 Current analysis:`, currentAnalysis ? {
      id: currentAnalysis.id,
      imageIndex: currentAnalysis.imageIndex,
      status: currentAnalysis.status,
      detected_case: currentAnalysis.detected_case
    } : 'null')
  }, [selected, currentAnalysis])

  // Consolidated loading state management
  useEffect(() => {
    // Set loading when image selection changes
    if (files.length > 0) {
      console.log(`🔄 Loading states triggered for image ${selected}`)
      setIsLoadingImage(true)
      setIsLoadingAnalysis(true)
      setIsAnalysisManagerLoading(true)
      
      const startTime = Date.now()
      const minLoadingTime = 800 // Minimum 800ms loading time for better UX
      
      // Image loading is complete when we have the selected image
      const checkImageLoaded = () => {
        const elapsed = Date.now() - startTime
        const remainingTime = Math.max(0, minLoadingTime - elapsed)
        
        setTimeout(() => {
          if (files[selected] && files[selected].url) {
            console.log(`✅ Image ${selected} loaded`)
            setIsLoadingImage(false)
          }
        }, remainingTime)
      }
      
      // Analysis manager loading
      const checkAnalysisManagerReady = () => {
        const elapsed = Date.now() - startTime
        const remainingTime = Math.max(0, minLoadingTime - elapsed)
        
        setTimeout(() => {
          // Analysis is ready when:
          // 1. We have an analysis that belongs to the selected image, OR
          // 2. We don't have an analysis (which means no analysis exists for this image)
          if (!currentAnalysis || currentAnalysis.imageIndex === selected) {
            console.log(`✅ Analysis manager ready for image ${selected}`)
            setIsAnalysisManagerLoading(false)
          }
        }, remainingTime)
      }
      
      // Analysis loading is complete when we have the correct analysis for the selected image
      const checkAnalysisLoaded = () => {
        const elapsed = Date.now() - startTime
        const remainingTime = Math.max(0, minLoadingTime - elapsed)
        
        setTimeout(() => {
          // If there's no analysis for this image, that's also "loaded" (shows pending state)
          // If there is an analysis, it should belong to the currently selected image
          if (!currentAnalysis || currentAnalysis.imageIndex === selected) {
            console.log(`✅ Analysis for image ${selected} loaded`)
            setIsLoadingAnalysis(false)
          }
        }, remainingTime)
      }
      
      // Check immediately
      checkImageLoaded()
      checkAnalysisManagerReady()
      checkAnalysisLoaded()
      
      // Also check after a short delay to handle async updates
      const timer = setTimeout(() => {
        checkImageLoaded()
        checkAnalysisManagerReady()
        checkAnalysisLoaded()
      }, 100)
      
      return () => {
        clearTimeout(timer)
      }
    }
  }, [selected, files.length, files[selected]?.url, currentAnalysis?.imageIndex])

  // Derive a stable status for UI badges
  const status = currentAnalysis?.status || (isAnalysisRunning ? 'processing' : (hasCompletedAnalysis() ? 'completed' : 'pending'))

  // Only use AI medical_note (no fallback)
  const medicalNotesText = ((currentAnalysis as any)?.medical_note || '') as string

  // Helpers to normalize and parse confidence data
  const normalized = (s: string) => s.toLowerCase().replace(/\s|_/g, '')
  const parsePercent = (val: any): number => {
    if (val === null || val === undefined) return 0
    if (typeof val === 'number') return !isFinite(val) ? 0 : (val <= 1 ? val * 100 : val)
    if (typeof val === 'string') {
      const t = val.trim()
      const stripped = t.endsWith('%') ? t.slice(0, -1) : t
      const n = Number(stripped)
      if (!isFinite(n)) return 0
      return n <= 1 ? n * 100 : n
    }
    return 0
  }
  const getConfidenceColor = (v: number) => {
    if (v >= 90) return '#4CAF50'
    if (v >= 75) return '#8BC34A'
    if (v >= 60) return '#FFC107'
    if (v >= 40) return '#FF9800'
    return '#F44336'
  }
  const extractConfidenceEntries = React.useMemo(() => {
    const cs: any = (currentAnalysis as any)?.confidence_scores
    if (!cs) return [] as [string, number][]
    let entries: [string, number][] = []
    if (Array.isArray(cs)) {
      for (const item of cs) {
        if (Array.isArray(item) && item.length >= 2) {
          entries.push([String(item[0]), parsePercent(item[1])])
          continue
        }
        if (item && typeof item === 'object') {
          const key = item.label ?? item.name ?? item.class ?? item.key ?? item.category ?? item.type
          const val = item.value ?? item.score ?? item.confidence ?? item.probability ?? item.percent
          if (key !== undefined && val !== undefined) {
            entries.push([String(key), parsePercent(val)])
          } else {
            for (const [k, v] of Object.entries(item)) {
              entries.push([k, parsePercent(v as any)])
            }
          }
        }
      }
    } else if (typeof cs === 'object') {
      entries = Object.entries(cs).map(([k, v]) => [k, parsePercent(v)])
    }
    return entries.filter(([, v]) => isFinite(v)).sort((a, b) => b[1] - a[1])
  }, [currentAnalysis])

  // Load scan data and check for cached analysis
  useEffect(() => {
    if (!analysisId) return

    const loadScanData = async () => {
      try {
        const response = await api.get(`/api/scans/${analysisId}`)
        const scanData = response.data?.data?.scan
        
        if (scanData) {
          setMeta({
            scanType: scanData.scanType,
            patient: `${scanData.patientFirstName} ${scanData.patientLastName}`,
            caseId: scanData.scanId,
            bodyPart: scanData.bodyPart,
            analysisType: scanData.analysisType || 'auto',
            confidence: scanData.confidence,
            findings: scanData.aiFindings,
            recommendations: scanData.recommendations || 'No recommendations available at this time.',
            notes: scanData.notes || ''
          })

          // Check if we have a cached analysis for this scan type
          const cachedAnalysis = getAnalysisByType(scanData.analysisType)
          if (cachedAnalysis && isAnalysisCached(scanData.analysisType)) {
            console.log('📋 Using cached analysis results')
          }
        }
      } catch (error) {
        console.error('Error loading scan data:', error)
      }
    }

    loadScanData()
  }, [analysisId, getAnalysisByType, isAnalysisCached])

  // Load scan data and images
  useEffect(() => {
    if (!analysisId) return

    console.log('🔄 Loading scan data and images for analysisId:', analysisId)


    const loadScanImages = async () => {
      try {
        const response = await api.get(`/api/scans/${analysisId}/images`)
        const imagesData = response.data?.data?.images
        
        if (imagesData && imagesData.length > 0) {
          setFiles(imagesData)
          setSelected(0) // Select first image
          console.log('✅ Loaded scan images:', imagesData.length)
        }
      } catch (error) {
        console.error('❌ Error loading scan images:', error)
      }
    }

    loadScanImages()
  }, [analysisId])

  // Handle back navigation
  const handleBackToScans = () => {
    router.push('/dashboard/doctor/scans')
  }

  // Handle image upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !analysisId) return

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/dicom']
    if (!validTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.dcm')) {
      alert('Please upload a valid image file (JPEG, PNG, GIF) or DICOM file')
      return
    }
    
    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('image', file)

      const response = await api.post(`/api/scans/${analysisId}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      // Reload images to get the updated list
      const imagesResponse = await api.get(`/api/scans/${analysisId}/images`)
      const imagesData = imagesResponse.data?.data?.images
      
      if (imagesData && imagesData.length > 0) {
        setFiles(imagesData)
        // Don't change the selected image - keep the current one displayed
        // The new thumbnail will be added to the thumbnail bar
        console.log('✅ Images refreshed after upload:', imagesData.length)
      }

      if (fileInputRef.current) { fileInputRef.current.value = '' }
      alert('Image uploaded successfully!')
    } catch (error: any) {
      alert(`Failed to upload image: ${error.response?.data?.message || error.message || 'Unknown error'}`)
    } finally {
      setUploading(false)
    }
  }

  const handleAddImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // Helper function to get analysis type display name
  const getAnalysisTypeDisplayName = (analysisType: string) => {
    const typeMap: { [key: string]: string } = {
      'auto': 'Auto-detect (Recommended)',
      'brain_tumor': 'Brain Tumor Analysis',
      'breast_cancer': 'Breast Cancer Detection',
      'lung_tumor': 'Lung Tumor Analysis',
      'ct_to_mri': 'CT to MRI Conversion',
      'mri_to_ct': 'MRI to CT Conversion'
    }
    return typeMap[analysisType] || analysisType
  }

  // Enhanced analysis handlers
  const handleStartAnalysis = async () => {
    if (!analysisId || !meta?.analysisType) return
    
    try {
      await startAnalysis(meta.analysisType)
    } catch (error) {
      console.error('Failed to start analysis:', error)
    }
  }

  const handleRetryAnalysis = async () => {
    if (!analysisId || !meta?.analysisType) return
    
    clearError()
    await startAnalysis(meta.analysisType, undefined, { force: true })
  }

  const handleCancelAnalysis = () => {
    cancelAnalysis()
  }

  // Prepare export data
  const exportData: AnalysisReportData | null = useMemo(() => {
    if (!currentAnalysis || !meta) return null;

    return {
      scan: {
        id: analysisId || '',
        scanType: meta.scanType || '',
        bodyPart: meta.bodyPart || '',
        priority: 'medium', // Default priority
        status: 'completed',
        createdAt: new Date().toISOString(),
        analysisType: meta.analysisType || 'auto'
      },
      patient: {
        firstName: meta.patient?.split(' ')[0] || 'Unknown',
        lastName: meta.patient?.split(' ').slice(1).join(' ') || 'Patient',
        dateOfBirth: 'N/A',
        gender: 'N/A',
        phone: 'N/A',
        email: 'N/A'
      },
      analysis: {
        id: currentAnalysis.id,
        analysisType: currentAnalysis.analysisType,
        status: currentAnalysis.status,
        confidence: currentAnalysis.confidence || 0,
        createdAt: currentAnalysis.createdAt,
        updatedAt: currentAnalysis.updatedAt,
        result: currentAnalysis.rawData || {}
      },
      metadata: {
        exportedAt: new Date().toISOString(),
        exportedBy: 'current-user', // This would come from auth context
        format: 'pdf'
      }
    };
  }, [currentAnalysis, meta, analysisId]);

  // Handle print report
  const handlePrintReport = async () => {
    if (!exportData) {
      alert('No analysis data available to print');
      return;
    }

    try {
      await generateAndPrintReport(exportData);
    } catch (error) {
      console.error('Print failed:', error);
      alert(`Failed to print report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Handle smooth thumbnail click
  const handleThumbnailClick = (imageIndex: number) => {
    if (imageIndex === selected || isTransitioning) return
    
    console.log(`🖼️ Smooth thumbnail click: ${imageIndex}, previous: ${selected}`)
    
    // Set transition state
    setIsTransitioning(true)
    setPreviousSelected(selected)
    
    // Start loading states
    setIsLoadingImage(true)
    setIsLoadingAnalysis(true)
    
    // Update selected image
    setSelected(imageIndex)
    
    // Clear transition after animation
    setTimeout(() => {
      setIsTransitioning(false)
    }, 400) // Match the transition duration
  }

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (files.length <= 1) return
      
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault()
          if (selected > 0) {
            handleThumbnailClick(selected - 1)
          }
          break
        case 'ArrowRight':
          event.preventDefault()
          if (selected < files.length - 1) {
            handleThumbnailClick(selected + 1)
          }
          break
        case 'Home':
          event.preventDefault()
          if (selected !== 0) {
            handleThumbnailClick(0)
          }
          break
        case 'End':
          event.preventDefault()
          if (selected !== files.length - 1) {
            handleThumbnailClick(files.length - 1)
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selected, files.length, isTransitioning])

  // Handle image deletion
  const handleDeleteImage = async (imageIndex: number) => {
    if (!analysisId) return;

    // Don't allow deleting if it's the last image
    if (files.length <= 1) {
      alert('Cannot delete the last image from a scan');
      return;
    }

    // Confirm deletion
    const confirmed = window.confirm(
      `Are you sure you want to delete this image? This action cannot be undone and will also delete any analysis results for this image.`
    );

    if (!confirmed) return;

    try {
      console.log('🗑️ Deleting image at index:', imageIndex);
      
      const response = await api.delete(`/api/scans/${analysisId}/images?imageIndex=${imageIndex}`);
      
      if (response.data.status === 'success') {
        console.log('✅ Image deleted successfully');
        
        // Reload images to get the updated list
        const imagesResponse = await api.get(`/api/scans/${analysisId}/images`);
        const imagesData = imagesResponse.data?.data?.images;
        
        if (imagesData && imagesData.length > 0) {
          setFiles(imagesData);
          
          // If we deleted the currently selected image, select the first available image
          if (selected >= imagesData.length) {
            setSelected(0);
          } else if (selected > imageIndex) {
            // If we deleted an image before the selected one, adjust the selection
            setSelected(selected - 1);
          }
          
          console.log('✅ Images refreshed after deletion:', imagesData.length);
        } else {
          console.log('⚠️ No images remaining after deletion');
        }
        
        alert('Image deleted successfully!');
      } else {
        throw new Error(response.data.message || 'Failed to delete image');
      }
    } catch (error: any) {
      console.error('❌ Error deleting image:', error);
      alert(`Failed to delete image: ${error.response?.data?.message || error.message || 'Unknown error'}`);
    }
  };

    return (
      <MainContainer>
      {/* Back Button - Fixed position at top-left */}
      <BackButton onClick={handleBackToScans} title="Back to Scans" aria-label="Back to Scans">
        <FaChevronLeft size={18} />
      </BackButton>

      {/* Content Area */}
      <ContentArea>

        {/* Main Viewer Area */}
        <MainViewerArea>
          {/* Thumbnail Bar */}
          <ThumbnailBar>
            {/* Navigation arrows */}
            {files.length > 1 && (
              <>
                <button
                  onClick={() => handleThumbnailClick(Math.max(0, selected - 1))}
                  disabled={selected === 0 || isTransitioning}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: selected === 0 ? 'rgba(255,255,255,0.1)' : 'rgba(6, 148, 251, 0.2)',
                    color: selected === 0 ? '#666' : '#0694fb',
                    border: '1px solid rgba(6, 148, 251, 0.3)',
                    cursor: selected === 0 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    transition: 'all 0.2s ease',
                    opacity: selected === 0 ? 0.5 : 1
                  }}
                  title="Previous image (←)"
                >
                  <FaChevronLeft size={10} />
                </button>
                
                <button
                  onClick={() => handleThumbnailClick(Math.min(files.length - 1, selected + 1))}
                  disabled={selected === files.length - 1 || isTransitioning}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: selected === files.length - 1 ? 'rgba(255,255,255,0.1)' : 'rgba(6, 148, 251, 0.2)',
                    color: selected === files.length - 1 ? '#666' : '#0694fb',
                    border: '1px solid rgba(6, 148, 251, 0.3)',
                    cursor: selected === files.length - 1 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    transition: 'all 0.2s ease',
                    opacity: selected === files.length - 1 ? 0.5 : 1
                  }}
                  title="Next image (→)"
                >
                  <FaChevronRight size={10} />
                </button>
              </>
            )}
            
            {/* Image counter */}
            {files.length > 1 && (
              <div style={{
                fontSize: 12,
                color: '#8aa',
                margin: '0 8px',
                minWidth: '40px',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {selected + 1} / {files.length}
              </div>
            )}
            
            {files.length > 0 ? (
              files.map((file, index) => (
                <ThumbnailContainer 
                  key={index} 
                  $isSelected={selected === index}
                  $isLoading={isLoadingImage && selected === index}
                  onClick={() => handleThumbnailClick(index)}
                >
                  <SmartThumbnail
                    url={file.url}
                    alt={`Scan ${index + 1}`}
                    size={50}
                  />
                  {/* Delete button - only show if there's more than one image */}
                  {files.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent thumbnail selection
                        handleDeleteImage(index);
                      }}
                      style={{
                        position: 'absolute',
                        top: -6,
                        right: -6,
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        background: '#f44336',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 10,
                        zIndex: 10,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.1)'
                        e.currentTarget.style.background = '#d32f2f'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)'
                        e.currentTarget.style.background = '#f44336'
                      }}
                      title="Delete this image"
                    >
                      <FaTrashAlt size={8} />
                    </button>
                  )}
                </ThumbnailContainer>
              ))
            ) : (
              <div style={{ 
                width: '50px',
                height: '50px',
                background: '#2a2a2a',
                border: '2px dashed #666',
                                          borderRadius: '6px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                color: '#666',
                                      fontSize: '10px',
                textAlign: 'center'
              }}>
                No Images
              </div>
            )}
            
            {/* Add Image Button */}
            <button
              onClick={handleAddImageClick}
              disabled={uploading}
                                    style={{
                width: '50px',
                height: '50px',
                background: uploading ? '#666' : 'transparent',
                border: '2px dashed #0694fb',
                                            borderRadius: '6px',
                cursor: uploading ? 'not-allowed' : 'pointer',
                                      display: 'flex',
                flexDirection: 'column',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                color: '#0694fb',
                                      fontSize: '10px',
                opacity: uploading ? 0.6 : 1
              }}
            >
              {uploading ? (
                <>
                  <FaSpinner size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  <div style={{ fontSize: '8px', marginTop: '2px' }}>Uploading...</div>
                </>
              ) : (
                <>
                  <FaPlusCircle size={16} />
                  <div style={{ fontSize: '8px', marginTop: '2px' }}>Add</div>
                </>
              )}
            </button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,.dcm,application/dicom"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
          </ThumbnailBar>

          {/* Viewer Area */}
          <ViewerArea>
            <ImageViewerArea data-image-viewer style={{ position: 'relative' }}>
              {/* Loading overlay for image viewer */}
              {isLoadingImage && (
                <LoadingOverlay>
                  <LoadingSpinner />
                  <LoadingText>
                    Loading image...
                  </LoadingText>
                  <LoadingProgress />
                </LoadingOverlay>
              )}
              
              {files.length > 0 ? (
                (() => {
                  // Determine output image URL when analysis result is ready
                  // Only show output image if currentAnalysis belongs to the currently selected image
                  const outputImageUrl = (() => {
                    if (!currentAnalysis) {
                      console.log('🖼️ No current analysis - showing single viewer')
                      return ''
                    }
                    
                    // Check if the current analysis belongs to the currently selected image
                    if (currentAnalysis.imageIndex !== selected) {
                      console.log(`🖼️ Analysis belongs to image ${currentAnalysis.imageIndex}, but selected is ${selected} - showing single viewer`)
                      return ''
                    }
                    
                    console.log(`🖼️ Analysis belongs to selected image ${selected} - showing side-by-side viewer`)
                    
                    let outputUrl = ''
                    if (meta?.analysisType === 'ct_to_mri') {
                      outputUrl = (currentAnalysis as any)?.ct_to_mri || (currentAnalysis as any)?.rawData?.ct_to_mri || ''
                    } else if (meta?.analysisType === 'mri_to_ct') {
                      outputUrl = (currentAnalysis as any)?.converted_image || (currentAnalysis as any)?.rawData?.converted_image || ''
                    } else {
                      outputUrl = (currentAnalysis as any)?.combined_image || (currentAnalysis as any)?.rawData?.combined_image || ''
                    }
                    
                    console.log(`🖼️ Output image URL:`, {
                      analysisType: meta?.analysisType,
                      hasCombinedImage: !!(currentAnalysis as any)?.combined_image,
                      hasRawDataCombinedImage: !!(currentAnalysis as any)?.rawData?.combined_image,
                      outputUrl: outputUrl ? `${outputUrl.substring(0, 50)}...` : 'empty',
                      outputUrlLength: outputUrl?.length || 0
                    })
                    
                    return outputUrl
                  })()

                  const showSideBySide = Boolean(outputImageUrl)

                  if (!showSideBySide) {
                    // Single viewer with smooth transitions
                    return (
                      <ImageContainer>
                        {files.map((file, index) => (
                          <ImageSlide
                            key={index}
                            $isActive={selected === index}
                            $direction={index > previousSelected ? 'right' : 'left'}
                          >
                            <ImageViewer
                              imageUrl={file.url || '/placeholder-image.jpg'}
                              alt={`Medical Scan ${index + 1}`}
                              showControls={false}
                              disableInteractions={true}
                            />
                          </ImageSlide>
                        ))}
                      </ImageContainer>
                    )
                  }

                  // Side-by-side comparison: Original (left) and Output (right)
                  return (
                    <div style={{ display: 'flex', gap: 0, width: '100%', height: '100%' }}>
                      {/* Left: Original */}
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                        <div style={{ fontSize: 12, color: '#8aa', margin: '0 0 6px 0', height: 18, display: 'flex', alignItems: 'center' }}>Original</div>
                        <div style={{ flex: 1, minHeight: 0, position: 'relative', background: '#000', borderRadius: 8 }}>
                          <ImageContainer>
                            {files.map((file, index) => (
                              <ImageSlide
                                key={index}
                                $isActive={selected === index}
                                $direction={index > previousSelected ? 'right' : 'left'}
                              >
                                <img
                                  src={file.url || '/placeholder-image.jpg'}
                                  alt={`Original Medical Scan ${index + 1}`}
                                  style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                                />
                              </ImageSlide>
                            ))}
                          </ImageContainer>
                        </div>
                      </div>
                      {/* Divider */}
                      <div style={{ width: 1, background: '#2a2a2a', height: '100%', margin: '0 12px' }} />
                      {/* Right: Output */}
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                        <div style={{ fontSize: 12, color: '#8aa', margin: '0 0 6px 0', height: 18, display: 'flex', alignItems: 'center' }}>Output</div>
                        <div style={{ flex: 1, minHeight: 0, position: 'relative', background: '#000', borderRadius: 8 }}>
                          <img
                            src={outputImageUrl}
                            alt="AI Output Image"
                            style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })()
              ) : (
              <div style={{
                  width: '100%',
                  height: '100%',
                display: 'flex',
                  flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                  background: '#1a1a1a',
                  color: '#666',
                fontSize: '16px',
                textAlign: 'center',
                  gap: '16px'
              }}>
                  <FaFileMedical size={48} />
                  <div>No images available for this scan</div>
                  <div style={{ fontSize: '12px', color: '#888' }}>
                    Upload images using the &quot;Add&quot; button above
                </div>
          </div>
            )}
            </ImageViewerArea>
          </ViewerArea>
        </MainViewerArea>

        {/* Right Sidebar - Analysis Results */}
        <RightSidebar style={{ position: 'relative' }}>
          {/* Loading overlay for analysis section */}
          {isLoadingAnalysis && (
            <LoadingOverlay>
              <LoadingSpinner />
              <LoadingText>
                Loading analysis...
              </LoadingText>
              <LoadingProgress />
            </LoadingOverlay>
          )}
          
          {/* Analysis Status Header */}
          <AnalysisContent $isLoading={isLoadingAnalysis}>
            <SidebarSection>
            <AnalysisHeader>
              <AnalysisTitle>
                <FaBrain size={16} style={{ marginRight: '8px', color: '#0694fb' }} />
                AI Analysis Results
              </AnalysisTitle>
              <AnalysisSubtitle>
                {meta?.scanType} • {meta?.patient} • {meta?.caseId}
              </AnalysisSubtitle>
            </AnalysisHeader>
          </SidebarSection>

          {/* Analysis Status Indicator */}
          <SidebarSection>
            <StatusIndicator>
              <StatusBadge $status={status}>
                {status === 'processing' && <FaSpinner size={12} style={{ animation: 'spin 1s linear infinite', marginRight: '6px' }} />}
                {status === 'completed' && <FaCheckCircle size={12} style={{ marginRight: '6px', color: '#4CAF50' }} />}
                {status === 'failed' && <FaTimesCircle size={12} style={{ marginRight: '6px', color: '#f44336' }} />}
                {status === 'pending' && <FaClock size={12} style={{ marginRight: '6px', color: '#ff9800' }} />}
                {status?.charAt(0).toUpperCase() + status?.slice(1)}
              </StatusBadge>
              {status === 'processing' && (
                <ProgressBar>
                  <ProgressFill $progress={analysisProgress?.progress || 0} />
                </ProgressBar>
              )}
              {status === 'processing' && (
                <>
                  <ProgressMeta>
                    <div>{analysisProgress?.message || 'Analyzing...'}</div>
                    <div>{Math.round(analysisProgress?.progress || 0)}%</div>
                  </ProgressMeta>
                  <StageChips>
                    {['initializing','uploading','processing','generating_report','completed'].map(stage => (
                      <StageChip key={stage} $active={analysisProgress?.stage === stage}>
                        {stage.replace(/_/g,' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </StageChip>
                    ))}
                  </StageChips>
                </>
              )}
            </StatusIndicator>
          </SidebarSection>

          {/* Clinical Summary (compact) */}
          <SidebarSection>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <FindingsTitle>
                <FaBrain size={14} style={{ marginRight: '8px', color: '#28a745' }} />
                Clinical Summary
              </FindingsTitle>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: 8,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 8,
                padding: 12
              }}>
                {/* For CT↔MRI conversion services, show different fields */}
                {(meta?.analysisType === 'ct_to_mri' || meta?.analysisType === 'mri_to_ct') ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: 12, color: '#8aa', fontWeight: 600 }}>Conversion Status</div>
                      <div style={{ fontSize: 13, color: 'white', fontWeight: 700 }}>
                        {currentAnalysis?.detected_case || 'Completed'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: 12, color: '#8aa', fontWeight: 600 }}>SSIM Score</div>
                      <div style={{ fontSize: 13, color: 'white', fontWeight: 700 }}>
                        {currentAnalysis?.ssim != null ? `${Number(currentAnalysis.ssim).toFixed(4)}` : '—'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: 12, color: '#8aa', fontWeight: 600 }}>Quality Assessment</div>
                      <div style={{ fontSize: 13, color: 'white', fontWeight: 700 }}>
                        {currentAnalysis?.ssim != null ? 
                          (Number(currentAnalysis.ssim) >= 0.9 ? 'Excellent' : 
                           Number(currentAnalysis.ssim) >= 0.8 ? 'Good' : 
                           Number(currentAnalysis.ssim) >= 0.7 ? 'Fair' : 'Poor') : '—'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: 12, color: '#8aa', fontWeight: 600 }}>Analysis Type</div>
                      <div style={{ fontSize: 13, color: 'white', fontWeight: 700 }}>
                        {getAnalysisTypeDisplayName(meta?.analysisType || 'auto')}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: 12, color: '#8aa', fontWeight: 600 }}>Primary Finding</div>
                      <div style={{ fontSize: 13, color: 'white', fontWeight: 700 }}>
                        {currentAnalysis?.detected_case || '—'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: 12, color: '#8aa', fontWeight: 600 }}>Confidence</div>
                      <div style={{ fontSize: 13, color: 'white', fontWeight: 700 }}>
                        {currentAnalysis?.overall_confidence != null ? `${Number(currentAnalysis.overall_confidence).toFixed(1)}%` : '—'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: 12, color: '#8aa', fontWeight: 600 }}>Analysis Type</div>
                      <div style={{ fontSize: 13, color: 'white', fontWeight: 700 }}>
                        {getAnalysisTypeDisplayName(meta?.analysisType || 'auto')}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </SidebarSection>

          {/* Confidence Breakdown - individual classes and scores (moved before Medical Notes) */}
          {/* Hide confidence breakdown for CT↔MRI conversion services */}
          {extractConfidenceEntries.length > 0 && !(meta?.analysisType === 'ct_to_mri' || meta?.analysisType === 'mri_to_ct') && (
            <SidebarSection>
              <FindingsTitle>
                <FaBrain size={14} style={{ marginRight: '8px', color: '#28a745' }} />
                Confidence Breakdown
              </FindingsTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {extractConfidenceEntries.map(([key, value]) => {
                  const isPredicted = normalized(key) === normalized(currentAnalysis?.detected_case || '') || key === extractConfidenceEntries[0][0]
                  return (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ fontSize: 12, color: isPredicted ? '#fff' : '#ccc', fontWeight: isPredicted ? 700 : 500, minWidth: 120 }}>
                        {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        {isPredicted && (
                          <span style={{
                            marginLeft: 8,
                            fontSize: 10,
                            color: '#4CAF50',
                            border: '1px solid rgba(76, 175, 80, 0.5)',
                            padding: '2px 6px',
                            borderRadius: 12
                          }}>Predicted</span>
                        )}
                      </div>
                      <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${value}%`, background: getConfidenceColor(value), borderRadius: 4, transition: 'width 0.3s ease' }} />
                      </div>
                      <div style={{ minWidth: 48, textAlign: 'right', fontSize: 12, fontWeight: isPredicted ? 700 : 600, color: getConfidenceColor(value) }}>
                        {Number(value).toFixed(1)}%
                      </div>
                    </div>
                  )
                })}
              </div>
            </SidebarSection>
          )}

          {/* Medical Notes (placed after Clinical Summary) */}
          {medicalNotesText && (
            <SidebarSection>
              <ScanNotesSection>
                <ScanNotesTitle>
                  <FaComment size={14} style={{ marginRight: '8px', color: '#ff9800' }} />
                  Medical Notes
                </ScanNotesTitle>
                <ScanNotesContent style={{ maxHeight: notesExpanded ? 'none' : 160, overflow: 'hidden' }}>
                  {medicalNotesText}
                </ScanNotesContent>
                <ScanNotesFooter>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <ScanNotesLabel>Generated from analysis</ScanNotesLabel>
                    <button
                      onClick={() => setNotesExpanded(v => !v)}
                      style={{
                        background: 'transparent',
                        color: '#8aa',
                        border: '1px solid rgba(255,255,255,0.2)',
                        padding: '4px 8px',
                        borderRadius: 4,
                        fontSize: 10,
                        cursor: 'pointer'
                      }}
                    >
                      {notesExpanded ? 'Show less' : 'Show more'}
                    </button>
                    {/* Only show View Output Image button for conversion analyses (not detection analyses) and only if analysis belongs to selected image */}
                    {(meta?.analysisType === 'ct_to_mri' || meta?.analysisType === 'mri_to_ct') && 
                     currentAnalysis && currentAnalysis.imageIndex === selected &&
                     (currentAnalysis?.combined_image || 
                      (meta?.analysisType === 'ct_to_mri' && currentAnalysis?.ct_to_mri) ||
                      (meta?.analysisType === 'mri_to_ct' && currentAnalysis?.mri_to_ct)) && (
                      <button
                        onClick={() => setIsOutputModalOpen(true)}
                        style={{
                          background: '#0694fb',
                          color: 'white',
                          border: 'none',
                          padding: '6px 10px',
                          borderRadius: 4,
                          fontSize: 10,
                          cursor: 'pointer'
                        }}
                      >
                        View Output Image
                      </button>
                    )}
                  </div>
                </ScanNotesFooter>
              </ScanNotesSection>
            </SidebarSection>
          )}


          {/* Output Image Section for Conversion Analyses */}
          {(meta?.analysisType === 'ct_to_mri' || meta?.analysisType === 'mri_to_ct') && (
            <SidebarSection>
              <FindingsTitle>
                <FaEye size={14} style={{ marginRight: '8px', color: '#0694fb' }} />
                Conversion Output
              </FindingsTitle>
              <div style={{
                background: 'rgba(6, 148, 251, 0.05)',
                border: '1px solid rgba(6, 148, 251, 0.2)',
                borderRadius: 8,
                padding: 12
              }}>
                <div style={{ fontSize: 12, color: '#8aa', marginBottom: 8 }}>
                  {meta?.analysisType === 'ct_to_mri' ? 'CT to MRI converted image' : 'MRI to CT converted image'}
                </div>
                {currentAnalysis && currentAnalysis.imageIndex === selected && 
                 (currentAnalysis?.ct_to_mri || currentAnalysis?.mri_to_ct || currentAnalysis?.combined_image || currentAnalysis?.converted_image ||
                  currentAnalysis?.rawData?.ct_to_mri || currentAnalysis?.rawData?.mri_to_ct || currentAnalysis?.rawData?.combined_image || currentAnalysis?.rawData?.converted_image) ? (
                  <button
                    onClick={() => setIsOutputModalOpen(true)}
                    style={{
                      background: '#0694fb',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <FaEye size={12} />
                    View Output Image
                  </button>
                ) : (
                  <div style={{ fontSize: 12, color: '#ff9800', fontStyle: 'italic' }}>
                    No output image available
                  </div>
                )}
              </div>
            </SidebarSection>
          )}

          {/* AI Test Analysis Section */}
          <SidebarSection>
            <AnalysisHeader>
              <AnalysisTitle>
                <FaCogs size={16} style={{ marginRight: '8px', color: '#0694fb' }} />
                AI Analysis
              </AnalysisTitle>
              <AnalysisSubtitle>Run or re-run the selected analysis</AnalysisSubtitle>
            </AnalysisHeader>
            
            <StatusIndicator>
              <StatusBadge $status="completed" style={{ alignSelf: 'flex-start' }}>
                <FaCheckCircle size={12} style={{ marginRight: '6px' }} />
                {getAnalysisTypeDisplayName(meta?.analysisType || 'auto')}
              </StatusBadge>
              
              {!isAnalysisRunning && !hasCompletedAnalysis() && (
                <div style={{ marginTop: '12px' }}>
                  <SidebarActionButton 
                    $variant="primary" 
                    onClick={handleStartAnalysis}
                    disabled={!meta?.analysisType || isLoadingImage || isLoadingAnalysis}
                    style={{ width: '100%' }}
                  >
                    <FaPlay size={12} />
                    Start Analysis
                  </SidebarActionButton>
                </div>
              )}

              {/* Allow re-running a completed analysis */}
              {!isAnalysisRunning && hasCompletedAnalysis() && (
                <div style={{ marginTop: '12px' }}>
                  <SidebarActionButton 
                    $variant="primary" 
                    onClick={handleRetryAnalysis}
                    disabled={!meta?.analysisType || isLoadingImage || isLoadingAnalysis}
                    style={{ width: '100%' }}
                  >
                    <FaCog size={12} />
                    Re-run Analysis
                  </SidebarActionButton>
                </div>
              )}
            </StatusIndicator>
          </SidebarSection>

          

          {/* Removed verbose sections for minimal, doctor-focused view */}

          {/* Action Buttons - pulled up to reduce gap from re-run button */}
          <SidebarSection style={{ marginTop: 12 }}>
            <ActionButtons>
              <SidebarActionButton 
                $variant="primary" 
                onClick={() => setIsExportModalOpen(true)}
                disabled={!currentAnalysis || currentAnalysis.status !== 'completed' || isLoadingImage || isLoadingAnalysis}
              >
                <FaFileExport size={14} />
                Export Results
              </SidebarActionButton>
              <SidebarActionButton 
                $variant="secondary" 
                onClick={handlePrintReport}
                disabled={!currentAnalysis || currentAnalysis.status !== 'completed' || isLoadingImage || isLoadingAnalysis}
              >
                <FaDownload size={14} />
                Print Report
              </SidebarActionButton>
            </ActionButtons>
          </SidebarSection>
          </AnalysisContent>
        </RightSidebar>
      </ContentArea>
      {isOutputModalOpen && currentAnalysis && currentAnalysis.imageIndex === selected && 
       (currentAnalysis?.combined_image || currentAnalysis?.rawData?.combined_image ||
        currentAnalysis?.converted_image || currentAnalysis?.rawData?.converted_image ||
        (meta?.analysisType === 'ct_to_mri' && (currentAnalysis?.ct_to_mri || currentAnalysis?.rawData?.ct_to_mri)) ||
        (meta?.analysisType === 'mri_to_ct' && (currentAnalysis?.mri_to_ct || currentAnalysis?.rawData?.mri_to_ct))) && (
        <div
          onClick={() => setIsOutputModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#1a1a1a',
              border: '1px solid #2a2a2a',
              borderRadius: 8,
              padding: 20,
              width: 'auto',
              maxWidth: '95vw',
              maxHeight: '95vh',
              overflow: 'auto',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'white' }}>Analysis Output Image</div>
              <button
                onClick={() => setIsOutputModalOpen(false)}
                style={{
                  background: 'transparent',
                  color: '#8aa',
                  border: '1px solid #2a2a2a',
                  padding: '6px 10px',
                  borderRadius: 6,
                  fontSize: 12,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
            <img
              src={(() => {
                // Get image URL (Supabase Storage URL or base64 data URL)
                let imageUrl = '';
                
                if (meta?.analysisType === 'ct_to_mri') {
                  imageUrl = currentAnalysis?.ct_to_mri || currentAnalysis?.rawData?.ct_to_mri || '';
                } else if (meta?.analysisType === 'mri_to_ct') {
                  // For MRI to CT conversion, use converted_image field
                  imageUrl = currentAnalysis?.converted_image || currentAnalysis?.rawData?.converted_image || '';
                } else {
                  imageUrl = currentAnalysis?.combined_image || currentAnalysis?.rawData?.combined_image ||
                             currentAnalysis?.converted_image || currentAnalysis?.rawData?.converted_image || '';
                }
                
                // Debug: Log image URL for troubleshooting
                if (!imageUrl) {
                  console.log('⚠️ No image URL found for modal:', {
                    analysisType: meta?.analysisType,
                    hasCurrentAnalysis: !!currentAnalysis,
                    hasRawData: !!currentAnalysis?.rawData
                  });
                }
                
                return imageUrl;
              })()}
              alt="Analysis output"
              style={{ 
                maxWidth: '90vw',
                maxHeight: '75vh',
                width: 'auto',
                height: 'auto', 
                borderRadius: 8, 
                border: '2px solid #2a2a2a',
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
              }}
            />
          </div>
        </div>
      )}

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        scanId={analysisId || ''}
        imageIndex={selected}
        analysisData={exportData}
      />
    </MainContainer>
  )
}

export default AnalysisDetail