'use client'

import styled from 'styled-components';
import Link from 'next/link';

export const NavbarContainer = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  position: fixed;
  top: 20px;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 0 20px;

  @media (min-width: 640px) {
    padding: 0 40px;
  }

  @media (min-width: 768px) {
    padding: 0 60px;
  }
`;

export const Nav = styled.nav<{ isScrolled: boolean }>`
  height: 60px;
  display: flex;
  align-items: center;
  font-size: 1rem;
  font-family: var(--font-primary);
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 1200px;
  background: ${props => props.isScrolled 
    ? 'rgba(255, 255, 255, 0.08)' 
    : 'rgba(255, 255, 255, 0.05)'};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid ${props => props.isScrolled 
    ? 'rgba(255, 255, 255, 0.15)' 
    : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 50px;
  padding: 0 30px;
  box-shadow: ${props => props.isScrolled 
    ? '0 12px 40px rgba(0, 0, 0, 0.15)' 
    : '0 8px 32px rgba(0, 0, 0, 0.1)'};
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.2);
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.2);
  }

  @media (min-width: 640px) {
    height: 70px;
    padding: 0 40px;
  }

  @media (min-width: 768px) {
    height: 80px;
    padding: 0 50px;
  }

  @media screen and (max-width: 960px) {
    transition: 0.8s all ease;
  }
`;

export const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  z-index: 1001;
  margin-right: 60px;

  img {
    height: auto;
    width: auto;
    max-height: 32px;
    max-width: 120px;
    object-fit: contain;
    transition: all 0.3s ease;

    @media (min-width: 640px) {
      max-height: 36px;
      max-width: 140px;
    }

    @media (min-width: 768px) {
      max-height: 40px;
      max-width: 160px;
    }
  }

  @media (max-width: 768px) {
    margin-right: 20px;
  }
`;

export const NavLink = styled(Link)`
  color: #fff;
  display: flex;
  align-items: center;
  text-decoration: none;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  font-weight: 500;
  font-size: 15px;
  border-radius: 25px;
  margin: 0 4px;

  @media (min-width: 768px) {
    padding: 10px 20px;
    font-size: 16px;
  }

  &:hover {
    color: #0094FF;
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 148, 255, 0.2);
  }

  &.active {
    color: #0094FF;
    background: rgba(0, 148, 255, 0.15);
    box-shadow: 0 2px 8px rgba(0, 148, 255, 0.3);
  }
`;

export const NavMenu = styled.div<{ isOpen: boolean }>`
  display: none;
  align-items: center;
  list-style: none;
  text-align: center;
  gap: 8px;
  flex: 1;
  justify-content: center;

  @media (min-width: 768px) {
    display: flex;
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
  margin-left: 20px;

  @media (min-width: 640px) {
    gap: 16px;
  }

  @media (min-width: 768px) {
    gap: 20px;
    margin-left: 40px;
  }
`;

export const LoginButton = styled.button`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  padding: 10px 20px;
  border-radius: 25px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1);
  }

  @media (min-width: 640px) {
    font-size: 15px;
    padding: 12px 24px;
  }
`;

export const SignUpButton = styled.button`
  background: linear-gradient(135deg, #0694fb, #0094ff);
  border: none;
  color: #fff;
  padding: 10px 20px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(6, 148, 251, 0.3);

  &:hover {
    background: linear-gradient(135deg, #0580d6, #0078e6);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(6, 148, 251, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  @media (min-width: 640px) {
    font-size: 15px;
    padding: 12px 24px;
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
