import React, { createContext, useState, useEffect, useCallback } from 'react'
import { AuthenticatedUser, AuthTokens, UserRole, InstitutionTenant } from '@/types'
import { wsManager } from '@/api/client/websocket'
import { authApi } from '@/api/endpoints/auth.api'

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

export interface LoginParams {
  email: string
  password?: string
  tenantId?: string
  role?: UserRole
}

export interface AuthContextType {
  user: AuthenticatedUser | null
  activeTenant?: InstitutionTenant | null
  accessibleTenants?: InstitutionTenant[]
  tokens: AuthTokens | null
  isAuthenticated: boolean
  isLoading: boolean
  error?: string | null
  clearError?: () => void
  login: (params: LoginParams | string, legacyRole?: UserRole) => Promise<void>
  logout: () => Promise<void> | void
  switchTenant?: (tenantId: string) => Promise<void>
  switchRole: (role: UserRole) => void
  hasRole: (roles: UserRole | UserRole[]) => boolean
  hasPermission: (permission: string) => boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthenticatedUser | null>(null)
  const [activeTenant, setActiveTenant] = useState<InstitutionTenant | null>(null)
  const [accessibleTenants, setAccessibleTenants] = useState<InstitutionTenant[]>([])
  const [tokens, setTokens] = useState<AuthTokens | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => setError(null), [])

  // On Application Boot: Verify HttpOnly Session Cookie with GET /api/v1/auth/me/
  useEffect(() => {
    let isMounted = true

    const verifySession = async () => {
      setIsLoading(true)
      try {
        // Attempt session verification using HttpOnly cookies
        const meData = await authApi.getMe()
        if (!isMounted) return

        if (meData && meData.user) {
          const eduUser = meData.user
          const activeT =
            meData.active_tenant ||
            meData.accessible_tenants?.[0] || {
              id: '7d18388a-872b-4d2b-b42a-f658c03e9e60',
              name: 'Oxford Crest University',
              slug: 'oxford-crest',
            }

          const defaultRole: UserRole = eduUser.is_staff ? 'super_admin' : 'property_manager'
          const authenticatedUser: AuthenticatedUser = {
            id: eduUser.id,
            email: eduUser.email,
            firstName: eduUser.first_name || eduUser.full_name?.split(' ')[0] || 'User',
            lastName: eduUser.last_name || eduUser.full_name?.split(' ').slice(1).join(' ') || '',
            role: (eduUser.role as UserRole) || defaultRole,
            organizationId: activeT.id,
            organizationName: activeT.name,
            propertyIds: meData.accessible_tenants?.map((t: InstitutionTenant) => t.id) || [activeT.id],
            assignedPropertyId: activeT.id,
            permissions: meData.permissions || (eduUser.is_staff ? ['*'] : ['property:manage', 'students:view']),
          }

          setUser(authenticatedUser)
          setActiveTenant(activeT)
          setAccessibleTenants(meData.accessible_tenants || [activeT])
          localStorage.setItem('omni_auth_user', JSON.stringify(authenticatedUser))
          localStorage.setItem('omni_active_tenant_id', activeT.id)
          localStorage.setItem('omni_active_tenant_slug', activeT.slug)
        } else {
          setUser(null)
        }
      } catch {
        if (!isMounted) return
        // Check if there is an existing cached user session in localStorage
        const savedUser = localStorage.getItem('omni_auth_user') || localStorage.getItem('hms_auth_user')
        if (savedUser) {
          try {
            const parsed = JSON.parse(savedUser)
            setUser(parsed)
            const defaultTenant: InstitutionTenant = {
              id: parsed.organizationId || '7d18388a-872b-4d2b-b42a-f658c03e9e60',
              name: parsed.organizationName || 'Oxford Crest University',
              slug: 'oxford-crest',
            }
            setActiveTenant(defaultTenant)
            setAccessibleTenants([defaultTenant])
          } catch {
            setUser(null)
          }
        } else {
          setUser(null)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    verifySession()

    // Listen for session expiration events emitted by axios response interceptor
    const handleSessionExpired = () => {
      setUser(null)
      setActiveTenant(null)
      setTokens(null)
      localStorage.removeItem('omni_auth_user')
      localStorage.removeItem('hms_auth_user')
      localStorage.removeItem('omni_access_token')
      localStorage.removeItem('omni_refresh_token')
      localStorage.removeItem('hms_access_token')
      localStorage.removeItem('hms_refresh_token')
      wsManager.disconnect()
    }

    window.addEventListener('omni_session_expired', handleSessionExpired)
    window.addEventListener('hms_session_expired', handleSessionExpired)

    return () => {
      isMounted = false
      window.removeEventListener('omni_session_expired', handleSessionExpired)
      window.removeEventListener('hms_session_expired', handleSessionExpired)
    }
  }, [])

  // Synchronize active properties & WebSocket connection on user change
  useEffect(() => {
    if (user) {
      localStorage.setItem('omni_auth_user', JSON.stringify(user))
      localStorage.setItem('hms_auth_user', JSON.stringify(user))
      localStorage.setItem('hms_active_org_id', user.organizationId)
      if (user.assignedPropertyId) {
        localStorage.setItem('hms_active_property_id', user.assignedPropertyId)
      }
      wsManager.connect(tokens?.access)
    } else {
      wsManager.disconnect()
    }
  }, [user, tokens])

  // Real Login with HttpOnly Cookie Handling & Demo Fallback
  const login = useCallback(
    async (params: LoginParams | string, legacyRole?: UserRole) => {
      setIsLoading(true)
      setError(null)

      const email = typeof params === 'string' ? params : params.email
      const password = typeof params === 'string' ? 'Password123!' : params.password || 'Password123!'
      const requestedRole = typeof params === 'string' ? legacyRole : params.role
      const tenantSlug = typeof params === 'object' && params.tenantId ? params.tenantId : 'oxford-crest'

      if (tenantSlug) {
        localStorage.setItem('omni_active_tenant_slug', tenantSlug)
      }

      try {
        // Authenticate via authoritative backend POST /api/v1/auth/login/
        // Server will set Set-Cookie: access_token and refresh_token
        const loginData = await authApi.login({ email, password })

        if (loginData && loginData.user) {
          const eduUser = loginData.user
          const activeT =
            loginData.active_tenant ||
            loginData.accessible_tenants?.[0] || {
              id: '7d18388a-872b-4d2b-b42a-f658c03e9e60',
              name: 'Oxford Crest University',
              slug: tenantSlug,
            }

          if (loginData.access) {
            setTokens({
              access: loginData.access,
              refresh: loginData.refresh || '',
            })
            localStorage.setItem('omni_access_token', loginData.access)
            localStorage.setItem('hms_access_token', loginData.access)
          }

          const defaultRole: UserRole = eduUser.is_staff ? 'super_admin' : 'property_manager'
          const resolvedUser: AuthenticatedUser = {
            id: eduUser.id,
            email: eduUser.email,
            firstName: eduUser.first_name || eduUser.full_name?.split(' ')[0] || 'User',
            lastName: eduUser.last_name || eduUser.full_name?.split(' ').slice(1).join(' ') || '',
            role: requestedRole || (eduUser.role as UserRole) || defaultRole,
            organizationId: activeT.id,
            organizationName: activeT.name,
            propertyIds: loginData.accessible_tenants?.map((t: InstitutionTenant) => t.id) || [activeT.id],
            assignedPropertyId: activeT.id,
            permissions: eduUser.permissions || (eduUser.is_staff ? ['*'] : ['property:manage', 'students:view']),
          }

          setUser(resolvedUser)
          setActiveTenant(activeT)
          setAccessibleTenants(loginData.accessible_tenants || [activeT])
          localStorage.setItem('omni_auth_user', JSON.stringify(resolvedUser))
          localStorage.setItem('omni_active_tenant_id', activeT.id)
          localStorage.setItem('omni_active_tenant_slug', activeT.slug)
          return
        }
      } catch (err: unknown) {
        const apiError = err as { code?: string; message?: string; status?: number }
        
        // If credentials failed, display specific error code & message
        if (apiError.code === 'INVALID_CREDENTIALS' || apiError.status === 400 || apiError.status === 401) {
          const message = apiError.message || 'Invalid email or password. Please check your credentials.'
          setError(message)
          throw new Error(message)
        }

        // If backend server is unreachable (e.g. offline dev mode), use demo account fallback
        console.warn('Authoritative login server unreachable. Initializing demo session for exploration:', apiError.message)
        const mockProfile = MOCK_ROLES_CATALOG[requestedRole || 'property_manager'] || MOCK_ROLES_CATALOG.property_manager
        const demoUser: AuthenticatedUser = {
          ...mockProfile,
          email,
        }
        const demoTenant: InstitutionTenant = {
          id: '7d18388a-872b-4d2b-b42a-f658c03e9e60',
          name: 'Oxford Crest University',
          slug: tenantSlug,
          institution_type: 'university_college',
          is_default: true,
        }

        setUser(demoUser)
        setActiveTenant(demoTenant)
        setAccessibleTenants([demoTenant])
        localStorage.setItem('omni_auth_user', JSON.stringify(demoUser))
        localStorage.setItem('omni_active_tenant_id', demoTenant.id)
        localStorage.setItem('omni_active_tenant_slug', demoTenant.slug)
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  // Real Logout calling POST /api/v1/auth/logout/ to delete HttpOnly cookies
  const logout = useCallback(async () => {
    setIsLoading(true)
    try {
      await authApi.logout()
    } catch (e) {
      console.warn('Logout endpoint failed or offline:', e)
    } finally {
      setUser(null)
      setActiveTenant(null)
      setAccessibleTenants([])
      setTokens(null)
      localStorage.removeItem('omni_auth_user')
      localStorage.removeItem('hms_auth_user')
      localStorage.removeItem('omni_access_token')
      localStorage.removeItem('omni_refresh_token')
      localStorage.removeItem('hms_access_token')
      localStorage.removeItem('hms_refresh_token')
      wsManager.disconnect()
      setIsLoading(false)
    }
  }, [])

  // Switch Active Tenant
  const switchTenant = useCallback(
    async (tenantId: string) => {
      try {
        const response = await authApi.switchTenant(tenantId)
        if (response?.active_tenant) {
          setActiveTenant(response.active_tenant)
          localStorage.setItem('omni_active_tenant_id', response.active_tenant.id)
          localStorage.setItem('omni_active_tenant_slug', response.active_tenant.slug)
        }
      } catch {
        const matched = accessibleTenants.find((t) => t.id === tenantId || t.slug === tenantId)
        if (matched) {
          setActiveTenant(matched)
          localStorage.setItem('omni_active_tenant_id', matched.id)
          localStorage.setItem('omni_active_tenant_slug', matched.slug)
        }
      }
    },
    [accessibleTenants]
  )

  const switchRole = useCallback((newRole: UserRole) => {
    const targetUser = MOCK_ROLES_CATALOG[newRole]
    if (targetUser) {
      setUser(targetUser)
      localStorage.setItem('omni_auth_user', JSON.stringify(targetUser))
    }
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
        activeTenant,
        accessibleTenants,
        tokens,
        isAuthenticated: !!user,
        isLoading,
        error,
        clearError,
        login,
        logout,
        switchTenant,
        switchRole,
        hasRole,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

