import React from 'react';
import styled from 'styled-components';
import { FaPlus, FaClock, FaChartLine, FaExclamationTriangle } from 'react-icons/fa';

const ActionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem; /* 12px - reduced from 2.5rem */
  width: 100%;
  max-width: 25rem; /* 400px - reduced from 485px */
  height: 100%;
  justify-content: flex-start;
  align-items: flex-end;

  @media (max-width: 768px) {
    gap: 0.5rem; /* 8px */
    align-items: flex-start;
  }
`;

const TopRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem; /* 16px */
  width: 100%;
  justify-content: space-between;

  @media (max-width: 768px) {
    gap: 0.75rem; /* 12px */
    flex-direction: column;
    align-items: stretch;
  }
`;

const ActionButton = styled.button`
  background-color: #0694fb;
  border: none;
  border-radius: 0.5rem; /* 8px - reduced from 10px */
  padding: 0.625rem 1.25rem; /* 10px 20px - reduced from 12px 24px */
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 7rem; /* 112px - reduced from 128px */
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px; /* reduced from 8px */

  &:hover {
    background-color: #0578d1;
    transform: translateY(-1px); /* reduced from -2px */
    box-shadow: 0 3px 8px rgba(6, 148, 251, 0.3); /* reduced shadow */
  }

  &:active {
    transform: translateY(0);
  }
`;

const ButtonText = styled.p`
  margin: 0;
  color: white;
  font-weight: 500;
  font-size: 0.875rem; /* 14px - reduced from 16px */
`;

const StatsRow = styled.div`
  display: flex;
  gap: 0.75rem; /* 12px - reduced from 2.5rem */
  width: 100%;
  justify-content: space-between;

  @media (max-width: 768px) {
    gap: 0.5rem; /* 8px */
  }
`;

const StatContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: rgba(255, 255, 255, 0.05);
  padding: 0.75rem; /* 12px - reduced from 16px */
  border-radius: 0.5rem; /* 8px - reduced from 12px */
  border: 1px solid #1E1E1E;
  flex: 1;
  min-width: 0; /* Allow shrinking */
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.08);
    border-color: rgba(6, 148, 251, 0.3);
  }
`;

const StatLabel = styled.div`
  background-color: rgba(6, 148, 251, 0.17);
  display: inline-flex;
  border-radius: 0.5rem; /* 8px - reduced from 11px */
  padding: 0.25rem 0.375rem; /* 4px 6px - reduced from 6px 9px */
  margin-bottom: 0.375rem; /* 6px - reduced from 8px */
  align-items: center;
  gap: 4px; /* reduced from 6px */
`;

const LabelText = styled.p`
  margin: 0;
  font-size: 0.6875rem; /* 11px - reduced from 12px */
  color: rgba(6, 148, 251, 1);
  font-weight: 500;
`;

const StatValue = styled.h1`
  margin: 0;
  font-size: 1.5rem; /* 24px - reduced from 30px */
  font-weight: 600;
  color: rgb(255, 255, 255);
  display: flex;
  align-items: center;
  gap: 6px; /* reduced from 8px */
`;

const StatTrend = styled.div`
  display: flex;
  align-items: center;
  gap: 3px; /* reduced from 4px */
  margin-top: 3px; /* reduced from 4px */
  font-size: 0.6875rem; /* 11px - reduced from 12px */
`;

const Actions = () => {
  // Mock data for demonstration
  const stats = [
    { 
      label: "Today's Inference", 
      value: 156, 
      icon: <FaChartLine size={10} />, /* reduced from 12 */
      trend: "+12%",
      trendColor: "#28A745"
    },
    { 
      label: "Avg Inference Time", 
      value: "2.3s", 
      icon: <FaClock size={10} />, /* reduced from 12 */
      trend: "-8%",
      trendColor: "#28A745"
    },
    { 
      label: "Critical Cases", 
      value: 3, 
      icon: <FaExclamationTriangle size={10} />, /* reduced from 12 */
      trend: "+1",
      trendColor: "#DC3545"
    }
  ];

  const handleCreateCase = () => {
    // This would open a modal or navigate to case creation
    console.log('Creating new case...');
  };

  return (
    <ActionsContainer>
      <TopRow>
        <ActionButton onClick={handleCreateCase}>
          <FaPlus size={12} /> {/* reduced from 14 */}
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
  );
};

export default Actions;