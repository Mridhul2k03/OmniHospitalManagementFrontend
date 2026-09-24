import { apiClient } from '@/api/client/axios'

export interface PricingRule {
  id: string
  roomTypeName: string
  baseRate: number
  calculatedRate: number
  demandBand: 'low' | 'normal' | 'high' | 'surge'
  occupancyPace: string
  isManualOverride: boolean
  manualOverrideRate: number | null
}

export interface DemandBandResponse {
  currentBand: 'low' | 'normal' | 'high' | 'surge'
  occupancyPace: string
  surgeMultiplier: number
  recommendedRules?: PricingRule[]
}

export const dynamicPricingApi = {
  // Lists active automated rate rules
  getRules: async (): Promise<PricingRule[]> => {
    const response = await apiClient.get<any>('/pricing/rules/')
    const list = Array.isArray(response.data) ? response.data : (response.data?.data || response.data?.results || [])
    return list
  },

  // Real-time demand bands & surge recommendations
  getDemandBands: async (): Promise<DemandBandResponse> => {
    const response = await apiClient.get<DemandBandResponse>('/pricing/demand-bands/')
    return response.data
  },

  // Enforces authorized rate override
  setRateOverride: async (payload: { roomTypeId?: string; ruleId?: string; overrideRate: number; reason?: string }): Promise<any> => {
    const response = await apiClient.post<any>('/pricing/overrides/', payload)
    return response.data
  },

  // Revokes override back to automated algorithm
  revokeOverride: async (ruleId: string): Promise<any> => {
    const response = await apiClient.delete<any>(`/pricing/rules/${ruleId}/overrides/`)
    return response.data
  },
}
