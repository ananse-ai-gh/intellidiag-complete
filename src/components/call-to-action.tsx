'use client'

import React, { useRef, useEffect } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import styled from 'styled-components';

const CTAContainer = styled.div`
  width: 100%;
  padding: 120px 20px;
  background: linear-gradient(135deg, rgba(6, 148, 251, 0.1), rgba(0, 149, 255, 0.05));
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 20%, rgba(6, 148, 251, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(0, 149, 255, 0.1) 0%, transparent 50%),
      linear-gradient(45deg, transparent 30%, rgba(6, 148, 251, 0.05) 50%, transparent 70%);
    pointer-events: none;
    animation: backgroundShift 10s ease-in-out infinite;
  }

  @keyframes backgroundShift {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.8;
      transform: scale(1.05);
    }
  }

  @media (max-width: 768px) {
    padding: 80px 16px;
  }
`;

const CTAContent = styled(motion.div)`
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
  position: relative;
  z-index: 2;
`;

const CTATitle = styled(motion.h2)`
  font-size: 56px;
  font-weight: 700;
  margin: 0 0 24px 0;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: #ffffff;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    font-size: 42px;
  }

  @media (max-width: 480px) {
    font-size: 32px;
  }
`;

const CTASubtitle = styled(motion.p)`
  font-size: 24px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 40px 0;
  line-height: 1.5;
  letter-spacing: 0.005em;

  @media (max-width: 768px) {
    font-size: 20px;
    margin-bottom: 32px;
  }

  @media (max-width: 480px) {
    font-size: 18px;
  }
`;

const CTAButtons = styled(motion.div)`
  display: flex;
  gap: 24px;
  justify-content: center;
  margin-bottom: 60px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
    margin-bottom: 40px;
  }
`;

const PrimaryButton = styled(motion.button)`
  background: linear-gradient(135deg, #0694fb, #0094ff);
  color: white;
  border: none;
  border-radius: 16px;
  padding: 20px 40px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s ease;
  }

  &:hover {
    background: linear-gradient(135deg, #0580d9, #0080e6);
    transform: translateY(-3px);
    box-shadow: 0 12px 24px rgba(6, 148, 251, 0.4);

    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(-1px);
  }

  @media (max-width: 768px) {
    width: 100%;
    padding: 18px 32px;
    font-size: 16px;
  }
`;

const SecondaryButton = styled(motion.button)`
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 18px 38px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(20px);

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(6, 148, 251, 0.5);
    transform: translateY(-3px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: translateY(-1px);
  }

  @media (max-width: 768px) {
    width: 100%;
    padding: 16px 30px;
    font-size: 16px;
  }
`;

const CTABenefits = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 40px;
  margin-top: 60px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 32px;
    margin-top: 40px;
  }
`;

const BenefitItem = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const BenefitIcon = styled.div`
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #0694fb, #0094ff);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  box-shadow: 0 8px 24px rgba(6, 148, 251, 0.3);

  svg {
    width: 32px;
    height: 32px;
    color: white;
  }
`;

const BenefitTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 8px 0;
`;

const BenefitDescription = styled.p`
  font-size: 14px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  line-height: 1.4;
`;

const TrustBadges = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 40px;
  margin-top: 60px;
  opacity: 0.6;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 20px;
    margin-top: 40px;
  }
`;

const TrustBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);

  svg {
    width: 20px;
    height: 20px;
  }
`;

function CallToAction() {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  const benefits = [
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ),
      title: "Start Free Trial",
      description: "14-day free trial with full access to all features"
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      ),
      title: "No Setup Fees",
      description: "Get started immediately without any upfront costs"
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ),
      title: "24/7 Support",
      description: "Round-the-clock assistance from our expert team"
    }
  ];

  const handleGetStarted = () => {
    // Navigate to dashboard or signup
    window.location.href = '/dashboard';
  };

  const handleScheduleDemo = () => {
    // Open demo scheduling modal or navigate to contact
    window.location.href = '/contact';
  };

  return (
    <CTAContainer ref={ref}>
      <CTAContent
        initial="hidden"
        animate={controls}
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2, delayChildren: 0.3 },
          },
        }}
      >
        <CTATitle
          variants={{
            hidden: { opacity: 0, y: 40 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.8, ease: [0.2, 0.65, 0.3, 0.9] },
            },
          }}
        >
          Ready to Transform{" "}
          <span style={{
            background: "linear-gradient(135deg, #0694fb, #0094ff)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            Healthcare
          </span>{" "}
          with AI?
        </CTATitle>
        <CTASubtitle
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.8, delay: 0.2, ease: "easeOut" },
            },
          }}
        >
          Join thousands of healthcare professionals who are already using IntelliDiag to enhance their diagnostic capabilities and improve patient outcomes.
        </CTASubtitle>

        <CTAButtons
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.8, delay: 0.4, ease: "easeOut" },
            },
          }}
        >
          <PrimaryButton
            onClick={handleGetStarted}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            Start Free Trial
          </PrimaryButton>
          <SecondaryButton
            onClick={handleScheduleDemo}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            Schedule Demo
          </SecondaryButton>
        </CTAButtons>

        <CTABenefits
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1, delayChildren: 0.6 },
            },
          }}
        >
          {benefits.map((benefit, index) => (
            <BenefitItem
              key={index}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <BenefitIcon>{benefit.icon}</BenefitIcon>
              <BenefitTitle>{benefit.title}</BenefitTitle>
              <BenefitDescription>{benefit.description}</BenefitDescription>
            </BenefitItem>
          ))}
        </CTABenefits>

        <TrustBadges
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.8, delay: 0.8, ease: "easeOut" },
            },
          }}
        >
          <TrustBadge>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
            </svg>
            HIPAA Compliant
          </TrustBadge>
          <TrustBadge>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            SOC 2 Certified
          </TrustBadge>
          <TrustBadge>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            ISO 27001
          </TrustBadge>
        </TrustBadges>
      </CTAContent>
    </CTAContainer>
  );
}

export default CallToAction;
