'use client'

import React, { useRef, useState, useEffect } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import styled from 'styled-components';

const NewsletterContainer = styled.div`
  width: 100%;
  padding: 120px 20px;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.95), rgba(6, 148, 251, 0.08));
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
      radial-gradient(circle at 30% 30%, rgba(6, 148, 251, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 70% 70%, rgba(0, 149, 255, 0.08) 0%, transparent 50%);
    pointer-events: none;
  }

  @media (max-width: 768px) {
    padding: 80px 16px;
  }
`;

const NewsletterContent = styled(motion.div)`
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
  position: relative;
  z-index: 2;
`;

const NewsletterTitle = styled(motion.h2)`
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

const NewsletterSubtitle = styled(motion.p)`
  font-size: 20px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.75);
  margin: 0 0 40px 0;
  line-height: 1.6;
  letter-spacing: 0.005em;

  @media (max-width: 768px) {
    font-size: 18px;
    margin-bottom: 32px;
  }

  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

const NewsletterForm = styled(motion.form)`
  display: flex;
  gap: 16px;
  max-width: 500px;
  margin: 0 auto;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
  }
`;

const EmailInput = styled.input`
  flex: 1;
  padding: 16px 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  color: #ffffff;
  font-size: 16px;
  font-weight: 400;
  transition: all 0.3s ease;

  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }

  &:focus {
    outline: none;
    border-color: rgba(6, 148, 251, 0.5);
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 0 3px rgba(6, 148, 251, 0.1);
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const SubscribeButton = styled(motion.button)<{ disabled?: boolean }>`
  padding: 16px 32px;
  border: none;
  border-radius: 12px;
  background: ${props => props.disabled 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'linear-gradient(135deg, #0694fb, #0094ff)'};
  color: ${props => props.disabled ? 'rgba(255, 255, 255, 0.5)' : 'white'};
  font-size: 16px;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  white-space: nowrap;

  &:hover {
    background: ${props => props.disabled 
      ? 'rgba(255, 255, 255, 0.1)' 
      : 'linear-gradient(135deg, #0580d9, #0080e6)'};
    transform: ${props => props.disabled ? 'none' : 'translateY(-2px)'};
    box-shadow: ${props => props.disabled 
      ? 'none' 
      : '0 8px 20px rgba(6, 148, 251, 0.4)'};
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const NewsletterBenefits = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 32px;
  margin-top: 60px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 24px;
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
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #0694fb, #0094ff);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;

  svg {
    width: 24px;
    height: 24px;
    color: white;
  }
`;

const BenefitTitle = styled.h3`
  font-size: 16px;
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

const SuccessMessage = styled(motion.div)`
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid rgba(0, 255, 136, 0.3);
  border-radius: 12px;
  padding: 16px;
  margin-top: 20px;
  color: #00ff88;
  font-size: 16px;
  font-weight: 500;
`;

const ErrorMessage = styled(motion.div)`
  background: rgba(255, 107, 107, 0.1);
  border: 1px solid rgba(255, 107, 107, 0.3);
  border-radius: 12px;
  padding: 16px;
  margin-top: 20px;
  color: #ff6b6b;
  font-size: 16px;
  font-weight: 500;
`;

function Newsletter() {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSubmitting) return;

    setIsSubmitting(true);
    setMessage(null);

    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setMessage({ type: 'success', text: 'Thank you for subscribing! You\'ll receive our latest updates soon.' });
      setEmail('');
    } catch (error) {
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const benefits = [
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ),
      title: "Latest AI Updates",
      description: "Stay informed about new features and AI model improvements"
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      ),
      title: "Exclusive Content",
      description: "Access to case studies, research papers, and best practices"
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ),
      title: "Early Access",
      description: "Be the first to try new features and provide feedback"
    }
  ];

  return (
    <NewsletterContainer ref={ref}>
      <NewsletterContent
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
        <NewsletterTitle
          variants={{
            hidden: { opacity: 0, y: 40 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.8, ease: [0.2, 0.65, 0.3, 0.9] },
            },
          }}
        >
          Stay{" "}
          <span style={{
            background: "linear-gradient(135deg, #0694fb, #0094ff)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            Updated
          </span>
        </NewsletterTitle>
        <NewsletterSubtitle
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.8, delay: 0.2, ease: "easeOut" },
            },
          }}
        >
          Get the latest insights, updates, and exclusive content delivered to your inbox.
        </NewsletterSubtitle>

        <NewsletterForm
          onSubmit={handleSubmit}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.8, delay: 0.4, ease: "easeOut" },
            },
          }}
        >
          <EmailInput
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isSubmitting}
          />
          <SubscribeButton
            type="submit"
            disabled={isSubmitting || !email}
            whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
            whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {isSubmitting ? 'Subscribing...' : 'Subscribe'}
          </SubscribeButton>
        </NewsletterForm>

        {message && (
          message.type === 'success' ? (
            <SuccessMessage
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {message.text}
            </SuccessMessage>
          ) : (
            <ErrorMessage
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {message.text}
            </ErrorMessage>
          )
        )}

        <NewsletterBenefits
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
        </NewsletterBenefits>
      </NewsletterContent>
    </NewsletterContainer>
  );
}

export default Newsletter;
