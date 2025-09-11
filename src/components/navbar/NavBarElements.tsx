'use client'

import styled from 'styled-components';
import Link from 'next/link';

export const NavbarContainer = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 8px 0;
  position: sticky;
  top: 0;
  z-index: 100;

  @media (min-width: 640px) {
    padding: 10px 0;
  }
`;

export const Nav = styled.nav`
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1rem;
  font-family: var(--font-primary);
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 1200px;
  padding: 0 var(--spacing-md);

  @media (min-width: 640px) {
    height: 70px;
    padding: 0 var(--spacing-lg);
  }

  @media (min-width: 768px) {
    height: 80px;
    justify-content: center;
  }

  @media screen and (max-width: 960px) {
    transition: 0.8s all ease;
  }
`;

export const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  z-index: 1001;

  img {
    height: 24px;
    transition: all 0.3s ease;

    @media (min-width: 640px) {
      height: 28px;
    }

    @media (min-width: 768px) {
      height: 30px;
    }
  }
`;

export const NavLink = styled(Link)`
  color: #fff;
  display: flex;
  align-items: center;
  text-decoration: none;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  position: relative;
  font-weight: 500;
  font-size: var(--text-base);
  border-radius: 8px;
  margin: 4px 0;

  @media (min-width: 768px) {
    padding: 0 1rem;
    height: 100%;
    margin: 0;
    border-radius: 0;
  }

  &:hover {
    color: #0094FF;
    background: rgba(255, 255, 255, 0.05);
    transform: translateY(-1px);
  }

  &.active {
    color: #0094FF;
    background: rgba(6, 148, 251, 0.1);
  }

  &.active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    height: 3px;
    background: #0094FF;
    border-radius: 2px;
    
    @media (max-width: 767px) {
      display: none;
    }
  }
`;

export const NavMenu = styled.div<{ isOpen: boolean }>`
  display: none;
  align-items: center;
  list-style: none;
  text-align: center;
  margin-right: 1rem;

  @media (min-width: 768px) {
    display: flex;
    margin-right: 2rem;
  }
`;

export const MobileNavMenu = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  display: ${props => props.isOpen ? 'flex' : 'none'};
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 80px 20px 20px;
  gap: 8px;
  opacity: ${props => props.isOpen ? '1' : '0'};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transition: all 0.3s ease-in-out;

  @media (min-width: 768px) {
    display: none;
  }
`;

export const Bars = styled.button`
  display: block;
  color: #fff;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.3s ease;
  z-index: 1001;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: scale(1.1);
  }

  @media (min-width: 768px) {
    display: none;
  }
`;

export const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
  z-index: 1001;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
  }

  @media (min-width: 768px) {
    display: none;
  }
`;

export const UserMenu = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  @media (min-width: 640px) {
    gap: 12px;
  }

  @media (min-width: 768px) {
    gap: 15px;
  }
`;

export const MobileUserMenu = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-top: 32px;
  padding-top: 32px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  width: 100%;
  max-width: 300px;

  @media (min-width: 768px) {
    display: none;
  }
`;

export const UserButton = styled.div`
  color: #ffffff;
  font-size: var(--text-xs);
  font-weight: 500;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.2);

  @media (min-width: 640px) {
    font-size: var(--text-sm);
    padding: 8px 16px;
    border-radius: 8px;
  }
`;

export const LogoutButton = styled.button`
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
  border: 1px solid rgba(255, 107, 107, 0.3);
  border-radius: 6px;
  padding: 6px 12px;
  font-size: var(--text-xs);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  @media (min-width: 640px) {
    font-size: var(--text-sm);
    padding: 8px 16px;
    border-radius: 8px;
  }

  &:hover {
    background: rgba(255, 107, 107, 0.2);
    border-color: rgba(255, 107, 107, 0.5);
  }
`;

export const AuthButtons = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;

  @media (min-width: 640px) {
    gap: 16px;
  }

  @media (min-width: 768px) {
    gap: 20px;
  }
`;

export const LoginButton = styled.button`
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  font-size: var(--text-sm);
  font-weight: 500;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-1px);
  }

  @media (min-width: 640px) {
    font-size: var(--text-base);
    padding: 10px 16px;
  }
`;

export const SignUpButton = styled.button`
  background: linear-gradient(135deg, #0694fb, #0094ff);
  border: none;
  color: #fff;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: var(--text-sm);
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(6, 148, 251, 0.3);
  }

  @media (min-width: 640px) {
    font-size: var(--text-base);
    padding: 10px 20px;
    border-radius: 8px;
  }
`;

export const MobileAuthButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  max-width: 300px;

  @media (min-width: 768px) {
    display: none;
  }
`;

export const MobileLoginButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  cursor: pointer;
  font-size: var(--text-base);
  font-weight: 500;
  padding: 12px 20px;
  border-radius: 8px;
  transition: all 0.3s ease;
  width: 100%;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
  }
`;

export const MobileSignUpButton = styled.button`
  background: linear-gradient(135deg, #0694fb, #0094ff);
  border: none;
  color: #fff;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: var(--text-base);
  font-weight: 500;
  transition: all 0.3s ease;
  width: 100%;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(6, 148, 251, 0.3);
  }
`;
