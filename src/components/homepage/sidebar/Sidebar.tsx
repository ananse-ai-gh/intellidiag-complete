'use client'

import React, { useState } from 'react';
import { FiHome, FiUser, FiCalendar, FiSettings, FiUsers, FiActivity, FiShield, FiFileText } from 'react-icons/fi';
import { RiHistoryLine } from 'react-icons/ri';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

function Sidebar() {
  const { user } = useAuth();
  const pathname = usePathname();

  const getMenuItems = () => {
    if (!user) {
      return [
        { name: 'Dashboard', icon: <FiHome size={20} />, path: '/dashboard' },
        { name: 'Cases', icon: <FiUser size={20} />, path: '/dashboard/cases' },
        { name: 'History', icon: <RiHistoryLine size={20} />, path: '/dashboard/history' },
        { name: 'Settings', icon: <FiSettings size={20} />, path: '/dashboard/settings' },
      ];
    }

    switch (user.role) {
      case 'admin':
        return [
          { name: 'Dashboard', icon: <FiHome size={20} />, path: '/dashboard/admin' },
          { name: 'Users', icon: <FiUsers size={20} />, path: '/dashboard/users' },
          { name: 'System', icon: <FiShield size={20} />, path: '/dashboard/system' },
          { name: 'Analytics', icon: <FiActivity size={20} />, path: '/dashboard/analytics' },
          { name: 'Reports', icon: <FiFileText size={20} />, path: '/dashboard/reports' },
          { name: 'Settings', icon: <FiSettings size={20} />, path: '/dashboard/settings' },
        ];
      case 'doctor':
        return [
          { name: 'Dashboard', icon: <FiHome size={20} />, path: '/dashboard/doctor' },
          { name: 'Patients', icon: <FiUser size={20} />, path: '/dashboard/patients' },
          { name: 'Cases', icon: <FiFileText size={20} />, path: '/dashboard/cases' },
          { name: 'Schedule', icon: <FiCalendar size={20} />, path: '/dashboard/schedule' },
          { name: 'History', icon: <RiHistoryLine size={20} />, path: '/dashboard/history' },
          { name: 'Settings', icon: <FiSettings size={20} />, path: '/dashboard/settings' },
        ];
      case 'radiologist':
        return [
          { name: 'Dashboard', icon: <FiHome size={20} />, path: '/dashboard/radiologist' },
          { name: 'Scans', icon: <FiFileText size={20} />, path: '/dashboard/scans' },
          { name: 'Analysis', icon: <FiActivity size={20} />, path: '/dashboard/analysis' },
          { name: 'Reports', icon: <FiFileText size={20} />, path: '/dashboard/reports' },
          { name: 'History', icon: <RiHistoryLine size={20} />, path: '/dashboard/history' },
          { name: 'Settings', icon: <FiSettings size={20} />, path: '/dashboard/settings' },
        ];
      case 'patient':
        return [
          { name: 'Dashboard', icon: <FiHome size={20} />, path: '/dashboard/patient' },
          { name: 'My Records', icon: <FiFileText size={20} />, path: '/dashboard/records' },
          { name: 'Appointments', icon: <FiCalendar size={20} />, path: '/dashboard/appointments' },
          { name: 'Results', icon: <FiActivity size={20} />, path: '/dashboard/results' },
          { name: 'History', icon: <RiHistoryLine size={20} />, path: '/dashboard/history' },
          { name: 'Settings', icon: <FiSettings size={20} />, path: '/dashboard/settings' },
        ];
      default:
        return [
          { name: 'Dashboard', icon: <FiHome size={20} />, path: '/dashboard' },
          { name: 'Cases', icon: <FiUser size={20} />, path: '/dashboard/cases' },
          { name: 'History', icon: <RiHistoryLine size={20} />, path: '/dashboard/history' },
          { name: 'Settings', icon: <FiSettings size={20} />, path: '/dashboard/settings' },
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

  return (
    <div
      style={{
        width: '321px',
        height: '100%',
        backgroundColor: '#0C0C0C',
        borderRadius: '12px',
        padding: '24px 16px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        borderRight: '1px solid #1E1E1E',
      }}
    >
      <div
        style={{
          padding: '0 12px 16px',
          borderBottom: '1px solid #1E1E1E',
          marginBottom: '16px',
        }}
      >
        <h2
          style={{
            color: '#FFFFFF',
            margin: 0,
            fontSize: '16px',
            fontWeight: '500',
          }}
        >
          {getDashboardTitle()}
        </h2>
        {user && (
          <p
            style={{
              color: '#A0A0A0',
              margin: '4px 0 0 0',
              fontSize: '12px',
              fontWeight: '400',
            }}
          >
            {user.specialization ? `${user.specialization}` : user.role}
          </p>
        )}
      </div>

      {menuItems.map((item) => {
        const isActive = pathname === item.path;
        
        return (
          <Link
            key={item.name}
            href={item.path}
            style={{
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '8px',
                fontWeight: '500',
                backgroundColor: isActive ? 'rgba(6,148,251,0.17)' : 'transparent',
                color: isActive ? '#0694FB' : '#A0A0A0',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '24px',
                  height: '24px',
                }}
              >
                {item.icon}
              </div>
              <span
                style={{
                  fontSize: '15px',
                  fontWeight: '400',
                }}
              >
                {item.name}
              </span>
            </div>
          </Link>
        );
      })}

      <div
        style={{
          marginTop: 'auto',
          padding: '16px 12px 0',
          borderTop: '1px solid #1E1E1E',
          color: '#A0A0A0',
          fontSize: '13px',
        }}
      >
        © 2025 intelliDiag
      </div>
    </div>
  );
}

export default Sidebar;
