'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import styled from 'styled-components';

const RegisterContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000000;
  padding: 16px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 80%, rgba(6, 148, 251, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(0, 149, 255, 0.15) 0%, transparent 50%);
    pointer-events: none;
  }

  @media (min-width: 768px) {
    padding: 20px;
  }
`;

const RegisterCard = styled.div`
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 28px 20px;
  width: 100%;
  max-width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.8);
  position: relative;
  z-index: 10;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(6, 148, 251, 0.1), rgba(0, 149, 255, 0.1));
    border-radius: 20px;
    z-index: -1;
  }

  @media (min-width: 768px) {
    border-radius: 24px;
    padding: 40px;
    max-width: 520px;
  }
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: 24px;
  
  img {
    height: 40px;
    width: auto;
    filter: drop-shadow(0 4px 8px rgba(6, 148, 251, 0.4));
  }

  @media (min-width: 768px) {
    margin-bottom: 28px;
    
    img {
      height: 48px;
    }
  }
`;

const Title = styled.h1`
  color: #ffffff;
  font-size: 24px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #ffffff, #e0e0e0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 30px rgba(255, 255, 255, 0.3);

  @media (min-width: 768px) {
    font-size: 28px;
    margin-bottom: 10px;
  }
`;

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  text-align: center;
  margin-bottom: 28px;
  line-height: 1.4;
  max-width: 100%;
  margin-left: auto;
  margin-right: auto;

  @media (min-width: 768px) {
    font-size: 15px;
    margin-bottom: 32px;
    max-width: 400px;
    line-height: 1.5;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 18px;
  max-width: 100%;
  margin: 0 auto;

  @media (min-width: 768px) {
    gap: 20px;
    max-width: 440px;
  }
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  @media (min-width: 768px) {
    gap: 8px;
  }
`;

const Label = styled.label`
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-left: 2px;

  @media (min-width: 768px) {
    font-size: 13px;
    letter-spacing: 0.8px;
    margin-left: 3px;
  }
`;

const Input = styled.input`
  padding: 12px 16px;
  border: 1.5px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
  font-size: 14px;
  outline: none;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  cursor: text;
  width: 100%;
  box-sizing: border-box;

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }

  &:focus {
    border-color: #0694fb;
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 0 3px rgba(6, 148, 251, 0.15);
    transform: translateY(-1px);
  }

  &:hover {
    border-color: rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.06);
  }

  @media (min-width: 768px) {
    padding: 14px 18px;
    border-radius: 12px;
    font-size: 15px;
  }
`;

const Select = styled.select`
  padding: 12px 16px;
  border: 1.5px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
  font-size: 14px;
  outline: none;
  transition: all 0.3s ease;
  cursor: pointer;
  backdrop-filter: blur(10px);
  width: 100%;
  box-sizing: border-box;

  &:focus {
    border-color: #0694fb;
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 0 3px rgba(6, 148, 251, 0.15);
    transform: translateY(-1px);
  }

  &:hover {
    border-color: rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.06);
  }

  option {
    background: #1a1a1a;
    color: #ffffff;
    padding: 10px;
  }

  @media (min-width: 768px) {
    padding: 14px 18px;
    border-radius: 12px;
    font-size: 15px;
  }
`;

const Button = styled.button`
  padding: 14px;
  background: linear-gradient(135deg, #0694fb, #0094ff);
  border: none;
  border-radius: 10px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 12px;
  position: relative;
  overflow: hidden;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  width: 100%;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 30px rgba(6, 148, 251, 0.4);
    
    &::before {
      left: 100%;
    }
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  @media (min-width: 768px) {
    padding: 16px;
    border-radius: 12px;
    font-size: 15px;
    letter-spacing: 0.8px;
    margin-top: 16px;
    width: auto;
    min-width: 180px;
  }
`;

const ErrorMessage = styled.div`
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
  border: 1px solid rgba(255, 107, 107, 0.3);
  border-radius: 8px;
  padding: 12px;
  font-size: 13px;
  text-align: center;
  backdrop-filter: blur(10px);

  @media (min-width: 768px) {
    padding: 14px;
    font-size: 14px;
  }
`;

const SuccessMessage = styled.div`
  color: #51cf66;
  background: rgba(81, 207, 102, 0.1);
  border: 1px solid rgba(81, 207, 102, 0.3);
  border-radius: 8px;
  padding: 12px;
  font-size: 13px;
  text-align: center;
  backdrop-filter: blur(10px);

  @media (min-width: 768px) {
    padding: 14px;
    font-size: 14px;
  }
`;

const Footer = styled.div`
  text-align: center;
  margin-top: 28px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;

  @media (min-width: 768px) {
    margin-top: 32px;
    font-size: 14px;
  }
`;

const FooterLink = styled(Link)`
  color: #0694fb;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  margin-left: 5px;
  cursor: pointer;

  &:hover {
    color: #0094ff;
    text-shadow: 0 0 15px rgba(6, 148, 251, 0.6);
  }

  @media (min-width: 768px) {
    margin-left: 6px;
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  margin-bottom: 24px;
  overflow: hidden;
  max-width: 100%;
  margin-left: auto;
  margin-right: auto;

  @media (min-width: 768px) {
    margin-bottom: 28px;
    max-width: 440px;
  }
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #0694fb, #0094ff);
  border-radius: 2px;
  transition: width 0.3s ease;
  width: ${props => props.progress}%;
  box-shadow: 0 0 8px rgba(6, 148, 251, 0.4);
`;

const FormSection = styled.div`
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 18px 16px;
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(10px);
  margin-bottom: 16px;
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(255, 255, 255, 0.15);
    background: rgba(255, 255, 255, 0.03);
  }

  @media (min-width: 768px) {
    border-radius: 16px;
    padding: 22px 20px;
    margin-bottom: 20px;
  }
`;

const SectionTitle = styled.h3`
  color: #0694fb;
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 16px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 8px;

  @media (min-width: 768px) {
    font-size: 16px;
    margin-bottom: 18px;
    letter-spacing: 0.8px;
    gap: 10px;
  }
`;

const SectionIcon = styled.span`
  font-size: 16px;
  opacity: 0.9;

  @media (min-width: 768px) {
    font-size: 18px;
  }
`;

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'doctor',
    specialization: '',
    licenseNumber: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const { register, error: authError } = useAuth();
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match');
      setMessageType('error');
      return false;
    }
    if (formData.password.length < 8) {
      setMessage('Password must be at least 8 characters long');
      setMessageType('error');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setMessage('');
    setMessageType('');

    try {
      const { confirmPassword, ...registrationData } = formData;
      const result = await register(registrationData);
      
      if (result.success) {
        setMessage('Registration successful! Redirecting to dashboard...');
        setMessageType('success');
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        setMessage(result.error);
        setMessageType('error');
      }
    } catch (err) {
      setMessage('An unexpected error occurred');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const getProgress = () => {
    const fields = Object.values(formData).filter(value => value !== '');
    return Math.round((fields.length / Object.keys(formData).length) * 100);
  };

  return (
    <RegisterContainer>
      <RegisterCard>
        <Logo>
          <img src="/intellidiag.png" alt="IntelliDiag Logo" />
        </Logo>
        
        <Title>Join IntelliDiag</Title>
        <Subtitle>
          Create your account and start revolutionizing medical diagnostics with AI-powered insights
        </Subtitle>

        <ProgressBar>
          <ProgressFill progress={getProgress()} />
        </ProgressBar>

        <Form onSubmit={handleSubmit}>
          {message && (
            <div>
              {messageType === 'error' ? (
                <ErrorMessage>{message}</ErrorMessage>
              ) : (
                <SuccessMessage>{message}</SuccessMessage>
              )}
            </div>
          )}

          {authError && <ErrorMessage>{authError}</ErrorMessage>}

          <FormSection>
            <SectionTitle>
              <SectionIcon>👤</SectionIcon>
              Personal Information
            </SectionTitle>
            <FormRow>
              <FormGroup>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Enter first name"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Enter last name"
                  required
                />
              </FormGroup>
            </FormRow>

            <FormGroup>
              <Label htmlFor="email">Email Address</Label>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email address"
                required
              />
            </FormGroup>
          </FormSection>

          <FormSection>
            <SectionTitle>
              <SectionIcon>🔐</SectionIcon>
              Security
            </SectionTitle>
            <FormRow>
              <FormGroup>
                <Label htmlFor="password">Password</Label>
                <Input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  required
                />
              </FormGroup>
            </FormRow>
          </FormSection>

          <FormSection>
            <SectionTitle>
              <SectionIcon>🏥</SectionIcon>
              Professional Details
            </SectionTitle>
            <FormGroup>
              <Label htmlFor="role">Professional Role</Label>
              <Select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="doctor">Medical Doctor</option>
                <option value="radiologist">Radiologist</option>
                <option value="admin">Administrator</option>
              </Select>
            </FormGroup>

            <FormRow>
              <FormGroup>
                <Label htmlFor="specialization">Specialization</Label>
                <Input
                  type="text"
                  id="specialization"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  placeholder="e.g., Cardiology, Neurology"
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="licenseNumber">License Number</Label>
                <Input
                  type="text"
                  id="licenseNumber"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  placeholder="Professional license number"
                />
              </FormGroup>
            </FormRow>
          </FormSection>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Create IntelliDiag Account'}
          </Button>
        </Form>

        <Footer>
          Already have an account?
          <FooterLink href="/login">Sign In</FooterLink>
        </Footer>
      </RegisterCard>
    </RegisterContainer>
  );
}
