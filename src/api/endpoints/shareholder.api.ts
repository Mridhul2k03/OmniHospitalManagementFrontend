import { apiClient } from '@/api/client/axios'
import { ShareholderProfile, DividendDistribution, ShareholderFinancialReport } from '@/types'

export interface AppraisedAsset {
  name: string
  loc: string
  keys: number
  val: string
  own: string
}

export interface FinancialFiling {
  id: string
  period: string
  date: string
  size: string
  filename?: string
}

export const shareholderApi = {
  // Shareholder equity profile
  getProfile: async (): Promise<ShareholderProfile> => {
    const response = await apiClient.get<ShareholderProfile>('/shareholder/profile/')
    return response.data
  },

  // Dividends history
  getDividends: async (): Promise<DividendDistribution[]> => {
    const response = await apiClient.get<DividendDistribution[]>('/shareholder/dividends/')
    return response.data
  },

  // Dividend voucher PDF download
  downloadVoucherPdf: async (dividendId: string): Promise<void> => {
    const res = await apiClient.get<any>(`/shareholder/dividends/${dividendId}/voucher-pdf/`, { responseType: 'blob' })
    const blobData = res && (res as any).data instanceof Blob ? (res as any).data : (res as any)
    const url = window.URL.createObjectURL(blobData instanceof Blob ? blobData : new Blob([blobData], { type: 'application/pdf' }))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Dividend-Voucher-${dividendId}.pdf`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  },

  // SEC / certified filings list
  getFinancialFilings: async (): Promise<FinancialFiling[]> => {
    try {
      const response = await apiClient.get<any>('/shareholder/financials/')
      return Array.isArray(response.data) ? response.data : (response.data?.data || response.data?.results || [])
    } catch {
      const response = await apiClient.get<any>('/shareholder/reports/')
      return Array.isArray(response.data) ? response.data : (response.data?.data || response.data?.results || [])
    }
  },

  // Certified periodic financial reports alias
  getReports: async (): Promise<ShareholderFinancialReport[]> => {
    const response = await apiClient.get<ShareholderFinancialReport[]>('/shareholder/reports/')
    return response.data
  },

  // Certified filing download
  downloadFilingPdf: async (filingId: string, filename: string): Promise<void> => {
    const res = await apiClient.get<any>(`/shareholder/financials/${filingId}/download/`, { responseType: 'blob' })
    const blobData = res && (res as any).data instanceof Blob ? (res as any).data : (res as any)
    const url = window.URL.createObjectURL(blobData instanceof Blob ? blobData : new Blob([blobData], { type: 'application/pdf' }))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename.endsWith('.pdf') ? filename : `${filename}.pdf`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  },

  // Appraised physical hotel assets
  getAppraisedAssets: async (): Promise<AppraisedAsset[]> => {
    const response = await apiClient.get<any>('/shareholder/assets/')
    return Array.isArray(response.data) ? response.data : (response.data?.data || response.data?.results || [])
  },

  // Download PDF statement link
  getStatementDownloadUrl: (statementId: string): string => {
    return `/api/v1/shareholder/statements/${statementId}/download/`
  },
}
