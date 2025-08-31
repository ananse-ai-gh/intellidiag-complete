'use client'

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import styled from 'styled-components';

const TransitionOverlay = styled(motion.div)`
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
`;

const TransitionContent = styled(motion.div)`
  text-align: center;
  color: #ffffff;
`;

const TransitionText = styled(motion.h2)`
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  font-family: var(--font-primary);
`;

const TransitionSpinner = styled(motion.div)`
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid #0694fb;
  border-radius: 50%;
  margin: 20px auto;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

interface PageTransitionProps {
  children: React.ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionText, setTransitionText] = useState('');

  useEffect(() => {
    // Determine transition text based on the route
    if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
      setTransitionText('Welcome to your dashboard');
    } else if (pathname === '/') {
      setTransitionText('Welcome back');
    } else {
      setTransitionText('Loading...');
    }

    // Show transition for dashboard routes
    if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
      setIsTransitioning(true);
      
      // Hide transition after animation completes
      setTimeout(() => {
        setIsTransitioning(false);
      }, 1200); // Reduced timing for more seamless transition
    }
  }, [pathname]);

  return (
    <>
      <AnimatePresence>
        {isTransitioning && (
          <TransitionOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <TransitionContent>
              <TransitionText
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                {transitionText}
              </TransitionText>
              <TransitionSpinner
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, duration: 0.3 }}
              />
            </TransitionContent>
          </TransitionOverlay>
        )}
      </AnimatePresence>
      {children}
    </>
  );
}
