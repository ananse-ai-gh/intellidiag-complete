'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useModal } from '@/contexts/ModalContext';
import { Nav, NavLink, NavMenu, Bars, UserMenu, UserButton, LogoutButton } from './NavBarElements';

const Navbar = () => {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const { openModal } = useModal();

  const handleLogout = () => {
    logout(); // This will redirect to homepage
  };

  const handleLoginClick = (e: React.MouseEvent) => {
    e.preventDefault();
    openModal('login');
  };

  const handleSignUpClick = (e: React.MouseEvent) => {
    e.preventDefault();
    openModal('register');
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      width: '100%',
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '10px 0'
    }}>
      <Nav
        style={{
          background: 'transparent',
          borderRadius: '12px',
          zIndex: '999',
          display: 'flex',
          gap: '90px',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Link href='/'>
          <h1>
            <img src='/intellidiag.png' alt='IntelliDiag Logo' height='30px' />
          </h1>
        </Link>

        <NavMenu>
          <NavLink href='/'>
            Home
          </NavLink>
          <NavLink href='/about'>
            About
          </NavLink>
          <NavLink href='/features'>
            Features
          </NavLink>
          <NavLink href='/contact'>
            Contact
          </NavLink>
          {isAuthenticated && (
            <NavLink href='/dashboard'>
              Dashboard
            </NavLink>
          )}
        </NavMenu>

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
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <button 
              onClick={handleLoginClick}
              style={{ 
                background: 'none',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Login
            </button>
            <button 
              onClick={handleSignUpClick}
              style={{ 
                background: 'linear-gradient(135deg, #0694fb, #0094ff)',
                border: 'none',
                color: '#fff',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Sign Up
            </button>
          </div>
        )}
      </Nav>
    </div>
  );
};

export default Navbar;
