import { apiClient } from '@/api/client/axios'
import { Reservation, ReservationStatus } from '@/types'

export interface ReservationFilterParams {
  status?: ReservationStatus
  checkInFrom?: string
  checkInTo?: string
  search?: string
  page?: number
  pageSize?: number
}

export interface CheckInPayload {
  assignedRoomId: string
  keyCardCount?: number
  idDocumentType?: string
  idDocumentNumber?: string
  signatureDataUrl?: string
  specialNotes?: string
}

export interface CheckOutPayload {
  settlementMethod: string
  notes?: string
}

export const reservationsApi = {
  // Get reservations list with filtering
  getReservations: async (params?: ReservationFilterParams): Promise<Reservation[]> => {
    const response = await apiClient.get<Reservation[]>('/reservations/', { params })
    return response.data
  },

  // Get reservation by confirmation code or ID
  getReservationById: async (idOrCode: string): Promise<Reservation> => {
    const response = await apiClient.get<Reservation>(`/reservations/${idOrCode}/`)
    return response.data
  },

  // Today's arrivals
  getTodayArrivals: async (): Promise<Reservation[]> => {
    const response = await apiClient.get<Reservation[]>('/reservations/today-arrivals/')
    return response.data
  },

  // Today's departures
  getTodayDepartures: async (): Promise<Reservation[]> => {
    const response = await apiClient.get<Reservation[]>('/reservations/today-departures/')
    return response.data
  },

  // In-house guests manifest
  getInHouseGuests: async (): Promise<Reservation[]> => {
    const response = await apiClient.get<Reservation[]>('/reservations/in-house/')
    return response.data
  },

  // Create new reservation
  createReservation: async (data: Partial<Reservation>): Promise<Reservation> => {
    const response = await apiClient.post<Reservation>('/reservations/', data)
    return response.data
  },

  // Perform operational guest check-in
  checkIn: async (reservationId: string, payload: CheckInPayload): Promise<Reservation> => {
    const response = await apiClient.post<Reservation>(`/reservations/${reservationId}/check-in/`, payload)
    return response.data
  },

  // Complete guest check-out
  checkOut: async (reservationId: string, payload: CheckOutPayload): Promise<Reservation> => {
    const response = await apiClient.post<Reservation>(`/reservations/${reservationId}/check-out/`, payload)
    return response.data
  },

  // Digital contactless guest pre-arrival check-in
  submitDigitalCheckIn: async (
    confirmationCode: string,
    guestData: {
      firstName: string
      lastName: string
      email: string
      phone: string
      idType: string
      idNumber: string
      estimatedArrivalTime: string
      signatureBase64: string
    }
  ): Promise<{ status: string; message: string; qrCode: string }> => {
    const response = await apiClient.post<{ status: string; message: string; qrCode: string }>(
      `/reservations/${confirmationCode}/digital-checkin/`,
      guestData
    )
    return response.data
  },
}
