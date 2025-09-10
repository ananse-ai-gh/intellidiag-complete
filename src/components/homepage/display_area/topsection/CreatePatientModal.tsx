import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaUser, FaSave, FaSpinner, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBirthdayCake, FaVenusMars } from 'react-icons/fa';
import api from '@/services/api';

interface CreatePatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
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
  max-width: 600px;
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
    max-width: 550px;
  }

  @media (min-width: 769px) {
    padding: 36px 28px;
    max-width: 600px;
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

const InputIcon = styled.div`
  position: absolute;
  left: 16px;
  color: #9c9c9c;
  font-size: 16px;
  transition: color 0.3s ease;
  z-index: 2;

  ${InputField}:focus ~ &,
  ${SelectField}:focus ~ & {
    color: #0694fb;
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

const CreatePatientModal: React.FC<CreatePatientModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Comprehensive list of countries
  const countries = [
    'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan',
    'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi',
    'Cabo Verde', 'Cambodia', 'Cameroon', 'Canada', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic',
    'Democratic Republic of the Congo', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic',
    'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia',
    'Fiji', 'Finland', 'France',
    'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana',
    'Haiti', 'Honduras', 'Hungary',
    'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Ivory Coast',
    'Jamaica', 'Japan', 'Jordan',
    'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan',
    'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg',
    'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar',
    'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway',
    'Oman',
    'Pakistan', 'Palau', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal',
    'Qatar',
    'Romania', 'Russia', 'Rwanda',
    'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria',
    'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu',
    'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan',
    'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam',
    'Yemen',
    'Zambia', 'Zimbabwe'
  ];

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    contactNumber: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError('First name is required');
      return false;
    }
    if (!formData.lastName.trim()) {
      setError('Last name is required');
      return false;
    }
    if (!formData.dateOfBirth) {
      setError('Date of birth is required');
      return false;
    }
    if (!formData.gender) {
      setError('Gender is required');
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
      const response = await api.post('/api/patients', formData);

      setSuccess('Patient created successfully!');
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: '',
        contactNumber: '',
        email: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      });

      setTimeout(() => {
        onSuccess();
      }, 1500);

    } catch (err: any) {
      console.error('Error creating patient:', err);
      setError(err.response?.data?.message || 'Failed to create patient. Please try again.');
    } finally {
      setLoading(false);
    }
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
            <ModalTitle>Add New Patient</ModalTitle>
            <ModalDescription>
              Enter patient information to create a new patient record
            </ModalDescription>

            <FormContainer onSubmit={handleSubmit}>
              <FormSection>
                <SectionTitle>
                  <FaUser />
                  Personal Information
                </SectionTitle>
                <FormRow>
                  <InputGroup>
                    <InputLabel>First Name *</InputLabel>
                    <InputWrapper>
                      <InputField
                        type="text"
                        placeholder="Enter first name"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        required
                      />
                      <InputIcon>
                        <FaUser />
                      </InputIcon>
                    </InputWrapper>
                  </InputGroup>

                  <InputGroup>
                    <InputLabel>Last Name *</InputLabel>
                    <InputWrapper>
                      <InputField
                        type="text"
                        placeholder="Enter last name"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        required
                      />
                      <InputIcon>
                        <FaUser />
                      </InputIcon>
                    </InputWrapper>
                  </InputGroup>

                  <InputGroup>
                    <InputLabel>Date of Birth *</InputLabel>
                    <InputWrapper>
                      <InputField
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                        required
                      />
                      <InputIcon>
                        <FaBirthdayCake />
                      </InputIcon>
                    </InputWrapper>
                  </InputGroup>

                  <InputGroup>
                    <InputLabel>Gender *</InputLabel>
                    <InputWrapper>
                      <SelectField
                        value={formData.gender}
                        onChange={(e) => handleInputChange('gender', e.target.value)}
                        required
                      >
                        <option value="">Select gender...</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </SelectField>
                      <InputIcon>
                        <FaVenusMars />
                      </InputIcon>
                    </InputWrapper>
                  </InputGroup>
                </FormRow>
              </FormSection>

              <FormSection>
                <SectionTitle>
                  <FaEnvelope />
                  Contact Information
                </SectionTitle>
                <FormRow>
                  <InputGroup>
                    <InputLabel>Contact Number</InputLabel>
                    <InputWrapper>
                      <InputField
                        type="tel"
                        placeholder="Enter phone number"
                        value={formData.contactNumber}
                        onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                      />
                      <InputIcon>
                        <FaPhone />
                      </InputIcon>
                    </InputWrapper>
                  </InputGroup>

                  <InputGroup>
                    <InputLabel>Email Address</InputLabel>
                    <InputWrapper>
                      <InputField
                        type="email"
                        placeholder="Enter email address"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                      />
                      <InputIcon>
                        <FaEnvelope />
                      </InputIcon>
                    </InputWrapper>
                  </InputGroup>
                </FormRow>
              </FormSection>

              <FormSection>
                <SectionTitle>
                  <FaMapMarkerAlt />
                  Address Information
                </SectionTitle>
                <FormRow>
                  <InputGroup>
                    <InputLabel>Street Address</InputLabel>
                    <InputWrapper>
                      <InputField
                        type="text"
                        placeholder="Enter street address"
                        value={formData.street}
                        onChange={(e) => handleInputChange('street', e.target.value)}
                      />
                      <InputIcon>
                        <FaMapMarkerAlt />
                      </InputIcon>
                    </InputWrapper>
                  </InputGroup>

                  <InputGroup>
                    <InputLabel>City</InputLabel>
                    <InputWrapper>
                      <InputField
                        type="text"
                        placeholder="Enter city"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                      />
                      <InputIcon>
                        <FaMapMarkerAlt />
                      </InputIcon>
                    </InputWrapper>
                  </InputGroup>

                  <InputGroup>
                    <InputLabel>State/Province</InputLabel>
                    <InputWrapper>
                      <InputField
                        type="text"
                        placeholder="Enter state/province"
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                      />
                      <InputIcon>
                        <FaMapMarkerAlt />
                      </InputIcon>
                    </InputWrapper>
                  </InputGroup>

                  <InputGroup>
                    <InputLabel>ZIP/Postal Code</InputLabel>
                    <InputWrapper>
                      <InputField
                        type="text"
                        placeholder="Enter ZIP/postal code"
                        value={formData.zipCode}
                        onChange={(e) => handleInputChange('zipCode', e.target.value)}
                      />
                      <InputIcon>
                        <FaMapMarkerAlt />
                      </InputIcon>
                    </InputWrapper>
                  </InputGroup>

                  <InputGroup>
                    <InputLabel>Country</InputLabel>
                    <InputWrapper>
                      <SelectField
                        value={formData.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                      >
                        <option value="">Select country...</option>
                        {countries.map(country => (
                          <option key={country} value={country}>
                            {country}
                          </option>
                        ))}
                      </SelectField>
                      <InputIcon>
                        <FaMapMarkerAlt />
                      </InputIcon>
                    </InputWrapper>
                  </InputGroup>
                </FormRow>
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
                  disabled={loading}
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
                      Create Patient
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
    </AnimatePresence>
  );
};

export default CreatePatientModal;
