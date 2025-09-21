'use client'

import React, { useRef, useState, useEffect } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import styled from 'styled-components';

const DemoContainer = styled.div`
  width: 100%;
  padding: 120px 20px;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.9), rgba(0, 149, 255, 0.05));
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
      radial-gradient(circle at 20% 80%, rgba(6, 148, 251, 0.1) 0%, transparent 60%),
      radial-gradient(circle at 80% 20%, rgba(0, 149, 255, 0.08) 0%, transparent 60%);
    pointer-events: none;
  }

  @media (max-width: 768px) {
    padding: 80px 16px;
  }
`;

const DemoContent = styled(motion.div)`
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
`;

const DemoHeader = styled.div`
  text-align: center;
  margin-bottom: 80px;

  @media (max-width: 768px) {
    margin-bottom: 60px;
  }
`;

const DemoTitle = styled(motion.h2)`
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

const DemoSubtitle = styled(motion.p)`
  font-size: 20px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.75);
  margin: 0;
  line-height: 1.6;
  letter-spacing: 0.005em;
  max-width: 600px;
  margin: 0 auto;

  @media (max-width: 768px) {
    font-size: 18px;
  }

  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

const DemoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: center;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 60px;
  }
`;

const DemoVisual = styled(motion.div)`
  position: relative;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 40px;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(6, 148, 251, 0.05), rgba(0, 149, 255, 0.03));
    pointer-events: none;
  }

  @media (max-width: 768px) {
    padding: 30px;
  }
`;

const ScanImage = styled.div`
  width: 100%;
  height: 300px;
  background: 
    linear-gradient(135deg, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)),
    url('/ct-mri.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 16px;
  position: relative;
  overflow: hidden;
  margin-bottom: 24px;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, 
      transparent 30%, 
      rgba(6, 148, 251, 0.1) 50%, 
      transparent 70%);
    animation: scanLine 3s ease-in-out infinite;
  }

  @keyframes scanLine {
    0%, 100% {
      transform: translateX(-100%);
    }
    50% {
      transform: translateX(100%);
    }
  }
`;

const AnalysisOverlay = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(6, 148, 251, 0.3);
`;

const AnalysisText = styled.div`
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
`;

const ConfidenceBar = styled.div`
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 8px;
`;

const ConfidenceFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #0694fb, #0094ff);
  border-radius: 3px;
  width: 97%;
  animation: confidencePulse 2s ease-in-out infinite;
`;

const ConfidenceText = styled.div`
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
`;

const DemoControls = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
`;

const ControlButton = styled.button<{ active?: boolean }>`
  padding: 8px 16px;
  border: 1px solid ${props => props.active ? 'rgba(6, 148, 251, 0.5)' : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 8px;
  background: ${props => props.active ? 'rgba(6, 148, 251, 0.1)' : 'transparent'};
  color: ${props => props.active ? '#0694fb' : 'rgba(255, 255, 255, 0.8)'};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(6, 148, 251, 0.5);
    background: rgba(6, 148, 251, 0.1);
    color: #0694fb;
  }
`;

const DemoInfo = styled.div`
  position: relative;
  z-index: 2;
`;

const DemoStep = styled(motion.div)`
  margin-bottom: 32px;
`;

const StepNumber = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #0694fb, #0094ff);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: white;
  margin-bottom: 16px;
`;

const StepTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 8px 0;
`;

const StepDescription = styled.p`
  font-size: 16px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  line-height: 1.5;
`;

const TryDemoButton = styled(motion.button)`
  background: linear-gradient(135deg, #0694fb, #0094ff);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px 32px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 24px;

  &:hover {
    background: linear-gradient(135deg, #0580d9, #0080e6);
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(6, 148, 251, 0.4);
  }
`;

function Demo() {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const [activeScan, setActiveScan] = useState('CT');

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  const scanTypes = ['CT', 'MRI', 'X-Ray', 'Ultrasound'];

  const steps = [
    {
      number: "1",
      title: "Upload Medical Images",
      description: "Simply drag and drop your medical images or use our secure upload interface. We support CT, MRI, X-ray, and ultrasound scans."
    },
    {
      number: "2", 
      title: "AI Analysis Processing",
      description: "Our advanced AI algorithms analyze your images in real-time, detecting anomalies and providing detailed diagnostic insights."
    },
    {
      number: "3",
      title: "Get Instant Results",
      description: "Receive comprehensive analysis reports with confidence scores, highlighted areas of interest, and detailed findings within seconds."
    }
  ];

  return (
    <DemoContainer ref={ref}>
      <DemoContent
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
        <DemoHeader>
          <DemoTitle
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.8, ease: [0.2, 0.65, 0.3, 0.9] },
              },
            }}
          >
            See{" "}
            <span style={{
              background: "linear-gradient(135deg, #0694fb, #0094ff)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              IntelliDiag
            </span>{" "}
            in Action
          </DemoTitle>
          <DemoSubtitle
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.8, delay: 0.2, ease: "easeOut" },
              },
            }}
          >
            Experience the power of AI-driven medical diagnostics with our interactive demo.
          </DemoSubtitle>
        </DemoHeader>

        <DemoGrid>
          <DemoVisual
            variants={{
              hidden: { opacity: 0, x: -30 },
              visible: {
                opacity: 1,
                x: 0,
                transition: { duration: 0.8, ease: [0.2, 0.65, 0.3, 0.9] },
              },
            }}
          >
            <DemoControls>
              {scanTypes.map((scan) => (
                <ControlButton
                  key={scan}
                  active={activeScan === scan}
                  onClick={() => setActiveScan(scan)}
                >
                  {scan}
                </ControlButton>
              ))}
            </DemoControls>

            <ScanImage>
              <AnalysisOverlay>
                <AnalysisText>AI Analysis: {activeScan} Scan</AnalysisText>
                <ConfidenceBar>
                  <ConfidenceFill />
                </ConfidenceBar>
                <ConfidenceText>Confidence: 97.3%</ConfidenceText>
              </AnalysisOverlay>
            </ScanImage>

            <TryDemoButton
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              Try Interactive Demo
            </TryDemoButton>
          </DemoVisual>

          <DemoInfo>
            {steps.map((step, index) => (
              <DemoStep
                key={index}
                variants={{
                  hidden: { opacity: 0, x: 30 },
                  visible: {
                    opacity: 1,
                    x: 0,
                    transition: { duration: 0.6, delay: index * 0.2, ease: "easeOut" },
                  },
                }}
              >
                <StepNumber>{step.number}</StepNumber>
                <StepTitle>{step.title}</StepTitle>
                <StepDescription>{step.description}</StepDescription>
              </DemoStep>
            ))}
          </DemoInfo>
        </DemoGrid>
      </DemoContent>
    </DemoContainer>
  );
}

export default Demo;
