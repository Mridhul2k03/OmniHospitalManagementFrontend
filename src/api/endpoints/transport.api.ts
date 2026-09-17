import { apiClient } from '@/api/client/axios'
import { TransportTrip, TransportVehicle, Driver } from '@/types'

export interface CreateTripPayload {
  guestName: string
  roomNumber?: string
  pickupLocation: string
  dropoffLocation: string
  pickupTime: string
  passengerCount: number
  flightNumber?: string
  vehicleTypeRequested?: string
  notes?: string
}

export const transportApi = {
  // Get dispatch trips list
  getTrips: async (status?: TransportTrip['status']): Promise<TransportTrip[]> => {
    const response = await apiClient.get<TransportTrip[]>('/transport/trips/', {
      params: status ? { status } : undefined,
    })
    return response.data
  },

  // Create transport trip request
  createTrip: async (payload: CreateTripPayload): Promise<TransportTrip> => {
    const response = await apiClient.post<TransportTrip>('/transport/trips/', payload)
    return response.data
  },

  // Assign vehicle and driver to a trip
  dispatchTrip: async (
    tripId: string,
    vehicleId: string,
    driverId: string
  ): Promise<TransportTrip> => {
    const response = await apiClient.post<TransportTrip>(`/transport/trips/${tripId}/dispatch/`, {
      vehicleId,
      driverId,
    })
    return response.data
  },

  // Update trip state (assigned -> en_route -> completed -> cancelled)
  updateTripStatus: async (
    tripId: string,
    status: TransportTrip['status']
  ): Promise<TransportTrip> => {
    const response = await apiClient.patch<TransportTrip>(`/transport/trips/${tripId}/`, { status })
    return response.data
  },

  // Get active fleet vehicles
  getVehicles: async (): Promise<TransportVehicle[]> => {
    const response = await apiClient.get<TransportVehicle[]>('/transport/vehicles/')
    return response.data
  },

  // Get rostered drivers
  getDrivers: async (): Promise<Driver[]> => {
    const response = await apiClient.get<Driver[]>('/transport/drivers/')
    return response.data
  },
}
