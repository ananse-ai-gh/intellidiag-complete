import React, { useState, useEffect, useRef } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import styled from "styled-components";

const ContactContainer = styled.div`
  min-height: 100vh;
  width: 100%;
  display: flex;
  margin: 0;
  padding: 120px 20px 80px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  z-index: 5;
  position: relative;
  box-sizing: border-box;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(6, 148, 251, 0.05));

  @media (max-width: 768px) {
    padding: 100px 16px 60px;
  }
`;

const ContactContent = styled(motion.div)`
  width: 100%;
  max-width: 1200px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: start;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 60px;
  }
`;

const ContactInfo = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 40px;
`;

const ContactHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const ContactTitle = styled(motion.h2)`
  font-size: 48px;
  font-weight: 700;
  line-height: 1.1;
  margin: 0;
  letter-spacing: -0.02em;
  color: #ffffff;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    font-size: 36px;
  }

  @media (max-width: 480px) {
    font-size: 28px;
  }
`;

const ContactSubtitle = styled(motion.p)`
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

const Highlight = styled.span`
  background: linear-gradient(135deg, #0694fb, #0094ff);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const ContactDetails = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const ContactItem = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    border-color: rgba(6, 148, 251, 0.3);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
  }
`;

const ContactIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #0694fb, #0094ff);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    width: 24px;
    height: 24px;
    color: white;
  }
`;

const ContactText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ContactLabel = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ContactValue = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: #ffffff;
`;

const ContactForm = styled(motion.form)`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(6, 148, 251, 0.05), rgba(0, 149, 255, 0.02));
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover::before {
    opacity: 1;
  }

  @media (max-width: 768px) {
    padding: 32px 24px;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
  z-index: 2;
`;

const FormLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 4px;
`;

const FormInput = styled.input`
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: #ffffff;
  font-size: 16px;
  font-weight: 400;
  transition: all 0.3s ease;
  position: relative;
  z-index: 2;

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  &:focus {
    outline: none;
    border-color: #0694fb;
    box-shadow: 0 0 0 3px rgba(6, 148, 251, 0.1);
    background: rgba(255, 255, 255, 0.15);
  }

  &:hover {
    border-color: rgba(255, 255, 255, 0.3);
    background: rgba(255, 255, 255, 0.12);
  }
`;

const FormTextarea = styled.textarea`
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: #ffffff;
  font-size: 16px;
  font-weight: 400;
  min-height: 120px;
  resize: vertical;
  transition: all 0.3s ease;
  position: relative;
  z-index: 2;
  font-family: inherit;

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  &:focus {
    outline: none;
    border-color: #0694fb;
    box-shadow: 0 0 0 3px rgba(6, 148, 251, 0.1);
    background: rgba(255, 255, 255, 0.15);
  }

  &:hover {
    border-color: rgba(255, 255, 255, 0.3);
    background: rgba(255, 255, 255, 0.12);
  }
`;

const FormSelect = styled.select`
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: #ffffff;
  font-size: 16px;
  font-weight: 400;
  transition: all 0.3s ease;
  position: relative;
  z-index: 2;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #0694fb;
    box-shadow: 0 0 0 3px rgba(6, 148, 251, 0.1);
    background: rgba(255, 255, 255, 0.15);
  }

  &:hover {
    border-color: rgba(255, 255, 255, 0.3);
    background: rgba(255, 255, 255, 0.12);
  }

  option {
    background: #1a1a1a;
    color: #ffffff;
  }
`;

const SubmitButton = styled(motion.button)`
  padding: 16px 32px;
  background: linear-gradient(135deg, #0694fb, #0094ff);
  border: none;
  border-radius: 12px;
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  z-index: 2;
  box-shadow: 0 8px 24px rgba(6, 148, 251, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(6, 148, 251, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

// Icon components
const EmailIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
  </svg>
);

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
  </svg>
);

const LocationIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
    <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
  </svg>
);

function Reach() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    inquiryType: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      organization: '',
      inquiryType: '',
      message: ''
    });
    setIsSubmitting(false);
    
    // Show success message (you can implement a toast notification here)
    alert('Thank you for your inquiry! We will get back to you soon.');
  };

  const contactDetails = [
    {
      icon: <EmailIcon />,
      label: "Email",
      value: "contact@intellidiag.com"
    },
    {
      icon: <PhoneIcon />,
      label: "Phone",
      value: "+1 (555) 123-4567"
    },
    {
      icon: <LocationIcon />,
      label: "Address",
      value: "123 Medical Plaza, Suite 456\nSan Francisco, CA 94102"
    },
    {
      icon: <ClockIcon />,
      label: "Business Hours",
      value: "Monday - Friday: 9:00 AM - 6:00 PM PST\nEmergency Support: 24/7"
    }
  ];

  return (
    <ContactContainer ref={ref}>
      <ContactContent
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
        <ContactInfo>
          <ContactHeader>
            <ContactTitle
              variants={{
                hidden: { opacity: 0, y: 40 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.8, ease: [0.2, 0.65, 0.3, 0.9] },
                },
              }}
            >
              Get in <Highlight>Touch</Highlight>
            </ContactTitle>
            <ContactSubtitle
              variants={{
                hidden: { opacity: 0, x: -30 },
                visible: {
                  opacity: 1,
                  x: 0,
                  transition: { duration: 0.7, ease: "backOut", delay: 0.5 },
                },
              }}
            >
              Ready to revolutionize your medical diagnostics? Contact our team 
              to learn how IntelliDiag can enhance your healthcare practice with 
              cutting-edge AI technology.
            </ContactSubtitle>
          </ContactHeader>

          <ContactDetails
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1, delayChildren: 0.8 },
              },
            }}
          >
            {contactDetails.map((item, index) => (
              <ContactItem
                key={index}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <ContactIcon>{item.icon}</ContactIcon>
                <ContactText>
                  <ContactLabel>{item.label}</ContactLabel>
                  <ContactValue style={{ whiteSpace: 'pre-line' }}>{item.value}</ContactValue>
                </ContactText>
              </ContactItem>
            ))}
          </ContactDetails>
        </ContactInfo>

        <ContactForm
          variants={{
            hidden: { opacity: 0, x: 30 },
            visible: {
              opacity: 1,
              x: 0,
              transition: { duration: 0.8, ease: [0.2, 0.65, 0.3, 0.9], delay: 0.3 },
            },
          }}
          onSubmit={handleSubmit}
        >
          <FormGroup>
            <FormLabel htmlFor="name">Full Name *</FormLabel>
            <FormInput
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              required
            />
          </FormGroup>

          <FormGroup>
            <FormLabel htmlFor="email">Email Address *</FormLabel>
            <FormInput
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email address"
              required
            />
          </FormGroup>

          <FormGroup>
            <FormLabel htmlFor="organization">Organization</FormLabel>
            <FormInput
              type="text"
              id="organization"
              name="organization"
              value={formData.organization}
              onChange={handleInputChange}
              placeholder="Hospital, Clinic, or Research Institution"
            />
          </FormGroup>

          <FormGroup>
            <FormLabel htmlFor="inquiryType">Inquiry Type *</FormLabel>
            <FormSelect
              id="inquiryType"
              name="inquiryType"
              value={formData.inquiryType}
              onChange={handleInputChange}
              required
            >
              <option value="">Select inquiry type</option>
              <option value="demo">Request Demo</option>
              <option value="pricing">Pricing Information</option>
              <option value="integration">Integration Support</option>
              <option value="partnership">Partnership Opportunity</option>
              <option value="support">Technical Support</option>
              <option value="other">Other</option>
            </FormSelect>
          </FormGroup>

          <FormGroup>
            <FormLabel htmlFor="message">Message *</FormLabel>
            <FormTextarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Tell us about your specific needs and how we can help..."
              required
            />
          </FormGroup>

          <SubmitButton
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </SubmitButton>
        </ContactForm>
      </ContactContent>
    </ContactContainer>
  );
}

export default Reach;
