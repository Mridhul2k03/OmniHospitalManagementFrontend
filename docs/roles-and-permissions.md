# Roles & Access Control Policy Matrix

## Role Profiles & Operational Boundaries

| User Role | Navigation Scope | Key Authorized Capabilities | Explicit UX & Security Restrictions |
| :--- | :--- | :--- | :--- |
| **Super Admin** | Entire System | Global tenant settings, cross-org administration, full platform access. | None. |
| **President** | Corporate Dashboard, Portfolio | High-level enterprise profitability, strategic KPIs, portfolio comparison. | Operational mutations (check-ins, line cook tickets). |
| **CEO** | Corporate Dashboard, Finance | Consolidated P&L, revenue mix, cash reserves, occupancy forecasts. | Operational mutations. |
| **Property Manager** | Full Property Scope | Property dashboard, rooms, staff rosters, rates override, folios. | Other properties unless assigned. |
| **Front Desk** | Front Office, Rooms, Folios, Cloakroom | Check-in, check-out, room transfer, collect payment, issue baggage tags. | Payroll, financial closing, kitchen dispatch. |
| **Housekeeping** | Housekeeping Board, Rooms | Assigned room task queue, clean/dirty transitions, Lost & Found. | Front desk check-in, billing, rate changes. |
| **Executive Chef** | Kitchen KDS (`/app/kds`) | Station ticket queues (Grill, Sauté, Salad, Bar), status bumping. | Front desk, room assignments, financial records. |
| **Restaurant POS** | Restaurant POS, Menu | Floor plan, table order taking, fire KOT, post checks to room folio. | Room transfers, corporate dashboards. |
| **Security Officer** | Gate Security, Cloakroom | Visitor passes, vehicle barrier entry/exit logs, baggage custody. | Financial records, guest folios, reservations. |
| **Fleet / Transport** | Transport Dispatch | Airport transfers, limousine chauffeur dispatch, route status updates. | Room folios, kitchen orders. |
| **Shareholder** | Shareholder Portal (`/app/shareholder`) | View registered equity, approved audited P&L, dividend ledger, download vouchers. | **STRICTLY ZERO OPERATIONAL CONTROLS**: No edit buttons, no booking buttons, no refunds. |

## Authoritative Enforcement
Frontend role guards (`RequireRole`, `RequirePermission`, conditional sidebar item rendering) streamline UX and protect user workflows. The authoritative boundary remains the Django REST Framework API via permission classes (`IsAuthenticated`, `IsPropertyManager`, `IsShareholderReadOnly`, `IsCorporateExecutive`).
