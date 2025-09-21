'use client'

import Link from 'next/link';
import styled from 'styled-components';

const FooterWrapper = styled.footer`
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(15, 15, 15, 0.98) 100%);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  color: #ffffff;
  padding: 80px 0 40px;
  margin-top: 100px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 10;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(6, 148, 251, 0.5), transparent);
  }
`;

const MainFooterSection = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1.5fr;
  gap: 50px;
  margin-bottom: 50px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr 1fr 1fr;
    gap: 40px;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr;
    gap: 30px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 30px;
    text-align: center;
  }
`;

const LogoSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 25px;

  @media (max-width: 768px) {
    align-items: center;
  }
`;

const FooterLogo = styled.img`
  height: 50px;
  width: auto;
  filter: brightness(1.1);
  transition: all 0.3s ease;

  &:hover {
    filter: brightness(1.3);
    transform: scale(1.05);
  }
`;

const QRCodeImage = styled.img`
  width: 90px;
  height: 90px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  padding: 8px;
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(6, 148, 251, 0.3);
    transform: scale(1.05);
    box-shadow: 0 8px 25px rgba(6, 148, 251, 0.2);
  }
`;

const FooterColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const FooterTitle = styled.h3`
  color: #ffffff;
  font-size: 17px;
  font-weight: 600;
  margin: 0;
  margin-bottom: 15px;
  text-transform: uppercase;
  letter-spacing: 1px;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 30px;
    height: 2px;
    background: linear-gradient(90deg, #0694fb, #0094ff);
    border-radius: 1px;
  }
`;

const FooterLink = styled(Link)`
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-size: 15px;
  font-weight: 400;
  transition: all 0.3s ease;
  line-height: 1.6;
  padding: 4px 0;
  position: relative;

  &:hover {
    color: #0694fb;
    transform: translateX(5px);
  }

  &::before {
    content: '';
    position: absolute;
    left: -15px;
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 1px;
    background: #0694fb;
    transition: width 0.3s ease;
  }

  &:hover::before {
    width: 10px;
  }
`;

const SubscribeForm = styled.form`
  display: flex;
  gap: 12px;
  margin-top: 15px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

const EmailInput = styled.input`
  padding: 14px 18px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 25px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  color: #ffffff;
  font-size: 15px;
  outline: none;
  transition: all 0.3s ease;
  min-width: 220px;

  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }

  &:focus {
    border-color: #0694fb;
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 0 3px rgba(6, 148, 251, 0.1);
  }

  @media (max-width: 768px) {
    min-width: 280px;
  }
`;

const SendButton = styled.button`
  padding: 14px 28px;
  background: linear-gradient(135deg, #0694fb, #0094ff);
  border: none;
  border-radius: 25px;
  color: #ffffff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  box-shadow: 0 4px 15px rgba(6, 148, 251, 0.3);

  &:hover {
    background: linear-gradient(135deg, #0580d6, #0078e6);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(6, 148, 251, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

const FooterBottom = styled.div`
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 25px;
  max-width: 1200px;
  margin: 0 auto;
  padding-left: 20px;
  padding-right: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }
`;

const CopyrightText = styled.p`
  color: rgba(255, 255, 255, 0.6);
  font-size: 15px;
  margin: 0;
  font-weight: 400;
`;

const LegalLinks = styled.div`
  display: flex;
  gap: 25px;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 15px;
  }
`;

const ContactSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: right;

  @media (max-width: 768px) {
    text-align: center;
  }
`;

const ContactText = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  margin: 0;
  font-weight: 400;
`;

const ContactEmail = styled.span`
  color: #0694fb;
  font-weight: 600;
  transition: all 0.3s ease;

  &:hover {
    color: #0094ff;
    text-shadow: 0 0 8px rgba(6, 148, 251, 0.5);
  }
`;

const CareersDot = styled.span`
  display: inline-block;
  width: 8px;
  height: 8px;
  background: linear-gradient(135deg, #0694fb, #0094ff);
  border-radius: 50%;
  margin-left: 10px;
  vertical-align: middle;
  box-shadow: 0 0 10px rgba(6, 148, 251, 0.5);
  animation: pulse 2s infinite;

  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(6, 148, 251, 0.7);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(6, 148, 251, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(6, 148, 251, 0);
    }
  }
`;

const Footer = () => {
  return (
    <FooterWrapper>
      <MainFooterSection>
        <LogoSection>
          <FooterLogo src="/intellidiag.png" alt="IntelliDiag Logo" />
          <QRCodeImage src="/qrcode.png" alt="QR Code" />
        </LogoSection>

        <FooterColumn>
          <FooterTitle>Connect</FooterTitle>
          <FooterLink href="https://x.com/intelliDiag">X</FooterLink>
          <FooterLink href="/">LinkedIn</FooterLink>
          <FooterLink href="/">Facebook</FooterLink>
          <FooterLink href="/">YouTube</FooterLink>
        </FooterColumn>

        <FooterColumn>
          <FooterTitle>Information</FooterTitle>
          <FooterLink href="/">How it works</FooterLink>
          <FooterLink href="/">Help Center</FooterLink>
          <FooterLink href="/">Support</FooterLink>
          <FooterLink href="/">What&apos;s new</FooterLink>
        </FooterColumn>

        <FooterColumn>
          <FooterTitle>Company</FooterTitle>
          <FooterLink href="/">Blog</FooterLink>
          <FooterLink href="/">
            Careers
            <CareersDot />
          </FooterLink>
        </FooterColumn>

        <FooterColumn>
          <FooterTitle>Subscribe to our updates</FooterTitle>
          <SubscribeForm>
            <EmailInput type="email" placeholder="Your email" />
            <SendButton>Send</SendButton>
          </SubscribeForm>
        </FooterColumn>
      </MainFooterSection>

      <FooterBottom>
        <div>
          <CopyrightText>
            © 2025 IntelliDiag. All rights reserved.
          </CopyrightText>
          <LegalLinks>
            <FooterLink href="/privacy">Privacy Policy</FooterLink>
            <FooterLink href="/terms">Terms of Use</FooterLink>
          </LegalLinks>
        </div>
        
        <ContactSection>
          <ContactText>
            For jobs <ContactEmail>jobs@intelliDiag.com</ContactEmail>
          </ContactText>
          <ContactText>
            For partnerships <ContactEmail>partners@intelliDiag.com</ContactEmail>
          </ContactText>
        </ContactSection>
      </FooterBottom>
    </FooterWrapper>
  );
};

export default Footer;
