'use client'

import styled from 'styled-components';
import Link from 'next/link';

export const Nav = styled.nav`
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1rem;
  font-family: var(--font-primary);
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 1200px;

  @media screen and (max-width: 960px) {
    transition: 0.8s all ease;
  }
`;

export const NavLink = styled(Link)`
  color: #fff;
  display: flex;
  align-items: center;
  text-decoration: none;
  padding: 0 1rem;
  height: 100%;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  position: relative;
  font-weight: 500;

  &:hover {
    color: #0094FF;
    transform: translateY(-2px);
  }

  &.active {
    color: #0094FF;
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
  }
`;

export const NavMenu = styled.div`
  display: flex;
  align-items: center;
  list-style: none;
  text-align: center;
  margin-right: 2rem;

  @media screen and (max-width: 768px) {
    display: none;
  }
`;

export const Bars = styled.div`
  display: none;
  color: #fff;

  @media screen and (max-width: 768px) {
    display: block;
    position: absolute;
    top: 0;
    right: 0;
    transform: translate(-100%, 75%);
    font-size: 1.8rem;
    cursor: pointer;
  }
`;

export const UserMenu = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

export const UserButton = styled.div`
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

export const LogoutButton = styled.button`
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
  border: 1px solid rgba(255, 107, 107, 0.3);
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 107, 107, 0.2);
    border-color: rgba(255, 107, 107, 0.5);
  }
`;
