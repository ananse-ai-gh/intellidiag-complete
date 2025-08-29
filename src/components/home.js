'use client'

import React, { useState, useRef, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate,
  useIsPresent,
} from "framer-motion";
import { useRouter } from "next/navigation";
import styled, { createGlobalStyle } from "styled-components";
import { useAuth } from "@/contexts/AuthContext";

// Global styles for the overlay
const GlobalOverlayStyle = createGlobalStyle`
  body {
    overflow: ${(props) => (props.isOverlayOpen ? "hidden" : "auto")};
  }
`;

const HomepageContainer = styled.div`
  font-family: "SF Pro Display";
  min-height: 100vh;
  width: 100%;
  color: #fff;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;

  /* Mobile devices (320px - 480px) */
  @media (min-width: 320px) and (max-width: 480px) {
    padding: 15px;
  }
`;

const HomepageContent = styled.div`
  width: 90%;
  max-width: 1216px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16px;
  z-index: 56;
  position: relative;
`;

const HomepageHeading = styled.h1`
  font-size: 32px;
  font-weight: 500;
  margin: 0;
  line-height: 1.2;

  /* Mobile devices (320px - 480px) */
  @media (min-width: 320px) and (max-width: 480px) {
    font-size: 28px;
    margin-bottom: 10px;
  }

  /* iPads, Tablets (481px - 768px) */
  @media (min-width: 481px) and (max-width: 768px) {
    font-size: 42px;
    margin-bottom: 0px;
  }

  /* Small screens, laptops (769px - 1024px) */
  @media (min-width: 769px) and (max-width: 1024px) {
    font-size: 52px;
    margin-bottom: 0px;
    width: 90%;
  }

  /* Desktops, large screens (1024px - 1200px) */
  @media (min-width: 1024px) and (max-width: 1200px) {
    font-size: 58px;
    margin-bottom: 0px;
  }

  /* Extra large screens, TV (1201px and more) */
  @media (min-width: 1201px) {
    font-size: 62px;
  }
`;

const Highlight = styled.span`
  color: #0094ff;
`;

const HomepageSubcontent = styled.div`
  width: 100%;
  max-width: 545px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
`;

const HomepageSubheading = styled.h2`
  font-size: 14px;
  font-weight: 400;
  color: #9c9c9c;
  margin: 0;

  @media (min-width: 320px) and (max-width: 480px) {
    font-size: 16px;
    margin-top: 0;
  }

  /* iPads, Tablets (481px - 768px) */
  @media (min-width: 481px) and (max-width: 768px) {
    font-size: 22px;
    margin-bottom: 25px;
  }

  /* Small screens, laptops (769px - 1023px) */
  @media (min-width: 769px) and (max-width: 1023px) {
    font-size: 25px;
    margin-bottom: 25px;
    margin-top: 0;
  }

  /* Desktops, large screens (1023px - 1200px) */
  @media (min-width: 1023px) and (max-width: 1200px) {
    font-size: 28px;
    margin-bottom: 25px;
  }

  /* Extra large screens, TV (1201px and more) */
  @media (min-width: 1201px) {
    font-size: 23px;
  }
`;

const HomepageButton = styled(motion.button)`
  height: 48px;
  width: 160px;
  background-color: #0694fb;
  border-radius: 13px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 16px;
  cursor: pointer;
  border: none;
  color: #fff;
  padding: 0 20px;

  /* iPads, Tablets (481px - 768px) */
  @media (min-width: 481px) and (max-width: 768px) {
    height: 56px;
    width: 175px;
    font-size: 20px;
  }

  /* Mobile devices (320px - 480px) */
  @media (min-width: 320px) and (max-width: 480px) {
    height: 40px;
    width: 115px;
    font-size: 13px;
    border-radius: 9px;
  }

  /* Small screens, laptops (769px - 1024px) */
  @media (min-width: 769px) and (max-width: 1024px) {
    height: 55px;
    width: 180px;
    font-size: 19px;
  }

  /* Desktops, large screens (1025px - 1200px) */
  @media (min-width: 1025px) and (max-width: 1200px) {
    height: 58px;
    width: 182px;
    font-size: 20px;
  }
`;

const OverlayRoot = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  z-index: 1000;
`;

const OverlayContent = styled(motion.div)`
  backdrop-filter: blur(4px);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
`;

const ModalContainer = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 40px;
  max-width: 600px;
  width: 100%;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 30px 20px;
    margin: 20px;
  }
`;

const ModalTitle = styled.h2`
  font-size: 32px;
  font-weight: 600;
  margin: 0 0 20px 0;
  color: #fff;

  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const ModalDescription = styled.p`
  font-size: 18px;
  line-height: 1.6;
  margin: 0 0 30px 0;
  color: #ccc;

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const ModalButton = styled(motion.button)`
  background: linear-gradient(135deg, #0694fb, #0094ff);
  border: none;
  border-radius: 12px;
  padding: 16px 32px;
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 10px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(6, 148, 251, 0.3);
  }

  @media (max-width: 768px) {
    padding: 14px 28px;
    font-size: 16px;
  }
`;

const CloseButton = styled(motion.button)`
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #fff;
  font-size: 20px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: rotate(90deg);
  }
`;

const ModalFooterText = styled.p`
  font-size: 15px;
  display: none;

  @media (min-width: 320px) and (max-width: 480px) {
    font-size: 20px;
    display: none;
  }
`;

const GradientContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1001;
`;

const ExpandingCircle = styled(motion.div)`
  position: absolute;
  border-radius: 50%;
  background: rgba(0, 149, 255, 0.8);
  filter: blur(15px);
  transform-origin: center;
  will-change: transform;
`;

const GradientCircle = styled(motion.div)`
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  width: 200%;
  aspect-ratio: 1;
  will-change: transform;
`;

function Homepage() {
  const router = useRouter();
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const ref = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateSize = () => {
      setSize({
        width: ref.current?.clientWidth || 0,
        height: ref.current?.clientHeight || 0,
      });
    };

    updateSize();
    window.addEventListener("resize", updateSize);

    return () => window.removeEventListener("resize", updateSize);
  }, [ref]);

  const handleButtonClick = () => {
    setIsOverlayOpen(true);
  };

  const closeOverlay = () => {
    setIsOverlayOpen(false);
  };

  const handleGetStarted = () => {
    router.push('/dashboard');
  };

  return (
    <>
      <GlobalOverlayStyle isOverlayOpen={isOverlayOpen} />
      <HomepageContainer ref={ref}>
        <HomepageContent>
          <HomepageHeading>
            Revolutionizing <Highlight>Diagnosis</Highlight> with the help of
            Artificial Intelligence
          </HomepageHeading>

          <HomepageSubcontent>
            <HomepageSubheading>
              Empowering individuals and healthcare professionals with advanced
              diagnostic tools and personalized treatment plans
            </HomepageSubheading>

            <HomepageButton
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
              onClick={handleButtonClick}
              aria-label="Get Started"
            >
              Get Started
            </HomepageButton>
          </HomepageSubcontent>
        </HomepageContent>

        <AnimatePresence>
          {isOverlayOpen ? (
            <ImmersiveOverlay close={closeOverlay} size={size} onGetStarted={handleGetStarted} />
          ) : null}
        </AnimatePresence>
      </HomepageContainer>
    </>
  );
}

function ImmersiveOverlay({ close, size, onGetStarted }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  };

  const handleLearnMore = () => {
    router.push('/features');
  };

  return (
    <OverlayRoot>
      <GradientContainer>
        <ExpandingCircle
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 2, opacity: 0.6 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{
            left: size.width / 2,
            top: size.height / 2,
          }}
        />
        <GradientCircle
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.3 }}
          transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
          style={{
            left: -size.width / 2,
            top: -size.height / 2,
            background: "radial-gradient(circle, rgba(0, 149, 255, 0.6) 0%, rgba(0, 149, 255, 0) 70%)",
          }}
        />
      </GradientContainer>

      <OverlayContent>
        <ModalContainer
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <ModalTitle>Welcome to IntelliDiag</ModalTitle>
          <ModalDescription>
            Experience the future of medical diagnostics with AI-powered insights and advanced imaging technology.
          </ModalDescription>
          
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <ModalButton onClick={handleGetStarted}>
              {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
            </ModalButton>
            <ModalButton onClick={handleLearnMore} style={{ 
              background: 'rgba(255, 255, 255, 0.1)', 
              border: '1px solid rgba(255, 255, 255, 0.3)' 
            }}>
              Learn More
            </ModalButton>
          </div>
          
          <CloseButton onClick={close}>×</CloseButton>
        </ModalContainer>
      </OverlayContent>
    </OverlayRoot>
  );
}

export default Homepage;
