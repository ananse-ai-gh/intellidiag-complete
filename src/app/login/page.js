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
  padding: 32px 24px;
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
    padding: 60px;
    max-width: 600px;
  }
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: 32px;
  
  img {
    height: 48px;
    width: auto;
    filter: drop-shadow(0 4px 8px rgba(6, 148, 251, 0.4));
  }

  @media (min-width: 768px) {
    margin-bottom: 40px;
    
    img {
      height: 60px;
    }
  }
`;

const Title = styled.h1`
  color: #ffffff;
  font-size: 28px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 12px;
  background: linear-gradient(135deg, #ffffff, #e0e0e0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 30px rgba(255, 255, 255, 0.3);

  @media (min-width: 768px) {
    font-size: 36px;
    margin-bottom: 15px;
  }
`;

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.8);
  font-size: 16px;
  text-align: center;
  margin-bottom: 40px;
  line-height: 1.5;
  max-width: 100%;
  margin-left: auto;
  margin-right: auto;

  @media (min-width: 768px) {
    font-size: 18px;
    margin-bottom: 50px;
    max-width: 500px;
    line-height: 1.6;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 100%;
  margin: 0 auto;

  @media (min-width: 768px) {
    gap: 30px;
    max-width: 500px;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;

  @media (min-width: 768px) {
    gap: 12px;
  }
`;

const Label = styled.label`
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-left: 4px;

  @media (min-width: 768px) {
    font-size: 16px;
    letter-spacing: 1px;
    margin-left: 5px;
  }
`;

const Input = styled.input`
  padding: 16px 20px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
  font-size: 16px;
  outline: none;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  cursor: text;
  width: 100%;
  box-sizing: border-box;

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  &:focus {
    border-color: #0694fb;
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 0 4px rgba(6, 148, 251, 0.2);
    transform: translateY(-2px);
  }

  &:hover {
    border-color: rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.06);
  }

  @media (min-width: 768px) {
    padding: 20px 24px;
    border-radius: 16px;
  }
`;

const Button = styled.button`
  padding: 18px;
  background: linear-gradient(135deg, #0694fb, #0094ff);
  border: none;
  border-radius: 14px;
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 16px;
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
    transform: translateY(-3px);
    box-shadow: 0 20px 40px rgba(6, 148, 251, 0.5);
    
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
    padding: 22px;
    border-radius: 16px;
    font-size: 18px;
    letter-spacing: 1px;
    margin-top: 20px;
    width: auto;
    min-width: 200px;
  }
`;

const ErrorMessage = styled.div`
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
  border: 1px solid rgba(255, 107, 107, 0.3);
  border-radius: 12px;
  padding: 16px;
  font-size: 14px;
  text-align: center;
  backdrop-filter: blur(10px);

  @media (min-width: 768px) {
    padding: 20px;
    font-size: 16px;
  }
`;

const SuccessMessage = styled.div`
  color: #51cf66;
  background: rgba(81, 207, 102, 0.1);
  border: 1px solid rgba(81, 207, 102, 0.3);
  border-radius: 12px;
  padding: 16px;
  font-size: 14px;
  text-align: center;
  backdrop-filter: blur(10px);

  @media (min-width: 768px) {
    padding: 20px;
    font-size: 16px;
  }
`;

const DemoCredentials = styled.div`
  background: rgba(6, 148, 251, 0.15);
  border: 1px solid rgba(6, 148, 251, 0.4);
  border-radius: 14px;
  padding: 24px 20px;
  margin-bottom: 32px;
  text-align: center;
  backdrop-filter: blur(10px);
  max-width: 100%;
  margin-left: auto;
  margin-right: auto;

  @media (min-width: 768px) {
    border-radius: 16px;
    padding: 30px;
    margin-bottom: 40px;
    max-width: 500px;
  }
`;

const DemoTitle = styled.h3`
  color: #0694fb;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  @media (min-width: 768px) {
    font-size: 18px;
    margin-bottom: 15px;
    letter-spacing: 1px;
  }
`;

const DemoText = styled.p`
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  margin: 0 0 16px 0;
  line-height: 1.4;

  @media (min-width: 768px) {
    font-size: 16px;
    margin-bottom: 20px;
    line-height: 1.5;
  }
`;

const DemoButton = styled.button`
  background: rgba(6, 148, 251, 0.2);
  border: 1px solid rgba(6, 148, 251, 0.6);
  border-radius: 10px;
  padding: 10px 20px;
  color: #0694fb;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  width: 100%;

  &:hover {
    background: rgba(6, 148, 251, 0.3);
    border-color: rgba(6, 148, 251, 0.8);
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(6, 148, 251, 0.3);
  }

  @media (min-width: 768px) {
    border-radius: 12px;
    padding: 12px 24px;
    font-size: 14px;
    letter-spacing: 1px;
    width: auto;
  }
`;

const Footer = styled.div`
  text-align: center;
  margin-top: 40px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;

  @media (min-width: 768px) {
    margin-top: 50px;
    font-size: 16px;
  }
`;

const FooterLink = styled(Link)`
  color: #0694fb;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  margin-left: 6px;
  cursor: pointer;

  &:hover {
    color: #0094ff;
    text-shadow: 0 0 15px rgba(6, 148, 251, 0.6);
  }

  @media (min-width: 768px) {
    margin-left: 8px;
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 32px 0;
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(255, 255, 255, 0.2);
  }

  span {
    margin: 0 16px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  @media (min-width: 768px) {
    margin: 40px 0;
    font-size: 16px;

    span {
      margin: 0 20px;
      letter-spacing: 1px;
    }
  }
`;

const SocialLogin = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  justify-content: center;
  max-width: 100%;
  margin: 0 auto;

  @media (min-width: 768px) {
    flex-direction: row;
    gap: 20px;
    max-width: 500px;
  }
`;

const SocialButton = styled.button`
  padding: 14px 24px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  color: #ffffff;
  font-size: 14px;
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
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(255, 255, 255, 0.1);
  }

  @media (min-width: 768px) {
    padding: 16px 28px;
    border-radius: 12px;
    font-size: 16px;
    letter-spacing: 0.5px;
    width: auto;
    flex: 1;
    max-width: 200px;
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
          Access your IntelliDiag dashboard and continue revolutionizing medical diagnostics with AI-powered insights
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
