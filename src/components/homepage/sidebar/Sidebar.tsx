'use client'

import React, { useState } from 'react';
import { FiHome, FiUser, FiCalendar, FiSettings, FiUsers, FiActivity, FiShield, FiFileText, FiMenu, FiX } from 'react-icons/fi';
import { RiHistoryLine } from 'react-icons/ri';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styled from 'styled-components';

const SidebarContainer = styled.div<{ $isOpen: boolean; $isCollapsed: boolean }>`
  width: 100%;
  height: 100%;
  background-color: #0C0C0C;
  border-radius: 12px;
  padding: 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-right: 1px solid #1E1E1E;
  position: relative;
  transition: width 0.3s ease;

  @media (max-width: 768px) {
    position: fixed;
    top: 0;
    left: 0;
    width: 280px;
    height: 100vh;
    z-index: 1000;
    transform: ${props => props.$isOpen ? 'translateX(0)' : 'translateX(-100%)'};
    transition: transform 0.3s ease;
    border-radius: 0;
    border-right: none;
  }

  @media (min-width: 769px) {
    width: ${props => props.$isCollapsed ? '80px' : '280px'};
    padding: ${props => props.$isCollapsed ? '20px 8px' : '20px 16px'};
  }

  @media (min-width: 1024px) {
    width: ${props => props.$isCollapsed ? '80px' : '321px'};
    padding: ${props => props.$isCollapsed ? '24px 8px' : '24px 16px'};
  }
`;

const MobileOverlay = styled.div<{ $isOpen: boolean }>`
  display: none;
  
  @media (max-width: 768px) {
    display: ${props => props.$isOpen ? 'block' : 'none'};
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
  }
`;

const MobileToggle = styled.button`
  display: none;
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  z-index: 1001;

  @media (max-width: 768px) {
    display: block;
  }
`;

const DesktopToggle = styled.button`
  display: none;
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  color: #fff;
  font-size: 18px;
  cursor: pointer;
  z-index: 1001;
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  @media (min-width: 769px) {
    display: block;
  }
`;

const Header = styled.div<{ $isCollapsed: boolean }>`
  padding: 0 12px 16px;
  border-bottom: 1px solid #1E1E1E;
  margin-bottom: 16px;

  @media (min-width: 769px) {
    padding: ${props => props.$isCollapsed ? '0 8px 12px' : '0 12px 16px'};
    margin-bottom: ${props => props.$isCollapsed ? '8px' : '16px'};
  }
`;

const Title = styled.h2<{ $isCollapsed: boolean }>`
  color: #FFFFFF;
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  transition: opacity 0.3s ease;

  @media (min-width: 640px) {
    font-size: 16px;
  }

  @media (min-width: 769px) {
    opacity: ${props => props.$isCollapsed ? 0 : 1};
    visibility: ${props => props.$isCollapsed ? 'hidden' : 'visible'};
  }
`;

const UserInfo = styled.p`
  color: #A0A0A0;
  margin: 4px 0 0 0;
  font-size: 11px;
  font-weight: 400;

  @media (min-width: 640px) {
    font-size: 12px;
  }
`;

const MenuItem = styled.div<{ $isActive: boolean; $isCollapsed: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  font-weight: 500;
  background-color: ${props => props.$isActive ? 'rgba(6,148,251,0.17)' : 'transparent'};
  color: ${props => props.$isActive ? '#0694FB' : '#A0A0A0'};
  transition: all 0.3s ease;
  cursor: pointer;
  font-size: 13px;
  position: relative;

  @media (min-width: 640px) {
    padding: 12px 16px;
    font-size: 14px;
  }

  @media (min-width: 769px) {
    padding: ${props => props.$isCollapsed ? '12px' : '12px 16px'};
    justify-content: ${props => props.$isCollapsed ? 'center' : 'flex-start'};
  }

  &:hover {
    background-color: ${props => props.$isActive ? 'rgba(6,148,251,0.17)' : 'rgba(255, 255, 255, 0.05)'};
  }

  /* Tooltip for collapsed state */
  ${props => props.$isCollapsed && `
    &::after {
      content: attr(data-tooltip);
      position: absolute;
      left: 100%;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 12px;
      white-space: nowrap;
      opacity: 0;
      visibility: hidden;
      transition: all 0.2s ease;
      z-index: 1000;
      margin-left: 8px;
    }

    &:hover::after {
      opacity: 1;
      visibility: visible;
    }
  `}
`;

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
`;

function Sidebar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getMenuItems = () => {
    const getBasePath = () => {
      if (!user) return '/dashboard';
      switch (user.role) {
        case 'admin': return '/dashboard/admin';
        case 'doctor': return '/dashboard/doctor';
        case 'radiologist': return '/dashboard/radiologist';
        case 'patient': return '/dashboard/patient';
        default: return '/dashboard';
      }
    };

    const basePath = getBasePath();

    if (!user) {
      return [
        { name: 'Dashboard', icon: <FiHome size={18} />, path: '/dashboard' },
        { name: 'Scans', icon: <FiFileText size={18} />, path: '/dashboard/scans' },
        { name: 'Analysis', icon: <FiActivity size={18} />, path: '/dashboard/analysis' },
        { name: 'Reports', icon: <FiFileText size={18} />, path: '/dashboard/reports' },
        { name: 'History', icon: <RiHistoryLine size={18} />, path: '/dashboard/history' },
        { name: 'Settings', icon: <FiSettings size={18} />, path: '/dashboard/settings' },
      ];
    }

    switch (user.role) {
      case 'admin':
        return [
          { name: 'Dashboard', icon: <FiHome size={18} />, path: `${basePath}` },
          { name: 'Users', icon: <FiUsers size={18} />, path: '/dashboard/users' },
          { name: 'System', icon: <FiShield size={18} />, path: '/dashboard/system' },
          { name: 'Scans', icon: <FiFileText size={18} />, path: `${basePath}/scans` },
          { name: 'Reports', icon: <FiFileText size={18} />, path: `${basePath}/reports` },
          { name: 'Analytics', icon: <FiActivity size={18} />, path: '/dashboard/analytics' },
          { name: 'Settings', icon: <FiSettings size={18} />, path: `${basePath}/settings` },
        ];
      case 'doctor':
        return [
          { name: 'Dashboard', icon: <FiHome size={18} />, path: `${basePath}` },
          { name: 'Patients', icon: <FiUser size={18} />, path: `${basePath}/patients` },
          { name: 'Scans', icon: <FiFileText size={18} />, path: `${basePath}/scans` },
          { name: 'Reports', icon: <FiFileText size={18} />, path: `${basePath}/reports` },
          { name: 'Schedule', icon: <FiCalendar size={18} />, path: `${basePath}/schedule` },
          { name: 'History', icon: <RiHistoryLine size={18} />, path: `${basePath}/history` },
          { name: 'Settings', icon: <FiSettings size={18} />, path: `${basePath}/settings` },
        ];
      case 'radiologist':
        return [
          { name: 'Dashboard', icon: <FiHome size={18} />, path: `${basePath}` },
          { name: 'Scans', icon: <FiFileText size={18} />, path: `${basePath}/scans` },
          { name: 'Reports', icon: <FiFileText size={18} />, path: `${basePath}/reports` },
          { name: 'History', icon: <RiHistoryLine size={18} />, path: `${basePath}/history` },
          { name: 'Settings', icon: <FiSettings size={18} />, path: `${basePath}/settings` },
        ];
      case 'patient':
        return [
          { name: 'Dashboard', icon: <FiHome size={18} />, path: `${basePath}` },
          { name: 'My Records', icon: <FiFileText size={18} />, path: '/dashboard/records' },
          { name: 'Appointments', icon: <FiCalendar size={18} />, path: '/dashboard/appointments' },
          { name: 'Results', icon: <FiActivity size={18} />, path: '/dashboard/results' },
          { name: 'History', icon: <RiHistoryLine size={18} />, path: `${basePath}/history` },
          { name: 'Settings', icon: <FiSettings size={18} />, path: `${basePath}/settings` },
        ];
      default:
        return [
          { name: 'Dashboard', icon: <FiHome size={18} />, path: '/dashboard' },
          { name: 'Scans', icon: <FiFileText size={18} />, path: '/dashboard/scans' },
          { name: 'Analysis', icon: <FiActivity size={18} />, path: '/dashboard/analysis' },
          { name: 'Reports', icon: <FiFileText size={18} />, path: '/dashboard/reports' },
          { name: 'History', icon: <RiHistoryLine size={18} />, path: '/dashboard/history' },
          { name: 'Settings', icon: <FiSettings size={18} />, path: '/dashboard/settings' },
        ];
    }
  };

  const getDashboardTitle = () => {
    if (!user) return 'Dashboard';
    
    switch (user.role) {
      case 'admin':
        return 'Admin Dashboard';
      case 'doctor':
        return 'Doctor Dashboard';
      case 'radiologist':
        return 'Radiologist Dashboard';
      case 'patient':
        return 'Patient Dashboard';
      default:
        return 'Dashboard';
    }
  };

  const menuItems = getMenuItems();

  const handleMenuItemClick = () => {
    // Close sidebar on mobile when menu item is clicked
    if (window.innerWidth <= 768) {
      setIsOpen(false);
    }
  };

  return (
    <>
      <MobileOverlay $isOpen={isOpen} onClick={() => setIsOpen(false)} />
      <SidebarContainer $isOpen={isOpen} $isCollapsed={isCollapsed}>
        <MobileToggle onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <FiX /> : <FiMenu />}
        </MobileToggle>
        
        <DesktopToggle onClick={() => setIsCollapsed(!isCollapsed)}>
          {isCollapsed ? <FiMenu /> : <FiX />}
        </DesktopToggle>
        
        <Header $isCollapsed={isCollapsed}>
          <Title $isCollapsed={isCollapsed}>{getDashboardTitle()}</Title>
          {user && !isCollapsed && (
            <UserInfo>
              {user.firstName} {user.lastName}
            </UserInfo>
          )}
        </Header>

        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          
          return (
            <Link
              key={item.name}
              href={item.path}
              style={{ textDecoration: 'none', color: 'inherit' }}
              onClick={handleMenuItemClick}
            >
              <MenuItem 
                $isActive={isActive} 
                $isCollapsed={isCollapsed}
                data-tooltip={isCollapsed ? item.name : undefined}
              >
                <IconContainer>
                  {item.icon}
                </IconContainer>
                {!isCollapsed && <span>{item.name}</span>}
              </MenuItem>
            </Link>
          );
        })}
      </SidebarContainer>
    </>
  );
}

export default Sidebar;