'use client'

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import styled from 'styled-components';
import { FaPlus, FaCalendar, FaClock, FaUser, FaMapMarkerAlt, FaPhone, FaEnvelope, FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';

const ContentContainer = styled.div`
  padding: 24px;
  background-color: transparent;
  color: #FFFFFF;
  width: 100%;
  height: 100%;
  overflow: auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
`;

const PageTitle = styled.h1`
  font-size: 28px;
  font-weight: 600;
  margin: 0;
  color: #FFFFFF;
`;

const AddButton = styled.button`
  background-color: #0694FB;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #0578d1;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
`;

const StatCard = styled.div`
  background-color: #1A1A1A;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  background-color: ${props => props.color || '#0694FB'};
  color: white;
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 600;
  color: #FFFFFF;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #A0A0A0;
`;

const ScheduleContainer = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 24px;
  height: calc(100vh - 300px);
`;

const CalendarSidebar = styled.div`
  background-color: #1A1A1A;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 20px;
  height: fit-content;
`;

const CalendarTitle = styled.h3`
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 20px;
`;

const CalendarHeader = styled.div`
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: #A0A0A0;
  padding: 8px 0;
`;

const CalendarDay = styled.div<{ isToday?: boolean; hasAppointment?: boolean }>`
  text-align: center;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: ${props => {
    if (props.isToday) return 'rgba(6, 148, 251, 0.2)';
    if (props.hasAppointment) return 'rgba(255, 193, 7, 0.2)';
    return 'transparent';
  }};
  color: ${props => {
    if (props.isToday) return '#0694FB';
    if (props.hasAppointment) return '#FFC107';
    return '#FFFFFF';
  }};

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const MainContent = styled.div`
  background-color: #1A1A1A;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 24px;
  overflow: auto;
`;

const TodayTitle = styled.h3`
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const AppointmentCard = styled.div`
  background-color: #0D0D0D;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  transition: all 0.2s ease;

  &:hover {
    border-color: #0694FB;
  }
`;

const AppointmentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const AppointmentTime = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #0694FB;
`;

const AppointmentStatus = styled.span<{ status: string }>`
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 600;
  background-color: ${props => {
    switch (props.status) {
      case 'confirmed': return 'rgba(40, 167, 69, 0.2)';
      case 'pending': return 'rgba(255, 193, 7, 0.2)';
      case 'cancelled': return 'rgba(220, 53, 69, 0.2)';
      default: return 'rgba(108, 117, 125, 0.2)';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'confirmed': return '#28A745';
      case 'pending': return '#FFC107';
      case 'cancelled': return '#DC3545';
      default: return '#6C757D';
    }
  }};
`;

const AppointmentDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const DetailLabel = styled.div`
  font-size: 12px;
  color: #A0A0A0;
`;

const DetailValue = styled.div`
  font-size: 14px;
  color: #FFFFFF;
  font-weight: 500;
`;

const AppointmentActions = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: #A0A0A0;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #FFFFFF;
    background-color: rgba(255, 255, 255, 0.1);
  }

  &.success:hover {
    color: #28A745;
    background-color: rgba(40, 167, 69, 0.1);
  }

  &.danger:hover {
    color: #FF6B6B;
    background-color: rgba(255, 107, 107, 0.1);
  }
`;

const ScheduleContent = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Mock data
  const appointments = [
    {
      id: 'APT-001',
      time: '09:00 AM',
      patientName: 'Sarah Johnson',
      type: 'Chest X-Ray',
      location: 'Radiology Room 1',
      status: 'confirmed',
      phone: '+1 (555) 123-4567',
      email: 'sarah.johnson@email.com'
    },
    {
      id: 'APT-002',
      time: '10:30 AM',
      patientName: 'Michael Chen',
      type: 'Brain MRI',
      location: 'MRI Suite A',
      status: 'pending',
      phone: '+1 (555) 234-5678',
      email: 'michael.chen@email.com'
    },
    {
      id: 'APT-003',
      time: '02:00 PM',
      patientName: 'Emma Wilson',
      type: 'Spine CT',
      location: 'CT Room 2',
      status: 'confirmed',
      phone: '+1 (555) 345-6789',
      email: 'emma.wilson@email.com'
    },
    {
      id: 'APT-004',
      time: '03:30 PM',
      patientName: 'David Brown',
      type: 'Cardiac Echo',
      location: 'Echo Lab',
      status: 'cancelled',
      phone: '+1 (555) 456-7890',
      email: 'david.brown@email.com'
    }
  ];

  const stats = [
    { label: 'Today\'s Appointments', value: '8', icon: <FaCalendar />, color: '#0694FB' },
    { label: 'Confirmed', value: '6', icon: <FaCheck />, color: '#28A745' },
    { label: 'Pending', value: '2', icon: <FaClock />, color: '#FFC107' },
    { label: 'Cancelled', value: '1', icon: <FaTimes />, color: '#DC3545' }
  ];

  const handleAddAppointment = () => {
    console.log('Add new appointment');
  };

  const handleConfirmAppointment = (appointmentId: string) => {
    console.log('Confirm appointment:', appointmentId);
  };

  const handleCancelAppointment = (appointmentId: string) => {
    console.log('Cancel appointment:', appointmentId);
  };

  const handleEditAppointment = (appointmentId: string) => {
    console.log('Edit appointment:', appointmentId);
  };

  const handleDeleteAppointment = (appointmentId: string) => {
    console.log('Delete appointment:', appointmentId);
  };

  // Generate calendar days
  const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).getDay();
  const today = new Date();

  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  return (
    <ContentContainer>
      <Header>
        <PageTitle>Schedule</PageTitle>
        <AddButton onClick={handleAddAppointment}>
          <FaPlus size={14} />
          New Appointment
        </AddButton>
      </Header>

      <StatsGrid>
        {stats.map((stat, index) => (
          <StatCard key={index}>
            <StatIcon color={stat.color}>
              {stat.icon}
            </StatIcon>
            <StatContent>
              <StatValue>{stat.value}</StatValue>
              <StatLabel>{stat.label}</StatLabel>
            </StatContent>
          </StatCard>
        ))}
      </StatsGrid>

      <ScheduleContainer>
        <CalendarSidebar>
          <CalendarTitle>
            <FaCalendar size={16} />
            {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </CalendarTitle>

          <CalendarGrid>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <CalendarHeader key={day}>{day}</CalendarHeader>
            ))}
            {calendarDays.map((day, index) => (
              <CalendarDay
                key={index}
                isToday={day === today.getDate() && selectedDate.getMonth() === today.getMonth()}
                hasAppointment={Boolean(day && [1, 5, 12, 18, 25].includes(day))}
              >
                {day}
              </CalendarDay>
            ))}
          </CalendarGrid>
        </CalendarSidebar>

        <MainContent>
          <TodayTitle>
            <FaCalendar size={16} />
                            Today&apos;s Appointments
          </TodayTitle>

          {appointments.map((appointment) => (
            <AppointmentCard key={appointment.id}>
              <AppointmentHeader>
                <AppointmentTime>{appointment.time}</AppointmentTime>
                <AppointmentStatus status={appointment.status}>
                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </AppointmentStatus>
              </AppointmentHeader>

              <AppointmentDetails>
                <DetailItem>
                  <DetailLabel>Patient</DetailLabel>
                  <DetailValue>{appointment.patientName}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Type</DetailLabel>
                  <DetailValue>{appointment.type}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Location</DetailLabel>
                  <DetailValue>{appointment.location}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Phone</DetailLabel>
                  <DetailValue>{appointment.phone}</DetailValue>
                </DetailItem>
              </AppointmentDetails>

              <AppointmentActions>
                {appointment.status === 'pending' && (
                  <ActionButton 
                    className="success"
                    onClick={() => handleConfirmAppointment(appointment.id)}
                  >
                    <FaCheck size={12} />
                  </ActionButton>
                )}
                <ActionButton onClick={() => handleEditAppointment(appointment.id)}>
                  <FaEdit size={12} />
                </ActionButton>
                {appointment.status !== 'cancelled' && (
                  <ActionButton 
                    className="danger"
                    onClick={() => handleCancelAppointment(appointment.id)}
                  >
                    <FaTimes size={12} />
                  </ActionButton>
                )}
                <ActionButton 
                  className="danger"
                  onClick={() => handleDeleteAppointment(appointment.id)}
                >
                  <FaTrash size={12} />
                </ActionButton>
              </AppointmentActions>
            </AppointmentCard>
          ))}
        </MainContent>
      </ScheduleContainer>
    </ContentContainer>
  );
};

export default ScheduleContent;
