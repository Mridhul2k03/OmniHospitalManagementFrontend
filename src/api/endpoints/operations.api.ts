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
