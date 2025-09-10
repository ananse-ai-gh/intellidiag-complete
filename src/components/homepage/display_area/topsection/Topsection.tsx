import React from "react";
import Greeting from "./greeting";
import Actions from "./actions";
import { DashboardData } from '@/services/dashboardService';

interface TopsectionProps {
  dashboardData: DashboardData | null;
}

function Topsection({ dashboardData }: TopsectionProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        width: "100%",
        justifyContent: "space-between",
      }}
    >
      <Greeting />
      <Actions dashboardData={dashboardData} />
    </div>
  );
}

export default Topsection;
