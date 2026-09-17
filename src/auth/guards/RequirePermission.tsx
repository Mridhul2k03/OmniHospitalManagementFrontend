import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../useAuth'

interface RequirePermissionProps {
  children: React.ReactNode
  permission: string
  fallbackPath?: string
}

export const RequirePermission: React.FC<RequirePermissionProps> = ({
  children,
  permission,
  fallbackPath = '/app/access-denied',
}) => {
  const { hasPermission } = useAuth()

  if (!hasPermission(permission)) {
    return <Navigate to={fallbackPath} replace />
  }

  return <>{children}</>
}
