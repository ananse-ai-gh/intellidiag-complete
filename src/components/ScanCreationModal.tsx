'use client'

import React, { useState, useRef } from 'react';
import { FaUpload, FaTimes, FaBrain, FaLungs, FaHeart, FaImage, FaSpinner, FaCheck } from 'react-icons/fa';
import styled from 'styled-components';

interface ScanCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanCreated: (scan: any) => void;
}

interface ScanFormData {
  patientFirstName: string;
  patientLastName: string;
  patientIdNumber: string;
  scanType: string;
  bodyPart: string;
  priority: string;
  selectedFile: File | null;
  selectedAIServices: string[];
}

// Styled Components
const ModalOverlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: ${props => props.isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: #1a1a1a;
  border-radius: 12px;
  padding: 32px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  padding: 8px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const ModalTitle = styled.h2`
  color: #0694fb;
  margin: 0 0 24px 0;
  font-size: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  color: #fff;
  font-size: 14px;
  font-weight: 500;
`;

const Input = styled.input`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  padding: 12px;
  color: white;
  font-size: 14px;
  
  &::placeholder {
    color: #888;
  }
  
  &:focus {
    outline: none;
    border-color: #0694fb;
  }
`;

const Select = styled.select`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  padding: 12px;
  color: white;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #0694fb;
  }
  
  option {
    background: #1a1a1a;
    color: white;
  }
`;

const FileUploadArea = styled.div<{ hasFile: boolean }>`
  border: 2px dashed ${props => props.hasFile ? '#28a745' : '#0694fb'};
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.hasFile ? 'rgba(40, 167, 69, 0.1)' : 'rgba(6, 148, 251, 0.05)'};
  margin-bottom: 24px;

  &:hover {
    background: ${props => props.hasFile ? 'rgba(40, 167, 69, 0.2)' : 'rgba(6, 148, 251, 0.1)'};
  }
`;

const UploadIcon = styled.div`
  font-size: 48px;
  color: #0694fb;
  margin-bottom: 16px;
`;

const UploadText = styled.p`
  color: #0694fb;
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 500;
`;

const UploadSubtext = styled.p`
  color: #888;
  margin: 0;
  font-size: 14px;
`;

const AIServicesSection = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
  color: #fff;
  margin: 0 0 16px 0;
  font-size: 18px;
`;

const ServicesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
`;

const ServiceCard = styled.div<{ isSelected: boolean }>`
  background: ${props => props.isSelected ? 'rgba(6, 148, 251, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
  border: 1px solid ${props => props.isSelected ? '#0694fb' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;

  &:hover {
    background: rgba(6, 148, 251, 0.1);
    border-color: #0694fb;
  }
`;

const ServiceIcon = styled.div<{ color: string }>`
  font-size: 24px;
  color: ${props => props.color};
  margin-bottom: 8px;
`;

const ServiceName = styled.div`
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
`;

const ServiceDescription = styled.div`
  color: #888;
  font-size: 12px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  background: ${props => props.variant === 'secondary' ? 'rgba(255, 255, 255, 0.1)' : '#0694FB'};
  color: #FFFFFF;
  border: 1px solid ${props => props.variant === 'secondary' ? 'rgba(255, 255, 255, 0.2)' : '#0694FB'};
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  border-radius: 12px;
`;

const LoadingText = styled.p`
  margin: 16px 0 0 0;
  font-size: 16px;
`;

// AI Services Configuration
const AI_SERVICES = [
  {
    id: 'brain_tumor',
    name: 'Brain Tumor Analysis',
    description: 'Detect brain tumors in MRI/CT scans',
    icon: FaBrain,
    color: '#ff6b6b'
  },
  {
    id: 'breast_cancer',
    name: 'Breast Cancer Detection',
    description: 'Analyze mammography for breast cancer',
    icon: FaHeart,
    color: '#4facfe'
  },
  {
    id: 'lung_tumor',
    name: 'Lung Tumor Analysis',
    description: 'Detect lung tumors in chest X-rays',
    icon: FaLungs,
    color: '#00c6ff'
  },
  {
    id: 'mri_to_ct',
    name: 'MRI to CT Translation',
    description: 'Convert MRI scans to CT format',
    icon: FaImage,
    color: '#43e97b'
  },
  {
    id: 'ct_to_mri',
    name: 'CT to MRI Translation',
    description: 'Convert CT scans to MRI format',
    icon: FaImage,
    color: '#43e97b'
  }
];

const ScanCreationModal: React.FC<ScanCreationModalProps> = ({
  isOpen,
  onClose,
  onScanCreated
}) => {
  const [formData, setFormData] = useState<ScanFormData>({
    patientFirstName: '',
    patientLastName: '',
    patientIdNumber: '',
    scanType: '',
    bodyPart: '',
    priority: 'normal',
    selectedFile: null,
    selectedAIServices: []
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: keyof ScanFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/tiff'];
      if (!validTypes.includes(file.type)) {
        alert('Please select a valid image file (JPEG, PNG, GIF, BMP, TIFF)');
        return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size too large. Please select an image smaller than 10MB.');
        return;
      }

      setFormData(prev => ({
        ...prev,
        selectedFile: file
      }));
    }
  };

  const handleServiceToggle = (serviceId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedAIServices: prev.selectedAIServices.includes(serviceId)
        ? prev.selectedAIServices.filter(id => id !== serviceId)
        : [...prev.selectedAIServices, serviceId]
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!formData.selectedFile) {
      alert('Please select an image file');
      return;
    }

    if (formData.selectedAIServices.length === 0) {
      alert('Please select at least one AI analysis service');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Create scan object
      const newScan = {
        id: Date.now(),
        scanId: `SCAN-${Date.now()}`,
        patientFirstName: formData.patientFirstName,
        patientLastName: formData.patientLastName,
        patientIdNumber: formData.patientIdNumber,
        scanType: formData.scanType,
        bodyPart: formData.bodyPart,
        priority: formData.priority,
        status: 'pending',
        scanDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        imagePath: URL.createObjectURL(formData.selectedFile),
        selectedAIServices: formData.selectedAIServices
      };

      onScanCreated(newScan);
      onClose();

      // Reset form
      setFormData({
        patientFirstName: '',
        patientLastName: '',
        patientIdNumber: '',
        scanType: '',
        bodyPart: '',
        priority: 'normal',
        selectedFile: null,
        selectedAIServices: []
      });
      setUploadProgress(0);

    } catch (error) {
      console.error('Error creating scan:', error);
      alert('Failed to create scan. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      onClose();
    }
  };

  return (
    <ModalOverlay isOpen={isOpen} onClick={handleClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={handleClose} disabled={isUploading}>
          <FaTimes />
        </CloseButton>

        {isUploading && (
          <LoadingOverlay>
            <FaSpinner className="fa-spin" style={{ fontSize: '32px' }} />
            <LoadingText>Creating scan and starting AI analysis... {uploadProgress}%</LoadingText>
          </LoadingOverlay>
        )}

        <ModalTitle>
          <FaUpload />
          Create New Scan
        </ModalTitle>

        <form onSubmit={handleSubmit}>
          <FormGrid>
            <FormGroup>
              <Label>Patient First Name</Label>
              <Input
                type="text"
                value={formData.patientFirstName}
                onChange={(e) => handleInputChange('patientFirstName', e.target.value)}
                placeholder="Enter first name"
                required
                disabled={isUploading}
              />
            </FormGroup>

            <FormGroup>
              <Label>Patient Last Name</Label>
              <Input
                type="text"
                value={formData.patientLastName}
                onChange={(e) => handleInputChange('patientLastName', e.target.value)}
                placeholder="Enter last name"
                required
                disabled={isUploading}
              />
            </FormGroup>

            <FormGroup>
              <Label>Patient ID Number</Label>
              <Input
                type="text"
                value={formData.patientIdNumber}
                onChange={(e) => handleInputChange('patientIdNumber', e.target.value)}
                placeholder="Enter patient ID"
                required
                disabled={isUploading}
              />
            </FormGroup>

            <FormGroup>
              <Label>Scan Type</Label>
              <Select
                value={formData.scanType}
                onChange={(e) => handleInputChange('scanType', e.target.value)}
                required
                disabled={isUploading}
              >
                <option value="">Select scan type</option>
                <option value="MRI">MRI</option>
                <option value="CT">CT</option>
                <option value="X-ray">X-ray</option>
                <option value="Ultrasound">Ultrasound</option>
                <option value="Mammography">Mammography</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Body Part</Label>
              <Input
                type="text"
                value={formData.bodyPart}
                onChange={(e) => handleInputChange('bodyPart', e.target.value)}
                placeholder="e.g., Brain, Chest, Abdomen"
                required
                disabled={isUploading}
              />
            </FormGroup>

            <FormGroup>
              <Label>Priority</Label>
              <Select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                disabled={isUploading}
              >
                <option value="normal">Normal</option>
                <option value="urgent">Urgent</option>
                <option value="critical">Critical</option>
              </Select>
            </FormGroup>
          </FormGrid>

          <FileUploadArea
            hasFile={!!formData.selectedFile}
            onClick={() => !isUploading && fileInputRef.current?.click()}
          >
            <UploadIcon>
              <FaUpload />
            </UploadIcon>
            <UploadText>
              {formData.selectedFile ? formData.selectedFile.name : 'Click to upload scan image'}
            </UploadText>
            <UploadSubtext>
              Supported formats: JPEG, PNG, GIF, BMP, TIFF (Max 10MB)
            </UploadSubtext>
          </FileUploadArea>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            disabled={isUploading}
          />

          <AIServicesSection>
            <SectionTitle>Select AI Analysis Services</SectionTitle>
            <ServicesGrid>
              {AI_SERVICES.map(service => {
                const IconComponent = service.icon;
                const isSelected = formData.selectedAIServices.includes(service.id);
                
                return (
                  <ServiceCard
                    key={service.id}
                    isSelected={isSelected}
                    onClick={() => !isUploading && handleServiceToggle(service.id)}
                  >
                    <ServiceIcon color={service.color}>
                      <IconComponent />
                    </ServiceIcon>
                    <ServiceName>{service.name}</ServiceName>
                    <ServiceDescription>{service.description}</ServiceDescription>
                    {isSelected && (
                      <FaCheck style={{ color: '#28a745', marginTop: '8px' }} />
                    )}
                  </ServiceCard>
                );
              })}
            </ServicesGrid>
          </AIServicesSection>

          <ButtonGroup>
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isUploading || !formData.selectedFile || formData.selectedAIServices.length === 0}
            >
              {isUploading ? (
                <>
                  <FaSpinner className="fa-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <FaUpload />
                  Create Scan
                </>
              )}
            </Button>
          </ButtonGroup>
        </form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default ScanCreationModal;
