'use client'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Dashboard from '@/components/homepage/Dashboard'

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole="doctor">
      <Dashboard />
    </ProtectedRoute>
  )
}


