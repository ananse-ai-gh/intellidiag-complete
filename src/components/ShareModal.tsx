import React, { useState } from 'react';
import styled from 'styled-components';
import { FaCopy, FaTimes, FaCheck, FaSync } from 'react-icons/fa';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background: #1a1a1a;
  border-radius: 12px;
  padding: 24px;
  max-width: 500px;
  width: 90%;
  border: 1px solid #333;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ModalTitle = styled.h3`
  color: #fff;
  margin: 0;
  font-size: 18px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  font-size: 20px;
  
  &:hover {
    color: #fff;
  }
`;

const UrlContainer = styled.div`
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
`;

const UrlText = styled.div`
  color: #fff;
  font-family: monospace;
  font-size: 14px;
  word-break: break-all;
  margin-bottom: 12px;
`;

const UrlInfo = styled.div`
  color: #888;
  font-size: 12px;
  margin-bottom: 8px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const CopyButton = styled.button<{ copied?: boolean }>`
  background: ${props => props.copied ? '#10b981' : '#3b82f6'};
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  transition: background-color 0.2s;
  
  &:hover {
    background: ${props => props.copied ? '#059669' : '#2563eb'};
  }
  
  &:disabled {
    background: #666;
    cursor: not-allowed;
  }
`;

const RegenerateButton = styled.button`
  background: #f59e0b;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  transition: background-color 0.2s;
  
  &:hover {
    background: #d97706;
  }
  
  &:disabled {
    background: #666;
    cursor: not-allowed;
  }
`;

const CloseModalButton = styled.button`
  background: #6b7280;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background: #4b5563;
  }
`;

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title?: string;
  scanId?: string;
  originalUrl?: string;
  isExisting?: boolean;
  createdAt?: string;
  onRegenerate?: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ 
  isOpen, 
  onClose, 
  url, 
  title = "Share Link",
  scanId,
  originalUrl,
  isExisting = false,
  createdAt,
  onRegenerate
}) => {
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        return;
      }
      
      // Fallback to legacy method
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        // If all else fails, show the URL in a prompt
        prompt('Copy this URL:', url);
      }
    } catch (error) {
      console.error('Copy failed:', error);
      // Show the URL in a prompt as last resort
      prompt('Copy this URL:', url);
    }
  };

  const handleRegenerate = async () => {
    if (!onRegenerate || !scanId || !originalUrl) return;
    
    setRegenerating(true);
    try {
      await onRegenerate();
    } finally {
      setRegenerating(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </ModalHeader>
        
        <UrlContainer>
          <UrlText>{url}</UrlText>
          {isExisting && createdAt && (
            <UrlInfo>
              Created: {formatDate(createdAt)}
            </UrlInfo>
          )}
          {isExisting && (
            <UrlInfo>
              This is an existing share link for this scan.
            </UrlInfo>
          )}
        </UrlContainer>
        
        <ButtonGroup>
          <CopyButton onClick={handleCopy} copied={copied}>
            {copied ? <FaCheck /> : <FaCopy />}
            {copied ? 'Copied!' : 'Copy Link'}
          </CopyButton>
          
          {scanId && originalUrl && onRegenerate && (
            <RegenerateButton onClick={handleRegenerate} disabled={regenerating}>
              <FaSync />
              {regenerating ? 'Regenerating...' : 'New Link'}
            </RegenerateButton>
          )}
          
          <CloseModalButton onClick={onClose}>
            Close
          </CloseModalButton>
        </ButtonGroup>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default ShareModal;