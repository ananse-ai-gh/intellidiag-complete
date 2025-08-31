'use client'

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Dashboard from '@/components/homepage/Dashboard';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DoctorDashboardPage() {
  const { user, isDoctor } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !isDoctor) {
      router.push('/dashboard');
    }
  }, [user, isDoctor, router]);

  return (
    <ProtectedRoute requiredRole="doctor">
      <Dashboard />
    </ProtectedRoute>
  );
}
