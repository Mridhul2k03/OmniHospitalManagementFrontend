import { apiClient } from '@/api/client/axios'
import {
  AuthLoginResponse,
  EduUser,
  InstitutionTenant,
} from '@/types'

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterInstitutionPayload {
  institution_name: string
  slug: string
  institution_type: string
  admin_first_name: string
  admin_last_name: string
  admin_email: string
  admin_password: string
}

export interface RegisterPayload {
  email: string
  password: string
  first_name?: string
  last_name?: string
  username?: string
  organization_name?: string
  organization_code?: string
  role?: string
  subscription_tier?: string
}

export interface RegisterResponse {
  success: boolean
  message: string
  user: {
    id: string
    email: string
    username: string
    first_name: string
    last_name: string
    full_name: string
    role: string
    organization_id: string | null
    organization_name: string | null
  }
  active_tenant?: InstitutionTenant
}

export interface HealthStatusResponse {
  status: string
  database: string
  timestamp: string
}

export const authApi = {
  // POST /api/v1/auth/login/
  // Authenticates user, issues JWT tokens, and sets HttpOnly auth cookies (access_token, refresh_token)
  login: async (credentials: LoginCredentials): Promise<AuthLoginResponse> => {
    const response = await apiClient.post<AuthLoginResponse>('/auth/login/', credentials)
    return response.data
  },

  // POST /api/v1/auth/logout/
  // Clears all HttpOnly authentication cookies
  logout: async (): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post<{ success: boolean; message: string }>('/auth/logout/')
    return response.data
  },

  // POST /api/v1/auth/refresh/
  // Refreshes the access token using HttpOnly refresh_token cookie or optional body
  refresh: async (refreshToken?: string): Promise<{ access: string }> => {
    const response = await apiClient.post<{ access: string }>(
      '/auth/refresh/',
      refreshToken ? { refresh: refreshToken } : {}
    )
    return response.data
  },

  // GET /api/v1/auth/me/
  // Retrieves current user identity, permissions, and active memberships
  getMe: async (): Promise<{
    user: EduUser
    accessible_tenants: InstitutionTenant[]
    active_tenant: InstitutionTenant
    permissions?: string[]
  }> => {
    const response = await apiClient.get('/auth/me/')
    return response.data
  },

  // POST /api/v1/auth/switch-tenant/
  // Switches active tenant membership context
  switchTenant: async (tenantId: string): Promise<{ success: boolean; active_tenant: InstitutionTenant }> => {
    const response = await apiClient.post('/auth/switch-tenant/', { tenant_id: tenantId })
    return response.data
  },

  // POST /api/v1/auth/register-institution/
  // Onboarding endpoint to create a new institution tenant and primary admin
  registerInstitution: async (data: RegisterInstitutionPayload): Promise<unknown> => {
    const response = await apiClient.post('/auth/register-institution/', data)
    return response.data
  },

  // POST /api/v1/auth/register/
  // Public registration endpoint for new organizations and property managers
  register: async (data: RegisterPayload): Promise<RegisterResponse> => {
    const response = await apiClient.post<RegisterResponse>('/auth/register/', data)
    return response.data
  },

  // GET /api/v1/tenants/
  // Lists all institutions accessible to current user
  getTenants: async (): Promise<InstitutionTenant[]> => {
    const response = await apiClient.get<InstitutionTenant[]>('/tenants/')
    return response.data
  },

  // GET /api/v1/tenants/current/
  // Returns detailed configuration, features, and terminology for active tenant
  getCurrentTenant: async (): Promise<InstitutionTenant> => {
    const response = await apiClient.get<InstitutionTenant>('/tenants/current/')
    return response.data
  },

  // GET /api/v1/health/
  // Checks backend database and caching health
  getHealth: async (): Promise<HealthStatusResponse> => {
    const response = await apiClient.get<HealthStatusResponse>('/health/')
    return response.data
  },

  // GET /api/v1/ready/
  // Kubernetes/Docker readiness probe
  getReady: async (): Promise<{ status: string }> => {
    const response = await apiClient.get<{ status: string }>('/ready/')
    return response.data
  },
}
