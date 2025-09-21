import React, { useEffect, useRef } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import styled from "styled-components";

const AboutContainer = styled.div`
  min-height: 100vh;
  color: #fff;
  z-index: 5;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 120px 20px 80px;
  box-sizing: border-box;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(6, 148, 251, 0.05));

  @media (max-width: 768px) {
    padding: 100px 16px 60px;
  }
`;

const AboutContent = styled(motion.div)`
  z-index: 56;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 100%;
  max-width: 1200px;
  gap: 60px;
  padding: 0 20px;

  @media (max-width: 768px) {
    gap: 40px;
    padding: 0;
  }
`;

const AboutHeading = styled(motion.h2)`
  font-size: 56px;
  font-weight: 700;
  text-align: center;
  line-height: 1.1;
  margin: 0;
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

const Highlight = styled.span`
  background: linear-gradient(135deg, #0694fb, #0094ff);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(135deg, #0694fb, #0094ff);
    border-radius: 1px;
  }
`;

const AboutSubheading = styled(motion.p)`
  width: 100%;
  max-width: 800px;
  font-size: 20px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin: 0;
  letter-spacing: 0.005em;

  @media (max-width: 768px) {
    font-size: 18px;
  }

  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

const StatsContainer = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 40px;
  width: 100%;
  max-width: 1000px;
  margin-top: 40px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 30px;
  }
`;

const StatCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 40px 30px;
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
    background: linear-gradient(135deg, rgba(6, 148, 251, 0.1), rgba(0, 149, 255, 0.05));
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
    padding: 30px 20px;
  }
`;

const StatNumber = styled.div`
  font-size: 48px;
  font-weight: 700;
  color: #0694fb;
  margin-bottom: 12px;
  line-height: 1;
  position: relative;
  z-index: 2;

  @media (max-width: 768px) {
    font-size: 40px;
  }
`;

const StatLabel = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  position: relative;
  z-index: 2;
`;

const StatDescription = styled.div`
  font-size: 14px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 8px;
  line-height: 1.4;
  position: relative;
  z-index: 2;
`;

const MedicalIcon = styled(motion.div)`
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: linear-gradient(135deg, #0694fb, #0094ff);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  position: relative;
  z-index: 2;
  box-shadow: 0 8px 24px rgba(6, 148, 251, 0.3);

  svg {
    width: 40px;
    height: 40px;
    color: white;
  }
`;

function About() {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  const stats = [
    {
      number: "99.7%",
      label: "Accuracy Rate",
      description: "AI-powered diagnostic precision"
    },
    {
      number: "50ms",
      label: "Analysis Speed",
      description: "Real-time medical imaging results"
    },
    {
      number: "10K+",
      label: "Cases Analyzed",
      description: "Successfully processed medical scans"
    },
    {
      number: "24/7",
      label: "Availability",
      description: "Round-the-clock diagnostic support"
    }
  ];

  return (
    <AboutContainer ref={ref}>
      <AboutContent
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
        <MedicalIcon
          variants={{
            hidden: { opacity: 0, scale: 0.8 },
            visible: {
              opacity: 1,
              scale: 1,
              transition: { duration: 0.8, ease: [0.2, 0.65, 0.3, 0.9] },
            },
          }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </MedicalIcon>

        <AboutHeading
          variants={{
            hidden: { opacity: 0, y: 40 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.8, ease: [0.2, 0.65, 0.3, 0.9] },
            },
          }}
        >
          Revolutionizing Medical{" "}
          <Highlight>Diagnostics</Highlight> with AI
        </AboutHeading>

        <AboutSubheading
          variants={{
            hidden: { opacity: 0, x: -30 },
            visible: {
              opacity: 1,
              x: 0,
              transition: { duration: 0.7, ease: "backOut", delay: 0.5 },
            },
          }}
        >
          IntelliDiag harnesses cutting-edge artificial intelligence to provide 
          instant, accurate medical imaging analysis. Our platform empowers 
          healthcare professionals with AI-driven insights, reducing diagnostic 
          time while maintaining the highest standards of medical accuracy.
        </AboutSubheading>

        <StatsContainer
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1, delayChildren: 0.8 },
            },
          }}
        >
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <StatNumber>{stat.number}</StatNumber>
              <StatLabel>{stat.label}</StatLabel>
              <StatDescription>{stat.description}</StatDescription>
            </StatCard>
          ))}
        </StatsContainer>
      </AboutContent>
    </AboutContainer>
  );
}

export default About;
