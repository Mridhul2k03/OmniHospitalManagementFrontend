import { apiClient } from '@/api/client/axios'
import { ShareholderProfile, DividendDistribution, ShareholderFinancialReport } from '@/types'

export const shareholderApi = {
  // Get active shareholder's ownership profile and equity holdings
  getProfile: async (): Promise<ShareholderProfile> => {
    const response = await apiClient.get<ShareholderProfile>('/shareholder/profile/')
    return response.data
  },

  // Get historical dividend distribution ledger
  getDividends: async (): Promise<DividendDistribution[]> => {
    const response = await apiClient.get<DividendDistribution[]>('/shareholder/dividends/')
    return response.data
  },

  // Get certified periodic financial filings and audit reports
  getReports: async (): Promise<ShareholderFinancialReport[]> => {
    const response = await apiClient.get<ShareholderFinancialReport[]>('/shareholder/reports/')
    return response.data
  },

  // Download PDF statement link
  getStatementDownloadUrl: (statementId: string): string => {
    return `/api/v1/shareholder/statements/${statementId}/download/`
  },
}
