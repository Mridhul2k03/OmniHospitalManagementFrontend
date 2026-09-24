import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { ENV } from '@/app/config/env'

export interface ApiErrorResponse {
  message: string
  code?: string
  errors?: Record<string, string[]> | unknown
  status: number
  meta?: Record<string, unknown>
}

// Generate unique Request ID for audit and distributed tracing
const generateRequestId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

export const apiClient = axios.create({
  baseURL: ENV.API_BASE_URL,
  withCredentials: true, // Crucial for sending & receiving HttpOnly cookies (access_token, refresh_token)
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

// Request Interceptor: Attach Tenant Scope, Request Tracing, and Bearer fallback
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (!config.headers) return config

    // Multi-Tenancy: Attach X-Tenant-ID header
    const activeTenantId = localStorage.getItem('omni_active_tenant_id')
    const activeTenantSlug = localStorage.getItem('omni_active_tenant_slug')
    const tenantId = activeTenantId || activeTenantSlug || import.meta.env.VITE_DEFAULT_TENANT_ID || 'oxford-crest'

    config.headers['X-Tenant-ID'] = tenantId

    // Distributed Audit Tracing: Attach unique X-Request-ID
    config.headers['X-Request-ID'] = generateRequestId()

    // Dual-Mode Auth: Attach Bearer JWT token if available in storage (e.g. mobile/script compatibility)
    const token = localStorage.getItem('omni_access_token') || localStorage.getItem('hms_access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Legacy context headers for backward compatibility
    const activeOrgId = localStorage.getItem('hms_active_org_id')
    const activePropertyId = localStorage.getItem('hms_active_property_id')
    if (activeOrgId) {
      config.headers['X-Organization-ID'] = activeOrgId
    }
    if (activePropertyId) {
      config.headers['X-Property-ID'] = activePropertyId
    }

    return config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor: Normalized DRF Envelope Handling & Cookie-Based Token Refresh
apiClient.interceptors.response.use(
  (response) => {
    // Binary file downloads (PDF, CSV) bypass envelope unpacking
    if (response.config.responseType === 'blob') {
      return response
    }

    // If backend returns the standard envelope { success: true, data: ..., meta: ... },
    // unpack data to response.data and attach metadata
    if (response.data && typeof response.data === 'object' && response.data.success === true && 'data' in response.data) {
      const originalMeta = response.data.meta
      const unpackedData = response.data.data
      
      // Preserve meta on response object and on array/object if extensible
      response.data = unpackedData
      if (response.data && typeof response.data === 'object') {
        try {
          Object.defineProperty(response.data, '_meta', {
            value: originalMeta,
            enumerable: false,
            writable: true,
            configurable: true,
          })
        } catch {
          // Ignore if data is frozen
        }
      }
    }
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined

    // Handle 401 Unauthorized Session Expiry & Attempt Cookie/Token Refresh
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // Don't retry refresh endpoint itself or login endpoint
      const isAuthEndpoint = originalRequest.url?.includes('/auth/login/') || originalRequest.url?.includes('/auth/refresh/')
      if (!isAuthEndpoint) {
        originalRequest._retry = true
        try {
          // Refresh via cookie or refresh token payload
          const refreshToken = localStorage.getItem('omni_refresh_token') || localStorage.getItem('hms_refresh_token')
          const payload = refreshToken ? { refresh: refreshToken } : {}

          const refreshRes = await axios.post(`${ENV.API_BASE_URL}/auth/refresh/`, payload, {
            withCredentials: true,
          })

          const newAccessToken = refreshRes.data?.data?.access || refreshRes.data?.access
          if (newAccessToken) {
            localStorage.setItem('omni_access_token', newAccessToken)
            localStorage.setItem('hms_access_token', newAccessToken)
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
            }
          }

          return apiClient(originalRequest)
        } catch {
          // Token refresh failed -> Clear session and broadcast event
          localStorage.removeItem('omni_access_token')
          localStorage.removeItem('omni_refresh_token')
          localStorage.removeItem('hms_access_token')
          localStorage.removeItem('hms_refresh_token')
          localStorage.removeItem('omni_auth_user')
          localStorage.removeItem('hms_auth_user')

          window.dispatchEvent(new Event('omni_session_expired'))
          window.dispatchEvent(new Event('hms_session_expired'))
        }
      }
    }

    // Normalize standard error response
    // DRF Envelope: { success: false, error: { code, message, details }, meta: { request_id } }
    const resData = error.response?.data as Record<string, unknown> | undefined
    const errorObj = resData?.error as Record<string, unknown> | undefined

    const normalizedError: ApiErrorResponse = {
      status: error.response?.status || 500,
      code: (errorObj?.code as string) || (resData?.code as string) || (resData?.detail as string) || 'API_ERROR',
      message:
        (errorObj?.message as string) ||
        (resData?.detail as string) ||
        (resData?.message as string) ||
        error.message ||
        'An unexpected server error occurred.',
      errors: (errorObj?.details as Record<string, string[]>) || (resData?.errors as Record<string, string[]>) || null,
      meta: (resData?.meta as Record<string, unknown>) || undefined,
    }

    return Promise.reject(normalizedError)
  }
)

/**
 * Tenant Context Management Helpers (Recipe D from Multi-Tenant SaaS Blueprint)
 */
export const getActiveTenantId = (): string | null => {
  return localStorage.getItem('omni_active_tenant_id') || localStorage.getItem('omni_active_tenant_slug')
}

export const setActiveTenantId = (tenantId: string, slug?: string): void => {
  localStorage.setItem('omni_active_tenant_id', tenantId)
  if (slug) {
    localStorage.setItem('omni_active_tenant_slug', slug)
  }
}

export const clearActiveTenantId = (): void => {
  localStorage.removeItem('omni_active_tenant_id')
  localStorage.removeItem('omni_active_tenant_slug')
}

// Attach helper methods directly to apiClient for Recipe D ergonomics
Object.assign(apiClient, {
  getActiveTenantId,
  setActiveTenantId,
  clearActiveTenantId,
})


