import React, { createContext, useState, useEffect, useCallback } from 'react'
import { AuthenticatedUser, AuthTokens, UserRole } from '@/types'
import { wsManager } from '@/api/client/websocket'

// Default Demo Profiles for Pair Programming & Testing Every Role
export const MOCK_ROLES_CATALOG: Record<UserRole, AuthenticatedUser> = {
  super_admin: {
    id: 'user-001',
    email: 'superadmin@omnihospitality.com',
    firstName: 'Alexander',
    lastName: 'Wright',
    role: 'super_admin',
    organizationId: 'org-001',
    organizationName: 'Grand Horizon Hospitality Group',
    propertyIds: ['prop-001', 'prop-002', 'prop-003'],
    assignedPropertyId: 'prop-001',
    permissions: ['*'],
  },
  org_admin: {
    id: 'user-002',
    email: 'orgadmin@omnihospitality.com',
    firstName: 'Eleanor',
    lastName: 'Vance',
    role: 'org_admin',
    organizationId: 'org-001',
    organizationName: 'Grand Horizon Hospitality Group',
    propertyIds: ['prop-001', 'prop-002'],
    assignedPropertyId: 'prop-001',
    permissions: ['org:manage', 'property:manage', 'finance:view', 'reports:export'],
  },
  property_manager: {
    id: 'user-003',
    email: 'manager.palace@omnihospitality.com',
    firstName: 'Marcus',
    lastName: 'Sterling',
    role: 'property_manager',
    organizationId: 'org-001',
    organizationName: 'Grand Horizon Hospitality Group',
    propertyIds: ['prop-001'],
    assignedPropertyId: 'prop-001',
    permissions: ['property:manage', 'rooms:manage', 'staff:manage', 'rates:override'],
  },
  front_desk: {
    id: 'user-004',
    email: 'frontdesk.palace@omnihospitality.com',
    firstName: 'Sophia',
    lastName: 'Chen',
    role: 'front_desk',
    organizationId: 'org-001',
    organizationName: 'Grand Horizon Hospitality Group',
    propertyIds: ['prop-001'],
    assignedPropertyId: 'prop-001',
    permissions: ['checkin:operate', 'reservations:manage', 'folio:post', 'rooms:assign'],
  },
  housekeeping: {
    id: 'user-005',
    email: 'housekeeping.lead@omnihospitality.com',
    firstName: 'Maria',
    lastName: 'Santos',
    role: 'housekeeping',
    organizationId: 'org-001',
    organizationName: 'Grand Horizon Hospitality Group',
    propertyIds: ['prop-001'],
    assignedPropertyId: 'prop-001',
    permissions: ['rooms:clean', 'rooms:inspect', 'lostfound:manage'],
  },
  restaurant_pos: {
    id: 'user-006',
    email: 'fnb.captain@omnihospitality.com',
    firstName: 'Julian',
    lastName: 'Rios',
    role: 'restaurant_pos',
    organizationId: 'org-001',
    organizationName: 'Grand Horizon Hospitality Group',
    propertyIds: ['prop-001'],
    assignedPropertyId: 'prop-001',
    permissions: ['pos:order', 'pos:bill', 'pos:roomcharge'],
  },
  chef_kitchen: {
    id: 'user-007',
    email: 'headchef@omnihospitality.com',
    firstName: 'Antoine',
    lastName: 'Dubois',
    role: 'chef_kitchen',
    organizationId: 'org-001',
    organizationName: 'Grand Horizon Hospitality Group',
    propertyIds: ['prop-001'],
    assignedPropertyId: 'prop-001',
    permissions: ['kot:view', 'kot:transition'],
  },
  maintenance: {
    id: 'user-008',
    email: 'chiefengineer@omnihospitality.com',
    firstName: 'Vikram',
    lastName: 'Patel',
    role: 'maintenance',
    organizationId: 'org-001',
    organizationName: 'Grand Horizon Hospitality Group',
    propertyIds: ['prop-001'],
    assignedPropertyId: 'prop-001',
    permissions: ['maintenance:update', 'parts:allocate'],
  },
  accountant: {
    id: 'user-009',
    email: 'finance.lead@omnihospitality.com',
    firstName: 'David',
    lastName: 'Heller',
    role: 'accountant',
    organizationId: 'org-001',
    organizationName: 'Grand Horizon Hospitality Group',
    propertyIds: ['prop-001', 'prop-002'],
    assignedPropertyId: 'prop-001',
    permissions: ['finance:audit', 'finance:settle', 'reports:finance'],
  },
  hr: {
    id: 'user-010',
    email: 'hr.director@omnihospitality.com',
    firstName: 'Clara',
    lastName: 'Oswald',
    role: 'hr',
    organizationId: 'org-001',
    organizationName: 'Grand Horizon Hospitality Group',
    propertyIds: ['prop-001'],
    assignedPropertyId: 'prop-001',
    permissions: ['hr:manage', 'shifts:manage', 'payroll:view'],
  },
  president: {
    id: 'user-011',
    email: 'president@omnihospitality.com',
    firstName: 'Lord Harrison',
    lastName: 'Blackwood',
    role: 'president',
    organizationId: 'org-001',
    organizationName: 'Grand Horizon Hospitality Group',
    propertyIds: ['prop-001', 'prop-002', 'prop-003'],
    assignedPropertyId: 'prop-001',
    permissions: ['executive:view', 'kpis:view', 'reports:export'],
  },
  vice_president: {
    id: 'user-012',
    email: 'vp.operations@omnihospitality.com',
    firstName: 'Catherine',
    lastName: 'DeWitt',
    role: 'vice_president',
    organizationId: 'org-001',
    organizationName: 'Grand Horizon Hospitality Group',
    propertyIds: ['prop-001', 'prop-002'],
    assignedPropertyId: 'prop-001',
    permissions: ['executive:view', 'region:view'],
  },
  ceo: {
    id: 'user-013',
    email: 'ceo@omnihospitality.com',
    firstName: 'Jonathan',
    lastName: 'Hale',
    role: 'ceo',
    organizationId: 'org-001',
    organizationName: 'Grand Horizon Hospitality Group',
    propertyIds: ['prop-001', 'prop-002', 'prop-003'],
    assignedPropertyId: 'prop-001',
    permissions: ['executive:view', 'financials:view', 'audit:view'],
  },
  operations_director: {
    id: 'user-014',
    email: 'ops.director@omnihospitality.com',
    firstName: 'Samantha',
    lastName: 'Fox',
    role: 'operations_director',
    organizationId: 'org-001',
    organizationName: 'Grand Horizon Hospitality Group',
    propertyIds: ['prop-001', 'prop-002'],
    assignedPropertyId: 'prop-001',
    permissions: ['ops:view', 'slas:view', 'rooms:view'],
  },
  shareholder: {
    id: 'user-015',
    email: 'shareholder.capital@aurumpartners.com',
    firstName: 'Aurelia',
    lastName: 'Montague',
    role: 'shareholder',
    organizationId: 'org-001',
    organizationName: 'Grand Horizon Hospitality Group',
    propertyIds: ['prop-001', 'prop-002'],
    assignedPropertyId: 'prop-001',
    permissions: ['shareholder:read_only'],
  },
  security_gate: {
    id: 'user-016',
    email: 'gate.chief@omnihospitality.com',
    firstName: 'Babatunde',
    lastName: 'Adeleke',
    role: 'security_gate',
    organizationId: 'org-001',
    organizationName: 'Grand Horizon Hospitality Group',
    propertyIds: ['prop-001'],
    assignedPropertyId: 'prop-001',
    permissions: ['security:log', 'gate:manage'],
  },
  transport: {
    id: 'user-017',
    email: 'fleet.dispatch@omnihospitality.com',
    firstName: 'Liam',
    lastName: 'O\'Connor',
    role: 'transport',
    organizationId: 'org-001',
    organizationName: 'Grand Horizon Hospitality Group',
    propertyIds: ['prop-001'],
    assignedPropertyId: 'prop-001',
    permissions: ['transport:dispatch', 'fleet:view'],
  },
  guest: {
    id: 'user-018',
    email: 'guest.traveler@gmail.com',
    firstName: 'Isabella',
    lastName: 'Rossi',
    role: 'guest',
    organizationId: 'org-001',
    organizationName: 'Grand Horizon Hospitality Group',
    propertyIds: ['prop-001'],
    assignedPropertyId: 'prop-001',
    permissions: ['guest:book', 'guest:checkin'],
  },
}

interface AuthContextType {
  user: AuthenticatedUser | null
  tokens: AuthTokens | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, role?: UserRole) => Promise<void>
  logout: () => void
  switchRole: (role: UserRole) => void
  hasRole: (roles: UserRole | UserRole[]) => boolean
  hasPermission: (permission: string) => boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize with Super Admin by default for seamless developer & reviewer exploration
  const [user, setUser] = useState<AuthenticatedUser | null>(() => {
    const saved = localStorage.getItem('hms_auth_user')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return MOCK_ROLES_CATALOG.super_admin
      }
    }
    return MOCK_ROLES_CATALOG.super_admin
  })

  const [tokens, setTokens] = useState<AuthTokens | null>(() => {
    const access = localStorage.getItem('hms_access_token')
    const refresh = localStorage.getItem('hms_refresh_token')
    if (access && refresh) {
      return { access, refresh }
    }
    return { access: 'mock-access-token-jwt', refresh: 'mock-refresh-token-jwt' }
  })

  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user) {
      localStorage.setItem('hms_auth_user', JSON.stringify(user))
      localStorage.setItem('hms_active_org_id', user.organizationId)
      if (user.assignedPropertyId) {
        localStorage.setItem('hms_active_property_id', user.assignedPropertyId)
      }
      wsManager.connect(tokens?.access)
    } else {
      localStorage.removeItem('hms_auth_user')
      wsManager.disconnect()
    }
  }, [user, tokens])

  const login = useCallback(async (email: string, selectedRole: UserRole = 'property_manager') => {
    setIsLoading(true)
    try {
      const mockProfile = MOCK_ROLES_CATALOG[selectedRole]
      const updatedUser = { ...mockProfile, email }
      setUser(updatedUser)
      const mockTokens: AuthTokens = {
        access: `access-token-${Date.now()}`,
        refresh: `refresh-token-${Date.now()}`,
      }
      setTokens(mockTokens)
      localStorage.setItem('hms_access_token', mockTokens.access)
      localStorage.setItem('hms_refresh_token', mockTokens.refresh)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setTokens(null)
    localStorage.removeItem('hms_auth_user')
    localStorage.removeItem('hms_access_token')
    localStorage.removeItem('hms_refresh_token')
  }, [])

  const switchRole = useCallback((newRole: UserRole) => {
    const targetUser = MOCK_ROLES_CATALOG[newRole]
    setUser(targetUser)
  }, [])

  const hasRole = useCallback(
    (roles: UserRole | UserRole[]) => {
      if (!user) return false
      if (user.role === 'super_admin') return true
      const roleList = Array.isArray(roles) ? roles : [roles]
      return roleList.includes(user.role)
    },
    [user]
  )

  const hasPermission = useCallback(
    (permission: string) => {
      if (!user) return false
      if (user.role === 'super_admin' || user.permissions.includes('*')) return true
      return user.permissions.includes(permission)
    },
    [user]
  )

  return (
    <AuthContext.Provider
      value={{
        user,
        tokens,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        switchRole,
        hasRole,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
