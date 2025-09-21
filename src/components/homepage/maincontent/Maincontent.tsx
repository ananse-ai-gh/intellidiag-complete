import React from "react";
import Sidebar from "../sidebar/Sidebar";
import PageContent from "../display_area/PageContent";
import { DashboardData } from '@/services/dashboardService';
import styled from 'styled-components';

interface MaincontentProps {
  dashboardData: DashboardData | null;
}

const MainContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-sizing: border-box;
  margin-top: 8px;
  padding: 0 16px;

  @media (min-width: 640px) {
    margin-top: 12px;
    padding: 0 20px;
    gap: 20px;
  }

  @media (min-width: 768px) {
    flex-direction: row;
    gap: 24px;
    margin-top: 12px;
    padding: 0;
  }
`;

const ContentArea = styled.div`
  flex: 1;
  min-height: 0; /* allow child to size and scroll */
  overflow: auto; /* single scroll container */
  display: flex;
  flex-direction: column;
`;

function Maincontent({ dashboardData }: MaincontentProps) {
  return (
    <MainContainer>
      <Sidebar />
      <ContentArea>
        <PageContent dashboardData={dashboardData} />
      </ContentArea>
    </MainContainer>
  );
}

export default Maincontent;
