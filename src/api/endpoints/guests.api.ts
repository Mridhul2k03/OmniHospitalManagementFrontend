import { apiClient } from '@/api/client/axios'

export interface GuestProfileData {
  id: string
  organizationId?: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  phoneNumber: string
  idDocumentType: string
  idDocumentNumber: string
  nationality: string
  vipStatus: 'STANDARD' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'VIP'
  specialPreferences?: string
  totalStays?: number
  totalSpend?: number
  createdAt?: string
}

export interface CreateGuestPayload {
  first_name: string
  last_name: string
  email: string
  phone_number?: string
  id_document_type?: string
  id_document_number?: string
  nationality?: string
  vip_status?: 'STANDARD' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'VIP'
  special_preferences?: string
}

const normalizeGuest = (g: any): GuestProfileData => {
  return {
    id: g.id,
    organizationId: g.organization,
    firstName: g.first_name || '',
    lastName: g.last_name || '',
    fullName: g.full_name || `${g.first_name || ''} ${g.last_name || ''}`.trim() || 'Valued Guest',
    email: g.email || '',
    phoneNumber: g.phone_number || '',
    idDocumentType: g.id_document_type || 'PASSPORT',
    idDocumentNumber: g.id_document_number || '',
    nationality: g.nationality || 'United States',
    vipStatus: (g.vip_status || 'STANDARD').toUpperCase() as any,
    specialPreferences: g.special_preferences || '',
    totalStays: g.total_stays || 1,
    totalSpend: g.total_spend || 450,
    createdAt: g.created_at,
  }
}

export const guestsApi = {
  // Get guest profiles with optional search and filters
  getGuests: async (params?: { search?: string; vip_status?: string }): Promise<GuestProfileData[]> => {
    const res = await apiClient.get<any>('/guests/', { params })
    const data = Array.isArray(res.data) ? res.data : (res.data?.data || res.data?.results || [])
    return data.map(normalizeGuest)
  },

  // Get specific guest by ID
  getGuestById: async (id: string): Promise<GuestProfileData> => {
    const res = await apiClient.get<any>(`/guests/${id}/`)
    return normalizeGuest(res.data)
  },

  // Create new guest profile
  createGuest: async (payload: CreateGuestPayload): Promise<GuestProfileData> => {
    const res = await apiClient.post<any>('/guests/', payload)
    return normalizeGuest(res.data)
  },

  // Update guest profile
  updateGuest: async (id: string, payload: Partial<CreateGuestPayload>): Promise<GuestProfileData> => {
    const res = await apiClient.patch<any>(`/guests/${id}/`, payload)
    return normalizeGuest(res.data)
  },

  // Delete guest profile
  deleteGuest: async (id: string): Promise<void> => {
    await apiClient.delete(`/guests/${id}/`)
  },
}
