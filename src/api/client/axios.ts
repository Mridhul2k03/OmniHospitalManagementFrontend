import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { ENV } from '@/app/config/env'

export interface ApiErrorResponse {
  message: string
  code?: string
  errors?: Record<string, string[]>
  status: number
}

export const apiClient = axios.create({
  baseURL: ENV.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

// Request Interceptor: Attach Auth Token and Tenant Scope Headers
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Attach JWT Access Token
    const token = localStorage.getItem('hms_access_token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Attach Active Organization and Property Context Headers
    const activeOrgId = localStorage.getItem('hms_active_org_id')
    const activePropertyId = localStorage.getItem('hms_active_property_id')

    if (activeOrgId && config.headers) {
      config.headers['X-Organization-ID'] = activeOrgId
    }
    if (activePropertyId && config.headers) {
      config.headers['X-Property-ID'] = activePropertyId
    }

    return config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor: Normalized DRF Error Handling & Token Refresh Handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // Handle 401 Unauthorized Session Expiry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const refreshToken = localStorage.getItem('hms_refresh_token')

      if (refreshToken) {
        try {
          const res = await axios.post(`${ENV.API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          })
          const newAccessToken = res.data.access
          localStorage.setItem('hms_access_token', newAccessToken)

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
          }
          return apiClient(originalRequest)
        } catch {
          // Token refresh failed -> Clear session and redirect
          localStorage.removeItem('hms_access_token')
          localStorage.removeItem('hms_refresh_token')
          window.dispatchEvent(new Event('hms_session_expired'))
        }
      }
    }

    // Normalize DRF error response
    const data = error.response?.data as Record<string, unknown> | undefined
    const normalizedError: ApiErrorResponse = {
      status: error.response?.status || 500,
      message:
        (data?.detail as string) ||
        (data?.message as string) ||
        error.message ||
        'An unexpected server error occurred.',
      errors: data?.errors as Record<string, string[]> | undefined,
      code: (data?.code as string) || undefined,
    }

    return Promise.reject(normalizedError)
  }
)
