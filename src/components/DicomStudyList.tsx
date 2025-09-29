'use client'

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaSearch, FaFilter, FaDownload, FaEye, FaTrash, FaUpload, FaFileMedical } from 'react-icons/fa';
import api from '@/services/api';

const StudyListContainer = styled.div`
  padding: 24px;
  background-color: transparent;
  color: #FFFFFF;
  width: 100%;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #FFFFFF;
`;

const SearchBar = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const SearchInput = styled.input`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  width: 300px;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }
  
  &:focus {
    outline: none;
    border-color: #0694fb;
  }
`;

const FilterButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const UploadButton = styled.button`
  background: rgba(6, 148, 251, 0.2);
  border: 1px solid rgba(6, 148, 251, 0.5);
  color: #0694fb;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(6, 148, 251, 0.3);
    transform: scale(1.05);
  }
`;

const StudiesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 24px;
`;

const StudyCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
    border-color: rgba(6, 148, 251, 0.3);
  }
`;

const StudyHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const StudyInfo = styled.div`
  flex: 1;
`;

const StudyId = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #FFFFFF;
`;

const PatientInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: #ccc;
  font-size: 14px;
`;

const StudyDetails = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
`;

const DetailTag = styled.span<{ variant?: string }>`
  background: ${props => {
    switch (props.variant) {
      case 'modality': return 'rgba(6, 148, 251, 0.2)';
      case 'date': return 'rgba(40, 167, 69, 0.2)';
      case 'series': return 'rgba(255, 193, 7, 0.2)';
      default: return 'rgba(255, 255, 255, 0.1)';
    }
  }};
  color: ${props => {
    switch (props.variant) {
      case 'modality': return '#0694fb';
      case 'date': return '#28a745';
      case 'series': return '#ffc107';
      default: return '#fff';
    }
  }};
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
`;

const StudyActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button<{ variant?: string }>`
  background: ${props => {
    switch (props.variant) {
      case 'primary': return 'rgba(6, 148, 251, 0.2)';
      case 'danger': return 'rgba(220, 53, 69, 0.2)';
      default: return 'rgba(255, 255, 255, 0.1)';
    }
  }};
  border: 1px solid ${props => {
    switch (props.variant) {
      case 'primary': return 'rgba(6, 148, 251, 0.3)';
      case 'danger': return 'rgba(220, 53, 69, 0.3)';
      default: return 'rgba(255, 255, 255, 0.2)';
    }
  }};
  color: ${props => {
    switch (props.variant) {
      case 'primary': return '#0694fb';
      case 'danger': return '#dc3545';
      default: return '#fff';
    }
  }};
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.05);
    opacity: 0.8;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  color: #A0A0A0;
  padding: 40px;
  font-size: 16px;
`;

const EmptyMessage = styled.div`
  text-align: center;
  color: #A0A0A0;
  padding: 40px;
  font-size: 16px;
`;

interface Study {
  studyInstanceUID: string;
  patientName: string;
  patientId: string;
  studyDate: string;
  studyTime: string;
  modality: string;
  studyDescription: string;
  numberOfSeries: number;
  numberOfInstances: number;
}

const DicomStudyList: React.FC = () => {
  const [studies, setStudies] = useState<Study[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStudies, setFilteredStudies] = useState<Study[]>([]);

  useEffect(() => {
    loadStudies();
  }, []);

  useEffect(() => {
    const filtered = studies.filter(study =>
      study.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      study.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      study.studyDescription.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStudies(filtered);
  }, [studies, searchTerm]);

  const loadStudies = async () => {
    try {
      setLoading(true);
      // For now, use mock data - in a real implementation, you'd call your DICOM API
      const mockStudies: Study[] = [
        {
          studyInstanceUID: '1.2.3.4.5.6.7.8.9.10',
          patientName: 'Doe^John',
          patientId: '12345',
          studyDate: '20240101',
          studyTime: '120000',
          modality: 'CT',
          studyDescription: 'Chest CT',
          numberOfSeries: 1,
          numberOfInstances: 100
        },
        {
          studyInstanceUID: '1.2.3.4.5.6.7.8.9.11',
          patientName: 'Smith^Jane',
          patientId: '67890',
          studyDate: '20240102',
          studyTime: '140000',
          modality: 'MR',
          studyDescription: 'Brain MRI',
          numberOfSeries: 3,
          numberOfInstances: 150
        }
      ];
      
      setStudies(mockStudies);
    } catch (error) {
      console.error('Error loading studies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewStudy = (study: Study) => {
    // Open OHIF viewer with the study
    console.log('Opening study:', study.studyInstanceUID);
    // In a real implementation, you'd navigate to the OHIF viewer with the study ID
  };

  const handleDownloadStudy = (study: Study) => {
    console.log('Downloading study:', study.studyInstanceUID);
    // In a real implementation, you'd trigger a download of the study
  };

  const handleDeleteStudy = (study: Study) => {
    if (confirm(`Are you sure you want to delete study ${study.studyInstanceUID}?`)) {
      console.log('Deleting study:', study.studyInstanceUID);
      // In a real implementation, you'd delete the study from the server
    }
  };

  const formatDate = (dateStr: string) => {
    if (dateStr.length === 8) {
      const year = dateStr.substring(0, 4);
      const month = dateStr.substring(4, 6);
      const day = dateStr.substring(6, 8);
      return `${year}-${month}-${day}`;
    }
    return dateStr;
  };

  const formatTime = (timeStr: string) => {
    if (timeStr.length === 6) {
      const hour = timeStr.substring(0, 2);
      const minute = timeStr.substring(2, 4);
      const second = timeStr.substring(4, 6);
      return `${hour}:${minute}:${second}`;
    }
    return timeStr;
  };

  if (loading) {
    return (
      <StudyListContainer>
        <LoadingMessage>Loading DICOM studies...</LoadingMessage>
      </StudyListContainer>
    );
  }

  return (
    <StudyListContainer>
      <Header>
        <Title>DICOM Studies</Title>
        <SearchBar>
          <SearchInput
            type="text"
            placeholder="Search studies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FilterButton>
            <FaFilter />
            Filter
          </FilterButton>
          <UploadButton>
            <FaUpload />
            Upload DICOM
          </UploadButton>
        </SearchBar>
      </Header>

      {filteredStudies.length === 0 ? (
        <EmptyMessage>
          No DICOM studies found. Upload a DICOM file to get started.
        </EmptyMessage>
      ) : (
        <StudiesGrid>
          {filteredStudies.map((study) => (
            <StudyCard key={study.studyInstanceUID}>
              <StudyHeader>
                <StudyInfo>
                  <StudyId>{study.studyDescription}</StudyId>
                  <PatientInfo>
                    <FaFileMedical size={12} />
                    {study.patientName} ({study.patientId})
                  </PatientInfo>
                </StudyInfo>
              </StudyHeader>

              <StudyDetails>
                <DetailTag variant="modality">{study.modality}</DetailTag>
                <DetailTag variant="date">{formatDate(study.studyDate)}</DetailTag>
                <DetailTag variant="series">{study.numberOfSeries} Series</DetailTag>
                <DetailTag>{study.numberOfInstances} Instances</DetailTag>
              </StudyDetails>

              <StudyActions>
                <ActionButton variant="primary" onClick={() => handleViewStudy(study)}>
                  <FaEye />
                  View
                </ActionButton>
                <ActionButton onClick={() => handleDownloadStudy(study)}>
                  <FaDownload />
                  Download
                </ActionButton>
                <ActionButton variant="danger" onClick={() => handleDeleteStudy(study)}>
                  <FaTrash />
                  Delete
                </ActionButton>
              </StudyActions>
            </StudyCard>
          ))}
        </StudiesGrid>
      )}
    </StudyListContainer>
  );
};

export default DicomStudyList;
