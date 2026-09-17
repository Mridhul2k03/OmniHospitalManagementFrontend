import { apiClient } from '@/api/client/axios'
import { ExecutiveKPIs, PropertyPerformance } from '@/types'

export const executiveApi = {
  // Get consolidated portfolio KPIs for corporate leadership
  getKPIs: async (period?: 'today' | 'week' | 'month' | 'quarter' | 'year'): Promise<ExecutiveKPIs> => {
    const response = await apiClient.get<ExecutiveKPIs>('/executive/kpis/', {
      params: period ? { period } : undefined,
    })
    return response.data
  },

  // Get comparative performance breakdown across all organization properties
  getPropertyComparison: async (): Promise<PropertyPerformance[]> => {
    const response = await apiClient.get<PropertyPerformance[]>('/executive/property-comparison/')
    return response.data
  },

  // Get revenue mix and departmental contributions
  getRevenueMix: async (): Promise<Array<{ category: string; amount: number; percentage: number }>> => {
    const response = await apiClient.get<Array<{ category: string; amount: number; percentage: number }>>(
      '/executive/revenue-mix/'
    )
    return response.data
  },
}
