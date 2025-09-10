'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Dashboard from '@/components/homepage/Dashboard';

export default function AdminSettingsPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !isAdmin) {
      router.push('/dashboard');
    }
  }, [user, isAdmin, router]);

  return (
    <ProtectedRoute requiredRole="admin">
      <Dashboard />
    </ProtectedRoute>
  );
}
