'use client'

import React, { useState, useRef, useEffect } from 'react';
import { FaUpload, FaTimes, FaBrain, FaLungs, FaHeart, FaImage, FaSpinner, FaCheck } from 'react-icons/fa';
import styled from 'styled-components';
import { supabase } from '@/lib/supabase';

interface ScanCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanCreated: (scan: any) => void;
}

interface ScanFormData {
  patientFirstName: string;
  patientLastName: string;
  patientIdNumber: string;
  patientEmail: string;
  patientPhone: string;
  patientDateOfBirth: string;
  patientGender: string;
  scanType: string;
  bodyPart: string;
  priority: string;
  scanDate: string;
  selectedFile: File | null; // first file for preview/label
  selectedAIServices: string[];
  createNewPatient: boolean;
  selectedPatientId: string;
}

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
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
  padding: 16px;

  @media (min-width: 640px) {
    padding: 20px;
  }
`;

const ModalContent = styled.div`
  background: #1a1a1a;
  border-radius: 8px;
  padding: 20px;
  max-width: 100%;
  width: 100%;
  max-height: 95vh;
  overflow-y: auto;
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.1);

  @media (min-width: 640px) {
    border-radius: 10px;
    padding: 24px;
    max-width: 600px;
  }

  @media (min-width: 768px) {
    border-radius: 12px;
    padding: 32px;
    max-width: 800px;
  }
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
  margin: 0 0 20px 0;
  font-size: 18px;
  display: flex;
  align-items: center;
  gap: 8px;

  @media (min-width: 640px) {
    font-size: 20px;
    gap: 10px;
    margin-bottom: 24px;
  }

  @media (min-width: 768px) {
    font-size: 24px;
    gap: 12px;
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin-bottom: 20px;

  @media (min-width: 640px) {
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 24px;
  }
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
  width: 100%;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #ffffff;
  font-size: 14px;
  font-family: var(--font-primary);
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);

  &::placeholder {
    color: #9c9c9c;
  }

  &:focus {
    outline: none;
    border-color: #0694fb;
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 0 3px rgba(6, 148, 251, 0.15);
  }

  &:hover {
    border-color: rgba(255, 255, 255, 0.2);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #ffffff;
  font-size: 14px;
  font-family: var(--font-primary);
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239c9c9c' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  padding-right: 40px;

  &::placeholder {
    color: #9c9c9c;
  }

  &:focus {
    outline: none;
    border-color: #0694fb;
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 0 3px rgba(6, 148, 251, 0.15);
  }

  &:hover {
    border-color: rgba(255, 255, 255, 0.2);
  }

  & option {
    background: #1a1a3a;
    color: #ffffff;
    padding: 8px;
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

const PatientSection = styled.div`
  margin-bottom: 24px;
`;

const PatientToggle = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
`;

const ToggleButton = styled.button<{ active: boolean }>`
  background: ${props => props.active ? '#0694fb' : 'rgba(255, 255, 255, 0.1)'};
  border: 1px solid ${props => props.active ? '#0694fb' : 'rgba(255, 255, 255, 0.2)'};
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.active ? '#0694fb' : 'rgba(255, 255, 255, 0.2)'};
  }
`;

const PatientSearchInput = styled.input`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  padding: 10px 16px;
  color: white;
  font-size: 14px;
  width: 100%;
  margin-bottom: 12px;
  
  &::placeholder {
    color: #888;
  }
  
  &:focus {
    outline: none;
    border-color: #0694fb;
  }
`;

const PatientList = styled.div`
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  margin-bottom: 16px;
`;

const PatientItem = styled.div<{ selected: boolean }>`
  padding: 12px 16px;
  cursor: pointer;
  background: ${props => props.selected ? 'rgba(6, 148, 251, 0.2)' : 'transparent'};
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: background 0.2s ease;

  &:hover {
    background: rgba(6, 148, 251, 0.1);
  }

  &:last-child {
    border-bottom: none;
  }
`;

const PatientName = styled.div`
  color: white;
  font-weight: 500;
  margin-bottom: 4px;
`;

const PatientDetails = styled.div`
  color: #ccc;
  font-size: 12px;
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
    patientEmail: '',
    patientPhone: '',
    patientDateOfBirth: '',
    patientGender: '',
    scanType: '',
    bodyPart: '',
    priority: 'medium',
    scanDate: new Date().toISOString().split('T')[0],
    selectedFile: null,
    selectedAIServices: [],
    createNewPatient: false,
    selectedPatientId: ''
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingPatients, setLoadingPatients] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedFilesRef = useRef<File[]>([]);

  // Load patients when modal opens
  useEffect(() => {
    if (isOpen && !formData.createNewPatient) {
      loadPatients();
    }
  }, [isOpen, formData.createNewPatient]);

  const loadPatients = async () => {
    try {
      setLoadingPatients(true);
      // Use Supabase session token for auth
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/patients?limit=1000&page=1`, {
        headers
      });
      const result = await response.json();
      
      if (result.status === 'success') {
        setPatients(result.data.patients || []);
      } else {
        setPatients([]);
      }
    } catch (error) {
      console.error('Error loading patients:', error);
      setPatients([]);
    } finally {
      setLoadingPatients(false);
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (field: keyof ScanFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      const file = files[0];
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/tiff', 'application/dicom'];
      const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.dcm', '.dicom'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      
      if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
        alert('Please select a valid file (JPEG, PNG, GIF, BMP, TIFF, DICOM)');
        return;
      }

      // Validate file size based on file type
      const isDicomFile = file.type === 'application/dicom' || 
                          fileExtension === '.dcm' || 
                          fileExtension === '.dicom';
      
      const maxSize = isDicomFile ? 100 * 1024 * 1024 : 10 * 1024 * 1024; // 100MB for DICOM, 10MB for images
      const maxSizeText = isDicomFile ? '100MB' : '10MB';
      
      if (file.size > maxSize) {
        alert(`File size too large. Please select a file smaller than ${maxSizeText}.`);
        return;
      }

      // Save first file for preview/label and keep all in ref
      selectedFilesRef.current = files;
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

  const handlePatientToggle = (createNew: boolean) => {
    setFormData(prev => ({
      ...prev,
      createNewPatient: createNew,
      selectedPatientId: createNew ? '' : prev.selectedPatientId
    }));
    if (!createNew) {
      loadPatients();
    }
  };

  const handlePatientSelect = (patient: Patient) => {
    setFormData(prev => ({
      ...prev,
      selectedPatientId: patient.id,
      patientFirstName: patient.firstName,
      patientLastName: patient.lastName,
      patientEmail: patient.email,
      patientPhone: patient.phone,
      patientDateOfBirth: patient.dateOfBirth,
      patientGender: patient.gender
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

    if (!formData.patientFirstName || !formData.patientLastName) {
      alert('Please provide patient first and last name');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Get authentication token from Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      console.log('Using token for scan creation:', token.substring(0, 20) + '...');

      let patientId = formData.selectedPatientId;

      // Create new patient if needed
      if (formData.createNewPatient || !patientId) {
        const patientData = {
          firstName: formData.patientFirstName,
          lastName: formData.patientLastName,
          dateOfBirth: formData.patientDateOfBirth || '1990-01-01',
          gender: formData.patientGender || 'other',
          contactNumber: formData.patientPhone || '',
          email: formData.patientEmail || '',
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
          assignedDoctorId: null
        };

        const patientResponse = await fetch('/api/patients', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(patientData)
        });

        const patientResult = await patientResponse.json();
        if (patientResult.status === 'success') {
          patientId = patientResult.data.patient.id;
        } else {
          throw new Error(patientResult.message || 'Failed to create patient');
        }
      }

      // Create FormData for file upload
      const uploadFormData = new FormData();
      // Append all selected images (first is used as thumbnail on server)
      const filesToUpload = selectedFilesRef.current.length > 0 ? selectedFilesRef.current : [formData.selectedFile];
      filesToUpload.forEach(f => uploadFormData.append('scanImages', f));
      // keep legacy single key for compatibility
      uploadFormData.append('scanImage', formData.selectedFile);
      uploadFormData.append('patientId', patientId); // Fixed: use patientId instead of patientIdNumber
      uploadFormData.append('scanType', formData.scanType);
      uploadFormData.append('bodyPart', formData.bodyPart);
      uploadFormData.append('priority', formData.priority);
      uploadFormData.append('analysisType', formData.selectedAIServices.join(','));
      uploadFormData.append('scanDate', formData.scanDate);

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

      // Call real API to create scan
      const response = await fetch('/api/scans', {
        method: 'POST',
        body: uploadFormData,
        headers: {
          'Authorization': `Bearer ${token}`
          // Note: Don't set Content-Type header when using FormData - let the browser set it automatically
        }
      });

      const result = await response.json();

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.status === 'success') {
        // Create scan object with real data
        const newScan = {
          id: result.data.scan.id,
          scanId: result.data.scan.scanId,
          patientFirstName: formData.patientFirstName,
          patientLastName: formData.patientLastName,
          patientIdNumber: patientId,
          scanType: formData.scanType,
          bodyPart: formData.bodyPart,
          priority: formData.priority,
          status: 'pending',
          scanDate: formData.scanDate,
          createdAt: new Date().toISOString(),
          imagePath: result.data.imagePath,
          selectedAIServices: formData.selectedAIServices
        };

        onScanCreated(newScan);
        onClose();

        // Reset form
        setFormData({
          patientFirstName: '',
          patientLastName: '',
          patientIdNumber: '',
          patientEmail: '',
          patientPhone: '',
          patientDateOfBirth: '',
          patientGender: '',
          scanType: '',
          bodyPart: '',
          priority: 'medium',
          scanDate: new Date().toISOString().split('T')[0],
          selectedFile: null,
          selectedAIServices: [],
          createNewPatient: false,
          selectedPatientId: ''
        });
        setUploadProgress(0);
      } else {
        throw new Error(result.message || 'Failed to create scan');
      }

    } catch (error) {
      console.error('Error creating scan:', error);
      alert(`Failed to create scan: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
            <LoadingText>Uploading images and saving scan... {uploadProgress}%</LoadingText>
          </LoadingOverlay>
        )}

        <ModalTitle>
          <FaUpload />
          Create New Scan
        </ModalTitle>

        <form onSubmit={handleSubmit}>
          {/* Patient Selection Section */}
          <PatientSection>
            <SectionTitle>Patient Information</SectionTitle>
            <PatientToggle>
              <ToggleButton
                type="button"
                active={formData.createNewPatient}
                onClick={() => handlePatientToggle(true)}
                disabled={isUploading}
              >
                Create New Patient
              </ToggleButton>
              <ToggleButton
                type="button"
                active={!formData.createNewPatient}
                onClick={() => handlePatientToggle(false)}
                disabled={isUploading}
              >
                Select Existing Patient
              </ToggleButton>
            </PatientToggle>

            {formData.createNewPatient ? (
              <FormGrid>
                <FormGroup>
                  <Label>Patient First Name *</Label>
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
                  <Label>Patient Last Name *</Label>
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
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.patientEmail}
                    onChange={(e) => handleInputChange('patientEmail', e.target.value)}
                    placeholder="Enter email"
                    disabled={isUploading}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Phone</Label>
                  <Input
                    type="tel"
                    value={formData.patientPhone}
                    onChange={(e) => handleInputChange('patientPhone', e.target.value)}
                    placeholder="Enter phone number"
                    disabled={isUploading}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Date of Birth</Label>
                  <Input
                    type="date"
                    value={formData.patientDateOfBirth}
                    onChange={(e) => handleInputChange('patientDateOfBirth', e.target.value)}
                    disabled={isUploading}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Gender</Label>
                  <Select
                    value={formData.patientGender}
                    onChange={(e) => handleInputChange('patientGender', e.target.value)}
                    disabled={isUploading}
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </Select>
                </FormGroup>
              </FormGrid>
            ) : (
              <div>
                {loadingPatients ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#0694fb' }}>
                    <FaSpinner className="fa-spin" style={{ marginRight: '8px' }} />
                    Loading patients...
                  </div>
                ) : (
                  <FormGroup>
                    <Label>Select Patient *</Label>
                    <Select
                      value={formData.selectedPatientId}
                      onChange={(e) => {
                        const selectedId = e.target.value;
                        const selected = patients.find(p => p.id === selectedId);
                        if (selected) {
                          handlePatientSelect(selected);
                        } else {
                          handleInputChange('selectedPatientId', selectedId);
                        }
                      }}
                      required
                      disabled={isUploading}
                    >
                      <option value="">Select a patient...</option>
                      {patients.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.firstName} {p.lastName} — {p.email}
                        </option>
                      ))}
                    </Select>
                  </FormGroup>
                )}
              </div>
            )}
          </PatientSection>

          {/* Scan Information Section */}
          <FormGrid>
            <FormGroup>
              <Label>Scan Type *</Label>
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
              <Label>Body Part *</Label>
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
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Scan Date</Label>
              <Input
                type="date"
                value={formData.scanDate}
                onChange={(e) => handleInputChange('scanDate', e.target.value)}
                disabled={isUploading}
              />
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
              {formData.selectedFile
                ? `${formData.selectedFile.name}${selectedFilesRef.current.length > 1 ? ` (+${selectedFilesRef.current.length - 1} more)` : ''}`
                : 'Click to upload scan files (you can select multiple)'}
            </UploadText>
            <UploadSubtext>
              Supported formats: JPEG, PNG, GIF, BMP, TIFF (Max 10MB), DICOM (Max 100MB)
            </UploadSubtext>
          </FileUploadArea>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.dcm,.dicom"
            multiple
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
