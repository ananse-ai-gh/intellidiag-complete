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
  const [isScrolled, setIsScrolled] = useState(false);
  const [logoSize, setLogoSize] = useState<{ width: number; height: number }>({ width: 160, height: 40 });

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Set dashboard logo width to 80% of sidebar width (sidebar: 280px @ >=769px, 321px @ >=1024px)
  useEffect(() => {
    const computeLogoSize = () => {
      const isDashboard = pathname.startsWith('/dashboard');
      if (!isDashboard) {
        setLogoSize({ width: 160, height: 40 });
        return;
      }
      // Use fixed 240px width for dashboard as requested
      setLogoSize({ width: 240, height: 16 });
    };

    computeLogoSize();
    window.addEventListener('resize', computeLogoSize);
    return () => window.removeEventListener('resize', computeLogoSize);
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

  // Smooth scroll function for homepage sections
  const scrollToSection = (sectionId: string) => {
    if (pathname === '/') {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    } else {
      // If not on homepage, navigate to homepage first then scroll
      window.location.href = `/#${sectionId}`;
    }
    closeMobileMenu();
  };

  const isDashboard = pathname.startsWith('/dashboard');

  return (
    <>
      <NavbarContainer>
        <Nav isScrolled={isScrolled}>
          <LogoContainer>
            <Link href='/'>
              <Image 
                src='/intellidiag.png' 
                alt='IntelliDiag Logo' 
                width={isDashboard ? logoSize.width : 160} 
                height={isDashboard ? logoSize.height : 40}
                style={{
                  objectFit: 'contain',
                  height: 'auto',
                  width: isDashboard ? `${logoSize.width}px` : 'auto'
                }}
              />
            </Link>
          </LogoContainer>

          <NavMenu isOpen={isMobileMenuOpen}>
            <button 
              onClick={() => scrollToSection('about')} 
              className={pathname === '/' ? 'active' : ''}
              style={{ 
                cursor: 'pointer',
                background: 'none',
                border: 'none',
                color: 'inherit',
                font: 'inherit',
                padding: '8px 16px',
                borderRadius: '8px',
                transition: 'all 0.3s ease'
              }}
            >
              About
            </button>
            <button 
              onClick={() => scrollToSection('features')} 
              className={pathname === '/' ? 'active' : ''}
              style={{ 
                cursor: 'pointer',
                background: 'none',
                border: 'none',
                color: 'inherit',
                font: 'inherit',
                padding: '8px 16px',
                borderRadius: '8px',
                transition: 'all 0.3s ease'
              }}
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection('contact')}
              className={pathname === '/' ? 'active' : ''}
              style={{ 
                cursor: 'pointer',
                background: 'none',
                border: 'none',
                color: 'inherit',
                font: 'inherit',
                padding: '8px 16px',
                borderRadius: '8px',
                transition: 'all 0.3s ease'
              }}
            >
              Contact
            </button>
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

        <button 
          onClick={() => scrollToSection('about')}
          className={pathname === '/' ? 'active' : ''}
          style={{ 
            cursor: 'pointer',
            background: 'none',
            border: 'none',
            color: 'inherit',
            font: 'inherit',
            padding: '8px 16px',
            borderRadius: '8px',
            transition: 'all 0.3s ease',
            width: '100%',
            textAlign: 'left'
          }}
        >
          About
        </button>
        <button 
          onClick={() => scrollToSection('features')}
          className={pathname === '/' ? 'active' : ''}
          style={{ 
            cursor: 'pointer',
            background: 'none',
            border: 'none',
            color: 'inherit',
            font: 'inherit',
            padding: '8px 16px',
            borderRadius: '8px',
            transition: 'all 0.3s ease',
            width: '100%',
            textAlign: 'left'
          }}
        >
          Features
        </button>
        <button 
          onClick={() => scrollToSection('contact')}
          className={pathname === '/' ? 'active' : ''}
          style={{ 
            cursor: 'pointer',
            background: 'none',
            border: 'none',
            color: 'inherit',
            font: 'inherit',
            padding: '8px 16px',
            borderRadius: '8px',
            transition: 'all 0.3s ease',
            width: '100%',
            textAlign: 'left'
          }}
        >
          Contact
        </button>
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
