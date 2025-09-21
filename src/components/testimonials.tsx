'use client'

import React, { useRef, useEffect } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import styled from 'styled-components';

const TestimonialsContainer = styled.div`
  width: 100%;
  padding: 120px 20px;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.9), rgba(6, 148, 251, 0.05));
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
      radial-gradient(circle at 20% 20%, rgba(6, 148, 251, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(0, 149, 255, 0.08) 0%, transparent 50%);
    pointer-events: none;
  }

  @media (max-width: 768px) {
    padding: 80px 16px;
  }
`;

const TestimonialsContent = styled(motion.div)`
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
`;

const TestimonialsHeader = styled.div`
  text-align: center;
  margin-bottom: 80px;

  @media (max-width: 768px) {
    margin-bottom: 60px;
  }
`;

const TestimonialsTitle = styled(motion.h2)`
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

const TestimonialsSubtitle = styled(motion.p)`
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

const TestimonialsGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 40px;
  margin-top: 60px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 30px;
    margin-top: 40px;
  }
`;

const TestimonialCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 40px;
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
    background: linear-gradient(135deg, rgba(6, 148, 251, 0.05), rgba(0, 149, 255, 0.03));
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: translateY(-8px);
    border-color: rgba(6, 148, 251, 0.3);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);

    &::before {
      opacity: 1;
    }
  }

  @media (max-width: 768px) {
    padding: 30px;
  }
`;

const QuoteIcon = styled.div`
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #0694fb, #0094ff);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  position: relative;
  z-index: 2;

  svg {
    width: 24px;
    height: 24px;
    color: white;
  }
`;

const TestimonialText = styled.p`
  font-size: 18px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  margin: 0 0 24px 0;
  position: relative;
  z-index: 2;
  font-style: italic;

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const TestimonialAuthor = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  z-index: 2;
`;

const AuthorAvatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0694fb, #0094ff);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: white;
  font-size: 18px;
`;

const AuthorInfo = styled.div`
  flex: 1;
`;

const AuthorName = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 4px 0;
`;

const AuthorTitle = styled.p`
  font-size: 14px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
`;

const AuthorHospital = styled.p`
  font-size: 13px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
`;

function Testimonials() {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  const testimonials = [
    {
      text: "IntelliDiag has revolutionized our diagnostic workflow. The AI analysis is incredibly accurate and has significantly reduced our analysis time from hours to minutes.",
      author: "Dr. Sarah Chen",
      title: "Chief Radiologist",
      hospital: "Mayo Clinic",
      avatar: "SC"
    },
    {
      text: "The platform's multi-modal imaging support is exceptional. We can now analyze CT, MRI, and X-ray scans with unprecedented precision and confidence.",
      author: "Dr. Michael Rodriguez",
      title: "Medical Director",
      hospital: "Johns Hopkins Hospital",
      avatar: "MR"
    },
    {
      text: "IntelliDiag's HIPAA-compliant security gives us peace of mind. The platform seamlessly integrates with our existing systems while maintaining the highest security standards.",
      author: "Dr. Emily Watson",
      title: "Head of Radiology",
      hospital: "Cleveland Clinic",
      avatar: "EW"
    }
  ];

  return (
    <TestimonialsContainer ref={ref}>
      <TestimonialsContent
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
        <TestimonialsHeader>
          <TestimonialsTitle
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.8, ease: [0.2, 0.65, 0.3, 0.9] },
              },
            }}
          >
            Trusted by{" "}
            <span style={{
              background: "linear-gradient(135deg, #0694fb, #0094ff)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              Healthcare Leaders
            </span>
          </TestimonialsTitle>
          <TestimonialsSubtitle
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.8, delay: 0.2, ease: "easeOut" },
              },
            }}
          >
            See what leading healthcare professionals say about IntelliDiag&apos;s impact on their diagnostic capabilities and patient care.
          </TestimonialsSubtitle>
        </TestimonialsHeader>

        <TestimonialsGrid
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1, delayChildren: 0.5 },
            },
          }}
        >
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0 },
              }}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <QuoteIcon>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
                </svg>
              </QuoteIcon>
              <TestimonialText>&ldquo;{testimonial.text}&rdquo;</TestimonialText>
              <TestimonialAuthor>
                <AuthorAvatar>{testimonial.avatar}</AuthorAvatar>
                <AuthorInfo>
                  <AuthorName>{testimonial.author}</AuthorName>
                  <AuthorTitle>{testimonial.title}</AuthorTitle>
                  <AuthorHospital>{testimonial.hospital}</AuthorHospital>
                </AuthorInfo>
              </TestimonialAuthor>
            </TestimonialCard>
          ))}
        </TestimonialsGrid>
      </TestimonialsContent>
    </TestimonialsContainer>
  );
}

export default Testimonials;
