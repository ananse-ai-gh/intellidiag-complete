'use client'

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const Cursor = styled.div`
  position: fixed;
  top: ${props => props.y}px;
  left: ${props => props.x}px;
  width: 20px;
  height: 20px;
  background: ${props => props.$isHovering ? 'rgba(6, 148, 251, 0.8)' : 'rgba(255, 255, 255, 0.8)'};
  border-radius: 50%;
  pointer-events: none;
  z-index: 9999;
  transition: all 0.1s ease;
  transform: translate(-50%, -50%) scale(${props => props.$isClicking ? 0.8 : 1});
  mix-blend-mode: difference;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 40px;
    height: 40px;
    background: ${props => props.$isHovering ? 'rgba(6, 148, 251, 0.3)' : 'rgba(255, 255, 255, 0.3)'};
    border-radius: 50%;
    transform: translate(-50%, -50%);
    transition: all 0.3s ease;
    scale: ${props => props.$isHovering ? 1.2 : 1};
  }
`;

function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  useEffect(() => {
    const updatePosition = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);
    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    // Add hover detection for interactive elements
    const interactiveElements = document.querySelectorAll(
      'a, button, input, textarea, select, [role="button"]'
    );

    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
    });

    window.addEventListener("mousemove", updatePosition);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", updatePosition);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      
      interactiveElements.forEach(el => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, []);

  return (
    <Cursor 
      x={position.x} 
      y={position.y} 
      $isHovering={isHovering}
      $isClicking={isClicking}
    />
  );
}

export default CustomCursor;