'use client'

import { useEffect, useState } from 'react';
import Appbar from "./appbar/appbar";
import Maincontent from "./maincontent/Maincontent";
import { dashboardService, DashboardData } from '@/services/dashboardService';
import { useAuth } from '@/contexts/AuthContext';
import CustomCursor from '@/components/cursor';

function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await dashboardService.getDashboardData();
        setDashboardData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  if (loading) {
    return (
      <div
        style={{
          margin: 0,
          padding: 0,
          height: "100vh",
          backgroundColor: "black",
          width: "100%",
          fontFamily: "var(--font-primary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CustomCursor />
        <div style={{ textAlign: "center", color: "white" }}>
          <div style={{
            width: "40px",
            height: "40px",
            border: "3px solid #0694FB",
            borderTop: "3px solid transparent",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 20px"
          }}></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          margin: 0,
          padding: 0,
          height: "100vh",
          backgroundColor: "black",
          width: "100%",
          fontFamily: "var(--font-primary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CustomCursor />
        <div style={{ textAlign: "center", color: "white" }}>
          <p style={{ color: "#DC3545", marginBottom: "20px" }}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: "#0694FB",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "6px",
              cursor: "pointer"
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        margin: 0,
        padding: 0,
        minHeight: "100vh",
        backgroundColor: "black",
        width: "100%",
        fontFamily: "var(--font-primary)",
        overflow: "hidden"
      }}
    >
      <CustomCursor />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "24px",
          width: "100%",
          boxSizing: "border-box",
          height: "100%",
          overflow: "hidden"
        }}
      >
        <Appbar />
        <Maincontent dashboardData={dashboardData} />
      </div>
    </div>
  );
}

export default Dashboard;
