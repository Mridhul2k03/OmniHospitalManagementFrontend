import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ShareholderPortal } from '@/features/shareholder/ShareholderPortal'
import { ToastProvider } from '@/components/ui/toast'
import { AuthContext } from '@/auth/AuthContext'
import { AuthenticatedUser } from '@/types'

const mockShareholderUser: AuthenticatedUser = {
  id: 'usr-shareholder-01',
  email: 'investor.alexander@horizongroup.com',
  firstName: 'Alexander',
  lastName: 'Vanderbilt',
  role: 'shareholder',
  organizationId: 'org-horizon-hospitality',
  organizationName: 'Grand Horizon Hospitality Group PLC',
  propertyIds: ['prop-horizon-ny', 'prop-azure-mia', 'prop-alpine-asp'],
  permissions: ['view_financial_reports', 'view_dividends', 'download_audited_statements'],
  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
}

describe('Shareholder Portal Read-Only Enforcement', () => {
  const renderPortal = () => {
    return render(
      <AuthContext.Provider
        value={{
          user: mockShareholderUser,
          tokens: { access: 'mock-access', refresh: 'mock-refresh' },
          isAuthenticated: true,
          isLoading: false,
          login: async () => {},
          logout: () => {},
          switchRole: () => {},
          hasRole: (roles) => roles.includes('shareholder'),
          hasPermission: () => true,
        }}
      >
        <ToastProvider>
          <ShareholderPortal />
        </ToastProvider>
      </AuthContext.Provider>
    )
  }

  it('renders certified shareholder equity and investor details', () => {
    renderPortal()

    expect(screen.getByText(/Alexander Vanderbilt/i)).toBeInTheDocument()
    expect(screen.getByText(/50,000 Shares/i)).toBeInTheDocument()
    expect(screen.getByText(/4.25% Class A Voting Stock/i)).toBeInTheDocument()
    expect(screen.getByText(/Certified Shareholder/i)).toBeInTheDocument()
  })

  it('strictly contains zero operational mutation controls', () => {
    renderPortal()

    // Ensure forbidden operational action buttons are strictly absent
    expect(screen.queryByText(/Check-In/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Check-Out/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Create Reservation/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Void Charge/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Transfer Room/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Override Rate/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Fire KOT/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Bump Order/i)).not.toBeInTheDocument()
  })
})
