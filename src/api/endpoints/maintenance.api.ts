import { apiClient } from '@/api/client/axios'
import { MaintenanceTicket, MaintenancePriority, MaintenanceStatus } from '@/types'

export interface CreateTicketPayload {
  propertyId: string
  roomId?: string
  area: string
  title: string
  description: string
  priority: MaintenancePriority
  category: 'plumbing' | 'electrical' | 'hvac' | 'carpentry' | 'appliance' | 'general'
}

export const maintenanceApi = {
  // Get maintenance tickets with optional status/priority filter
  getTickets: async (status?: MaintenanceStatus): Promise<MaintenanceTicket[]> => {
    const response = await apiClient.get<MaintenanceTicket[]>('/maintenance/tickets/', {
      params: status ? { status } : undefined,
    })
    return response.data
  },

  // Create new maintenance work order
  createTicket: async (payload: CreateTicketPayload): Promise<MaintenanceTicket> => {
    const response = await apiClient.post<MaintenanceTicket>('/maintenance/tickets/', payload)
    return response.data
  },

  // Update ticket status or resolution details
  updateTicketStatus: async (
    ticketId: string,
    status: MaintenanceStatus,
    resolutionNotes?: string
  ): Promise<MaintenanceTicket> => {
    const response = await apiClient.patch<MaintenanceTicket>(`/maintenance/tickets/${ticketId}/`, {
      status,
      resolutionNotes,
    })
    return response.data
  },

  // Assign ticket to technician
  assignTechnician: async (
    ticketId: string,
    technicianId: string,
    technicianName: string
  ): Promise<MaintenanceTicket> => {
    const response = await apiClient.post<MaintenanceTicket>(`/maintenance/tickets/${ticketId}/assign/`, {
      technicianId,
      technicianName,
    })
    return response.data
  },
}
