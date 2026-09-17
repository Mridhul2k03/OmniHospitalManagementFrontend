# Hospitality Management Operating System — Frontend Architecture

## 1. Architectural Philosophy
The OmniHospitality frontend is built on a **domain/feature-driven modular architecture** consuming the Django REST Framework (DRF) backend as the authoritative single source of truth.

```text
src/
├── app/
│   ├── router/          # Declarative AppRouter with role and auth route guards
│   ├── providers/       # Composed QueryClient, Auth, Tenant, Toast providers
│   ├── layouts/         # AppShell, ShareholderLayout, KDSLayout, AuthLayout
│   └── config/          # Environment configuration
├── api/
│   ├── client/          # Axios instance with JWT refresh & Tenant headers, WebSocket client
│   └── errors/          # DRF error normalizer
├── auth/                # AuthContext, useAuth, RequireAuth, RequireRole, RequirePermission
├── context/             # TenantContext (Organization & Active Property switching)
├── components/
│   ├── ui/              # Enterprise Design System tokens & base primitives
│   ├── feedback/        # Global React ErrorBoundary with recovery interface
│   └── navigation/      # Role-filtered Sidebar, Topbar, Breadcrumbs
├── features/            # Business feature domains
│   ├── corporate/       # President, CEO, VP, Operations Director Dashboards
│   ├── shareholder/     # Dedicated Read-Only Investor Relations Portal
│   ├── frontdesk/       # Operational arrivals, departures, room allocation, check-in
│   ├── rooms/           # Room Availability Matrix, interactive rack, state machine
│   ├── reservations/    # Master booking manifest, digital pre-arrival check-in
│   ├── folio/           # Unified master guest folios, categorized charges, settlements
│   ├── housekeeping/    # Room turnover task queue, hygiene checklists, lost & found
│   ├── maintenance/     # Work order tickets, SLA monitoring, parts allocation
│   ├── restaurant/      # Point of Sale, table floor layout, active checks, room posting
│   ├── kitchen/         # Kitchen Display System (KDS), real-time KOT queues, bump buttons
│   ├── events/          # Banquets, venues, group room blocks, event contracts
│   ├── spa/             # Lotus wellness appointments, therapist rosters, room billing
│   ├── finance/         # Cashier drawer balancing, ledger, automated night audit
│   ├── inventory/       # Central storehouse, par levels, automated purchase orders
│   ├── hr/              # Staff rosters, shifts, biometric web clock-in
│   ├── security/        # Perimeter gate console, visitor passes, vehicle logging
│   ├── cloakroom/       # Luggage tags, barcode receipts, vault storage, claim verification
│   ├── transport/       # Fleet dispatch board, limousine chauffeur bookings
│   ├── pricing/         # Dynamic pricing rules, surge demand bands, manual overrides
│   ├── channels/        # Two-way OTA distribution sync, parity monitor, error logs
│   ├── loyalty/         # Guest VIP tiers, points ledger, reputation review sentiment
│   └── settings/        # Property parameters, check-in/out policies, tax codes
└── types/               # Exhaustive domain types aligned with DRF backend contracts
```

## 2. Multi-Tenant Context Isolation
When an operator changes the active property via the Topbar:
1. `hms_active_property_id` is updated in `localStorage`.
2. The Axios request interceptor injects `X-Property-ID` and `X-Organization-ID` on all subsequent API calls.
3. TanStack Query cache is automatically purged and invalidated to prevent cross-property data bleed in the browser.

## 3. Authoritative Contract Boundary
- Pricing, taxes, folio balances, and state transitions are **strictly calculated by the backend**.
- The React frontend provides high-density, low-latency interaction, optimistic feedback where safe, and strict validation UX.
