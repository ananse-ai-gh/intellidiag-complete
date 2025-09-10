import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaUser, FaFileUpload, FaSave, FaSpinner, FaPlus, FaXRay, FaCalendar, FaExclamationTriangle, FaStickyNote } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import CreatePatientModal from './CreatePatientModal';

interface CreateCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Patient {
  id: number;
  patientId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
}

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  box-sizing: border-box;
`;

const ModalContainer = styled(motion.div)`
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 28px 20px;
  max-width: 700px;
  width: 100%;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.8);
  position: relative;
  overflow: visible;
  z-index: 1000;
  max-height: 90vh;
  overflow-y: auto;

  @media (min-width: 481px) and (max-width: 768px) {
    padding: 32px 24px;
    max-width: 600px;
  }

  @media (min-width: 769px) {
    padding: 36px 28px;
    max-width: 700px;
  }
`;

const ModalTitle = styled.h2`
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #fff;
  font-family: var(--font-primary);

  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const ModalDescription = styled.p`
  font-size: 14px;
  line-height: 1.5;
  margin: 0 0 24px 0;
  color: #ccc;
  font-family: var(--font-primary);

  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 25px;
  text-align: left;
`;

const FormSection = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border-radius: 15px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
`;

const SectionTitle = styled.h3`
  color: #fff;
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-primary);
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const InputLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  font-family: var(--font-primary);
`;

const InputField = styled.input`
  width: 100%;
  padding: 14px 16px 14px 45px;
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

  @media (min-width: 481px) and (max-width: 768px) {
    padding: 16px 16px 16px 45px;
    font-size: 15px;
  }

  @media (min-width: 769px) {
    padding: 16px 16px 16px 45px;
    font-size: 16px;
  }
`;

const SelectField = styled.select`
  width: 100%;
  padding: 12px 16px 12px 45px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
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

  @media (min-width: 481px) and (max-width: 768px) {
    padding: 14px 16px 14px 45px;
    font-size: 15px;
    padding-right: 40px;
  }

  @media (min-width: 769px) {
    padding: 16px 16px 16px 45px;
    font-size: 16px;
    padding-right: 40px;
  }
`;

const TextAreaField = styled.textarea`
  width: 100%;
  padding: 14px 16px 14px 45px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #ffffff;
  font-size: 14px;
  font-family: var(--font-primary);
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  resize: vertical;
  min-height: 100px;

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

  @media (min-width: 481px) and (max-width: 768px) {
    padding: 16px 16px 16px 45px;
    font-size: 15px;
  }

  @media (min-width: 769px) {
    padding: 16px 16px 16px 45px;
    font-size: 16px;
  }
`;

const InputIcon = styled.div`
  position: absolute;
  left: 16px;
  color: #9c9c9c;
  font-size: 16px;
  transition: color 0.3s ease;
  z-index: 2;

  ${InputField}:focus ~ &,
  ${SelectField}:focus ~ &,
  ${TextAreaField}:focus ~ & {
    color: #0694fb;
  }
`;

const FileUploadArea = styled.div<{ $dragOver: boolean }>`
  border: 2px dashed ${props => props.$dragOver ? '#0694fb' : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 15px;
  padding: 40px 20px;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
  background: ${props => props.$dragOver ? 'rgba(6, 148, 251, 0.1)' : 'rgba(255, 255, 255, 0.03)'};
  backdrop-filter: blur(10px);

  &:hover {
    border-color: #0694fb;
    background: rgba(6, 148, 251, 0.05);
    transform: translateY(-2px);
  }
`;

const FileUploadText = styled.p`
  color: #ccc;
  margin: 0 0 8px 0;
  font-size: 16px;
  font-family: var(--font-primary);
`;

const FileName = styled.p`
  color: #0694fb;
  margin: 8px 0 0 0;
  font-size: 14px;
  font-weight: 500;
  font-family: var(--font-primary);
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
`;

const EmptyStateText = styled.p`
  color: #9c9c9c;
  margin: 0 0 20px 0;
  font-size: 16px;
  font-family: var(--font-primary);
`;

const AddPatientButton = styled(motion.button)`
  background: linear-gradient(135deg, #0694fb, #0094ff);
  border: none;
  border-radius: 12px;
  padding: 14px 28px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: var(--font-primary);
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 auto;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(6, 148, 251, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const CancelButton = styled(motion.button)`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 14px 28px;
  font-size: 16px;
  font-weight: 600;
  color: #ccc;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: var(--font-primary);
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    color: #fff;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const SubmitButton = styled(motion.button)`
  background: linear-gradient(135deg, #0694fb, #0094ff);
  border: none;
  border-radius: 12px;
  padding: 14px 28px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: var(--font-primary);
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(6, 148, 251, 0.3);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`;

const Message = styled.div<{ $type: 'success' | 'error' }>`
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  text-align: center;
  margin-bottom: 20px;
  background: ${props => props.$type === 'success' 
    ? 'rgba(34, 197, 94, 0.1)' 
    : 'rgba(239, 68, 68, 0.1)'};
  border: 1px solid ${props => props.$type === 'success' 
    ? 'rgba(34, 197, 94, 0.3)' 
    : 'rgba(239, 68, 68, 0.3)'};
  color: ${props => props.$type === 'success' 
    ? '#22c55e' 
    : '#ef4444'};
  backdrop-filter: blur(10px);
  font-family: var(--font-primary);
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #ffffff;
  animation: spin 1s ease-in-out infinite;
  margin-right: 8px;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const CloseButton = styled(motion.button)`
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #fff;
  font-size: 20px;
  transition: all 0.3s ease;
  z-index: 1002;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: rotate(90deg);
  }
`;

const CreateCaseModal: React.FC<CreateCaseModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [showPatientModal, setShowPatientModal] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    patientId: '',
    scanType: '',
    bodyPart: '',
    priority: 'medium',
    notes: '',
    scanDate: new Date().toISOString().split('T')[0],
    analysisType: 'auto'
  });

  // Load patients on component mount
  useEffect(() => {
    if (isOpen) {
      loadPatients();
    }
  }, [isOpen]);

  const loadPatients = async () => {
    try {
      const response = await api.get('/api/patients');
      setPatients(response.data.data.patients || []);
    } catch (err) {
      console.error('Error loading patients:', err);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleFileDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
  };

  const validateForm = () => {
    if (!formData.patientId) {
      setError('Please select a patient');
      return false;
    }
    if (!formData.scanType) {
      setError('Please select a scan type');
      return false;
    }
    if (!formData.bodyPart) {
      setError('Please specify the body part');
      return false;
    }
    if (!selectedFile) {
      setError('Please upload a scan image');
      return false;
    }
    return true;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('patientId', formData.patientId);
      submitData.append('scanType', formData.scanType);
      submitData.append('bodyPart', formData.bodyPart);
      submitData.append('priority', formData.priority);
      submitData.append('notes', formData.notes);
      submitData.append('scanDate', formData.scanDate);
      submitData.append('analysisType', formData.analysisType);
      submitData.append('scanImage', selectedFile!);

      const response = await api.post('/api/scans', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess('Case created successfully! Redirecting to cases...');
      setTimeout(() => {
        onClose();
        // Pass the scan ID as a query parameter to highlight the new case
        router.push(`/dashboard/cases?newScan=${response.data.data.scan.id}`);
      }, 1500);

    } catch (err: any) {
      console.error('Error creating case:', err);
      setError(err.response?.data?.message || 'Failed to create case. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePatientCreated = () => {
    setShowPatientModal(false);
    loadPatients(); // Reload patients list
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <ModalOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ModalContainer
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <ModalTitle>Create New Case</ModalTitle>
            <ModalDescription>
              Add a new medical case with patient information and scan details
            </ModalDescription>

            <FormContainer onSubmit={handleSubmit}>
              <FormSection>
                <SectionTitle>
                  <FaUser />
                  Patient Information
                </SectionTitle>
                <InputGroup>
                  <InputLabel>Select Patient *</InputLabel>
                  <InputWrapper>
                    <SelectField
                      value={formData.patientId}
                      onChange={(e) => handleInputChange('patientId', e.target.value)}
                      required
                    >
                      <option value="">Choose a patient...</option>
                      {patients.map(patient => (
                        <option key={patient.id} value={patient.id}>
                          {patient.patientId} - {patient.firstName} {patient.lastName}
                        </option>
                      ))}
                    </SelectField>
                    <InputIcon>
                      <FaUser />
                    </InputIcon>
                  </InputWrapper>
                  <AddPatientButton 
                    onClick={() => setShowPatientModal(true)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      marginTop: '8px',
                      padding: '8px 16px',
                      fontSize: '14px',
                      background: 'rgba(6, 148, 251, 0.1)',
                      border: '1px solid rgba(6, 148, 251, 0.3)',
                      color: '#0694fb'
                    }}
                  >
                    <FaPlus size={12} />
                    Add New Patient
                  </AddPatientButton>
                </InputGroup>
              </FormSection>

              <FormSection>
                <SectionTitle>
                  <FaXRay />
                  Scan Details
                </SectionTitle>
                <FormRow>
                  <InputGroup>
                    <InputLabel>Scan Type *</InputLabel>
                    <InputWrapper>
                      <SelectField
                        value={formData.scanType}
                        onChange={(e) => handleInputChange('scanType', e.target.value)}
                        required
                      >
                        <option value="">Select scan type...</option>
                        <option value="X-Ray">X-Ray</option>
                        <option value="CT">CT</option>
                        <option value="MRI">MRI</option>
                        <option value="Ultrasound">Ultrasound</option>
                        <option value="PET">PET</option>
                        <option value="Other">Other</option>
                      </SelectField>
                      <InputIcon>
                        <FaXRay />
                      </InputIcon>
                    </InputWrapper>
                  </InputGroup>

                  <InputGroup>
                    <InputLabel>Body Part *</InputLabel>
                    <InputWrapper>
                      <InputField
                        type="text"
                        placeholder="e.g., Chest, Brain, Spine"
                        value={formData.bodyPart}
                        onChange={(e) => handleInputChange('bodyPart', e.target.value)}
                        required
                      />
                      <InputIcon>
                        <FaUser />
                      </InputIcon>
                    </InputWrapper>
                  </InputGroup>

                  <InputGroup>
                    <InputLabel>Priority</InputLabel>
                    <InputWrapper>
                      <SelectField
                        value={formData.priority}
                        onChange={(e) => handleInputChange('priority', e.target.value)}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </SelectField>
                      <InputIcon>
                        <FaExclamationTriangle />
                      </InputIcon>
                    </InputWrapper>
                  </InputGroup>

                  <InputGroup>
                    <InputLabel>Scan Date</InputLabel>
                    <InputWrapper>
                      <InputField
                        type="date"
                        value={formData.scanDate}
                        onChange={(e) => handleInputChange('scanDate', e.target.value)}
                      />
                      <InputIcon>
                        <FaCalendar />
                      </InputIcon>
                    </InputWrapper>
                  </InputGroup>
                </FormRow>

                <InputGroup>
                  <InputLabel>Clinical Notes</InputLabel>
                  <InputWrapper>
                    <TextAreaField
                      placeholder="Enter clinical notes, symptoms, or additional information..."
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      rows={3}
                    />
                    <InputIcon>
                      <FaStickyNote />
                    </InputIcon>
                  </InputWrapper>
                </InputGroup>

                <InputGroup>
                  <InputLabel>AI Analysis Type</InputLabel>
                  <InputWrapper>
                    <SelectField
                      value={formData.analysisType}
                      onChange={(e) => handleInputChange('analysisType', e.target.value)}
                    >
                      <option value="auto">Auto-detect (Recommended)</option>
                      <option value="brain_tumor">Brain Tumor Analysis</option>
                      <option value="breast_cancer">Breast Cancer Detection</option>
                      <option value="lung_tumor">Lung Tumor Analysis</option>
                      <option value="ct_to_mri">CT to MRI Conversion</option>
                      <option value="mri_to_ct">MRI to CT Conversion</option>
                    </SelectField>
                    <InputIcon>
                      <FaXRay />
                    </InputIcon>
                  </InputWrapper>
                </InputGroup>
              </FormSection>

              <FormSection>
                <SectionTitle>
                  <FaFileUpload />
                  Upload Scan Image
                </SectionTitle>
                <FileUploadArea
                  $dragOver={dragOver}
                  onDrop={handleFileDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => document.getElementById('file-input')?.click()}
                >
                  <FileUploadText>
                    {selectedFile ? 'File selected' : 'Click to upload or drag and drop scan image'}
                  </FileUploadText>
                  {selectedFile && (
                    <FileName>{selectedFile.name}</FileName>
                  )}
                </FileUploadArea>
                <HiddenFileInput
                  id="file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                />
              </FormSection>

              {error && <Message $type="error">{error}</Message>}
              {success && <Message $type="success">{success}</Message>}

              <ButtonGroup>
                <CancelButton 
                  type="button" 
                  onClick={onClose}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </CancelButton>
                <SubmitButton
                  type="submit"
                  disabled={loading || patients.length === 0}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <>
                      <LoadingSpinner />
                      Creating...
                    </>
                  ) : (
                    <>
                      <FaSave />
                      Create Case
                    </>
                  )}
                </SubmitButton>
              </ButtonGroup>
            </FormContainer>

            <CloseButton 
              onClick={onClose}
              whileHover={{ rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              ×
            </CloseButton>
          </ModalContainer>
        </ModalOverlay>
      )}

      {showPatientModal && (
        <CreatePatientModal
          isOpen={showPatientModal}
          onClose={() => setShowPatientModal(false)}
          onSuccess={handlePatientCreated}
        />
      )}
    </AnimatePresence>
  );
};

export default CreateCaseModal;
