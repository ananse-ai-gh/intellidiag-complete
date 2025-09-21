'use client'

import React, { useRef, useEffect } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import styled from 'styled-components';

const PricingContainer = styled.div`
  width: 100%;
  padding: 120px 20px;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.95), rgba(0, 149, 255, 0.03));
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
      radial-gradient(circle at 30% 30%, rgba(6, 148, 251, 0.08) 0%, transparent 50%),
      radial-gradient(circle at 70% 70%, rgba(0, 149, 255, 0.06) 0%, transparent 50%);
    pointer-events: none;
  }

  @media (max-width: 768px) {
    padding: 80px 16px;
  }
`;

const PricingContent = styled(motion.div)`
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
`;

const PricingHeader = styled.div`
  text-align: center;
  margin-bottom: 80px;

  @media (max-width: 768px) {
    margin-bottom: 60px;
  }
`;

const PricingTitle = styled(motion.h2)`
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

const PricingSubtitle = styled(motion.p)`
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

const PricingGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 40px;
  margin-top: 60px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 30px;
    margin-top: 40px;
  }
`;

const PricingCard = styled(motion.div)<{ featured?: boolean }>`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid ${props => props.featured ? 'rgba(6, 148, 251, 0.4)' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 24px;
  padding: 40px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;

  ${props => props.featured && `
    transform: scale(1.05);
    box-shadow: 0 20px 40px rgba(6, 148, 251, 0.2);
  `}

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props => props.featured 
      ? 'linear-gradient(135deg, rgba(6, 148, 251, 0.1), rgba(0, 149, 255, 0.05))'
      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.01))'};
    opacity: ${props => props.featured ? '1' : '0'};
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: ${props => props.featured ? 'scale(1.08)' : 'translateY(-8px)'};
    border-color: rgba(6, 148, 251, 0.5);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);

    &::before {
      opacity: 1;
    }
  }

  @media (max-width: 768px) {
    padding: 30px;
    transform: none !important;
    
    &:hover {
      transform: translateY(-4px) !important;
    }
  }
`;

const FeaturedBadge = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  background: linear-gradient(135deg, #0694fb, #0094ff);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  z-index: 3;
`;

const PlanName = styled.h3`
  font-size: 24px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 12px 0;
  position: relative;
  z-index: 2;
`;

const PlanDescription = styled.p`
  font-size: 16px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 24px 0;
  line-height: 1.5;
  position: relative;
  z-index: 2;
`;

const PlanPrice = styled.div`
  margin-bottom: 32px;
  position: relative;
  z-index: 2;
`;

const PriceAmount = styled.div`
  font-size: 48px;
  font-weight: 700;
  color: #ffffff;
  line-height: 1;
  margin-bottom: 8px;
`;

const PricePeriod = styled.div`
  font-size: 16px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.6);
`;

const FeaturesList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 32px 0;
  position: relative;
  z-index: 2;
`;

const FeatureItem = styled.li`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.8);

  &:last-child {
    margin-bottom: 0;
  }
`;

const CheckIcon = styled.div`
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #0694fb, #0094ff);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    width: 12px;
    height: 12px;
    color: white;
  }
`;

const PricingButton = styled(motion.button)<{ featured?: boolean }>`
  width: 100%;
  padding: 16px 24px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  z-index: 2;

  ${props => props.featured ? `
    background: linear-gradient(135deg, #0694fb, #0094ff);
    color: white;
    
    &:hover {
      background: linear-gradient(135deg, #0580d9, #0080e6);
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(6, 148, 251, 0.4);
    }
  ` : `
    background: rgba(255, 255, 255, 0.1);
    color: #ffffff;
    border: 1px solid rgba(255, 255, 255, 0.2);
    
    &:hover {
      background: rgba(255, 255, 255, 0.15);
      border-color: rgba(6, 148, 251, 0.4);
      transform: translateY(-2px);
    }
  `}
`;

function Pricing() {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  const plans = [
    {
      name: "Individual",
      description: "Perfect for individual healthcare professionals and small practices",
      price: "$99",
      period: "per month",
      features: [
        "Up to 100 scans per month",
        "AI-powered analysis for CT, MRI, X-ray",
        "Basic reporting and insights",
        "Email support",
        "HIPAA-compliant security"
      ],
      featured: false
    },
    {
      name: "Professional",
      description: "Ideal for medium-sized clinics and medical groups",
      price: "$299",
      period: "per month",
      features: [
        "Up to 500 scans per month",
        "Advanced AI analysis with confidence scores",
        "Comprehensive reporting dashboard",
        "Priority support",
        "API integration",
        "Custom workflow automation",
        "Multi-user access (up to 10 users)"
      ],
      featured: true
    },
    {
      name: "Enterprise",
      description: "Designed for large hospitals and healthcare systems",
      price: "Custom",
      period: "contact us",
      features: [
        "Unlimited scans",
        "Custom AI model training",
        "Dedicated account manager",
        "24/7 premium support",
        "Full API access",
        "Custom integrations",
        "Unlimited users",
        "On-premise deployment option"
      ],
      featured: false
    }
  ];

  return (
    <PricingContainer ref={ref}>
      <PricingContent
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
        <PricingHeader>
          <PricingTitle
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.8, ease: [0.2, 0.65, 0.3, 0.9] },
              },
            }}
          >
            Choose Your{" "}
            <span style={{
              background: "linear-gradient(135deg, #0694fb, #0094ff)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              Perfect Plan
            </span>
          </PricingTitle>
          <PricingSubtitle
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.8, delay: 0.2, ease: "easeOut" },
              },
            }}
          >
            Flexible pricing options designed to meet the needs of healthcare professionals at every level.
          </PricingSubtitle>
        </PricingHeader>

        <PricingGrid
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1, delayChildren: 0.5 },
            },
          }}
        >
          {plans.map((plan, index) => (
            <PricingCard
              key={index}
              featured={plan.featured}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0 },
              }}
              whileHover={{ scale: plan.featured ? 1.08 : 1.02 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              {plan.featured && <FeaturedBadge>Most Popular</FeaturedBadge>}
              
              <PlanName>{plan.name}</PlanName>
              <PlanDescription>{plan.description}</PlanDescription>
              
              <PlanPrice>
                <PriceAmount>{plan.price}</PriceAmount>
                <PricePeriod>{plan.period}</PricePeriod>
              </PlanPrice>

              <FeaturesList>
                {plan.features.map((feature, featureIndex) => (
                  <FeatureItem key={featureIndex}>
                    <CheckIcon>
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                    </CheckIcon>
                    {feature}
                  </FeatureItem>
                ))}
              </FeaturesList>

              <PricingButton
                featured={plan.featured}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                {plan.name === "Enterprise" ? "Contact Sales" : "Get Started"}
              </PricingButton>
            </PricingCard>
          ))}
        </PricingGrid>
      </PricingContent>
    </PricingContainer>
  );
}

export default Pricing;
