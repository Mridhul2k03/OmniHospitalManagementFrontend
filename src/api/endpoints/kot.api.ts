import { apiClient } from '@/api/client/axios'
import { KOTOrder, KOTStatus } from '@/types'

export const kotApi = {
  // Get live KOT tickets, optionally filtered by station (e.g. grill, pantry, bar, pastry)
  getOrders: async (station?: string): Promise<KOTOrder[]> => {
    const response = await apiClient.get<KOTOrder[]>('/dining/kot/', {
      params: station ? { station } : undefined,
    })
    return response.data
  },

  // Bump KOT ticket to next status (new -> accepted -> preparing -> ready -> served)
  updateOrderStatus: async (orderId: string, status: KOTStatus): Promise<KOTOrder> => {
    const response = await apiClient.patch<KOTOrder>(`/dining/kot/${orderId}/`, { status })
    return response.data
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
