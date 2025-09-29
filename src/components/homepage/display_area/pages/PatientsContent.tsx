'use client'

import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import styled from 'styled-components';
import { FaPlus, FaSearch, FaFilter, FaUser, FaPhone, FaEnvelope, FaCalendar, FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import api from '@/services/api';
import CreatePatientModal from '../topsection/CreatePatientModal';
import EditPatientModal from './EditPatientModal';
import ViewPatientModal from './ViewPatientModal';

interface StatusBadgeProps {
  status: string;
}

const ContentContainer = styled.div`
  padding: 24px;
  background-color: transparent;
  color: #FFFFFF;
  width: 100%;
  height: 100%;
  overflow: auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
`;

const PageTitle = styled.h1`
  font-size: 28px;
  font-weight: 600;
  margin: 0;
  color: #FFFFFF;
`;

const AddButton = styled.button`
  background-color: #0694FB;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #0578d1;
  }
`;

const SearchBar = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  align-items: center;
`;

const SearchInput = styled.div`
  position: relative;
  flex: 1;
  max-width: 400px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px 12px 44px;
  background-color: #1A1A1A;
  border: 1px solid #333;
  border-radius: 8px;
  color: #FFFFFF;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #0694FB;
  }

  &::placeholder {
    color: #A0A0A0;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #A0A0A0;
`;

const FilterButton = styled.button`
  background-color: #1A1A1A;
  border: 1px solid #333;
  color: #FFFFFF;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;

  &:hover {
    border-color: #0694FB;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
`;

const StatCard = styled.div`
  background-color: #1A1A1A;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  background-color: ${props => props.color || '#0694FB'};
  color: white;
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 600;
  color: #FFFFFF;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #A0A0A0;
`;

const PatientsTable = styled.div`
  background-color: #1A1A1A;
  border: 1px solid #333;
  border-radius: 12px;
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 120px;
  gap: 16px;
  padding: 16px 24px;
  background-color: #0D0D0D;
  border-bottom: 1px solid #333;
  font-weight: 600;
  color: #FFFFFF;
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 120px;
  gap: 16px;
  padding: 16px 24px;
  border-bottom: 1px solid #2A2A2A;
  align-items: center;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.02);
  }

  &:last-child {
    border-bottom: none;
  }
`;

const PatientInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const PatientAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #0694FB;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 14px;
`;

const PatientDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const PatientName = styled.div`
  font-weight: 500;
  color: #FFFFFF;
`;

const PatientId = styled.div`
  font-size: 12px;
  color: #A0A0A0;
`;

const ContactInfo = styled.div`
  color: #FFFFFF;
  font-size: 14px;
`;

const StatusBadge = styled.span<StatusBadgeProps>`
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  background-color: ${props => {
    switch (props.status) {
      case 'active': return 'rgba(40, 167, 69, 0.2)';
      case 'inactive': return 'rgba(108, 117, 125, 0.2)';
      case 'pending': return 'rgba(255, 193, 7, 0.2)';
      default: return 'rgba(108, 117, 125, 0.2)';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'active': return '#28A745';
      case 'inactive': return '#6C757D';
      case 'pending': return '#FFC107';
      default: return '#6C757D';
    }
  }};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: #A0A0A0;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    color: #FFFFFF;
    background-color: rgba(255, 255, 255, 0.1);
  }

  &.danger:hover {
    color: #FF6B6B;
    background-color: rgba(255, 107, 107, 0.1);
  }
`;

const PatientsContent = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [editing, setEditing] = useState<any | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewing, setViewing] = useState<any | null>(null);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.set('search', searchTerm);
      params.set('page', String(page));
      params.set('limit', String(limit));
      // status not supported in API; we filter client-side using isActive
      const res = await api.get(`/api/patients?${params.toString()}`);
      const list = res.data?.data?.patients || [];
      const filtered = statusFilter
        ? list.filter((p: any) => (p.isActive ? 'active' : 'inactive') === statusFilter)
        : list;
      setPatients(filtered);
      setTotal(res.data?.data?.pagination?.total ?? filtered.length);
    } catch (e) {
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, statusFilter, page, limit]);

  const stats = useMemo(() => {
    const active = patients.filter(p => p.isActive).length;
    const now = new Date();
    const month = patients.filter(p => {
      const d = new Date(p.createdAt || p.updatedAt || now);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    return [
      { label: 'Total Patients', value: String(total), icon: <FaUser />, color: '#0694FB' },
      { label: 'Active Patients', value: String(active), icon: <FaUser />, color: '#28A745' },
      { label: 'New This Month', value: String(month), icon: <FaUser />, color: '#FFC107' },
      { label: 'Pending Reviews', value: '0', icon: <FaUser />, color: '#DC3545' }
    ];
  }, [patients, total]);

  const handleAddPatient = () => setShowCreate(true);

  const handleEditPatient = (patientId: string) => {
    const p = patients.find((x:any)=>x.id===patientId)
    if (p) setEditing(p)
  };

  const handleDeletePatient = async (patientId: string) => {
    if (!patientId) return;
    const confirm = window.confirm('Are you sure you want to delete this patient?')
    if (!confirm) return;
    try {
      setDeletingId(patientId);
      await api.delete(`/api/patients/${patientId}`)
      await loadPatients();
    } catch (e) {
      alert('Failed to delete patient');
    } finally {
      setDeletingId(null);
    }
  };

  const handleViewPatient = async (patientId: string) => {
    try {
      const res = await api.get(`/api/patients/${patientId}`)
      const p = res.data?.data?.patient || patients.find((x:any)=>x.id===patientId)
      if (p) setViewing(p)
    } catch {
      const p = patients.find((x:any)=>x.id===patientId)
      if (p) setViewing(p)
    }
  };

  const filteredPatients = patients;

  return (
    <ContentContainer>
      <Header>
        <PageTitle>Patients</PageTitle>
        <AddButton onClick={handleAddPatient}>
          <FaPlus size={14} />
          Add Patient
        </AddButton>
      </Header>

      <SearchBar>
        <SearchInput>
          <SearchIcon>
            <FaSearch size={16} />
          </SearchIcon>
          <Input
            type="text"
            placeholder="Search patients by name, email, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchInput>
        <FilterButton onClick={() => setStatusFilter(prev => prev === '' ? 'active' : prev === 'active' ? 'inactive' : '')}>
          <FaFilter size={14} />
          {statusFilter === '' ? 'All' : statusFilter === 'active' ? 'Active' : 'Inactive'}
        </FilterButton>
      </SearchBar>

      <StatsGrid>
        {stats.map((stat, index) => (
          <StatCard key={index}>
            <StatIcon color={stat.color}>
              {stat.icon}
            </StatIcon>
            <StatContent>
              <StatValue>{stat.value}</StatValue>
              <StatLabel>{stat.label}</StatLabel>
            </StatContent>
          </StatCard>
        ))}
      </StatsGrid>

      <PatientsTable>
        <TableHeader>
          <div>Patient</div>
          <div>Contact</div>
          <div>Phone</div>
          <div>Last Visit</div>
          <div>Status</div>
          <div>Actions</div>
        </TableHeader>
        
        {loading && (
          <div style={{ padding: '20px', color: '#A0A0A0' }}>Loading patients...</div>
        )}
        {!loading && filteredPatients.map((patient) => (
          <TableRow key={patient.id}>
            <PatientInfo>
              <PatientAvatar>
                {`${patient.firstName?.[0] || ''}${patient.lastName?.[0] || ''}`}
              </PatientAvatar>
              <PatientDetails>
                <PatientName>{patient.firstName} {patient.lastName}</PatientName>
                <PatientId>{patient.id}</PatientId>
              </PatientDetails>
            </PatientInfo>
            
            <ContactInfo>{patient.email}</ContactInfo>
            <ContactInfo>{patient.contactNumber || patient.phone}</ContactInfo>
            <ContactInfo>{new Date(patient.updatedAt || patient.createdAt).toLocaleDateString()}</ContactInfo>
            
            <StatusBadge status={patient.isActive ? 'active' : 'inactive'}>
              {patient.isActive ? 'Active' : 'Inactive'}
            </StatusBadge>
            
            <ActionButtons>
              <ActionButton onClick={() => handleViewPatient(patient.id)}>
                <FaEye size={14} />
              </ActionButton>
              <ActionButton onClick={() => setEditing(patient)}>
                <FaEdit size={14} />
              </ActionButton>
              <ActionButton 
                className="danger" 
                onClick={() => handleDeletePatient(patient.id)}
                disabled={deletingId === patient.id}
              >
                <FaTrash size={14} />
              </ActionButton>
            </ActionButtons>
          </TableRow>
        ))}
      </PatientsTable>

      <CreatePatientModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onSuccess={() => { setShowCreate(false); loadPatients(); }}
      />

      <EditPatientModal
        isOpen={!!editing}
        onClose={() => setEditing(null)}
        patient={editing}
        onSuccess={() => { setEditing(null); loadPatients(); }}
      />

      <ViewPatientModal
        isOpen={!!viewing}
        onClose={() => setViewing(null)}
        patient={viewing}
      />

      {/* Pagination */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:16 }}>
        <div style={{ color:'#A0A0A0' }}>Total: {total}</div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} style={{ padding:'8px 12px', borderRadius:8, background:'#1A1A1A', border:'1px solid #333', color:'#fff' }}>Prev</button>
          <div style={{ color:'#fff', padding:'8px 12px' }}>{page}</div>
          <button onClick={()=>setPage(p=>p+1)} disabled={patients.length < limit && page*limit>=total} style={{ padding:'8px 12px', borderRadius:8, background:'#1A1A1A', border:'1px solid #333', color:'#fff' }}>Next</button>
          <select value={limit} onChange={e=>{ setPage(1); setLimit(parseInt(e.target.value,10)); }} style={{ marginLeft:8, background:'#1A1A1A', color:'#fff', border:'1px solid #333', borderRadius:8, padding:'8px 12px' }}>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={25}>25</option>
          </select>
        </div>
      </div>
    </ContentContainer>
  );
};

export default PatientsContent;
