import { apiClient } from '@/api/client/axios'
import { DiningTable, MenuItem, KOTOrder } from '@/types'

export interface CreateOrderPayload {
  tableId: string
  items: Array<{
    menuItemId: string
    quantity: number
    specialInstructions?: string
  }>
  guestCount: number
  serverName: string
}

export interface PostToRoomPayload {
  roomId: string
  guestName: string
  tipAmount?: number
  signatureBase64?: string
}

export const diningApi = {
  // Get all dining tables for the active restaurant/outlet
  getTables: async (outletId?: string): Promise<DiningTable[]> => {
    const response = await apiClient.get<DiningTable[]>('/dining/tables/', {
      params: outletId ? { outletId } : undefined,
    })
    return response.data
  },

  // Update table status (e.g. available, occupied, reserved, billing)
  updateTableStatus: async (
    tableId: string,
    status: DiningTable['status']
  ): Promise<DiningTable> => {
    const response = await apiClient.patch<DiningTable>(`/dining/tables/${tableId}/`, { status })
    return response.data
  },

  // Fetch food and beverage digital menu catalog
  getMenuItems: async (category?: string): Promise<MenuItem[]> => {
    const response = await apiClient.get<MenuItem[]>('/dining/menu-items/', {
      params: category ? { category } : undefined,
    })
    return response.data
  },

  // Fire order and dispatch KOT tickets to kitchen stations
  createOrder: async (payload: CreateOrderPayload): Promise<KOTOrder> => {
    const response = await apiClient.post<KOTOrder>('/dining/orders/', payload)
    return response.data
  },

  // Post settled table check directly to guest's active room folio
  postCheckToRoom: async (
    orderId: string,
    payload: PostToRoomPayload
  ): Promise<{ message: string; folioChargeId: string }> => {
    const response = await apiClient.post<{ message: string; folioChargeId: string }>(
      `/dining/orders/${orderId}/post-to-room/`,
      payload
    )
    return response.data
  },
}
