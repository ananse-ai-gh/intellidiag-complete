'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Dashboard from '@/components/homepage/Dashboard';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if we're sure about the user state (not loading) and user exists
    if (!loading && user) {
      // Redirect to role-specific dashboard
      switch (user.role) {
        case 'admin':
          router.push('/dashboard/admin');
          break;
        case 'doctor':
          router.push('/dashboard/doctor');
          break;
        case 'radiologist':
          router.push('/dashboard/radiologist');
          break;
        case 'patient':
          router.push('/dashboard/patient');
          break;
        default:
          // Fallback to general dashboard
          break;
      }
    }
  }, [user, loading, router]);

  return (
    <ProtectedRoute>
      {/* Show loading while checking authentication and redirecting */}
      {loading ? (
        <div className="min-h-screen flex items-center justify-center bg-black text-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Loading dashboard...</p>
          </div>
        </div>
      ) : user ? (
        <div className="min-h-screen flex items-center justify-center bg-black text-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Redirecting...</p>
          </div>
        </div>
      ) : (
        <Dashboard />
      )}
    </ProtectedRoute>
  );
}
