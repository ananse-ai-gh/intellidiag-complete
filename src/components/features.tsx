import React from "react";
import styled from "styled-components";
import { motion } from "framer-motion";

const FeaturesContainer = styled.section`
  margin: 120px auto 0;
  min-height: 600px;
  width: 90%;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #fff;
  z-index: 5;
  position: relative;
  gap: 60px;
  padding: 0 20px;
  box-sizing: border-box;
`;

const FeaturesHeader = styled.div`
  text-align: center;
  max-width: 800px;
`;

const FeaturesTitle = styled(motion.h2)`
  font-size: 48px;
  font-weight: 600;
  margin: 0 0 20px 0;
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: #ffffff;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);

  @media (max-width: 768px) {
    font-size: 36px;
  }

  @media (max-width: 480px) {
    font-size: 28px;
  }
`;

const FeaturesSubtitle = styled(motion.p)`
  font-size: 20px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.75);
  margin: 0;
  line-height: 1.6;
  letter-spacing: 0.005em;

  @media (max-width: 768px) {
    font-size: 18px;
  }

  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 40px;
  width: 100%;
  max-width: 1200px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 30px;
  }
`;

const FeatureCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 40px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(6, 148, 251, 0.05), rgba(0, 149, 255, 0.05));
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: translateY(-8px);
    border-color: rgba(6, 148, 251, 0.3);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);

    &::before {
      opacity: 1;
    }
  }

  @media (max-width: 768px) {
    padding: 32px 24px;
  }
`;

const FeatureIcon = styled.div<{ color: string }>`
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  position: relative;
  z-index: 2;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);

  svg {
    width: 40px;
    height: 40px;
    color: white;
  }
`;

const FeatureTitle = styled.h3`
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: #ffffff;
  line-height: 1.3;
  position: relative;
  z-index: 2;

  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

const FeatureDescription = styled.p`
  font-size: 16px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.75);
  margin: 0;
  line-height: 1.6;
  position: relative;
  z-index: 2;

  @media (max-width: 768px) {
    font-size: 15px;
  }
`;

// Medical-focused icon components
const BrainIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
  </svg>
);

const ScanIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 3v18h18V3H3zm16 16H5V5h14v14zm-8-2h2v-2h-2v2zm0-4h2V9h-2v4zm0-6h2V5h-2v2zm4 8h2v-2h-2v2zm0-4h2V9h-2v4zm0-6h2V5h-2v2z"/>
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
  </svg>
);

function Features() {
  const features = [
    {
      icon: <BrainIcon />,
      title: "AI-Powered Analysis",
      description: "Advanced machine learning algorithms analyze medical images with 99.7% accuracy, detecting anomalies and providing detailed diagnostic insights in real-time.",
      color: "linear-gradient(135deg, #0694fb, #0094ff)"
    },
    {
      icon: <ScanIcon />,
      title: "Multi-Modal Imaging",
      description: "Support for CT, MRI, X-ray, and ultrasound scans with intelligent preprocessing and automated quality assessment for optimal diagnostic results.",
      color: "linear-gradient(135deg, #00ff88, #00cc6a)"
    },
    {
      icon: <ShieldIcon />,
      title: "HIPAA-Compliant Security",
      description: "Enterprise-grade security with end-to-end encryption, secure data transmission, and comprehensive audit trails to protect patient privacy and meet regulatory requirements.",
      color: "linear-gradient(135deg, #ff6b6b, #ee5a52)"
    }
  ];

  return (
    <FeaturesContainer>
      <FeaturesHeader>
        <FeaturesTitle
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          Advanced{" "}
          <span style={{ 
            background: "linear-gradient(135deg, #0694fb, #0094ff)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            Medical AI
          </span>{" "}
          Capabilities
        </FeaturesTitle>
        <FeaturesSubtitle
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          Our cutting-edge platform combines advanced artificial intelligence with medical expertise to deliver precise, fast, and reliable diagnostic solutions for healthcare professionals worldwide.
        </FeaturesSubtitle>
      </FeaturesHeader>

      <FeaturesGrid>
        {features.map((feature, index) => (
          <FeatureCard
            key={index}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.2, ease: "easeOut" }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02 }}
          >
            <FeatureIcon color={feature.color}>
              {feature.icon}
            </FeatureIcon>
            <FeatureTitle>{feature.title}</FeatureTitle>
            <FeatureDescription>{feature.description}</FeatureDescription>
          </FeatureCard>
        ))}
      </FeaturesGrid>
    </FeaturesContainer>
  );
}

export default Features;