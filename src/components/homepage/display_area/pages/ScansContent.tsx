'use client'

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import styled from 'styled-components';
import { 
  FaPlus, FaSearch, FaFilter, FaEye, FaEdit, FaTrash, FaDownload, 
  FaPlay, FaClock, FaCheck, FaTimes, FaSpinner, FaBrain, FaLungs, 
  FaHeart, FaUpload, FaFlask, FaRobot, FaChartLine, FaFileAlt, FaImage,
  FaFileDownload
} from 'react-icons/fa';

// Interfaces
interface Scan {
  id: number;
  scanId: string;
  patientFirstName: string;
  patientLastName: string;
  patientIdNumber: string;
  scanType: string;
  bodyPart: string;
  status: 'pending' | 'analyzing' | 'completed' | 'failed';
  priority: string;
  scanDate: string;
  createdAt: string;
  aiStatus?: string;
  confidence?: number;
  aiFindings?: string;
  imagePath?: string;
  imageCount?: number; // Number of images/DICOM files
}

interface TestResult {
  status: 'idle' | 'testing' | 'success' | 'error';
  response?: any;
  error?: string;
  responseStructure?: any;
}

// Styled Components
const ContentContainer = styled.div`
  padding: 24px;
  background-color: transparent;
  color: #FFFFFF;
  width: 100%;
  height: 100%;
  overflow: auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 16px;
`;

const PageTitle = styled.h1`
  font-size: 28px;
  font-weight: 600;
  margin: 0;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' | 'success' }>`
  background: ${props => {
    switch (props.variant) {
      case 'secondary': return 'rgba(255, 255, 255, 0.1)';
      case 'danger': return 'rgba(220, 53, 69, 0.2)';
      case 'success': return 'rgba(40, 167, 69, 0.2)';
      default: return '#0694FB';
    }
  }};
  color: ${props => {
    switch (props.variant) {
      case 'danger': return '#dc3545';
      case 'success': return '#28a745';
      default: return '#FFFFFF';
    }
  }};
  border: 1px solid ${props => {
    switch (props.variant) {
      case 'secondary': return 'rgba(255, 255, 255, 0.2)';
      case 'danger': return '#dc3545';
      case 'success': return '#28a745';
      default: return '#0694FB';
    }
  }};
  padding: 10px 20px;

  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(400%);
    }
  }
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const TestSection = styled.div`
  background: rgba(6, 148, 251, 0.1);
  border: 1px solid rgba(6, 148, 251, 0.3);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 32px;
`;

const TestTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 20px 0;
  color: #0694FB;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const TestGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
`;

const TestCard = styled.div<{ status: 'idle' | 'testing' | 'success' | 'error' }>`
  background: ${props => {
    switch (props.status) {
      case 'testing': return 'rgba(255, 193, 7, 0.1)';
      case 'success': return 'rgba(40, 167, 69, 0.1)';
      case 'error': return 'rgba(220, 53, 69, 0.1)';
      default: return 'rgba(255, 255, 255, 0.05)';
    }
  }};
  border: 1px solid ${props => {
    switch (props.status) {
      case 'testing': return '#ffc107';
      case 'success': return '#28a745';
      case 'error': return '#dc3545';
      default: return 'rgba(255, 255, 255, 0.1)';
    }
  }};
  border-radius: 8px;
  padding: 16px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
`;

const TestCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const TestCardTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FileUploadArea = styled.div`
  border: 2px dashed #0694fb;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(6, 148, 251, 0.1);
  }
`;

const ResponseContainer = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  padding: 12px;
  margin-top: 12px;
  max-height: 200px;
  overflow-y: auto;
`;

const ResponseText = styled.pre`
  color: #fff;
  font-size: 12px;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
`;

// AI Analysis Results Component
const AIAnalysisResults = ({ result, endpointName, endpointId, uploadedFile }: { result: any, endpointName: string, endpointId: string, uploadedFile?: File }) => {
  if (!result || !result.response) return null;

  const response = result.response;
  
  // Helper function to get status color
  const getStatusColor = (detectedCase: string) => {
    const caseLower = detectedCase.toLowerCase();
    if (caseLower.includes('no') || caseLower.includes('normal')) return '#28a745';
    if (caseLower.includes('low') || caseLower.includes('mild')) return '#ffc107';
    return '#dc3545';
  };

  // Helper function to format confidence scores
  const formatConfidenceScores = (scores: any[]) => {
    if (!Array.isArray(scores)) return [];
    return scores.map((score, index) => {
      const key = Object.keys(score)[0];
      const value = score[key];
      return { key, value: parseFloat(value) || 0 };
    }).sort((a, b) => b.value - a.value);
  };

  // Helper function to download processed image
  const downloadProcessedImage = (imageData: string, filename: string) => {
    try {
      const link = document.createElement('a');
      link.href = `data:image/jpeg;base64,${imageData}`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading image:', error);
      alert('Failed to download image');
    }
  };

  // Helper function to create preview URL for uploaded file
  const getUploadedImageUrl = () => {
    if (uploadedFile) {
      return URL.createObjectURL(uploadedFile);
    }
    return null;
  };

  const confidenceScores = formatConfidenceScores(response.confidence_scores);
  
  // Check if this is a translation service
  const isTranslationService = endpointId === 'mri_to_ct' || endpointId === 'ct_to_mri';
  
  // Debug: Log the response structure for translation services
  if (isTranslationService) {
    console.log(`Translation Service Debug (${endpointId}):`, {
      response,
      ssim_score: response.ssim_score,
      SSIM: response.SSIM,
      ssim: response.ssim,
      SSIM_score: response.SSIM_score,
      ct_to_mri: response.ct_to_mri,
      mri_to_ct: response.mri_to_ct,
      combined_image: response.combined_image,
      detected_case: response.detected_case
    });
  }
  
  // Get SSIM score for translation services - check multiple possible field names
  const ssimScore = response.ssim_score || response.SSIM || response.ssim || response.SSIM_score;
  
  // Get processed image data
  const processedImageData = response.ct_to_mri || response.mri_to_ct || response.combined_image;
  
  // Get appropriate detection result and status color
  let detectionResult = response.detected_case || 'Unknown';
  let statusColor = '#ffc107'; // Default warning color
  
  if (isTranslationService) {
    // For translation services, consider both SSIM score and processed image data
    if (ssimScore || processedImageData) {
      detectionResult = 'Translated';
      statusColor = '#28a745'; // Success green
    } else {
      detectionResult = 'Translating...';
      statusColor = '#ffc107'; // Warning yellow
    }
  } else {
    statusColor = getStatusColor(detectionResult);
  }

  return (
    <div style={{ 
      background: 'rgba(255, 255, 255, 0.05)', 
      borderRadius: '12px', 
      padding: '20px', 
      marginTop: '16px',
      border: `2px solid ${statusColor}40`
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: '16px',
        paddingBottom: '12px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <h3 style={{ color: '#0694fb', margin: 0, fontSize: '18px' }}>
          {endpointName} Analysis Results
        </h3>
        <div style={{ 
          background: statusColor, 
          color: 'white', 
          padding: '4px 12px', 
          borderRadius: '20px',
          fontSize: isTranslationService && !ssimScore ? '10px' : '12px',
          fontWeight: 'bold'
        }}>
          {detectionResult}
        </div>
      </div>

      {/* Main Results Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: isTranslationService ? '1fr 1fr' : '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        {/* Detection Result */}
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.03)', 
          padding: '16px', 
          borderRadius: '8px',
          border: `1px solid ${statusColor}40`
        }}>
          <h4 style={{ color: statusColor, margin: '0 0 8px 0', fontSize: '14px' }}>
            {isTranslationService ? 'Translation Status' : 'Detection Result'}
          </h4>
          <div style={{ fontSize: '16px', color: '#fff', fontWeight: 'bold' }}>
            {detectionResult}
          </div>
        </div>

        {/* SSIM Score for Translation Services or Confidence Score for Others */}
        {isTranslationService ? (
          // SSIM Score for Translation Services
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.03)', 
            padding: '16px', 
            borderRadius: '8px',
            border: `1px solid #43e97b40`
          }}>
            <h4 style={{ color: '#43e97b', margin: '0 0 8px 0', fontSize: '14px' }}>
              Image Quality (SSIM)
            </h4>
            {ssimScore ? (
              // SSIM Score Available
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ 
                    background: 'rgba(255, 255, 255, 0.1)', 
                    flex: 1, 
                    height: '8px', 
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{ 
                      background: '#43e97b', 
                      height: '100%', 
                      width: `${(ssimScore * 100)}%`,
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                  <span style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold' }}>
                    {(ssimScore * 100).toFixed(2)}%
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                  Higher = Better Quality
                </div>
              </>
            ) : processedImageData ? (
              // Translation completed but no SSIM score
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ 
                    background: 'rgba(255, 255, 255, 0.1)', 
                    flex: 1, 
                    height: '8px', 
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{ 
                      background: '#43e97b', 
                      height: '100%', 
                      width: '100%',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                  <span style={{ color: '#43e97b', fontSize: '14px', fontWeight: 'bold' }}>
                    Completed
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                  Translation successful (SSIM not available)
                </div>
              </>
            ) : (
              // Translation in Progress
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ 
                    background: 'rgba(255, 255, 255, 0.1)', 
                    flex: 1, 
                    height: '8px', 
                    borderRadius: '4px',
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    <div style={{ 
                      background: 'linear-gradient(90deg, #43e97b, #38f9d7)',
                      height: '100%', 
                      width: '30%',
                      borderRadius: '4px',
                      animation: 'shimmer 2s infinite',
                      position: 'absolute'
                    }} />
                  </div>
                  <span style={{ color: '#43e97b', fontSize: '14px', fontWeight: 'bold' }}>
                    Processing...
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                  Translation in progress
                </div>
              </>
            )}
          </div>
        ) : (
          // Confidence Score for Non-Translation Services
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.03)', 
            padding: '16px', 
            borderRadius: '8px',
            border: `1px solid ${statusColor}40`
          }}>
            <h4 style={{ color: statusColor, margin: '0 0 8px 0', fontSize: '14px' }}>
              Confidence Score
            </h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.1)', 
                flex: 1, 
                height: '8px', 
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  background: statusColor, 
                  height: '100%', 
                  width: `${response.overall_confidence || 0}%`,
                  transition: 'width 0.3s ease'
                }} />
              </div>
              <span style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold' }}>
                {response.overall_confidence || 0}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Confidence Scores Breakdown - Only for Non-Translation Services */}
      {!isTranslationService && confidenceScores.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ color: '#0694fb', margin: '0 0 12px 0', fontSize: '14px' }}>
            Detailed Confidence Scores
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
            {confidenceScores.map((score, index) => (
              <div key={index} style={{ 
                background: 'rgba(255, 255, 255, 0.03)', 
                padding: '12px', 
                borderRadius: '6px',
                border: `1px solid ${score.value > 50 ? '#28a74540' : '#ffc10740'}`
              }}>
                <div style={{ color: '#ccc', fontSize: '12px', marginBottom: '4px' }}>
                  {score.key}
                </div>
                <div style={{ 
                  color: score.value > 50 ? '#28a745' : '#ffc107', 
                  fontSize: '14px', 
                  fontWeight: 'bold' 
                }}>
                  {score.value.toFixed(2)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Medical Notes */}
      {response.medical_note && (
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ color: '#0694fb', margin: '0 0 12px 0', fontSize: '14px' }}>
            Medical Analysis
          </h4>
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.03)', 
            padding: '16px', 
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <p style={{ 
              color: '#ccc', 
              fontSize: '14px', 
              lineHeight: '1.6', 
              margin: 0,
              fontStyle: 'italic'
            }}>
              {response.medical_note}
            </p>
          </div>
        </div>
      )}

      {/* Image Comparison for All Services */}
      {uploadedFile && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <h4 style={{ color: '#0694fb', margin: 0, fontSize: '14px' }}>
              {isTranslationService ? 'Image Comparison' : 'Uploaded Image'}
            </h4>
            {isTranslationService && processedImageData && (
              <Button
                variant="secondary"
                onClick={() => downloadProcessedImage(
                  processedImageData, 
                  `${endpointId}_result_${Date.now()}.jpg`
                )}
                style={{ padding: '6px 12px', fontSize: '12px' }}
              >
                <FaFileDownload />
                Download Result
              </Button>
            )}
          </div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isTranslationService && processedImageData ? '1fr 1fr' : '1fr', 
            gap: '16px',
            background: 'rgba(255, 255, 255, 0.03)',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            {/* Uploaded Image */}
            <div style={{ textAlign: 'center' }}>
              <h5 style={{ color: '#fff', margin: '0 0 8px 0', fontSize: '12px' }}>
                {isTranslationService 
                  ? (endpointId === 'mri_to_ct' ? 'Original MRI' : 'Original CT')
                  : 'Uploaded Image'
                }
              </h5>
              <div style={{ 
                width: '100%', 
                height: '150px', 
                background: 'rgba(0, 0, 0, 0.3)', 
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#666',
                fontSize: '12px',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <Image 
                  src={getUploadedImageUrl()!} 
                  alt="Uploaded Image"
                  fill
                  style={{ 
                    objectFit: 'cover',
                    borderRadius: '6px'
                  }}
                />
              </div>
            </div>

            {/* Processed Image for Translation Services */}
            {isTranslationService && processedImageData && (
              <div style={{ textAlign: 'center' }}>
                <h5 style={{ color: '#fff', margin: '0 0 8px 0', fontSize: '12px' }}>
                  {endpointId === 'mri_to_ct' ? 'Converted CT' : 'Converted MRI'}
                </h5>
                <div style={{ 
                  width: '100%', 
                  height: '150px', 
                  background: 'rgba(0, 0, 0, 0.3)', 
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#666',
                  fontSize: '12px',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  <Image 
                    src={`data:image/jpeg;base64,${processedImageData}`} 
                    alt="AI Processed Image"
                    fill
                    style={{ 
                      borderRadius: '6px'
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Additional Info */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        paddingTop: '12px',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        fontSize: '12px',
        color: '#888'
      }}>
        <span>Scan Type: {
          isTranslationService 
            ? (endpointId === 'mri_to_ct' ? 'MRI-CT Translation' : 'CT-MRI Translation')
            : (response.scan_type || 'Unknown')
        }</span>
        {response.combined_image && (
          <span>AI Processed Image Available</span>
        )}
      </div>
    </div>
  );
};

// Main Component
const ScansContent = () => {
  const { user } = useAuth();
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScans, setSelectedScans] = useState<number[]>([]);
  const [showAITesting, setShowAITesting] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File | null>>({});

  // AI Testing endpoints
  const endpoints = [
    {
      id: 'brain_tumor',
      name: 'Brain Tumor Analysis',
      description: 'Analyzes brain MRI/CT scans for tumor detection',
      icon: FaBrain,
      endpoint: '/predict2',
      status: 'working' as const
    },
    {
      id: 'breast_cancer',
      name: 'Breast Cancer Detection',
      description: 'Detects breast cancer in mammography images',
      icon: FaHeart,
      endpoint: '/breastancerdetect',
      status: 'server_error' as const
    },
    {
      id: 'lung_tumor',
      name: 'Lung Tumor Analysis',
      description: 'Analyzes chest X-ray/CT for lung tumors',
      icon: FaLungs,
      endpoint: '/lunganalysis',
      status: 'working' as const
    },
    {
      id: 'mri_to_ct',
      name: 'MRI to CT Translation',
      description: 'Converts MRI scans to CT-style images',
      icon: FaImage,
      endpoint: '/mritoct',
      status: 'working' as const
    },
    {
      id: 'ct_to_mri',
      name: 'CT to MRI Translation',
      description: 'Converts CT scans to MRI-style images',
      icon: FaImage,
      endpoint: '/mritoct',
      status: 'working' as const
    }
  ];

  useEffect(() => {
    loadScans();
  }, []);

  const loadScans = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/scans');
      const scansData = response.data?.data?.scans || [];
      const scansArray = Array.isArray(scansData) ? scansData : [];
      
      // Fetch image counts for each scan
      const scansWithImageCounts = await Promise.all(
        scansArray.map(async (scan) => {
          try {
            const imagesResponse = await api.get(`/api/scans/${scan.scanId}/images`);
            const imageCount = imagesResponse.data?.data?.images?.length || 0;
            return { ...scan, imageCount };
          } catch (error) {
            console.warn(`Could not fetch image count for scan ${scan.scanId}:`, error);
            return { ...scan, imageCount: 0 };
          }
        })
      );
      
      setScans(scansWithImageCounts);
    } catch (error) {
      console.error('Error loading scans:', error);
      setScans([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAnalyze = async () => {
    try {
      setLoading(true);
      const selectedScanObjects = scans.filter(scan => selectedScans.includes(scan.id));
      
      const analyzePromises = selectedScanObjects.map(async (scan) => {
        try {
          const response = await api.post(`/api/scans/${scan.scanId}/analyze`);
          return { success: true, scanId: scan.scanId };
        } catch (error: any) {
          console.error(`Error analyzing scan ${scan.scanId}:`, error);
          return { success: false, scanId: scan.scanId, error: error.message };
        }
      });
      
      const results = await Promise.all(analyzePromises);
      const successful = results.filter(r => r.success).length;
      
      if (successful > 0) {
        alert(`Analysis started for ${successful} scans`);
        setSelectedScans([]);
        loadScans();
      }
    } catch (error) {
      console.error('Error in bulk analyze:', error);
      alert('Failed to start bulk analysis');
    } finally {
      setLoading(false);
    }
  };

  const handleStartAnalysis = async (scanId: string) => {
    try {
      await api.post(`/api/scans/${scanId}/analyze`);
      alert('Analysis started successfully');
      loadScans();
    } catch (error) {
      console.error('Error starting analysis:', error);
      alert('Failed to start analysis');
    }
  };

  // AI Testing Functions
  const analyzeResponseStructure = (data: any): any => {
    const structure: any = {};
    
    if (typeof data === 'object' && data !== null) {
      for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          structure[key] = analyzeResponseStructure(value);
        } else if (Array.isArray(value)) {
          structure[key] = `Array[${value.length}]`;
          if (value.length > 0) {
            structure[`${key}_sample`] = analyzeResponseStructure(value[0]);
          }
        } else {
          structure[key] = typeof value;
        }
      }
    } else {
      structure.type = typeof data;
      structure.value = data;
    }
    
    return structure;
  };

  // Function to test individual endpoint
  const testAIEndpoint = async (endpointId: string) => {
    const selectedFile = selectedFiles[endpointId];
    
    if (!selectedFile) {
      alert('Please select an image file first');
      return;
    }

    // Validate file type and size
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/tiff'];
    if (!validImageTypes.includes(selectedFile.type)) {
      alert(`Invalid file type: ${selectedFile.type}. Please select a valid image file (JPEG, PNG, GIF, BMP, TIFF).`);
      return;
    }

    // Validate file size based on file type
    const isDicomFile = selectedFile.type === 'application/dicom' || 
                        selectedFile.name.toLowerCase().endsWith('.dcm') || 
                        selectedFile.name.toLowerCase().endsWith('.dicom');
    
    const maxSize = isDicomFile ? 100 * 1024 * 1024 : 10 * 1024 * 1024; // 100MB for DICOM, 10MB for images
    const maxSizeText = isDicomFile ? '100MB' : '10MB';
    
    if (selectedFile.size > maxSize) {
      alert(`File size too large. Please select a file smaller than ${maxSizeText}.`);
      return;
    }

    setTestResults(prev => ({
      ...prev,
      [endpointId]: { status: 'testing' }
    }));

    try {
      // Enhanced debugging
      console.log(`Testing ${endpointId} endpoint`);
      console.log('File details:', {
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type
      });

      // Use backend proxy to avoid CORS issues
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('endpoint', endpointId);

      console.log('Sending request to backend proxy...');

      const response = await fetch('/api/test-db', {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Backend proxy error:', errorData);
        throw new Error(`Backend proxy failed: ${errorData.message || 'Unknown error'}`);
      }

      const data = await response.json();
      console.log(`${endpointId} response:`, data);

      const responseStructure = analyzeResponseStructure(data.data?.response || data);

      setTestResults(prev => ({
        ...prev,
        [endpointId]: {
          status: 'success',
          response: data.data?.response || data,
          responseStructure
        }
      }));
    } catch (error: any) {
      console.error(`Error testing ${endpointId}:`, error);
      
      let errorMessage = error.message || 'Unknown error occurred';
      
      // Handle specific error types
      if (error.name === 'AbortError') {
        errorMessage = 'Request timed out after 60 seconds';
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Network error: Unable to reach the backend proxy.';
      } else if (error.message.includes('Load failed')) {
        errorMessage = 'Load failed: The backend proxy is not responding.';
      }
      
      setTestResults(prev => ({
        ...prev,
        [endpointId]: {
          status: 'error',
          error: errorMessage
        }
      }));
    }
  };

  const handleFileSelect = (endpointId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFiles(prev => ({
        ...prev,
        [endpointId]: file
      }));
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'testing': return <FaSpinner className="fa-spin" />;
      case 'success': return <FaCheck style={{ color: '#28a745' }} />;
      case 'error': return <FaTimes style={{ color: '#dc3545' }} />;
      default: return <FaFlask />;
    }
  };

  if (loading) {
    return (
      <ContentContainer>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <FaSpinner className="fa-spin" style={{ fontSize: '24px', color: '#0694FB' }} />
        </div>
      </ContentContainer>
    );
  }

  return (
    <ContentContainer>
      <Header>
        <PageTitle>
          <FaFileAlt />
          Scans Management
        </PageTitle>
        <HeaderActions>
          <Button onClick={() => setShowAITesting(!showAITesting)}>
            <FaRobot />
            {showAITesting ? 'Hide' : 'Show'} AI Testing
          </Button>
          {selectedScans.length > 0 && (
            <Button onClick={handleBulkAnalyze} variant="primary">
              <FaPlay />
              Analyze Selected ({selectedScans.length})
            </Button>
          )}
        </HeaderActions>
      </Header>

      {showAITesting && (
        <TestSection>
          <TestTitle>
            <FaRobot />
            AI API Testing & Response Analysis
          </TestTitle>
          
          {/* Connectivity Test */}
          <div style={{ marginBottom: '20px', padding: '16px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
            <h4 style={{ color: '#0694fb', margin: '0 0 12px 0' }}>Connectivity Test</h4>
            <Button 
              onClick={async () => {
                try {
                  const response = await fetch('/api/test-db');
                  const data = await response.json();
                  alert(`Backend proxy is working! Database has ${data.data.patients} patients, ${data.data.scans} scans, ${data.data.users} users.`);
                } catch (error: any) {
                  alert(`Backend proxy test failed: ${error.message}`);
                }
              }}
              style={{ marginRight: '12px' }}
            >
              <FaCheck />
              Test Backend Proxy
            </Button>
            <Button 
              onClick={async () => {
                try {
                  const response = await fetch('https://image-name-136538419615.us-central1.run.app/predict2', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ test: true })
                  });
                  alert(`AI API is accessible! Status: ${response.status}`);
                } catch (error: any) {
                  alert(`AI API test failed: ${error.message}`);
                }
              }}
              variant="secondary"
            >
              <FaFlask />
              Test AI API Direct
            </Button>
          </div>
          
          <TestGrid>
            {endpoints.map(endpoint => {
              const result = testResults[endpoint.id] || { status: 'idle' };
              const IconComponent = endpoint.icon;
              const selectedFile = selectedFiles[endpoint.id];

              return (
                <TestCard key={endpoint.id} status={result.status}>
                  <TestCardHeader>
                    <TestCardTitle>
                      <IconComponent />
                      {endpoint.name}
                    </TestCardTitle>
                    {getStatusIcon(result.status)}
                  </TestCardHeader>
                  
                  <p style={{ color: '#ccc', fontSize: '14px', margin: '0 0 12px 0' }}>
                    {endpoint.description}
                  </p>
                  
                  <FileUploadArea onClick={() => document.getElementById(`file-${endpoint.id}`)?.click()}>
                    <FaUpload style={{ fontSize: '24px', color: '#0694fb', marginBottom: '8px' }} />
                    <p style={{ margin: 0, color: '#0694fb' }}>
                      {selectedFile ? `Selected: ${selectedFile.name}` : 'Click to upload image'}
                    </p>
                  </FileUploadArea>
                  
                  <input
                    id={`file-${endpoint.id}`}
                    type="file"
                    accept="image/*,.dcm,.dicom"
                    onChange={(e) => handleFileSelect(endpoint.id, e)}
                    style={{ display: 'none' }}
                  />
                  
                  <Button 
                    onClick={() => testAIEndpoint(endpoint.id)}
                    disabled={result.status === 'testing' || !selectedFile}
                    style={{ width: '100%' }}
                  >
                    {result.status === 'testing' ? 'Testing...' : 'Test Endpoint'}
                  </Button>
                  
                  {result.status === 'success' && result.response && (
                    <AIAnalysisResults 
                      result={result} 
                      endpointName={endpoint.name} 
                      endpointId={endpoint.id}
                      uploadedFile={selectedFiles[endpoint.id] || undefined}
                    />
                  )}
                  
                  {result.status === 'error' && result.error && (
                    <ResponseContainer>
                      <h4 style={{ color: '#dc3545', margin: '0 0 8px 0', fontSize: '14px' }}>Error:</h4>
                      <ResponseText style={{ color: '#dc3545' }}>{result.error}</ResponseText>
                    </ResponseContainer>
                  )}
                </TestCard>
              );
            })}
          </TestGrid>
        </TestSection>
      )}

      {/* Scans List */}
      <div>
        <h3>Available Scans ({scans.length})</h3>
        {scans.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <FaFileAlt style={{ fontSize: '48px', marginBottom: '16px' }} />
            <p>No scans available</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {scans.map(scan => (
              <div key={scan.id} style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h4 style={{ margin: '0 0 8px 0' }}>{scan.scanId}</h4>
                  <p style={{ margin: '0 0 4px 0', color: '#ccc' }}>
                    Patient: {scan.patientFirstName} {scan.patientLastName}
                  </p>
                  <p style={{ margin: '0 0 4px 0', color: '#ccc' }}>
                    Type: {scan.scanType} | Body Part: {scan.bodyPart} | Status: {scan.status}
                  </p>
                  <p style={{ margin: '0', color: '#0694fb', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FaImage size={12} />
                    {scan.imageCount || 0} {scan.imageCount === 1 ? 'image' : 'images'}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={selectedScans.includes(scan.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedScans(prev => [...prev, scan.id]);
                      } else {
                        setSelectedScans(prev => prev.filter(id => id !== scan.id));
                      }
                    }}
                  />
                  <Button 
                    onClick={() => handleStartAnalysis(scan.scanId)}
                    disabled={scan.status === 'analyzing'}
                  >
                    <FaPlay />
                    {scan.status === 'analyzing' ? 'Analyzing...' : 'Analyze'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ContentContainer>
  );
};

export default ScansContent;
