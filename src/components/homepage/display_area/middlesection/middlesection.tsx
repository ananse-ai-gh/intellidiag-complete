import React from "react";
import PreviousScan from "./PreviousScan";
import Patientoverview from "./PatientOvervew";
import { DashboardData } from '@/services/dashboardService';

interface MiddlesectionProps {
  dashboardData: DashboardData | null;
}

function Middlesection({ dashboardData }: MiddlesectionProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        width: "100%",
        gap: "40px",
        height: "550px",
      }}
    >
      <PreviousScan dashboardData={dashboardData} />
      <Patientoverview dashboardData={dashboardData} />
    </div>
  );
}

export default Middlesection;
