import { apiClient } from '@/api/client/axios'
import { Folio, FolioCharge, FolioPayment } from '@/types'

export interface PostChargePayload {
  department: 'room' | 'restaurant' | 'bar' | 'spa' | 'laundry' | 'transport' | 'banquet' | 'minibar'
  description: string
  amount: number
  taxRate?: number
  referenceNumber?: string
}

export interface SettlePaymentPayload {
  amount: number
  method: 'credit_card' | 'debit_card' | 'cash' | 'bank_transfer' | 'direct_bill' | 'points'
  transactionReference?: string
}

export const foliosApi = {
  // Get all folios for the active property
  getFolios: async (status?: 'open' | 'closed' | 'voided'): Promise<Folio[]> => {
    const response = await apiClient.get<Folio[]>('/folios/', {
      params: status ? { status } : undefined,
    })
    return response.data
  },

  // Get single folio with line charges and payments
  getFolioById: async (folioId: string): Promise<Folio> => {
    const response = await apiClient.get<Folio>(`/folios/${folioId}/`)
    return response.data
  },

  // Post a line charge to a folio
  postCharge: async (folioId: string, payload: PostChargePayload): Promise<FolioCharge> => {
    const response = await apiClient.post<FolioCharge>(`/folios/${folioId}/charges/`, payload)
    return response.data
  },

  // Void a charge (requires mandatory audit reason)
  voidCharge: async (
    folioId: string,
    chargeId: string,
    reason: string
  ): Promise<{ message: string; voidedCharge: FolioCharge }> => {
    const response = await apiClient.post<{ message: string; voidedCharge: FolioCharge }>(
      `/folios/${folioId}/charges/${chargeId}/void/`,
      { reason }
    )
    return response.data
  },

  // Record settlement payment
  settlePayment: async (folioId: string, payload: SettlePaymentPayload): Promise<FolioPayment> => {
    const response = await apiClient.post<FolioPayment>(`/folios/${folioId}/payments/`, payload)
    return response.data
  },

  // Close and archive folio
  closeFolio: async (folioId: string): Promise<Folio> => {
    const response = await apiClient.post<Folio>(`/folios/${folioId}/close/`)
    return response.data
  },
}
