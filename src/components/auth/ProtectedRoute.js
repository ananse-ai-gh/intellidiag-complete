'use client'

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import styled from 'styled-components';

const LoadingContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
  color: #ffffff;
  font-size: 18px;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-left: 4px solid #0694fb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 20px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export default function ProtectedRoute({ children, requiredRole = null }) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (!loading && isAuthenticated && requiredRole) {
      if (requiredRole === 'admin' && user?.role !== 'admin') {
        router.push('/dashboard');
      } else if (requiredRole === 'doctor' && !['admin', 'doctor'].includes(user?.role)) {
        router.push('/dashboard');
      } else if (requiredRole === 'radiologist' && !['admin', 'radiologist'].includes(user?.role)) {
        router.push('/dashboard');
      }
    }
  }, [loading, isAuthenticated, user, requiredRole, router]);

  if (loading) {
    return (
      <LoadingContainer>
        <Spinner />
        Loading...
      </LoadingContainer>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRole && user?.role !== requiredRole) {
    if (requiredRole === 'admin' && user?.role !== 'admin') {
      return null;
    } else if (requiredRole === 'doctor' && !['admin', 'doctor'].includes(user?.role)) {
      return null;
    } else if (requiredRole === 'radiologist' && !['admin', 'radiologist'].includes(user?.role)) {
      return null;
    }
  }

  return children;
}
