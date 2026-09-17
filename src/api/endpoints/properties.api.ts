import { apiClient } from '@/api/client/axios'
import { Property, Building, Floor } from '@/types'

export const propertiesApi = {
  // Fetch all accessible properties for the active tenant organization
  getProperties: async (): Promise<Property[]> => {
    const response = await apiClient.get<Property[]>('/properties/')
    return response.data
  },

  // Fetch detailed information for a single property
  getPropertyById: async (propertyId: string): Promise<Property> => {
    const response = await apiClient.get<Property>(`/properties/${propertyId}/`)
    return response.data
  },

  // Fetch all buildings associated with a property
  getBuildings: async (propertyId: string): Promise<Building[]> => {
    const response = await apiClient.get<Building[]>(`/properties/${propertyId}/buildings/`)
    return response.data
  },

  // Fetch all floors within a building
  getFloors: async (buildingId: string): Promise<Floor[]> => {
    const response = await apiClient.get<Floor[]>(`/buildings/${buildingId}/floors/`)
    return response.data
  },

  // Update property settings and operational parameters
  updateProperty: async (propertyId: string, data: Partial<Property>): Promise<Property> => {
    const response = await apiClient.patch<Property>(`/properties/${propertyId}/`, data)
    return response.data
  },
}
