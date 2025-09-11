'use client'

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useModal } from '@/contexts/ModalContext';
import { 
  NavbarContainer,
  Nav, 
  LogoContainer, 
  NavLink, 
  NavMenu, 
  MobileNavMenu, 
  Bars, 
  CloseButton, 
  UserMenu, 
  MobileUserMenu, 
  UserButton, 
  LogoutButton, 
  AuthButtons, 
  LoginButton, 
  SignUpButton, 
  MobileAuthButtons, 
  MobileLoginButton, 
  MobileSignUpButton 
} from './NavBarElements';

const Navbar = () => {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const { openModal } = useModal();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    logout(); // This will redirect to homepage
    setIsMobileMenuOpen(false);
  };

  const handleLoginClick = (e: React.MouseEvent) => {
    e.preventDefault();
    openModal('login');
    setIsMobileMenuOpen(false);
  };

  const handleSignUpClick = (e: React.MouseEvent) => {
    e.preventDefault();
    openModal('register');
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <NavbarContainer>
        <Nav>
          <LogoContainer>
            <Link href='/'>
              <h1>
                <Image src='/intellidiag.png' alt='IntelliDiag Logo' width={120} height={30} />
              </h1>
            </Link>
          </LogoContainer>

          <NavMenu isOpen={isMobileMenuOpen}>
            <NavLink href='/' className={pathname === '/' ? 'active' : ''}>
              Home
            </NavLink>
            <NavLink href='/about' className={pathname === '/about' ? 'active' : ''}>
              About
            </NavLink>
            <NavLink href='/features' className={pathname === '/features' ? 'active' : ''}>
              Features
            </NavLink>
            <NavLink href='/contact' className={pathname === '/contact' ? 'active' : ''}>
              Contact
            </NavLink>
            {isAuthenticated && (
              <NavLink href='/dashboard' className={pathname.startsWith('/dashboard') ? 'active' : ''}>
                Dashboard
              </NavLink>
            )}
          </NavMenu>

          {/* Desktop Auth/User Menu */}
          {isAuthenticated ? (
            <UserMenu>
              <UserButton>
                {user?.firstName} {user?.lastName}
              </UserButton>
              <LogoutButton onClick={handleLogout}>
                Logout
              </LogoutButton>
            </UserMenu>
          ) : (
            <AuthButtons>
              <LoginButton onClick={handleLoginClick}>
                Login
              </LoginButton>
              <SignUpButton onClick={handleSignUpClick}>
                Sign Up
              </SignUpButton>
            </AuthButtons>
          )}

          {/* Mobile Menu Button */}
          <Bars onClick={toggleMobileMenu} aria-label="Toggle mobile menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </Bars>
        </Nav>
      </NavbarContainer>

      {/* Mobile Navigation Menu */}
      <MobileNavMenu isOpen={isMobileMenuOpen}>
        <CloseButton onClick={closeMobileMenu} aria-label="Close mobile menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </CloseButton>

        <NavLink href='/' className={pathname === '/' ? 'active' : ''} onClick={closeMobileMenu}>
          Home
        </NavLink>
        <NavLink href='/about' className={pathname === '/about' ? 'active' : ''} onClick={closeMobileMenu}>
          About
        </NavLink>
        <NavLink href='/features' className={pathname === '/features' ? 'active' : ''} onClick={closeMobileMenu}>
          Features
        </NavLink>
        <NavLink href='/contact' className={pathname === '/contact' ? 'active' : ''} onClick={closeMobileMenu}>
          Contact
        </NavLink>
        {isAuthenticated && (
          <NavLink href='/dashboard' className={pathname.startsWith('/dashboard') ? 'active' : ''} onClick={closeMobileMenu}>
            Dashboard
          </NavLink>
        )}

        {/* Mobile Auth/User Menu */}
        {isAuthenticated ? (
          <MobileUserMenu>
            <UserButton>
              {user?.firstName} {user?.lastName}
            </UserButton>
            <LogoutButton onClick={handleLogout}>
              Logout
            </LogoutButton>
          </MobileUserMenu>
        ) : (
          <MobileAuthButtons>
            <MobileLoginButton onClick={handleLoginClick}>
              Login
            </MobileLoginButton>
            <MobileSignUpButton onClick={handleSignUpClick}>
              Sign Up
            </MobileSignUpButton>
          </MobileAuthButtons>
        )}
      </MobileNavMenu>
    </>
  );
};

export default Navbar;
