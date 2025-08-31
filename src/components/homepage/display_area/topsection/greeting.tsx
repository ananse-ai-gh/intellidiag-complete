import React from 'react';
import styled from 'styled-components';
import { useAuth } from '@/contexts/AuthContext';

const GreetingContainer = styled.div`
  width: 100%;
  max-width: 32.8125rem; /* 493px */
  display: flex;
  flex-direction: column;
  gap: 0.25rem; /* 4px - reduced from 9px */
  margin: 0;
  padding: 0.5rem; /* reduced from 1rem */
  box-sizing: border-box;
`;

const DateText = styled.p`
  margin: 0;
  color: #ffffff;
  font-size: 0.75rem; /* 12px - reduced from 14px */
  line-height: 1.2; /* reduced from 1.4 */
  opacity: 0.8;
`;

const GreetingText = styled.h1`
  margin: 0;
  color: #ffffff;
  font-weight: 500;
  font-size: 1.75rem; /* 28px - reduced from 40px */
  line-height: 1.1; /* reduced from 1.2 */
  
  @media (max-width: 768px) {
    font-size: 1.5rem; /* 24px */
  }
  
  @media (max-width: 480px) {
    font-size: 1.25rem; /* 20px */
  }
`;

const HighlightName = styled.span`
  color: #0694fb;
  font-weight: 500;
`;

const RoleText = styled.span`
  color: #A0A0A0;
  font-weight: 400;
  font-size: 1.25rem; /* 20px - reduced from 28px */
  
  @media (max-width: 768px) {
    font-size: 1.1rem; /* 18px */
  }
  
  @media (max-width: 480px) {
    font-size: 1rem; /* 16px */
  }
`;

const MessageText = styled.span`
  color: #ffffff;
  font-weight: 400;
  font-size: 1.1rem; /* 18px */
  opacity: 0.9;
  
  @media (max-width: 768px) {
    font-size: 1rem; /* 16px */
  }
  
  @media (max-width: 480px) {
    font-size: 0.9rem; /* 14px */
  }
`;

const Greeting = () => {
  const { user } = useAuth();

  const getCurrentDate = () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'long', day: 'numeric' };
    return now.toLocaleDateString('en-US', options);
  };

  const getGreetingMessage = () => {
    if (!user) return "how can we help you today?";
    
    switch (user.role) {
      case 'doctor':
      case 'radiologist':
        return "how can we help you with patient care today?";
      case 'admin':
        return "how can we help you manage the system today?";
      case 'patient':
        return "how can we help you with your health today?";
      default:
        return "how can we help you today?";
    }
  };

  const getUserDisplayName = () => {
    if (!user) return "User";
    
    // For medical professionals, add "Dr." prefix
    if (user.role === 'doctor' || user.role === 'radiologist') {
      return `Dr. ${user.firstName} ${user.lastName}`;
    }
    
    return `${user.firstName} ${user.lastName}`;
  };

  const getRoleDisplayName = () => {
    if (!user) return "";
    
    switch (user.role) {
      case 'doctor':
        return user.specialization ? ` • ${user.specialization}` : " • Doctor";
      case 'radiologist':
        return user.specialization ? ` • ${user.specialization}` : " • Radiologist";
      case 'admin':
        return " • Administrator";
      case 'patient':
        return " • Patient";
      default:
        return "";
    }
  };

  return (
    <GreetingContainer>
      <DateText>{getCurrentDate()}</DateText>
      <GreetingText>
        Hello, <HighlightName>{getUserDisplayName()}</HighlightName>
        <RoleText>{getRoleDisplayName()}</RoleText>
        <br />
        <MessageText>{getGreetingMessage()}</MessageText>
      </GreetingText>
    </GreetingContainer>
  );
};

export default Greeting;