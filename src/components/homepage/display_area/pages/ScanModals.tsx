'use client'

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  FaTimes, FaUpload, FaEye, FaDownload, FaShare, FaPrint, 
  FaCopy, FaLink, FaImage, FaFileMedical, FaUser, FaCalendar,
  FaBrain, FaCheck, FaExclamationTriangle, FaClock, FaEdit
} from 'react-icons/fa';
import api from '@/services/api';

// Interfaces
interface Scan {
  id: number;
  scanId: string;
  patientFirstName: string;
  patientLastName: string;
  patientIdNumber: string;
  scanType: string;
  bodyPart: string;
  scanDate: string;
  priority: string;
  status: string;
  notes?: string;
  createdAt: string;
  uploadedByFirstName: string;
  uploadedByLastName: string;
  aiStatus?: string;
  confidence?: number;
  aiFindings?: string;
  imagePath?: string;
  patientId: number;
}

interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  patientId: string;
  dateOfBirth: string;
  gender: string;
  contactNumber: string;
  email: string;
}

interface ScanFormData {
  patientId: string;
  scanType: string;
  bodyPart: string;
  priority: string;
  notes: string;
  scanDate: string;
  scanImage: File | null;
}

// Styled Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContainer = styled.div`
  background-color: #1A1A1A;
  border: 1px solid #333;
  border-radius: 12px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0 24px;
  border-bottom: 1px solid #333;
  padding-bottom: 16px;
`;

const ModalTitle = styled.h2`
  color: #FFFFFF;
  margin: 0;
  font-size: 20px;
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #A0A0A0;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s ease;

  &:hover {
    color: #FFFFFF;
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const ModalContent = styled.div`
  padding: 24px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  color: #FFFFFF;
  font-size: 14px;
  font-weight: 500;
`;

const Input = styled.input`
  padding: 12px 16px;
  background-color: #0F0F0F;
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

const SelectField = styled.select`
  padding: 12px 16px;
  background-color: #0F0F0F;
  border: 1px solid #333;
  border-radius: 8px;
  color: #FFFFFF;
  font-size: 14px;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #0694FB;
  }

  & option {
    background: #1a1a3a;
    color: #ffffff;
    padding: 8px;
  }
`;

const TextArea = styled.textarea`
  padding: 12px 16px;
  background-color: #0F0F0F;
  border: 1px solid #333;
  border-radius: 8px;
  color: #FFFFFF;
  font-size: 14px;
  resize: vertical;
  min-height: 100px;

  &:focus {
    outline: none;
    border-color: #0694FB;
  }

  &::placeholder {
    color: #A0A0A0;
  }
`;

const FileUpload = styled.div`
  border: 2px dashed #333;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #0694FB;
    background-color: rgba(6, 148, 251, 0.05);
  }

  &.has-file {
    border-color: #28A745;
    background-color: rgba(40, 167, 69, 0.05);
  }
`;

const FileUploadIcon = styled.div`
  font-size: 48px;
  color: #A0A0A0;
  margin-bottom: 16px;
`;

const FileUploadText = styled.div`
  color: #A0A0A0;
  font-size: 14px;
  margin-bottom: 8px;
`;

const FileUploadSubtext = styled.div`
  color: #666;
  font-size: 12px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #333;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' | 'success' }>`
  background: ${props => {
    switch (props.variant) {
      case 'secondary': return 'rgba(255, 255, 255, 0.1)';
      case 'danger': return 'linear-gradient(135deg, #DC3545, #C82333)';
      case 'success': return 'linear-gradient(135deg, #28A745, #20C997)';
      default: return 'linear-gradient(135deg, #0694FB, #0094ff)';
    }
  }};
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(6, 148, 251, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ScanImageContainer = styled.div`
  text-align: center;
  margin-bottom: 24px;
`;

const ScanImage = styled.img`
  max-width: 100%;
  max-height: 400px;
  border-radius: 8px;
  border: 1px solid #333;
`;

const ScanInfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const InfoCard = styled.div`
  background-color: #0F0F0F;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 16px;
`;

const InfoTitle = styled.h3`
  color: #A0A0A0;
  font-size: 12px;
  font-weight: 500;
  margin: 0 0 8px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const InfoValue = styled.div`
  color: #FFFFFF;
  font-size: 16px;
  font-weight: 500;
`;

const StatusBadge = styled.span<{ status: string }>`
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  background-color: ${props => {
    switch (props.status) {
      case 'completed': return 'rgba(40, 167, 69, 0.2)';
      case 'pending': return 'rgba(255, 193, 7, 0.2)';
      case 'analyzing': return 'rgba(6, 148, 251, 0.2)';
      case 'archived': return 'rgba(108, 117, 125, 0.2)';
      default: return 'rgba(108, 117, 125, 0.2)';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'completed': return '#28A745';
      case 'pending': return '#FFC107';
      case 'analyzing': return '#0694FB';
      case 'archived': return '#6C757D';
      default: return '#6C757D';
    }
  }};
`;

const PriorityBadge = styled.span<{ priority: string }>`
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  background-color: ${props => {
    switch (props.priority) {
      case 'urgent': return 'rgba(220, 53, 69, 0.2)';
      case 'high': return 'rgba(255, 107, 107, 0.2)';
      case 'medium': return 'rgba(255, 193, 7, 0.2)';
      case 'low': return 'rgba(40, 167, 69, 0.2)';
      default: return 'rgba(108, 117, 125, 0.2)';
    }
  }};
  color: ${props => {
    switch (props.priority) {
      case 'urgent': return '#DC3545';
      case 'high': return '#FF6B6B';
      case 'medium': return '#FFC107';
      case 'low': return '#28A745';
      default: return '#6C757D';
    }
  }};
`;

const AIAnalysisSection = styled.div`
  background-color: #0F0F0F;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 20px;
  margin-top: 24px;
`;

const AIAnalysisHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const AIAnalysisTitle = styled.h3`
  color: #FFFFFF;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
`;

const ConfidenceBar = styled.div`
  width: 100%;
  height: 8px;
  background-color: #333;
  border-radius: 4px;
  overflow: hidden;
  margin: 8px 0;
`;

const ConfidenceFill = styled.div<{ confidence: number }>`
  height: 100%;
  background: linear-gradient(90deg, #DC3545, #FFC107, #28A745);
  width: ${props => props.confidence}%;
  transition: width 0.3s ease;
`;

// Create Scan Modal
export const CreateScanModal = ({ 
  isOpen, 
  onClose, 
  onSuccess 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSuccess: () => void;
}) => {
  const [formData, setFormData] = useState<ScanFormData>({
    patientId: '',
    scanType: '',
    bodyPart: '',
    priority: 'medium',
    notes: '',
    scanDate: new Date().toISOString().split('T')[0],
    scanImage: null
  });
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadPatients();
    }
  }, [isOpen]);

  const loadPatients = async () => {
    try {
      const response = await api.get('/api/patients');
      const patientsData = response.data?.data?.patients || [];
      setPatients(Array.isArray(patientsData) ? patientsData : []);
    } catch (error) {
      console.error('Error loading patients:', error);
    }
  };

  const handleInputChange = (field: keyof ScanFormData, value: string | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleInputChange('scanImage', file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('patientId', formData.patientId);
      formDataToSend.append('scanType', formData.scanType);
      formDataToSend.append('bodyPart', formData.bodyPart);
      formDataToSend.append('priority', formData.priority);
      formDataToSend.append('notes', formData.notes);
      formDataToSend.append('scanDate', formData.scanDate);
      if (formData.scanImage) {
        formDataToSend.append('scanImage', formData.scanImage);
      }

      await api.post('/api/scans', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      onSuccess();
      onClose();
      setFormData({
        patientId: '',
        scanType: '',
        bodyPart: '',
        priority: 'medium',
        notes: '',
        scanDate: new Date().toISOString().split('T')[0],
        scanImage: null
      });
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error creating scan');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Create New Scan</ModalTitle>
          <CloseButton onClick={onClose}>
            <FaTimes size={16} />
          </CloseButton>
        </ModalHeader>
        <ModalContent>
          <form onSubmit={handleSubmit}>
            <FormGrid>
              <FormGroup>
                <Label>Patient *</Label>
                <SelectField
                  value={formData.patientId}
                  onChange={(e) => handleInputChange('patientId', e.target.value)}
                  required
                >
                  <option value="">Select Patient</option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id}>
                      {patient.firstName} {patient.lastName} - {patient.patientId}
                    </option>
                  ))}
                </SelectField>
              </FormGroup>
              <FormGroup>
                <Label>Scan Type *</Label>
                <SelectField
                  value={formData.scanType}
                  onChange={(e) => handleInputChange('scanType', e.target.value)}
                  required
                >
                  <option value="">Select Scan Type</option>
                  <option value="X-Ray">X-Ray</option>
                  <option value="CT">CT</option>
                  <option value="MRI">MRI</option>
                  <option value="Ultrasound">Ultrasound</option>
                  <option value="PET">PET</option>
                  <option value="Other">Other</option>
                </SelectField>
              </FormGroup>
              <FormGroup>
                <Label>Body Part *</Label>
                <SelectField
                  value={formData.bodyPart}
                  onChange={(e) => handleInputChange('bodyPart', e.target.value)}
                  required
                >
                  <option value="">Select Body Part</option>
                  <option value="Chest">Chest</option>
                  <option value="Head">Head</option>
                  <option value="Abdomen">Abdomen</option>
                  <option value="Spine">Spine</option>
                  <option value="Extremities">Extremities</option>
                  <option value="Other">Other</option>
                </SelectField>
              </FormGroup>
              <FormGroup>
                <Label>Priority</Label>
                <SelectField
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </SelectField>
              </FormGroup>
              <FormGroup>
                <Label>Scan Date</Label>
                <Input
                  type="date"
                  value={formData.scanDate}
                  onChange={(e) => handleInputChange('scanDate', e.target.value)}
                />
              </FormGroup>
            </FormGrid>

            <FormGroup>
              <Label>Notes</Label>
              <TextArea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Enter any additional notes about the scan..."
              />
            </FormGroup>

            <FormGroup>
              <Label>Scan Image *</Label>
              <FileUpload 
                className={formData.scanImage ? 'has-file' : ''}
                onClick={() => document.getElementById('scan-image-upload')?.click()}
              >
                <FileUploadIcon>
                  <FaUpload />
                </FileUploadIcon>
                <FileUploadText>
                  {formData.scanImage ? formData.scanImage.name : 'Click to upload scan image'}
                </FileUploadText>
                <FileUploadSubtext>
                  Supported formats: JPG, PNG, DICOM (Max 10MB)
                </FileUploadSubtext>
              </FileUpload>
              <input
                id="scan-image-upload"
                type="file"
                accept="image/*,.dcm"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                required
              />
            </FormGroup>

            {error && (
              <div style={{ color: '#FF6B6B', marginBottom: '16px', fontSize: '14px' }}>
                {error}
              </div>
            )}

            <ButtonGroup>
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Scan'}
              </Button>
            </ButtonGroup>
          </form>
        </ModalContent>
      </ModalContainer>
    </ModalOverlay>
  );
};

// View Scan Modal
export const ViewScanModal = ({ 
  isOpen, 
  onClose, 
  scan 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  scan: Scan | null;
}) => {
  if (!isOpen || !scan) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Scan Details - {scan.scanId}</ModalTitle>
          <CloseButton onClick={onClose}>
            <FaTimes size={16} />
          </CloseButton>
        </ModalHeader>
        <ModalContent>
          {scan.imagePath && (
            <ScanImageContainer>
              <ScanImage src={scan.imagePath} alt="Scan Image" />
            </ScanImageContainer>
          )}

          <ScanInfoGrid>
            <InfoCard>
              <InfoTitle>Patient Information</InfoTitle>
              <InfoValue>
                {scan.patientFirstName} {scan.patientLastName}
              </InfoValue>
              <div style={{ fontSize: '12px', color: '#A0A0A0', marginTop: '4px' }}>
                ID: {scan.patientIdNumber}
              </div>
            </InfoCard>
            <InfoCard>
              <InfoTitle>Scan Information</InfoTitle>
              <InfoValue>{scan.scanType}</InfoValue>
              <div style={{ fontSize: '12px', color: '#A0A0A0', marginTop: '4px' }}>
                Body Part: {scan.bodyPart}
              </div>
            </InfoCard>
            <InfoCard>
              <InfoTitle>Status</InfoTitle>
              <StatusBadge status={scan.status}>
                {scan.status.charAt(0).toUpperCase() + scan.status.slice(1)}
              </StatusBadge>
            </InfoCard>
            <InfoCard>
              <InfoTitle>Priority</InfoTitle>
              <PriorityBadge priority={scan.priority}>
                {scan.priority.charAt(0).toUpperCase() + scan.priority.slice(1)}
              </PriorityBadge>
            </InfoCard>
            <InfoCard>
              <InfoTitle>Scan Date</InfoTitle>
              <InfoValue>{formatDate(scan.scanDate)}</InfoValue>
            </InfoCard>
            <InfoCard>
              <InfoTitle>Uploaded By</InfoTitle>
              <InfoValue>
                {scan.uploadedByFirstName} {scan.uploadedByLastName}
              </InfoValue>
              <div style={{ fontSize: '12px', color: '#A0A0A0', marginTop: '4px' }}>
                {formatDate(scan.createdAt)}
              </div>
            </InfoCard>
          </ScanInfoGrid>

          {scan.notes && (
            <InfoCard>
              <InfoTitle>Notes</InfoTitle>
              <InfoValue style={{ fontSize: '14px', fontWeight: 'normal' }}>
                {scan.notes}
              </InfoValue>
            </InfoCard>
          )}

          {scan.aiStatus && (
            <AIAnalysisSection>
              <AIAnalysisHeader>
                <FaBrain size={20} color="#0694FB" />
                <AIAnalysisTitle>AI Analysis</AIAnalysisTitle>
                <StatusBadge status={scan.aiStatus}>
                  {scan.aiStatus.charAt(0).toUpperCase() + scan.aiStatus.slice(1)}
                </StatusBadge>
              </AIAnalysisHeader>
              
              {scan.confidence && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#A0A0A0' }}>Confidence</span>
                    <span style={{ fontSize: '12px', color: '#FFFFFF' }}>{scan.confidence}%</span>
                  </div>
                  <ConfidenceBar>
                    <ConfidenceFill confidence={scan.confidence} />
                  </ConfidenceBar>
                </div>
              )}

              {scan.aiFindings && (
                <div style={{ marginTop: '16px' }}>
                  <div style={{ fontSize: '12px', color: '#A0A0A0', marginBottom: '8px' }}>
                    AI Findings
                  </div>
                  <div style={{ fontSize: '14px', color: '#FFFFFF', lineHeight: '1.5' }}>
                    {scan.aiFindings}
                  </div>
                </div>
              )}
            </AIAnalysisSection>
          )}

          <ButtonGroup>
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
            <Button variant="secondary">
              <FaDownload size={14} />
              Download
            </Button>
            <Button variant="secondary">
              <FaShare size={14} />
              Share
            </Button>
            <Button variant="secondary">
              <FaPrint size={14} />
              Print
            </Button>
          </ButtonGroup>
        </ModalContent>
      </ModalContainer>
    </ModalOverlay>
  );
};

// Edit Scan Modal
export const EditScanModal = ({ 
  isOpen, 
  onClose, 
  scan, 
  onSuccess 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  scan: Scan | null;
  onSuccess: () => void;
}) => {
  const [formData, setFormData] = useState<Partial<ScanFormData>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (scan) {
      setFormData({
        patientId: scan.patientId.toString(),
        scanType: scan.scanType,
        bodyPart: scan.bodyPart,
        priority: scan.priority,
        notes: scan.notes || '',
        scanDate: scan.scanDate,
        scanImage: null
      });
    }
  }, [scan]);

  const handleInputChange = (field: keyof ScanFormData, value: string | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scan) return;

    setLoading(true);
    setError('');

    try {
      const updateData = {
        scanType: formData.scanType,
        bodyPart: formData.bodyPart,
        priority: formData.priority,
        notes: formData.notes,
        scanDate: formData.scanDate
      };

      await api.put(`/api/scans/${scan.id}`, updateData);

      onSuccess();
      onClose();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error updating scan');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !scan) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Edit Scan - {scan.scanId}</ModalTitle>
          <CloseButton onClick={onClose}>
            <FaTimes size={16} />
          </CloseButton>
        </ModalHeader>
        <ModalContent>
          <form onSubmit={handleSubmit}>
            <FormGrid>
              <FormGroup>
                <Label>Scan Type *</Label>
                <SelectField
                  value={formData.scanType || ''}
                  onChange={(e) => handleInputChange('scanType', e.target.value)}
                  required
                >
                  <option value="">Select Scan Type</option>
                  <option value="X-Ray">X-Ray</option>
                  <option value="CT">CT</option>
                  <option value="MRI">MRI</option>
                  <option value="Ultrasound">Ultrasound</option>
                  <option value="PET">PET</option>
                  <option value="Other">Other</option>
                </SelectField>
              </FormGroup>
              <FormGroup>
                <Label>Body Part *</Label>
                <SelectField
                  value={formData.bodyPart || ''}
                  onChange={(e) => handleInputChange('bodyPart', e.target.value)}
                  required
                >
                  <option value="">Select Body Part</option>
                  <option value="Chest">Chest</option>
                  <option value="Head">Head</option>
                  <option value="Abdomen">Abdomen</option>
                  <option value="Spine">Spine</option>
                  <option value="Extremities">Extremities</option>
                  <option value="Other">Other</option>
                </SelectField>
              </FormGroup>
              <FormGroup>
                <Label>Priority</Label>
                <SelectField
                  value={formData.priority || ''}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </SelectField>
              </FormGroup>
              <FormGroup>
                <Label>Scan Date</Label>
                <Input
                  type="date"
                  value={formData.scanDate || ''}
                  onChange={(e) => handleInputChange('scanDate', e.target.value)}
                />
              </FormGroup>
            </FormGrid>

            <FormGroup>
              <Label>Notes</Label>
              <TextArea
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Enter any additional notes about the scan..."
              />
            </FormGroup>

            {error && (
              <div style={{ color: '#FF6B6B', marginBottom: '16px', fontSize: '14px' }}>
                {error}
              </div>
            )}

            <ButtonGroup>
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update Scan'}
              </Button>
            </ButtonGroup>
          </form>
        </ModalContent>
      </ModalContainer>
    </ModalOverlay>
  );
};
