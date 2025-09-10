'use client'

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams } from 'next/navigation';
import styled from 'styled-components';
import { FaPlus, FaSearch, FaFilter, FaFileAlt, FaUser, FaCalendar, FaEye, FaEdit, FaTrash, FaDownload, FaShare, FaPlay, FaBrain } from 'react-icons/fa';

interface StatusBadgeProps {
  status: string;
}

const PageContainer = styled.div`
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

  &.primary:hover {
    color: #0694FB;
    background-color: rgba(6, 148, 251, 0.1);
  }

  &.success:hover {
    color: #28A745;
    background-color: rgba(40, 167, 69, 0.1);
  }
`;

const NewCaseNotification = styled.div`
  background: linear-gradient(135deg, rgba(6, 148, 251, 0.1), rgba(6, 148, 251, 0.05));
  border: 1px solid rgba(6, 148, 251, 0.3);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  animation: slideIn 0.5s ease-out;

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const NotificationContent = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const NotificationIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(6, 148, 251, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0694FB;
`;

const NotificationText = styled.div`
  color: #FFFFFF;
  font-size: 14px;
`;

const NotificationActions = styled.div`
  display: flex;
  gap: 8px;
`;

const NotificationButton = styled.button`
  background: rgba(6, 148, 251, 0.2);
  border: 1px solid rgba(6, 148, 251, 0.4);
  color: #0694FB;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: rgba(6, 148, 251, 0.3);
    border-color: rgba(6, 148, 251, 0.6);
  }
`;

const CasesPage = () => {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewCaseNotification, setShowNewCaseNotification] = useState(false);
  const [newScanId, setNewScanId] = useState<string | null>(null);

  // Check for new scan parameter on component mount
  useEffect(() => {
    const newScan = searchParams.get('newScan');
    if (newScan) {
      setNewScanId(newScan);
      setShowNewCaseNotification(true);
      // Remove the parameter from URL after reading it
      const url = new URL(window.location.href);
      url.searchParams.delete('newScan');
      window.history.replaceState({}, '', url.toString());
    }
  }, [searchParams]);

  // Mock data
  const cases = [
    {
      id: 'CASE-001',
      title: 'Chest X-Ray Analysis',
      patientName: 'Sarah Johnson',
      scanType: 'Chest X-Ray',
      date: '2024-08-28',
      status: 'completed',
      priority: 'High',
      aiConfidence: '94%'
    },
    {
      id: 'CASE-002',
      title: 'Brain MRI Review',
      patientName: 'Michael Chen',
      scanType: 'Brain MRI',
      date: '2024-08-27',
      status: 'processing',
      priority: 'Medium',
      aiConfidence: '87%'
    },
    {
      id: 'CASE-003',
      title: 'Spine CT Scan',
      patientName: 'Emma Wilson',
      scanType: 'Spine CT',
      date: '2024-08-26',
      status: 'pending',
      priority: 'Low',
      aiConfidence: '91%'
    },
    {
      id: 'CASE-004',
      title: 'Cardiac Echo',
      patientName: 'David Brown',
      scanType: 'Cardiac Echo',
      date: '2024-08-25',
      status: 'completed',
      priority: 'High',
      aiConfidence: '96%'
    },
    {
      id: 'CASE-005',
      title: 'Lung CT Analysis',
      patientName: 'Lisa Garcia',
      scanType: 'Lung CT',
      date: '2024-08-24',
      status: 'processing',
      priority: 'Medium',
      aiConfidence: '89%'
    },
    {
      id: 'CASE-006',
      title: 'Abdominal Ultrasound',
      patientName: 'John Smith',
      scanType: 'Abdominal US',
      date: '2024-08-23',
      status: 'cancelled',
      priority: 'Low',
      aiConfidence: '82%'
    }
  ];

  const stats = [
    { label: 'Total Cases', value: '156', icon: <FaFileAlt />, color: '#0694FB' },
    { label: 'Completed', value: '89', icon: <FaFileAlt />, color: '#28A745' },
    { label: 'In Progress', value: '34', icon: <FaFileAlt />, color: '#FFC107' },
    { label: 'Pending Review', value: '23', icon: <FaFileAlt />, color: '#DC3545' }
  ];

  const handleAddCase = () => {
    console.log('Add new case');
  };

  const handleViewCase = (caseId: string) => {
    console.log('View case:', caseId);
  };

  const handleEditCase = (caseId: string) => {
    console.log('Edit case:', caseId);
  };

  const handleDeleteCase = (caseId: string) => {
    console.log('Delete case:', caseId);
  };

  const handleDownloadCase = (caseId: string) => {
    console.log('Download case:', caseId);
  };

  const handleShareCase = (caseId: string) => {
    console.log('Share case:', caseId);
  };

  const handleStartAnalysis = (caseId: string) => {
    console.log('Start AI analysis for case:', caseId);
    // Here you would typically call the AI analysis API
    // For now, we'll just show a console log
  };

  const handleViewAnalysis = (caseId: string) => {
    console.log('View analysis for case:', caseId);
    // Here you would navigate to the analysis page
  };

  const filteredCases = cases.filter(caseItem =>
    caseItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    caseItem.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    caseItem.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageContainer>
      <Header>
        <PageTitle>Cases</PageTitle>
        <AddButton onClick={handleAddCase}>
          <FaPlus size={14} />
          New Case
        </AddButton>
      </Header>

      {showNewCaseNotification && (
        <NewCaseNotification>
          <NotificationContent>
            <NotificationIcon>
              <FaBrain size={20} />
            </NotificationIcon>
            <NotificationText>
              <strong>New case created successfully!</strong> Your scan is ready for AI analysis.
            </NotificationText>
          </NotificationContent>
          <NotificationActions>
            <NotificationButton onClick={() => handleStartAnalysis(newScanId!)}>
              <FaPlay size={12} />
              Start Analysis
            </NotificationButton>
            <NotificationButton onClick={() => setShowNewCaseNotification(false)}>
              Dismiss
            </NotificationButton>
          </NotificationActions>
        </NewCaseNotification>
      )}

      <SearchBar>
        <SearchInput>
          <SearchIcon>
            <FaSearch size={16} />
          </SearchIcon>
          <Input
            type="text"
            placeholder="Search cases by title, patient, or ID..."
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
        {filteredCases.map((caseItem) => (
          <CaseCard key={caseItem.id}>
            <CaseHeader>
              <CaseInfo>
                <CaseId>{caseItem.id}</CaseId>
                <CaseTitle>{caseItem.title}</CaseTitle>
                <PatientName>
                  <FaUser size={12} />
                  {caseItem.patientName}
                </PatientName>
              </CaseInfo>
              <StatusBadge status={caseItem.status}>
                {caseItem.status.charAt(0).toUpperCase() + caseItem.status.slice(1)}
              </StatusBadge>
            </CaseHeader>

            <CaseDetails>
              <DetailItem>
                <DetailLabel>Scan Type</DetailLabel>
                <DetailValue>{caseItem.scanType}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>Date</DetailLabel>
                <DetailValue>{caseItem.date}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>Priority</DetailLabel>
                <DetailValue>{caseItem.priority}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>AI Confidence</DetailLabel>
                <DetailValue>{caseItem.aiConfidence}</DetailValue>
              </DetailItem>
            </CaseDetails>

            <CaseActions>
              <ActionButton onClick={() => handleViewCase(caseItem.id)}>
                <FaEye size={14} />
              </ActionButton>
              {caseItem.status === 'pending' && (
                <ActionButton 
                  className="primary" 
                  onClick={() => handleStartAnalysis(caseItem.id)}
                  title="Start AI Analysis"
                >
                  <FaBrain size={14} />
                </ActionButton>
              )}
              {caseItem.status === 'processing' && (
                <ActionButton 
                  className="success" 
                  onClick={() => handleViewAnalysis(caseItem.id)}
                  title="View Analysis"
                >
                  <FaPlay size={14} />
                </ActionButton>
              )}
              <ActionButton onClick={() => handleEditCase(caseItem.id)}>
                <FaEdit size={14} />
              </ActionButton>
              <ActionButton onClick={() => handleDownloadCase(caseItem.id)}>
                <FaDownload size={14} />
              </ActionButton>
              <ActionButton onClick={() => handleShareCase(caseItem.id)}>
                <FaShare size={14} />
              </ActionButton>
              <ActionButton 
                className="danger" 
                onClick={() => handleDeleteCase(caseItem.id)}
              >
                <FaTrash size={14} />
              </ActionButton>
            </CaseActions>
          </CaseCard>
        ))}
      </CasesGrid>
    </PageContainer>
  );
};

export default CasesPage;
