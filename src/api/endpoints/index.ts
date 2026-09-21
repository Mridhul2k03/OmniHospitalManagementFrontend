export * from './properties.api'
export * from './rooms.api'
export * from './reservations.api'
export * from './folios.api'
export * from './dining.api'
export * from './kot.api'
export * from './housekeeping.api'
export * from './maintenance.api'
export * from './transport.api'
export * from './shareholder.api'
export * from './executive.api'
export * from './auth.api'
export * from './educational.api'
export * from './superadmin.api'
export * from './operations.api'

// Canonical TanStack Query Cache Keys for reliable multi-tenant invalidation
export const QUERY_KEYS = {
  authMe: ['auth', 'me'] as const,
  tenants: ['auth', 'tenants'] as const,
  currentTenant: ['auth', 'currentTenant'] as const,
  students: (filters?: Record<string, unknown>) => ['students', filters] as const,
  student: (id: string) => ['students', id] as const,
  staff: (filters?: Record<string, unknown>) => ['staff', filters] as const,
  invoices: (filters?: Record<string, unknown>) => ['finance', 'invoices', filters] as const,
  announcements: ['communications', 'announcements'] as const,
  notifications: ['communications', 'notifications'] as const,
  auditLogs: (filters?: Record<string, unknown>) => ['audit', filters] as const,
  properties: ['properties'] as const,
  property: (id: string) => ['properties', id] as const,
  buildings: (propertyId: string) => ['properties', propertyId, 'buildings'] as const,
  floors: (buildingId: string) => ['buildings', buildingId, 'floors'] as const,
  rooms: (propertyId: string, filters?: Record<string, unknown>) =>
    ['properties', propertyId, 'rooms', filters] as const,
  roomTypes: (propertyId: string) => ['properties', propertyId, 'roomTypes'] as const,
  reservations: (propertyId: string, filters?: Record<string, unknown>) =>
    ['properties', propertyId, 'reservations', filters] as const,
  todayArrivals: (propertyId: string) => ['properties', propertyId, 'todayArrivals'] as const,
  todayDepartures: (propertyId: string) => ['properties', propertyId, 'todayDepartures'] as const,
  inHouseGuests: (propertyId: string) => ['properties', propertyId, 'inHouseGuests'] as const,
  folios: (propertyId: string) => ['properties', propertyId, 'folios'] as const,
  folio: (folioId: string) => ['folios', folioId] as const,
  diningTables: (propertyId: string) => ['properties', propertyId, 'diningTables'] as const,
  kotOrders: (propertyId: string, station?: string) =>
    ['properties', propertyId, 'kotOrders', station] as const,
  housekeepingTasks: (propertyId: string) => ['properties', propertyId, 'housekeepingTasks'] as const,
  maintenanceTickets: (propertyId: string) => ['properties', propertyId, 'maintenanceTickets'] as const,
  transportTrips: (propertyId: string) => ['properties', propertyId, 'transportTrips'] as const,
  shareholderProfile: ['shareholder', 'profile'] as const,
  shareholderDividends: ['shareholder', 'dividends'] as const,
  shareholderReports: ['shareholder', 'reports'] as const,
  executiveKPIs: ['executive', 'kpis'] as const,
  executiveProperties: ['executive', 'properties'] as const,
}
