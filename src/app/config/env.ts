export const ENV = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  WS_BASE_URL: import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000/ws',
  APP_ENV: (import.meta.env.VITE_APP_ENV || 'development') as 'development' | 'staging' | 'production',
  MAPS_PUBLIC_KEY: import.meta.env.VITE_MAPS_PUBLIC_KEY || '',
  IS_PROD: import.meta.env.PROD,
  IS_DEV: import.meta.env.DEV,
} as const
