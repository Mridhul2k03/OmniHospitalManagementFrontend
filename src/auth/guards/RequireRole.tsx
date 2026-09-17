import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../useAuth'
import { UserRole } from '@/types'

interface RequireRoleProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
  fallbackPath?: string
}

export const RequireRole: React.FC<RequireRoleProps> = ({
  children,
  allowedRoles,
  fallbackPath = '/app/access-denied',
}) => {
  const { user, hasRole } = useAuth()

  if (!user) {
    return <Navigate to="/auth/login" replace />
  }

  if (!hasRole(allowedRoles)) {
    return <Navigate to={fallbackPath} replace />
  }

  return <>{children}</>
}
