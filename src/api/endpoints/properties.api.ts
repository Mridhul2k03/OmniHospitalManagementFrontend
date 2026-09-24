import { apiClient } from '@/api/client/axios'
import { Property, Building, Floor } from '@/types'

export const propertiesApi = {
  // Fetch all accessible properties for the active tenant organization
  getProperties: async (): Promise<Property[]> => {
    const response = await apiClient.get<any>('/properties/')
    return Array.isArray(response.data) ? response.data : (response.data?.data || response.data?.results || [])
  },

  // Fetch detailed information for a single property
  getPropertyById: async (propertyId: string): Promise<Property> => {
    const response = await apiClient.get<Property>(`/properties/${propertyId}/`)
    return response.data
  },

  // Fetch all buildings associated with a property or all accessible buildings
  getBuildings: async (propertyId?: string): Promise<Building[]> => {
    const url = propertyId ? `/properties/${propertyId}/buildings/` : '/buildings/'
    const response = await apiClient.get<any>(url)
    return Array.isArray(response.data) ? response.data : (response.data?.data || response.data?.results || [])
  },

  // Create a new building
  createBuilding: async (data: { name: string; code?: string; property?: string }): Promise<Building> => {
    const response = await apiClient.post<Building>('/buildings/', data)
    return response.data
  },

  // Update building details
  updateBuilding: async (buildingId: string, data: Partial<Building>): Promise<Building> => {
    const response = await apiClient.patch<Building>(`/buildings/${buildingId}/`, data)
    return response.data
  },

  // Delete building
  deleteBuilding: async (buildingId: string): Promise<void> => {
    await apiClient.delete(`/buildings/${buildingId}/`)
  },

  // Fetch all floors (globally or within a specific building)
  getFloors: async (buildingId?: string): Promise<Floor[]> => {
    const url = buildingId ? `/buildings/${buildingId}/floors/` : '/floors/'
    const response = await apiClient.get<any>(url)
    const data = Array.isArray(response.data) ? response.data : (response.data?.data || response.data?.results || [])
    return data.map((f: any) => {
      const num = f.floor_number ?? f.number ?? f.floorNumber ?? 1
      return {
        id: f.id,
        buildingId: f.building || f.buildingId || '',
        buildingName: f.building_name || f.buildingName || 'Main Building',
        number: num,
        floorNumber: num,
        name: f.name || `Floor ${num}`,
      }
    })
  },

  // Create a new floor level
  createFloor: async (data: { floor_number: number; name: string; building?: string }): Promise<Floor> => {
    const response = await apiClient.post<any>('/floors/', data)
    const f = response.data
    const num = f.floor_number ?? f.number ?? f.floorNumber ?? data.floor_number
    return {
      id: f.id,
      buildingId: f.building || f.buildingId || '',
      buildingName: f.building_name || f.buildingName || 'Main Building',
      number: num,
      floorNumber: num,
      name: f.name || data.name,
    }
  },

  // Update floor level
  updateFloor: async (floorId: string, data: Partial<{ floor_number: number; name: string; building?: string }>): Promise<Floor> => {
    const response = await apiClient.patch<any>(`/floors/${floorId}/`, data)
    const f = response.data
    const num = f.floor_number ?? f.number ?? f.floorNumber ?? 1
    return {
      id: f.id,
      buildingId: f.building || f.buildingId || '',
      buildingName: f.building_name || f.buildingName || 'Main Building',
      number: num,
      floorNumber: num,
      name: f.name,
    }
  },

  // Delete floor
  deleteFloor: async (floorId: string): Promise<void> => {
    await apiClient.delete(`/floors/${floorId}/`)
  },

  // Update property settings and operational parameters
  updateProperty: async (propertyId: string, data: Partial<Property>): Promise<Property> => {
    const response = await apiClient.patch<Property>(`/properties/${propertyId}/`, data)
    return response.data
  },
}
