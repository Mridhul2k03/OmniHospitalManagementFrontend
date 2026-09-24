import React, { createContext, useState, useEffect, useCallback } from 'react'
import { AuthenticatedUser, AuthTokens, UserRole, InstitutionTenant } from '@/types'
import { wsManager } from '@/api/client/websocket'
import { authApi, RegisterPayload, RegisterResponse } from '@/api/endpoints/auth.api'

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
  register?: (payload: RegisterPayload) => Promise<RegisterResponse>
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
          const authUser = meData.user
          const activeT =
            meData.active_tenant ||
            meData.accessible_tenants?.[0] || {
              id: '7d18388a-872b-4d2b-b42a-f658c03e9e60',
              name: 'Grand Horizon Hospitality Group',
              slug: 'ghhg',
            }

          const defaultRole: UserRole = authUser.is_staff ? 'super_admin' : 'property_manager'
          const rawRole = (authUser.role || defaultRole).toLowerCase()
          const isSuper = authUser.is_superuser || (authUser.is_staff && rawRole === 'super_admin') || rawRole === 'super_admin'
          const finalRole: UserRole = isSuper ? 'super_admin' : (rawRole as UserRole)

          const authenticatedUser: AuthenticatedUser = {
            id: authUser.id,
            email: authUser.email,
            firstName: authUser.first_name || authUser.full_name?.split(' ')[0] || 'User',
            lastName: authUser.last_name || authUser.full_name?.split(' ').slice(1).join(' ') || '',
            role: finalRole,
            organizationId: activeT.id,
            organizationName: activeT.name,
            propertyIds: meData.accessible_tenants?.map((t: InstitutionTenant) => t.id) || [activeT.id],
            assignedPropertyId: activeT.id,
            permissions: isSuper ? ['*'] : (meData.permissions || ['property:manage', 'rooms:manage', 'frontoffice:view']),
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
              name: parsed.organizationName || 'Grand Horizon Hospitality Group',
              slug: 'ghhg',
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
      const tenantSlug = typeof params === 'object' && params.tenantId ? params.tenantId : 'ghhg'

      if (tenantSlug) {
        localStorage.setItem('omni_active_tenant_slug', tenantSlug)
      }

      try {
        // Authenticate via authoritative backend POST /api/v1/auth/login/
        // Server will set Set-Cookie: access_token and refresh_token
        const loginData = await authApi.login({ email, password })

        if (loginData && loginData.user) {
          const authUser = loginData.user
          const activeT =
            loginData.active_tenant ||
            loginData.accessible_tenants?.[0] || {
              id: '7d18388a-872b-4d2b-b42a-f658c03e9e60',
              name: 'Grand Horizon Hospitality Group',
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

          const defaultRole: UserRole = authUser.is_staff ? 'super_admin' : 'property_manager'
          const rawRole = (authUser.role || defaultRole).toLowerCase()
          const isSuper = authUser.is_superuser || (authUser.is_staff && rawRole === 'super_admin') || rawRole === 'super_admin'
          const finalRole: UserRole = (requestedRole ? requestedRole.toLowerCase() : (isSuper ? 'super_admin' : rawRole)) as UserRole

          const resolvedUser: AuthenticatedUser = {
            id: authUser.id,
            email: authUser.email,
            firstName: authUser.first_name || authUser.full_name?.split(' ')[0] || 'User',
            lastName: authUser.last_name || authUser.full_name?.split(' ').slice(1).join(' ') || '',
            role: finalRole,
            organizationId: activeT.id,
            organizationName: activeT.name,
            propertyIds: loginData.accessible_tenants?.map((t: InstitutionTenant) => t.id) || [activeT.id],
            assignedPropertyId: activeT.id,
            permissions: isSuper ? ['*'] : (authUser.permissions || ['property:manage', 'rooms:manage', 'frontoffice:view']),
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
        const message =
          apiError.message ||
          (apiError.code === 'INVALID_CREDENTIALS' || apiError.status === 400 || apiError.status === 401
            ? 'Invalid email or password. Please check your credentials.'
            : 'Authentication server unreachable. Please verify backend service.')
        setError(message)
        throw new Error(message)
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
    setUser((prev) => {
      if (!prev) return null
      const updated: AuthenticatedUser = {
        ...prev,
        role: newRole,
      }
      localStorage.setItem('omni_auth_user', JSON.stringify(updated))
      return updated
    })
  }, [])

  const hasRole = useCallback(
    (roles: UserRole | UserRole[]) => {
      if (!user) return false
      const currentRole = (user.role || '').toLowerCase()
      if (currentRole === 'super_admin') return true
      const roleList = (Array.isArray(roles) ? roles : [roles]).map((r) => r.toLowerCase())
      return roleList.includes(currentRole)
    },
    [user]
  )

  const hasPermission = useCallback(
    (permission: string) => {
      if (!user) return false
      const currentRole = (user.role || '').toLowerCase()
      if (currentRole === 'super_admin' || user.permissions?.includes('*')) return true
      return user.permissions?.includes(permission) || false
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
        register: authApi.register,
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

