'use client'

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

import styled from 'styled-components';
import { FaSearch, FaFilter, FaHistory, FaUser, FaCalendar, FaFileAlt, FaEye, FaDownload, FaShare, FaChartLine } from 'react-icons/fa';

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

const HistoryContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 24px;
`;

const HistoryList = styled.div`
  background-color: #1A1A1A;
  border: 1px solid #333;
  border-radius: 12px;
  overflow: hidden;
`;

const HistoryHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #333;
  background-color: #0D0D0D;
`;

const HistoryTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const HistoryItem = styled.div`
  padding: 20px;
  border-bottom: 1px solid #2A2A2A;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.02);
  }

  &:last-child {
    border-bottom: none;
  }
`;

const ItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const ItemTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #FFFFFF;
  margin-bottom: 4px;
`;

const ItemDate = styled.div`
  font-size: 12px;
  color: #A0A0A0;
`;

const ItemStatus = styled.span<{ status: string }>`
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  background-color: ${props => {
    switch (props.status) {
      case 'completed': return 'rgba(40, 167, 69, 0.2)';
      case 'cancelled': return 'rgba(220, 53, 69, 0.2)';
      case 'pending': return 'rgba(255, 193, 7, 0.2)';
      default: return 'rgba(108, 117, 125, 0.2)';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'completed': return '#28A745';
      case 'cancelled': return '#DC3545';
      case 'pending': return '#FFC107';
      default: return '#6C757D';
    }
  }};
`;

const ItemDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
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

const ItemActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: #A0A0A0;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #FFFFFF;
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const AnalyticsSidebar = styled.div`
  background-color: #1A1A1A;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 20px;
`;

const AnalyticsTitle = styled.h3`
  margin: 0 0 20px 0;
  font-size: 16px;
  font-weight: 600;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ChartContainer = styled.div`
  background-color: #0D0D0D;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #A0A0A0;
  font-size: 14px;
`;

const MetricItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #2A2A2A;

  &:last-child {
    border-bottom: none;
  }
`;

const MetricLabel = styled.div`
  font-size: 14px;
  color: #A0A0A0;
`;

const MetricValue = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #FFFFFF;
`;

const HistoryPage = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data
  const historyItems = [
    {
      id: 1,
      title: 'Chest X-Ray Analysis',
      patientName: 'Sarah Johnson',
      scanType: 'Chest X-Ray',
      date: '2024-08-28',
      status: 'completed',
      aiConfidence: '94%',
      duration: '2.3s',
      findings: 'Normal cardiac silhouette, clear lung fields'
    },
    {
      id: 2,
      title: 'Brain MRI Review',
      patientName: 'Michael Chen',
      scanType: 'Brain MRI',
      date: '2024-08-27',
      status: 'completed',
      aiConfidence: '87%',
      duration: '4.7s',
      findings: 'No significant abnormalities detected'
    },
    {
      id: 3,
      title: 'Spine CT Scan',
      patientName: 'Emma Wilson',
      scanType: 'Spine CT',
      date: '2024-08-26',
      status: 'cancelled',
      aiConfidence: '91%',
      duration: '3.1s',
      findings: 'Scan cancelled by patient'
    },
    {
      id: 4,
      title: 'Cardiac Echo',
      patientName: 'David Brown',
      scanType: 'Cardiac Echo',
      date: '2024-08-25',
      status: 'completed',
      aiConfidence: '96%',
      duration: '1.8s',
      findings: 'Normal cardiac function, no structural abnormalities'
    },
    {
      id: 5,
      title: 'Lung CT Analysis',
      patientName: 'Lisa Garcia',
      scanType: 'Lung CT',
      date: '2024-08-24',
      status: 'completed',
      aiConfidence: '89%',
      duration: '5.2s',
      findings: 'Minor nodules detected, follow-up recommended'
    }
  ];

  const stats = [
    { label: 'Total Scans', value: '1,247', icon: <FaHistory />, color: '#0694FB' },
    { label: 'Completed', value: '1,189', icon: <FaHistory />, color: '#28A745' },
    { label: 'Cancelled', value: '45', icon: <FaHistory />, color: '#DC3545' },
    { label: 'Avg Processing Time', value: '3.2s', icon: <FaHistory />, color: '#FFC107' }
  ];

  const handleViewItem = (itemId: number) => {
    console.log('View history item:', itemId);
  };

  const handleDownloadItem = (itemId: number) => {
    console.log('Download history item:', itemId);
  };

  const handleShareItem = (itemId: number) => {
    console.log('Share history item:', itemId);
  };

  const filteredItems = historyItems.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.scanType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageContainer>
        <Header>
          <PageTitle>History</PageTitle>
        </Header>

        <SearchBar>
          <SearchInput>
            <SearchIcon>
              <FaSearch size={16} />
            </SearchIcon>
            <Input
              type="text"
              placeholder="Search history by title, patient, or scan type..."
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

        <HistoryContainer>
          <HistoryList>
            <HistoryHeader>
              <HistoryTitle>
                <FaHistory size={16} />
                Recent Activity
              </HistoryTitle>
            </HistoryHeader>
            
            {filteredItems.map((item) => (
              <HistoryItem key={item.id}>
                <ItemHeader>
                  <div>
                    <ItemTitle>{item.title}</ItemTitle>
                    <ItemDate>{item.date}</ItemDate>
                  </div>
                  <ItemStatus status={item.status}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </ItemStatus>
                </ItemHeader>

                <ItemDetails>
                  <DetailItem>
                    <DetailLabel>Patient</DetailLabel>
                    <DetailValue>{item.patientName}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Scan Type</DetailLabel>
                    <DetailValue>{item.scanType}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>AI Confidence</DetailLabel>
                    <DetailValue>{item.aiConfidence}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Processing Time</DetailLabel>
                    <DetailValue>{item.duration}</DetailValue>
                  </DetailItem>
                </ItemDetails>

                <DetailItem>
                  <DetailLabel>Findings</DetailLabel>
                  <DetailValue>{item.findings}</DetailValue>
                </DetailItem>

                <ItemActions>
                  <ActionButton onClick={() => handleViewItem(item.id)}>
                    <FaEye size={14} />
                  </ActionButton>
                  <ActionButton onClick={() => handleDownloadItem(item.id)}>
                    <FaDownload size={14} />
                  </ActionButton>
                  <ActionButton onClick={() => handleShareItem(item.id)}>
                    <FaShare size={14} />
                  </ActionButton>
                </ItemActions>
              </HistoryItem>
            ))}
          </HistoryList>

          <AnalyticsSidebar>
            <AnalyticsTitle>
              <FaChartLine size={16} />
              Analytics
            </AnalyticsTitle>

            <ChartContainer>
              Monthly Scan Volume Chart
            </ChartContainer>

            <ChartContainer>
              AI Accuracy Trends
            </ChartContainer>

            <div>
              <MetricItem>
                <MetricLabel>This Month</MetricLabel>
                <MetricValue>156 scans</MetricValue>
              </MetricItem>
              <MetricItem>
                <MetricLabel>Last Month</MetricLabel>
                <MetricValue>142 scans</MetricValue>
              </MetricItem>
              <MetricItem>
                <MetricLabel>Avg Daily</MetricLabel>
                <MetricValue>5.2 scans</MetricValue>
              </MetricItem>
              <MetricItem>
                <MetricLabel>Peak Day</MetricLabel>
                <MetricValue>12 scans</MetricValue>
              </MetricItem>
            </div>
          </AnalyticsSidebar>
        </HistoryContainer>
      </PageContainer>
  );
};

export default HistoryPage;
