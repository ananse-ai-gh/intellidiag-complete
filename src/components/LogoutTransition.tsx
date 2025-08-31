'use client'

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { FaSignOutAlt } from 'react-icons/fa';

const LogoutOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #0a0a23 0%, #1a1a3a 50%, #0a0a23 100%);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  backdrop-filter: blur(10px);
`;

const LogoutContent = styled(motion.div)`
  text-align: center;
  color: #ffffff;
`;

const LogoutIcon = styled(motion.div)`
  font-size: 48px;
  color: #0694fb;
  margin-bottom: 20px;
`;

const LogoutText = styled(motion.h2)`
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  font-family: var(--font-primary);
`;

const LogoutSubtext = styled(motion.p)`
  font-size: 16px;
  color: #9c9c9c;
  margin: 10px 0 0 0;
  font-family: var(--font-primary);
`;

interface LogoutTransitionProps {
  isLoggingOut: boolean;
  onComplete?: () => void;
}

export default function LogoutTransition({ isLoggingOut, onComplete }: LogoutTransitionProps) {
  const [showTransition, setShowTransition] = useState(false);

  useEffect(() => {
    if (isLoggingOut) {
      setShowTransition(true);
      
      // Hide transition after animation (redirect is handled in AuthContext)
      setTimeout(() => {
        setShowTransition(false);
      }, 1500);
    }
  }, [isLoggingOut]);

  return (
    <AnimatePresence>
      {showTransition && (
        <LogoutOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <LogoutContent>
            <LogoutIcon
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, duration: 0.6, type: "spring" }}
            >
              <FaSignOutAlt />
            </LogoutIcon>
            <LogoutText
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              Signing out...
            </LogoutText>
            <LogoutSubtext
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              Taking you back to the homepage
            </LogoutSubtext>
          </LogoutContent>
        </LogoutOverlay>
      )}
    </AnimatePresence>
  );
}
