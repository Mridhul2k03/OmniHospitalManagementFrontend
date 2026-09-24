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

  // Create a new dining table (Admin operation)
  createTable: async (data: Partial<DiningTable>): Promise<DiningTable> => {
    const response = await apiClient.post<DiningTable>('/dining/tables/', data)
    return response.data
  },

  // Update dining table details (Admin operation)
  updateTable: async (tableId: string, data: Partial<DiningTable>): Promise<DiningTable> => {
    const response = await apiClient.patch<DiningTable>(`/dining/tables/${tableId}/`, data)
    return response.data
  },

  // Delete dining table (Admin operation)
  deleteTable: async (tableId: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/dining/tables/${tableId}/`)
    return response.data
  },

  // Fetch food and beverage digital menu catalog
  getMenuItems: async (category?: string): Promise<MenuItem[]> => {
    const response = await apiClient.get<MenuItem[]>('/dining/menu-items/', {
      params: category ? { category } : undefined,
    })
    return response.data
  },

  // Create a new menu item (Admin operation)
  createMenuItem: async (data: Partial<MenuItem>): Promise<MenuItem> => {
    const response = await apiClient.post<MenuItem>('/dining/menu-items/', data)
    return response.data
  },

  // Update a menu item (Admin operation)
  updateMenuItem: async (itemId: string, data: Partial<MenuItem>): Promise<MenuItem> => {
    const response = await apiClient.patch<MenuItem>(`/dining/menu-items/${itemId}/`, data)
    return response.data
  },

  // Delete a menu item (Admin operation)
  deleteMenuItem: async (itemId: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/dining/menu-items/${itemId}/`)
    return response.data
  },

  // Fetch menu (alias for getMenuItems)
  getMenu: async (): Promise<MenuItem[]> => {
    try {
      const response = await apiClient.get<any>('/dining/menu/')
      return Array.isArray(response.data) ? response.data : (response.data?.data || response.data?.results || [])
    } catch {
      const response = await apiClient.get<MenuItem[]>('/dining/menu-items/')
      return response.data || []
    }
  },

  // Fire order and dispatch KOT tickets to kitchen stations
  createOrder: async (payload: CreateOrderPayload): Promise<KOTOrder> => {
    const response = await apiClient.post<KOTOrder>('/dining/orders/', payload)
    return response.data
  },

  // Firing orders to KDS (Recipe / specification method)
  fireKOTOrder: async (payload: {
    tableNumber: string
    roomNumber?: string
    serverName?: string
    items: Array<{ menuItemId?: string; name: string; quantity: number; specialInstructions?: string; station: string }>
  }): Promise<any> => {
    const response = await apiClient.post<any>('/dining/orders/kot/', payload)
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

  // Room folio charge posting (specification method)
  postDiningToRoomFolio: async (payload: { roomNumber: string; amount: number; tip?: number; orderNumber: string }): Promise<any> => {
    const response = await apiClient.post<any>('/dining/orders/folio/', payload)
    return response.data
  },
}
