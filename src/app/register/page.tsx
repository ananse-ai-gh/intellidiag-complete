'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import styled from 'styled-components';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaEnvelope, FaIdCard, FaGraduationCap } from 'react-icons/fa';
import Image from 'next/image';

const RegisterContainer = styled.div`
  font-family: "SF Pro Display";
  min-height: 100vh;
  width: 100%;
  color: #fff;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
  background: #000000;
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

  /* Mobile devices (320px - 480px) */
  @media (min-width: 320px) and (max-width: 480px) {
    padding: 15px;
  }
`;

const RegisterCard = styled.div`
  width: 90%;
  max-width: 600px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 40px 30px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.8);
  position: relative;
  z-index: 10;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.9);
  }

  @media (min-width: 481px) and (max-width: 768px) {
    padding: 50px 40px;
    max-width: 650px;
  }

  @media (min-width: 769px) {
    padding: 60px 50px;
    max-width: 700px;
  }
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }

  .logo-image {
    height: 40px;
    width: auto;
    filter: drop-shadow(0 4px 8px rgba(6, 148, 251, 0.4));
  }

  @media (min-width: 481px) and (max-width: 768px) {
    margin-bottom: 35px;
    
    .logo-image {
      height: 45px;
    }
  }

  @media (min-width: 769px) {
    margin-bottom: 40px;
    
    .logo-image {
      height: 50px;
    }
  }
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 500;
  margin: 0;
  line-height: 1.2;
  color: #ffffff;
  text-align: center;
  margin-bottom: 8px;

  /* Mobile devices (320px - 480px) */
  @media (min-width: 320px) and (max-width: 480px) {
    font-size: 28px;
    margin-bottom: 10px;
  }

  /* iPads, Tablets (481px - 768px) */
  @media (min-width: 481px) and (max-width: 768px) {
    font-size: 42px;
    margin-bottom: 0px;
  }

  /* Small screens, laptops (769px - 1024px) */
  @media (min-width: 769px) and (max-width: 1024px) {
    font-size: 52px;
    margin-bottom: 0px;
    width: 90%;
  }

  /* Desktops, large screens (1024px - 1200px) */
  @media (min-width: 1024px) and (max-width: 1200px) {
    font-size: 58px;
    margin-bottom: 0px;
  }

  /* Extra large screens, TV (1201px and more) */
  @media (min-width: 1201px) {
    font-size: 62px;
  }
`;

const Subtitle = styled.h2`
  font-size: 14px;
  font-weight: 400;
  color: #9c9c9c;
  margin: 0;
  text-align: center;
  margin-bottom: 35px;
  line-height: 1.5;

  @media (min-width: 320px) and (max-width: 480px) {
    font-size: 16px;
    margin-top: 0;
  }

  /* iPads, Tablets (481px - 768px) */
  @media (min-width: 481px) and (max-width: 768px) {
    font-size: 22px;
    margin-bottom: 25px;
  }

  /* Small screens, laptops (769px - 1023px) */
  @media (min-width: 769px) and (max-width: 1023px) {
    font-size: 25px;
    margin-bottom: 25px;
    margin-top: 0;
  }

  /* Desktops, large screens (1023px - 1200px) */
  @media (min-width: 1023px) and (max-width: 1200px) {
    font-size: 28px;
    margin-bottom: 25px;
  }

  /* Extra large screens, TV (1201px and more) */
  @media (min-width: 1201px) {
    font-size: 23px;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;

  @media (min-width: 481px) and (max-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (min-width: 769px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const FormGroup = styled.div`
  position: relative;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const Input = styled.input`
  width: 100%;
  padding: 16px 20px 16px 50px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 13px;
  color: #ffffff;
  font-size: 16px;
  font-family: "SF Pro Display";
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
    padding: 18px 20px 18px 50px;
    font-size: 17px;
  }

  @media (min-width: 769px) {
    padding: 20px 20px 20px 50px;
    font-size: 18px;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 16px 20px 16px 50px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 13px;
  color: #ffffff;
  font-size: 16px;
  font-family: "SF Pro Display";
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239c9c9c' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 12px center;
  background-repeat: no-repeat;
  background-size: 16px 12px;
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

  option {
    background: #1a1a1a;
    color: #ffffff;
  }

  @media (min-width: 481px) and (max-width: 768px) {
    padding: 18px 20px 18px 50px;
    font-size: 17px;
    padding-right: 40px;
  }

  @media (min-width: 769px) {
    padding: 20px 20px 20px 50px;
    font-size: 18px;
    padding-right: 40px;
  }
`;

const InputIcon = styled.div`
  position: absolute;
  left: 18px;
  color: #9c9c9c;
  font-size: 18px;
  transition: color 0.3s ease;
  z-index: 2;
  pointer-events: none;

  ${Input}:focus ~ &,
  ${Select}:focus ~ & {
    color: #0694fb;
  }
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 18px;
  background: none;
  border: none;
  color: #9c9c9c;
  font-size: 18px;
  cursor: pointer;
  transition: color 0.3s ease;
  z-index: 2;

  &:hover {
    color: #0694fb;
  }
`;

const RegisterButton = styled.button`
  height: 48px;
  width: 160px;
  background-color: #0694fb;
  border: none;
  border-radius: 13px;
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  font-family: "SF Pro Display";
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 25px rgba(6, 148, 251, 0.3);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  @media (min-width: 481px) and (max-width: 768px) {
    height: 52px;
    width: 180px;
    font-size: 17px;
  }

  @media (min-width: 769px) {
    height: 56px;
    width: 200px;
    font-size: 18px;
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 25px 0;
  color: #9c9c9c;
  font-size: 14px;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(255, 255, 255, 0.1);
  }

  span {
    padding: 0 15px;
  }
`;

const LoginLink = styled.div`
  text-align: center;
  margin-top: 25px;
  color: #9c9c9c;
  font-size: 15px;

  a {
    color: #0694fb;
    text-decoration: none;
    font-weight: 600;
    transition: color 0.3s ease;

    &:hover {
      color: #0094ff;
      text-decoration: underline;
    }
  }
`;

const Message = styled.div<{ $type: 'success' | 'error' }>`
  padding: 12px 16px;
  border-radius: 13px;
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

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  margin-bottom: 20px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $progress: number }>`
  height: 100%;
  background: linear-gradient(90deg, #0694fb, #0094ff);
  border-radius: 2px;
  transition: width 0.3s ease;
  width: ${props => props.$progress}%;
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { register } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogoClick = () => {
    router.push('/');
  };

  const calculateProgress = () => {
    const fields = ['firstName', 'lastName', 'email', 'password', 'confirmPassword'];
    const filledFields = fields.filter(field => formData[field as keyof typeof formData] !== '');
    return (filledFields.length / fields.length) * 100;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setMessage('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const result = await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        specialization: formData.specialization,
        licenseNumber: formData.licenseNumber
      });

      if (result.success) {
        setMessage('Registration successful! Redirecting to your dashboard...');
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } else {
        setMessage(result.error || 'Registration failed');
      }
    } catch (error) {
      setMessage('An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <RegisterContainer>
      <RegisterCard>
        <Logo onClick={handleLogoClick}>
          <Image 
            src="/intellidiag.png" 
            alt="IntelliDiag Logo" 
            width={200} 
            height={50} 
            className="logo-image"
            priority
          />
        </Logo>
        
        <Title>Create Account</Title>
        <Subtitle>Join the future of medical diagnostics</Subtitle>

        <ProgressBar>
          <ProgressFill $progress={calculateProgress()} />
        </ProgressBar>

        {message && (
          <Message $type={message.includes('successful') ? 'success' : 'error'}>
            {message}
          </Message>
        )}

        <Form onSubmit={handleSubmit}>
          <FormRow>
            <FormGroup>
              <InputWrapper>
                <Input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
                <InputIcon>
                  <FaUser />
                </InputIcon>
              </InputWrapper>
            </FormGroup>

            <FormGroup>
              <InputWrapper>
                <Input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
                <InputIcon>
                  <FaUser />
                </InputIcon>
              </InputWrapper>
            </FormGroup>
          </FormRow>

          <FormGroup>
            <InputWrapper>
              <Input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <InputIcon>
                <FaEnvelope />
              </InputIcon>
            </InputWrapper>
          </FormGroup>

          <FormRow>
            <FormGroup>
              <InputWrapper>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <InputIcon>
                  <FaLock />
                </InputIcon>
                <PasswordToggle
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </PasswordToggle>
              </InputWrapper>
            </FormGroup>

            <FormGroup>
              <InputWrapper>
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <InputIcon>
                  <FaLock />
                </InputIcon>
                <PasswordToggle
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </PasswordToggle>
              </InputWrapper>
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup>
              <InputWrapper>
                <Select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  <option value="doctor">Doctor</option>
                  <option value="radiologist">Radiologist</option>
                  <option value="admin">Administrator</option>
                  <option value="patient">Patient</option>
                </Select>
                <InputIcon>
                  <FaUser />
                </InputIcon>
              </InputWrapper>
            </FormGroup>

            <FormGroup>
              <InputWrapper>
                <Input
                  type="text"
                  name="specialization"
                  placeholder="Specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                />
                <InputIcon>
                  <FaGraduationCap />
                </InputIcon>
              </InputWrapper>
            </FormGroup>
          </FormRow>

          <FormGroup>
            <InputWrapper>
              <Input
                type="text"
                name="licenseNumber"
                placeholder="License Number (if applicable)"
                value={formData.licenseNumber}
                onChange={handleChange}
              />
              <InputIcon>
                <FaIdCard />
              </InputIcon>
            </InputWrapper>
          </FormGroup>

          <RegisterButton type="submit" disabled={loading}>
            {loading && <LoadingSpinner />}
            {loading ? 'Creating Account...' : 'Create Account'}
          </RegisterButton>
        </Form>

        <Divider>
          <span>Already have an account?</span>
        </Divider>

        <LoginLink>
          Sign in to your account <Link href="/login">here</Link>
        </LoginLink>
      </RegisterCard>
    </RegisterContainer>
  );
}
