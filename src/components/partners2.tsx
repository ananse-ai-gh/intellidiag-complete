import React from "react";
import { motion } from "framer-motion";
import styled from "styled-components";

const PartnersContainer = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  z-index: 5;
  position: relative;
  // background-color: red;
  padding: 40px 20px;
  box-sizing: border-box;

  /* Mobile devices (320px - 480px) */
  @media (min-width: 320px) and (max-width: 480px) {
    padding: 30px 15px;
    margin-bottom: 100px;
  }

  /* iPads, Tablets (481px - 768px) */
  @media (min-width: 481px) and (max-width: 768px) {
    gap: 20px;
    margin-bottom: 150px;
  }

  /* Small screens, laptops (769px - 1024px) */
  @media (min-width: 769px) and (max-width: 1024px) {
    padding: 50px 70px;
    min-height: 54vh;
  }

  /* Desktops, large screens (1025px - 1200px) */
  @media (min-width: 1025px) and (max-width: 1200px) {
  }

  /* Extra large screens, TV (1201px and more) */
  @media (min-width: 1201px) {
  }
`;

const PartnersHeading = styled.h1`
  width: 90%;
  max-width: 700px;
  font-size: 24px;
  font-weight: 500;
  text-align: center;
  line-height: 1.2;
  margin-bottom: 0px;

  /* Mobile devices (320px - 480px) */
  @media (min-width: 320px) and (max-width: 480px) {
    font-size: 20px;
    width: 260px;
    // margin-bottom: 35px;
  }

  /* iPads, Tablets (481px - 768px) */
  @media (min-width: 481px) and (max-width: 768px) {
    font-size: 28px;
    max-width: 70%;
    margin-bottom: 0px;
  }

  /* Small screens, laptops (769px - 1024px) */
  @media (min-width: 769px) and (max-width: 1024px) {
    font-size: 32px;
    width: 70%;
    margin-bottom: 20px;
  }

  /* Desktops, large screens (1025px - 1200px) */
  @media (min-width: 1025px) and (max-width: 1200px) {
    font-size: 36px;
    margin-bottom: 35px;
  }

  /* Extra large screens, TV (1201px and more) */
  @media (min-width: 1201px) {
    font-size: 40px;
    margin-bottom: 40px;
  }
`;

const Highlight = styled.span`
  color: #0094ff;
`;

const PartnersGrid = styled(motion.div)`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 40px;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 1400px;

  /* Small screens, laptops (769px - 1024px) */
  @media (min-width: 769px) and (max-width: 1024px) {
    gap: 45px;
  }

  /* Mobile devices (320px - 480px) */
  @media (min-width: 320px) and (max-width: 480px) {
  }

  /* iPads, Tablets (481px - 768px) */
  @media (min-width: 481px) and (max-width: 768px) {
    gap: 20px;
  }

  /* Small screens, laptops (769px - 1024px) */
  @media (min-width: 769px) and (max-width: 1024px) {
    gap: 20px;
  }

  /* Desktops, large screens (1025px - 1200px) */
  @media (min-width: 1025px) and (max-width: 1200px) {
  }

  /* Extra large screens, TV (1201px and more) */
  @media (min-width: 1201px) {
  }
`;

const PartnerCard = styled(motion.div)`
  overflow: hidden;
  height: 200px;
  width: 200px;
  border-radius: 50%;
  background-color: #ffffff;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);

  /* Mobile devices (320px - 480px) */
  @media (min-width: 320px) and (max-width: 480px) {
    height: 150px;
    width: 150px;
    padding: 15px;
  }

  /* iPads, Tablets (481px - 768px) */
  @media (min-width: 481px) and (max-width: 768px) {
    height: 180px;
    width: 180px;
    padding: 18px;
  }

  /* Small screens, laptops (769px - 1024px) */
  @media (min-width: 769px) and (max-width: 1024px) {
    height: 200px;
    width: 200px;
    padding: 20px;
  }

  /* Desktops, large screens (1025px - 1200px) */
  @media (min-width: 1025px) and (max-width: 1200px) {
    height: 220px;
    width: 220px;
    padding: 22px;
  }

  /* Extra large screens, TV (1201px and more) */
  @media (min-width: 1201px) {
    height: 240px;
    width: 240px;
    padding: 24px;
  }
`;

const Subheading = styled.h2`
  font-size: 14px;
  font-weight: 400;
  color: #9c9c9c;
  text-align: center;
  margin: 0px;
  width: 60%;

  @media (min-width: 320px) and (max-width: 480px) {
    font-size: 16px;
    margin-top: 10px;
    width: 80%;
  }

  /* iPads, Tablets (481px - 768px) */
  @media (min-width: 481px) and (max-width: 768px) {
    font-size: 22px;
    width: 80%;
  }

  /* Small screens, laptops (769px - 1024px) */
  @media (min-width: 769px) and (max-width: 1024px) {
    font-size: 25px;
    width: 80%;
  }

  /* Desktops, large screens (1025px - 1200px) */
  @media (min-width: 1025px) and (max-width: 1200px) {
    font-size: 25px;
  }

  /* Extra large screens, TV (1201px and more) */
  @media (min-width: 1201px) {
    font-size: 23px;
  }
`;

const PartnerLogo = styled.img`
  height: 100%;
  width: 100%;
  object-fit: contain;
  object-position: center;
`;

const PartnerOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 148, 255, 0.1);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;

  ${PartnerCard}:hover & {
    opacity: 1;
  }

  @media (hover: none) {
    display: none;
  }
`;

function Partners2() {
  return (
    <PartnersContainer>
      {/* Heading */}
      <PartnersHeading>
        Strategic and support partners for <Highlight>intelliDiag</Highlight>
      </PartnersHeading>
      <Subheading>
        We are proud to collaborate with organizations that share our vision of transforming diagnostics through innovation, accessibility, and technology.
      </Subheading>

      {/* Partners Grid */}
      <PartnersGrid
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.3 },
          },
        }}
      >
        {["mastercard2.png", "h2i.png", "afc.png"].map((logo, index) => (
          <PartnerCard
            key={index}
            whileHover={{
              scale: 1.05,
              border: "2px solid rgba(0, 149, 255, 0.4)",
              zIndex: 10,
            }}
            whileTap={{ scale: 0.98 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 15,
            }}
          >
            <PartnerLogo
              src={logo}
              alt={`Partner logo ${index + 1}`}
              loading="lazy"
            />
            <PartnerOverlay />
          </PartnerCard>
        ))}
      </PartnersGrid>
    </PartnersContainer>
  );
}

export default Partners2;
