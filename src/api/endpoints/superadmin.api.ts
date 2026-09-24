import { apiClient } from '@/api/client/axios'
import { ClientOrganization, PlatformUser, SubscriptionTier } from '@/types'

export interface CreateClientPayload {
  name: string
  code: string
  legal_name?: string
  contact_email: string
  contact_phone?: string
  address?: string
  subscription_tier?: SubscriptionTier | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE'
  admin_email?: string
  admin_password?: string
  admin_first_name?: string
  admin_last_name?: string
  admin_username?: string
}

export interface CreateUserPayload {
  email: string
  username: string
  password?: string
  first_name?: string
  last_name?: string
  role: string
  organization?: string | null
  phone_number?: string
  is_active?: boolean
}

export interface UserQueryParams {
  organization?: string
  role?: string
  is_active?: boolean
  search?: string
}

export const superAdminApi = {
  // CLIENT / TENANT MANAGEMENT
  getClients: async (): Promise<ClientOrganization[]> => {
    const res = await apiClient.get<ClientOrganization[] | { results?: ClientOrganization[]; data?: ClientOrganization[] }>('/organizations/')
    if (Array.isArray(res.data)) {
      return res.data
    }
    const payload = res.data as { results?: ClientOrganization[]; data?: ClientOrganization[] }
    return payload.results || payload.data || []
  },

  createClient: async (payload: CreateClientPayload): Promise<ClientOrganization> => {
    const res = await apiClient.post<ClientOrganization | { data: ClientOrganization }>('/organizations/', {
      ...payload,
      subscription_tier: (payload.subscription_tier || 'ENTERPRISE').toUpperCase(),
    })
    const body = res.data as { data?: ClientOrganization }
    return (body.data || res.data) as ClientOrganization
  },

  updateClient: async (id: string, data: Partial<ClientOrganization>): Promise<ClientOrganization> => {
    const res = await apiClient.patch<ClientOrganization | { data: ClientOrganization }>(`/organizations/${id}/`, data)
    const body = res.data as { data?: ClientOrganization }
    return (body.data || res.data) as ClientOrganization
  },

  toggleClientStatus: async (id: string): Promise<{ success: boolean; is_active: boolean; message: string }> => {
    const res = await apiClient.post<{ success: boolean; is_active: boolean; message: string }>(
      `/organizations/${id}/toggle-status/`
    )
    return res.data
  },

  setClientTier: async (
    id: string,
    tier: SubscriptionTier | string
  ): Promise<{ success: boolean; subscription_tier: string; message: string }> => {
    const res = await apiClient.post<{ success: boolean; subscription_tier: string; message: string }>(
      `/organizations/${id}/set-tier/`,
      { subscription_tier: tier.toUpperCase() }
    )
    return res.data
  },

  // GLOBAL USERS CONTROLLER
  getGlobalUsers: async (params?: UserQueryParams): Promise<PlatformUser[]> => {
    const res = await apiClient.get<PlatformUser[] | { results?: PlatformUser[]; data?: PlatformUser[] }>('/auth/users/', {
      params,
    })
    if (Array.isArray(res.data)) {
      return res.data
    }
    const payload = res.data as { results?: PlatformUser[]; data?: PlatformUser[] }
    return payload.results || payload.data || []
  },

  createGlobalUser: async (payload: CreateUserPayload): Promise<PlatformUser> => {
    const res = await apiClient.post<PlatformUser | { data: PlatformUser }>('/auth/users/', payload)
    const body = res.data as { data?: PlatformUser }
    return (body.data || res.data) as PlatformUser
  },

  updateGlobalUser: async (id: string, payload: Partial<CreateUserPayload>): Promise<PlatformUser> => {
    const res = await apiClient.patch<PlatformUser | { data: PlatformUser }>(`/auth/users/${id}/`, payload)
    const body = res.data as { data?: PlatformUser }
    return (body.data || res.data) as PlatformUser
  },

  toggleUserActive: async (id: string): Promise<{ success: boolean; is_active: boolean; message: string }> => {
    const res = await apiClient.post<{ success: boolean; is_active: boolean; message: string }>(
      `/auth/users/${id}/toggle-active/`
    )
    return res.data
  },

  resetUserPassword: async (id: string, password: string): Promise<{ success: boolean; message: string }> => {
    const res = await apiClient.post<{ success: boolean; message: string }>(
      `/auth/users/${id}/reset-password/`,
      { password }
    )
    return res.data
  },

  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete(`/auth/users/${id}/`)
  },
}
