'use client'

import React from 'react';
import { FaBrain, FaLungs, FaHeart, FaImage, FaChartLine, FaExclamationTriangle, FaCheckCircle, FaInfoCircle } from 'react-icons/fa';
import styled from 'styled-components';

interface AIAnalysisResult {
  detected_case?: string;
  overall_confidence?: number;
  confidence_scores?: Array<{ [key: string]: string | number }>;
  medical_note?: string;
  scan_type?: string;
  combined_image?: string;
  ssim_score?: number;
  processing_time?: number;
}

interface AIAnalysisViewProps {
  analysisType: 'brain_tumor' | 'breast_cancer' | 'lung_tumor' | 'mri_to_ct' | 'ct_to_mri';
  result: AIAnalysisResult;
  originalImage?: string;
  processedImage?: string;
  className?: string;
}

const AnalysisContainer = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 24px;
  margin: 16px 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const AnalysisHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const AnalysisTitle = styled.h2`
  color: #0694fb;
  margin: 0;
  font-size: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StatusBadge = styled.div<{ status: 'normal' | 'warning' | 'critical' }>`
  background: ${props => {
    switch (props.status) {
      case 'normal': return '#28a745';
      case 'warning': return '#ffc107';
      case 'critical': return '#dc3545';
    }
  }};
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ResultsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
`;

const ResultCard = styled.div<{ variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' }>`
  background: ${props => {
    switch (props.variant) {
      case 'success': return 'rgba(40, 167, 69, 0.1)';
      case 'warning': return 'rgba(255, 193, 7, 0.1)';
      case 'danger': return 'rgba(220, 53, 69, 0.1)';
      case 'secondary': return 'rgba(255, 255, 255, 0.03)';
      default: return 'rgba(6, 148, 251, 0.1)';
    }
  }};
  border: 1px solid ${props => {
    switch (props.variant) {
      case 'success': return '#28a74540';
      case 'warning': return '#ffc10740';
      case 'danger': return '#dc354540';
      case 'secondary': return 'rgba(255, 255, 255, 0.1)';
      default: return '#0694fb40';
    }
  }};
  border-radius: 8px;
  padding: 20px;
`;

const CardTitle = styled.h3`
  color: ${props => props.color || '#0694fb'};
  margin: 0 0 12px 0;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ConfidenceBar = styled.div`
  background: rgba(255, 255, 255, 0.1);
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
  margin: 8px 0;
`;

const ConfidenceFill = styled.div<{ percentage: number; color: string }>`
  background: ${props => props.color};
  height: 100%;
  width: ${props => props.percentage}%;
  transition: width 0.3s ease;
`;

const ConfidenceScores = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  margin-top: 16px;
`;

const ConfidenceItem = styled.div<{ value: number }>`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid ${props => props.value > 50 ? '#28a74540' : '#ffc10740'};
  border-radius: 6px;
  padding: 12px;
  text-align: center;
`;

const MedicalNote = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
`;

const ImageComparison = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 20px;
`;

const ImageContainer = styled.div`
  text-align: center;
`;

const ImageLabel = styled.h4`
  color: #0694fb;
  margin: 0 0 8px 0;
  font-size: 14px;
`;

const ImagePreview = styled.img`
  width: 100%;
  max-width: 300px;
  height: auto;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const ProcessingInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 12px;
  color: #888;
`;

const AIAnalysisView: React.FC<AIAnalysisViewProps> = ({
  analysisType,
  result,
  originalImage,
  processedImage,
  className
}) => {
  const getAnalysisIcon = () => {
    switch (analysisType) {
      case 'brain_tumor': return <FaBrain />;
      case 'breast_cancer': return <FaHeart />;
      case 'lung_tumor': return <FaLungs />;
      case 'mri_to_ct': return <FaImage />;
      case 'ct_to_mri': return <FaImage />;
      default: return <FaChartLine />;
    }
  };

  const getAnalysisTitle = () => {
    switch (analysisType) {
      case 'brain_tumor': return 'Brain Tumor Analysis';
      case 'breast_cancer': return 'Breast Cancer Detection';
      case 'lung_tumor': return 'Lung Tumor Analysis';
      case 'mri_to_ct': return 'MRI to CT Translation';
      case 'ct_to_mri': return 'CT to MRI Translation';
      default: return 'AI Analysis';
    }
  };

  const getStatusInfo = () => {
    const detectedCase = result.detected_case?.toLowerCase() || '';
    const confidence = result.overall_confidence || 0;
    
    if (detectedCase.includes('no') || detectedCase.includes('normal') || detectedCase.includes('negative')) {
      return { status: 'normal' as const, icon: <FaCheckCircle />, text: 'Normal' };
    } else if (detectedCase.includes('low') || detectedCase.includes('mild') || confidence < 70) {
      return { status: 'warning' as const, icon: <FaInfoCircle />, text: 'Requires Review' };
    } else {
      return { status: 'critical' as const, icon: <FaExclamationTriangle />, text: 'Attention Required' };
    }
  };

  const formatConfidenceScores = () => {
    if (!result.confidence_scores || !Array.isArray(result.confidence_scores)) return [];
    
    return result.confidence_scores.map((score, index) => {
      const key = Object.keys(score)[0];
      const value = parseFloat(score[key] as string) || 0;
      return { key, value };
    }).sort((a, b) => b.value - a.value);
  };

  const statusInfo = getStatusInfo();
  const confidenceScores = formatConfidenceScores();

  return (
    <AnalysisContainer className={className}>
      <AnalysisHeader>
        <AnalysisTitle>
          {getAnalysisIcon()}
          {getAnalysisTitle()}
        </AnalysisTitle>
        <StatusBadge status={statusInfo.status}>
          {statusInfo.icon}
          {statusInfo.text}
        </StatusBadge>
      </AnalysisHeader>

      <ResultsGrid>
        {/* Detection Result */}
        <ResultCard variant={statusInfo.status === 'normal' ? 'success' : statusInfo.status === 'warning' ? 'warning' : 'danger'}>
          <CardTitle color={statusInfo.status === 'normal' ? '#28a745' : statusInfo.status === 'warning' ? '#ffc107' : '#dc3545'}>
            Detection Result
          </CardTitle>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff' }}>
            {result.detected_case || 'Unknown'}
          </div>
        </ResultCard>

        {/* Overall Confidence */}
        <ResultCard>
          <CardTitle>Overall Confidence</CardTitle>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ConfidenceBar>
              <ConfidenceFill 
                percentage={result.overall_confidence || 0} 
                color={statusInfo.status === 'normal' ? '#28a745' : statusInfo.status === 'warning' ? '#ffc107' : '#dc3545'}
              />
            </ConfidenceBar>
            <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff' }}>
              {result.overall_confidence || 0}%
            </span>
          </div>
        </ResultCard>

        {/* SSIM Score (for translation services) */}
        {(analysisType === 'mri_to_ct' || analysisType === 'ct_to_mri') && result.ssim_score && (
          <ResultCard variant="secondary">
            <CardTitle color="#0694fb">Image Quality Score</CardTitle>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff' }}>
              SSIM: {(result.ssim_score * 100).toFixed(2)}%
            </div>
            <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
              Higher scores indicate better image quality
            </div>
          </ResultCard>
        )}
      </ResultsGrid>

      {/* Detailed Confidence Scores */}
      {confidenceScores.length > 0 && (
        <ResultCard variant="secondary">
          <CardTitle>Detailed Confidence Scores</CardTitle>
          <ConfidenceScores>
            {confidenceScores.map((score, index) => (
              <ConfidenceItem key={index} value={score.value}>
                <div style={{ fontSize: '12px', color: '#ccc', marginBottom: '4px' }}>
                  {score.key}
                </div>
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: 'bold',
                  color: score.value > 50 ? '#28a745' : '#ffc107'
                }}>
                  {score.value.toFixed(2)}%
                </div>
              </ConfidenceItem>
            ))}
          </ConfidenceScores>
        </ResultCard>
      )}

      {/* Medical Notes */}
      {result.medical_note && (
        <MedicalNote>
          <CardTitle>Medical Analysis</CardTitle>
          <p style={{ 
            color: '#ccc', 
            fontSize: '14px', 
            lineHeight: '1.6', 
            margin: 0,
            fontStyle: 'italic'
          }}>
            {result.medical_note}
          </p>
        </MedicalNote>
      )}

      {/* Image Comparison (for translation services) */}
      {(analysisType === 'mri_to_ct' || analysisType === 'ct_to_mri') && (originalImage || processedImage) && (
        <ImageComparison>
          {originalImage && (
            <ImageContainer>
              <ImageLabel>
                {analysisType === 'mri_to_ct' ? 'Original MRI' : 'Original CT'}
              </ImageLabel>
              <ImagePreview src={originalImage} alt={analysisType === 'mri_to_ct' ? 'Original MRI' : 'Original CT'} />
            </ImageContainer>
          )}
          {processedImage && (
            <ImageContainer>
              <ImageLabel>
                {analysisType === 'mri_to_ct' ? 'Converted CT' : 'Converted MRI'}
              </ImageLabel>
              <ImagePreview src={processedImage} alt={analysisType === 'mri_to_ct' ? 'Converted CT' : 'Converted MRI'} />
            </ImageContainer>
          )}
        </ImageComparison>
      )}

      {/* Processing Information */}
      <ProcessingInfo>
        <span>Scan Type: {result.scan_type || 'Unknown'}</span>
        {result.processing_time && (
          <span>Processing Time: {result.processing_time.toFixed(2)}s</span>
        )}
        <span>Analysis Date: {new Date().toLocaleString()}</span>
      </ProcessingInfo>
    </AnalysisContainer>
  );
};

export default AIAnalysisView;
