import { apiClient } from '@/api/client/axios'
import { KOTOrder, KOTStatus } from '@/types'

export const kotApi = {
  // Get active tickets (specification method)
  getActiveTickets: async (params?: { status?: string; station?: string }): Promise<any> => {
    try {
      const response = await apiClient.get<any>('/kot/orders/', { params })
      return Array.isArray(response.data) ? response.data : (response.data?.data || response.data?.results || [])
    } catch {
      const response = await apiClient.get<KOTOrder[]>('/dining/kot/', { params })
      return response.data
    }
  },

  // Advance ticket status (specification method)
  advanceTicketStatus: async (id: string, status: 'preparing' | 'ready' | 'served' | 'cancelled'): Promise<any> => {
    try {
      const response = await apiClient.patch<any>(`/kot/orders/${id}/status/`, { status })
      return response.data
    } catch {
      const response = await apiClient.patch<KOTOrder>(`/dining/kot/${id}/`, { status })
      return response.data
    }
  },

  // Bump individual item status
  bumpItemStatus: async (ticketId: string, itemId: string, status: string): Promise<any> => {
    const response = await apiClient.patch<any>(`/kot/orders/${ticketId}/items/${itemId}/status/`, { status })
    return response.data
  },

  // Get live KOT tickets, optionally filtered by station (e.g. grill, pantry, bar, pastry)
  getOrders: async (station?: string): Promise<KOTOrder[]> => {
    try {
      const response = await apiClient.get<any>('/kot/orders/', {
        params: station ? { station } : undefined,
      })
      const list = Array.isArray(response.data) ? response.data : (response.data?.data || response.data?.results || [])
      if (list && list.length > 0) return list
    } catch {}
    const response = await apiClient.get<KOTOrder[]>('/dining/kot/', {
      params: station ? { station } : undefined,
    })
    return response.data
  },

  // Bump KOT ticket to next status (new -> accepted -> preparing -> ready -> served)
  updateOrderStatus: async (orderId: string, status: KOTStatus): Promise<KOTOrder> => {
    try {
      const response = await apiClient.patch<any>(`/kot/orders/${orderId}/status/`, { status })
      return response.data
    } catch {
      const response = await apiClient.patch<KOTOrder>(`/dining/kot/${orderId}/`, { status })
      return response.data
    }
  },

  // Cancel KOT order with mandatory audit reason
  cancelOrder: async (
    orderId: string,
    reason: string
  ): Promise<{ message: string; cancelledOrder: KOTOrder }> => {
    const response = await apiClient.post<{ message: string; cancelledOrder: KOTOrder }>(
      `/dining/kot/${orderId}/cancel/`,
      { reason }
    )
    return response.data
  },

  // Create / dispatch manual KOT order directly to kitchen
  createOrder: async (payload: {
    tableNumber?: string
    station?: string
    serverName?: string
    guestCount?: number
    priority?: string
    items: Array<{ menuItemId?: string; name: string; quantity: number; specialInstructions?: string }>
  }): Promise<KOTOrder> => {
    const response = await apiClient.post<KOTOrder>('/dining/kot/', payload)
    return response.data
  },
}
