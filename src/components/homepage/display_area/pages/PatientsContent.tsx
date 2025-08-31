'use client'

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import styled from 'styled-components';
import { FaPlus, FaSearch, FaFilter, FaUser, FaPhone, FaEnvelope, FaCalendar, FaEye, FaEdit, FaTrash } from 'react-icons/fa';

interface StatusBadgeProps {
  status: string;
}

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

const SearchBar = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  align-items: center;
`;

const SearchInput = styled.div`
  position: relative;
  flex: 1;
  max-width: 400px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px 12px 44px;
  background-color: #1A1A1A;
  border: 1px solid #333;
  border-radius: 8px;
  color: #FFFFFF;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #0694FB;
  }

  &::placeholder {
    color: #A0A0A0;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #A0A0A0;
`;

const FilterButton = styled.button`
  background-color: #1A1A1A;
  border: 1px solid #333;
  color: #FFFFFF;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;

  &:hover {
    border-color: #0694FB;
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

const PatientsTable = styled.div`
  background-color: #1A1A1A;
  border: 1px solid #333;
  border-radius: 12px;
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 120px;
  gap: 16px;
  padding: 16px 24px;
  background-color: #0D0D0D;
  border-bottom: 1px solid #333;
  font-weight: 600;
  color: #FFFFFF;
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 120px;
  gap: 16px;
  padding: 16px 24px;
  border-bottom: 1px solid #2A2A2A;
  align-items: center;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.02);
  }

  &:last-child {
    border-bottom: none;
  }
`;

const PatientInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const PatientAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #0694FB;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 14px;
`;

const PatientDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const PatientName = styled.div`
  font-weight: 500;
  color: #FFFFFF;
`;

const PatientId = styled.div`
  font-size: 12px;
  color: #A0A0A0;
`;

const ContactInfo = styled.div`
  color: #FFFFFF;
  font-size: 14px;
`;

const StatusBadge = styled.span<StatusBadgeProps>`
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  background-color: ${props => {
    switch (props.status) {
      case 'active': return 'rgba(40, 167, 69, 0.2)';
      case 'inactive': return 'rgba(108, 117, 125, 0.2)';
      case 'pending': return 'rgba(255, 193, 7, 0.2)';
      default: return 'rgba(108, 117, 125, 0.2)';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'active': return '#28A745';
      case 'inactive': return '#6C757D';
      case 'pending': return '#FFC107';
      default: return '#6C757D';
    }
  }};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: #A0A0A0;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    color: #FFFFFF;
    background-color: rgba(255, 255, 255, 0.1);
  }

  &.danger:hover {
    color: #FF6B6B;
    background-color: rgba(255, 107, 107, 0.1);
  }
`;

const PatientsContent = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data
  const patients = [
    {
      id: 'P001',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+1 (555) 123-4567',
      lastVisit: '2024-08-28',
      status: 'active'
    },
    {
      id: 'P002',
      name: 'Michael Chen',
      email: 'michael.chen@email.com',
      phone: '+1 (555) 234-5678',
      lastVisit: '2024-08-25',
      status: 'active'
    },
    {
      id: 'P003',
      name: 'Emma Wilson',
      email: 'emma.wilson@email.com',
      phone: '+1 (555) 345-6789',
      lastVisit: '2024-08-20',
      status: 'pending'
    },
    {
      id: 'P004',
      name: 'David Brown',
      email: 'david.brown@email.com',
      phone: '+1 (555) 456-7890',
      lastVisit: '2024-08-15',
      status: 'inactive'
    },
    {
      id: 'P005',
      name: 'Lisa Garcia',
      email: 'lisa.garcia@email.com',
      phone: '+1 (555) 567-8901',
      lastVisit: '2024-08-10',
      status: 'active'
    }
  ];

  const stats = [
    { label: 'Total Patients', value: '1,247', icon: <FaUser />, color: '#0694FB' },
    { label: 'Active Patients', value: '892', icon: <FaUser />, color: '#28A745' },
    { label: 'New This Month', value: '45', icon: <FaUser />, color: '#FFC107' },
    { label: 'Pending Reviews', value: '23', icon: <FaUser />, color: '#DC3545' }
  ];

  const handleAddPatient = () => {
    console.log('Add new patient');
  };

  const handleViewPatient = (patientId: string) => {
    console.log('View patient:', patientId);
  };

  const handleEditPatient = (patientId: string) => {
    console.log('Edit patient:', patientId);
  };

  const handleDeletePatient = (patientId: string) => {
    console.log('Delete patient:', patientId);
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ContentContainer>
      <Header>
        <PageTitle>Patients</PageTitle>
        <AddButton onClick={handleAddPatient}>
          <FaPlus size={14} />
          Add Patient
        </AddButton>
      </Header>

      <SearchBar>
        <SearchInput>
          <SearchIcon>
            <FaSearch size={16} />
          </SearchIcon>
          <Input
            type="text"
            placeholder="Search patients by name, email, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchInput>
        <FilterButton>
          <FaFilter size={14} />
          Filter
        </FilterButton>
      </SearchBar>

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

      <PatientsTable>
        <TableHeader>
          <div>Patient</div>
          <div>Contact</div>
          <div>Phone</div>
          <div>Last Visit</div>
          <div>Status</div>
          <div>Actions</div>
        </TableHeader>
        
        {filteredPatients.map((patient) => (
          <TableRow key={patient.id}>
            <PatientInfo>
              <PatientAvatar>
                {patient.name.split(' ').map(n => n[0]).join('')}
              </PatientAvatar>
              <PatientDetails>
                <PatientName>{patient.name}</PatientName>
                <PatientId>{patient.id}</PatientId>
              </PatientDetails>
            </PatientInfo>
            
            <ContactInfo>{patient.email}</ContactInfo>
            <ContactInfo>{patient.phone}</ContactInfo>
            <ContactInfo>{patient.lastVisit}</ContactInfo>
            
            <StatusBadge status={patient.status}>
              {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
            </StatusBadge>
            
            <ActionButtons>
              <ActionButton onClick={() => handleViewPatient(patient.id)}>
                <FaEye size={14} />
              </ActionButton>
              <ActionButton onClick={() => handleEditPatient(patient.id)}>
                <FaEdit size={14} />
              </ActionButton>
              <ActionButton 
                className="danger" 
                onClick={() => handleDeletePatient(patient.id)}
              >
                <FaTrash size={14} />
              </ActionButton>
            </ActionButtons>
          </TableRow>
        ))}
      </PatientsTable>
    </ContentContainer>
  );
};

export default PatientsContent;
