'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Nav, NavLink, NavMenu, Bars, UserMenu, UserButton, LogoutButton } from "./NavBarElements";

const Navbar = () => {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div style={{ 
      display: "flex", 
      justifyContent: "center", 
      width: "100%",
      background: "rgba(0, 0, 0, 0.8)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
      padding: "10px 0"
    }}>
      <Nav
        style={{
          background: "transparent",
          borderRadius: "12px",
          zIndex: "999",
          display: "flex",
          gap: "90px",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Link href="/">
          <h1>
            <img src="/intellidiag.png" alt="IntelliDiag Logo" height="30px" />
          </h1>
        </Link>

        <NavMenu>
          <NavLink href="/" activeStyle={{ color: "#0094FF" }}>
            Home
          </NavLink>
          <NavLink href="/about" activeStyle={{ color: "#0094FF" }}>
            About
          </NavLink>
          <NavLink href="/features" activeStyle={{ color: "#0094FF" }}>
            Features
          </NavLink>
          <NavLink href="/contact" activeStyle={{ color: "#0094FF" }}>
            Contact
          </NavLink>
          {isAuthenticated && (
            <NavLink href="/dashboard" activeStyle={{ color: "#0094FF" }}>
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
            <Link href="/login" style={{ textDecoration: 'none' }}>
              <NavLink as="span" style={{ cursor: 'pointer' }}>
                Login
              </NavLink>
            </Link>
            <Link href="/register" style={{ textDecoration: 'none' }}>
              <NavLink as="span" style={{ 
                background: 'linear-gradient(135deg, #0694fb, #0094ff)',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer'
              }}>
                Sign Up
              </NavLink>
            </Link>
          </div>
        )}
      </Nav>
    </div>
  );
};

export default Navbar;
