import React, { createContext, useState, useEffect, useCallback } from 'react'
import { Organization, Property } from '@/types'
import { useQueryClient } from '@tanstack/react-query'

export const DEMO_ORGANIZATION: Organization = {
  id: 'org-001',
  name: 'Grand Horizon Hospitality Group',
  code: 'GHHG',
  currency: 'USD',
  taxIdNumber: 'TAX-US-892184',
  createdAt: '2024-01-15',
}

export const DEMO_PROPERTIES: Property[] = [
  {
    id: 'prop-001',
    organizationId: 'org-001',
    name: 'Grand Horizon Palace & Spa',
    code: 'GHP-NY',
    type: 'luxury_villas',
    address: '742 Evergreen Promenade',
    city: 'New York',
    state: 'NY',
    country: 'United States',
    postalCode: '10001',
    phone: '+1 (212) 555-0199',
    email: 'palace@omnihospitality.com',
    checkInTime: '15:00',
    checkOutTime: '11:00',
    totalRooms: 120,
    activeRooms: 114,
    rating: 4.9,
    bannerImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    status: 'active',
  },
  {
    id: 'prop-002',
    organizationId: 'org-001',
    name: 'Azure Bay Ocean Resort',
    code: 'ABOR-MIA',
    type: 'resort',
    address: '10 Oceanfront Avenue',
    city: 'Miami Beach',
    state: 'FL',
    country: 'United States',
    postalCode: '33139',
    phone: '+1 (305) 555-0144',
    email: 'azurebay@omnihospitality.com',
    checkInTime: '16:00',
    checkOutTime: '11:00',
    totalRooms: 180,
    activeRooms: 175,
    rating: 4.8,
    bannerImage: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
    status: 'active',
  },
  {
    id: 'prop-003',
    organizationId: 'org-001',
    name: 'Alpine Crest Chalets',
    code: 'ACC-ASP',
    type: 'boutique',
    address: '45 Glacier Peak Trail',
    city: 'Aspen',
    state: 'CO',
    country: 'United States',
    postalCode: '81611',
    phone: '+1 (970) 555-0188',
    email: 'alpinecrest@omnihospitality.com',
    checkInTime: '15:00',
    checkOutTime: '10:00',
    totalRooms: 45,
    activeRooms: 42,
    rating: 4.95,
    bannerImage: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
    status: 'active',
  },
]

interface TenantContextType {
  activeOrg: Organization
  activeProperty: Property
  propertiesList: Property[]
  setActivePropertyById: (propertyId: string) => void
}

export const TenantContext = createContext<TenantContextType | undefined>(undefined)

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient()
  const [activeOrg] = useState<Organization>(DEMO_ORGANIZATION)
  const [propertiesList] = useState<Property[]>(DEMO_PROPERTIES)

  const [activeProperty, setActiveProperty] = useState<Property>(() => {
    const savedPropId = localStorage.getItem('hms_active_property_id')
    const match = DEMO_PROPERTIES.find((p) => p.id === savedPropId)
    return match || DEMO_PROPERTIES[0]
  })

  useEffect(() => {
    localStorage.setItem('hms_active_org_id', activeOrg.id)
    localStorage.setItem('hms_active_property_id', activeProperty.id)
  }, [activeOrg, activeProperty])

  const setActivePropertyById = useCallback(
    (propertyId: string) => {
      const match = propertiesList.find((p) => p.id === propertyId)
      if (match) {
        setActiveProperty(match)
        localStorage.setItem('hms_active_property_id', match.id)
        // Invalidate all active queries to ensure stale data from previous property is purged
        queryClient.invalidateQueries()
      }
    },
    [propertiesList, queryClient]
  )

  return (
    <TenantContext.Provider
      value={{
        activeOrg,
        activeProperty,
        propertiesList,
        setActivePropertyById,
      }}
    >
      {children}
    </TenantContext.Provider>
  )
}
