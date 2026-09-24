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

export interface WalkInBookingPayload {
  guest: {
    firstName: string
    lastName: string
    email: string
    phone: string
  }
  roomId: string
  checkInDate: string // YYYY-MM-DD
  checkOutDate: string // YYYY-MM-DD
  channel: 'walk_in' | 'direct'
  autoCheckIn?: boolean
}

export interface DigitalCheckInPayload {
  confirmationCode: string
  firstName?: string
  lastName?: string
  idType?: string
  idNumber?: string
  signatureBase64: string
  estimatedArrivalTime?: string
}

const normalizeReservation = (r: any): Reservation => {
  const guest = r.guest && typeof r.guest === 'object' && r.guest.firstName ? r.guest : {
    id: r.guest?.id || r.guest || 'g-001',
    firstName: r.guest?.first_name || (r.guest_name ? r.guest_name.split(' ')[0] : 'Guest'),
    lastName: r.guest?.last_name || (r.guest_name ? r.guest_name.split(' ').slice(1).join(' ') : ''),
    email: r.guest?.email || 'guest@example.com',
    phone: r.guest?.phone_number || r.guest?.phone || '+1 555-0100',
    idType: (r.guest?.id_document_type?.toLowerCase() || 'passport') as any,
    idNumber: r.guest?.id_document_number || 'PA-99120',
    country: r.guest?.nationality || 'United States',
    vipStatus: (r.guest?.vip_tier?.toLowerCase() || 'gold') as any,
    totalStays: 4,
    totalSpend: 3200,
  }

  const firstRoom = Array.isArray(r.reservation_rooms) && r.reservation_rooms.length > 0 ? r.reservation_rooms[0] : null
  const roomNumber = r.roomNumber || r.room_number || firstRoom?.room_number || ''
  const roomTypeName = r.roomTypeName || r.room_type_name || firstRoom?.room_type_name || 'Standard Deluxe'
  const roomTypeId = r.roomTypeId || r.room_type || firstRoom?.room_type || 'rt-001'

  return {
    id: r.id || `res-${Date.now()}`,
    code: r.code || r.confirmation_code || `RES-${r.id?.substring(0, 4) || '9000'}`,
    propertyId: r.propertyId || r.property || 'prop-001',
    propertyName: r.propertyName || r.property_name || 'Grand Horizon Palace & Spa',
    guest,
    roomTypeId,
    roomTypeName,
    roomId: r.roomId || firstRoom?.allocated_room,
    roomNumber,
    checkInDate: r.checkInDate || r.check_in_date || '2026-09-21',
    checkOutDate: r.checkOutDate || r.check_out_date || '2026-09-24',
    nightsCount: r.nightsCount || r.total_nights || 3,
    adultsCount: r.adultsCount || r.total_adults || 1,
    childrenCount: r.childrenCount || r.total_children || 0,
    status: (r.status || 'confirmed').toLowerCase() as ReservationStatus,
    totalAmount: Number(r.totalAmount || r.total_amount || 0),
    paidAmount: Number(r.paidAmount || r.paid_amount || 0),
    balanceAmount: Math.max(0, Number(r.totalAmount || r.total_amount || 0) - Number(r.paidAmount || r.paid_amount || 0)),
    channel: r.channel || (r.source || 'direct').toLowerCase(),
    createdDate: r.createdDate || r.created_at || '2026-09-18',
  }
}

export const reservationsApi = {
  // Get reservations list with filtering
  getReservations: async (params?: ReservationFilterParams): Promise<Reservation[]> => {
    const response = await apiClient.get<Reservation[]>('/reservations/', { params })
    const list = Array.isArray(response.data) ? response.data : ((response.data as any)?.data || (response.data as any)?.results || [])
    return list.map(normalizeReservation)
  },

  // Get reservation by confirmation code or ID
  getReservationById: async (idOrCode: string): Promise<Reservation> => {
    const response = await apiClient.get<Reservation>(`/reservations/${idOrCode}/`)
    return normalizeReservation(response.data)
  },

  // Today's arrivals
  getTodayArrivals: async (): Promise<Reservation[]> => {
    const response = await apiClient.get<Reservation[]>('/reservations/today-arrivals/')
    const list = Array.isArray(response.data) ? response.data : ((response.data as any)?.data || (response.data as any)?.results || [])
    return list.map(normalizeReservation)
  },

  // Today's departures
  getTodayDepartures: async (): Promise<Reservation[]> => {
    const response = await apiClient.get<Reservation[]>('/reservations/today-departures/')
    const list = Array.isArray(response.data) ? response.data : ((response.data as any)?.data || (response.data as any)?.results || [])
    return list.map(normalizeReservation)
  },

  // In-house guests manifest
  getInHouseGuests: async (): Promise<Reservation[]> => {
    const response = await apiClient.get<Reservation[]>('/reservations/in-house/')
    const list = Array.isArray(response.data) ? response.data : ((response.data as any)?.data || (response.data as any)?.results || [])
    return list.map(normalizeReservation)
  },

  // Walk-in booking creation (Bridges FrontDeskHub & ReservationsHub buttons)
  createWalkInBooking: async (payload: WalkInBookingPayload): Promise<Reservation> => {
    const response = await apiClient.post<any>('/reservations/', payload)
    return normalizeReservation((response.data as any)?.reservation || response.data)
  },

  // Create new reservation
  createReservation: async (data: Partial<Reservation>): Promise<Reservation> => {
    const response = await apiClient.post<Reservation>('/reservations/', data)
    return normalizeReservation((response.data as any)?.reservation || response.data)
  },

  // Perform operational guest check-in
  checkIn: async (reservationId: string, payload: CheckInPayload): Promise<Reservation> => {
    const response = await apiClient.post<Reservation>(`/reservations/${reservationId}/check-in/`, payload)
    return normalizeReservation((response.data as any)?.reservation || response.data)
  },

  // Front Desk physical Check-In
  checkInGuest: async (id: string, payload: { assignedRoomId?: string; keyCardsCount?: number; notes?: string }): Promise<any> => {
    const response = await apiClient.post<any>(`/reservations/${id}/check-in/`, payload)
    return (response.data as any)?.reservation || response.data
  },

  // Complete guest check-out
  checkOut: async (reservationId: string, payload: CheckOutPayload): Promise<Reservation> => {
    const response = await apiClient.post<Reservation>(`/reservations/${reservationId}/check-out/`, payload)
    return normalizeReservation((response.data as any)?.reservation || response.data)
  },

  // Front Desk departure Check-Out
  checkOutGuest: async (id: string, payload?: { settlementMethod?: string; notes?: string }): Promise<any> => {
    const response = await apiClient.post<any>(`/reservations/${id}/check-out/`, payload || {})
    return (response.data as any)?.reservation || response.data
  },

  // Digital contactless guest pre-arrival check-in (supports both signatures)
  submitDigitalCheckIn: async (
    codeOrPayload: string | DigitalCheckInPayload,
    guestData?: {
      firstName?: string
      lastName?: string
      email?: string
      phone?: string
      idType?: string
      idNumber?: string
      estimatedArrivalTime?: string
      signatureBase64: string
    }
  ): Promise<{ status: string; message: string; qrCode: string }> => {
    if (typeof codeOrPayload === 'string') {
      const response = await apiClient.post<{ status: string; message: string; qrCode: string }>(
        `/reservations/${codeOrPayload}/digital-checkin/`,
        guestData
      )
      return response.data
    } else {
      const response = await apiClient.post<{ status: string; message: string; qrCode: string }>(
        '/reservations/digital-check-in/',
        codeOrPayload
      )
      return response.data
    }
  },

  // Cancel reservation
  cancelReservation: async (id: string, reason?: string): Promise<{ success: boolean; message: string; status: string }> => {
    const response = await apiClient.post<any>(`/reservations/${id}/cancel/`, { reason })
    return response.data
  },
}
