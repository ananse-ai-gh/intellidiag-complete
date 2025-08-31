'use client'

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Dashboard from '@/components/homepage/Dashboard';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RadiologistDashboardPage() {
  const { user, isRadiologist } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !isRadiologist) {
      router.push('/dashboard');
    }
  }, [user, isRadiologist, router]);

  return (
    <ProtectedRoute requiredRole="radiologist">
      <Dashboard />
    </ProtectedRoute>
  );
}
