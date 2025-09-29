'use client'

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaSave, FaImage, FaFlask, FaMapMarkerAlt, FaExclamationTriangle } from 'react-icons/fa';
import api from '@/services/api';

const Overlay = styled(motion.div)`
  position: fixed; inset: 0; display: flex; align-items: center; justify-content: center;
  backdrop-filter: blur(4px); z-index: 1000; padding: 20px;
`;

const Card = styled(motion.div)`
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 28px 20px;
  width: 100%;
  max-width: 600px;
  text-align: left;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.8);
  position: relative;
  overflow: visible;
  z-index: 1000;
  max-height: 90vh;
  overflow-y: auto;
`;

const Row = styled.div` 
  display: grid; 
  grid-template-columns: 1fr 1fr; 
  gap: 16px; 
`;

const Group = styled.div` 
  display: flex; 
  flex-direction: column; 
  gap: 8px; 
`;

const Label = styled.label` 
  color: #fff; 
  font-size: 14px; 
  font-weight: 500; 
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 16px 14px 45px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #ffffff;
  font-size: 14px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  &::placeholder { color: #9c9c9c; }
  &:focus {
    outline: none;
    border-color: #0694fb;
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 0 3px rgba(6, 148, 251, 0.15);
  }
  &:hover { border-color: rgba(255, 255, 255, 0.2); }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 16px 12px 45px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: #ffffff;
  font-size: 14px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  cursor: pointer;
  appearance: none; -webkit-appearance: none; -moz-appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239c9c9c' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  padding-right: 40px;
  &::placeholder { color: #9c9c9c; }
  &:focus {
    outline: none; border-color: #0694fb; background: rgba(255, 255, 255, 0.08); box-shadow: 0 0 0 3px rgba(6, 148, 251, 0.15);
  }
  &:hover { border-color: rgba(255, 255, 255, 0.2); }
  & option { background: #1a1a3a; color: #ffffff; padding: 8px; }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 14px 16px 14px 45px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #ffffff;
  font-size: 14px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  min-height: 100px;
  resize: vertical;
  font-family: inherit;
  &::placeholder { color: #9c9c9c; }
  &:focus {
    outline: none;
    border-color: #0694fb;
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 0 3px rgba(6, 148, 251, 0.15);
  }
  &:hover { border-color: rgba(255, 255, 255, 0.2); }
`;

const Icon = styled.div` 
  position: absolute; 
  left: 16px; 
  color: #9c9c9c; 
  font-size: 16px; 
`;

const Wrap = styled.div` 
  position: relative; 
  display: flex; 
  align-items: center; 
`;

const Actions = styled.div` 
  display: flex; 
  gap: 12px; 
  justify-content: flex-end; 
  margin-top: 16px; 
`;

const Btn = styled.button`
  background: linear-gradient(135deg, #0694fb, #0094ff); 
  color: #fff; 
  border: none; 
  padding: 12px 20px; 
  border-radius: 12px; 
  cursor: pointer; 
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  &:disabled{ opacity: .7; cursor: not-allowed }
`;

const Ghost = styled.button` 
  background: rgba(255, 255, 255, 0.1); 
  color: #ccc; 
  border: 1px solid rgba(255,255,255,0.2); 
  padding: 12px 20px; 
  border-radius: 12px; 
  cursor: pointer;
`;

const Title = styled.h3` 
  color: #fff; 
  margin: 0 0 16px 0; 
  font-size: 20px; 
  font-weight: 600; 
`;

const ImagePreview = styled.div`
  width: 100%;
  height: 200px;
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  margin-bottom: 15px;
`;

const ImagePreviewImg = styled.img`
  max-width: 100%;
  max-height: 100%;
  border-radius: 8px;
  object-fit: contain;
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  font-size: 14px;
  margin-top: 10px;
  padding: 10px;
  background: rgba(231, 76, 60, 0.1);
  border-radius: 8px;
  border-left: 4px solid #e74c3c;
`;

const SuccessMessage = styled.div`
  color: #27ae60;
  font-size: 14px;
  margin-top: 10px;
  padding: 10px;
  background: rgba(39, 174, 96, 0.1);
  border-radius: 8px;
  border-left: 4px solid #27ae60;
`;

interface EditScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  scan: any;
  onScanUpdated: (updatedScan: any) => void;
}

const EditScanModal: React.FC<EditScanModalProps> = ({
  isOpen,
  onClose,
  scan,
  onScanUpdated
}) => {
  const [formData, setFormData] = useState({
    scanType: '',
    bodyPart: '',
    priority: 'medium',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (scan) {
      setFormData({
        scanType: scan.scanType || '',
        bodyPart: scan.bodyPart || '',
        priority: scan.priority || 'medium',
        notes: scan.notes || ''
      });
    }
  }, [scan]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.put('/api/scans', {
        scanId: scan.id,
        scanType: formData.scanType,
        bodyPart: formData.bodyPart,
        priority: formData.priority,
        notes: formData.notes
      });

      if (response.data.status === 'success') {
        setSuccess('Scan updated successfully!');
        setTimeout(() => {
          onScanUpdated(response.data.data.scan);
        }, 1000);
      } else {
        setError(response.data.message || 'Failed to update scan');
      }
    } catch (error: any) {
      console.error('Error updating scan:', error);
      setError(error.response?.data?.message || 'Failed to update scan');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <Overlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <Card initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
          <Title>Edit Scan</Title>
          <form onSubmit={handleSubmit}>
            <Row>
              <Group>
                <Label>Scan Type</Label>
                <Wrap>
                  <Select
                    name="scanType"
                    value={formData.scanType}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select scan type</option>
                    <option value="CT">CT Scan</option>
                    <option value="MRI">MRI Scan</option>
                    <option value="X-Ray">X-Ray</option>
                    <option value="Ultrasound">Ultrasound</option>
                    <option value="PET">PET Scan</option>
                  </Select>
                  <Icon><FaFlask /></Icon>
                </Wrap>
              </Group>
              <Group>
                <Label>Body Part</Label>
                <Wrap>
                  <Input
                    type="text"
                    name="bodyPart"
                    value={formData.bodyPart}
                    onChange={handleInputChange}
                    placeholder="e.g., Chest, Abdomen, Head"
                    required
                  />
                  <Icon><FaMapMarkerAlt /></Icon>
                </Wrap>
              </Group>
            </Row>
            <Row>
              <Group>
                <Label>Priority</Label>
                <Wrap>
                  <Select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </Select>
                  <Icon><FaExclamationTriangle /></Icon>
                </Wrap>
              </Group>
              <Group>
                <Label>Status</Label>
                <Wrap>
                  <Input
                    type="text"
                    value={scan?.status || 'pending'}
                    disabled
                    placeholder="Status"
                  />
                  <Icon><FaImage /></Icon>
                </Wrap>
              </Group>
            </Row>
            <Group>
              <Label>Notes</Label>
              <Wrap>
                <TextArea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Additional notes or observations..."
                />
                <Icon><FaImage /></Icon>
              </Wrap>
            </Group>

            {scan?.filePath && (
              <Group>
                <Label>Current Image</Label>
                <ImagePreview>
                  <ImagePreviewImg src={scan.filePath} alt="Scan preview" />
                </ImagePreview>
              </Group>
            )}

            {error && <ErrorMessage>{error}</ErrorMessage>}
            {success && <SuccessMessage>{success}</SuccessMessage>}

            <Actions>
              <Ghost type="button" onClick={onClose}>Cancel</Ghost>
              <Btn type="submit" disabled={loading}>
                <FaSave />
                {loading ? 'Saving...' : 'Save Changes'}
              </Btn>
            </Actions>
          </form>
        </Card>
      </Overlay>
    </AnimatePresence>
  );
};

export default EditScanModal;
