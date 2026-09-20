import React, { Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from '@/app/layouts/AppShell'
import { AuthLayout } from '@/app/layouts/AuthLayout'
import { KDSLayout } from '@/app/layouts/KDSLayout'
import { ShareholderLayout } from '@/app/layouts/ShareholderLayout'
import { RequireAuth } from '@/auth/guards/RequireAuth'
import { RouteLoader } from '@/components/ui/route-loader'

// Code-split dynamic route imports
const LoginView = React.lazy(() => import('@/features/auth/LoginView').then(m => ({ default: m.LoginView })))
const AccessDeniedView = React.lazy(() => import('@/features/auth/AccessDeniedView').then(m => ({ default: m.AccessDeniedView })))
const FrontDeskHub = React.lazy(() => import('@/features/frontdesk/FrontDeskHub').then(m => ({ default: m.FrontDeskHub })))
const RoomBoardView = React.lazy(() => import('@/features/rooms/RoomBoardView').then(m => ({ default: m.RoomBoardView })))
const ReservationsHub = React.lazy(() => import('@/features/reservations/ReservationsHub').then(m => ({ default: m.ReservationsHub })))
const DigitalCheckInView = React.lazy(() => import('@/features/reservations/DigitalCheckInView').then(m => ({ default: m.DigitalCheckInView })))
const FoliosHub = React.lazy(() => import('@/features/folio/FoliosHub').then(m => ({ default: m.FoliosHub })))
const KitchenDisplaySystem = React.lazy(() => import('@/features/kitchen/KitchenDisplaySystem').then(m => ({ default: m.KitchenDisplaySystem })))
const RestaurantPOS = React.lazy(() => import('@/features/restaurant/RestaurantPOS').then(m => ({ default: m.RestaurantPOS })))
const HousekeepingHub = React.lazy(() => import('@/features/housekeeping/HousekeepingHub').then(m => ({ default: m.HousekeepingHub })))
const MaintenanceHub = React.lazy(() => import('@/features/maintenance/MaintenanceHub').then(m => ({ default: m.MaintenanceHub })))
const EventsHub = React.lazy(() => import('@/features/events/EventsHub').then(m => ({ default: m.EventsHub })))
const SpaHub = React.lazy(() => import('@/features/spa/SpaHub').then(m => ({ default: m.SpaHub })))
const FinanceHub = React.lazy(() => import('@/features/finance/FinanceHub').then(m => ({ default: m.FinanceHub })))
const InventoryHub = React.lazy(() => import('@/features/inventory/InventoryHub').then(m => ({ default: m.InventoryHub })))
const TransportHub = React.lazy(() => import('@/features/transport/TransportHub').then(m => ({ default: m.TransportHub })))
const SecurityGateHub = React.lazy(() => import('@/features/security/SecurityGateHub').then(m => ({ default: m.SecurityGateHub })))
const CloakroomHub = React.lazy(() => import('@/features/cloakroom/CloakroomHub').then(m => ({ default: m.CloakroomHub })))
const DynamicPricingHub = React.lazy(() => import('@/features/pricing/DynamicPricingHub').then(m => ({ default: m.DynamicPricingHub })))
const ChannelsHub = React.lazy(() => import('@/features/channels/ChannelsHub').then(m => ({ default: m.ChannelsHub })))
const ExecutiveDashboard = React.lazy(() => import('@/features/corporate/ExecutiveDashboard').then(m => ({ default: m.ExecutiveDashboard })))
const ShareholderPortal = React.lazy(() => import('@/features/shareholder/ShareholderPortal').then(m => ({ default: m.ShareholderPortal })))
const HRHub = React.lazy(() => import('@/features/hr/HRHub').then(m => ({ default: m.HRHub })))
const LoyaltyHub = React.lazy(() => import('@/features/loyalty/LoyaltyHub').then(m => ({ default: m.LoyaltyHub })))
const SettingsHub = React.lazy(() => import('@/features/settings/SettingsHub').then(m => ({ default: m.SettingsHub })))
const StudentsHub = React.lazy(() => import('@/features/education/StudentsHub').then(m => ({ default: m.StudentsHub })))

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteLoader />}>
        <Routes>
          {/* Root Redirect */}
          <Route path="/" element={<Navigate to="/app/frontdesk" replace />} />

          {/* Auth Group */}
          <Route path="/auth" element={<AuthLayout />}>
            <Route path="login" element={<LoginView />} />
            <Route index element={<Navigate to="/auth/login" replace />} />
          </Route>

          {/* High-Contrast Fullscreen Kitchen Display System (KDS) */}
          <Route
            path="/app/kds"
            element={
              <RequireAuth>
                <KDSLayout />
              </RequireAuth>
            }
          >
            <Route index element={<KitchenDisplaySystem />} />
          </Route>

          {/* Dedicated Executive Read-Only Shareholder Portal */}
          <Route
            path="/app/shareholder"
            element={
              <RequireAuth>
                <ShareholderLayout />
              </RequireAuth>
            }
          >
            <Route index element={<ShareholderPortal />} />
          </Route>

          {/* Primary Enterprise Operational App Shell */}
          <Route
            path="/app"
            element={
              <RequireAuth>
                <AppShell />
              </RequireAuth>
            }
          >
            <Route path="frontdesk" element={<FrontDeskHub />} />
            <Route path="rooms" element={<RoomBoardView />} />
            <Route path="reservations" element={<ReservationsHub />} />
            <Route path="checkin" element={<DigitalCheckInView />} />
            <Route path="folios" element={<FoliosHub />} />
            <Route path="pos" element={<RestaurantPOS />} />
            <Route path="housekeeping" element={<HousekeepingHub />} />
            <Route path="maintenance" element={<MaintenanceHub />} />
            <Route path="events" element={<EventsHub />} />
            <Route path="spa" element={<SpaHub />} />
            <Route path="finance" element={<FinanceHub />} />
            <Route path="inventory" element={<InventoryHub />} />
            <Route path="transport" element={<TransportHub />} />
            <Route path="security" element={<SecurityGateHub />} />
            <Route path="cloakroom" element={<CloakroomHub />} />
            <Route path="pricing" element={<DynamicPricingHub />} />
            <Route path="channels" element={<ChannelsHub />} />
            <Route path="corporate" element={<ExecutiveDashboard />} />
            <Route path="hr" element={<HRHub />} />
            <Route path="students" element={<StudentsHub />} />
            <Route path="loyalty" element={<LoyaltyHub />} />
            <Route path="settings" element={<SettingsHub />} />
            <Route path="access-denied" element={<AccessDeniedView />} />
            <Route index element={<Navigate to="/app/frontdesk" replace />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/app/frontdesk" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
