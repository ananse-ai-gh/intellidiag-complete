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

function PageContent() {
  const pathname = usePathname();

  // Check if we're on a specific page route
  const isOnSpecificPage = pathname.includes('/patients') || 
                          pathname.includes('/cases') || 
                          pathname.includes('/schedule') || 
                          pathname.includes('/history') || 
                          pathname.includes('/settings');

  // If we're on a specific page, render that page content
  if (isOnSpecificPage) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          overflow: 'auto',
        }}
      >
        {pathname.includes('/patients') && <PatientsContent />}
        {pathname.includes('/cases') && <CasesContent />}
        {pathname.includes('/schedule') && <ScheduleContent />}
        {pathname.includes('/history') && <HistoryContent />}
        {pathname.includes('/settings') && <SettingsContent />}
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
      <Topsection />
      <Middlesection />
      <Bottomsection />
    </div>
  );
}

export default PageContent;
