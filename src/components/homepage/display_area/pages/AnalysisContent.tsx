'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  FaBrain, FaSearch, FaEye, FaEdit, FaDownload, FaCheck, FaClock, 
  FaPercentage, FaFileAlt, FaPlay, FaTimes, FaFilter, FaSort,
  FaSortUp, FaSortDown, FaPlus, FaTrash, FaFileExport, FaBars,
  FaCheckSquare, FaSquare, FaPrint, FaEnvelope, FaCopy, FaLink,
  FaImage, FaFileMedical, FaHeartbeat, FaLungs, FaBrain as FaBrainIcon,
  FaBone, FaEye as FaEyeIcon, FaHistory, FaChartLine, FaRobot,
  FaExclamationTriangle, FaCheckCircle, FaSpinner, FaRedo, FaInfo
} from 'react-icons/fa';
import api from '@/services/api';
import styled from 'styled-components';

interface Analysis {
  id: number;
  scanId: string;
  patientFirstName: string;
  patientLastName: string;
  patientIdNumber: string;
  scanType: string;
  bodyPart: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  confidence?: number;
  findings?: string;
  createdAt: string;
  aiStatus: string;
  scanDate: string;
  priority: string;
  notes?: string;
  uploadedByFirstName: string;
  uploadedByLastName: string;
  imagePath?: string;
}

interface FilterState {
  status: string;
  scanType: string;
  confidence: string;
  dateRange: string;
  bodyPart: string;
  priority: string;
}

interface SearchState {
  term: string;
  mode: 'all' | 'patient' | 'scanId' | 'uploader';
}

interface SortState {
  field: string;
  direction: 'asc' | 'desc';
}

interface Notification {
  type: 'success' | 'error' | 'info';
  message: string;
}

// Styled Components
const ContentContainer = styled.div`
  padding: 24px;
  background-color: transparent;
  min-height: 100vh;
  color: #FFFFFF;
  width: 100%;
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
      case 'danger': return 'linear-gradient(135deg, #DC3545, #C82333)';
      case 'success': return 'linear-gradient(135deg, #28A745, #20C997)';
      default: return 'linear-gradient(135deg, #0694FB, #0094ff)';
    }
  }};
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const SearchBar = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  align-items: center;
  flex-wrap: wrap;
`;

const SearchInput = styled.div`
  position: relative;
  flex: 1;
  max-width: 400px;
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #A0A0A0;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px 12px 44px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: #FFFFFF;
  font-size: 14px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #0694FB;
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 0 3px rgba(6, 148, 251, 0.15);
  }

  &::placeholder {
    color: #A0A0A0;
  }
`;

const ClearButton = styled.button`
  background: none;
  border: none;
  color: #A0A0A0;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);

  &:hover {
    color: #FFFFFF;
    background: rgba(255, 255, 255, 0.1);
  }
`;

const SearchModeSelect = styled.select`
  width: auto;
  min-width: 140px;
  padding: 12px 16px 12px 45px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: #ffffff;
  font-size: 14px;
  font-family: var(--font-primary);
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239c9c9c' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  padding-right: 40px;

  & option {
    background: #1a1a3a;
    color: #ffffff;
    padding: 8px;
  }

  &:focus {
    outline: none;
    border-color: #0694fb;
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 0 3px rgba(6, 148, 251, 0.15);
  }

  &:hover {
    border-color: rgba(255, 255, 255, 0.2);
  }
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
`;

const FilterSelect = styled.select`
  width: auto;
  min-width: 140px;
  padding: 12px 16px 12px 45px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: #ffffff;
  font-size: 14px;
  font-family: var(--font-primary);
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239c9c9c' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  padding-right: 40px;

  & option {
    background: #1a1a3a;
    color: #ffffff;
    padding: 8px;
  }

  &:focus {
    outline: none;
    border-color: #0694fb;
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 0 3px rgba(6, 148, 251, 0.15);
  }

  &:hover {
    border-color: rgba(255, 255, 255, 0.2);
  }
`;

const ClearFiltersButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #FFFFFF;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
  }
`;

const SearchResultsInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(6, 148, 251, 0.1);
  border: 1px solid rgba(6, 148, 251, 0.2);
  border-radius: 8px;
  color: #0694FB;
  font-size: 14px;
  margin-bottom: 16px;
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
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    border-color: #0694FB;
    transform: translateY(-2px);
  }
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  background: linear-gradient(135deg, ${props => props.color || '#0694FB'}, ${props => props.color || '#0094ff'});
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

const BulkActionsBar = styled.div<{ visible: boolean }>`
  display: ${props => props.visible ? 'flex' : 'none'};
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background-color: #0F0F0F;
  border: 1px solid #333;
  border-radius: 8px;
  margin-bottom: 16px;
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  cursor: pointer;
`;

const AnalysisGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
`;

const AnalysisCard = styled.div<{ selected: boolean }>`
  background-color: ${props => props.selected ? '#0F0F0F' : '#1A1A1A'};
  border: 2px solid ${props => props.selected ? '#0694FB' : '#333'};
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
  position: relative;
  cursor: pointer;

  &:hover {
    border-color: #0694FB;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  }

  ${props => props.selected && `
    box-shadow: 0 0 0 3px rgba(6, 148, 251, 0.2);
    background: linear-gradient(135deg, #0F0F0F 0%, #1A1A1A 100%);
  `}
`;

const AnalysisHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const AnalysisInfo = styled.div`
  flex: 1;
`;

const AnalysisId = styled.div`
  font-size: 14px;
  color: #0694FB;
  font-weight: 600;
  margin-bottom: 4px;
`;

const PatientName = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #FFFFFF;
  margin-bottom: 8px;
`;

const ScanInfo = styled.div`
  font-size: 14px;
  color: #A0A0A0;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const StatusBadge = styled.span<{ status: string }>`
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  background-color: ${props => {
    switch (props.status) {
      case 'completed': return 'rgba(40, 167, 69, 0.2)';
      case 'processing': return 'rgba(6, 148, 251, 0.2)';
      case 'pending': return 'rgba(255, 193, 7, 0.2)';
      case 'failed': return 'rgba(220, 53, 69, 0.2)';
      default: return 'rgba(108, 117, 125, 0.2)';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'completed': return '#28A745';
      case 'processing': return '#0694FB';
      case 'pending': return '#FFC107';
      case 'failed': return '#DC3545';
      default: return '#6C757D';
    }
  }};
`;

const ConfidenceSection = styled.div`
  margin: 16px 0;
`;

const ConfidenceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
  color: #A0A0A0;
`;

const ConfidenceValue = styled.span<{ confidence: number }>`
  color: ${props => 
    props.confidence >= 90 ? '#28A745' : 
    props.confidence >= 70 ? '#FFC107' : '#DC3545'
  };
  font-weight: 600;
`;

const ConfidenceBar = styled.div`
  width: 100%;
  height: 8px;
  background-color: #333;
  border-radius: 4px;
  overflow: hidden;
`;

const ConfidenceFill = styled.div<{ confidence: number }>`
  height: 100%;
  background: ${props => 
    props.confidence >= 90 ? 'linear-gradient(90deg, #28A745, #20C997)' :
    props.confidence >= 70 ? 'linear-gradient(90deg, #FFC107, #FFB84D)' :
    'linear-gradient(90deg, #DC3545, #E74C3C)'
  };
  width: ${props => props.confidence}%;
  transition: width 0.3s ease;
`;

const FindingsSection = styled.div`
  background-color: #0F0F0F;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 12px;
  margin: 16px 0;
  font-size: 13px;
  color: #CCCCCC;
  line-height: 1.4;
  max-height: 80px;
  overflow: hidden;
  position: relative;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #333;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: #A0A0A0;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    color: #FFFFFF;
    background: rgba(255, 255, 255, 0.1);
  }
`;

const Notification = styled.div<{ type: string }>`
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 16px 20px;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${props => {
    switch (props.type) {
      case 'success': return 'linear-gradient(135deg, #28A745, #20C997)';
      case 'error': return 'linear-gradient(135deg, #DC3545, #C82333)';
      case 'info': return 'linear-gradient(135deg, #0694FB, #0094ff)';
      default: return 'linear-gradient(135deg, #6C757D, #5A6268)';
    }
  }};
  animation: slideIn 0.3s ease;

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  color: #0694FB;
  font-size: 16px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #A0A0A0;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  color: #333;
`;

const SpinAnimation = styled.div`
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .spin {
    animation: spin 1s linear infinite;
  }
`;

const SelectionIndicator = styled.div<{ selected: boolean }>`
  position: absolute;
  top: 12px;
  left: 12px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid ${props => props.selected ? '#0694FB' : 'rgba(255, 255, 255, 0.3)'};
  background: ${props => props.selected ? '#0694FB' : 'transparent'};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 1;

  &::after {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${props => props.selected ? '#FFFFFF' : 'transparent'};
    transition: all 0.2s ease;
  }
`;

const AnalysisContent = () => {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState<SearchState>({
    term: '',
    mode: 'all'
  });
  const [filters, setFilters] = useState<FilterState>({
    status: '',
    scanType: '',
    confidence: '',
    dateRange: '',
    bodyPart: '',
    priority: ''
  });
  const [sort, setSort] = useState<SortState>({
    field: 'createdAt',
    direction: 'desc'
  });
  const [selectedAnalyses, setSelectedAnalyses] = useState<number[]>([]);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
    avgConfidence: 0
  });

  const showNotification = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  }, []);

  const loadStats = useCallback((analysesData: Analysis[] = analyses) => {
    try {
      // Calculate stats from provided analyses data using aiStatus
      const completedAnalyses = analysesData.filter(a => a.aiStatus === 'completed');
      const avgConfidence = completedAnalyses.length > 0 
        ? completedAnalyses.reduce((sum, a) => sum + (a.confidence || 0), 0) / completedAnalyses.length
        : 0;

      setStats({
        total: analysesData.length,
        pending: analysesData.filter(a => a.aiStatus === 'pending').length,
        processing: analysesData.filter(a => a.aiStatus === 'processing').length,
        completed: completedAnalyses.length,
        failed: analysesData.filter(a => a.aiStatus === 'failed').length,
        avgConfidence: Math.round(avgConfidence)
      });
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  }, [analyses]);

  const loadAnalyses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/scans');
      console.log('Analyses API response:', response.data);
      
      const scans = response.data?.data?.scans || [];
      
      // Filter for scans with AI analysis (include all statuses for complete statistics)
      const analysesWithAI = Array.isArray(scans) ? scans.filter((scan: any) => 
        scan.aiStatus
      ) : [];
      
      setAnalyses(analysesWithAI);
      // Calculate stats from the loaded analyses
      loadStats(analysesWithAI);
    } catch (error) {
      console.error('Error loading analyses:', error);
      setAnalyses([]);
      showNotification('error', 'Failed to load analyses');
    } finally {
      setLoading(false);
    }
  }, [loadStats, showNotification]);

  useEffect(() => {
    loadAnalyses();
  }, [loadAnalyses]);

  const handleSearch = (value: string) => {
    setSearch(prev => ({ ...prev, term: value }));
  };

  const handleSearchModeChange = (mode: SearchState['mode']) => {
    setSearch(prev => ({ ...prev, mode }));
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setSearch({ term: '', mode: 'all' });
    setFilters({
      status: '',
      scanType: '',
      confidence: '',
      dateRange: '',
      bodyPart: '',
      priority: ''
    });
    setSort({ field: 'createdAt', direction: 'desc' });
  };

  const handleSort = (field: string) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSelectAnalysis = (analysisId: number) => {
    setSelectedAnalyses(prev => 
      prev.includes(analysisId) 
        ? prev.filter(id => id !== analysisId)
        : [...prev, analysisId]
    );
  };

  const handleSelectAll = () => {
    if (selectedAnalyses.length === filteredAnalyses.length) {
      setSelectedAnalyses([]);
    } else {
      setSelectedAnalyses(filteredAnalyses.map(a => a.id));
    }
  };

  const handleViewAnalysis = (analysisId: number) => {
    const analysis = analyses.find(a => a.id === analysisId);
    if (analysis) {
      showNotification('info', `Viewing analysis for scan ${analysis.scanId}`);
      // TODO: Open detailed view modal
    }
  };

  const handleEditAnalysis = (analysisId: number) => {
    const analysis = analyses.find(a => a.id === analysisId);
    if (analysis) {
      showNotification('info', `Editing analysis for scan ${analysis.scanId}`);
      // TODO: Open edit modal
    }
  };

  const handleRerunAnalysis = async (scanId: string) => {
    try {
      const response = await api.post(`/api/scans/${scanId}/analyze`);
      console.log('Rerun response:', response.data);
      showNotification('success', 'Analysis rerun initiated');
      loadAnalyses();
    } catch (error: any) {
      console.error('Error rerunning analysis:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to rerun analysis';
      showNotification('error', errorMessage);
    }
  };

  const handleDownloadReport = async (analysisId: number) => {
    try {
      const analysis = analyses.find(a => a.id === analysisId);
      if (analysis) {
        // TODO: Implement actual download functionality
        showNotification('success', `Downloading report for scan ${analysis.scanId}`);
      }
    } catch (error) {
      showNotification('error', 'Failed to download report');
    }
  };

  const handleBulkRerun = async () => {
    try {
      setLoading(true);
      const selectedScans = analyses.filter(a => selectedAnalyses.includes(a.id));
      
      // Only rerun failed analyses
      const failedScans = selectedScans.filter(scan => scan.aiStatus === 'failed');
      
      if (failedScans.length === 0) {
        showNotification('info', 'No failed analyses to rerun. Only failed analyses can be rerun.');
        return;
      }

      // Rerun each failed analysis
      const rerunPromises = failedScans.map(async (scan) => {
        try {
          const response = await api.post(`/api/scans/${scan.scanId}/analyze`);
          console.log(`Rerun response for ${scan.scanId}:`, response.data);
          return { success: true, scanId: scan.scanId };
        } catch (error: any) {
          console.error(`Error rerunning analysis ${scan.scanId}:`, error);
          return { 
            success: false, 
            scanId: scan.scanId, 
            error: error.response?.data?.message || error.message 
          };
        }
      });
      
      const results = await Promise.all(rerunPromises);
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      if (successful > 0) {
        showNotification('success', `Rerun initiated for ${successful} analyses${failed > 0 ? `, ${failed} failed` : ''}`);
        setSelectedAnalyses([]);
        loadAnalyses();
      } else {
        showNotification('error', `Failed to rerun all analyses. ${failed} errors occurred.`);
      }
    } catch (error: any) {
      console.error('Error in bulk rerun:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to rerun selected analyses';
      showNotification('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkExport = async () => {
    try {
      setLoading(true);
      const selectedScans = analyses.filter(a => selectedAnalyses.includes(a.id));
      
      if (selectedScans.length === 0) {
        showNotification('info', 'Please select analyses to export');
        return;
      }

      // Get scan IDs for export
      const scanIds = selectedScans.map(scan => scan.scanId).join(',');
      
      // Use API service to get the CSV data with proper authentication
      const response = await api.get(`/api/analyses/export?ids=${encodeURIComponent(scanIds)}`, {
        responseType: 'blob' // Important for file download
      });
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analysis-reports-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      showNotification('success', `Exported ${selectedScans.length} analysis reports`);
      setSelectedAnalyses([]);
    } catch (error) {
      console.error('Error exporting analyses:', error);
      showNotification('error', 'Failed to export analyses');
    } finally {
      setLoading(false);
    }
  };

  const filteredAnalyses = Array.isArray(analyses) ? analyses.filter(analysis => {
    // Search functionality
    const searchLower = search.term.toLowerCase();
    const matchesSearch = search.term === '' || (() => {
      switch (search.mode) {
        case 'patient':
          return `${analysis.patientFirstName} ${analysis.patientLastName}`.toLowerCase().includes(searchLower) ||
                 analysis.patientIdNumber.toLowerCase().includes(searchLower);
        case 'scanId':
          return analysis.scanId.toLowerCase().includes(searchLower);
        case 'uploader':
          return `${analysis.uploadedByFirstName} ${analysis.uploadedByLastName}`.toLowerCase().includes(searchLower);
        case 'all':
        default:
          return analysis.scanId.toLowerCase().includes(searchLower) ||
                 `${analysis.patientFirstName} ${analysis.patientLastName}`.toLowerCase().includes(searchLower) ||
                 analysis.patientIdNumber.toLowerCase().includes(searchLower) ||
                 analysis.scanType.toLowerCase().includes(searchLower) ||
                 analysis.bodyPart.toLowerCase().includes(searchLower) ||
                 analysis.notes?.toLowerCase().includes(searchLower) ||
                 `${analysis.uploadedByFirstName} ${analysis.uploadedByLastName}`.toLowerCase().includes(searchLower);
      }
    })();

    // Filter functionality
          const matchesStatus = filters.status === '' || analysis.aiStatus === filters.status;
    const matchesScanType = filters.scanType === '' || analysis.scanType === filters.scanType;
    const matchesBodyPart = filters.bodyPart === '' || analysis.bodyPart === filters.bodyPart;
    const matchesPriority = filters.priority === '' || analysis.priority === filters.priority;
    const matchesConfidence = filters.confidence === '' || (() => {
      const confidence = analysis.confidence || 0;
      switch (filters.confidence) {
        case 'high': return confidence >= 90;
        case 'medium': return confidence >= 70 && confidence < 90;
        case 'low': return confidence < 70;
        default: return true;
      }
    })();
    const matchesDateRange = filters.dateRange === '' || (() => {
      const analysisDate = new Date(analysis.createdAt);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const lastWeek = new Date(today);
      lastWeek.setDate(lastWeek.getDate() - 7);
      const lastMonth = new Date(today);
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      switch (filters.dateRange) {
        case 'today':
          return analysisDate.toDateString() === today.toDateString();
        case 'yesterday':
          return analysisDate.toDateString() === yesterday.toDateString();
        case 'last-week':
          return analysisDate >= lastWeek && analysisDate <= today;
        case 'last-month':
          return analysisDate >= lastMonth && analysisDate <= today;
        default:
          return true;
      }
    })();

    return matchesSearch && matchesStatus && matchesScanType && matchesBodyPart && 
           matchesPriority && matchesConfidence && matchesDateRange;
  }) : [];

  const sortedAnalyses = [...filteredAnalyses].sort((a, b) => {
    const aValue = a[sort.field as keyof Analysis];
    const bValue = b[sort.field as keyof Analysis];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sort.direction === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sort.direction === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getSortIcon = (field: string) => {
    if (sort.field !== field) return <FaSort size={12} />;
    return sort.direction === 'asc' ? <FaSortUp size={12} /> : <FaSortDown size={12} />;
  };

  if (loading) {
    return (
      <ContentContainer>
        <LoadingSpinner>
          <FaSpinner className="fa-spin" />
          Loading analyses...
        </LoadingSpinner>
      </ContentContainer>
    );
  }

  return (
    <ContentContainer>
      <SpinAnimation />
      {notification && (
        <Notification type={notification.type}>
          {notification.type === 'success' && <FaCheckCircle />}
          {notification.type === 'error' && <FaExclamationTriangle />}
          {notification.type === 'info' && <FaInfo />}
          {notification.message}
        </Notification>
      )}

      <Header>
        <PageTitle>
          <FaBrain />
          AI Analysis Management
        </PageTitle>
        <HeaderActions>
          <Button onClick={() => {
            setLoading(true);
            loadAnalyses();
          }}>
            <FaRedo />
            Refresh
          </Button>
          <Button 
            variant="secondary" 
            onClick={async () => {
              try {
                setLoading(true);
                await api.post('/api/test-failed-analyses');
                showNotification('success', 'Created failed analyses for testing');
                loadAnalyses();
              } catch (error: any) {
                console.error('Error creating failed analyses:', error);
                showNotification('error', 'Failed to create test failed analyses');
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
            title="Create failed analyses for testing rerun functionality"
          >
            <FaExclamationTriangle />
            Create Failed Tests
          </Button>
        </HeaderActions>
      </Header>

      <SearchBar>
        <SearchInput>
          <SearchIcon>
            <FaSearch size={16} />
          </SearchIcon>
          <Input
            type="text"
            placeholder={`Search ${search.mode === 'all' ? 'all fields' : search.mode === 'patient' ? 'patient name or ID' : search.mode === 'scanId' ? 'scan ID' : 'uploader name'}...`}
            value={search.term}
            onChange={(e) => handleSearch(e.target.value)}
          />
          {search.term && (
            <ClearButton onClick={() => handleSearch('')}>
              <FaTimes size={14} />
            </ClearButton>
          )}
        </SearchInput>
        <SearchModeSelect
          value={search.mode}
          onChange={(e) => handleSearchModeChange(e.target.value as SearchState['mode'])}
        >
          <option value="all">All Fields</option>
          <option value="patient">Patient</option>
          <option value="scanId">Scan ID</option>
          <option value="uploader">Uploader</option>
        </SearchModeSelect>
        <FilterContainer>
          <FilterSelect
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </FilterSelect>
          <FilterSelect
            value={filters.scanType}
            onChange={(e) => handleFilterChange('scanType', e.target.value)}
          >
            <option value="">All Types</option>
            <option value="X-Ray">X-Ray</option>
            <option value="CT">CT</option>
            <option value="MRI">MRI</option>
            <option value="Ultrasound">Ultrasound</option>
            <option value="PET">PET</option>
            <option value="Other">Other</option>
          </FilterSelect>
          <FilterSelect
            value={filters.bodyPart}
            onChange={(e) => handleFilterChange('bodyPart', e.target.value)}
          >
            <option value="">All Body Parts</option>
            <option value="Chest">Chest</option>
            <option value="Head">Head</option>
            <option value="Abdomen">Abdomen</option>
            <option value="Spine">Spine</option>
            <option value="Extremities">Extremities</option>
            <option value="Other">Other</option>
          </FilterSelect>
          <FilterSelect
            value={filters.confidence}
            onChange={(e) => handleFilterChange('confidence', e.target.value)}
          >
            <option value="">All Confidence</option>
            <option value="high">High (≥90%)</option>
            <option value="medium">Medium (70-89%)</option>
            <option value="low">Low (&lt;70%)</option>
          </FilterSelect>
          <FilterSelect
            value={filters.dateRange}
            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
          >
            <option value="">All Dates</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="last-week">Last Week</option>
            <option value="last-month">Last Month</option>
          </FilterSelect>
        </FilterContainer>
        {(search.term || Object.values(filters).some(value => value !== '')) && (
          <ClearFiltersButton onClick={handleClearFilters}>
            <FaTimes size={14} />
            Clear Filters
          </ClearFiltersButton>
        )}
      </SearchBar>

      {(search.term || Object.values(filters).some(value => value !== '')) && (
        <SearchResultsInfo>
          <FaSearch size={14} />
          <span>
            Showing {filteredAnalyses.length} of {analyses.length} analyses
            {search.term && ` matching "${search.term}"`}
            {search.term && search.mode !== 'all' && ` in ${search.mode} field`}
          </span>
        </SearchResultsInfo>
      )}

      <StatsGrid>
        <StatCard onClick={() => handleFilterChange('status', '')}>
          <StatIcon color="#0694FB">
            <FaBrain />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.total}</StatValue>
            <StatLabel>Total Analyses</StatLabel>
          </StatContent>
        </StatCard>
        <StatCard onClick={() => handleFilterChange('status', 'pending')}>
          <StatIcon color="#FFC107">
            <FaClock />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.pending}</StatValue>
            <StatLabel>Pending</StatLabel>
          </StatContent>
        </StatCard>
        <StatCard onClick={() => handleFilterChange('status', 'processing')}>
          <StatIcon color="#0694FB">
            <FaSpinner />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.processing}</StatValue>
            <StatLabel>Processing</StatLabel>
          </StatContent>
        </StatCard>
        <StatCard onClick={() => handleFilterChange('status', 'completed')}>
          <StatIcon color="#28A745">
            <FaCheckCircle />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.completed}</StatValue>
            <StatLabel>Completed</StatLabel>
          </StatContent>
        </StatCard>
        <StatCard onClick={() => handleFilterChange('status', 'failed')}>
          <StatIcon color="#DC3545">
            <FaExclamationTriangle />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.failed}</StatValue>
            <StatLabel>Failed</StatLabel>
          </StatContent>
        </StatCard>
        <StatCard>
          <StatIcon color="#20C997">
            <FaPercentage />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.avgConfidence}%</StatValue>
            <StatLabel>Avg Confidence</StatLabel>
          </StatContent>
        </StatCard>
      </StatsGrid>

      {selectedAnalyses.length > 0 ? (
        <BulkActionsBar visible={true}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ color: '#FFFFFF', fontWeight: '500' }}>
              {selectedAnalyses.length} analysis selected
            </span>
            {(() => {
              const selectedScans = analyses.filter(a => selectedAnalyses.includes(a.id));
              const statusCounts = {
                pending: selectedScans.filter(scan => scan.aiStatus === 'pending').length,
                processing: selectedScans.filter(scan => scan.aiStatus === 'processing').length,
                completed: selectedScans.filter(scan => scan.aiStatus === 'completed').length,
                failed: selectedScans.filter(scan => scan.aiStatus === 'failed').length
              };
              
              const statusText = Object.entries(statusCounts)
                .filter(([_, count]) => count > 0)
                .map(([status, count]) => `${count} ${status}`)
                .join(', ');
              
              return statusText ? (
                <span style={{ color: '#A0A0A0', fontSize: '12px' }}>
                  {statusText}
                  {statusCounts.failed === 0 && selectedScans.length > 0 && (
                    <span style={{ color: '#FF6B6B', marginLeft: '8px' }}>
                      (Only failed analyses can be rerun)
                    </span>
                  )}
                </span>
              ) : null;
            })()}
          </div>
          <Button 
            variant="success" 
            onClick={handleBulkRerun}
            disabled={(() => {
              const selectedScans = analyses.filter(a => selectedAnalyses.includes(a.id));
              return selectedScans.filter(scan => scan.aiStatus === 'failed').length === 0;
            })() || loading}
            style={{ opacity: (() => {
              const selectedScans = analyses.filter(a => selectedAnalyses.includes(a.id));
              return selectedScans.filter(scan => scan.aiStatus === 'failed').length === 0 ? 0.5 : 1;
            })() }}
            title={(() => {
              const selectedScans = analyses.filter(a => selectedAnalyses.includes(a.id));
              const failedCount = selectedScans.filter(scan => scan.aiStatus === 'failed').length;
              return failedCount === 0 
                ? 'Only failed analyses can be rerun. Select analyses with "failed" status.' 
                : `Rerun ${failedCount} failed analysis${failedCount > 1 ? 'es' : ''}`;
            })()}
          >
            {loading ? <FaSpinner className="spin" /> : <FaPlay />}
            {loading ? 'Rerunning...' : 'Rerun Failed'}
          </Button>
          <Button 
            variant="secondary" 
            onClick={handleBulkExport}
            disabled={loading}
          >
            {loading ? <FaSpinner className="spin" /> : <FaDownload />}
            {loading ? 'Exporting...' : 'Export Reports'}
          </Button>
          <Button variant="danger" onClick={() => setSelectedAnalyses([])}>
            <FaTimes />
            Clear Selection
          </Button>
        </BulkActionsBar>
      ) : (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(6, 148, 251, 0.1)',
          border: '1px solid rgba(6, 148, 251, 0.2)',
          borderRadius: '8px',
          color: '#0694FB',
          fontSize: '14px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <FaCheckSquare size={14} />
          <span>💡 <strong>Tip:</strong> Click on any analysis card to select it for bulk operations</span>
        </div>
      )}

      {sortedAnalyses.length === 0 ? (
        <EmptyState>
          <EmptyIcon>
            <FaBrain />
          </EmptyIcon>
          <h3>No analyses found</h3>
          <p>
            {search.term || Object.values(filters).some(value => value !== '')
              ? 'Try adjusting your search or filters'
              : 'No AI analyses have been performed yet'
            }
          </p>
        </EmptyState>
      ) : (
        <AnalysisGrid>
          {sortedAnalyses.map((analysis) => (
            <AnalysisCard 
              key={analysis.id}
              selected={selectedAnalyses.includes(analysis.id)}
              onClick={() => handleSelectAnalysis(analysis.id)}
            >
              <SelectionIndicator selected={selectedAnalyses.includes(analysis.id)} />
              
              <AnalysisHeader>
                <AnalysisInfo>
                  <AnalysisId>{analysis.scanId}</AnalysisId>
                  <PatientName>
                    {analysis.patientFirstName} {analysis.patientLastName}
                  </PatientName>
                  <ScanInfo>
                    <FaFileAlt size={12} />
                    {analysis.scanType} • {analysis.bodyPart}
                  </ScanInfo>
                </AnalysisInfo>
                <StatusBadge status={analysis.aiStatus}>
                  {analysis.aiStatus.charAt(0).toUpperCase() + analysis.aiStatus.slice(1)}
                </StatusBadge>
              </AnalysisHeader>

              {analysis.aiStatus === 'completed' && analysis.confidence && (
                <ConfidenceSection>
                  <ConfidenceHeader>
                    <span>AI Confidence</span>
                    <ConfidenceValue confidence={analysis.confidence}>
                      {analysis.confidence}%
                    </ConfidenceValue>
                  </ConfidenceHeader>
                  <ConfidenceBar>
                    <ConfidenceFill confidence={analysis.confidence} />
                  </ConfidenceBar>
                </ConfidenceSection>
              )}

              {analysis.findings && (
                <FindingsSection>
                  <strong>Key Findings:</strong><br />
                  {truncateText(analysis.findings, 150)}
                </FindingsSection>
              )}

              <div style={{
                fontSize: '12px',
                color: '#A0A0A0',
                marginBottom: '16px'
              }}>
                <div>Created: {formatDate(analysis.createdAt)}</div>
                <div>Uploaded by: {analysis.uploadedByFirstName} {analysis.uploadedByLastName}</div>
              </div>

              <ActionButtons onClick={(e) => e.stopPropagation()}>
                <ActionButton
                  onClick={() => handleViewAnalysis(analysis.id)}
                  title="View Details"
                >
                  <FaEye size={14} />
                </ActionButton>
                {analysis.aiStatus === 'completed' && (
                  <ActionButton
                    onClick={() => handleEditAnalysis(analysis.id)}
                    title="Edit Analysis"
                  >
                    <FaEdit size={14} />
                  </ActionButton>
                )}
                {analysis.aiStatus === 'failed' && (
                  <ActionButton
                    onClick={() => handleRerunAnalysis(analysis.scanId)}
                    title="Rerun Analysis"
                  >
                    <FaPlay size={14} />
                  </ActionButton>
                )}
                {analysis.status === 'completed' && (
                  <ActionButton
                    onClick={() => handleDownloadReport(analysis.id)}
                    title="Download Report"
                  >
                    <FaDownload size={14} />
                  </ActionButton>
                )}
              </ActionButtons>
            </AnalysisCard>
          ))}
        </AnalysisGrid>
      )}
    </ContentContainer>
  );
};

export default AnalysisContent;
