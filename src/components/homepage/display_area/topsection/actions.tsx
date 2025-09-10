import React, { useState } from 'react';
import styled from 'styled-components';
import { FaPlus, FaClock, FaChartLine, FaExclamationTriangle } from 'react-icons/fa';
import { DashboardData } from '@/services/dashboardService';
import CreateCaseModal from './CreateCaseModal';

interface ActionsProps {
  dashboardData: DashboardData | null;
}

const ActionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
  max-width: 25rem;
  height: 100%;
  justify-content: flex-start;
  align-items: flex-end;

  @media (max-width: 768px) {
    gap: 0.5rem;
    align-items: flex-start;
  }
`;

const TopRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  justify-content: space-between;

  @media (max-width: 768px) {
    gap: 0.75rem;
    flex-direction: column;
    align-items: stretch;
  }
`;

const ActionButton = styled.button`
  background-color: #0694fb;
  border: none;
  border-radius: 0.5rem;
  padding: 0.625rem 1.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 7rem;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  &:hover {
    background-color: #0578d1;
    transform: translateY(-1px);
    box-shadow: 0 3px 8px rgba(6, 148, 251, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ButtonText = styled.p`
  margin: 0;
  color: white;
  font-weight: 500;
  font-size: 0.875rem;
`;

const StatsRow = styled.div`
  display: flex;
  gap: 0.75rem;
  width: 100%;
  justify-content: space-between;

  @media (max-width: 768px) {
    gap: 0.5rem;
  }
`;

const StatContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: rgba(255, 255, 255, 0.05);
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid #1E1E1E;
  flex: 1;
  min-width: 0;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.08);
    border-color: rgba(6, 148, 251, 0.3);
  }
`;

const StatLabel = styled.div`
  background-color: rgba(6, 148, 251, 0.17);
  display: inline-flex;
  border-radius: 0.5rem;
  padding: 0.25rem 0.375rem;
  margin-bottom: 0.375rem;
  align-items: center;
  gap: 4px;
`;

const LabelText = styled.p`
  margin: 0;
  font-size: 0.6875rem;
  color: rgba(6, 148, 251, 1);
  font-weight: 500;
`;

const StatValue = styled.h1`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: rgb(255, 255, 255);
  display: flex;
  align-items: center;
  gap: 6px;
`;

const StatTrend = styled.div`
  display: flex;
  align-items: center;
  gap: 3px;
  margin-top: 3px;
  font-size: 0.6875rem;
`;

const Actions: React.FC<ActionsProps> = ({ dashboardData }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Calculate real metrics from dashboard data
  const calculateTodayInferences = () => {
    if (!dashboardData?.aiModelStats) return 0;
    return dashboardData.aiModelStats.reduce((total, stat) => total + (stat.scansToday || 0), 0);
  };

  const calculateAvgInferenceTime = () => {
    if (!dashboardData?.aiModelStats || dashboardData.aiModelStats.length === 0) return "0s";
    const totalTime = dashboardData.aiModelStats.reduce((total, stat) => total + (stat.avgProcessingTime || 0), 0);
    const avgTime = totalTime / dashboardData.aiModelStats.length;
    return `${avgTime.toFixed(1)}s`;
  };

  const calculateCriticalCases = () => {
    return dashboardData?.overview?.criticalCases || 0;
  };

  // Calculate trends (simplified - in real app you'd compare with previous day)
  const calculateTrends = () => {
    const todayInferences = calculateTodayInferences();
    const avgTime = parseFloat(calculateAvgInferenceTime());
    const criticalCases = calculateCriticalCases();

    return {
      inferences: todayInferences > 0 ? "+15%" : "0%",
      avgTime: avgTime > 0 ? "-5%" : "0%",
      critical: criticalCases > 0 ? "+2" : "0"
    };
  };

  const trends = calculateTrends();

  const stats = [
    { 
      label: "Today's Inference", 
      value: calculateTodayInferences(), 
      icon: <FaChartLine size={10} />,
      trend: trends.inferences,
      trendColor: trends.inferences.startsWith('+') ? "#28A745" : "#666666"
    },
    { 
      label: "Avg Inference Time", 
      value: calculateAvgInferenceTime(), 
      icon: <FaClock size={10} />,
      trend: trends.avgTime,
      trendColor: trends.avgTime.startsWith('-') ? "#28A745" : "#666666"
    },
    { 
      label: "Critical Cases", 
      value: calculateCriticalCases(), 
      icon: <FaExclamationTriangle size={10} />,
      trend: trends.critical,
      trendColor: trends.critical.startsWith('+') ? "#DC3545" : "#666666"
    }
  ];

  const handleCreateCase = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <ActionsContainer>
        <TopRow>
          <ActionButton onClick={handleCreateCase}>
            <FaPlus size={12} />
            <ButtonText>Create New Case</ButtonText>
          </ActionButton>
        </TopRow>

        <StatsRow>
          {stats.map((stat, index) => (
            <StatContainer key={index}>
              <StatLabel>
                {stat.icon}
                <LabelText>{stat.label}</LabelText>
              </StatLabel>
              <StatValue>{stat.value}</StatValue>
              <StatTrend style={{ color: stat.trendColor }}>
                {stat.trend}
              </StatTrend>
            </StatContainer>
          ))}
        </StatsRow>
      </ActionsContainer>

      {isModalOpen && (
        <CreateCaseModal 
          isOpen={isModalOpen} 
          onClose={handleCloseModal}
          onSuccess={() => {
            handleCloseModal();
            // Optionally refresh dashboard data
            window.location.reload();
          }}
        />
      )}
    </>
  );
};

export default Actions;