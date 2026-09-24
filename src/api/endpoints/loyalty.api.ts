import { apiClient } from '@/api/client/axios'

export interface LoyaltyTierSummary {
  silverCount: number
  goldCount: number
  platinumCount: number
  npsScore: number
  averageRating: number
  totalReviews: number
}

export interface LoyaltyMember {
  id: string
  name: string
  tier: 'silver' | 'gold' | 'platinum'
  points: number
  staysCount: number
  email: string
  phone?: string
}

export interface GuestReview {
  id: string
  name: string
  rating: number
  room: string
  comment: string
  date: string
  status: 'pending' | 'responded'
  response?: string
}

export const loyaltyApi = {
  // Member tiers summary (Silver, Gold, Platinum counts, NPS)
  getTierSummary: async (): Promise<LoyaltyTierSummary> => {
    const response = await apiClient.get<LoyaltyTierSummary>('/loyalty/tiers/')
    return response.data
  },

  // Loyalty members ledger
  getMembers: async (): Promise<LoyaltyMember[]> => {
    const response = await apiClient.get<any>('/loyalty/members/')
    return Array.isArray(response.data) ? response.data : (response.data?.data || response.data?.results || [])
  },

  // Verified guest reviews & sentiment
  getGuestReviews: async (): Promise<GuestReview[]> => {
    const response = await apiClient.get<any>('/loyalty/reviews/')
    return Array.isArray(response.data) ? response.data : (response.data?.data || response.data?.results || [])
  },

  // Respond to guest review
  respondToReview: async (reviewId: string, responseText: string): Promise<any> => {
    const response = await apiClient.post<any>(`/loyalty/reviews/${reviewId}/respond/`, { responseText })
    return response.data
  },

  // Create promo campaign
  createPromoCampaign: async (payload: { name: string; promoCode: string; discountPercentage: number }): Promise<any> => {
    const response = await apiClient.post<any>('/loyalty/campaigns/', payload)
    return response.data
  },
}
