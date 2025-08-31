import React from 'react';
import styled from 'styled-components';

const HistoryContainer = styled.div`
  padding: 20px;
  height: 100%;
  overflow-y: auto;
`;

const HistoryTitle = styled.h2`
  color: #333;
  margin-bottom: 20px;
  font-size: 24px;
  font-weight: 600;
`;

const HistoryItem = styled.div`
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #007bff;
`;

const HistoryDate = styled.div`
  color: #666;
  font-size: 14px;
  margin-bottom: 8px;
`;

const HistoryDescription = styled.div`
  color: #333;
  font-size: 16px;
  line-height: 1.5;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: #666;
`;

const HistoryContent: React.FC = () => {
  // Mock data - replace with actual API call
  const historyItems = [
    {
      id: 1,
      date: '2024-01-15',
      description: 'Patient John Doe - X-Ray scan completed'
    },
    {
      id: 2,
      date: '2024-01-14',
      description: 'Patient Jane Smith - MRI scan analyzed'
    },
    {
      id: 3,
      date: '2024-01-13',
      description: 'Patient Mike Johnson - CT scan uploaded'
    }
  ];

  return (
    <HistoryContainer>
      <HistoryTitle>Activity History</HistoryTitle>
      {historyItems.length > 0 ? (
        historyItems.map((item) => (
          <HistoryItem key={item.id}>
            <HistoryDate>{item.date}</HistoryDate>
            <HistoryDescription>{item.description}</HistoryDescription>
          </HistoryItem>
        ))
      ) : (
        <EmptyState>
          <p>No activity history available</p>
        </EmptyState>
      )}
    </HistoryContainer>
  );
};

export default HistoryContent;
