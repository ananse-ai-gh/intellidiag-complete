import React from 'react';
import styled from 'styled-components';
import { FaHistory, FaCalendar, FaFileAlt, FaUser, FaBrain } from 'react-icons/fa';

const HistoryContainer = styled.div`
  padding: 24px;
  background-color: transparent;
  min-height: 100vh;
  color: #FFFFFF;
  width: 100%;
`;

const HistoryTitle = styled.h2`
  color: #FFFFFF;
  margin-bottom: 32px;
  font-size: 28px;
  font-weight: 600;
  font-family: var(--font-primary);
  display: flex;
  align-items: center;
  gap: 12px;
`;

const HistoryItem = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-left: 4px solid #0694fb;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(6, 148, 251, 0.1);
  }
`;

const HistoryDate = styled.div`
  color: #A0A0A0;
  font-size: 14px;
  margin-bottom: 8px;
  font-family: var(--font-primary);
  display: flex;
  align-items: center;
  gap: 8px;
`;

const HistoryDescription = styled.div`
  color: #FFFFFF;
  font-size: 16px;
  line-height: 1.5;
  font-family: var(--font-primary);
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #A0A0A0;
  font-family: var(--font-primary);
`;

const HistoryIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0694FB, #0094ff);
  color: white;
  font-size: 16px;
  margin-right: 16px;
`;

const HistoryContentWrapper = styled.div`
  display: flex;
  align-items: flex-start;
`;

const HistoryContent: React.FC = () => {
  // Mock data - replace with actual API call
  const historyItems = [
    {
      id: 1,
      date: '2024-01-15',
      description: 'Patient John Doe - X-Ray scan completed',
      type: 'scan',
      icon: <FaFileAlt />
    },
    {
      id: 2,
      date: '2024-01-14',
      description: 'Patient Jane Smith - MRI scan analyzed',
      type: 'analysis',
      icon: <FaBrain />
    },
    {
      id: 3,
      date: '2024-01-13',
      description: 'Patient Mike Johnson - CT scan uploaded',
      type: 'scan',
      icon: <FaFileAlt />
    },
    {
      id: 4,
      date: '2024-01-12',
      description: 'New patient Sarah Wilson registered',
      type: 'patient',
      icon: <FaUser />
    },
    {
      id: 5,
      date: '2024-01-11',
      description: 'Report generated for Patient Robert Brown',
      type: 'report',
      icon: <FaFileAlt />
    }
  ];

  const getIconColor = (type: string) => {
    switch (type) {
      case 'scan':
        return '#0694FB';
      case 'analysis':
        return '#28A745';
      case 'patient':
        return '#FFC107';
      case 'report':
        return '#DC3545';
      default:
        return '#0694FB';
    }
  };

  return (
    <HistoryContainer>
      <HistoryTitle>
        <FaHistory />
        Activity History
      </HistoryTitle>
      {historyItems.length > 0 ? (
        historyItems.map((item) => (
          <HistoryItem key={item.id}>
            <HistoryContentWrapper>
              <HistoryIcon style={{ background: `linear-gradient(135deg, ${getIconColor(item.type)}, ${getIconColor(item.type)}80)` }}>
                {item.icon}
              </HistoryIcon>
              <div>
                <HistoryDate>
                  <FaCalendar />
                  {item.date}
                </HistoryDate>
                <HistoryDescription>{item.description}</HistoryDescription>
              </div>
            </HistoryContentWrapper>
          </HistoryItem>
        ))
      ) : (
        <EmptyState>
          <FaHistory size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
          <p>No activity history available</p>
        </EmptyState>
      )}
    </HistoryContainer>
  );
};

export default HistoryContent;
