'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Dashboard from '@/components/homepage/Dashboard';

export default function RadiologistAnalysisPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !["admin", "radiologist"].includes(user.role)) {
      router.push('/dashboard');
    }
  }, [user, router]);

  return (
    <ProtectedRoute requiredRole="radiologist">
      <Dashboard />
    </ProtectedRoute>
  );
}
