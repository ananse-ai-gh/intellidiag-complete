'use client'
import React from 'react';
import { AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { FaUser, FaPhone, FaEnvelope, FaCalendarAlt, FaMapMarkerAlt, FaIdCard, FaUserMd } from 'react-icons/fa';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6b7280;
  &:hover {
    color: #374151;
  }
`;

const ModalTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 24px;
  padding-right: 40px;
`;

const PatientHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
`;

const PatientAvatar = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  font-weight: 600;
`;

const PatientInfo = styled.div`
  flex: 1;
`;

const PatientName = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 4px 0;
`;

const PatientId = styled.p`
  font-size: 14px;
  color: #6b7280;
  margin: 0;
`;

const DetailsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
`;

const DetailSection = styled.div`
  background: #f9fafb;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid #667eea;
`;

const SectionTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 14px;
  color: #4b5563;
`;

const DetailLabel = styled.span`
  font-weight: 500;
  min-width: 80px;
`;

const DetailValue = styled.span`
  color: #111827;
`;

const FullWidthSection = styled.div`
  background: #f9fafb;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid #10b981;
  margin-bottom: 24px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  
  ${props => props.$variant === 'primary' ? `
    background: #667eea;
    color: white;
    &:hover {
      background: #5a67d8;
    }
  ` : `
    background: #f3f4f6;
    color: #374151;
    &:hover {
      background: #e5e7eb;
    }
  `}
`;

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  contactNumber: string;
  email: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  assignedDoctorId?: string;
  createdAt: string;
  updatedAt: string;
}

interface ViewPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
}

const ViewPatientModal: React.FC<ViewPatientModalProps> = ({ isOpen, onClose, patient }) => {
  if (!patient) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <ModalOverlay onClick={onClose}>
          <ModalContainer onClick={(e) => e.stopPropagation()}>
            <CloseButton onClick={onClose}>×</CloseButton>
            <ModalTitle>Patient Details</ModalTitle>
            
            <PatientHeader>
              <PatientAvatar>
                {getInitials(patient.firstName, patient.lastName)}
              </PatientAvatar>
              <PatientInfo>
                <PatientName>{patient.firstName} {patient.lastName}</PatientName>
                <PatientId>Patient ID: {patient.id}</PatientId>
              </PatientInfo>
            </PatientHeader>

            <DetailsGrid>
              <DetailSection>
                <SectionTitle>
                  <FaUser size={14} />
                  Personal Information
                </SectionTitle>
                <DetailItem>
                  <DetailLabel>Age:</DetailLabel>
                  <DetailValue>{getAge(patient.dateOfBirth)} years</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>DOB:</DetailLabel>
                  <DetailValue>{formatDate(patient.dateOfBirth)}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Gender:</DetailLabel>
                  <DetailValue style={{ textTransform: 'capitalize' }}>{patient.gender}</DetailValue>
                </DetailItem>
              </DetailSection>

              <DetailSection>
                <SectionTitle>
                  <FaPhone size={14} />
                  Contact Information
                </SectionTitle>
                <DetailItem>
                  <FaPhone size={12} color="#6b7280" />
                  <DetailValue>{patient.contactNumber || 'Not provided'}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <FaEnvelope size={12} color="#6b7280" />
                  <DetailValue>{patient.email || 'Not provided'}</DetailValue>
                </DetailItem>
              </DetailSection>
            </DetailsGrid>

            <FullWidthSection>
              <SectionTitle>
                <FaMapMarkerAlt size={14} />
                Address Information
              </SectionTitle>
              <DetailItem>
                <DetailLabel>Address:</DetailLabel>
                <DetailValue>{patient.street || 'Not provided'}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>City:</DetailLabel>
                <DetailValue>{patient.city || 'Not provided'}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>State:</DetailLabel>
                <DetailValue>{patient.state || 'Not provided'}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>ZIP Code:</DetailLabel>
                <DetailValue>{patient.zipCode || 'Not provided'}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>Country:</DetailLabel>
                <DetailValue>{patient.country || 'Not provided'}</DetailValue>
              </DetailItem>
            </FullWidthSection>

            <FullWidthSection>
              <SectionTitle>
                <FaIdCard size={14} />
                System Information
              </SectionTitle>
              <DetailItem>
                <DetailLabel>Created:</DetailLabel>
                <DetailValue>{formatDate(patient.createdAt)}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>Last Updated:</DetailLabel>
                <DetailValue>{formatDate(patient.updatedAt)}</DetailValue>
              </DetailItem>
              {patient.assignedDoctorId && (
                <DetailItem>
                  <FaUserMd size={12} color="#6b7280" />
                  <DetailValue>Assigned Doctor: {patient.assignedDoctorId}</DetailValue>
                </DetailItem>
              )}
            </FullWidthSection>

            <ButtonGroup>
              <Button $variant="secondary" onClick={onClose}>
                Close
              </Button>
            </ButtonGroup>
          </ModalContainer>
        </ModalOverlay>
      )}
    </AnimatePresence>
  );
};

export default ViewPatientModal;
