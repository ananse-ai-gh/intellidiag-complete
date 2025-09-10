'use client'

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import styled from 'styled-components';
import { 
  FaPlus, FaSearch, FaFilter, FaEye, FaEdit, FaTrash, FaDownload, 
  FaPlay, FaClock, FaCheck, FaTimes, FaSpinner, FaBrain, FaLungs, 
  FaHeart, FaUpload, FaFlask, FaRobot, FaChartLine, FaFileAlt, FaImage,
  FaFileDownload, FaUser, FaCalendar, FaStethoscope, FaXRay, FaCheckCircle
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
  aiResults?: any;
}

interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  idNumber: string;
  dateOfBirth: string;
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
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const CreateScanSection = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 32px;
  backdrop-filter: blur(10px);
`;

const CreateScanHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
`;

const CreateScanTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: #FFFFFF;
`;

const CreateScanForm = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #ccc;
`;

const Input = styled.input`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px 16px;
  color: #FFFFFF;
  font-size: 14px;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #0694FB;
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

const Select = styled.select`
  width: 100%;
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

  &::placeholder {
    color: #9c9c9c;
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

  & option {
    background: #1a1a3a;
    color: #ffffff;
    padding: 8px;
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

const SearchInputField = styled.input`
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

const ScansGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 24px;
  margin-top: 24px;
`;

const ScanCard = styled.div<{ status: string }>`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid ${props => {
    switch (props.status) {
      case 'completed': return 'rgba(40, 167, 69, 0.3)';
      case 'analyzing': return 'rgba(255, 193, 7, 0.3)';
      case 'failed': return 'rgba(220, 53, 69, 0.3)';
      default: return 'rgba(255, 255, 255, 0.1)';
    }
  }};
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
    border-color: ${props => {
      switch (props.status) {
        case 'completed': return 'rgba(40, 167, 69, 0.5)';
        case 'analyzing': return 'rgba(255, 193, 7, 0.5)';
        case 'failed': return 'rgba(220, 53, 69, 0.5)';
        default: return 'rgba(255, 255, 255, 0.2)';
      }
    }};
  }
`;

const ScanCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
`;

const ScanInfo = styled.div`
  flex: 1;
`;

const ScanId = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #FFFFFF;
`;

const PatientInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: #ccc;
  font-size: 14px;
`;

const ScanDetails = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
`;

const DetailTag = styled.span<{ variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' }>`
  background: ${props => {
    switch (props.variant) {
      case 'success': return 'rgba(40, 167, 69, 0.2)';
      case 'warning': return 'rgba(255, 193, 7, 0.2)';
      case 'danger': return 'rgba(220, 53, 69, 0.2)';
      case 'primary': return 'rgba(6, 148, 251, 0.2)';
      default: return 'rgba(255, 255, 255, 0.1)';
    }
  }};
  color: ${props => {
    switch (props.variant) {
      case 'success': return '#28a745';
      case 'warning': return '#ffc107';
      case 'danger': return '#dc3545';
      case 'primary': return '#0694fb';
      default: '#ccc';
    }
  }};
  border: 1px solid ${props => {
    switch (props.variant) {
      case 'success': return 'rgba(40, 167, 69, 0.3)';
      case 'warning': return 'rgba(255, 193, 7, 0.3)';
      case 'danger': return 'rgba(220, 53, 69, 0.3)';
      case 'primary': return 'rgba(6, 148, 251, 0.3)';
      default: 'rgba(255, 255, 255, 0.2)';
    }
  }};
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
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
      default: '#ccc';
    }
  }};
  border: 1px solid ${props => {
    switch (props.status) {
      case 'completed': return 'rgba(40, 167, 69, 0.3)';
      case 'analyzing': return 'rgba(255, 193, 7, 0.3)';
      case 'failed': return 'rgba(220, 53, 69, 0.3)';
      default: 'rgba(255, 255, 255, 0.2)';
    }
  }};
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
`;

const AIResultsPreview = styled.div`
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  padding: 16px;
  margin-top: 16px;
`;

const AIResultsTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #0694fb;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const AIResultsContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const AIResultItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
`;

const AIResultLabel = styled.span`
  font-size: 12px;
  color: #ccc;
`;

const AIResultValue = styled.span<{ variant?: 'success' | 'warning' | 'danger' }>`
  font-size: 12px;
  font-weight: 600;
  color: ${props => {
    switch (props.variant) {
      case 'success': return '#28a745';
      case 'warning': return '#ffc107';
      case 'danger': return '#dc3545';
      default: '#fff';
    }
  }};
`;

const CardActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 16px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #666;
`;

const EmptyStateIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  color: #444;
`;

const EmptyStateText = styled.p`
  font-size: 16px;
  margin: 0 0 8px 0;
  color: #666;
`;

const EmptyStateSubtext = styled.p`
  font-size: 14px;
  margin: 0;
  color: #888;
`;

// Main Component
const ScansContentRedesigned = () => {
  const { user } = useAuth();
  const [scans, setScans] = useState<Scan[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    patientId: '',
    scanType: '',
    priority: 'medium',
    scanDate: new Date().toISOString().split('T')[0]
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    patientId: '',
    scanType: '',
    priority: '',
    status: ''
  });

  useEffect(() => {
    loadScans();
    loadPatients();
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

  const loadPatients = async () => {
    try {
      const response = await api.get('/api/patients');
      const patientsData = response.data?.data?.patients || [];
      setPatients(Array.isArray(patientsData) ? patientsData : []);
    } catch (error) {
      console.error('Error loading patients:', error);
      setPatients([]);
    }
  };

  const handleCreateScan = async () => {
    try {
      const response = await api.post('/api/scans', createForm);
      if (response.data?.success) {
        setShowCreateModal(false);
        setCreateForm({
          patientId: '',
          scanType: '',
          bodyPart: '',
          priority: 'medium',
          scanDate: new Date().toISOString().split('T')[0]
        });
        loadScans();
      }
    } catch (error) {
      console.error('Error creating scan:', error);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed':
      case 'completed_with_findings':
      case 'completed_no_findings':
      case 'translation_completed':
        return 'success';
      case 'ai_processing':
      case 'ai_processing_brain':
      case 'ai_processing_breast':
      case 'ai_processing_lung':
      case 'ai_processing_mri_ct':
      case 'ai_processing_ct_mri':
      case 'report_generating':
        return 'warning';
      case 'queued':
      case 'queue_processing':
        return 'info';
      case 'failed':
      case 'ai_failed':
      case 'ai_timeout':
      case 'ai_service_unavailable':
      case 'ai_invalid_response':
      case 'translation_failed':
      case 'report_failed':
      case 'queue_failed':
      case 'validation_failed':
        return 'danger';
      case 'uploading':
      case 'uploaded':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case 'uploading': return 'Uploading';
      case 'uploaded': return 'Uploaded';
      case 'validation_failed': return 'Validation Failed';
      case 'queued': return 'Queued';
      case 'queue_processing': return 'Queue Processing';
      case 'queue_failed': return 'Queue Failed';
      case 'ai_processing': return 'AI Processing';
      case 'ai_processing_brain': return 'Brain Analysis';
      case 'ai_processing_breast': return 'Breast Analysis';
      case 'ai_processing_lung': return 'Lung Analysis';
      case 'ai_processing_mri_ct': return 'MRI→CT Translation';
      case 'ai_processing_ct_mri': return 'CT→MRI Translation';
      case 'ai_completed': return 'AI Completed';
      case 'ai_completed_with_findings': return 'AI Completed (Findings)';
      case 'ai_completed_no_findings': return 'AI Completed (No Findings)';
      case 'translation_completed': return 'Translation Completed';
      case 'ai_failed': return 'AI Failed';
      case 'ai_timeout': return 'AI Timeout';
      case 'ai_service_unavailable': return 'AI Service Unavailable';
      case 'ai_invalid_response': return 'AI Invalid Response';
      case 'translation_failed': return 'Translation Failed';
      case 'report_generating': return 'Generating Report';
      case 'report_completed': return 'Report Completed';
      case 'report_failed': return 'Report Failed';
      case 'completed': return 'Completed';
      case 'completed_with_findings': return 'Completed (Findings)';
      case 'completed_no_findings': return 'Completed (No Findings)';
      case 'failed': return 'Failed';
      case 'archived': return 'Archived';
      default: return status;
    }
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'secondary';
    }
  };

  const formatAIResults = (scan: Scan) => {
    if (!scan.aiResults) return null;

    const results = [];
    
    // Add confidence if available
    if (scan.confidence) {
      results.push({
        label: 'Confidence',
        value: `${scan.confidence}%`,
        variant: scan.confidence > 70 ? 'success' : scan.confidence > 40 ? 'warning' : 'danger'
      });
    }

    // Add AI status if available
    if (scan.aiStatus) {
      results.push({
        label: 'AI Status',
        value: scan.aiStatus,
        variant: scan.aiStatus === 'completed' ? 'success' : 'warning'
      });
    }

    // Add findings if available
    if (scan.aiFindings) {
      results.push({
        label: 'Findings',
        value: scan.aiFindings.length > 30 ? `${scan.aiFindings.substring(0, 30)}...` : scan.aiFindings,
        variant: 'primary'
      });
    }

    return results;
  };

  const clearFilters = () => {
    setFilters({
      patientId: '',
      scanType: '',
      priority: '',
      status: ''
    });
  };

  // Calculate statistics
  const stats = {
    total: scans.length,
    uploading: scans.filter(scan => scan.status === 'uploading').length,
    uploaded: scans.filter(scan => scan.status === 'uploaded').length,
    queued: scans.filter(scan => scan.status === 'queued').length,
    processing: scans.filter(scan => 
      scan.status === 'queue_processing' || 
      scan.status.startsWith('ai_processing') || 
      scan.status === 'report_generating'
    ).length,
    completed: scans.filter(scan => 
      scan.status === 'completed' || 
      scan.status === 'completed_with_findings' || 
      scan.status === 'completed_no_findings' || 
      scan.status === 'translation_completed'
    ).length,
    failed: scans.filter(scan => 
      scan.status === 'failed' || 
      scan.status.startsWith('ai_failed') || 
      scan.status === 'queue_failed' || 
      scan.status === 'validation_failed' ||
      scan.status === 'translation_failed' ||
      scan.status === 'report_failed'
    ).length
  };

  // Filter scans based on search and filters
  const filteredScans = scans.filter(scan => {
    const matchesSearch = searchTerm === '' || 
      scan.scanId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scan.patientFirstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scan.patientLastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scan.scanType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPatientFilter = filters.patientId === '' || scan.patientId === parseInt(filters.patientId);
    const matchesScanTypeFilter = filters.scanType === '' || scan.scanType === filters.scanType;
    const matchesPriorityFilter = filters.priority === '' || scan.priority === filters.priority;
    const matchesStatusFilter = filters.status === '' || scan.status === filters.status;
    
    return matchesSearch && matchesPatientFilter && matchesScanTypeFilter && matchesPriorityFilter && matchesStatusFilter;
  });

  if (loading) {
    return (
      <ContentContainer>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <FaSpinner className="fa-spin" style={{ fontSize: '24px', color: '#0694FB' }} />
          <span style={{ marginLeft: '12px', color: '#ccc' }}>Loading scans...</span>
        </div>
      </ContentContainer>
    );
  }

  return (
    <ContentContainer>
      {/* Header */}
      <Header>
        <PageTitle>
          <FaXRay />
          Scans Management
        </PageTitle>
        <HeaderActions>
          <Button onClick={() => setShowCreateModal(true)}>
            <FaPlus />
            Create New Scan
          </Button>
        </HeaderActions>
      </Header>

      {/* Search Bar */}
      <SearchBar>
        <SearchInput>
          <SearchIcon>
            <FaSearch size={16} />
          </SearchIcon>
          <SearchInputField
            type="text"
            placeholder="Search scans by patient, scan type, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <ClearButton onClick={() => setSearchTerm('')}>
              <FaTimes size={14} />
            </ClearButton>
          )}
        </SearchInput>
        <FilterContainer>
          <FilterSelect
            value={filters.patientId}
            onChange={(e) => setFilters(prev => ({ ...prev, patientId: e.target.value }))}
          >
            <option value="">All Patients</option>
            {patients.map(patient => (
              <option key={patient.id} value={patient.id}>
                {patient.firstName} {patient.lastName}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect
            value={filters.scanType}
            onChange={(e) => setFilters(prev => ({ ...prev, scanType: e.target.value }))}
          >
            <option value="">All Types</option>
            <option value="Brain">Brain</option>
            <option value="Breast">Breast</option>
            <option value="Lung">Lung</option>
            <option value="MRI-CT Translation">MRI-CT Translation</option>
            <option value="CT-MRI Translation">CT-MRI Translation</option>
          </FilterSelect>
          <FilterSelect
            value={filters.priority}
            onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </FilterSelect>
          <FilterSelect
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          >
            <option value="">All Statuses</option>
            <option value="uploading">Uploading</option>
            <option value="uploaded">Uploaded</option>
            <option value="queued">Queued</option>
            <option value="queue_processing">Queue Processing</option>
            <option value="ai_processing">AI Processing</option>
            <option value="ai_processing_brain">Brain Analysis</option>
            <option value="ai_processing_breast">Breast Analysis</option>
            <option value="ai_processing_lung">Lung Analysis</option>
            <option value="ai_processing_mri_ct">MRI→CT Translation</option>
            <option value="ai_processing_ct_mri">CT→MRI Translation</option>
            <option value="report_generating">Generating Report</option>
            <option value="completed">Completed</option>
            <option value="completed_with_findings">Completed (Findings)</option>
            <option value="completed_no_findings">Completed (No Findings)</option>
            <option value="translation_completed">Translation Completed</option>
            <option value="failed">Failed</option>
            <option value="ai_failed">AI Failed</option>
            <option value="queue_failed">Queue Failed</option>
            <option value="validation_failed">Validation Failed</option>
          </FilterSelect>
        </FilterContainer>
        {(searchTerm || Object.values(filters).some(value => value !== '')) && (
          <ClearFiltersButton onClick={clearFilters}>
            <FaTimes size={14} />
            Clear Filters
          </ClearFiltersButton>
        )}
      </SearchBar>

      {/* Search Results Info */}
      {(searchTerm || Object.values(filters).some(value => value !== '')) && (
        <SearchResultsInfo>
          <FaSearch size={14} />
          <span>
            Showing {filteredScans.length} of {scans.length} scans
            {searchTerm && ` matching "${searchTerm}"`}
          </span>
        </SearchResultsInfo>
      )}

      {/* Statistics Grid */}
      <StatsGrid>
        <StatCard onClick={() => setFilters(prev => ({ ...prev, status: '' }))}>
          <StatIcon color="#0694FB">
            <FaXRay />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.total}</StatValue>
            <StatLabel>Total Scans</StatLabel>
          </StatContent>
        </StatCard>
        <StatCard onClick={() => setFilters(prev => ({ ...prev, status: 'queued' }))}>
          <StatIcon color="#FFC107">
            <FaClock />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.queued}</StatValue>
            <StatLabel>Queued</StatLabel>
          </StatContent>
        </StatCard>
        <StatCard onClick={() => setFilters(prev => ({ ...prev, status: 'processing' }))}>
          <StatIcon color="#0694FB">
            <FaSpinner />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.processing}</StatValue>
            <StatLabel>Processing</StatLabel>
          </StatContent>
        </StatCard>
        <StatCard onClick={() => setFilters(prev => ({ ...prev, status: 'completed' }))}>
          <StatIcon color="#28A745">
            <FaCheckCircle />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.completed}</StatValue>
            <StatLabel>Completed</StatLabel>
          </StatContent>
        </StatCard>
      </StatsGrid>

      {/* Scans List */}
      <div>
        <h3 style={{ margin: '0 0 24px 0', color: '#FFFFFF', fontSize: '20px' }}>
          Recent Scans ({filteredScans.length})
        </h3>
        
        {filteredScans.length === 0 ? (
          <EmptyState>
            <EmptyStateIcon>
              <FaXRay />
            </EmptyStateIcon>
            <EmptyStateText>No scans found</EmptyStateText>
            <EmptyStateSubtext>
              {scans.length === 0 ? 'Create your first scan to get started' : 'Try adjusting your filters or search terms'}
            </EmptyStateSubtext>
          </EmptyState>
        ) : (
          <ScansGrid>
            {filteredScans.map(scan => {
              const aiResults = formatAIResults(scan);
              
              return (
                <ScanCard key={scan.id} status={scan.status}>
                  <ScanCardHeader>
                    <ScanInfo>
                      <ScanId>{scan.scanId}</ScanId>
                      <PatientInfo>
                        <FaUser />
                        {scan.patientFirstName} {scan.patientLastName}
                      </PatientInfo>
                    </ScanInfo>
                    <StatusBadge status={scan.status}>
                      {getStatusDisplayName(scan.status)}
                    </StatusBadge>
                  </ScanCardHeader>

                  <ScanDetails>
                    <DetailTag variant="primary">{scan.scanType}</DetailTag>
                    <DetailTag variant={getPriorityVariant(scan.priority)}>
                      {scan.priority} Priority
                    </DetailTag>
                    <DetailTag variant="secondary">
                      <FaCalendar style={{ marginRight: '4px' }} />
                      {new Date(scan.scanDate).toLocaleDateString()}
                    </DetailTag>
                  </ScanDetails>

                  {aiResults && aiResults.length > 0 && (
                    <AIResultsPreview>
                      <AIResultsTitle>
                        <FaRobot />
                        AI Analysis Results
                      </AIResultsTitle>
                      <AIResultsContent>
                        {aiResults.map((result, index) => (
                          <AIResultItem key={index}>
                            <AIResultLabel>{result.label}</AIResultLabel>
                            <AIResultValue variant={result.variant as any}>
                              {result.value}
                            </AIResultValue>
                          </AIResultItem>
                        ))}
                      </AIResultsContent>
                    </AIResultsPreview>
                  )}

                  <CardActions>
                    <Button variant="secondary" size="small">
                      <FaEye />
                      View Details
                    </Button>
                    {scan.status === 'completed' && (
                      <Button variant="success" size="small">
                        <FaDownload />
                        Download Report
                      </Button>
                    )}
                  </CardActions>
                </ScanCard>
              );
            })}
          </ScansGrid>
        )}
      </div>

      {/* Create Scan Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'rgba(0, 0, 0, 0.9)',
            borderRadius: '15px',
            padding: '30px',
            maxWidth: '500px',
            width: '100%',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, color: '#FFFFFF' }}>Create New Scan</h2>
              <button 
                onClick={() => setShowCreateModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ccc',
                  fontSize: '20px',
                  cursor: 'pointer'
                }}
              >
                <FaTimes />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ color: '#ccc', marginBottom: '8px', display: 'block' }}>Patient</label>
                <Select 
                  value={createForm.patientId} 
                  onChange={(e) => setCreateForm(prev => ({ ...prev, patientId: e.target.value }))}
                >
                  <option value="">Select Patient</option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id}>
                      {patient.firstName} {patient.lastName} - {patient.idNumber}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label style={{ color: '#ccc', marginBottom: '8px', display: 'block' }}>Scan Type</label>
                <Select 
                  value={createForm.scanType} 
                  onChange={(e) => setCreateForm(prev => ({ ...prev, scanType: e.target.value }))}
                >
                  <option value="">Select Scan Type</option>
                  <option value="Brain">Brain</option>
                  <option value="Breast">Breast</option>
                  <option value="Lung">Lung</option>
                  <option value="MRI-CT Translation">MRI-CT Translation</option>
                  <option value="CT-MRI Translation">CT-MRI Translation</option>
                </Select>
              </div>

              <div>
                <label style={{ color: '#ccc', marginBottom: '8px', display: 'block' }}>Priority</label>
                <Select 
                  value={createForm.priority} 
                  onChange={(e) => setCreateForm(prev => ({ ...prev, priority: e.target.value }))}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </Select>
              </div>

              <div>
                <label style={{ color: '#ccc', marginBottom: '8px', display: 'block' }}>Scan Date</label>
                <Input 
                  type="date" 
                  value={createForm.scanDate} 
                  onChange={(e) => setCreateForm(prev => ({ ...prev, scanDate: e.target.value }))}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
              <Button 
                variant="secondary" 
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateScan} 
                disabled={!createForm.patientId || !createForm.scanType}
              >
                Create Scan
              </Button>
            </div>
          </div>
        </div>
      )}
    </ContentContainer>
  );
};

export default ScansContentRedesigned;
