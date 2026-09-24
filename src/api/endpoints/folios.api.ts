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

const normalizeFolio = (f: any): Folio => {
  const charges: FolioCharge[] = (f.charge_events || f.charges || []).map((c: any) => ({
    id: c.id || c.event_id || `ch-${Date.now()}`,
    folioId: c.folio || f.id,
    category: (c.source || c.category || 'room').toLowerCase().replace('pos_', ''),
    outletName: c.outlet_code || c.outletName || 'Front Desk',
    description: c.description || 'Service Charge',
    quantity: c.quantity || 1,
    unitPrice: Number(c.amount || c.unitPrice || 0),
    taxAmount: Number(c.tax_amount || c.taxAmount || 0),
    totalAmount: Number(c.total_amount || c.totalAmount || c.amount || 0),
    postedAt: c.created_at || c.postedAt || new Date().toISOString(),
    postedBy: c.posted_by_name || c.postedBy || 'System',
    isVoided: c.status === 'VOIDED' || c.isVoided || false,
    voidReason: c.void_reason || c.voidReason,
    referenceId: c.event_id || c.referenceId,
  }))

  const payments: FolioPayment[] = (f.payments || []).map((p: any) => ({
    id: p.id || p.transaction_id || `pay-${Date.now()}`,
    folioId: p.folio || f.id,
    paymentMethod: (p.payment_method || p.paymentMethod || 'credit_card').toLowerCase(),
    amount: Number(p.amount || 0),
    transactionReference: p.transaction_id || p.transactionReference || 'TXN-DIRECT',
    timestamp: p.paid_at || p.timestamp || new Date().toISOString(),
    processedBy: p.recorded_by_name || p.processedBy || 'Front Desk',
    status: (p.status || 'settled').toLowerCase() === 'paid' ? 'settled' : (p.status || 'settled').toLowerCase(),
  }))

  const totalCharges = Number(f.total_charges || f.totalAmount || 0)
  const totalPaid = Number(f.total_payments || f.totalPaid || 0)
  const balanceDue = Number(f.balance !== undefined ? f.balance : (f.balanceDue !== undefined ? f.balanceDue : totalCharges - totalPaid))

  return {
    id: f.id,
    reservationId: f.reservation || f.reservationId || '',
    reservationCode: f.reservation_code || f.reservationCode || f.folio_number || '',
    propertyId: f.property || f.propertyId || '',
    guestName: f.guest_name || f.guestName || 'Valued Guest',
    roomNumber: f.room_number || f.roomNumber || '501',
    charges,
    payments,
    subtotal: totalCharges * 0.9,
    totalTax: totalCharges * 0.1,
    totalAmount: totalCharges,
    totalPaid,
    balanceDue,
    status: (f.status || 'open').toLowerCase() as any,
  }
}

export const foliosApi = {
  // Get all folios for the active property
  getFolios: async (params?: { roomNumber?: string; status?: string; search?: string } | 'open' | 'closed' | 'voided'): Promise<Folio[]> => {
    const queryParams = typeof params === 'string' ? { status: params.toUpperCase() } : params
    const response = await apiClient.get<any>('/folios/', {
      params: queryParams,
    })
    const list = Array.isArray(response.data) ? response.data : (response.data?.data || response.data?.results || [])
    return list.map(normalizeFolio)
  },

  // Get single folio with line charges and payments
  getFolioById: async (folioId: string): Promise<Folio> => {
    const response = await apiClient.get<any>(`/folios/${folioId}/`)
    return normalizeFolio(response.data)
  },

  // Alias for getFolioById
  getFolioDetails: async (id: string): Promise<Folio> => {
    const response = await apiClient.get<any>(`/folios/${id}/`)
    return normalizeFolio(response.data)
  },

  // Post a line charge to a folio
  postCharge: async (
    folioId: string,
    payload: { department: string; description: string; amount: number; taxRate?: number; referenceNumber?: string }
  ): Promise<FolioCharge> => {
    const response = await apiClient.post<any>(`/folios/${folioId}/charges/`, {
      source: payload.department.toUpperCase(),
      description: payload.description,
      amount: payload.amount,
      tax_amount: payload.taxRate ? payload.amount * payload.taxRate : 0,
      outlet_code: payload.referenceNumber || '',
    })
    const item = response.data?.charge_event || response.data
    return {
      id: item.id || item.event_id,
      folioId,
      category: (payload.department === 'bar' ? 'restaurant' : payload.department) as any,
      outletName: item.outlet_code || 'Front Desk',
      description: item.description,
      quantity: 1,
      unitPrice: Number(item.amount),
      taxAmount: Number(item.tax_amount || 0),
      totalAmount: Number(item.total_amount || item.amount),
      postedAt: item.created_at || new Date().toISOString(),
      postedBy: 'Front Desk',
      isVoided: false,
    }
  },

  // Void a charge (requires mandatory audit reason)
  voidCharge: async (
    folioId: string,
    chargeId: string,
    reason: string
  ): Promise<{ message: string; voidedCharge: FolioCharge }> => {
    const response = await apiClient.post<any>(
      `/folios/${folioId}/charges/${chargeId}/void/`,
      { reason }
    )
    const item = response.data?.voidedCharge || response.data?.charge_event || {}
    return {
      message: response.data?.message || 'Charge voided',
      voidedCharge: {
        id: item.id || chargeId,
        folioId,
        category: 'other',
        outletName: 'System',
        description: item.description || 'Voided item',
        quantity: 1,
        unitPrice: Number(item.amount || 0),
        taxAmount: 0,
        totalAmount: Number(item.total_amount || item.amount || 0),
        postedAt: item.created_at || new Date().toISOString(),
        postedBy: 'Front Desk',
        isVoided: true,
        voidReason: reason,
      },
    }
  },

  // Record settlement payment
  settlePayment: async (
    folioId: string,
    payload: { amount: number; paymentMethod?: string; method?: string; transactionReference?: string }
  ): Promise<FolioPayment> => {
    const method = (payload.paymentMethod || payload.method || 'credit_card').toUpperCase()
    const response = await apiClient.post<any>(`/folios/${folioId}/payments/`, {
      amount: payload.amount,
      method,
      paymentMethod: method,
      transactionReference: payload.transactionReference || `TXN-${Date.now()}`,
    })
    return {
      id: response.data?.payment_id || `pay-${Date.now()}`,
      folioId,
      paymentMethod: (payload.paymentMethod || payload.method || 'credit_card') as any,
      amount: payload.amount,
      transactionReference: payload.transactionReference || `TXN-${Date.now()}`,
      timestamp: new Date().toISOString(),
      processedBy: 'Front Desk',
      status: 'settled',
    }
  },

  // Tax Invoice PDF streaming download
  downloadInvoicePdf: async (id: string, filename = `Folio-${id}.pdf`): Promise<void> => {
    const res = await apiClient.get<any>(`/folios/${id}/invoice-pdf/`, { responseType: 'blob' })
    const blobData = res && (res as any).data instanceof Blob ? (res as any).data : (res as any)
    const url = window.URL.createObjectURL(blobData instanceof Blob ? blobData : new Blob([blobData], { type: 'application/pdf' }))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
  },

  // Daily Night Audit ledger closing
  runNightAudit: async (): Promise<any> => {
    const response = await apiClient.post<any>('/folios/night-audit/')
    return response.data
  },

  // General Ledger CSV Export (Bridges FinanceHub "Export GL CSV" button)
  exportGeneralLedgerCsv: async (): Promise<void> => {
    const res = await apiClient.get<any>('/finance/gl-export/', { responseType: 'blob' })
    const blobData = res && (res as any).data instanceof Blob ? (res as any).data : (res as any)
    const url = window.URL.createObjectURL(blobData instanceof Blob ? blobData : new Blob([blobData], { type: 'text/csv' }))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `GL-Export-${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  },

  // Close and archive folio
  closeFolio: async (folioId: string): Promise<Folio> => {
    const response = await apiClient.post<any>(`/folios/${folioId}/close/`)
    return normalizeFolio(response.data)
  },
}
