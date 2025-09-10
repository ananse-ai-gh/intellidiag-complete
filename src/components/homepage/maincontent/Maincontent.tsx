import React from "react";
import Sidebar from "../sidebar/Sidebar";
import PageContent from "../display_area/PageContent";
import { DashboardData } from '@/services/dashboardService';

interface MaincontentProps {
  dashboardData: DashboardData | null;
}

function Maincontent({ dashboardData }: MaincontentProps) {
  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "row",
        gap: "30px",
        boxSizing: "border-box",
        marginTop: "15px",
      }}
    >
      <Sidebar />
      <PageContent dashboardData={dashboardData} />
    </div>
  );
}

export default Maincontent;
