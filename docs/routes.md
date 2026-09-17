# Application Route Inventory

| Route Path | Module / Screen | Layout Shell | Required Roles / Guards | Key Actions & Endpoints |
| :--- | :--- | :--- | :--- | :--- |
| `/auth/login` | Login & Role Simulator | `AuthLayout` | Public | Authenticates JWT pair |
| `/app/frontdesk` | Front Desk Hub | `AppShell` | Operational Staff, Managers | Arrivals, Departures, Room Allocation, Check-In, Check-Out |
| `/app/rooms` | Room Board & Matrix | `AppShell` | All Authorized Staff | Visual room rack, floor filter, room state transition |
| `/app/reservations` | Reservations Master List | `AppShell` | Front Office, Managers | Search bookings, view channel distribution, balances |
| `/app/checkin` | Contactless Digital Check-In | `AppShell` | Front Desk, Guests | 4-step wizard: Details, ID OCR, Emergency, Digital Signature |
| `/app/folios` | Unified Master Folios | `AppShell` | Cashiers, Front Desk, Accounting | Multi-department charges (Room, F&B, Spa), Void with audit reason, Settle balance |
| `/app/pos` | Restaurant Point of Sale | `AppShell` | F&B Staff, Captains, Cashiers | Table floor plan, digital menu, fire KOT to kitchen, post to room folio |
| `/app/kds` | Kitchen Display System | `KDSLayout` | Chefs, Line Cooks | Fullscreen high-contrast station queues, bump tickets: New → Accepted → Preparing → Ready → Served |
| `/app/housekeeping` | Housekeeping Turnover | `AppShell` | Housekeeping Attendants, Supervisors | Task queue, hygiene checklists, Lost & Found vault |
| `/app/maintenance` | Engineering Work Orders | `AppShell` | Maintenance, Engineering Lead | Log ticket, assign technician, SLA tracking, state transitions |
| `/app/events` | Banquets & Group Events | `AppShell` | Event Planners, Sales, Managers | Banquet calendar, venues, room blocks, master folios |
| `/app/spa` | Spa & Wellness Center | `AppShell` | Spa Concierge, Therapists | Catalog, appointment schedule, post treatment to room folio |
| `/app/finance` | Finance & Night Audit | `AppShell` | Accountants, Night Auditors, Execs | Reconcile cashier drawers, execute automated 5-step Night Audit & Day Close |
| `/app/inventory` | Inventory & Procurement | `AppShell` | Purchasing, Storekeepers | Store stock levels, par levels, automated PO generation |
| `/app/transport` | Fleet & Chauffeur Dispatch | `AppShell` | Transport Concierge, Drivers | Airport transfers, limousine dispatch, trip lifecycle transitions |
| `/app/security` | Gate Security Checkpoint | `AppShell` | Security Officers, Gate Guard | Visitor passes, vehicle barrier entry/exit logs |
| `/app/cloakroom` | Cloakroom & Luggage Vault | `AppShell` | Bell Desk, Concierge | Issue baggage tags, assign secure rack, verified claim release |
| `/app/pricing` | Dynamic Pricing Engine | `AppShell` | Revenue Managers, Executives | Demand bands (Surge, High, Normal, Low), manual rate override with mandatory audit reason |
| `/app/channels` | OTA Channel Manager | `AppShell` | Revenue, Distribution | Booking.com, Expedia, Agoda sync health, 2-way sync trigger |
| `/app/corporate` | Corporate Governance | `AppShell` | President, CEO, VP, Operations Director | Recharts analytics: Occupancy trends, Revenue mix, Property comparison matrix |
| `/app/shareholder` | Shareholder Relations Portal | `ShareholderLayout` | Shareholders (Read-Only) | Strictly read-only: Ownership stake, certified dividend history, audited financial report downloads |
| `/app/hr` | Human Resources & Attendance | `AppShell` | HR Lead, Department Heads | Shift rosters, biometric web clock-in/out |
| `/app/loyalty` | Guest Loyalty & Reviews | `AppShell` | Guest Relations, Marketing | VIP tiers, points ledger, guest review sentiment |
| `/app/settings` | Property Master Settings | `AppShell` | Property Managers, Administrators | Master check-in/out policies, tax codes, currency |
| `/app/access-denied`| Access Restricted | `AppShell` | Authenticated | Friendly boundary notice explaining role restrictions |
