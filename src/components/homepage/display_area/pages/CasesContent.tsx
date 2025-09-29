'use client'

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { FaPlus, FaSearch, FaFilter, FaFileAlt, FaUser, FaCalendar, FaMicroscope, FaEdit, FaTrash, FaDownload, FaShare, FaPlay, FaSpinner, FaEye, FaTimes, FaCheckCircle, FaExclamationCircle, FaClock } from 'react-icons/fa';
import api from '@/services/api';
import ScanCreationModal from '@/components/ScanCreationModal';
import EditScanModal from './EditScanModal';
import ShareModal from '@/components/ShareModal';
import { SmartThumbnail, extractFileInfo } from '@/utils/fileUtils';

interface StatusBadgeProps {
  status: string;
}

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
`;

const PageTitle = styled.h1`
  font-size: 28px;
  font-weight: 600;
  margin: 0;
  color: #FFFFFF;
`;

const AddButton = styled.button`
  background-color: #0694FB;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #0578d1;
  }
`;

const SearchBar = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  align-items: center;
`;

const SearchInput = styled.div`
  position: relative;
  flex: 1;
  max-width: 400px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px 12px 44px;
  background-color: #1A1A1A;
  border: 1px solid #333;
  border-radius: 8px;
  color: #FFFFFF;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #0694FB;
  }

  &::placeholder {
    color: #A0A0A0;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #A0A0A0;
`;

const FilterButton = styled.button`
  background-color: #1A1A1A;
  border: 1px solid #333;
  color: #FFFFFF;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;

  &:hover {
    border-color: #0694FB;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
`;

const StatCard = styled.div`
  background-color: #1A1A1A;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  background-color: ${props => props.color || '#0694FB'};
  color: white;
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 600;
  color: #FFFFFF;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #A0A0A0;
`;

const CasesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
`;

const CaseCard = styled.div`
  background-color: #1A1A1A;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s ease;

  &:hover {
    border-color: #0694FB;
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  }
`;

const CaseHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const CaseInfo = styled.div`
  flex: 1;
`;

const CaseId = styled.div`
  font-size: 14px;
  color: #0694FB;
  font-weight: 600;
  margin-bottom: 4px;
`;

const CaseTitle = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #FFFFFF;
  margin-bottom: 8px;
`;

const PatientName = styled.div`
  font-size: 14px;
  color: #A0A0A0;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const CaseDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 20px;
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const DetailLabel = styled.div`
  font-size: 12px;
  color: #A0A0A0;
`;

const DetailValue = styled.div`
  font-size: 14px;
  color: #FFFFFF;
  font-weight: 500;
`;

const StatusBadge = styled.span<StatusBadgeProps>`
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  background-color: ${props => {
    switch (props.status) {
      case 'completed': return 'rgba(40, 167, 69, 0.2)';
      case 'pending': return 'rgba(255, 193, 7, 0.2)';
      case 'processing': return 'rgba(6, 148, 251, 0.2)';
      case 'cancelled': return 'rgba(220, 53, 69, 0.2)';
      default: return 'rgba(108, 117, 125, 0.2)';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'completed': return '#28A745';
      case 'pending': return '#FFC107';
      case 'processing': return '#0694FB';
      case 'cancelled': return '#DC3545';
      default: return '#6C757D';
    }
  }};
`;

const CaseActions = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: #A0A0A0;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #FFFFFF;
    background-color: rgba(255, 255, 255, 0.1);
  }

  &.danger:hover {
    color: #FF6B6B;
    background-color: rgba(255, 107, 107, 0.1);
  }

  &.analyze:hover {
    color: #0694FB;
    background-color: rgba(6, 148, 251, 0.1);
  }
`;

// Analysis Modal Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const AnalysisModal = styled.div`
  background: #1A1A1A;
  border: 1px solid #333;
  border-radius: 12px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h3`
  color: #FFFFFF;
  margin: 0;
  font-size: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #A0A0A0;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s ease;

  &:hover {
    color: #FFFFFF;
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const ModalContent = styled.div`
  padding: 20px;
  flex: 1;
  overflow-y: auto;
`;

const AnalysisStatus = styled.div<{ status: string }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  background: ${props => {
    switch (props.status) {
      case 'completed': return 'rgba(40, 167, 69, 0.1)';
      case 'processing': return 'rgba(23, 162, 184, 0.1)';
      case 'failed': return 'rgba(220, 53, 69, 0.1)';
      default: return 'rgba(108, 117, 125, 0.1)';
    }
  }};
  border: 1px solid ${props => {
    switch (props.status) {
      case 'completed': return 'rgba(40, 167, 69, 0.3)';
      case 'processing': return 'rgba(23, 162, 184, 0.3)';
      case 'failed': return 'rgba(220, 53, 69, 0.3)';
      default: return 'rgba(108, 117, 125, 0.3)';
    }
  }};
`;

const StatusText = styled.span<{ status: string }>`
  color: ${props => {
    switch (props.status) {
      case 'completed': return '#28A745';
      case 'processing': return '#17A2B8';
      case 'failed': return '#DC3545';
      default: return '#6C757D';
    }
  }};
  font-weight: 500;
`;

const AnalysisResults = styled.div`
  background: #0C0C0C;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
`;

const ResultsTitle = styled.h4`
  color: #FFFFFF;
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
`;

const ConfidenceScore = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
`;

const ConfidenceValue = styled.span<{ confidence: number }>`
  color: ${props => {
    if (props.confidence >= 80) return '#28A745';
    if (props.confidence >= 60) return '#FFC107';
    return '#DC3545';
  }};
  font-weight: 600;
  font-size: 16px;
`;

const FindingsText = styled.p`
  color: #CCCCCC;
  margin: 0;
  line-height: 1.5;
  font-size: 14px;
`;

const ModalActions = styled.div`
  padding: 20px;
  border-top: 1px solid #333;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const ActionButtonModal = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 10px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  ${props => props.variant === 'primary' ? `
    background: #0694FB;
    color: #FFFFFF;
    &:hover {
      background: #0582D9;
    }
  ` : `
    background: rgba(255, 255, 255, 0.1);
    color: #FFFFFF;
    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CasesContent = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedScan, setSelectedScan] = useState<any>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [shareData, setShareData] = useState<any>(null);
  
  // Analysis modal state
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [selectedScanForAnalysis, setSelectedScanForAnalysis] = useState<any>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  // Load scans from API
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

  useEffect(() => {
    loadScans();
  }, []);

  // Calculate stats from real data
  const stats = [
    { 
      label: 'Total Scans', 
      value: String(scans.length), 
      icon: <FaFileAlt />, 
      color: '#0694FB' 
    },
    { 
      label: 'Completed', 
      value: String(scans.filter(s => s.status === 'completed').length), 
      icon: <FaFileAlt />, 
      color: '#28A745' 
    },
    { 
      label: 'In Progress', 
      value: String(scans.filter(s => s.status === 'processing').length), 
      icon: <FaFileAlt />, 
      color: '#FFC107' 
    },
    { 
      label: 'Pending Review', 
      value: String(scans.filter(s => s.status === 'pending').length), 
      icon: <FaFileAlt />, 
      color: '#DC3545' 
    }
  ];

  const handleAddScan = () => {
    setShowCreateModal(true);
  };

  const handleScanCreated = (newScan: any) => {
    setScans(prev => [newScan, ...prev]);
    setShowCreateModal(false);
  };

  const handleViewScan = (scanId: string) => {
    // Navigate to the analysis detail page using Next.js router
    const currentPath = window.location.pathname;
    console.log('🔍 Current path:', currentPath);
    
    // Extract the role from the current path (e.g., /dashboard/doctor/scans -> doctor)
    const pathParts = currentPath.split('/');
    const roleIndex = pathParts.findIndex(part => part === 'dashboard') + 1;
    const role = pathParts[roleIndex];
    
    console.log('🔍 Detected role:', role);
    console.log('🔍 Scan ID:', scanId);
    
    // Construct the analysis detail path
    const analysisPath = `/dashboard/${role}/analysis/${scanId}`;
    console.log('🔍 Navigating to analysis detail:', analysisPath);
    
    // Use Next.js router for navigation
    router.push(analysisPath);
  };

  // Analysis modal functions
  const handleMicroscopeClick = (scan: any) => {
    setSelectedScanForAnalysis(scan);
    setShowAnalysisModal(true);
  };

  const handleStartAnalysis = async () => {
    if (!selectedScanForAnalysis) return;
    
    try {
      setAnalysisLoading(true);
      console.log('🚀 Starting analysis for scan:', selectedScanForAnalysis.id);
      
      const response = await api.post(`/api/scans/${selectedScanForAnalysis.id}/analyze`);
      console.log('✅ Analysis started successfully:', response.data);
      
      // Update the scan in the list
      setScans(prev => prev.map(scan => 
        scan.id === selectedScanForAnalysis.id 
          ? { ...scan, aiStatus: 'processing', status: 'processing' }
          : scan
      ));
      
      // Update the selected scan
      setSelectedScanForAnalysis((prev: any) => ({
        ...prev,
        aiStatus: 'processing',
        status: 'processing'
      }));
      
    } catch (error: any) {
      console.error('❌ Failed to start analysis:', error);
      alert(`Analysis failed: ${error.response?.data?.message || error.message || 'Unknown error'}`);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleCloseAnalysisModal = () => {
    setShowAnalysisModal(false);
    setSelectedScanForAnalysis(null);
    setAnalysisLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <FaCheckCircle color="#28A745" />;
      case 'processing':
        return <FaSpinner className="fa-spin" color="#17A2B8" />;
      case 'failed':
        return <FaExclamationCircle color="#DC3545" />;
      default:
        return <FaClock color="#6C757D" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Analysis Completed';
      case 'processing':
        return 'Analysis in Progress';
      case 'failed':
        return 'Analysis Failed';
      default:
        return 'Analysis Pending';
    }
  };

  const handleEditScan = async (scanId: string) => {
    try {
      // Fetch scan details
      const response = await api.get(`/api/scans/${scanId}`);
      if (response.data.status === 'success') {
        setSelectedScan(response.data.data.scan);
        setShowEditModal(true);
      } else {
        alert('Failed to load scan details');
      }
    } catch (error) {
      console.error('Error loading scan details:', error);
      alert('Failed to load scan details');
    }
  };

  const handleDeleteScan = async (scanId: string) => {
    if (!confirm('Are you sure you want to archive this scan? Archived scans will be hidden from the main view.')) return;
    
    try {
      await api.delete(`/api/scans/${scanId}`);
      setScans(prev => prev.filter(s => s.id !== scanId));
      alert('Scan archived successfully');
    } catch (error) {
      console.error('Error archiving scan:', error);
      alert('Failed to archive scan');
    }
  };

  const handleDownloadScan = async (scanId: string) => {
    try {
      // Fetch scan details to get file path
      const response = await api.get(`/api/scans/${scanId}`);
      if (response.data.status === 'success') {
        const scan = response.data.data.scan;
        
        console.log('Download scan data:', scan); // Debug log
        
        // Download the image file - check multiple possible field names
        const filePath = scan.filePath || scan.file_path || scan.imagePath || scan.image_path;
        const fileName = scan.fileName || scan.file_name || scan.imageName || scan.image_name || `scan-${scanId}.jpg`;
        
        if (filePath) {
          console.log('Downloading file:', filePath, 'as:', fileName);
          
          // For Supabase Storage URLs, we need to handle them differently
          if (filePath.startsWith('http')) {
            // It's a Supabase Storage URL
            const link = document.createElement('a');
            link.href = filePath;
            link.download = fileName;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          } else {
            // It's a local file path (legacy)
            console.warn('Local file path detected, cannot download:', filePath);
            alert('This scan uses legacy file storage and cannot be downloaded directly.');
          }
        } else {
          console.warn('No file path found for scan:', scanId);
          alert('No file found for this scan.');
        }
        
        // Also download analysis report if available
        if (scan.findings || scan.recommendations) {
          const reportContent = `
SCAN ANALYSIS REPORT
====================

Scan ID: ${scan.scanId || scan.id}
Patient: ${scan.patientFirstName} ${scan.patientLastName}
Scan Type: ${scan.scanType}
Body Part: ${scan.bodyPart}
Priority: ${scan.priority}
Status: ${scan.status}
Date: ${new Date(scan.createdAt).toLocaleDateString()}

FINDINGS:
${scan.findings || 'No findings available'}

RECOMMENDATIONS:
${scan.recommendations || 'No recommendations available'}

AI Confidence: ${scan.confidence || 'N/A'}%
          `.trim();
          
          const blob = new Blob([reportContent], { type: 'text/plain' });
          const reportLink = document.createElement('a');
          reportLink.href = URL.createObjectURL(blob);
          reportLink.download = `scan-report-${scanId}.txt`;
          document.body.appendChild(reportLink);
          reportLink.click();
          document.body.removeChild(reportLink);
          URL.revokeObjectURL(reportLink.href);
        }
        
        alert('Scan files downloaded successfully');
      } else {
        alert('Failed to load scan details for download');
      }
    } catch (error) {
      console.error('Error downloading scan:', error);
      alert('Failed to download scan');
    }
  };

  const handleShareScan = async (scanId: string) => {
    try {
      // Create the original shareable link
      const currentPath = window.location.pathname;
      const basePath = currentPath.split('/').slice(0, -1).join('/');
      const originalUrl = `${window.location.origin}${basePath}/analysis/${scanId}`;
      
      console.log('Creating share link for:', { scanId, originalUrl });
      
      try {
        // Try to create a short URL
        console.log('🔗 Attempting to create short URL for:', { originalUrl, scanId });
        const response = await api.post('/api/urls/shorten', {
          originalUrl,
          scanId
        });

        console.log('📡 Short URL API response:', response.data);

        if (response.data.status === 'success') {
          const shortUrl = response.data.data.shortUrl;
          console.log('✅ Short URL created successfully:', shortUrl);
          setShareUrl(shortUrl);
          setShareData({
            ...response.data.data,
            scanId: scanId,
            originalUrl: originalUrl
          });
          setShowShareModal(true);
          return;
        } else {
          console.warn('⚠️ Short URL creation failed with response:', response.data);
        }
      } catch (shortUrlError) {
        console.error('❌ Short URL creation error:', shortUrlError);
        console.error('❌ Error details:', (shortUrlError as any)?.response?.data || (shortUrlError as any)?.message);
      }
      
      // Fallback to original URL if short URL creation fails
      console.log('Using original URL as fallback');
      setShareUrl(originalUrl);
      setShareData({
        shortUrl: originalUrl,
        originalUrl: originalUrl,
        scanId: scanId,
        isExisting: false,
        createdAt: new Date().toISOString()
      });
      setShowShareModal(true);
      
    } catch (error) {
      console.error('Error sharing scan:', error);
      alert('Failed to generate share link. Please try again.');
    }
  };

  const handleRegenerateShareLink = async () => {
    if (!shareData?.scanId || !shareData?.originalUrl) return;
    
    try {
      console.log('🔄 Regenerating share link for scan:', shareData.scanId);
      
      const response = await api.post('/api/urls/regenerate', {
        originalUrl: shareData.originalUrl,
        scanId: shareData.scanId
      });

      console.log('📡 Regenerate API response:', response.data);

      if (response.data.status === 'success') {
        const shortUrl = response.data.data.shortUrl;
        console.log('✅ Share link regenerated successfully:', shortUrl);
        setShareUrl(shortUrl);
        setShareData(response.data.data);
      } else {
        console.warn('⚠️ Regenerate failed with response:', response.data);
        alert('Failed to regenerate share link. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error regenerating share link:', error);
      alert('Failed to regenerate share link. Please try again.');
    }
  };

  const filteredScans = scans.filter(scan =>
    scan.scanId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    scan.patientFirstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    scan.patientLastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    scan.scanType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ContentContainer>
      <Header>
        <PageTitle>Scans</PageTitle>
        <AddButton onClick={handleAddScan}>
          <FaPlus size={14} />
          New Scan
        </AddButton>
      </Header>

      <SearchBar>
        <SearchInput>
          <SearchIcon>
            <FaSearch size={16} />
          </SearchIcon>
          <Input
            type="text"
            placeholder="Search scans by ID, patient, or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchInput>
        <FilterButton>
          <FaFilter size={14} />
          Filter
        </FilterButton>
      </SearchBar>

      <StatsGrid>
        {stats.map((stat, index) => (
          <StatCard key={index}>
            <StatIcon color={stat.color}>
              {stat.icon}
            </StatIcon>
            <StatContent>
              <StatValue>{stat.value}</StatValue>
              <StatLabel>{stat.label}</StatLabel>
            </StatContent>
          </StatCard>
        ))}
      </StatsGrid>

      <CasesGrid>
        {loading ? (
          <div style={{ color: '#A0A0A0', textAlign: 'center', padding: '40px' }}>
            Loading scans...
          </div>
        ) : filteredScans.length === 0 ? (
          <div style={{ color: '#A0A0A0', textAlign: 'center', padding: '40px' }}>
            No scans found
          </div>
        ) : (
          filteredScans.map((scan) => (
            <CaseCard key={scan.id}>
            <CaseHeader>
              <CaseInfo>
                {/* Smart thumbnail that handles both images and DICOM files */}
                {(() => {
                  const fileInfo = extractFileInfo(scan);
                  if (!fileInfo.url) return null;
                  
                  return (
                    <SmartThumbnail
                      url={fileInfo.url}
                      filename={fileInfo.name}
                      mimeType={fileInfo.mimeType}
                      alt={scan.scanType || 'scan'}
                      size={40}
                    />
                  );
                })()}
                  <CaseId>{scan.scanId || scan.id}</CaseId>
                  <CaseTitle>{scan.scanType || 'Medical Scan'}</CaseTitle>
                <PatientName>
                  <FaUser size={12} />
                    {scan.patientFirstName} {scan.patientLastName}
                </PatientName>
              </CaseInfo>
                <StatusBadge status={scan.status}>
                  {scan.status?.charAt(0).toUpperCase() + scan.status?.slice(1)}
              </StatusBadge>
            </CaseHeader>

            <CaseDetails>
              <DetailItem>
                <DetailLabel>Scan Type</DetailLabel>
                  <DetailValue>{scan.scanType || 'N/A'}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>Date</DetailLabel>
                  <DetailValue>{new Date(scan.createdAt).toLocaleDateString()}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>Priority</DetailLabel>
                  <DetailValue>{scan.priority || 'Medium'}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>Analysis</DetailLabel>
                <DetailValue>{(scan.aiStatus && scan.aiStatus !== 'pending') ? scan.aiStatus : 'Not started'}</DetailValue>
              </DetailItem>
            </CaseDetails>

            <CaseActions>
              {/* Navigate to analysis page to run AI */}
              <ActionButton 
                onClick={() => handleViewScan(scan.id)} 
                title="Analyze"
                className="analyze"
              >
                <FaMicroscope size={14} />
              </ActionButton>
              {/* Quick analysis preview */}
              <ActionButton 
                onClick={() => handleMicroscopeClick(scan)} 
                title="Quick Preview"
              >
                <FaEye size={14} />
              </ActionButton>
              <ActionButton onClick={() => handleEditScan(scan.id)}>
                <FaEdit size={14} />
              </ActionButton>
              <ActionButton onClick={() => handleDownloadScan(scan.id)}>
                <FaDownload size={14} />
              </ActionButton>
              <ActionButton onClick={() => handleShareScan(scan.id)}>
                <FaShare size={14} />
              </ActionButton>
              <ActionButton 
                className="danger" 
                onClick={() => handleDeleteScan(scan.id)}
              >
                <FaTrash size={14} />
              </ActionButton>
            </CaseActions>
          </CaseCard>
          ))
        )}
      </CasesGrid>

      {showCreateModal && (
        <ScanCreationModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onScanCreated={handleScanCreated}
        />
      )}

      {showEditModal && selectedScan && (
        <EditScanModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedScan(null);
          }}
          scan={selectedScan}
          onScanUpdated={(updatedScan) => {
            setScans(prev => prev.map(s => s.id === updatedScan.id ? updatedScan : s));
            setShowEditModal(false);
            setSelectedScan(null);
          }}
        />
      )}

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        url={shareUrl}
        title="Share Scan"
        scanId={shareData?.scanId}
        originalUrl={shareData?.originalUrl}
        isExisting={shareData?.isExisting}
        createdAt={shareData?.createdAt}
        onRegenerate={handleRegenerateShareLink}
      />

      {/* Analysis Modal */}
      {showAnalysisModal && selectedScanForAnalysis && (
        <ModalOverlay onClick={handleCloseAnalysisModal}>
          <AnalysisModal onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                <FaMicroscope />
                Analysis Preview - {selectedScanForAnalysis.scanType || 'Medical Scan'}
              </ModalTitle>
              <CloseButton onClick={handleCloseAnalysisModal}>
                <FaTimes />
              </CloseButton>
            </ModalHeader>

            <ModalContent>
              <AnalysisStatus status={selectedScanForAnalysis.aiStatus || selectedScanForAnalysis.status || 'pending'}>
                {getStatusIcon(selectedScanForAnalysis.aiStatus || selectedScanForAnalysis.status || 'pending')}
                <StatusText status={selectedScanForAnalysis.aiStatus || selectedScanForAnalysis.status || 'pending'}>
                  {getStatusText(selectedScanForAnalysis.aiStatus || selectedScanForAnalysis.status || 'pending')}
                </StatusText>
              </AnalysisStatus>

              <AnalysisResults>
                <ResultsTitle>Analysis Results</ResultsTitle>
                
                {selectedScanForAnalysis.confidence !== undefined && (
                  <ConfidenceScore>
                    <span style={{ color: '#A0A0A0' }}>Confidence Score:</span>
                    <ConfidenceValue confidence={selectedScanForAnalysis.confidence}>
                      {selectedScanForAnalysis.confidence.toFixed(1)}%
                    </ConfidenceValue>
                  </ConfidenceScore>
                )}

                <FindingsText>
                  {selectedScanForAnalysis.aiFindings || selectedScanForAnalysis.findings || 
                   'No analysis results available. Click "Start Analysis" to begin AI processing.'}
                </FindingsText>
              </AnalysisResults>

              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ color: '#FFFFFF', margin: '0 0 8px 0', fontSize: '14px' }}>
                  Scan Details
                </h4>
                <div style={{ color: '#CCCCCC', fontSize: '13px', lineHeight: '1.5' }}>
                  <div><strong>Patient:</strong> {selectedScanForAnalysis.patientFirstName} {selectedScanForAnalysis.patientLastName}</div>
                  <div><strong>Scan Type:</strong> {selectedScanForAnalysis.scanType || 'N/A'}</div>
                  <div><strong>Body Part:</strong> {selectedScanForAnalysis.bodyPart || 'N/A'}</div>
                  <div><strong>Priority:</strong> {selectedScanForAnalysis.priority || 'Medium'}</div>
                  <div><strong>Date:</strong> {new Date(selectedScanForAnalysis.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            </ModalContent>

            <ModalActions>
              <ActionButtonModal 
                variant="secondary" 
                onClick={handleCloseAnalysisModal}
              >
                Close
              </ActionButtonModal>
              
              {(selectedScanForAnalysis.aiStatus === 'pending' || !selectedScanForAnalysis.aiStatus) && (
                <ActionButtonModal 
                  variant="primary" 
                  onClick={handleStartAnalysis}
                  disabled={analysisLoading}
                >
                  {analysisLoading ? <FaSpinner className="fa-spin" /> : <FaPlay />}
                  {analysisLoading ? 'Starting...' : 'Start Analysis'}
                </ActionButtonModal>
              )}
              
              <ActionButtonModal 
                variant="primary" 
                onClick={() => {
                  handleCloseAnalysisModal();
                  handleViewScan(selectedScanForAnalysis.id);
                }}
              >
                <FaEye />
                View Full Analysis
              </ActionButtonModal>
            </ModalActions>
          </AnalysisModal>
        </ModalOverlay>
      )}
    </ContentContainer>
  );
};

export default CasesContent;
