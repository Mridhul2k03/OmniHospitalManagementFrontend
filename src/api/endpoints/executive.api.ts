import { apiClient } from '@/api/client/axios'
import { ExecutiveKPIs, PropertyPerformance } from '@/types'

export const executiveApi = {
  // Get consolidated portfolio KPIs for corporate leadership
  getKPIs: async (period: 'today' | 'week' | 'month' | 'quarter' | 'year' = 'month'): Promise<ExecutiveKPIs> => {
    const response = await apiClient.get<ExecutiveKPIs>('/executive/kpis/', {
      params: { period },
    })
    return response.data
  },

  // Get comparative performance breakdown across all organization properties
  getPropertyComparison: async (): Promise<PropertyPerformance[]> => {
    const response = await apiClient.get<PropertyPerformance[]>('/executive/property-comparison/')
    return response.data
  },

  // Real-time occupancy pacing trends
  getOccupancyTrends: async (months: number = 6): Promise<Array<{ month: string; palace: number; azure: number; alpine: number }>> => {
    const response = await apiClient.get<any>('/executive/occupancy-trend/', { params: { months } })
    return Array.isArray(response.data) ? response.data : (response.data?.data || response.data?.results || [])
  },

  // Get revenue mix and departmental contributions
  getRevenueMix: async (): Promise<Array<{ category: string; amount: number; percentage: number }>> => {
    const response = await apiClient.get<Array<{ category: string; amount: number; percentage: number }>>(
      '/executive/revenue-mix/'
    )
    return response.data
  },

  // Generates and downloads the certified Executive Board Pack PDF
  exportBoardPackPdf: async (): Promise<void> => {
    const res = await apiClient.get<any>('/executive/export-board-pack/', { responseType: 'blob' })
    const blobData = res && (res as any).data instanceof Blob ? (res as any).data : (res as any)
    const url = window.URL.createObjectURL(blobData instanceof Blob ? blobData : new Blob([blobData], { type: 'application/pdf' }))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Executive-Board-Pack-${new Date().toISOString().split('T')[0]}.pdf`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  },
}
