'use client'

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ImageViewer from '@/components/ImageViewer';
import AIAnalysisView from '@/components/AIAnalysisView';
import { 
  FaSearch, FaFilter, FaDownload, FaShare, FaPrint, FaHistory,
  FaBrain, FaLungs, FaHeart, FaImage, FaFileAlt, FaSpinner,
  FaArrowLeft, FaArrowRight, FaCalendar, FaUser, FaTag
} from 'react-icons/fa';
import styled from 'styled-components';
import api from '@/services/api';

// Interfaces
interface Analysis {
  id: number;
  scanId: string;
  analysisType: 'brain_tumor' | 'breast_cancer' | 'lung_tumor' | 'mri_to_ct' | 'ct_to_mri';
  patientName: string;
  patientId: string;
  scanDate: string;
  analysisDate: string;
  status: 'completed' | 'pending' | 'failed';
  result: {
    detected_case?: string;
    overall_confidence?: number;
    confidence_scores?: Array<{ [key: string]: string | number }>;
    medical_note?: string;
    scan_type?: string;
    combined_image?: string;
    ssim_score?: number;
    processing_time?: number;
  };
  originalImage: string;
  processedImage?: string;
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

const AnalysisLayout = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 24px;
  height: calc(100vh - 120px);
`;

const Sidebar = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const SidebarHeader = styled.div`
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const SidebarTitle = styled.h3`
  color: #0694fb;
  margin: 0 0 12px 0;
  font-size: 18px;
`;

const SearchInput = styled.input`
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  padding: 10px 12px;
  color: white;
  font-size: 14px;
  
  &::placeholder {
    color: #888;
  }
  
  &:focus {
    outline: none;
    border-color: #0694fb;
  }
`;

const FilterSection = styled.div`
  margin-bottom: 20px;
`;

const FilterTitle = styled.h4`
  color: #fff;
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 500;
`;

const FilterOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FilterOption = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #ccc;
  font-size: 13px;
  cursor: pointer;
  
  input[type="checkbox"] {
    accent-color: #0694fb;
  }
`;

const AnalysisList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const AnalysisItem = styled.div<{ isActive: boolean }>`
  background: ${props => props.isActive ? 'rgba(6, 148, 251, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
  border: 1px solid ${props => props.isActive ? '#0694fb' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(6, 148, 251, 0.1);
    border-color: #0694fb;
  }
`;

const AnalysisItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
`;

const AnalysisId = styled.div`
  color: #0694fb;
  font-size: 12px;
  font-weight: 600;
`;

const AnalysisType = styled.div`
  color: #fff;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const AnalysisPatient = styled.div`
  color: #ccc;
  font-size: 12px;
  margin-bottom: 4px;
`;

const AnalysisDate = styled.div`
  color: #888;
  font-size: 11px;
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const ContentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const ContentTitle = styled.h2`
  color: #0694fb;
  margin: 0;
  font-size: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ContentActions = styled.div`
  display: flex;
  gap: 12px;
`;

const ImageSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
`;

const ImageContainer = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const ImageTitle = styled.h3`
  color: #fff;
  margin: 0 0 16px 0;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ImageViewerContainer = styled.div`
  height: 400px;
  border-radius: 8px;
  overflow: hidden;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #0694fb;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #666;
`;

// Mock data for demonstration
const MOCK_ANALYSES: Analysis[] = [
  {
    id: 1,
    scanId: 'SCAN-001',
    analysisType: 'brain_tumor',
    patientName: 'John Doe',
    patientId: 'P001',
    scanDate: '2024-01-15',
    analysisDate: '2024-01-15T10:30:00Z',
    status: 'completed',
    result: {
      detected_case: 'No tumor detected',
      overall_confidence: 92.5,
      confidence_scores: [
        { 'Normal': '92.5' },
        { 'Abnormal': '7.5' }
      ],
      medical_note: 'The brain MRI shows normal brain tissue with no evidence of tumors or abnormalities. All structures appear within normal limits.',
      scan_type: 'MRI Brain',
      processing_time: 2.3
    },
    originalImage: '/api/placeholder/400/400',
    processedImage: '/api/placeholder/400/400'
  },
  {
    id: 2,
    scanId: 'SCAN-002',
    analysisType: 'lung_tumor',
    patientName: 'Jane Smith',
    patientId: 'P002',
    scanDate: '2024-01-14',
    analysisDate: '2024-01-14T14:20:00Z',
    status: 'completed',
    result: {
      detected_case: 'Normal lung tissue',
      overall_confidence: 88.2,
      confidence_scores: [
        { 'Normal': '88.2' },
        { 'Abnormal': '11.8' }
      ],
      medical_note: 'Chest X-ray analysis shows clear lung fields with no evidence of masses, nodules, or other abnormalities.',
      scan_type: 'Chest X-ray',
      processing_time: 1.8
    },
    originalImage: '/api/placeholder/400/400'
  },
  {
    id: 3,
    scanId: 'SCAN-003',
    analysisType: 'mri_to_ct',
    patientName: 'Bob Johnson',
    patientId: 'P003',
    scanDate: '2024-01-13',
    analysisDate: '2024-01-13T09:15:00Z',
    status: 'completed',
    result: {
      detected_case: 'Conversion completed',
      overall_confidence: 95.1,
      ssim_score: 0.89,
      medical_note: 'MRI to CT conversion completed successfully with high image quality preservation.',
      scan_type: 'MRI to CT',
      processing_time: 3.2
    },
    originalImage: '/api/placeholder/400/400',
    processedImage: '/api/placeholder/400/400'
  },
  {
    id: 4,
    scanId: 'SCAN-004',
    analysisType: 'ct_to_mri',
    patientName: 'Alice Brown',
    patientId: 'P004',
    scanDate: '2024-01-12',
    analysisDate: '2024-01-12T16:45:00Z',
    status: 'completed',
    result: {
      detected_case: 'Conversion completed',
      overall_confidence: 93.7,
      ssim_score: 0.91,
      medical_note: 'CT to MRI conversion completed successfully with excellent image quality preservation.',
      scan_type: 'CT to MRI',
      processing_time: 2.8
    },
    originalImage: '/api/placeholder/400/400',
    processedImage: '/api/placeholder/400/400'
  }
];

export default function AnalysisPage() {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<Analysis[]>(MOCK_ANALYSES);
  const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(MOCK_ANALYSES[0]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    brain_tumor: true,
    breast_cancer: true,
    lung_tumor: true,
    mri_to_ct: true,
    ct_to_mri: true,
    completed: true,
    pending: true,
    failed: true
  });

  const filteredAnalyses = analyses.filter(analysis => {
    const matchesSearch = analysis.scanId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         analysis.patientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filters[analysis.analysisType];
    const matchesStatus = filters[analysis.status];
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getAnalysisIcon = (type: string) => {
    switch (type) {
      case 'brain_tumor': return <FaBrain />;
      case 'breast_cancer': return <FaHeart />;
      case 'lung_tumor': return <FaLungs />;
      case 'mri_to_ct': return <FaImage />;
      case 'ct_to_mri': return <FaImage />;
      default: return <FaFileAlt />;
    }
  };

  const getAnalysisTypeName = (type: string) => {
    switch (type) {
      case 'brain_tumor': return 'Brain Tumor';
      case 'breast_cancer': return 'Breast Cancer';
      case 'lung_tumor': return 'Lung Tumor';
      case 'mri_to_ct': return 'MRI to CT';
      case 'ct_to_mri': return 'CT to MRI';
      default: return 'Unknown';
    }
  };

  const handleFilterChange = (filterType: string, value: boolean) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
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
            <FaBrain />
            AI Analysis Results
          </PageTitle>
          <HeaderActions>
            <Button variant="secondary">
              <FaHistory />
              History
            </Button>
            <Button>
              <FaDownload />
              Export Report
            </Button>
          </HeaderActions>
        </Header>

        <AnalysisLayout>
          {/* Sidebar */}
          <Sidebar>
            <SidebarHeader>
              <SidebarTitle>Analysis List</SidebarTitle>
              <SearchInput
                type="text"
                placeholder="Search analyses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </SidebarHeader>

            <FilterSection>
              <FilterTitle>Analysis Types</FilterTitle>
              <FilterOptions>
                <FilterOption>
                  <input
                    type="checkbox"
                    checked={filters.brain_tumor}
                    onChange={(e) => handleFilterChange('brain_tumor', e.target.checked)}
                  />
                  Brain Tumor
                </FilterOption>
                <FilterOption>
                  <input
                    type="checkbox"
                    checked={filters.breast_cancer}
                    onChange={(e) => handleFilterChange('breast_cancer', e.target.checked)}
                  />
                  Breast Cancer
                </FilterOption>
                <FilterOption>
                  <input
                    type="checkbox"
                    checked={filters.lung_tumor}
                    onChange={(e) => handleFilterChange('lung_tumor', e.target.checked)}
                  />
                  Lung Tumor
                </FilterOption>
                <FilterOption>
                  <input
                    type="checkbox"
                    checked={filters.mri_to_ct}
                    onChange={(e) => handleFilterChange('mri_to_ct', e.target.checked)}
                  />
                  MRI to CT
                </FilterOption>
                <FilterOption>
                  <input
                    type="checkbox"
                    checked={filters.ct_to_mri}
                    onChange={(e) => handleFilterChange('ct_to_mri', e.target.checked)}
                  />
                  CT to MRI
                </FilterOption>
              </FilterOptions>
            </FilterSection>

            <FilterSection>
              <FilterTitle>Status</FilterTitle>
              <FilterOptions>
                <FilterOption>
                  <input
                    type="checkbox"
                    checked={filters.completed}
                    onChange={(e) => handleFilterChange('completed', e.target.checked)}
                  />
                  Completed
                </FilterOption>
                <FilterOption>
                  <input
                    type="checkbox"
                    checked={filters.pending}
                    onChange={(e) => handleFilterChange('pending', e.target.checked)}
                  />
                  Pending
                </FilterOption>
                <FilterOption>
                  <input
                    type="checkbox"
                    checked={filters.failed}
                    onChange={(e) => handleFilterChange('failed', e.target.checked)}
                  />
                  Failed
                </FilterOption>
              </FilterOptions>
            </FilterSection>

            <AnalysisList>
              {filteredAnalyses.map(analysis => (
                <AnalysisItem
                  key={analysis.id}
                  isActive={selectedAnalysis?.id === analysis.id}
                  onClick={() => setSelectedAnalysis(analysis)}
                >
                  <AnalysisItemHeader>
                    <AnalysisId>{analysis.scanId}</AnalysisId>
                    <AnalysisType>{getAnalysisTypeName(analysis.analysisType)}</AnalysisType>
                  </AnalysisItemHeader>
                  <AnalysisPatient>{analysis.patientName}</AnalysisPatient>
                  <AnalysisDate>
                    {new Date(analysis.analysisDate).toLocaleDateString()}
                  </AnalysisDate>
                </AnalysisItem>
              ))}
            </AnalysisList>
          </Sidebar>

          {/* Main Content */}
          <MainContent>
            {selectedAnalysis ? (
              <>
                <ContentHeader>
                  <ContentTitle>
                    {getAnalysisIcon(selectedAnalysis.analysisType)}
                    {selectedAnalysis.scanId} - {getAnalysisTypeName(selectedAnalysis.analysisType)}
                  </ContentTitle>
                  <ContentActions>
                    <Button variant="secondary">
                      <FaShare />
                      Share
                    </Button>
                    <Button variant="secondary">
                      <FaPrint />
                      Print
                    </Button>
                    <Button>
                      <FaDownload />
                      Download Report
                    </Button>
                  </ContentActions>
                </ContentHeader>

                <ImageSection>
                  <ImageContainer>
                    <ImageTitle>
                      <FaImage />
                      Original Scan
                    </ImageTitle>
                    <ImageViewerContainer>
                      <ImageViewer
                        imageUrl={selectedAnalysis.originalImage}
                        alt={`Original scan ${selectedAnalysis.scanId}`}
                        showControls={true}
                      />
                    </ImageViewerContainer>
                  </ImageContainer>

                  {selectedAnalysis.processedImage && (
                    <ImageContainer>
                      <ImageTitle>
                        <FaImage />
                        Processed Image
                      </ImageTitle>
                      <ImageViewerContainer>
                        <ImageViewer
                          imageUrl={selectedAnalysis.processedImage}
                          alt={`Processed scan ${selectedAnalysis.scanId}`}
                          showControls={true}
                        />
                      </ImageViewerContainer>
                    </ImageContainer>
                  )}
                </ImageSection>

                <AIAnalysisView
                  analysisType={selectedAnalysis.analysisType}
                  result={selectedAnalysis.result}
                  originalImage={selectedAnalysis.originalImage}
                  processedImage={selectedAnalysis.processedImage}
                />
              </>
            ) : (
              <EmptyState>
                <FaFileAlt style={{ fontSize: '64px', marginBottom: '16px' }} />
                <h3>No analysis selected</h3>
                <p>Select an analysis from the sidebar to view detailed results</p>
              </EmptyState>
            )}
          </MainContent>
        </AnalysisLayout>
      </PageContainer>
    </ProtectedRoute>
  );
}
