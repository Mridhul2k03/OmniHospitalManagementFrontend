import { describe, it, expect, beforeEach } from 'vitest'
import { apiClient } from '@/api/client/axios'
import { QUERY_KEYS } from '@/api/endpoints'

describe('Tenant & Multi-Property Isolation Engine', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('injects active property and organization headers into outgoing API requests', async () => {
    const testOrgId = 'org-luxury-hospitality-group'
    const testPropId = 'prop-grand-horizon-ny'

    localStorage.setItem('hms_active_org_id', testOrgId)
    localStorage.setItem('hms_active_property_id', testPropId)
    localStorage.setItem('hms_access_token', 'test-jwt-access-token')

    // Simulate request interceptor
    const dummyConfig = { headers: {} as Record<string, string> }
    const interceptor = (apiClient.interceptors.request as any).handlers[0].fulfilled
    const resultConfig = interceptor(dummyConfig)

    expect(resultConfig.headers['X-Organization-ID']).toBe(testOrgId)
    expect(resultConfig.headers['X-Property-ID']).toBe(testPropId)
    expect(resultConfig.headers.Authorization).toBe('Bearer test-jwt-access-token')
  })

  it('generates property-scoped query cache keys to prevent cross-property data leakage', () => {
    const prop1 = 'prop-palace-ny'
    const prop2 = 'prop-resort-mia'

    const roomsKey1 = QUERY_KEYS.rooms(prop1, { status: 'occupied' })
    const roomsKey2 = QUERY_KEYS.rooms(prop2, { status: 'occupied' })

    expect(roomsKey1).not.toEqual(roomsKey2)
    expect(roomsKey1[1]).toBe(prop1)
    expect(roomsKey2[1]).toBe(prop2)
  })

  it('manages active tenant context via Recipe D helpers and injects X-Tenant-ID', () => {
    // 1. Set active tenant
    ;(apiClient as any).setActiveTenantId('tenant-uuid-456', 'grand-alpine')
    expect((apiClient as any).getActiveTenantId()).toBe('tenant-uuid-456')

    // 2. Verify X-Tenant-ID injected into headers
    const dummyConfig = { headers: {} as Record<string, string> }
    const interceptor = (apiClient.interceptors.request as any).handlers[0].fulfilled
    const resultConfig = interceptor(dummyConfig)

    expect(resultConfig.headers['X-Tenant-ID']).toBe('grand-alpine')

    // 3. Clear active tenant
    ;(apiClient as any).clearActiveTenantId()
    expect((apiClient as any).getActiveTenantId()).toBeNull()
  })
})
