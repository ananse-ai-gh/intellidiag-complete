'use client'

import React, { useState, useRef, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate,
  useIsPresent,
} from "framer-motion";
import { useRouter } from "next/navigation";
import styled, { createGlobalStyle } from "styled-components";
import { useAuth } from "@/contexts/AuthContext";
import { useModal } from "@/contexts/ModalContext";
import { FaUser, FaLock, FaEye, FaEyeSlash, FaEnvelope, FaIdCard, FaGraduationCap } from 'react-icons/fa';

// Global styles for the overlay
interface GlobalOverlayStyleProps {
  isOverlayOpen: boolean;
}

const GlobalOverlayStyle = createGlobalStyle<GlobalOverlayStyleProps>`
  body {
    overflow: ${(props) => (props.isOverlayOpen ? "hidden" : "auto")};
  }
`;

const HomepageContainer = styled.div`
  font-family: var(--font-primary);
  min-height: 100vh;
  width: 100%;
  color: #fff;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
  background: linear-gradient(135deg, #0a0a23 0%, #1a1a3a 50%, #0a0a23 100%);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 80%, rgba(6, 148, 251, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(0, 149, 255, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(6, 148, 251, 0.1) 0%, transparent 50%);
    pointer-events: none;
  }

  /* Mobile devices (320px - 480px) */
  @media (min-width: 320px) and (max-width: 480px) {
    padding: 15px;
  }
`;

const HomepageContent = styled.div`
  width: 90%;
  max-width: 1216px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16px;
  z-index: 56;
  position: relative;
`;

const HomepageHeading = styled.h1`
  font-size: 32px;
  font-weight: 500;
  margin: 0;
  line-height: 1.2;

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

const Highlight = styled.span`
  color: #0094ff;
`;

const HomepageSubcontent = styled.div`
  width: 100%;
  max-width: 545px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
`;

const HomepageSubheading = styled.h2`
  font-size: 14px;
  font-weight: 400;
  color: #9c9c9c;
  margin: 0;

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

const HomepageButton = styled(motion.button)`
  height: 48px;
  width: 160px;
  background-color: #0694fb;
  border-radius: 13px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 16px;
  cursor: pointer;
  border: none;
  color: #fff;
  padding: 0 20px;

  /* iPads, Tablets (481px - 768px) */
  @media (min-width: 481px) and (max-width: 768px) {
    height: 56px;
    width: 175px;
    font-size: 20px;
  }

  /* Mobile devices (320px - 480px) */
  @media (min-width: 320px) and (max-width: 480px) {
    height: 40px;
    width: 115px;
    font-size: 13px;
    border-radius: 9px;
  }

  /* Small screens, laptops (769px - 1024px) */
  @media (min-width: 769px) and (max-width: 1024px) {
    height: 55px;
    width: 180px;
    font-size: 19px;
  }

  /* Desktops, large screens (1025px - 1200px) */
  @media (min-width: 1025px) and (max-width: 1200px) {
    height: 58px;
    width: 182px;
    font-size: 20px;
  }
`;

const OverlayRoot = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  z-index: 1000;
`;

const OverlayContent = styled(motion.div)`
  backdrop-filter: blur(4px);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
`;

const ModalContainer = styled(motion.div)`
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 28px 20px;
  max-width: 400px;
  width: 100%;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.8);
  position: relative;
  overflow: visible;
  z-index: 1000;

  @media (min-width: 481px) and (max-width: 768px) {
    padding: 32px 24px;
    max-width: 440px;
  }

  @media (min-width: 769px) {
    padding: 36px 28px;
    max-width: 460px;
  }
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }

  .logo-image {
    height: 36px;
    width: auto;
    filter: drop-shadow(0 4px 8px rgba(6, 148, 251, 0.4));
  }

  @media (min-width: 481px) and (max-width: 768px) {
    margin-bottom: 28px;
    
    .logo-image {
      height: 40px;
    }
  }

  @media (min-width: 769px) {
    margin-bottom: 32px;
    
    .logo-image {
      height: 44px;
    }
  }
`;

const ModalTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #fff;
  font-family: var(--font-primary);

  @media (max-width: 768px) {
    font-size: 22px;
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
  gap: 16px;
  margin-bottom: 25px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const InputLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  text-align: left;
  font-family: var(--font-primary);
`;

const InputField = styled.input`
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
    padding: 14px 16px 14px 45px;
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

  & option {
    background: #1a1a3a;
    color: #ffffff;
    padding: 8px;
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

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 16px;
  color: #9c9c9c;
  font-size: 16px;
  transition: color 0.3s ease;
  z-index: 2;
  pointer-events: none;

  ${InputField}:focus ~ & {
    color: #0694fb;
  }
`;

const PasswordToggleButton = styled.button`
  position: absolute;
  right: 16px;
  background: none;
  border: none;
  color: #9c9c9c;
  font-size: 16px;
  cursor: pointer;
  transition: color 0.3s ease;
  z-index: 2;

  &:hover {
    color: #0694fb;
  }
`;

const SignInButton = styled(motion.button)`
  width: 100%;
  background: #0694fb;
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: var(--font-primary);

  &:hover {
    background: #0094ff;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(6, 148, 251, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

const SignUpLink = styled.div`
  text-align: center;
  margin-top: 20px;
  font-family: var(--font-primary);
`;

const SignUpText = styled.span`
  color: #ccc;
  font-size: 14px;
`;

const SignUpButton = styled.button`
  background: none;
  border: none;
  color: #0694fb;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  margin-left: 5px;
  transition: all 0.3s ease;
  font-family: var(--font-primary);
  position: relative;
  z-index: 1002;

  &:hover {
    color: #0094ff;
    transform: translateY(-1px);
  }
`;

const FormWrapper = styled(motion.div)`
  width: 100%;
`;

const SignUpButtonStyled = styled(motion.button)`
  height: 44px;
  width: 140px;
  background-color: #0694fb;
  border: none;
  border-radius: 10px;
  color: #ffffff;
  font-size: 15px;
  font-weight: 600;
  font-family: var(--font-primary);
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
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
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

const ModalButton = styled(motion.button)`
  background: linear-gradient(135deg, #0694fb, #0094ff);
  border: none;
  border-radius: 12px;
  padding: 16px 32px;
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 10px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(6, 148, 251, 0.3);
  }

  @media (max-width: 768px) {
    padding: 14px 28px;
    font-size: 16px;
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

const ModalFooterText = styled.p`
  font-size: 15px;
  display: none;

  @media (min-width: 320px) and (max-width: 480px) {
    font-size: 20px;
    display: none;
  }
`;

const GradientContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  pointer-events: none;
`;

const ExpandingCircle = styled(motion.div)`
  position: absolute;
  border-radius: 50%;
  background: rgba(0, 149, 255, 0.8);
  filter: blur(15px);
  transform-origin: center;
  will-change: transform;
`;

const GradientCircle = styled(motion.div)`
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  width: 200%;
  aspect-ratio: 1;
  will-change: transform;
`;

function Homepage() {
  const router = useRouter();
  const { isModalOpen, modalType, openModal, closeModal } = useModal();
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateSize = () => {
      setSize({
        width: ref.current?.clientWidth || 0,
        height: ref.current?.clientHeight || 0,
      });
    };

    updateSize();
    window.addEventListener("resize", updateSize);

    return () => window.removeEventListener("resize", updateSize);
  }, [ref]);

  // Removed auto-login modal functionality for cleaner logout experience

  const handleButtonClick = () => {
    openModal('register');
  };

  const closeOverlay = () => {
    closeModal();
  };

  const handleGetStarted = () => {
    router.push('/dashboard');
  };

  return (
    <>
      <GlobalOverlayStyle isOverlayOpen={isModalOpen} />
      <HomepageContainer ref={ref}>
        <HomepageContent>
          <HomepageHeading>
            Revolutionizing <Highlight>Diagnosis</Highlight> with the help of
            Artificial Intelligence
          </HomepageHeading>

          <HomepageSubcontent>
            <HomepageSubheading>
              Empowering individuals and healthcare professionals with advanced
              diagnostic tools and personalized treatment plans
            </HomepageSubheading>

            <HomepageButton
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
              onClick={handleButtonClick}
              aria-label="Get Started"
            >
              Get Started
            </HomepageButton>
          </HomepageSubcontent>
        </HomepageContent>

        <AnimatePresence>
          {isModalOpen ? (
            <ImmersiveOverlay 
              close={closeOverlay} 
              size={size} 
              onGetStarted={handleGetStarted} 
              modalType={modalType}
            />
          ) : null}
        </AnimatePresence>
      </HomepageContainer>
    </>
  );
}

interface ImmersiveOverlayProps {
  close: () => void;
  size: { width: number; height: number };
  onGetStarted: () => void;
  modalType: 'login' | 'register' | 'get-started';
}

function ImmersiveOverlay({ close, size, onGetStarted, modalType }: ImmersiveOverlayProps) {
  const { isAuthenticated, login, register } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState('doctor');
  const [specialization, setSpecialization] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(modalType === 'register');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const result = await login(email, password);
      if (result.success) {
        setMessage('Login successful! Redirecting to your dashboard...');
        // Add success animation before redirect
        setTimeout(() => {
          // Animate modal out with success effect
          const modal = document.querySelector('[data-modal-container]') as HTMLElement;
          if (modal) {
            modal.style.transform = 'scale(1.1)';
            modal.style.opacity = '0';
            modal.style.transition = 'all 0.4s ease-out';
          }
          
          setTimeout(() => {
            close();
            router.push('/dashboard');
          }, 400);
        }, 600);
      } else {
        setMessage(result.error || 'Login failed');
      }
    } catch (error) {
      setMessage('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');



    // Validation
    if (password.length < 6) {
      setMessage('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      setLoading(false);
      return;
    }

    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setMessage('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      const result = await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
        role,
        specialization: specialization.trim(),
        licenseNumber: licenseNumber.trim()
      });



      if (result.success) {
        setMessage('Registration successful! Redirecting to your dashboard...');
        // Add success animation before redirect
        setTimeout(() => {
          // Animate modal out with success effect
          const modal = document.querySelector('[data-modal-container]') as HTMLElement;
          if (modal) {
            modal.style.transform = 'scale(1.1)';
            modal.style.opacity = '0';
            modal.style.transition = 'all 0.4s ease-out';
          }
          
          setTimeout(() => {
            close();
            router.push('/dashboard');
          }, 400);
        }, 1000);
      } else {
        if (result.error?.includes('already exists')) {
          setMessage('This email is already registered. Please use a different email or try signing in.');
        } else {
          setMessage(result.error || 'Registration failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      setMessage('An error occurred during registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleForm = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsSignUp(!isSignUp);
    // Clear form fields when switching
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFirstName('');
    setLastName('');
    setRole('doctor');
    setSpecialization('');
    setLicenseNumber('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setMessage('');
  };

  const handleClose = () => {
    close();
  };

  return (
    <OverlayRoot>
      <GradientContainer>
        <ExpandingCircle
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 2, opacity: 0.6 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{
            left: size.width / 2,
            top: size.height / 2,
          }}
        />
        <GradientCircle
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.3 }}
          transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
          style={{
            left: -size.width / 2,
            top: -size.height / 2,
            background: "radial-gradient(circle, rgba(0, 149, 255, 0.6) 0%, rgba(0, 149, 255, 0) 70%)",
          }}
        />
      </GradientContainer>

      <OverlayContent>
        <ModalContainer
          data-modal-container
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ 
            duration: 0.6, 
            ease: [0.25, 0.46, 0.45, 0.94],
            type: "spring",
            stiffness: 100,
            damping: 15
          }}
        >
          <Logo>
            <img src="/intellidiag.png" alt="IntelliDiag Logo" className="logo-image" />
          </Logo>
          
                     <AnimatePresence mode="wait">
             {!isSignUp ? (
               <motion.div
                 key="signin"
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: 20 }}
                 transition={{ duration: 0.3, ease: "easeInOut" }}
               >
                 <ModalTitle>Sign In to your account</ModalTitle>
                 <ModalDescription>
                   Sign in to access all the features and functions of our platform
                 </ModalDescription>
                 
                 {message && (
                   <Message $type={message.includes('successful') ? 'success' : 'error'}>
                     {message}
                   </Message>
                 )}

                 <FormContainer onSubmit={handleSignIn}>
                   <InputGroup>
                     <InputWrapper>
                       <InputField
                         type="email"
                         value={email}
                         onChange={(e) => setEmail(e.target.value)}
                         placeholder="Enter your email"
                         required
                       />
                       <InputIcon>
                         <FaEnvelope />
                       </InputIcon>
                     </InputWrapper>
                   </InputGroup>
                   
                   <InputGroup>
                     <InputWrapper>
                       <InputField
                         type={showPassword ? "text" : "password"}
                         value={password}
                         onChange={(e) => setPassword(e.target.value)}
                         placeholder="Enter your password"
                         required
                       />
                       <InputIcon>
                         <FaLock />
                       </InputIcon>
                       <PasswordToggleButton
                         type="button"
                         onClick={() => setShowPassword(!showPassword)}
                       >
                         {showPassword ? <FaEyeSlash /> : <FaEye />}
                       </PasswordToggleButton>
                     </InputWrapper>
                   </InputGroup>
                   
                   <SignInButton
                     type="submit"
                     disabled={loading}
                     whileHover={{ scale: 1.02 }}
                     whileTap={{ scale: 0.98 }}
                     transition={{ duration: 0.2 }}
                   >
                     {loading && <LoadingSpinner />}
                     {loading ? 'Signing In...' : 'Sign In'}
                   </SignInButton>
                 </FormContainer>

                 <SignUpLink>
                   <SignUpText>Don&apos;t have an account?</SignUpText>
                   <SignUpButton onClick={(e) => toggleForm(e)}>
                     Sign up here
                   </SignUpButton>
                 </SignUpLink>
               </motion.div>
             ) : (
               <motion.div
                 key="signup"
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -20 }}
                 transition={{ duration: 0.3, ease: "easeInOut" }}
               >
                 <ModalTitle>Create your account</ModalTitle>
                 <ModalDescription>
                   Join us to start using our advanced diagnostic platform
                 </ModalDescription>
                 
                 {message && (
                   <Message $type={message.includes('successful') ? 'success' : 'error'}>
                     {message}
                   </Message>
                 )}

                 <FormContainer onSubmit={handleSignUp}>
                   <FormRow>
                     <InputGroup>
                       <InputWrapper>
                         <InputField
                           type="text"
                           value={firstName}
                           onChange={(e) => setFirstName(e.target.value)}
                           placeholder="First Name"
                           required
                         />
                         <InputIcon>
                           <FaUser />
                         </InputIcon>
                       </InputWrapper>
                     </InputGroup>
                     
                     <InputGroup>
                       <InputWrapper>
                         <InputField
                           type="text"
                           value={lastName}
                           onChange={(e) => setLastName(e.target.value)}
                           placeholder="Last Name"
                           required
                         />
                         <InputIcon>
                           <FaUser />
                         </InputIcon>
                       </InputWrapper>
                     </InputGroup>
                   </FormRow>
                   
                   <InputGroup>
                     <InputWrapper>
                       <InputField
                         type="email"
                         value={email}
                         onChange={(e) => setEmail(e.target.value)}
                         placeholder="Email Address"
                         required
                       />
                       <InputIcon>
                         <FaEnvelope />
                       </InputIcon>
                     </InputWrapper>
                   </InputGroup>
                   
                   <FormRow>
                     <InputGroup>
                       <InputWrapper>
                         <InputField
                           type={showPassword ? "text" : "password"}
                           value={password}
                           onChange={(e) => setPassword(e.target.value)}
                           placeholder="Password"
                           required
                         />
                         <InputIcon>
                           <FaLock />
                         </InputIcon>
                         <PasswordToggleButton
                           type="button"
                           onClick={() => setShowPassword(!showPassword)}
                         >
                           {showPassword ? <FaEyeSlash /> : <FaEye />}
                         </PasswordToggleButton>
                       </InputWrapper>
                     </InputGroup>
                     
                     <InputGroup>
                       <InputWrapper>
                         <InputField
                           type={showConfirmPassword ? "text" : "password"}
                           value={confirmPassword}
                           onChange={(e) => setConfirmPassword(e.target.value)}
                           placeholder="Confirm Password"
                           required
                         />
                         <InputIcon>
                           <FaLock />
                         </InputIcon>
                         <PasswordToggleButton
                           type="button"
                           onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                         >
                           {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                         </PasswordToggleButton>
                       </InputWrapper>
                     </InputGroup>
                   </FormRow>
                   
                   <FormRow>
                     <InputGroup>
                       <InputWrapper>
                         <SelectField
                           value={role}
                           onChange={(e) => setRole(e.target.value)}
                           required
                         >
                           <option value="doctor">Doctor</option>
                           <option value="radiologist">Radiologist</option>
                           <option value="admin">Administrator</option>
                           <option value="patient">Patient</option>
                         </SelectField>
                         <InputIcon>
                           <FaUser />
                         </InputIcon>
                       </InputWrapper>
                     </InputGroup>
                     
                     <InputGroup>
                       <InputWrapper>
                         <InputField
                           type="text"
                           value={specialization}
                           onChange={(e) => setSpecialization(e.target.value)}
                           placeholder="Specialization"
                         />
                         <InputIcon>
                           <FaGraduationCap />
                         </InputIcon>
                       </InputWrapper>
                     </InputGroup>
                   </FormRow>
                   
                   <InputGroup>
                     <InputWrapper>
                       <InputField
                         type="text"
                         value={licenseNumber}
                         onChange={(e) => setLicenseNumber(e.target.value)}
                         placeholder="License Number (if applicable)"
                       />
                       <InputIcon>
                         <FaIdCard />
                       </InputIcon>
                     </InputWrapper>
                   </InputGroup>
                   
                   <SignUpButtonStyled
                     type="submit"
                     disabled={loading}
                     whileHover={{ scale: 1.02 }}
                     whileTap={{ scale: 0.98 }}
                     transition={{ duration: 0.2 }}
                   >
                     {loading && <LoadingSpinner />}
                     {loading ? 'Creating Account...' : 'Create Account'}
                   </SignUpButtonStyled>
                 </FormContainer>

                 <SignUpLink>
                   <SignUpText>Already have an account?</SignUpText>
                   <SignUpButton onClick={(e) => toggleForm(e)}>
                     Sign in here
                   </SignUpButton>
                 </SignUpLink>
               </motion.div>
             )}
           </AnimatePresence>
          
          <CloseButton onClick={handleClose}>×</CloseButton>
        </ModalContainer>
      </OverlayContent>
    </OverlayRoot>
  );
}

export default Homepage;
