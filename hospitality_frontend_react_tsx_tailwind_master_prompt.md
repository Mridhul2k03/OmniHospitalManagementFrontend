# Hospitality Management Operating System — React + TypeScript + Tailwind Frontend Master Prompt

## 0. Role and Mission

Act as a **principal frontend architect, senior React/TypeScript engineer, UX engineer, accessibility specialist, application-security reviewer, API integration engineer, and QA lead**.

Build the frontend for the hospitality operating system defined by these two supplied blueprints:

1. **Hospitality Management Ecosystem — Complete Product Blueprint**
2. **Hospitality Management — Corporate Enhanced Blueprint**

The frontend must support the complete hospitality lifecycle and enterprise hierarchy while consuming the Django REST Framework backend as the single source of truth.

Technology baseline:

```text
React
TypeScript
Vite
Tailwind CSS
REST API
WebSockets
```

The interface must support:
- corporate executives,
- shareholders,
- organization administration,
- property management,
- front desk,
- housekeeping,
- restaurant/POS,
- kitchen/KOT,
- maintenance,
- accounting/finance,
- HR,
- security/gate,
- transport,
- guests,
- future mobile clients.

---

# 1. NON-NEGOTIABLE OPERATING RULE

## Phase 0 must be an AUDIT ONLY

Before changing existing frontend code, inspect the repository and report findings.

**Do not modify anything during the initial audit.**

Act as a senior engineer preparing the frontend for handoff.

Audit:

### A. Version control
- Git status.
- real commit history.
- current branch.
- remotes.
- uncommitted/untracked changes.

### B. Duplicate / dead code
Find:
- duplicate components,
- repeated API calls,
- repeated hooks,
- duplicate tables,
- duplicate forms,
- repeated permission checks,
- copy-pasted layouts,
- repeated validation,
- redundant utility functions,
- stale screens,
- dead routes,
- unused dependencies,
- unreachable code,
- duplicated types/interfaces.

Report:
- file,
- symbol/component,
- location,
- issue,
- confidence,
- consolidation target.

### C. Hardcoded secrets
Search for:
- API keys,
- access tokens,
- provider credentials,
- hardcoded JWT secrets,
- private URLs containing credentials,
- payment keys,
- maps keys,
- messaging keys.

Never expose secret values in the report.

Frontend public configuration may contain intentionally public identifiers, but distinguish public client configuration from actual secrets.

### D. Documentation
Check:
- README,
- setup docs,
- environment variables,
- architecture docs,
- route documentation,
- API integration docs,
- build/deployment docs.

If missing, prepare a proposed documentation structure based on the actual code.

### E. Error tracking
Check:
- global React error boundary,
- API error handling,
- failed-query handling,
- WebSocket errors,
- unhandled promise rejection handling,
- production error monitoring,
- user-facing error states,
- telemetry/request IDs.

Determine whether a production error would be visible to the team.

### F. Access control
Audit every place one user could view another user's data.

Check:
- route guards,
- role guards,
- permission guards,
- organization/property scope,
- shareholder read-only behavior,
- guest ownership,
- finance access,
- documents,
- reports,
- WebSocket subscriptions,
- direct URL navigation,
- query parameters,
- hidden actions,
- cached data.

Critical rule:

**Frontend permission controls improve UX but are never the security boundary. The Django API is authoritative.**

### G. Frontend audit output
Return:
1. Executive summary.
2. Repository structure.
3. Git status.
4. Duplicate/dead-code findings.
5. Hardcoded secret findings.
6. Documentation gaps.
7. Error tracking status.
8. Access-control findings.
9. Routing assessment.
10. API-client assessment.
11. State-management assessment.
12. Type-safety assessment.
13. Accessibility assessment.
14. Performance assessment.
15. Technical debt.
16. Recommended implementation order.

Do not make changes until the audit has been reviewed/accepted.

---

# 2. FRONTEND ARCHITECTURE

Use a feature/domain-oriented architecture.

Recommended shape:

```text
src/
├── app/
│   ├── router/
│   ├── providers/
│   ├── layouts/
│   └── config/
├── api/
│   ├── client/
│   ├── endpoints/
│   ├── generated-types/
│   └── errors/
├── auth/
├── permissions/
├── components/
│   ├── ui/
│   ├── forms/
│   ├── tables/
│   ├── dialogs/
│   ├── charts/
│   └── feedback/
├── features/
│   ├── corporate/
│   ├── shareholders/
│   ├── organizations/
│   ├── properties/
│   ├── rooms/
│   ├── availability/
│   ├── reservations/
│   ├── guests/
│   ├── frontoffice/
│   ├── housekeeping/
│   ├── maintenance/
│   ├── restaurants/
│   ├── kitchen/
│   ├── events/
│   ├── services/
│   ├── spa/
│   ├── activities/
│   ├── billing/
│   ├── payments/
│   ├── finance/
│   ├── inventory/
│   ├── procurement/
│   ├── vendors/
│   ├── employees/
│   ├── attendance/
│   ├── crm/
│   ├── loyalty/
│   ├── reviews/
│   ├── marketing/
│   ├── pricing/
│   ├── channels/
│   ├── security/
│   ├── cloakroom/
│   ├── transport/
│   ├── reports/
│   ├── analytics/
│   └── notifications/
├── hooks/
├── lib/
├── types/
├── utils/
└── styles/
```

Keep business behavior close to its feature.

Avoid a giant `components/` folder containing all business logic.

---

# 3. PRODUCT EXPERIENCE MODEL

The core guest lifecycle is:

```text
Discover
→ Search
→ Availability
→ Booking
→ Payment
→ Pre-arrival
→ Check-in
→ Stay
→ Services
→ Checkout
→ Review
→ Loyalty
→ Rebooking
```

The business lifecycle is:

```text
Lead / Booking
→ Room Allocation
→ Operations
→ Service Consumption
→ Folio
→ Settlement
→ Accounting
→ Analytics
```

Design screens around these workflows rather than isolated CRUD pages.

---

# 4. DESIGN SYSTEM

Use Tailwind CSS with a consistent enterprise hospitality design system.

Create reusable tokens/components for:
- typography,
- spacing,
- cards,
- tables,
- forms,
- buttons,
- badges,
- alerts,
- dropdowns,
- tabs,
- modals,
- drawers,
- date pickers,
- command/search interfaces,
- charts,
- breadcrumbs,
- pagination,
- empty states,
- skeleton loaders,
- confirmation dialogs,
- status indicators.

Status values must visually distinguish states consistently.

Do not scatter arbitrary Tailwind combinations everywhere.

Create reusable UI components for repeated patterns.

---

# 5. RESPONSIVE LAYOUT

The application is primarily a desktop enterprise system, but must remain usable on tablets and smaller screens.

Provide:
- responsive sidebar,
- top navigation,
- property/organization context selector,
- global search,
- notification center,
- user menu,
- breadcrumb,
- responsive tables,
- mobile-friendly dialogs/drawers.

Operational screens such as:
- front desk,
- KOT,
- housekeeping,
- security,
- transport,
should prioritize speed and high information density.

Guest-facing flows should prioritize simplicity.

---

# 6. AUTHENTICATION UI

Implement:
- login,
- logout,
- refresh-session handling,
- password reset,
- verification,
- optional/required 2FA,
- session-expired screen,
- access-denied screen.

Store tokens safely according to the backend's security contract.

Do not put long-lived secrets in browser-visible source.

Create:

```text
AuthProvider
useAuth()
RequireAuth
RequireRole
RequirePermission
```

Prefer backend-issued identity and permissions instead of duplicating authorization rules in multiple screens.

---

# 7. TENANT / PROPERTY CONTEXT

Display the active:
- organization,
- region/property group,
- property,
- department where relevant.

Changing the selected property must trigger correctly scoped API queries.

Do not let the UI pretend that a different property is selected while cached data from the previous property is still displayed.

Invalidate/refetch sensitive queries when scope changes.

---

# 8. ROLE-BASED FRONTEND EXPERIENCE

## Super Admin
- organization administration,
- plans/subscriptions if enabled,
- global settings,
- integrations,
- audit,
- platform analytics.

## Organization Admin / Owner
- all authorized properties,
- users,
- policies,
- finance,
- reports,
- commercial settings.

## Property Manager
- property dashboard,
- rooms,
- reservations,
- staff,
- housekeeping,
- maintenance,
- revenue.

## Front Desk
- arrivals,
- departures,
- walk-in,
- reservation lookup,
- room assignment,
- check-in/out,
- folio,
- payments,
- requests.

## Housekeeping
- assigned rooms,
- room status,
- task queue,
- checklists,
- inspections,
- lost & found.

## Restaurant/POS
- floor plan,
- tables,
- menus,
- orders,
- KOT,
- room posting,
- billing.

## Chef/Kitchen
- kitchen display,
- station queues,
- KOT state transitions,
- priority,
- preparation timing.

## Maintenance
- ticket board,
- assignment,
- parts,
- costs,
- SLA,
- verification.

## Accountant
- invoices,
- payments,
- refunds,
- expenses,
- taxes,
- reconciliation,
- daily closing,
- reports.

## HR
- employees,
- departments,
- shifts,
- attendance,
- leave,
- documents.

## President
- enterprise dashboard,
- profitability,
- occupancy,
- property comparison,
- strategic KPIs,
- alerts.

## Vice President
- region/cluster dashboard,
- occupancy,
- revenue,
- ADR,
- RevPAR,
- trends,
- exceptions.

## CEO
- consolidated P&L,
- revenue mix,
- cash position,
- occupancy,
- forecasts,
- risks.

## Operations Director
- live operations,
- rooms,
- arrivals/departures,
- housekeeping,
- maintenance,
- guest requests,
- SLAs.

## Shareholder
Dedicated read-only portal:
- ownership summary,
- approved financial statements,
- dividend ledger,
- selected KPIs,
- report downloads,
- access history where exposed.

The shareholder UI must never show operational mutation controls.

---

# 9. GLOBAL APP SHELL

Implement:

```text
AppShell
├── Sidebar
├── Topbar
│   ├── Organization/Property selector
│   ├── Search
│   ├── Notifications
│   └── Profile
├── Breadcrumbs
└── Main Content
```

Dashboard layouts should be role-specific.

Avoid one dashboard filled with every module.

---

# 10. EXECUTIVE DASHBOARDS

### President dashboard
Cards/charts:
- group revenue,
- profitability,
- occupancy,
- property comparison,
- strategic KPI trends,
- alerts.

### Vice President
- region occupancy,
- revenue,
- ADR,
- RevPAR,
- trend lines,
- property exceptions.

### CEO
- consolidated P&L,
- revenue mix,
- cash position,
- occupancy,
- forecasts,
- risk/exception panel.

### Operations Director
- live rooms,
- arrivals/departures,
- housekeeping status,
- maintenance,
- guest requests,
- SLA indicators.

Use:
- date range controls,
- property/group scope,
- comparison periods,
- export actions where authorized.

---

# 11. SHAREHOLDER PORTAL

Design it as a visually separate read-only experience.

Sections:
- dashboard,
- ownership,
- portfolio,
- approved financials,
- dividends,
- reports,
- access history.

Do not render:
- edit buttons,
- booking controls,
- staff administration,
- price changes,
- refunds,
- operational actions.

Hide controls for UX, but rely on backend authorization for actual security.

---

# 12. PROPERTY AND ROOM UI

Screens:

```text
Properties
Property Details
Buildings
Floors
Room Types
Rooms
Amenities
Rate Plans
Room Availability
Room Blocks
```

Room board/status:

```text
Available
Reserved
Occupied
Dirty
Cleaning
Inspection
Out of Order
Maintenance
Blocked
```

Use board/list/calendar views where useful.

Room changes must flow through backend state transitions.

---

# 13. RESERVATION UI

Booking search:

Filters:
- location,
- property,
- check-in,
- check-out,
- adults,
- children,
- rooms,
- price,
- room type,
- rating,
- amenities,
- meal plan,
- cancellation policy.

Booking flow:

```text
Search
→ Availability
→ Room Selection
→ Guest Details
→ Add Services
→ Price Summary
→ Payment
→ Confirmation
```

Support:
- multi-room reservations,
- guest assignment,
- corporate bookings,
- OTA bookings,
- walk-ins,
- modifications,
- room transfer,
- stay extension,
- early check-in,
- late checkout,
- partial payment,
- refund.

Use server-calculated price as authoritative.

Do not calculate the final payable amount only in the browser.

---

# 14. FRONT DESK

Create a fast operational dashboard:

```text
Today's Arrivals
Today's Departures
In-house Guests
Available Rooms
Cleaning Rooms
Maintenance Rooms
Revenue
```

Actions:
- lookup reservation,
- check availability,
- assign room,
- check-in,
- transfer room,
- extend stay,
- check-out,
- collect payment,
- view folio,
- create service request.

Use confirmation dialogs for:
- cancellations,
- refunds,
- room transfers,
- high-impact financial changes.

---

# 15. DIGITAL CHECK-IN

Guest flow:
- guest details,
- identity document upload,
- emergency contact,
- signature,
- confirmation.

Provide:
- upload progress,
- validation errors,
- document preview,
- consent/confirmation step,
- success receipt.

Never expose document storage URLs directly when the API requires signed access.

---

# 16. UNIFIED FOLIO UI

Folio must clearly show charges from:

- room,
- restaurant,
- room service,
- laundry,
- minibar,
- activities,
- spa,
- banquet,
- other services.

Each line should show appropriate:
- source,
- outlet,
- description,
- quantity,
- amount,
- tax,
- timestamp,
- status.

Support authorized:
- adjustment,
- transfer,
- split,
- void.

Show audit information where user permissions allow.

---

# 17. RESTAURANT / POS

Screens:
- restaurant selector,
- floor plan,
- table status,
- menu,
- modifiers,
- cart,
- order,
- payment,
- room-posting,
- order history.

Order flow:

```text
Customer
→ POS/App
→ Kitchen Display
→ Preparing
→ Ready
→ Served
→ Bill
→ Payment
```

Support:
- dine-in,
- takeaway if enabled,
- room service,
- banquet catering.

---

# 18. KOT / KITCHEN DISPLAY

Use **KOT (Kitchen Order Ticket)** consistently.

Kitchen display:
- station selector,
- queue,
- priority,
- elapsed preparation time,
- order details,
- item status.

KOT statuses:

```text
New
Accepted
Preparing
Ready
Served
Cancelled
Voided
```

Actions must be permission/state aware.

Realtime updates should arrive through WebSockets.

Do not allow an operator to jump to an arbitrary state unless the backend permits that transition.

---

# 19. BANQUETS / EVENTS

Screens:
- events list,
- calendar,
- event details,
- venue selection,
- packages,
- contracts,
- payments,
- room block,
- rooming list,
- master folio.

Show the relationship:

```text
Event
├── Venue
├── Package
├── Room Block
│   ├── Rooming List
│   └── Reservations
└── Folios
```

---

# 20. SPA / ACTIVITIES / SERVICES

Screens:
- service catalog,
- appointments,
- therapist/staff schedule,
- activity schedule,
- packages,
- memberships,
- booking,
- room charging,
- service request.

Make service charges link visibly to the relevant folio.

---

# 21. BILLING / PAYMENTS / FINANCE

Finance dashboard:
- revenue,
- expenses,
- receivables,
- payables,
- taxes,
- cash,
- reconciliation,
- daily close.

Payment statuses:

```text
Pending
Authorized
Paid
Failed
Refunded
Partially Refunded
```

Payment UI:
- never treat browser redirect/success alone as authoritative,
- poll/refetch backend payment status when necessary,
- show processing state,
- show webhook-confirmed completion,
- prevent duplicate submissions with UI idempotency handling.

---

# 22. INVENTORY / PROCUREMENT

Inventory screens:
- items,
- categories,
- stores/warehouses,
- stock,
- batches,
- expiry,
- stock movements,
- transfers,
- consumption,
- adjustments.

Procurement:

```text
Low Stock
→ Purchase Request
→ Approval
→ Purchase Order
→ Vendor
→ Delivery
→ Quality Check
→ Inventory
→ Invoice
```

Vendor screens:
- profiles,
- products/services,
- contracts,
- pricing,
- payment terms,
- purchase history,
- ratings,
- documents.

---

# 23. STAFF / HR / ATTENDANCE

Screens:
- employees,
- departments,
- shifts,
- attendance,
- leave,
- approvals,
- documents,
- performance.

Attendance:
- web/app,
- QR,
- GPS where supported and authorized,
- biometric integration where available.

Protect payroll/salary-sensitive screens behind permissions.

---

# 24. GUEST COMMUNICATION / SUPPORT

Communication center:
- email,
- SMS,
- WhatsApp,
- push,
- in-app chat.

Notification templates:
- booking confirmation,
- payment confirmation,
- check-in reminder,
- welcome message,
- service update,
- checkout reminder,
- invoice,
- review request.

Support dashboard:
- ticket list,
- priority,
- assignment,
- SLA,
- status.

Ticket states:

```text
Open
Assigned
In Progress
Waiting
Resolved
Closed
```

---

# 25. LOYALTY / REVIEWS / MARKETING

Loyalty:
- account,
- points,
- history,
- redemption,
- expiry,
- tier.

Reviews:
- property,
- room,
- food,
- staff,
- cleanliness,
- service,
- facilities,
- value.

Marketing:
- coupons,
- promo codes,
- packages,
- campaigns,
- referrals.

---

# 26. DYNAMIC PRICING UI

Screens:
- rate plans,
- seasonal calendars,
- demand rules,
- occupancy thresholds,
- booking pace,
- min/max rate,
- rate audit history.

Demand bands:

```text
Low
Normal
High
Surge
```

Show:
- current value,
- proposed/calculated value,
- source rule,
- change history,
- effective period,
- property/rate plan.

For manual overrides:
- require permission,
- require confirmation,
- capture reason when backend requires it,
- visibly distinguish manual vs automated change.

---

# 27. OTA / CHANNEL MANAGEMENT UI

Screens:
- channels,
- connections,
- mappings,
- sync status,
- errors,
- reconciliation.

Show:
- connection health,
- last sync,
- mappings,
- sync errors,
- pending reconciliation,
- external reservation references.

Provide:
- retry action where authorized,
- reconciliation workflow,
- mapping UI for property/room/rate plans.

Never show provider secrets.

---

# 28. GATE SECURITY UI

Dedicated security module.

Screens:
- live gate dashboard,
- guest/visitor log,
- vehicles,
- vendors/contractors,
- materials,
- incidents,
- checkpoints,
- approvals,
- audit,
- cloakroom.

Gate dashboard should surface:
- current visitors,
- vehicles,
- pending exits,
- cloakroom items.

Security users must not see unrelated financial administration.

---

# 29. CLOAKROOM / LUGGAGE UI

Support:
- issue ticket/tag,
- optional QR/barcode,
- item count,
- description,
- owner,
- room/reservation,
- storage location,
- release,
- partial release,
- identity verification,
- lost/damaged incident.

Prevent duplicate release by refreshing authoritative ticket state before final confirmation.

---

# 30. TRANSPORT UI

Screens:
- transport requests,
- quote view,
- dispatch board,
- fleet,
- drivers,
- trips,
- shuttle routes,
- providers.

Trip lifecycle:

```text
Requested
→ Quoted
→ Assigned
→ Driver Confirmed
→ En Route
→ Arrived
→ Picked Up
→ Completed
→ Billed
```

Show:
- driver,
- vehicle,
- ETA,
- passenger,
- route,
- provider,
- customer charge,
- vendor cost where authorized,
- margin where authorized.

---

# 31. TRANSPORT PROVIDER EXPERIENCE

For external providers/vendors:
- show assigned jobs only,
- allow status updates permitted by backend,
- show relevant pickup/drop data,
- never show another vendor's jobs,
- never expose internal financial data unless explicitly authorized.

---

# 32. REAL-TIME UI

Use WebSockets for:
- KOT updates,
- kitchen queues,
- housekeeping updates,
- maintenance,
- guest chat,
- room status,
- front desk,
- transport status,
- notifications.

Build a reusable:

```text
useWebSocket()
WebSocketProvider
reconnect strategy
connection-status indicator
```

Handle:
- connect,
- reconnect,
- disconnect,
- auth expiry,
- invalid subscription,
- server error,
- stale event detection.

Always filter/render based on server authorization and current scope.

---

# 33. DATA FETCHING AND STATE MANAGEMENT

Use a dedicated API client.

Recommended approach:
- typed HTTP client,
- server-state cache/query library,
- lightweight local UI state store only where needed.

Do not duplicate backend data in many unrelated component states.

Use query keys that include:
- organization,
- property,
- resource,
- filters.

On mutation:
- invalidate/update affected queries,
- handle optimistic updates only for safe operations,
- never optimistically mark critical financial/reservation success without server confirmation.

---

# 34. TYPE SAFETY

Prefer strict TypeScript.

Define types for:
- API resources,
- enums/statuses,
- requests,
- responses,
- pagination,
- errors,
- permissions,
- WebSocket events.

Keep API types aligned with the Django OpenAPI contract.

Do not use `any` to suppress contract problems.

For every backend status enum, define frontend behavior for:
- supported,
- disabled,
- loading,
- error,
- unknown/future status.

---

# 35. API ERROR HANDLING

Standardize:
- validation errors,
- authentication errors,
- authorization errors,
- not found,
- conflict,
- rate limit,
- server error,
- network failure,
- WebSocket failure.

Provide:
- toast/alert for recoverable actions,
- inline field errors for forms,
- page-level errors,
- retry buttons,
- empty states,
- session-expiry redirect.

Error UI must never leak secrets, stack traces, SQL, or internal provider credentials.

---

# 36. LOADING / EMPTY / ERROR STATES

Every production screen needs:

### Loading
- skeletons or meaningful progress UI.

### Empty
- explain what the user can do next.

### Error
- explain what failed,
- provide retry where appropriate,
- preserve form input when safe.

### Success
- show meaningful confirmation.

Never render blank pages while an API request is failing.

---

# 37. ACCESSIBILITY

Use semantic HTML and accessible interactions.

Required:
- keyboard navigation,
- visible focus states,
- labels,
- ARIA where needed,
- correct dialog focus handling,
- sufficient contrast,
- table headers,
- form error association,
- accessible status updates.

KOT, front desk, security and finance screens must remain usable at high information density.

---

# 38. PERFORMANCE

Optimize:
- route-level code splitting,
- lazy-loading heavy modules,
- charts,
- virtualization for large tables,
- debounced search,
- request caching,
- selective query invalidation,
- image optimization,
- pagination.

Do not preload every hospitality module for every user.

Load modules according to authorized navigation and route access.

---

# 39. SECURITY REQUIREMENTS

Frontend must:
- never expose backend secrets,
- never hardcode credentials,
- avoid storing sensitive data unnecessarily,
- validate UI input,
- safely render untrusted text,
- avoid unsafe HTML injection,
- handle auth expiration,
- avoid leaking unauthorized records through client-side caches,
- clear sensitive cached data on logout or tenant switch,
- avoid exposing signed document URLs beyond their required lifecycle.

Remember:

**Hiding a button is not authorization.**

Every protected operation must also be enforced by the Django backend.

---

# 40. FILE / DOCUMENT UX

For:
- guest documents,
- employee documents,
- property media,
- invoices,
- shareholder reports,
- incident evidence,

support:
- upload progress,
- validation,
- preview where safe,
- download,
- expired-link handling,
- unauthorized error handling.

Do not expose permanent unrestricted storage URLs when signed URLs are required.

---

# 41. DASHBOARD ANALYTICS

Support dashboard filters:
- date,
- property,
- region,
- department,
- channel.

Metrics:
- Occupancy,
- ADR,
- RevPAR,
- Average Length of Stay,
- Cancellation Rate,
- No-show Rate,
- Direct Booking Share,
- OTA Share,
- F&B Revenue,
- Guest Satisfaction.

Corporate views:
- daily,
- weekly,
- monthly,
- yearly,
- comparison,
- drill-down.

---

# 42. ROUTING

Create route groups similar to:

```text
/auth/*
/guest/*
/app/*
/corporate/*
/shareholder/*
/admin/*
/front-office/*
/housekeeping/*
/maintenance/*
/restaurant/*
/kitchen/*
/events/*
/finance/*
/inventory/*
/hr/*
/security/*
/cloakroom/*
/transport/*
/pricing/*
/channels/*
/reports/*
/analytics/*
/settings/*
```

Use route metadata for:
- title,
- breadcrumb,
- required permissions,
- layout,
- feature flag if applicable.

Do not use routing as the security boundary.

---

# 43. TABLE STANDARDS

Enterprise tables should support where applicable:
- pagination,
- search,
- filters,
- sorting,
- column visibility,
- row actions,
- bulk actions,
- export,
- loading,
- empty,
- error,
- responsive mode.

Never fetch thousands of records simply to paginate on the browser when the API can paginate.

---

# 44. FORM STANDARDS

All forms need:
- typed schema,
- validation,
- field-level error messages,
- server-validation integration,
- loading state,
- disabled duplicate submit,
- success state,
- unsaved-change confirmation where appropriate.

Do not duplicate business validation that belongs exclusively to the backend.

Frontend validation should improve UX; backend validation is authoritative.

---

# 45. CRITICAL CONFIRMATION FLOWS

Require deliberate confirmation for:
- reservation cancellation,
- refund,
- folio adjustment,
- folio transfer,
- rate override,
- room transfer,
- KOT cancellation/void,
- stock adjustment,
- security incident closure,
- cloakroom release,
- transport cancellation/reassignment,
- permission changes.

Where required, capture:
- reason,
- confirmation,
- affected record.

---

# 46. STATE-MACHINE UX

Never treat statuses as arbitrary dropdown values.

Reservation:
```text
Pending
Confirmed
Checked-in
In-house
Checked-out
Cancelled
No-show
Completed
```

Housekeeping:
```text
Dirty
Cleaning Assigned
Cleaning Started
Cleaning Completed
Inspection
Available
```

Maintenance:
```text
Reported
Assigned
In Progress
Waiting
Resolved
Verified
Closed
```

KOT:
```text
New
Accepted
Preparing
Ready
Served
Cancelled
Voided
```

Transport:
```text
Requested
Quoted
Assigned
Driver Confirmed
En Route
Arrived
Picked Up
Completed
Billed
```

UI actions must be generated from valid transitions returned/allowed by backend policy.

---

# 47. TESTING STRATEGY

Implement:

### Component tests
- forms,
- tables,
- dialogs,
- status badges,
- permission-aware controls.

### Integration tests
- login,
- route guards,
- reservations,
- check-in/out,
- folio,
- payment,
- KOT,
- housekeeping,
- security,
- transport.

### End-to-end
Critical paths:

```text
Guest booking → payment → confirmation
Front desk check-in → stay → checkout
Restaurant order → KOT → ready → served → payment
Housekeeping checkout → cleaning → inspection → available
Maintenance report → resolution
Banquet → room block → folio
Transport request → assignment → completion → billing
Shareholder → read-only report access
```

### Security tests
Attempt:
- direct navigation to unauthorized route,
- manually calling hidden actions,
- changing IDs in URLs,
- switching property IDs,
- using stale cached data after tenant switch,
- subscribing to unauthorized WebSocket channels,
- opening documents without permission.

---

# 48. ERROR TRACKING / OBSERVABILITY

Implement a global error boundary.

Capture production:
- route,
- user role,
- organization/property context where safe,
- frontend version,
- request ID,
- browser/device metadata where appropriate,
- exception type,
- component stack.

Integrate Sentry or equivalent if no error tracker exists.

Do not transmit:
- passwords,
- access tokens,
- payment secrets,
- full identity documents,
- unnecessary sensitive guest data.

---

# 49. DOCUMENTATION

Create:

```text
README.md
docs/
  architecture.md
  routes.md
  roles-and-permissions.md
  api-client.md
  websocket.md
  ui-system.md
  environment.md
  testing.md
  deployment.md
  troubleshooting.md
```

README must explain:
- what the application does,
- supported roles,
- setup,
- environment variables,
- API base URL,
- WebSocket URL,
- build,
- development server,
- testing,
- deployment.

---

# 50. ENVIRONMENT CONFIGURATION

Use environment variables for:
- API base URL,
- WebSocket URL,
- intentionally public map/client configuration,
- feature flags,
- analytics DSN where applicable.

Never commit actual secrets.

Provide:

```text
.env.example
```

Document every variable.

---

# 51. RECOMMENDED UI MODULE MAP

```text
Dashboard
├── Corporate
├── Shareholder
├── Property
├── Front Office
├── Reservations
├── Rooms
├── Guests
├── Housekeeping
├── Maintenance
├── Restaurant
├── KOT / Kitchen
├── Events / Banquets
├── Spa
├── Activities
├── Folio / Billing
├── Payments / Finance
├── Inventory
├── Procurement
├── Vendors
├── Staff / HR
├── Attendance
├── Loyalty
├── Reviews
├── Marketing
├── Pricing
├── Channels / OTA
├── Gate Security
├── Cloakroom
├── Transport
├── Reports
├── Analytics
├── Notifications
└── Settings
```

---

# 52. FRONTEND-BACKEND CONTRACT RULES

The Django API is authoritative for:
- permissions,
- object access,
- pricing,
- totals,
- availability,
- state transitions,
- payment completion,
- audit,
- tenant/property scope.

The React application is responsible for:
- presentation,
- interaction,
- client-side validation,
- navigation,
- optimistic UI only where safe,
- caching,
- realtime display.

Never move authoritative business calculations into the browser.

---

# 53. IMPLEMENTATION ROADMAP

### Phase 1
- app shell,
- authentication,
- tenant/property context,
- permissions,
- base UI system,
- API client,
- error handling,
- dashboard framework.

### Phase 2
- properties,
- rooms,
- availability,
- guests,
- reservations,
- front desk,
- check-in/out.

### Phase 3
- folio,
- billing,
- payments,
- housekeeping,
- maintenance.

### Phase 4
- restaurant,
- POS,
- KOT,
- kitchen display,
- room posting.

### Phase 5
- events,
- banquets,
- room blocks,
- rooming lists,
- master folios.

### Phase 6
- pricing,
- seasonal calendars,
- dynamic pricing,
- OTA/channel management.

### Phase 7
- corporate dashboards,
- shareholder portal,
- dividends,
- executive analytics.

### Phase 8
- gate security,
- cloakroom.

### Phase 9
- fleet,
- drivers,
- transport requests,
- shuttles,
- chauffeur,
- provider adapters.

### Phase 10
- loyalty,
- marketing,
- guest experience,
- AI,
- advanced analytics.

---

# 54. DEFINITION OF DONE

A frontend feature is complete only when:

- route exists,
- authorized navigation exists,
- correct permission UX exists,
- API types exist,
- API integration exists,
- loading/empty/error states exist,
- form validation exists,
- success feedback exists,
- responsive behavior exists,
- accessibility is acceptable,
- realtime behavior exists where required,
- cache invalidation works,
- unauthorized direct navigation is handled,
- tests exist,
- no hardcoded secret exists,
- documentation exists.

---

# 55. FINAL HANDOFF OUTPUT

When implementation begins, provide:

1. Frontend architecture diagram.
2. Repository tree.
3. Route map.
4. Permission-aware navigation matrix.
5. Component/design-system inventory.
6. API client structure.
7. API endpoint-to-screen mapping.
8. WebSocket event-to-screen mapping.
9. State/query strategy.
10. Type model.
11. Testing plan.
12. Accessibility plan.
13. Performance plan.
14. Environment configuration.
15. Deployment plan.
16. Phase-by-phase implementation checklist.

For each screen/module identify:
- route,
- role,
- permissions,
- API endpoints,
- WebSocket events,
- data dependencies,
- mutations,
- loading/error/empty states,
- audit-sensitive actions,
- tests.

Never hide security problems by simply removing a button. Verify that the backend contract enforces the same boundary.
