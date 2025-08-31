import React from "react";
import { FaEye, FaDownload, FaShare, FaCalendar } from "react-icons/fa";

function PreviousScan() {
  // Mock data for demonstration
  const recentScan = {
    patientName: "Sarah Johnson",
    scanType: "Chest X-Ray",
    date: "2024-08-28",
    status: "Completed",
    findings: "Normal cardiac silhouette, clear lung fields",
    confidence: 94
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        width: "40%",
        height: "100%",
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(6,148,251,0.17)",
          display: "inline-flex",
          borderRadius: "11px",
          padding: "6px 9px",
        }}
      >
        <p
          style={{
            margin: "0px",
            fontSize: "13px",
            color: "rgba(6,148,251,1)",
          }}
        >
          Previously Viewed Scan
        </p>
      </div>
      <div
        style={{
          backgroundColor: "#0C0C0C",
          height: "100%",
          width: "100%",
          borderRadius: "18px",
          padding: "24px",
          border: "1px solid #1E1E1E",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
          <div>
            <h3 style={{ color: "#FFFFFF", margin: "0 0 8px 0", fontSize: "18px", fontWeight: "500" }}>
              {recentScan.patientName}
            </h3>
            <p style={{ color: "#A0A0A0", margin: "0", fontSize: "14px" }}>
              {recentScan.scanType}
            </p>
          </div>
          <div style={{ 
            backgroundColor: "rgba(6,148,251,0.17)", 
            padding: "4px 8px", 
            borderRadius: "6px",
            fontSize: "12px",
            color: "#0694FB"
          }}>
            {recentScan.status}
          </div>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <FaCalendar style={{ color: "#A0A0A0", fontSize: "14px" }} />
            <span style={{ color: "#A0A0A0", fontSize: "14px" }}>
              {new Date(recentScan.date).toLocaleDateString()}
            </span>
          </div>
          
          <div style={{ marginBottom: "16px" }}>
            <p style={{ color: "#FFFFFF", margin: "0 0 8px 0", fontSize: "14px", fontWeight: "500" }}>
              AI Findings:
            </p>
            <p style={{ color: "#A0A0A0", margin: "0", fontSize: "13px", lineHeight: "1.4" }}>
              {recentScan.findings}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ 
              backgroundColor: "rgba(6,148,251,0.17)", 
              padding: "6px 12px", 
              borderRadius: "8px",
              fontSize: "12px",
              color: "#0694FB"
            }}>
              Confidence: {recentScan.confidence}%
            </div>
          </div>
        </div>

        <div style={{ 
          display: "flex", 
          gap: "12px", 
          marginTop: "auto",
          paddingTop: "20px",
          borderTop: "1px solid #1E1E1E"
        }}>
          <button style={{
            backgroundColor: "rgba(6,148,251,0.17)",
            border: "none",
            padding: "8px 12px",
            borderRadius: "6px",
            color: "#0694FB",
            fontSize: "12px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            transition: "all 0.2s ease"
          }}>
            <FaEye size={12} />
            View
          </button>
          <button style={{
            backgroundColor: "transparent",
            border: "1px solid #333",
            padding: "8px 12px",
            borderRadius: "6px",
            color: "#A0A0A0",
            fontSize: "12px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            transition: "all 0.2s ease"
          }}>
            <FaDownload size={12} />
            Download
          </button>
          <button style={{
            backgroundColor: "transparent",
            border: "1px solid #333",
            padding: "8px 12px",
            borderRadius: "6px",
            color: "#A0A0A0",
            fontSize: "12px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            transition: "all 0.2s ease"
          }}>
            <FaShare size={12} />
            Share
          </button>
        </div>
      </div>
    </div>
  );
}

export default PreviousScan;
