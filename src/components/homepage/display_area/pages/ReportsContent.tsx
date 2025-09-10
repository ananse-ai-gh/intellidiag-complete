'use client'

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import styled from 'styled-components';
import { 
  FaFileAlt, FaSearch, FaFilter, FaDownload, FaEye, FaShare, 
  FaChartBar, FaChartLine, FaChartPie, FaCalendar, FaUser, 
  FaPlus, FaEdit, FaTrash, FaPrint, FaFilePdf, FaFileExcel,
  FaSort, FaSortUp, FaSortDown, FaClock, FaCheck, FaExclamationTriangle
} from 'react-icons/fa';
import api from '@/services/api';

interface Report {
  id: number;
  reportId: string;
  title: string;
  type: 'patient' | 'scan' | 'analytics' | 'financial' | 'operational';
  patientName?: string;
  patientId?: string;
  scanType?: string;
  generatedBy: string;
  status: 'draft' | 'final' | 'archived';
  createdAt: string;
  updatedAt: string;
  fileSize?: number;
  downloadCount: number;
}

interface FilterState {
  type: string;
  status: string;
  dateRange: string;
  generatedBy: string;
}

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
`;

const PageTitle = styled.h1`
  font-size: 28px;
  font-weight: 600;
  margin: 0;
  color: #FFFFFF;
`;

const GenerateButton = styled.button`
  background: linear-gradient(135deg, #0694FB, #0094ff);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(6, 148, 251, 0.3);
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

const FilterContainer = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
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

  @media (min-width: 481px) and (max-width: 768px) {
    padding: 14px 16px 14px 45px;
    font-size: 15px;
    padding-right: 40px;
  }

  @media (min-width: 769px) {
    padding: 16px 16px 16px 45px;
    font-size: 16px;
    padding-right: 40px;
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
  transition: all 0.3s ease;

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

const QuickActions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
`;

const QuickActionCard = styled.div`
  background-color: #1A1A1A;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #0694FB;
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  }
`;

const QuickActionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const QuickActionIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  background: linear-gradient(135deg, ${props => props.color || '#0694FB'}, ${props => props.color || '#0094ff'});
  color: white;
`;

const QuickActionTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #FFFFFF;
`;

const QuickActionDescription = styled.div`
  font-size: 14px;
  color: #A0A0A0;
  line-height: 1.4;
`;

const ReportsTable = styled.div`
  background-color: #1A1A1A;
  border: 1px solid #333;
  border-radius: 12px;
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 120px 1fr 120px 120px 120px 100px 120px;
  gap: 16px;
  padding: 16px 20px;
  background-color: #0F0F0F;
  border-bottom: 1px solid #333;
  font-weight: 600;
  font-size: 14px;
  color: #FFFFFF;
`;

const TableHeaderCell = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: #0694FB;
  }
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 120px 1fr 120px 120px 120px 100px 120px;
  gap: 16px;
  padding: 16px 20px;
  border-bottom: 1px solid #333;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(6, 148, 251, 0.05);
  }

  &:last-child {
    border-bottom: none;
  }
`;

const TableCell = styled.div`
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #FFFFFF;
`;

const StatusBadge = styled.span<{ status: string }>`
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  background-color: ${props => {
    switch (props.status) {
      case 'final': return 'rgba(40, 167, 69, 0.2)';
      case 'draft': return 'rgba(255, 193, 7, 0.2)';
      case 'archived': return 'rgba(108, 117, 125, 0.2)';
      default: return 'rgba(108, 117, 125, 0.2)';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'final': return '#28A745';
      case 'draft': return '#FFC107';
      case 'archived': return '#6C757D';
      default: return '#6C757D';
    }
  }};
`;

const TypeBadge = styled.span<{ type: string }>`
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  background-color: ${props => {
    switch (props.type) {
      case 'patient': return 'rgba(6, 148, 251, 0.2)';
      case 'scan': return 'rgba(40, 167, 69, 0.2)';
      case 'analytics': return 'rgba(255, 193, 7, 0.2)';
      case 'financial': return 'rgba(220, 53, 69, 0.2)';
      case 'operational': return 'rgba(108, 117, 125, 0.2)';
      default: return 'rgba(108, 117, 125, 0.2)';
    }
  }};
  color: ${props => {
    switch (props.type) {
      case 'patient': return '#0694FB';
      case 'scan': return '#28A745';
      case 'analytics': return '#FFC107';
      case 'financial': return '#DC3545';
      case 'operational': return '#6C757D';
      default: return '#6C757D';
    }
  }};
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

  &.primary:hover {
    color: #0694FB;
    background-color: rgba(6, 148, 251, 0.1);
  }

  &.success:hover {
    color: #28A745;
    background-color: rgba(40, 167, 69, 0.1);
  }

  &.danger:hover {
    color: #FF6B6B;
    background-color: rgba(255, 107, 107, 0.1);
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  color: #0694FB;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #A0A0A0;
`;

const ReportsContent = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    type: '',
    status: '',
    dateRange: '',
    generatedBy: ''
  });
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [stats, setStats] = useState({
    total: 0,
    drafts: 0,
    final: 0,
    archived: 0
  });

  useEffect(() => {
    loadReports();
    loadStats();
  }, [filters, sortField, sortDirection]);

  const loadReports = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with actual API call
      const mockReports: Report[] = [
        {
          id: 1,
          reportId: 'RPT-2024-001',
          title: 'Patient Summary Report - Sarah Johnson',
          type: 'patient',
          patientName: 'Sarah Johnson',
          patientId: 'P2024001',
          generatedBy: 'Dr. Smith',
          status: 'final',
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
          fileSize: 245760,
          downloadCount: 3
        },
        {
          id: 2,
          reportId: 'RPT-2024-002',
          title: 'Chest X-Ray Analysis Report',
          type: 'scan',
          patientName: 'Michael Chen',
          patientId: 'P2024002',
          scanType: 'X-Ray',
          generatedBy: 'AI System',
          status: 'final',
          createdAt: '2024-01-14T15:45:00Z',
          updatedAt: '2024-01-14T15:45:00Z',
          fileSize: 189440,
          downloadCount: 1
        },
        {
          id: 3,
          reportId: 'RPT-2024-003',
          title: 'Monthly Analytics Report',
          type: 'analytics',
          generatedBy: 'System Admin',
          status: 'draft',
          createdAt: '2024-01-13T09:20:00Z',
          updatedAt: '2024-01-13T09:20:00Z',
          fileSize: 512000,
          downloadCount: 0
        },
        {
          id: 4,
          reportId: 'RPT-2024-004',
          title: 'Financial Performance Report',
          type: 'financial',
          generatedBy: 'Finance Team',
          status: 'final',
          createdAt: '2024-01-12T14:15:00Z',
          updatedAt: '2024-01-12T14:15:00Z',
          fileSize: 1024000,
          downloadCount: 5
        }
      ];
      
      setReports(mockReports);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Mock stats - replace with actual API call
      setStats({
        total: 4,
        drafts: 1,
        final: 3,
        archived: 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleGenerateReport = (type: string) => {
    console.log('Generate report:', type);
  };

  const handleViewReport = (reportId: number) => {
    console.log('View report:', reportId);
  };

  const handleDownloadReport = (reportId: number) => {
    console.log('Downloading report:', reportId);
  };

  const handleShareReport = (reportId: number) => {
    console.log('Sharing report:', reportId);
  };

  const handleDeleteReport = async (reportId: number) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        // API call to delete report
        console.log('Deleting report:', reportId);
        loadReports();
      } catch (error) {
        console.error('Error deleting report:', error);
      }
    }
  };

  const filteredReports = Array.isArray(reports) ? reports.filter(report =>
    report.reportId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (report.patientName && report.patientName.toLowerCase().includes(searchTerm.toLowerCase()))
  ) : [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return <FaSort size={12} />;
    return sortDirection === 'asc' ? <FaSortUp size={12} /> : <FaSortDown size={12} />;
  };

  return (
    <ContentContainer>
      <Header>
        <PageTitle>Reports</PageTitle>
        <GenerateButton onClick={() => console.log('Generate report')}>
          <FaPlus size={14} />
          Generate Report
        </GenerateButton>
      </Header>

      <QuickActions>
        <QuickActionCard onClick={() => handleGenerateReport('patient')}>
          <QuickActionHeader>
            <QuickActionIcon color="#0694FB">
              <FaUser />
            </QuickActionIcon>
            <QuickActionTitle>Patient Report</QuickActionTitle>
          </QuickActionHeader>
          <QuickActionDescription>
            Generate comprehensive patient summary reports with medical history and current status.
          </QuickActionDescription>
        </QuickActionCard>

        <QuickActionCard onClick={() => handleGenerateReport('scan')}>
          <QuickActionHeader>
            <QuickActionIcon color="#28A745">
              <FaFileAlt />
            </QuickActionIcon>
            <QuickActionTitle>Scan Analysis Report</QuickActionTitle>
          </QuickActionHeader>
          <QuickActionDescription>
            Create detailed scan analysis reports with AI findings and medical recommendations.
          </QuickActionDescription>
        </QuickActionCard>

        <QuickActionCard onClick={() => handleGenerateReport('analytics')}>
          <QuickActionHeader>
            <QuickActionIcon color="#FFC107">
              <FaChartBar />
            </QuickActionIcon>
            <QuickActionTitle>Analytics Report</QuickActionTitle>
          </QuickActionHeader>
          <QuickActionDescription>
            Generate analytics reports with performance metrics and trend analysis.
          </QuickActionDescription>
        </QuickActionCard>

        <QuickActionCard onClick={() => handleGenerateReport('financial')}>
          <QuickActionHeader>
            <QuickActionIcon color="#DC3545">
              <FaChartLine />
            </QuickActionIcon>
            <QuickActionTitle>Financial Report</QuickActionTitle>
          </QuickActionHeader>
          <QuickActionDescription>
            Create financial performance reports with revenue analysis and cost breakdown.
          </QuickActionDescription>
        </QuickActionCard>
      </QuickActions>

      <SearchBar>
        <SearchInput>
          <SearchIcon>
            <FaSearch size={16} />
          </SearchIcon>
          <Input
            type="text"
            placeholder="Search reports by ID, title, or patient..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </SearchInput>
        <FilterContainer>
          <FilterSelect
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
          >
            <option value="">All Types</option>
            <option value="patient">Patient Reports</option>
            <option value="scan">Scan Reports</option>
            <option value="analytics">Analytics Reports</option>
            <option value="financial">Financial Reports</option>
            <option value="operational">Operational Reports</option>
          </FilterSelect>
          <FilterSelect
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="final">Final</option>
            <option value="archived">Archived</option>
          </FilterSelect>
          <FilterSelect
            value={filters.dateRange}
            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
          >
            <option value="">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </FilterSelect>
        </FilterContainer>
      </SearchBar>

      <StatsGrid>
        <StatCard>
          <StatIcon color="#0694FB">
            <FaFileAlt />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.total}</StatValue>
            <StatLabel>Total Reports</StatLabel>
          </StatContent>
        </StatCard>
        <StatCard>
          <StatIcon color="#FFC107">
            <FaEdit />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.drafts}</StatValue>
            <StatLabel>Drafts</StatLabel>
          </StatContent>
        </StatCard>
        <StatCard>
          <StatIcon color="#28A745">
            <FaCheck />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.final}</StatValue>
            <StatLabel>Final Reports</StatLabel>
          </StatContent>
        </StatCard>
        <StatCard>
          <StatIcon color="#6C757D">
            <FaClock />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.archived}</StatValue>
            <StatLabel>Archived</StatLabel>
          </StatContent>
        </StatCard>
      </StatsGrid>

      <ReportsTable>
        <TableHeader>
          <TableHeaderCell onClick={() => setSortField('reportId')}>
            Report ID {getSortIcon('reportId')}
          </TableHeaderCell>
          <TableHeaderCell onClick={() => setSortField('title')}>
            Title {getSortIcon('title')}
          </TableHeaderCell>
          <TableHeaderCell onClick={() => setSortField('type')}>
            Type {getSortIcon('type')}
          </TableHeaderCell>
          <TableHeaderCell onClick={() => setSortField('generatedBy')}>
            Generated By {getSortIcon('generatedBy')}
          </TableHeaderCell>
          <TableHeaderCell onClick={() => setSortField('status')}>
            Status {getSortIcon('status')}
          </TableHeaderCell>
          <TableHeaderCell>Actions</TableHeaderCell>
        </TableHeader>

        {loading ? (
          <LoadingSpinner>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </LoadingSpinner>
        ) : filteredReports.length === 0 ? (
          <EmptyState>
            <FaFileAlt size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <h3>No reports found</h3>
            <p>Try adjusting your search or filters</p>
          </EmptyState>
        ) : (
          filteredReports.map((report) => (
            <TableRow key={report.id}>
              <TableCell>
                <strong>{report.reportId}</strong>
              </TableCell>
              <TableCell>
                <div>
                  <div>{report.title}</div>
                  {report.patientName && (
                    <div style={{ fontSize: '12px', color: '#A0A0A0' }}>
                      Patient: {report.patientName}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <TypeBadge type={report.type}>
                  {report.type.charAt(0).toUpperCase() + report.type.slice(1)}
                </TypeBadge>
              </TableCell>
              <TableCell>{report.generatedBy}</TableCell>
              <TableCell>
                <StatusBadge status={report.status}>
                  {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                </StatusBadge>
              </TableCell>
              <TableCell>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <ActionButton onClick={() => handleViewReport(report.id)} title="View">
                    <FaEye size={14} />
                  </ActionButton>
                  <ActionButton 
                    className="success" 
                    onClick={() => handleDownloadReport(report.id)}
                    title="Download"
                  >
                    <FaDownload size={14} />
                  </ActionButton>
                  <ActionButton 
                    className="primary" 
                    onClick={() => handleShareReport(report.id)}
                    title="Share"
                  >
                    <FaShare size={14} />
                  </ActionButton>
                  <ActionButton 
                    className="danger" 
                    onClick={() => handleDeleteReport(report.id)}
                    title="Delete"
                  >
                    <FaTrash size={14} />
                  </ActionButton>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </ReportsTable>
    </ContentContainer>
  );
};

export default ReportsContent;
