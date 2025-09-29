'use client'

import React, { useState } from 'react';
import styled from 'styled-components';
import { FaTimes, FaDownload, FaFileMedical, FaInfoCircle, FaUpload } from 'react-icons/fa';
import { supabase } from '@/lib/supabase';

const DicomViewerContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  z-index: 9999;
  display: flex;
  flex-direction: column;
`;

const ViewerHeader = styled.div`
  background: rgba(0, 0, 0, 0.9);
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const ViewerTitle = styled.h3`
  color: #fff;
  margin: 0;
  font-size: 18px;
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const ViewerContent = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
`;

const DicomCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  max-width: 600px;
  color: white;
`;

const DicomIcon = styled.div`
  font-size: 80px;
  color: #0694fb;
  margin-bottom: 24px;
`;

const DicomTitle = styled.h2`
  color: #0694fb;
  margin: 0 0 16px 0;
  font-size: 24px;
`;

const DicomMessage = styled.div`
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 24px;
  opacity: 0.9;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  background: rgba(6, 148, 251, 0.2);
  border: 1px solid rgba(6, 148, 251, 0.5);
  color: #0694fb;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(6, 148, 251, 0.3);
    transform: translateY(-2px);
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const LoadingMessage = styled.div`
  color: #0694fb;
  font-size: 18px;
  text-align: center;
`;

const ErrorMessage = styled.div`
  background: rgba(220, 53, 69, 0.1);
  border: 1px solid rgba(220, 53, 69, 0.3);
  color: #dc3545;
  padding: 16px;
  border-radius: 8px;
  margin: 20px 0;
  text-align: center;
`;

const SuccessMessage = styled.div`
  background: rgba(40, 167, 69, 0.1);
  border: 1px solid rgba(40, 167, 69, 0.3);
  color: #28a745;
  padding: 16px;
  border-radius: 8px;
  margin: 20px 0;
  text-align: center;
`;

interface DicomViewerProps {
  isOpen: boolean;
  onClose: () => void;
  dicomUrl?: string;
  fileName?: string;
}

const SimpleDicomViewer: React.FC<DicomViewerProps> = ({
  isOpen,
  onClose,
  dicomUrl,
  fileName = 'DICOM File'
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(!dicomUrl);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Get authentication token
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (!token) {
        setError('Authentication required. Please log in again.');
        setLoading(false);
        return;
      }

      // Upload DICOM file
      const formData = new FormData();
      formData.append('dicomFile', file);
      formData.append('studyId', `STUDY-${Date.now()}`);
      formData.append('seriesId', `SERIES-${Date.now()}`);

      const response = await fetch('/api/dicom', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();

      if (result.status === 'success') {
        setSuccess('DICOM file uploaded successfully! The file has been processed and stored securely.');
        setShowUpload(false);
      } else {
        setError(result.message || 'Failed to upload DICOM file');
      }

      setLoading(false);
    } catch (err) {
      console.error('Error uploading DICOM file:', err);
      setError('Network error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (dicomUrl) {
      const link = document.createElement('a');
      link.href = dicomUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!isOpen) return null;

  return (
    <DicomViewerContainer>
      <ViewerHeader>
        <ViewerTitle>DICOM Viewer - {fileName}</ViewerTitle>
        <CloseButton onClick={onClose}>
          <FaTimes />
        </CloseButton>
      </ViewerHeader>
      
      <ViewerContent>
        <DicomCard>
          <DicomIcon>
            <FaFileMedical />
          </DicomIcon>
          
          {loading ? (
            <LoadingMessage>Uploading DICOM file...</LoadingMessage>
          ) : (
            <>
              <DicomTitle>
                {success ? 'DICOM File Uploaded Successfully!' : 'DICOM Medical Imaging File'}
              </DicomTitle>
              
              {error && <ErrorMessage>{error}</ErrorMessage>}
              {success && <SuccessMessage>{success}</SuccessMessage>}
              
              <DicomMessage>
                <strong>Why you&apos;re not seeing the image:</strong><br />
                DICOM files are specialized medical imaging files that cannot be displayed directly in web browsers like regular images (JPEG, PNG). They require specialized medical imaging software or viewers to properly render the medical data.
                <br /><br />
                <strong>What you can do:</strong><br />
                • Download the DICOM file and open it in medical imaging software<br />
                • Use specialized DICOM viewers like OHIF, Horos, or RadiAnt<br />
                • The file metadata has been extracted and stored in our system
              </DicomMessage>
              
              <ButtonGroup>
                {dicomUrl && (
                  <ActionButton onClick={handleDownload}>
                    <FaDownload />
                    Download DICOM File
                  </ActionButton>
                )}
                
                {showUpload && !success && (
                  <>
                    <ActionButton onClick={() => document.getElementById('dicom-upload')?.click()}>
                      <FaUpload />
                      Upload DICOM File
                    </ActionButton>
                    <HiddenFileInput
                      id="dicom-upload"
                      type="file"
                      accept=".dcm,.dicom,application/dicom"
                      onChange={handleFileUpload}
                    />
                  </>
                )}
                
                <ActionButton onClick={() => window.open('https://viewer.ohif.org/', '_blank')}>
                  <FaInfoCircle />
                  Open OHIF Viewer
                </ActionButton>
              </ButtonGroup>
            </>
          )}
        </DicomCard>
      </ViewerContent>
    </DicomViewerContainer>
  );
};

export default SimpleDicomViewer;