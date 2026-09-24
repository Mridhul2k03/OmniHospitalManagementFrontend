import { apiClient } from '@/api/client/axios'
import {
  SpaService,
  SpaAppointment,
  GateVisitorLog,
  InventoryStockItem,
  BanquetVenue,
  BanquetEvent,
  CloakroomTicket,
  OTAChannelConnection,
  StaffEmployee,
} from '@/types'

export const spaApi = {
  getServices: async (): Promise<SpaService[]> => {
    const res = await apiClient.get<SpaService[]>('/spa/services/')
    return res.data || []
  },
  getAppointments: async (): Promise<SpaAppointment[]> => {
    const res = await apiClient.get<SpaAppointment[]>('/spa/appointments/')
    return res.data || []
  },
  createAppointment: async (apt: Partial<SpaAppointment>): Promise<SpaAppointment> => {
    const res = await apiClient.post<SpaAppointment>('/spa/appointments/', apt)
    return res.data
  },
  updateAppointmentStatus: async (id: string, status: string): Promise<SpaAppointment> => {
    const res = await apiClient.patch<SpaAppointment>(`/spa/appointments/${id}/`, { status })
    return res.data
  },
}

export const securityApi = {
  getGateLogs: async (): Promise<GateVisitorLog[]> => {
    const res = await apiClient.get<GateVisitorLog[]>('/security/gate-logs/')
    return res.data || []
  },
  registerEntry: async (log: Partial<GateVisitorLog>): Promise<GateVisitorLog> => {
    const res = await apiClient.post<GateVisitorLog>('/security/gate-logs/', log)
    return res.data
  },
  logExit: async (id: string): Promise<GateVisitorLog> => {
    const res = await apiClient.post<GateVisitorLog>(`/security/gate-logs/${id}/exit/`)
    return res.data
  },
}

export const inventoryApi = {
  getStockItems: async (): Promise<InventoryStockItem[]> => {
    const res = await apiClient.get<InventoryStockItem[]>('/inventory/stock/')
    return res.data || []
  },
  createStockItem: async (item: Partial<InventoryStockItem>): Promise<InventoryStockItem> => {
    const res = await apiClient.post<InventoryStockItem>('/inventory/stock/', item)
    return res.data
  },
  adjustStock: async (id: string, currentStock: number, status?: string): Promise<InventoryStockItem> => {
    const res = await apiClient.patch<InventoryStockItem>(`/inventory/stock/${id}/`, { currentStock, status })
    return res.data
  },
  createPO: async (itemId: string, quantity: number = 10): Promise<{ poNumber: string; itemId: string; quantity: number }> => {
    const res = await apiClient.post('/inventory/po/', { itemId, quantity })
    return res.data
  },
}

export const eventsApi = {
  getVenues: async (): Promise<BanquetVenue[]> => {
    const res = await apiClient.get<BanquetVenue[]>('/events/venues/')
    return res.data || []
  },
  createVenue: async (venue: Partial<BanquetVenue>): Promise<BanquetVenue> => {
    const res = await apiClient.post<BanquetVenue>('/events/venues/', venue)
    return res.data
  },
  getEvents: async (): Promise<BanquetEvent[]> => {
    const res = await apiClient.get<BanquetEvent[]>('/events/')
    return res.data || []
  },
  createEvent: async (event: Partial<BanquetEvent>): Promise<BanquetEvent> => {
    const res = await apiClient.post<BanquetEvent>('/events/', event)
    return res.data
  },
}

export const cloakroomApi = {
  getTickets: async (): Promise<CloakroomTicket[]> => {
    const res = await apiClient.get<CloakroomTicket[]>('/cloakroom/tickets/')
    return res.data || []
  },
  issueTicket: async (ticket: Partial<CloakroomTicket>): Promise<CloakroomTicket> => {
    const res = await apiClient.post<CloakroomTicket>('/cloakroom/tickets/', ticket)
    return res.data
  },
  releaseTicket: async (id: string): Promise<CloakroomTicket> => {
    const res = await apiClient.post<CloakroomTicket>(`/cloakroom/tickets/${id}/release/`)
    return res.data
  },
}

export const channelsApi = {
  getChannels: async (): Promise<OTAChannelConnection[]> => {
    const res = await apiClient.get<OTAChannelConnection[]>('/channels/')
    return res.data || []
  },
  connectChannel: async (channel: Partial<OTAChannelConnection>): Promise<OTAChannelConnection> => {
    const res = await apiClient.post<OTAChannelConnection>('/channels/', channel)
    return res.data
  },
  toggleChannelStatus: async (id: string, status: string): Promise<OTAChannelConnection> => {
    const res = await apiClient.patch<OTAChannelConnection>(`/channels/${id}/`, { status })
    return res.data
  },
  syncAll: async (): Promise<{ message: string; channels: OTAChannelConnection[] }> => {
    const res = await apiClient.post<{ message: string; channels: OTAChannelConnection[] }>('/channels/sync/')
    return res.data
  },
}

export const hrApi = {
  getStaff: async (): Promise<StaffEmployee[]> => {
    const res = await apiClient.get<StaffEmployee[]>('/hr/staff/')
    return res.data || []
  },
  addStaff: async (staff: Partial<StaffEmployee>): Promise<StaffEmployee> => {
    const res = await apiClient.post<StaffEmployee>('/hr/staff/', staff)
    return res.data
  },
  punchClock: async (id: string, status: string, clockInTime?: string): Promise<StaffEmployee> => {
    const res = await apiClient.patch<StaffEmployee>(`/hr/staff/${id}/`, { status, clockInTime })
    return res.data
  },
}

export const operationsApi = {
  // Venues & Events
  getVenues: async (): Promise<BanquetVenue[]> => {
    const res = await apiClient.get<any>('/events/venues/')
    return Array.isArray(res.data) ? res.data : (res.data?.data || res.data?.results || [])
  },
  getEvents: async (): Promise<BanquetEvent[]> => {
    const res = await apiClient.get<any>('/events/')
    return Array.isArray(res.data) ? res.data : (res.data?.data || res.data?.results || [])
  },

  // Bridges Master Folio modal displaying real BEO charges
  getEventBEOFolio: async (eventId: string): Promise<{
    eventId: string
    venueRental: number
    cateringPackage: number
    roomBlockGuarantee: number
    totalRevenue: number
    items?: Array<{ name: string; amount: number; category: string }>
  }> => {
    const res = await apiClient.get<any>(`/events/${eventId}/folio/`)
    return res.data
  },

  // OTA Channel Mappings bridge
  getChannelMappings: async (channelId: string): Promise<Array<{
    id: string
    channelId: string
    pmsRoomTypeId: string
    pmsRoomTypeName: string
    otaRoomCode: string
    rateMultiplier: number
    status: string
  }>> => {
    const res = await apiClient.get<any>(`/channels/${channelId}/mappings/`)
    return Array.isArray(res.data) ? res.data : (res.data?.data || res.data?.results || [])
  },

  saveChannelMapping: async (channelId: string, payload: { pmsRoomTypeId: string; otaRoomCode: string; rateMultiplier?: number }): Promise<any> => {
    const res = await apiClient.post<any>(`/channels/${channelId}/mappings/`, payload)
    return res.data
  },

  // Inventory PO history
  getPurchaseOrders: async (): Promise<Array<{
    id: string
    poNumber: string
    itemName: string
    quantity: number
    status: string
    supplierName: string
    createdAt: string
    totalCost: number
  }>> => {
    const res = await apiClient.get<any>('/inventory/po/')
    return Array.isArray(res.data) ? res.data : (res.data?.data || res.data?.results || [])
  },
}
