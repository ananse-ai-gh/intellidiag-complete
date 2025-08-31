import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { FaBrain, FaChartBar, FaCog, FaPlay, FaPause, FaCheck } from "react-icons/fa";

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

const BottomSectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem; /* increased from 1rem */
  width: 100%;
  margin-top: 10px; /* increased from 5px */
  height: 18rem; /* 288px - increased from 256px */
  align-items: flex-start;
`;

const SectionLabel = styled.div`
  background-color: rgba(6, 148, 251, 0.17);
  display: inline-flex;
  border-radius: 0.6875rem; /* 11px */
  padding: 0.375rem 0.5625rem; /* 6px 9px */
`;

const LabelText = styled.p`
  margin: 0;
  font-size: 0.8125rem; /* 13px */
  color: rgba(6, 148, 251, 1);
  font-weight: 500;
`;

const CardsContainer = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  gap: 2.5rem; /* 40px - increased from 35px */
  overflow-x: auto;
  padding-bottom: 1rem; /* increased from 0.5rem */
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
  min-width: 14.625rem; /* 234px */
  border-radius: 1.125rem; /* 18px */
  flex-shrink: 0;
  transition: transform 0.2s ease;
  border: 1px solid #1E1E1E;
  padding: 24px; /* increased from 20px */
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

const Bottomsection = () => {
  // Mock AI models data
  const aiModels: Model[] = [
    {
      name: "Chest X-Ray AI",
      status: "active",
      accuracy: 94,
      processingTime: "2.3s",
      scansToday: 156,
      totalScans: 12450
    },
    {
      name: "Brain MRI AI",
      status: "processing",
      accuracy: 91,
      processingTime: "4.7s",
      scansToday: 89,
      totalScans: 8230
    },
    {
      name: "Spine CT AI",
      status: "idle",
      accuracy: 88,
      processingTime: "3.1s",
      scansToday: 67,
      totalScans: 5670
    },
    {
      name: "Cardiac Echo AI",
      status: "active",
      accuracy: 96,
      processingTime: "1.8s",
      scansToday: 234,
      totalScans: 18920
    },
    {
      name: "Lung CT AI",
      status: "processing",
      accuracy: 93,
      processingTime: "5.2s",
      scansToday: 123,
      totalScans: 9450
    },
    {
      name: "Abdominal US AI",
      status: "idle",
      accuracy: 87,
      processingTime: "2.9s",
      scansToday: 45,
      totalScans: 3420
    }
  ];

  return (
    <BottomSectionContainer>
      <SectionLabel>
        <LabelText>AI Models</LabelText>
      </SectionLabel>

      <CardsContainer>
        {aiModels.map((model, index) => (
          <ModelCard key={index} model={model} />
        ))}
      </CardsContainer>
    </BottomSectionContainer>
  );
};

export default Bottomsection;
