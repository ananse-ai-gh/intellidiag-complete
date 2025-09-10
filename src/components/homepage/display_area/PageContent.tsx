'use client'

import React from 'react';
import { usePathname } from 'next/navigation';
import Topsection from "./topsection/Topsection";
import Middlesection from "./middlesection/middlesection";
import Bottomsection from "./bottomsection/bottomsection";
import PatientsContent from './pages/PatientsContent';
import CasesContent from './pages/CasesContent';
import ScheduleContent from './pages/ScheduleContent';
import HistoryContent from './pages/HistoryContent';
import SettingsContent from './pages/SettingsContent';
import ScansContent from './pages/ScansContentRedesigned';
import AnalysisContent from './pages/AnalysisContent';
import ReportsContent from './pages/ReportsContent';
import { DashboardData } from '@/services/dashboardService';

interface PageContentProps {
  dashboardData: DashboardData | null;
}

function PageContent({ dashboardData }: PageContentProps) {
  const pathname = usePathname();

  // Check if we're on a specific page route
  const isOnSpecificPage = pathname.includes('/patients') || 
                          pathname.includes('/cases') || 
                          pathname.includes('/schedule') || 
                          pathname.includes('/history') || 
                          pathname.includes('/settings') ||
                          pathname.includes('/scans') ||
                          pathname.includes('/analysis') ||
                          pathname.includes('/reports');

  // Extract the specific page from the pathname
  const getCurrentPage = () => {
    if (pathname.includes('/patients')) return 'patients';
    if (pathname.includes('/cases')) return 'cases';
    if (pathname.includes('/schedule')) return 'schedule';
    if (pathname.includes('/history')) return 'history';
    if (pathname.includes('/settings')) return 'settings';
    if (pathname.includes('/scans')) return 'scans';
    if (pathname.includes('/analysis')) return 'analysis';
    if (pathname.includes('/reports')) return 'reports';
    return null;
  };

  // If we're on a specific page, render that page content
  if (isOnSpecificPage) {
    const currentPage = getCurrentPage();
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          overflow: 'auto',
        }}
      >
        {currentPage === 'patients' && <PatientsContent />}
        {currentPage === 'cases' && <CasesContent />}
        {currentPage === 'schedule' && <ScheduleContent />}
        {currentPage === 'history' && <HistoryContent />}
        {currentPage === 'settings' && <SettingsContent />}
        {currentPage === 'scans' && <ScansContent />}
        {currentPage === 'analysis' && <AnalysisContent />}
        {currentPage === 'reports' && <ReportsContent />}
      </div>
    );
  }

  // Otherwise, render the default dashboard content
  return (
    <div
      style={{
        boxSizing: "border-box",
        width: "90%",
        height: "95%",
        marginTop: "20px",
        gap: "40px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "stretch",
      }}
    >
      <Topsection dashboardData={dashboardData} />
      <Middlesection dashboardData={dashboardData} />
      <Bottomsection dashboardData={dashboardData} />
    </div>
  );
}

export default PageContent;
