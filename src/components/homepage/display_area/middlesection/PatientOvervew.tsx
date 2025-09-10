import React from "react";
import { FaUser, FaCalendar, FaFileAlt, FaChartLine, FaExclamationTriangle } from "react-icons/fa";
import { DashboardData } from '@/services/dashboardService';

interface PatientoverviewProps {
  dashboardData: DashboardData | null;
}

function Patientoverview({ dashboardData }: PatientoverviewProps) {
  // Use real data from dashboard or show default/empty values
  const patientStats = dashboardData?.overview ? {
    totalPatients: dashboardData.overview.totalPatients,
    activeCases: dashboardData.overview.activeCases,
    pendingScans: dashboardData.overview.pendingScans,
    criticalCases: dashboardData.overview.criticalCases
  } : {
    totalPatients: 0,
    activeCases: 0,
    pendingScans: 0,
    criticalCases: 0
  };

  const recentCases = dashboardData?.recentCases ? 
    dashboardData.recentCases.map(caseItem => ({
      id: caseItem.scanId,
      patient: `${caseItem.patientFirstName} ${caseItem.patientLastName}`,
      scanType: caseItem.scanType,
      status: caseItem.status,
      priority: caseItem.priority
    })) : [];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        alignItems: "flex-start",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
          justifyContent: "space-between",
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
            Patient / Case Overview
          </p>
        </div>
        <p
          style={{
            margin: "0px",
            fontSize: "13px",
            color: "rgba(6,148,251,1)",
            cursor: "pointer",
          }}
        >
          View All
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
        {/* Stats Grid */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "1fr 1fr", 
          gap: "16px", 
          marginBottom: "24px" 
        }}>
          <div style={{
            backgroundColor: "rgba(6,148,251,0.1)",
            padding: "16px",
            borderRadius: "12px",
            border: "1px solid rgba(6,148,251,0.2)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <FaUser style={{ color: "#0694FB", fontSize: "16px" }} />
              <span style={{ color: "#A0A0A0", fontSize: "12px" }}>Total Patients</span>
            </div>
            <span style={{ color: "#FFFFFF", fontSize: "24px", fontWeight: "600" }}>
              {patientStats.totalPatients.toLocaleString()}
            </span>
          </div>

          <div style={{
            backgroundColor: "rgba(255,193,7,0.1)",
            padding: "16px",
            borderRadius: "12px",
            border: "1px solid rgba(255,193,7,0.2)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <FaFileAlt style={{ color: "#FFC107", fontSize: "16px" }} />
              <span style={{ color: "#A0A0A0", fontSize: "12px" }}>Active Cases</span>
            </div>
            <span style={{ color: "#FFFFFF", fontSize: "24px", fontWeight: "600" }}>
              {patientStats.activeCases}
            </span>
          </div>

          <div style={{
            backgroundColor: "rgba(220,53,69,0.1)",
            padding: "16px",
            borderRadius: "12px",
            border: "1px solid rgba(220,53,69,0.2)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <FaExclamationTriangle style={{ color: "#DC3545", fontSize: "16px" }} />
              <span style={{ color: "#A0A0A0", fontSize: "12px" }}>Critical Cases</span>
            </div>
            <span style={{ color: "#FFFFFF", fontSize: "24px", fontWeight: "600" }}>
              {patientStats.criticalCases}
            </span>
          </div>

          <div style={{
            backgroundColor: "rgba(40,167,69,0.1)",
            padding: "16px",
            borderRadius: "12px",
            border: "1px solid rgba(40,167,69,0.2)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <FaChartLine style={{ color: "#28A745", fontSize: "16px" }} />
              <span style={{ color: "#A0A0A0", fontSize: "12px" }}>Pending Scans</span>
            </div>
            <span style={{ color: "#FFFFFF", fontSize: "24px", fontWeight: "600" }}>
              {patientStats.pendingScans}
            </span>
          </div>
        </div>

        {/* Recent Cases */}
        <div>
          <h3 style={{ color: "#FFFFFF", margin: "0 0 16px 0", fontSize: "16px", fontWeight: "500" }}>
            Recent Cases
          </h3>
          {recentCases.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {recentCases.map((caseItem, index) => (
                <div key={index} style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #1E1E1E"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <p style={{ color: "#FFFFFF", margin: "0 0 4px 0", fontSize: "14px", fontWeight: "500" }}>
                        {caseItem.patient}
                      </p>
                      <p style={{ color: "#A0A0A0", margin: "0", fontSize: "12px" }}>
                        {caseItem.scanType} • {caseItem.id}
                      </p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{
                        backgroundColor: 
                          caseItem.priority === "urgent" || caseItem.priority === "High" ? "rgba(220,53,69,0.2)" :
                          caseItem.priority === "medium" || caseItem.priority === "Medium" ? "rgba(255,193,7,0.2)" :
                          "rgba(40,167,69,0.2)",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "10px",
                        color: 
                          caseItem.priority === "urgent" || caseItem.priority === "High" ? "#DC3545" :
                          caseItem.priority === "medium" || caseItem.priority === "Medium" ? "#FFC107" :
                          "#28A745"
                      }}>
                        {caseItem.priority}
                      </div>
                      <div style={{
                        backgroundColor: 
                          caseItem.status === "completed" || caseItem.status === "Completed" ? "rgba(40,167,69,0.2)" :
                          caseItem.status === "analyzing" || caseItem.status === "In Progress" ? "rgba(255,193,7,0.2)" :
                          "rgba(108,117,125,0.2)",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "10px",
                        color: 
                          caseItem.status === "completed" || caseItem.status === "Completed" ? "#28A745" :
                          caseItem.status === "analyzing" || caseItem.status === "In Progress" ? "#FFC107" :
                          "#6C757D"
                      }}>
                        {caseItem.status}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              backgroundColor: "rgba(255,255,255,0.05)",
              padding: "24px",
              borderRadius: "8px",
              border: "1px solid #1E1E1E",
              textAlign: "center"
            }}>
              <p style={{ 
                color: "#666666", 
                margin: "0", 
                fontSize: "14px",
                fontStyle: "italic"
              }}>
                No recent cases available
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Patientoverview;
