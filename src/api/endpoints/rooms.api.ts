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
    const data = Array.isArray(response.data) ? response.data : ((response.data as { results?: Room[]; data?: Room[] })?.data || (response.data as { results?: Room[]; data?: Room[] })?.results || [])
    return data.map((r: Room & { room_number?: string; room_type_name?: string; floor_number?: number }) => ({
      ...r,
      roomNumber: r.roomNumber || r.room_number || '',
      roomTypeName: r.roomTypeName || r.room_type_name || 'Standard Deluxe',
      floorNumber: r.floorNumber || r.floor_number || 1,
      status: (r.status || 'available').toLowerCase() as RoomStatus,
      isClean: (r.status || '').toLowerCase() === 'available' || (r.status || '').toLowerCase() === 'inspection',
      isOccupied: (r.status || '').toLowerCase() === 'occupied',
    }))
  },

  // Fetch single room by ID
  getRoomById: async (roomId: string): Promise<Room> => {
    const response = await apiClient.get<Room>(`/rooms/${roomId}/`)
    const r = response.data
    return {
      ...r,
      status: (r.status || 'available').toLowerCase() as RoomStatus,
    }
  },

  // Fetch room types (Executive Suite, Deluxe Ocean View, etc.)
  getRoomTypes: async (): Promise<RoomType[]> => {
    const response = await apiClient.get<RoomType[]>('/rooms/types/')
    const data = Array.isArray(response.data) ? response.data : ((response.data as { results?: RoomType[]; data?: RoomType[] })?.data || (response.data as { results?: RoomType[]; data?: RoomType[] })?.results || [])
    return data
  },

  // Execute room status state machine transition (e.g. Dirty -> Cleaning -> Inspection -> Available)
  updateRoomStatus: async (
    roomId: string,
    status: RoomStatus,
    reason?: string
  ): Promise<Room> => {
    const response = await apiClient.post<Room>(`/rooms/${roomId}/status-transition/`, {
      status: status.toUpperCase(),
      reason,
    })
    return {
      ...response.data,
      status: ((response.data as Room)?.status || status).toLowerCase() as RoomStatus,
    }
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
