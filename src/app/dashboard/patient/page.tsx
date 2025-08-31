'use client'

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Dashboard from '@/components/homepage/Dashboard';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PatientDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== 'patient') {
      router.push('/dashboard');
    }
  }, [user, router]);

  return (
    <ProtectedRoute requiredRole="patient">
      <Dashboard />
    </ProtectedRoute>
  );
}
