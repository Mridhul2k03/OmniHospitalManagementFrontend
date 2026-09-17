import { apiClient } from '@/api/client/axios'
import { Room, RoomType, RoomStatus } from '@/types'

export interface RoomFilterParams {
  floorId?: string
  buildingId?: string
  roomTypeId?: string
  status?: RoomStatus
  isSmoking?: boolean
  search?: string
}

export const roomsApi = {
  // Fetch rooms for active property with optional filters
  getRooms: async (params?: RoomFilterParams): Promise<Room[]> => {
    const response = await apiClient.get<Room[]>('/rooms/', { params })
    return response.data
  },

  // Fetch single room by ID
  getRoomById: async (roomId: string): Promise<Room> => {
    const response = await apiClient.get<Room>(`/rooms/${roomId}/`)
    return response.data
  },

  // Fetch room types (Executive Suite, Deluxe Ocean View, etc.)
  getRoomTypes: async (): Promise<RoomType[]> => {
    const response = await apiClient.get<RoomType[]>('/rooms/types/')
    return response.data
  },

  // Execute room status state machine transition (e.g. Dirty -> Cleaning -> Inspection -> Available)
  updateRoomStatus: async (
    roomId: string,
    status: RoomStatus,
    reason?: string
  ): Promise<Room> => {
    const response = await apiClient.post<Room>(`/rooms/${roomId}/status-transition/`, {
      status,
      reason,
    })
    return response.data
  },

  // Transfer guest to a new room (requires mandatory audit reason)
  transferRoom: async (
    currentRoomId: string,
    targetRoomId: string,
    reason: string
  ): Promise<{ message: string; sourceRoom: Room; targetRoom: Room }> => {
    const response = await apiClient.post<{
      message: string
      sourceRoom: Room
      targetRoom: Room
    }>(`/rooms/${currentRoomId}/transfer/`, {
      targetRoomId,
      reason,
    })
    return response.data
  },
}
