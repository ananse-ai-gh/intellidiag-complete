'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import styled from 'styled-components';

const LoginContainer = styled.div`
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

const LoginCard = styled.div`
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
    max-width: 420px;
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
    max-width: 320px;
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
    max-width: 320px;
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

const DemoCredentials = styled.div`
  background: rgba(6, 148, 251, 0.15);
  border: 1px solid rgba(6, 148, 251, 0.4);
  border-radius: 10px;
  padding: 18px 16px;
  margin-bottom: 24px;
  text-align: center;
  backdrop-filter: blur(10px);
  max-width: 100%;
  margin-left: auto;
  margin-right: auto;

  @media (min-width: 768px) {
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 28px;
    max-width: 320px;
  }
`;

const DemoTitle = styled.h3`
  color: #0694fb;
  font-size: 13px;
  font-weight: 600;
  margin: 0 0 8px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  @media (min-width: 768px) {
    font-size: 14px;
    margin-bottom: 10px;
    letter-spacing: 0.8px;
  }
`;

const DemoText = styled.p`
  color: rgba(255, 255, 255, 0.9);
  font-size: 12px;
  margin: 0 0 12px 0;
  line-height: 1.3;

  @media (min-width: 768px) {
    font-size: 13px;
    margin-bottom: 14px;
    line-height: 1.4;
  }
`;

const DemoButton = styled.button`
  background: rgba(6, 148, 251, 0.2);
  border: 1px solid rgba(6, 148, 251, 0.6);
  border-radius: 8px;
  padding: 8px 16px;
  color: #0694fb;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  width: 100%;

  &:hover {
    background: rgba(6, 148, 251, 0.3);
    border-color: rgba(6, 148, 251, 0.8);
    transform: translateY(-1px);
    box-shadow: 0 6px 15px rgba(6, 148, 251, 0.3);
  }

  @media (min-width: 768px) {
    border-radius: 10px;
    padding: 10px 18px;
    font-size: 12px;
    letter-spacing: 0.8px;
    width: auto;
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

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 24px 0;
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(255, 255, 255, 0.2);
  }

  span {
    margin: 0 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  @media (min-width: 768px) {
    margin: 28px 0;
    font-size: 13px;

    span {
      margin: 0 16px;
      letter-spacing: 0.8px;
    }
  }
`;

const SocialLogin = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  justify-content: center;
  max-width: 100%;
  margin: 0 auto;

  @media (min-width: 768px) {
    flex-direction: row;
    gap: 16px;
    max-width: 320px;
  }
`;

const SocialButton = styled.button`
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #ffffff;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  width: 100%;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
    box-shadow: 0 6px 15px rgba(255, 255, 255, 0.1);
  }

  @media (min-width: 768px) {
    padding: 12px 20px;
    border-radius: 10px;
    font-size: 13px;
    letter-spacing: 0.8px;
    width: auto;
    flex: 1;
    max-width: 150px;
  }
`;

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const { login, error: authError } = useAuth();
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setMessageType('');

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        setMessage('Login successful! Redirecting...');
        setMessageType('success');
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
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

  const fillDemoCredentials = () => {
    setFormData({
      email: 'admin@intellidiag.com',
      password: 'admin123'
    });
  };

  return (
    <LoginContainer>
      <LoginCard>
        <Logo>
          <img src="/intellidiag.png" alt="IntelliDiag Logo" />
        </Logo>
        
        <Title>Welcome Back</Title>
        <Subtitle>
          Access your IntelliDiag dashboard and continue revolutionizing medical diagnostics
        </Subtitle>
        
        <DemoCredentials>
          <DemoTitle>Demo Credentials</DemoTitle>
          <DemoText>
            Email: admin@intellidiag.com<br />
            Password: admin123
          </DemoText>
          <DemoButton onClick={fillDemoCredentials}>
            Fill Demo Credentials
          </DemoButton>
        </DemoCredentials>

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

          <FormGroup>
            <Label htmlFor="password">Password</Label>
            <Input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </FormGroup>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign In to Dashboard'}
          </Button>
        </Form>

        <Divider>
          <span>or continue with</span>
        </Divider>

        <SocialLogin>
          <SocialButton type="button">
            Google
          </SocialButton>
          <SocialButton type="button">
            Microsoft
          </SocialButton>
        </SocialLogin>

        <Footer>
          Don't have an account?
          <FooterLink href="/register">Create Account</FooterLink>
        </Footer>
      </LoginCard>
    </LoginContainer>
  );
}
