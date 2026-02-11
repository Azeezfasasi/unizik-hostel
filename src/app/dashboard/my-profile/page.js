import React from 'react'
import ProfileManagement from './components/ProfileManagement'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const metadata = {
  title: 'My Profile | CANAN USA',
  description: 'Manage your personal information, account settings, and preferences on your profile page.',
}

export default function page() {
  return (
    <ProtectedRoute allowedRoles={['admin', 'member', 'committee', 'it-support']}>
      <ProfileManagement />
    </ProtectedRoute>
  )
}
