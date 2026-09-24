import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { RequireRole } from '@/auth/guards/RequireRole'
import { AdminRoute } from '@/auth/guards/AdminRoute'
import { AuthContext } from '@/auth/AuthContext'
import { AuthenticatedUser } from '@/types'

const createMockUser = (role: AuthenticatedUser['role']): AuthenticatedUser => ({
  id: 'usr-test-1',
  email: 'test@omnihospitality.com',
  firstName: 'Test',
  lastName: 'User',
  role,
  organizationId: 'org-1',
  organizationName: 'Luxury Hospitality Group',
  propertyIds: ['prop-1'],
  permissions: ['view_dashboard'],
})

describe('Role-Based Route Guards', () => {
  const renderWithRole = (userRole: AuthenticatedUser['role']) => {
    const user = createMockUser(userRole)
    return render(
      <AuthContext.Provider
        value={{
          user,
          tokens: { access: 'mock-access', refresh: 'mock-refresh' },
          isAuthenticated: true,
          isLoading: false,
          login: async () => {},
          logout: () => {},
          switchRole: () => {},
          hasRole: (roles) => roles.includes(userRole),
          hasPermission: () => true,
        }}
      >
        <MemoryRouter initialEntries={['/app/frontdesk']}>
          <Routes>
            <Route
              path="/app/frontdesk"
              element={
                <RequireRole allowedRoles={['front_desk', 'property_manager']}>
                  <div>Protected Front Desk Hub Content</div>
                </RequireRole>
              }
            />
            <Route path="/app/access-denied" element={<div>Access Denied Page</div>} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    )
  }

  it('permits authorized roles to access protected operational screens', () => {
    renderWithRole('front_desk')
    expect(screen.getByText('Protected Front Desk Hub Content')).toBeInTheDocument()
  })

  it('redirects unauthorized roles (e.g. shareholder) to access-denied view', () => {
    renderWithRole('shareholder')
    expect(screen.queryByText('Protected Front Desk Hub Content')).not.toBeInTheDocument()
    expect(screen.getByText('Access Denied Page')).toBeInTheDocument()
  })
})

describe('SuperAdmin AdminRoute Guard (Blueprint Recipe E)', () => {
  const renderAdminRoute = (user: AuthenticatedUser | null) => {
    return render(
      <AuthContext.Provider
        value={{
          user,
          tokens: user ? { access: 'mock-access', refresh: 'mock-refresh' } : null,
          isAuthenticated: Boolean(user),
          isLoading: false,
          login: async () => {},
          logout: () => {},
          switchRole: () => {},
          hasRole: (roles) => Boolean(user && roles.includes(user.role)),
          hasPermission: () => true,
        }}
      >
        <MemoryRouter initialEntries={['/admin']}>
          <Routes>
            <Route path="/admin" element={<AdminRoute />}>
              <Route index element={<div>Platform SuperAdmin Console Content</div>} />
            </Route>
            <Route path="/auth/admin-login" element={<div>Admin Login Screen</div>} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    )
  }

  it('permits Platform SuperAdmin users to access the platform console', () => {
    const superAdmin = createMockUser('super_admin')
    renderAdminRoute(superAdmin)
    expect(screen.getByText('Platform SuperAdmin Console Content')).toBeInTheDocument()
  })

  it('denies regular tenant admin from accessing platform console', () => {
    const orgAdmin = createMockUser('org_admin')
    renderAdminRoute(orgAdmin)
    expect(screen.queryByText('Platform SuperAdmin Console Content')).not.toBeInTheDocument()
    expect(screen.getByText('Access Restricted — ILA Platform SuperAdmin Only')).toBeInTheDocument()
  })
})
