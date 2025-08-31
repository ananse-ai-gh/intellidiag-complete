'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Nav, NavLink, NavMenu, Bars, UserMenu, UserButton, LogoutButton } from './NavBarElements';

const Navbar = () => {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
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
            <Link href='/login' style={{ textDecoration: 'none' }}>
              <span style={{ cursor: 'pointer' }}>
                Login
              </span>
            </Link>
            <Link href='/register' style={{ textDecoration: 'none' }}>
              <span style={{ 
                background: 'linear-gradient(135deg, #0694fb, #0094ff)',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer'
              }}>
                Sign Up
              </span>
            </Link>
          </div>
        )}
      </Nav>
    </div>
  );
};

export default Navbar;
