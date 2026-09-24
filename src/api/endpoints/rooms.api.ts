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

  // Create a new room in active property (Admin operation)
  createRoom: async (payload: {
    roomNumber: string
    roomTypeId?: string
    roomTypeName?: string
    floorNumber?: number
    currentRate?: number
    status?: string
  }): Promise<Room> => {
    const response = await apiClient.post<Room>('/rooms/', {
      room_number: payload.roomNumber,
      room_type: payload.roomTypeId,
      status: (payload.status || 'AVAILABLE').toUpperCase(),
    })
    const r = response.data
    return {
      ...r,
      roomNumber: r.roomNumber || (r as any).room_number || payload.roomNumber,
      roomTypeName: r.roomTypeName || (r as any).room_type_name || payload.roomTypeName || 'Deluxe Room',
      floorNumber: r.floorNumber || payload.floorNumber || 1,
      currentRate: r.currentRate || payload.currentRate || 250,
      status: ((r.status || payload.status || 'available').toLowerCase()) as RoomStatus,
      isClean: (payload.status || 'available').toLowerCase() === 'available',
      isOccupied: (payload.status || '').toLowerCase() === 'occupied',
    }
  },

  // Fetch room types (Executive Suite, Deluxe Ocean View, etc.)
  getRoomTypes: async (): Promise<RoomType[]> => {
    const response = await apiClient.get<any>('/rooms/types/')
    const data = Array.isArray(response.data) ? response.data : ((response.data as { results?: any[]; data?: any[] })?.data || (response.data as { results?: any[]; data?: any[] })?.results || [])
    return data.map((rt: any) => ({
      id: rt.id,
      propertyId: rt.property || rt.propertyId || '',
      name: rt.name,
      code: rt.code,
      description: rt.description || '',
      baseOccupancy: rt.base_occupancy ?? rt.baseOccupancy ?? 2,
      maxOccupancy: rt.max_occupancy ?? rt.maxOccupancy ?? 4,
      basePrice: Number(rt.base_price ?? rt.basePrice ?? 250),
      amenities: Array.isArray(rt.amenities) ? rt.amenities.map((a: any) => typeof a === 'string' ? a : a.name) : [],
      bedType: rt.bed_type || rt.bedType || 'King',
      images: rt.images || [],
    }))
  },

  // Create a new room type / category
  createRoomType: async (payload: {
    name: string
    code?: string
    basePrice: number
    maxOccupancy?: number
    baseOccupancy?: number
    description?: string
    propertyId?: string
  }): Promise<RoomType> => {
    const response = await apiClient.post<any>('/rooms/types/', {
      name: payload.name,
      code: payload.code,
      base_price: payload.basePrice,
      max_occupancy: payload.maxOccupancy || 4,
      base_occupancy: payload.baseOccupancy || 2,
      description: payload.description || '',
      property: payload.propertyId,
    })
    const rt = response.data
    return {
      id: rt.id,
      propertyId: rt.property || rt.propertyId || '',
      name: rt.name,
      code: rt.code,
      description: rt.description || '',
      baseOccupancy: rt.base_occupancy ?? rt.baseOccupancy ?? 2,
      maxOccupancy: rt.max_occupancy ?? rt.maxOccupancy ?? 4,
      basePrice: Number(rt.base_price ?? rt.basePrice ?? payload.basePrice),
      amenities: [],
      bedType: 'King',
      images: [],
    }
  },

  // Update room type
  updateRoomType: async (id: string, payload: Partial<RoomType> & { base_price?: number; max_occupancy?: number }): Promise<RoomType> => {
    const response = await apiClient.patch<any>(`/rooms/types/${id}/`, {
      ...payload,
      base_price: payload.basePrice !== undefined ? payload.basePrice : payload.base_price,
      max_occupancy: payload.maxOccupancy !== undefined ? payload.maxOccupancy : payload.max_occupancy,
    })
    const rt = response.data
    return {
      id: rt.id,
      propertyId: rt.property || rt.propertyId || '',
      name: rt.name,
      code: rt.code,
      description: rt.description || '',
      baseOccupancy: rt.base_occupancy ?? rt.baseOccupancy ?? 2,
      maxOccupancy: rt.max_occupancy ?? rt.maxOccupancy ?? 4,
      basePrice: Number(rt.base_price ?? rt.basePrice ?? 250),
      amenities: [],
      bedType: 'King',
      images: [],
    }
  },

  // Delete room type
  deleteRoomType: async (id: string): Promise<void> => {
    await apiClient.delete(`/rooms/types/${id}/`)
  },

  // Fetch room amenities
  getAmenities: async (): Promise<{ id: string; name: string; icon?: string; description?: string }[]> => {
    const response = await apiClient.get<any>('/rooms/amenities/')
    const data = Array.isArray(response.data) ? response.data : ((response.data as any)?.data || (response.data as any)?.results || [])
    return data
  },

  // Create room amenity
  createAmenity: async (data: { name: string; icon?: string; description?: string }): Promise<{ id: string; name: string; icon?: string; description?: string }> => {
    const response = await apiClient.post<any>('/rooms/amenities/', data)
    return response.data
  },

  // Delete room amenity
  deleteAmenity: async (id: string): Promise<void> => {
    await apiClient.delete(`/rooms/amenities/${id}/`)
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
