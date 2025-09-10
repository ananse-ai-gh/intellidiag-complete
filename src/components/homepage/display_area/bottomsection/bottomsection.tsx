import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { FaBrain, FaChartBar, FaCog, FaPlay, FaPause, FaCheck } from "react-icons/fa";
import { DashboardData } from '@/services/dashboardService';

interface Model {
  name: string;
  status: string;
  accuracy: number;
  processingTime: string;
  scansToday: number;
  totalScans: number;
}

interface ModelCardProps {
  model: Model;
}

interface BottomsectionProps {
  dashboardData: DashboardData | null;
}

const BottomSectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: 100%;
  margin-top: 10px;
  height: 18rem;
  align-items: flex-start;
`;

const SectionLabel = styled.div`
  background-color: rgba(6, 148, 251, 0.17);
  display: inline-flex;
  border-radius: 0.6875rem;
  padding: 0.375rem 0.5625rem;
`;

const LabelText = styled.p`
  margin: 0;
  font-size: 0.8125rem;
  color: rgba(6, 148, 251, 1);
  font-weight: 500;
`;

const CardsContainer = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  gap: 2.5rem;
  overflow-x: auto;
  padding-bottom: 1rem;
  scrollbar-width: thin;
  scrollbar-color: #333 transparent;

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #333;
    border-radius: 3px;
  }
`;

const Card = styled.div`
  background-color: #0c0c0c;
  height: 100%;
  min-width: 14.625rem;
  border-radius: 1.125rem;
  flex-shrink: 0;
  transition: transform 0.2s ease;
  border: 1px solid #1E1E1E;
  padding: 24px;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-4px);
    border-color: rgba(6, 148, 251, 0.3);
  }

  @media (max-width: 768px) {
    min-width: 12rem;
  }

  @media (max-width: 480px) {
    min-width: 10rem;
  }
`;

const ModelCard: React.FC<ModelCardProps> = ({ model }) => {
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return '#28A745';
      case 'idle': return '#6C757D';
      case 'processing': return '#FFC107';
      default: return '#6C757D';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <FaCheck size={12} />;
      case 'idle': return <FaPause size={12} />;
      case 'processing': return <FaPlay size={12} />;
      default: return <FaPause size={12} />;
    }
  };

  const statusColor = getStatusColor(model.status);
  const colorValues = statusColor.slice(1).match(/.{2}/g)?.map(x => parseInt(x, 16)).join(',') || '0,0,0';

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <FaBrain style={{ color: "#0694FB", fontSize: "18px" }} />
          <h3 style={{ color: "#FFFFFF", margin: 0, fontSize: "16px", fontWeight: "500" }}>
            {model.name}
          </h3>
        </div>
        <div style={{
          backgroundColor: `rgba(${colorValues}, 0.2)`,
          padding: "4px 8px",
          borderRadius: "6px",
          fontSize: "10px",
          color: statusColor,
          display: "flex",
          alignItems: "center",
          gap: "4px"
        }}>
          {getStatusIcon(model.status)}
          {model.status}
        </div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <p style={{ color: "#A0A0A0", margin: "0 0 10px 0", fontSize: "12px" }}>
          Accuracy: {model.accuracy}%
        </p>
        <div style={{
          width: "100%",
          height: "6px",
          backgroundColor: "rgba(255,255,255,0.1)",
          borderRadius: "3px",
          overflow: "hidden"
        }}>
          <div style={{
            width: `${model.accuracy}%`,
            height: "100%",
            backgroundColor: "#0694FB",
            borderRadius: "3px",
            transition: "width 0.3s ease"
          }} />
        </div>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <p style={{ color: "#A0A0A0", margin: "0 0 4px 0", fontSize: "12px" }}>
          Processing Time: {model.processingTime}
        </p>
        <p style={{ color: "#A0A0A0", margin: "0 0 4px 0", fontSize: "12px" }}>
          Scans Today: {model.scansToday}
        </p>
        <p style={{ color: "#A0A0A0", margin: "0", fontSize: "12px" }}>
          Total Scans: {model.totalScans.toLocaleString()}
        </p>
      </div>

      <div style={{ marginTop: "auto", display: "flex", gap: "8px" }}>
        <button style={{
          backgroundColor: "rgba(6,148,251,0.17)",
          border: "none",
          padding: "6px 12px",
          borderRadius: "6px",
          color: "#0694FB",
          fontSize: "11px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "4px",
          transition: "all 0.2s ease"
        }}>
          <FaCog size={10} />
          Configure
        </button>
        <button style={{
          backgroundColor: "transparent",
          border: "1px solid #333",
          padding: "6px 12px",
          borderRadius: "6px",
          color: "#A0A0A0",
          fontSize: "11px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "4px",
          transition: "all 0.2s ease"
        }}>
          <FaChartBar size={10} />
          Analytics
        </button>
      </div>
    </Card>
  );
};

const Bottomsection: React.FC<BottomsectionProps> = ({ dashboardData }) => {
  // Convert real AI model stats to the format expected by ModelCard
  const aiModels: Model[] = dashboardData?.aiModelStats ? 
    dashboardData.aiModelStats.map(stat => ({
      name: `${stat.scanType} AI`,
      status: stat.completedAnalyses > 0 ? 'active' : 'idle',
      accuracy: Math.round(stat.avgConfidence || 0),
      processingTime: `${(stat.avgProcessingTime || 0).toFixed(1)}s`,
      scansToday: stat.scansToday || 0,
      totalScans: stat.totalScans || 0
    })) : [];

  return (
    <BottomSectionContainer>
      <SectionLabel>
        <LabelText>AI Models</LabelText>
      </SectionLabel>

      {aiModels.length > 0 ? (
        <CardsContainer>
          {aiModels.map((model, index) => (
            <ModelCard key={index} model={model} />
          ))}
        </CardsContainer>
      ) : (
        <div style={{
          backgroundColor: "#0C0C0C",
          height: "100%",
          width: "100%",
          borderRadius: "18px",
          padding: "24px",
          border: "1px solid #1E1E1E",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <div style={{ textAlign: "center" }}>
            <FaBrain style={{ 
              color: "#666666", 
              fontSize: "48px", 
              marginBottom: "16px",
              opacity: "0.5"
            }} />
            <p style={{ 
              color: "#666666", 
              margin: "0", 
              fontSize: "16px",
              fontStyle: "italic"
            }}>
              No AI models available
            </p>
            <p style={{ 
              color: "#666666", 
              margin: "8px 0 0 0", 
              fontSize: "14px",
              opacity: "0.7"
            }}>
              AI models will appear here when scan data is available
            </p>
          </div>
        </div>
      )}
    </BottomSectionContainer>
  );
};

export default Bottomsection;
