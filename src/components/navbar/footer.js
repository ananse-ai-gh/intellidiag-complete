'use client'

import Link from 'next/link';
import styled from 'styled-components';

const FooterWrapper = styled.footer`
  background: #000000;
  color: #ffffff;
  padding: 60px 0 30px;
  margin-top: 80px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 10;
`;

const MainFooterSection = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1.5fr;
  gap: 40px;
  margin-bottom: 40px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 30px;
    text-align: center;
  }
`;

const LogoSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;

  @media (max-width: 768px) {
    align-items: center;
  }
`;

const FooterLogo = styled.img`
  height: 40px;
  width: auto;
`;

const QRCodeImage = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 8px;
  background: #000000;
  border: 2px solid rgba(255, 255, 255, 0.2);
`;

const FooterColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const FooterTitle = styled.h3`
  color: #cccccc;
  font-size: 16px;
  font-weight: 500;
  margin: 0;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const FooterLink = styled(Link)`
  color: #ffffff;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s ease;
  line-height: 1.6;

  &:hover {
    color: #0694fb;
  }
`;

const SubscribeForm = styled.form`
  display: flex;
  gap: 10px;
  margin-top: 10px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

const EmailInput = styled.input`
  padding: 12px 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: #333333;
  color: #ffffff;
  font-size: 14px;
  outline: none;
  transition: all 0.3s ease;
  min-width: 200px;

  &::placeholder {
    color: #ffffff;
  }

  &:focus {
    border-color: #0694fb;
    background: #444444;
  }

  @media (max-width: 768px) {
    min-width: 250px;
  }
`;

const SendButton = styled.button`
  padding: 12px 24px;
  background: #0694fb;
  border: none;
  border-radius: 8px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;

  &:hover {
    background: #0094ff;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(6, 148, 251, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

const FooterBottom = styled.div`
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
  padding-left: 20px;
  padding-right: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const CopyrightText = styled.p`
  color: #999999;
  font-size: 14px;
  margin: 0;
`;

const LegalLinks = styled.div`
  display: flex;
  gap: 20px;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 10px;
  }

  /* Mobile devices (320px - 480px) */
  @media (min-width: 320px) and (max-width: 480px) {
    flex-direction: row;
    gap: 10px;
  }

  /* iPads, Tablets (481px - 768px) */
  @media (min-width: 481px) and (max-width: 768px) {
    gap: 10px;
    margin-top: 2px;
  }

  /* Small screens, laptops (769px - 1024px) */
  @media (min-width: 769px) and (max-width: 1024px) {
  }

  /* Desktops, large screens (1025px - 1200px) */
  @media (min-width: 1025px) and (max-width: 1200px) {
    font-size: 100px;
  }

  /* Extra large screens, TV (1201px and more) */
  @media (min-width: 1201px) {
  }
`;

const ContactSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  text-align: right;

  @media (max-width: 768px) {
    text-align: center;
  }
`;

const ContactText = styled.p`
  color: #999999;
  font-size: 12px;
  margin: 0;
`;

const ContactEmail = styled.span`
  color: #0694fb;
  font-weight: 500;
`;

const CareersDot = styled.span`
  display: inline-block;
  width: 6px;
  height: 6px;
  background: #ffffff;
  border-radius: 50%;
  margin-left: 8px;
  vertical-align: middle;
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
          <FooterLink href="/">What's new</FooterLink>
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
