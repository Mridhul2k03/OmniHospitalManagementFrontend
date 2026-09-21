import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/auth/AuthContext'
import { TenantProvider } from '@/context/TenantContext'
import { ToastProvider } from '@/components/ui/toast'
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary'

import { SubscriptionProvider } from '@/context/SubscriptionContext'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 2, // 2 minutes
      retry: 1,
    },
  },
})

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TenantProvider>
            <ToastProvider>
              <SubscriptionProvider>{children}</SubscriptionProvider>
            </ToastProvider>
          </TenantProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
