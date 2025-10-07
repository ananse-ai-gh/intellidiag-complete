import React from 'react'
import styled from 'styled-components'
import { 
  FaCheckCircle, FaTimesCircle, FaSpinner, FaEye, 
  FaChartLine, FaFileMedical, FaLightbulb, FaExclamationTriangle,
  FaClock, FaBrain, FaHeartbeat, FaLungs, FaXRay, FaCog
} from 'react-icons/fa'
import { AnalysisResult, AnalysisProgress } from '@/hooks/useAnalysisManager'

interface AnalysisResultsDisplayProps {
  analysis: AnalysisResult | null
  progress: AnalysisProgress | null
  isRunning: boolean
  error: string | null
  imageIndex?: number
  totalImages?: number
  onRetry?: () => void
  onCancel?: () => void
}

const ResultsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background: #1a1a1a;
  border-radius: 8px;
  border: 1px solid #2a2a2a;
`

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`

const ModalContent = styled.div`
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  padding: 16px;
  width: 90%;
  max-width: 900px;
  max-height: 90vh;
  overflow: auto;
`

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`

const ModalTitle = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: white;
`

const CloseButton = styled.button`
  background: transparent;
  color: #8aa;
  border: 1px solid #2a2a2a;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  &:hover { background: rgba(255, 255, 255, 0.05); }
`

const StatusHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 6px;
  background: ${props => {
    switch (props.$status) {
      case 'completed': return 'rgba(76, 175, 80, 0.1)'
      case 'processing': return 'rgba(255, 193, 7, 0.1)'
      case 'failed': return 'rgba(244, 67, 54, 0.1)'
      default: return 'rgba(255, 255, 255, 0.05)'
    }
  }};
  border: 1px solid ${props => {
    switch (props.$status) {
      case 'completed': return 'rgba(76, 175, 80, 0.3)'
      case 'processing': return 'rgba(255, 193, 7, 0.3)'
      case 'failed': return 'rgba(244, 67, 54, 0.3)'
      default: return 'rgba(255, 255, 255, 0.1)'
    }
  }};
`

const StatusIcon = styled.div`
  font-size: 20px;
  color: ${props => {
    switch (props.$status) {
      case 'completed': return '#4CAF50'
      case 'processing': return '#FFC107'
      case 'failed': return '#F44336'
      default: return '#8aa'
    }
  }};
`

const StatusText = styled.div`
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  color: white;
`

const AnalysisTypeIcon = styled.div`
  font-size: 16px;
  color: #0694fb;
`

const ProgressContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #2a2a2a;
  border-radius: 4px;
  overflow: hidden;
`

const ProgressFill = styled.div<{ $progress: number }>`
  width: ${props => props.$progress}%;
  height: 100%;
  background: linear-gradient(90deg, #0694fb 0%, #4CAF50 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
`

const ProgressText = styled.div`
  font-size: 12px;
  color: #8aa;
  text-align: center;
`

const ResultsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: white;
  margin-bottom: 8px;
`

const ConfidenceDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(6, 148, 251, 0.1);
  border: 1px solid rgba(6, 148, 251, 0.3);
  border-radius: 6px;
`

const ConfidenceScore = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #0694fb;
`

const ConfidenceLabel = styled.div`
  font-size: 12px;
  color: #8aa;
`

const FindingsText = styled.div`
  font-size: 13px;
  line-height: 1.6;
  color: #ccc;
  background: rgba(255, 255, 255, 0.05);
  padding: 12px;
  border-radius: 6px;
  border-left: 3px solid #0694fb;
`

const SSIMDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid rgba(76, 175, 80, 0.3);
  border-radius: 6px;
`

const SSIMScore = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #4CAF50;
`

const SSIMLabel = styled.div`
  font-size: 12px;
  color: #8aa;
`

const ConvertedImageDisplay = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: rgba(6, 148, 251, 0.1);
  border: 1px solid rgba(6, 148, 251, 0.3);
  border-radius: 6px;
`

const ConvertedImageTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: white;
`

const ConvertedImageData = styled.div`
  font-size: 12px;
  color: #8aa;
  word-break: break-all;
  font-family: monospace;
`

const PrimaryResultSection = styled.div`
  margin-bottom: 20px;
`

const PrimaryResultContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.15) 0%, rgba(76, 175, 80, 0.05) 100%);
  border: 2px solid rgba(76, 175, 80, 0.4);
  border-radius: 12px;
  text-align: center;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #4CAF50, #8BC34A, #4CAF50);
  }
`

const PrimaryResultLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #8aa;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

const PrimaryResultText = styled.div`
  font-size: 24px;
  font-weight: 800;
  color: #4CAF50;
  line-height: 1.2;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
`

const PrimaryResultConfidence = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
`

const ConfidenceIcon = styled.div<{ $confidence: number }>`
  font-size: 16px;
  color: ${props => getConfidenceColor(props.$confidence)};
`

const ConfidenceText = styled.div`
  font-weight: 600;
`

const MedicalNoteSection = styled.div`
  margin-bottom: 20px;
`

const MedicalNoteHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
`

const MedicalNoteIcon = styled.div`
  font-size: 16px;
  color: #FFC107;
`

const MedicalNoteTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: white;
`

const MedicalNoteContent = styled.div`
  padding: 16px;
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.6;
  color: #e0e0e0;
  font-style: italic;
  white-space: pre-wrap;
  word-break: break-word;
`

const CombinedImageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: rgba(6, 148, 251, 0.1);
  border: 1px solid rgba(6, 148, 251, 0.3);
  border-radius: 8px;
`

const CombinedImageTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #0694fb;
  text-align: center;
`

const CombinedImageDisplay = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  overflow: hidden;
`

const ConfidenceBreakdownContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
`

const ConfidenceItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const ConfidenceItemLabel = styled.div`
  font-size: 12px;
  color: #ccc;
  min-width: 80px;
  flex-shrink: 0;
`

const ConfidenceItemBar = styled.div`
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
`

const ConfidenceItemFill = styled.div<{ $width: number; $color: string }>`
  height: 100%;
  width: ${props => props.$width}%;
  background: ${props => props.$color};
  border-radius: 4px;
  transition: width 0.3s ease;
`

const ConfidenceItemValue = styled.div`
  font-size: 12px;
  font-weight: 600;
  min-width: 40px;
  text-align: right;
`

const AnalysisHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: linear-gradient(135deg, rgba(6, 148, 251, 0.1) 0%, rgba(76, 175, 80, 0.1) 100%);
  border: 1px solid rgba(6, 148, 251, 0.3);
  border-radius: 8px;
  margin-bottom: 16px;
`

const AnalysisTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const AnalysisTitleText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`


const ImageCounter = styled.div`
  font-size: 12px;
  color: #8aa;
  font-weight: 400;
`

const AnalysisStatus = styled.div`
  display: flex;
  align-items: center;
`

const StatusBadge = styled.div<{ $status: string }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => {
    switch (props.$status) {
      case 'completed': return 'rgba(76, 175, 80, 0.2)'
      case 'processing': return 'rgba(255, 193, 7, 0.2)'
      case 'failed': return 'rgba(244, 67, 54, 0.2)'
      default: return 'rgba(255, 255, 255, 0.1)'
    }
  }};
  color: ${props => {
    switch (props.$status) {
      case 'completed': return '#4CAF50'
      case 'processing': return '#FFC107'
      case 'failed': return '#F44336'
      default: return '#ccc'
    }
  }};
  border: 1px solid ${props => {
    switch (props.$status) {
      case 'completed': return 'rgba(76, 175, 80, 0.4)'
      case 'processing': return 'rgba(255, 193, 7, 0.4)'
      case 'failed': return 'rgba(244, 67, 54, 0.4)'
      default: return 'rgba(255, 255, 255, 0.2)'
    }
  }};
`

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid rgba(244, 67, 54, 0.3);
  border-radius: 6px;
`

const ErrorText = styled.div`
  font-size: 13px;
  color: #ff6b6b;
  line-height: 1.5;
`

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
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
          &:hover { background: #0582d9; }
        `
      case 'danger':
        return `
          background: #f44336;
          color: white;
          &:hover { background: #d32f2f; }
        `
      default:
        return `
          background: transparent;
          color: #8aa;
          border: 1px solid #2a2a2a;
          &:hover { background: rgba(255, 255, 255, 0.05); }
        `
    }
  }}
`

const getAnalysisTypeIcon = (analysisType: string) => {
  switch (analysisType) {
    case 'brain_tumor': return <FaBrain />
    case 'breast_cancer': return <FaHeartbeat />
    case 'lung_tumor': return <FaLungs />
    case 'ct_to_mri': return <FaXRay />
    case 'mri_to_ct': return <FaXRay />
    default: return <FaCog />
  }
}

const getAnalysisTypeName = (analysisType: string) => {
  switch (analysisType) {
    case 'brain_tumor': return 'Brain Tumor Analysis'
    case 'breast_cancer': return 'Breast Cancer Detection'
    case 'lung_tumor': return 'Lung Tumor Analysis'
    case 'ct_to_mri': return 'CT to MRI Conversion'
    case 'mri_to_ct': return 'MRI to CT Conversion'
    default: return 'AI Analysis'
  }
}

const getConfidenceColor = (confidence: number) => {
  if (confidence >= 90) return '#4CAF50'
  if (confidence >= 75) return '#8BC34A'
  if (confidence >= 60) return '#FFC107'
  if (confidence >= 40) return '#FF9800'
  return '#F44336'
}

const getConfidenceLabel = (confidence: number) => {
  if (confidence >= 90) return 'Very High Confidence'
  if (confidence >= 75) return 'High Confidence'
  if (confidence >= 60) return 'Moderate Confidence'
  if (confidence >= 40) return 'Low Confidence'
  return 'Very Low Confidence'
}

export const AnalysisResultsDisplay: React.FC<AnalysisResultsDisplayProps> = ({
  analysis,
  progress,
  isRunning,
  error,
  imageIndex = 0,
  totalImages = 1,
  onRetry,
  onCancel
}) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const openModal = React.useCallback(() => setIsModalOpen(true), [])
  const closeModal = React.useCallback(() => setIsModalOpen(false), [])
  const [notesExpanded, setNotesExpanded] = React.useState(false)
  const toggleNotes = React.useCallback(() => setNotesExpanded(v => !v), [])
  const copyNotes = React.useCallback(() => {
    if (!analysis?.medical_note) return
    navigator.clipboard.writeText(analysis.medical_note).catch(() => {})
  }, [analysis])

  const normalized = (s: string) => s.toLowerCase().replace(/\s|_/g, '')
  const parsePercent = React.useCallback((val: unknown): number => {
    if (val === null || val === undefined) return 0
    if (typeof val === 'number') {
      if (!isFinite(val)) return 0
      return val <= 1 ? val * 100 : val
    }
    if (typeof val === 'string') {
      const t = val.trim()
      const stripped = t.endsWith('%') ? t.slice(0, -1) : t
      const n = Number(stripped)
      if (!isFinite(n)) return 0
      return n <= 1 ? n * 100 : n
    }
    return 0
  }, [])
  const sortedConfidenceEntries = React.useMemo(() => {
    if (!analysis || !analysis.confidence_scores) return []
    const cs: unknown = analysis.confidence_scores
    let entries: [string, number][] = []

    if (Array.isArray(cs)) {
      for (const item of cs as unknown[]) {
        if (Array.isArray(item) && item.length >= 2) {
          const key = String(item[0])
          const value = parsePercent((item as unknown[])[1])
          entries.push([key, value])
          continue
        }
        if (item && typeof item === 'object') {
          const obj = item as Record<string, unknown>
          const keyCandidate = (obj.label ?? obj.name ?? obj.class ?? obj.key ?? obj.category ?? obj.type)
          const valCandidate = (obj.value ?? obj.score ?? obj.confidence ?? obj.probability ?? obj.percent)
          if (keyCandidate !== undefined && valCandidate !== undefined) {
            entries.push([String(keyCandidate), parsePercent(valCandidate)])
          } else {
            for (const [k, v] of Object.entries(obj)) {
              entries.push([k, parsePercent(v)])
            }
          }
        }
      }
    } else if (typeof cs === 'object') {
      entries = Object.entries(cs as Record<string, unknown>).map(([k, v]) => [k, parsePercent(v)])
    }

    entries = entries.filter(([, v]) => isFinite(v))
    entries.sort((a, b) => b[1] - a[1])
    return entries
  }, [analysis, parsePercent])

  const topPredictionKey = React.useMemo(() => {
    if (!sortedConfidenceEntries.length) return null
    return sortedConfidenceEntries[0][0]
  }, [sortedConfidenceEntries])
  if (isRunning && progress) {
    return (
      <ResultsContainer>
        <StatusHeader $status="processing">
          <StatusIcon $status="processing">
            <FaSpinner className="fa-spin" />
          </StatusIcon>
          <StatusText>
            {progress.message}
            {totalImages > 1 && (
              <span style={{ fontSize: '12px', color: '#8aa', marginLeft: '8px' }}>
                (Image {imageIndex + 1} of {totalImages})
              </span>
            )}
          </StatusText>
          <AnalysisTypeIcon>
            {analysis ? getAnalysisTypeIcon(analysis.analysisType) : <FaCog />}
          </AnalysisTypeIcon>
        </StatusHeader>

        <ProgressContainer>
          <ProgressBar>
            <ProgressFill $progress={progress.progress} />
          </ProgressBar>
          <ProgressText>
            {progress.progress}% complete
            {progress.estimatedTimeRemaining && (
              <span> • ~{Math.round(progress.estimatedTimeRemaining / 1000)}s remaining</span>
            )}
          </ProgressText>
        </ProgressContainer>

        <ActionButtons>
          <ActionButton onClick={onCancel}>
            <FaTimesCircle />
            Cancel Analysis
          </ActionButton>
        </ActionButtons>
      </ResultsContainer>
    )
  }

  if (error) {
    return (
      <ResultsContainer>
        <StatusHeader $status="failed">
          <StatusIcon $status="failed">
            <FaExclamationTriangle />
          </StatusIcon>
          <StatusText>Analysis Failed</StatusText>
        </StatusHeader>

        <ErrorContainer>
          <ErrorText>{error}</ErrorText>
          <ActionButtons>
            <ActionButton $variant="primary" onClick={onRetry}>
              <FaCog />
              Retry Analysis
            </ActionButton>
          </ActionButtons>
        </ErrorContainer>
      </ResultsContainer>
    )
  }

  if (!analysis || analysis.status !== 'completed') {
    return null
  }

  return (
    <ResultsContainer>
      {/* Analysis Header */}
      <AnalysisHeader>
        <AnalysisTitle>
          <AnalysisTypeIcon>
            {getAnalysisTypeIcon(analysis.analysisType)}
          </AnalysisTypeIcon>
          <AnalysisTitleText>
            {getAnalysisTypeName(analysis.analysisType)}
            {totalImages > 1 && (
              <ImageCounter>
                Image {imageIndex + 1} of {totalImages}
              </ImageCounter>
            )}
          </AnalysisTitleText>
        </AnalysisTitle>
        <AnalysisStatus>
          <StatusBadge $status="completed" style={{ marginRight: 8 }}>
            <FaCheckCircle />
            Completed
          </StatusBadge>
          <div style={{ display: 'flex', gap: 8 }}>
            <ActionButton $variant="primary" onClick={onRetry}>
              <FaCog />
              Reanalyze
            </ActionButton>
            {analysis.combined_image && (
              <ActionButton onClick={openModal}>
                <FaEye />
                View Output Image
              </ActionButton>
            )}
          </div>
        </AnalysisStatus>
      </AnalysisHeader>

      <ResultsSection>
        {/* Display confidence scores for analysis endpoints */}
        {(analysis.analysisType === 'brain_tumor' || analysis.analysisType === 'breast_cancer' || analysis.analysisType === 'lung_tumor') && analysis.overall_confidence !== undefined && (
          <div>
            <SectionTitle>
              <FaChartLine />
              Overall Confidence
            </SectionTitle>
            <ConfidenceDisplay>
              <ConfidenceScore style={{ color: getConfidenceColor(analysis.overall_confidence) }}>
              {Number(analysis.overall_confidence).toFixed(1)}%
              </ConfidenceScore>
              <ConfidenceLabel>
                {getConfidenceLabel(analysis.overall_confidence)}
              </ConfidenceLabel>
            </ConfidenceDisplay>
          </div>
        )}

        {/* Display SSIM for conversion endpoints */}
        {(analysis.analysisType === 'ct_to_mri' || analysis.analysisType === 'mri_to_ct') && analysis.ssim !== undefined && (
          <div>
            <SectionTitle>
              <FaChartLine />
              SSIM Score
            </SectionTitle>
            <SSIMDisplay>
              <SSIMScore>
                {Number(analysis.ssim).toFixed(4)}
              </SSIMScore>
              <SSIMLabel>
                Structural Similarity Index
              </SSIMLabel>
            </SSIMDisplay>
          </div>
        )}

        {/* Primary Classification Result */}
        {analysis.detected_case && (
          <PrimaryResultSection>
            <PrimaryResultContainer>
              <PrimaryResultLabel>AI Classification</PrimaryResultLabel>
              <PrimaryResultText>
                {analysis.detected_case}
              </PrimaryResultText>
              {analysis.overall_confidence !== undefined && (
                <PrimaryResultConfidence>
                  <ConfidenceIcon $confidence={analysis.overall_confidence}>
                    {analysis.overall_confidence >= 90 ? <FaCheckCircle /> : 
                     analysis.overall_confidence >= 75 ? <FaCheckCircle /> :
                     analysis.overall_confidence >= 60 ? <FaExclamationTriangle /> : <FaTimesCircle />}
                  </ConfidenceIcon>
                  <ConfidenceText style={{ color: getConfidenceColor(analysis.overall_confidence) }}>
                    {Number(analysis.overall_confidence).toFixed(1)}% Confidence
                  </ConfidenceText>
                </PrimaryResultConfidence>
              )}
            </PrimaryResultContainer>
          </PrimaryResultSection>
        )}

        {/* Display confidence scores breakdown for analysis endpoints */}
        {analysis.confidence_scores && typeof analysis.confidence_scores === 'object' && (
          <div>
            <SectionTitle>
              <FaChartLine />
              Confidence Breakdown
            </SectionTitle>
            <ConfidenceBreakdownContainer>
              {sortedConfidenceEntries.map(([key, value]) => {
                  const isPredicted = normalized(key) === normalized(analysis.detected_case || '') || key === topPredictionKey
                  return (
                    <ConfidenceItem key={key}>
                      <ConfidenceItemLabel style={{ fontWeight: isPredicted ? 700 : 400, color: isPredicted ? '#fff' : '#ccc' }}>
                        {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        {isPredicted && (
                          <span style={{
                            marginLeft: 8,
                            fontSize: '10px',
                            color: '#4CAF50',
                            border: '1px solid rgba(76, 175, 80, 0.5)',
                            padding: '2px 6px',
                            borderRadius: 12
                          }}>Predicted</span>
                        )}
                      </ConfidenceItemLabel>
                      <ConfidenceItemBar>
                        <ConfidenceItemFill 
                          $width={value as number} 
                          $color={getConfidenceColor(value as number)}
                        />
                      </ConfidenceItemBar>
                      <ConfidenceItemValue style={{ color: getConfidenceColor(value as number), fontWeight: isPredicted ? 700 : 600 }}>
                        {Number(value as number).toFixed(1)}%
                      </ConfidenceItemValue>
                    </ConfidenceItem>
                  )
                })}
            </ConfidenceBreakdownContainer>
          </div>
        )}

        {/* Display combined image (output image with detected items) */}
        {analysis.combined_image && (
          <div>
            <SectionTitle>
              <FaFileMedical />
              Analysis Output Image
            </SectionTitle>
            <CombinedImageContainer>
              <CombinedImageTitle>
                Detected Items Highlighted
              </CombinedImageTitle>
              <div style={{ fontSize: '12px', color: '#8aa' }}>
                The output image is available. Click the button below to view it.
              </div>
              <ActionButtons>
                <ActionButton $variant="primary" onClick={openModal}>
                  <FaEye />
                  View Output Image
                </ActionButton>
              </ActionButtons>
            </CombinedImageContainer>
          </div>
        )}

        {/* Medical Note */}
        {analysis.medical_note && (
          <MedicalNoteSection>
            <MedicalNoteHeader>
              <MedicalNoteIcon>
                <FaLightbulb />
              </MedicalNoteIcon>
              <MedicalNoteTitle>Clinical Findings</MedicalNoteTitle>
            </MedicalNoteHeader>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <ActionButton onClick={toggleNotes}>
                {notesExpanded ? 'Collapse' : 'Expand'}
              </ActionButton>
              <ActionButton onClick={copyNotes}>Copy</ActionButton>
            </div>
            <MedicalNoteContent style={{ maxHeight: notesExpanded ? 'none' : 160, overflow: 'hidden' }}>
              {analysis.medical_note}
            </MedicalNoteContent>
          </MedicalNoteSection>
        )}

        {/* Display converted image data for conversion endpoints */}
        {(analysis.analysisType === 'ct_to_mri' || analysis.analysisType === 'mri_to_ct') && analysis.converted_image && (
          <div>
            <SectionTitle>
              <FaFileMedical />
              Converted Image Data
            </SectionTitle>
            <ConvertedImageDisplay>
              <ConvertedImageTitle>
                {analysis.analysisType === 'ct_to_mri' ? 'CT to MRI Conversion' : 'MRI to CT Conversion'}
              </ConvertedImageTitle>
              <ConvertedImageData>
                {typeof analysis.converted_image === 'string' 
                  ? analysis.converted_image.substring(0, 100) + (analysis.converted_image.length > 100 ? '...' : '')
                  : JSON.stringify(analysis.converted_image).substring(0, 100) + '...'
                }
              </ConvertedImageData>
            </ConvertedImageDisplay>
          </div>
        )}


        {/* Display scan type */}
        {analysis.scan_type && (
          <div style={{ fontSize: '11px', color: '#666', textAlign: 'center' }}>
            <FaFileMedical style={{ marginRight: '4px' }} />
            Scan Type: {analysis.scan_type}
          </div>
        )}

        {/* Display processing time */}
        {analysis.processingTime && (
          <div style={{ fontSize: '11px', color: '#666', textAlign: 'center', marginTop: '8px' }}>
            <FaClock style={{ marginRight: '4px' }} />
            Processing time: {Number(analysis.processingTime / 1000).toFixed(1)}s
          </div>
        )}
      </ResultsSection>
      {isModalOpen && analysis.combined_image && (
        <ModalOverlay onClick={closeModal}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Analysis Output Image</ModalTitle>
              <CloseButton onClick={closeModal}>Close</CloseButton>
            </ModalHeader>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <img 
                src={`data:image/png;base64,${analysis.combined_image}`}
                alt="Analysis output"
                style={{ maxWidth: '100%', height: 'auto', borderRadius: 6, border: '1px solid #2a2a2a' }}
              />
            </div>
          </ModalContent>
        </ModalOverlay>
      )}
    </ResultsContainer>
  )
}

export default AnalysisResultsDisplay
