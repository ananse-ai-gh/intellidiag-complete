'use client'

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ImageViewer from '@/components/ImageViewer';
import ScanCreationModal from '@/components/ScanCreationModal';
import { 
  FaPlus, FaSearch, FaFilter, FaEye, FaEdit, FaTrash, FaDownload, 
  FaPlay, FaClock, FaCheck, FaTimes, FaSpinner, FaBrain, FaLungs, 
  FaHeart, FaImage, FaFileAlt, FaUpload, FaRobot, FaChartLine
} from 'react-icons/fa';
import styled from 'styled-components';
import api from '@/services/api';

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
}

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

// Styled Components
const PageContainer = styled.div`
  padding: 24px;
  background-color: transparent;
  color: #FFFFFF;
  width: 100%;
  height: 100vh;
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

const ScansGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
`;

const ScanCard = styled.div<{ status: string }>`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid ${props => {
    switch (props.status) {
      case 'completed': return 'rgba(40, 167, 69, 0.3)';
      case 'analyzing': return 'rgba(255, 193, 7, 0.3)';
      case 'failed': return 'rgba(220, 53, 69, 0.3)';
      default: return 'rgba(255, 255, 255, 0.1)';
    }
  }};
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
    border-color: #0694fb;
  }
`;

const ScanHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const ScanInfo = styled.div`
  flex: 1;
`;

const ScanId = styled.h3`
  color: #0694fb;
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
`;

const PatientInfo = styled.p`
  color: #ccc;
  margin: 0 0 4px 0;
  font-size: 14px;
`;

const ScanDetails = styled.p`
  color: #888;
  margin: 0;
  font-size: 12px;
`;

const StatusBadge = styled.div<{ status: string }>`
  background: ${props => {
    switch (props.status) {
      case 'completed': return 'rgba(40, 167, 69, 0.2)';
      case 'analyzing': return 'rgba(255, 193, 7, 0.2)';
      case 'failed': return 'rgba(220, 53, 69, 0.2)';
      default: return 'rgba(255, 255, 255, 0.1)';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'completed': return '#28a745';
      case 'analyzing': return '#ffc107';
      case 'failed': return '#dc3545';
      default: return '#fff';
    }
  }};
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize;
`;

const ImagePreview = styled.div`
  width: 100%;
  height: 200px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
`;

const ImagePlaceholder = styled.div`
  color: #666;
  font-size: 14px;
  text-align: center;
`;

const ScanActions = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
`;

const Modal = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: ${props => props.isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: #1a1a1a;
  border-radius: 12px;
  padding: 24px;
  max-width: 90vw;
  max-height: 90vh;
  overflow: auto;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  padding: 8px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #0694fb;
`;

// AI Service Types
const AI_SERVICES = [
  { id: 'brain_tumor', name: 'Brain Tumor Analysis', icon: FaBrain, color: '#ff6b6b' },
  { id: 'breast_cancer', name: 'Breast Cancer Detection', icon: FaHeart, color: '#4facfe' },
  { id: 'lung_tumor', name: 'Lung Tumor Analysis', icon: FaLungs, color: '#00c6ff' },
  { id: 'mri_to_ct', name: 'MRI to CT Translation', icon: FaImage, color: '#43e97b' },
  { id: 'ct_to_mri', name: 'CT to MRI Translation', icon: FaImage, color: '#43e97b' }
];

export default function ScansPage() {
  const { user } = useAuth();
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScan, setSelectedScan] = useState<Scan | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    loadScans();
  }, []);

  const loadScans = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/scans');
      const scansData = response.data?.data?.scans || [];
      setScans(Array.isArray(scansData) ? scansData : []);
    } catch (error) {
      console.error('Error loading scans:', error);
      setScans([]);
    } finally {
      setLoading(false);
    }
  };

  const handleScanClick = (scan: Scan) => {
    setSelectedScan(scan);
    setShowModal(true);
    setAnalysisResult(null);
  };

  const handleAnalyze = async (scan: Scan, analysisType: string) => {
    try {
      setAnalyzing(true);
      
      // Simulate AI analysis - in real implementation, this would call the AI API
      const mockResult: AIAnalysisResult = {
        detected_case: analysisType === 'brain_tumor' ? 'No tumor detected' : 
                      analysisType === 'lung_tumor' ? 'Normal lung tissue' :
                      analysisType === 'breast_cancer' ? 'No abnormalities found' :
                      'Conversion completed',
        overall_confidence: Math.floor(Math.random() * 30) + 70,
        confidence_scores: [
          { 'Normal': '85.2' },
          { 'Abnormal': '14.8' }
        ],
        medical_note: `AI analysis completed for ${analysisType.replace('_', ' ')}. The scan shows normal findings with high confidence.`,
        scan_type: scan.scanType,
        processing_time: Math.random() * 2 + 1
      };

      // Add SSIM score for MRI to CT conversion
      if (analysisType === 'mri_to_ct') {
        mockResult.ssim_score = Math.random() * 0.3 + 0.7;
      }

      setAnalysisResult(mockResult);
    } catch (error) {
      console.error('Error analyzing scan:', error);
      alert('Failed to analyze scan');
    } finally {
      setAnalyzing(false);
    }
  };

  const getImageUrl = (scan: Scan) => {
    // In real implementation, this would return the actual image URL
    return scan.imagePath || '/api/placeholder/300/200';
  };

  const handleScanCreated = (newScan: Scan) => {
    setScans(prev => [newScan, ...prev]);
    setShowCreateModal(false);
  };

  if (loading) {
    return (
      <PageContainer>
        <LoadingSpinner>
          <FaSpinner className="fa-spin" style={{ fontSize: '24px' }} />
        </LoadingSpinner>
      </PageContainer>
    );
  }

  return (
    <ProtectedRoute>
      <PageContainer>
        <Header>
          <PageTitle>
            <FaFileAlt />
            Medical Scans
          </PageTitle>
          <HeaderActions>
            <Button onClick={() => setShowCreateModal(true)}>
              <FaPlus />
              New Scan
            </Button>
            <Button variant="secondary">
              <FaSearch />
              Search
            </Button>
            <Button variant="secondary">
              <FaFilter />
              Filter
            </Button>
          </HeaderActions>
        </Header>

        {scans.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>
            <FaFileAlt style={{ fontSize: '64px', marginBottom: '16px' }} />
            <h3>No scans available</h3>
            <p>Upload your first medical scan to get started with AI analysis</p>
            <Button style={{ marginTop: '16px' }} onClick={() => setShowCreateModal(true)}>
              <FaUpload />
              Upload Scan
            </Button>
          </div>
        ) : (
          <ScansGrid>
            {scans.map(scan => (
              <ScanCard key={scan.id} status={scan.status} onClick={() => handleScanClick(scan)}>
                <ScanHeader>
                  <ScanInfo>
                    <ScanId>{scan.scanId}</ScanId>
                    <PatientInfo>
                      {scan.patientFirstName} {scan.patientLastName}
                    </PatientInfo>
                    <ScanDetails>
                      {scan.scanType} • {scan.bodyPart} • {scan.scanDate}
                    </ScanDetails>
                  </ScanInfo>
                  <StatusBadge status={scan.status}>
                    {scan.status === 'analyzing' && <FaSpinner className="fa-spin" style={{ marginRight: '4px' }} />}
                    {scan.status}
                  </StatusBadge>
                </ScanHeader>

                <ImagePreview>
                  {scan.imagePath ? (
                    <Image 
                      src={getImageUrl(scan)} 
                      alt={`Scan ${scan.scanId}`}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <ImagePlaceholder>
                      <FaImage style={{ fontSize: '32px', marginBottom: '8px' }} />
                      <div>No preview available</div>
                    </ImagePlaceholder>
                  )}
                </ImagePreview>

                <ScanActions>
                  <Button variant="secondary">
                    <FaEye />
                    View
                  </Button>
                  <Button variant="secondary">
                    <FaDownload />
                    Download
                  </Button>
                </ScanActions>
              </ScanCard>
            ))}
          </ScansGrid>
        )}

        {/* Scan Detail Modal */}
        <Modal isOpen={showModal}>
          <ModalContent>
            <CloseButton onClick={() => setShowModal(false)}>
              <FaTimes />
            </CloseButton>
            
            {selectedScan && (
              <div>
                <h2 style={{ color: '#0694fb', marginBottom: '24px' }}>
                  {selectedScan.scanId} - {selectedScan.scanType}
                </h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                  {/* Image Viewer */}
                  <div>
                    <h3 style={{ color: '#fff', marginBottom: '16px' }}>Scan Image</h3>
                    <div style={{ height: '400px', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px' }}>
                      <ImageViewer 
                        imageUrl={getImageUrl(selectedScan)}
                        alt={`Scan ${selectedScan.scanId}`}
                        showControls={true}
                      />
                    </div>
                  </div>

                  {/* AI Analysis Options */}
                  <div>
                    <h3 style={{ color: '#fff', marginBottom: '16px' }}>AI Analysis</h3>
                    <div style={{ display: 'grid', gap: '12px' }}>
                      {AI_SERVICES.map(service => {
                        const IconComponent = service.icon;
                        return (
                          <Button
                            key={service.id}
                            onClick={() => handleAnalyze(selectedScan, service.id)}
                            disabled={analyzing}
                            style={{ 
                              justifyContent: 'flex-start',
                              background: `linear-gradient(135deg, ${service.color}20, ${service.color}10)`,
                              borderColor: service.color
                            }}
                          >
                            <IconComponent style={{ color: service.color }} />
                            {service.name}
                            {analyzing && <FaSpinner className="fa-spin" />}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Analysis Results */}
                {analysisResult && (
                  <div>
                    <h3 style={{ color: '#0694fb', marginBottom: '16px' }}>Analysis Results</h3>
                    <div style={{ 
                      background: 'rgba(255, 255, 255, 0.05)', 
                      borderRadius: '12px', 
                      padding: '20px',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                        <div>
                          <h4 style={{ color: '#0694fb', margin: '0 0 8px 0' }}>Detection Result</h4>
                          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff' }}>
                            {analysisResult.detected_case}
                          </div>
                        </div>
                        <div>
                          <h4 style={{ color: '#0694fb', margin: '0 0 8px 0' }}>Confidence</h4>
                          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff' }}>
                            {analysisResult.overall_confidence}%
                          </div>
                        </div>
                      </div>
                      
                      {analysisResult.medical_note && (
                        <div>
                          <h4 style={{ color: '#0694fb', margin: '0 0 8px 0' }}>Medical Notes</h4>
                          <p style={{ color: '#ccc', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
                            {analysisResult.medical_note}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </ModalContent>
        </Modal>

        {/* Scan Creation Modal */}
        <ScanCreationModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onScanCreated={handleScanCreated}
        />
      </PageContainer>
    </ProtectedRoute>
  );
}
