'use client'

import React, { useState, useRef, useEffect } from "react";
import { FaBell, FaSignOutAlt, FaUser, FaCog, FaChevronDown, FaTimes } from "react-icons/fa";
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';

const NotificationBadge = styled.div`
  position: absolute;
  top: 4px;
  right: 4px;
  width: 8px;
  height: 8px;
  background-color: #0694FB;
  border-radius: 50%;
  animation: pulse 2s infinite;

  @keyframes pulse {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.2); opacity: 0.7; }
    100% { transform: scale(1); opacity: 1; }
  }
`;

const NotificationPanel = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 100%;
  right: 0;
  width: 320px;
  max-height: 400px;
  background-color: #1A1A1A;
  border: 1px solid #333;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  z-index: 1000;
  opacity: ${props => props.isOpen ? 1 : 0};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transform: ${props => props.isOpen ? 'translateY(8px)' : 'translateY(-8px)'};
  transition: all 0.3s ease;
  overflow: hidden;
`;

const NotificationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #333;
  background-color: #0D0D0D;
`;

const NotificationTitle = styled.h3`
  margin: 0;
  color: #FFFFFF;
  font-size: 16px;
  font-weight: 600;
`;

const ClearButton = styled.button`
  background: none;
  border: none;
  color: #0694FB;
  font-size: 12px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(6, 148, 251, 0.1);
  }
`;

const NotificationList = styled.div`
  max-height: 300px;
  overflow-y: auto;
  padding: 8px 0;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #333;
    border-radius: 2px;
  }
`;

const NotificationItem = styled.div`
  padding: 12px 20px;
  border-bottom: 1px solid #2A2A2A;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }

  &:last-child {
    border-bottom: none;
  }
`;

const NotificationContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const NotificationText = styled.p`
  margin: 0;
  color: #FFFFFF;
  font-size: 14px;
  line-height: 1.4;
`;

const NotificationTime = styled.span`
  color: #A0A0A0;
  font-size: 12px;
`;

const NotificationEmpty = styled.div`
  padding: 40px 20px;
  text-align: center;
  color: #A0A0A0;
  font-size: 14px;
`;

const AvatarDropdown = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 100%;
  right: 0;
  width: 240px;
  background-color: #1A1A1A;
  border: 1px solid #333;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  z-index: 1000;
  opacity: ${props => props.isOpen ? 1 : 0};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transform: ${props => props.isOpen ? 'translateY(8px)' : 'translateY(-8px)'};
  transition: all 0.3s ease;
  overflow: hidden;
`;

const DropdownHeader = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid #333;
  background-color: #0D0D0D;
`;

const DropdownUserInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const DropdownUserName = styled.span`
  color: #FFFFFF;
  font-size: 14px;
  font-weight: 600;
`;

const DropdownUserRole = styled.span`
  color: #A0A0A0;
  font-size: 12px;
`;

const DropdownMenu = styled.div`
  padding: 8px 0;
`;

const DropdownItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  color: #FFFFFF;
  font-size: 14px;

  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }

  &.danger {
    color: #FF6B6B;
    
    &:hover {
      background-color: rgba(255, 107, 107, 0.1);
    }
  }
`;

const DropdownIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
`;

function Appbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [avatarDropdownOpen, setAvatarDropdownOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);

  // Mock notifications data
  const [notifications] = useState([
    {
      id: 1,
      message: "New scan uploaded for patient Sarah Johnson",
      time: "2 minutes ago",
      read: false
    },
    {
      id: 2,
      message: "AI analysis completed for Chest X-Ray scan",
      time: "15 minutes ago",
      read: false
    },
    {
      id: 3,
      message: "System maintenance scheduled for tonight",
      time: "1 hour ago",
      read: true
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getUserInitials = () => {
    if (!user) return 'U';
    return `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getUserDisplayName = () => {
    if (!user) return 'User';
    
    const title = user.role === 'doctor' || user.role === 'radiologist' ? 'Dr.' : '';
    return `${title} ${user.firstName} ${user.lastName}`.trim();
  };

  const getRoleDisplayName = () => {
    if (!user) return 'User';
    
    switch (user.role) {
      case 'admin':
        return 'Administrator';
      case 'doctor':
        return 'Doctor';
      case 'radiologist':
        return 'Radiologist';
      case 'patient':
        return 'Patient';
      default:
        return 'User';
    }
  };

  const handleSignOut = () => {
    logout(); // This will redirect to homepage
  };

  const clearNotifications = () => {
    // In a real app, this would clear notifications from the backend
    console.log('Clearing notifications...');
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (avatarRef.current && !avatarRef.current.contains(event.target as Node)) {
        setAvatarDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      style={{
        backgroundColor: "#0D0D0D",
        padding: "15px 27px",
        width: "100%",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        boxSizing: "border-box",
        borderRadius: "15px",
      }}
    >
      <div
        style={{
          height: "42px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Link href="/">
          <img
            style={{
              cursor: "pointer",
            }}
            src="/intellidiag.png"
            alt="IntelliDiag Logo"
            height="22px"
          />
        </Link>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: "20px",
        }}
      >
        {/* Notification Bell */}
        <div
          ref={notificationRef}
          style={{
            position: "relative",
            cursor: "pointer",
            padding: "8px",
            borderRadius: "8px",
            transition: "background-color 0.3s ease",
          }}
          onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
          onClick={() => setNotificationsOpen(!notificationsOpen)}
        >
          <FaBell
            style={{
              color: "#A0A0A0",
              fontSize: "18px",
            }}
          />
          {unreadCount > 0 && <NotificationBadge />}
          
          <NotificationPanel isOpen={notificationsOpen}>
            <NotificationHeader>
              <NotificationTitle>Notifications</NotificationTitle>
              <ClearButton onClick={clearNotifications}>
                Clear all
              </ClearButton>
            </NotificationHeader>
            <NotificationList>
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <NotificationItem key={notification.id}>
                    <NotificationContent>
                      <NotificationText>{notification.message}</NotificationText>
                      <NotificationTime>{notification.time}</NotificationTime>
                    </NotificationContent>
                  </NotificationItem>
                ))
              ) : (
                <NotificationEmpty>
                  No notifications
                </NotificationEmpty>
              )}
            </NotificationList>
          </NotificationPanel>
        </div>

        {/* Avatar and Dropdown */}
        <div
          ref={avatarRef}
          style={{
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              cursor: "pointer",
              padding: "8px 12px",
              borderRadius: "8px",
              transition: "background-color 0.3s ease",
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
            onClick={() => setAvatarDropdownOpen(!avatarDropdownOpen)}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                backgroundColor: "#0694FB",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              {getUserInitials()}
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  color: "#FFFFFF",
                  fontSize: "14px",
                  fontWeight: "500",
                  lineHeight: "1.2",
                }}
              >
                {getUserDisplayName()}
              </span>
              <span
                style={{
                  color: "#A0A0A0",
                  fontSize: "12px",
                  fontWeight: "400",
                  lineHeight: "1.2",
                }}
              >
                {getRoleDisplayName()}
                {user?.specialization && ` • ${user.specialization}`}
              </span>
            </div>
            <FaChevronDown
              style={{
                color: "#A0A0A0",
                fontSize: "12px",
                transition: "transform 0.3s ease",
                transform: avatarDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
              }}
            />
          </div>

          <AvatarDropdown isOpen={avatarDropdownOpen}>
            <DropdownHeader>
              <DropdownUserInfo>
                <DropdownUserName>{getUserDisplayName()}</DropdownUserName>
                <DropdownUserRole>
                  {getRoleDisplayName()}
                  {user?.specialization && ` • ${user.specialization}`}
                </DropdownUserRole>
              </DropdownUserInfo>
            </DropdownHeader>
            <DropdownMenu>
              <DropdownItem>
                <DropdownIcon>
                  <FaUser size={12} />
                </DropdownIcon>
                Profile
              </DropdownItem>
              <DropdownItem>
                <DropdownIcon>
                  <FaCog size={12} />
                </DropdownIcon>
                Settings
              </DropdownItem>
              <DropdownItem className="danger" onClick={handleSignOut}>
                <DropdownIcon>
                  <FaSignOutAlt size={12} />
                </DropdownIcon>
                Sign Out
              </DropdownItem>
            </DropdownMenu>
          </AvatarDropdown>
        </div>
      </div>
    </div>
  );
}

export default Appbar;
