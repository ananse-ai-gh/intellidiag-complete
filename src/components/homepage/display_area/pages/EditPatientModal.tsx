'use client'

import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
import { FaTimes, FaSave, FaPhone, FaEnvelope, FaMapMarkerAlt, FaBirthdayCake, FaVenusMars, FaUser } from 'react-icons/fa'
import api from '@/services/api'

interface EditPatientModalProps {
  isOpen: boolean
  onClose: () => void
  patient: any | null
  onSuccess: () => void
}

const Overlay = styled(motion.div)`
  position: fixed; inset: 0; display: flex; align-items: center; justify-content: center;
  backdrop-filter: blur(4px); z-index: 1000; padding: 20px;
`
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
`
const Row = styled.div` display: grid; grid-template-columns: 1fr 1fr; gap: 16px; `
const Group = styled.div` display: flex; flex-direction: column; gap: 8px; `
const Label = styled.label` color: #fff; font-size: 14px; font-weight: 500; `
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
`
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
`
const Icon = styled.div` position:absolute; left:16px; color:#9c9c9c; font-size:16px; `
const Wrap = styled.div` position:relative; display:flex; align-items:center; `
const Actions = styled.div` display:flex; gap:12px; justify-content:flex-end; margin-top:16px; `
const Btn = styled.button`
  background: linear-gradient(135deg, #0694fb, #0094ff); color:#fff; border:none; padding:12px 20px; border-radius:12px; cursor:pointer; font-weight:600;
  &:disabled{ opacity:.7; cursor:not-allowed }
`
const Ghost = styled.button` background: rgba(255, 255, 255, 0.1); color:#ccc; border:1px solid rgba(255,255,255,0.2); padding:12px 20px; border-radius:12px; `

const Title = styled.h3` color:#fff; margin:0 0 16px 0; font-size: 20px; font-weight: 600; `

const EditPatientModal: React.FC<EditPatientModalProps> = ({ isOpen, onClose, patient, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<any>({
    firstName: '', lastName: '', dateOfBirth: '', gender: '', contactNumber: '', email: '', street: '', city: '', state: '', zipCode: '', country: ''
  })

  useEffect(() => {
    if (patient) {
      setForm({
        firstName: patient.firstName || '',
        lastName: patient.lastName || '',
        dateOfBirth: patient.dateOfBirth || '',
        gender: patient.gender || '',
        contactNumber: patient.contactNumber || patient.phone || '',
        email: patient.email || '',
        street: patient.street || patient.address || '',
        city: patient.city || '',
        state: patient.state || '',
        zipCode: patient.zipCode || '',
        country: patient.country || ''
      })
    }
  }, [patient])

  const update = async (e: React.FormEvent) => {
    e.preventDefault(); if (!patient) return; setLoading(true)
    try {
      await api.put(`/api/patients/${patient.id}`, {
        firstName: form.firstName,
        lastName: form.lastName,
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
        contactNumber: form.contactNumber,
        email: form.email,
        street: form.street,
        city: form.city,
        state: form.state,
        zipCode: form.zipCode,
        country: form.country
      })
      onSuccess()
    } finally { setLoading(false) }
  }

  if (!isOpen || !patient) return null

  return (
    <AnimatePresence>
      <Overlay initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
        <Card initial={{ scale:.95, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:.95, opacity:0 }}>
          <Title>Edit Patient</Title>
          <form onSubmit={update}>
            <Row>
              <Group>
                <Label>First Name</Label>
                <Wrap>
                  <Input value={form.firstName} onChange={e=>setForm({...form, firstName:e.target.value})} />
                  <Icon><FaUser /></Icon>
                </Wrap>
              </Group>
              <Group>
                <Label>Last Name</Label>
                <Wrap>
                  <Input value={form.lastName} onChange={e=>setForm({...form, lastName:e.target.value})} />
                  <Icon><FaUser /></Icon>
                </Wrap>
              </Group>
            </Row>
            <Row>
              <Group>
                <Label>Date of Birth</Label>
                <Wrap>
                  <Input type="date" value={form.dateOfBirth} onChange={e=>setForm({...form, dateOfBirth:e.target.value})} />
                  <Icon><FaBirthdayCake /></Icon>
                </Wrap>
              </Group>
              <Group>
                <Label>Gender</Label>
                <Wrap>
                  <Select value={form.gender} onChange={e=>setForm({...form, gender:e.target.value})}>
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </Select>
                  <Icon><FaVenusMars /></Icon>
                </Wrap>
              </Group>
            </Row>
            <Row>
              <Group>
                <Label>Phone</Label>
                <Wrap>
                  <Input value={form.contactNumber} onChange={e=>setForm({...form, contactNumber:e.target.value})} />
                  <Icon><FaPhone /></Icon>
                </Wrap>
              </Group>
              <Group>
                <Label>Email</Label>
                <Wrap>
                  <Input type="email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} />
                  <Icon><FaEnvelope /></Icon>
                </Wrap>
              </Group>
            </Row>
            <Group>
              <Label>Street</Label>
              <Wrap>
                <Input placeholder="Street address" value={form.street} onChange={e=>setForm({...form, street:e.target.value})} />
                <Icon><FaMapMarkerAlt /></Icon>
              </Wrap>
            </Group>
            <Row>
              <Group>
                <Label>City</Label>
                <Wrap>
                  <Input placeholder="City" value={form.city} onChange={e=>setForm({...form, city:e.target.value})} />
                  <Icon><FaMapMarkerAlt /></Icon>
                </Wrap>
              </Group>
              <Group>
                <Label>State/Province</Label>
                <Wrap>
                  <Input placeholder="State/Province" value={form.state} onChange={e=>setForm({...form, state:e.target.value})} />
                  <Icon><FaMapMarkerAlt /></Icon>
                </Wrap>
              </Group>
            </Row>
            <Row>
              <Group>
                <Label>ZIP/Postal Code</Label>
                <Wrap>
                  <Input placeholder="ZIP/Postal Code" value={form.zipCode} onChange={e=>setForm({...form, zipCode:e.target.value})} />
                  <Icon><FaMapMarkerAlt /></Icon>
                </Wrap>
              </Group>
              <Group>
                <Label>Country</Label>
                <Wrap>
                  <Input placeholder="Country" value={form.country} onChange={e=>setForm({...form, country:e.target.value})} />
                  <Icon><FaMapMarkerAlt /></Icon>
                </Wrap>
              </Group>
            </Row>

            <Actions>
              <Ghost type="button" onClick={onClose}>Cancel</Ghost>
              <Btn type="submit" disabled={loading}><FaSave /> {loading ? 'Saving...' : 'Save Changes'}</Btn>
            </Actions>
          </form>
        </Card>
      </Overlay>
    </AnimatePresence>
  )
}

export default EditPatientModal


