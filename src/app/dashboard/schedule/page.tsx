'use client'

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

import styled from 'styled-components';
import { FaPlus, FaCalendar, FaClock, FaUser, FaMapMarkerAlt, FaPhone, FaEnvelope, FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';

const PageContainer = styled.div`
  padding: 24px;
  background-color: transparent;
  min-height: 100vh;
  color: #FFFFFF;
  width: 100%;
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
  height: 600px;
`;

const CalendarSidebar = styled.div`
  background-color: #1A1A1A;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 20px;
`;

const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const MonthYear = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #FFFFFF;
`;

const CalendarNav = styled.div`
  display: flex;
  gap: 8px;
`;

const NavButton = styled.button`
  background: none;
  border: none;
  color: #A0A0A0;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    color: #FFFFFF;
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 20px;
`;

const DayHeader = styled.div`
  text-align: center;
  font-size: 12px;
  color: #A0A0A0;
  padding: 8px 4px;
  font-weight: 500;
`;

const DayCell = styled.div<{ isToday?: boolean; hasAppointment?: boolean; isOtherMonth?: boolean }>`
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  position: relative;
  
  background-color: ${props => {
    if (props.isToday) return '#0694FB';
    if (props.hasAppointment) return 'rgba(6, 148, 251, 0.2)';
    return 'transparent';
  }};
  
  color: ${props => {
    if (props.isToday) return '#FFFFFF';
    if (props.isOtherMonth) return '#666';
    return '#FFFFFF';
  }};

  &:hover {
    background-color: ${props => props.isToday ? '#0578d1' : 'rgba(255, 255, 255, 0.1)'};
  }
`;

const AppointmentDot = styled.div`
  position: absolute;
  bottom: 2px;
  width: 4px;
  height: 4px;
  background-color: #0694FB;
  border-radius: 50%;
`;

const TodayAppointments = styled.div`
  background-color: #1A1A1A;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 20px;
  overflow-y: auto;
`;

const TodayHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 18px;
  font-weight: 600;
  color: #FFFFFF;
`;

const AppointmentCard = styled.div<{ status: string }>`
  background-color: #0D0D0D;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  transition: all 0.2s ease;
  border-left: 4px solid ${props => {
    switch (props.status) {
      case 'confirmed': return '#28A745';
      case 'pending': return '#FFC107';
      case 'cancelled': return '#DC3545';
      default: return '#6C757D';
    }
  }};

  &:hover {
    border-color: #0694FB;
    transform: translateX(4px);
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
  color: #FFFFFF;
`;

const AppointmentStatus = styled.span<{ status: string }>`
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
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
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const PatientName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const AppointmentType = styled.div`
  font-size: 12px;
  color: #A0A0A0;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const AppointmentLocation = styled.div`
  font-size: 12px;
  color: #A0A0A0;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const AppointmentActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
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

const SchedulePage = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Mock data
  const appointments = [
    {
      id: 1,
      time: '09:00 AM',
      patientName: 'Sarah Johnson',
      type: 'Chest X-Ray',
      location: 'Radiology Room 1',
      status: 'confirmed',
      date: '2024-08-30'
    },
    {
      id: 2,
      time: '10:30 AM',
      patientName: 'Michael Chen',
      type: 'Brain MRI',
      location: 'MRI Suite A',
      status: 'pending',
      date: '2024-08-30'
    },
    {
      id: 3,
      time: '02:00 PM',
      patientName: 'Emma Wilson',
      type: 'Spine CT',
      location: 'CT Room 2',
      status: 'confirmed',
      date: '2024-08-30'
    },
    {
      id: 4,
      time: '03:30 PM',
      patientName: 'David Brown',
      type: 'Cardiac Echo',
      location: 'Echo Lab',
      status: 'cancelled',
      date: '2024-08-30'
    }
  ];

  const stats = [
    { label: 'Today\'s Appointments', value: '8', icon: <FaCalendar />, color: '#0694FB' },
    { label: 'Confirmed', value: '6', icon: <FaCheck />, color: '#28A745' },
    { label: 'Pending', value: '2', icon: <FaClock />, color: '#FFC107' },
    { label: 'Cancelled', value: '1', icon: <FaTimes />, color: '#DC3545' }
  ];

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const lastDayOfPrevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();

  const calendarDays = [];
  
  // Previous month days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    calendarDays.push({
      day: lastDayOfPrevMonth - i,
      isOtherMonth: true,
      hasAppointment: false
    });
  }
  
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
    const isToday = date.toDateString() === new Date().toDateString();
    const hasAppointment = appointments.some(apt => 
      new Date(apt.date).toDateString() === date.toDateString()
    );
    
    calendarDays.push({
      day: i,
      isOtherMonth: false,
      hasAppointment,
      isToday
    });
  }

  const handleAddAppointment = () => {
    console.log('Add new appointment');
  };

  const handleConfirmAppointment = (appointmentId: number) => {
    console.log('Confirm appointment:', appointmentId);
  };

  const handleCancelAppointment = (appointmentId: number) => {
    console.log('Cancel appointment:', appointmentId);
  };

  const handleEditAppointment = (appointmentId: number) => {
    console.log('Edit appointment:', appointmentId);
  };

  const handleDeleteAppointment = (appointmentId: number) => {
    console.log('Delete appointment:', appointmentId);
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const todayAppointments = appointments.filter(apt => apt.date === '2024-08-30');

  return (
    <PageContainer>
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
            <CalendarHeader>
              <MonthYear>{formatMonthYear(currentDate)}</MonthYear>
              <CalendarNav>
                <NavButton onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}>
                  ‹
                </NavButton>
                <NavButton onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}>
                  ›
                </NavButton>
              </CalendarNav>
            </CalendarHeader>

            <CalendarGrid>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <DayHeader key={day}>{day}</DayHeader>
              ))}
              
              {calendarDays.map((day, index) => (
                <DayCell
                  key={index}
                  isToday={day.isToday}
                  hasAppointment={day.hasAppointment}
                  isOtherMonth={day.isOtherMonth}
                  onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day.day))}
                >
                  {day.day}
                  {day.hasAppointment && <AppointmentDot />}
                </DayCell>
              ))}
            </CalendarGrid>
          </CalendarSidebar>

          <TodayAppointments>
            <TodayHeader>
              <FaCalendar size={16} />
              Today's Appointments
            </TodayHeader>
            
            {todayAppointments.length > 0 ? (
              todayAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} status={appointment.status}>
                  <AppointmentHeader>
                    <AppointmentTime>{appointment.time}</AppointmentTime>
                    <AppointmentStatus status={appointment.status}>
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </AppointmentStatus>
                  </AppointmentHeader>
                  
                  <AppointmentDetails>
                    <PatientName>
                      <FaUser size={12} />
                      {appointment.patientName}
                    </PatientName>
                    <AppointmentType>
                      <FaCalendar size={12} />
                      {appointment.type}
                    </AppointmentType>
                    <AppointmentLocation>
                      <FaMapMarkerAlt size={12} />
                      {appointment.location}
                    </AppointmentLocation>
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
              ))
            ) : (
              <div style={{ textAlign: 'center', color: '#A0A0A0', padding: '40px 20px' }}>
                No appointments scheduled for today
              </div>
            )}
          </TodayAppointments>
        </ScheduleContainer>
      </PageContainer>
  );
};

export default SchedulePage;
