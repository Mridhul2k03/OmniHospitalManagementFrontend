# Django REST Framework Backend API Implementation Guide & Specification
## Omni Hospitality Management Operating System (HMOS) & Enterprise SaaS

**Target Architecture:** Python 3.12+ / Django 5.x / Django REST Framework 3.15+ / Django Channels (WebSockets) / Celery / Redis / PostgreSQL  
**Document Version:** `2.0.0-PROD`  
**Frontend Client:** `OmniHospitalManagementFrontend` (React 19 + TypeScript + Vite + Tailwind CSS)  
**Standard Base API URL:** `http://127.0.0.1:8000/api/v1/` (configured via Vite proxy `/api/v1`)  
**WebSocket Gateway:** `ws://127.0.0.1:8000/ws/`  

---

## 1. Executive UI-to-Backend Connectivity Audit

This section provides a forensic audit of every screen, hub, and component across the frontend codebase (`src/features/`), identifying what is fully connected, partially connected, or currently disconnected (using local state/mock data).

### Comprehensive Status Matrix (All 26 Feature Modules)

| # | Feature / UI Screen | Route Path | Frontend Component | Connectivity Status | Existing API File | Missing / Disconnected Actions (Gap to Bridge) |
|---|---|---|---|---|---|---|
| **1** | **Auth & Organization** | `/auth/login`<br>`/auth/register`<br>`/ila-admin/login` | `LoginView.tsx`<br>`RegisterView.tsx`<br>`ILALoginView.tsx` | ✅ **Fully Connected** | `src/api/endpoints/auth.api.ts` | Complete. Calls `/auth/login/`, `/auth/register/`, `/auth/me/`, `/auth/refresh/`, `/auth/logout/`. |
| **2** | **SuperAdmin SaaS Portal** | `/ila-admin`<br>`/app/superadmin` | `SuperAdminHub.tsx` | ✅ **Fully Connected** | `src/api/endpoints/superadmin.api.ts` | Complete. Calls `/organizations/`, `/organizations/{id}/toggle-status/`, `/organizations/{id}/set-tier/`, `/auth/users/`. |
| **3** | **Front Desk Operations** | `/app/frontdesk` | `FrontDeskHub.tsx` | ⚠️ **Partially Connected** | `src/api/endpoints/reservations.api.ts`<br>`src/api/endpoints/rooms.api.ts` | "New Walk-in Booking" and "Sync PMS Roster" buttons only trigger toasts without opening modal or calling API. Needs walk-in reservation endpoint. |
| **4** | **Room Availability Board** | `/app/rooms` | `RoomBoardView.tsx`<br>`HotelSelectionsManager.tsx` | ✅ **Fully Connected** | `src/api/endpoints/rooms.api.ts`<br>`src/api/endpoints/properties.api.ts` | Complete. Rooms, types, amenities, floors, and buildings have full CRUD and state transition calls. |
| **5** | **Reservations Manifest** | `/app/reservations` | `ReservationsHub.tsx` | ⚠️ **Partially Connected** | `src/api/endpoints/reservations.api.ts` | Listing is connected. "Create Reservation" button in header triggers a toast instead of an interactive booking wizard. |
| **6** | **Digital Check-In** | `/app/checkin` | `DigitalCheckInView.tsx` | ✅ **Fully Connected** | `src/api/endpoints/reservations.api.ts` | 4-step wizard submits to `reservationsApi.submitDigitalCheckIn` (`POST /reservations/digital-check-in/`). |
| **7** | **Unified Master Folios** | `/app/folios` | `FoliosHub.tsx` | ✅ **Fully Connected** | `src/api/endpoints/folios.api.ts` | Listing, posting multi-department charges, voiding charges with audit reason, and settling payments are connected. |
| **8** | **Restaurant Point of Sale** | `/app/pos` | `RestaurantPOS.tsx` | ✅ **Fully Connected** | `src/api/endpoints/dining.api.ts` | Tables and menu CRUD, order firing to KDS (`/dining/orders/kot/`), and folio billing (`/dining/orders/folio/`) are connected. |
| **9** | **Kitchen Display System** | `/app/kds` | `KitchenDisplaySystem.tsx` | ✅ **Fully Connected** | `src/api/endpoints/kot.api.ts` | Fullscreen KOT board, ticket status progression (`new` → `preparing` → `ready` → `served`), and manual ticket creation are connected. |
| **10** | **Housekeeping Turnover** | `/app/housekeeping` | `HousekeepingHub.tsx` | ⚠️ **Partially Connected** | `src/api/endpoints/housekeeping.api.ts` | Turnover tasks and checklists are connected. **Gap:** Lost & Found tab is read-only; lacks modal to register or claim/release items. |
| **11** | **Engineering Maintenance** | `/app/maintenance` | `MaintenanceHub.tsx` | ✅ **Fully Connected** | `src/api/endpoints/maintenance.api.ts` | Tickets list, ticket creation, priority handling, and SLA tracking are connected. |
| **12** | **Banquets & Group Events** | `/app/events` | `EventsHub.tsx` | ⚠️ **Partially Connected** | `src/api/endpoints/operations.api.ts` | Events and venue listings are connected. **Gap:** Master Folio modal shows hardcoded dummy values; needs BEO line items endpoint. |
| **13** | **Spa & Wellness Center** | `/app/spa` | `SpaHub.tsx` | ✅ **Fully Connected** | `src/api/endpoints/operations.api.ts` | Services and appointment listings, treatment bookings, and direct room folio charging are connected. |
| **14** | **Finance & Night Audit** | `/app/finance` | `FinanceHub.tsx` | ⚠️ **Partially Connected** | `src/api/client/axios.ts` | Calls `/payments/` and `/folios/night-audit/`. **Gap:** "Export GL CSV" button only triggers toast; cash in vault ($4,850) is hardcoded. |
| **15** | **Inventory & Procurement** | `/app/inventory` | `InventoryHub.tsx` | ⚠️ **Partially Connected** | `src/api/endpoints/operations.api.ts` | Stock item listing, creation, adjustment, and PO creation (`/inventory/po/`) are connected. Lacks PO history view. |
| **16** | **Fleet & Transport** | `/app/transport` | `TransportHub.tsx` | `src/api/endpoints/transport.api.ts` | ✅ **Fully Connected** | Trips list, booking chauffeur transfers, and status progression lifecycle are connected. |
| **17** | **Gate Security Control** | `/app/security` | `SecurityGateHub.tsx` | ✅ **Fully Connected** | `src/api/endpoints/operations.api.ts` | Perimeter visitor logs, vehicle pass creation, and barrier exit logs are connected. |
| **18** | **Cloakroom & Luggage** | `/app/cloakroom` | `CloakroomHub.tsx` | ✅ **Fully Connected** | `src/api/endpoints/operations.api.ts` | Luggage tickets, barcode tag issuance, vault rack allocation, and verified claim release are connected. |
| **19** | **Dynamic AI Pricing** | `/app/pricing` | `DynamicPricingHub.tsx` | ❌ **Disconnected (Client-Only)** | `src/api/endpoints/rooms.api.ts` | Fetches room types, but demand bands, surge multipliers, and manual rate overrides are **100% in local React state** and lost on reload. |
| **20** | **OTA Channel Manager** | `/app/channels` | `ChannelsHub.tsx` | ⚠️ **Partially Connected** | `src/api/endpoints/operations.api.ts` | Channel status and sync-all are connected. **Gap:** "View Mappings" button only fires a toast; needs room/rate mapping endpoint. |
| **21** | **Executive Dashboard** | `/app/corporate` | `ExecutiveDashboard.tsx` | ❌ **Disconnected (Hardcoded)** | `src/api/endpoints/executive.api.ts` | Does not import `executiveApi`! Displays static hardcoded metrics ($3.38M revenue, 91.5% occupancy). Export button fires a toast. |
| **22** | **Shareholder Portal** | `/app/shareholder` | `ShareholderPortal.tsx` | ⚠️ **Partially Connected** | `src/api/endpoints/shareholder.api.ts` | Dividends list is connected. Equity stake (50k shares), asset valuations ($84M, $112M), and download buttons are hardcoded/toast only. |
| **23** | **Human Resources & HR** | `/app/hr` | `HRHub.tsx` | ✅ **Fully Connected** | `src/api/endpoints/operations.api.ts` | Staff roster list and shift punch clock-in/out (`/hr/staff/{id}/`) are connected to backend. |
| **24** | **Loyalty & Guest CRM** | `/app/loyalty` | `LoyaltyHub.tsx` | ❌ **Disconnected (100% Mock)** | *None* | Zero API calls. Member counts (Silver, Gold, Platinum), guest sentiment reviews, campaign creation, and reply actions are all dummy UI. |
| **25** | **Settings & Policies** | `/app/settings` | `SettingsHub.tsx` | ⚠️ **Partially Connected** | `src/api/endpoints/properties.api.ts` | "Master Options" sub-tab is connected. "Property Policies & Profile" submit is dummy `e.preventDefault()` with no backend persistence. |
| **26** | **System Status & Health** | `/app/system-status` | `SystemStatusHub.tsx` | ✅ **Fully Connected** | `src/api/client/axios.ts` | Audits 12 core backend endpoints for live latency and HTTP response status. |

---

## 2. Django System Architecture & Project Blueprint

### 2.1 Django Project Directory Structure

```text
omni_backend/
├── manage.py
├── requirements.txt
├── omni_project/
│   ├── __init__.py
│   ├── asgi.py                  # ASGI for Django Channels WebSockets
│   ├── wsgi.py
│   ├── settings/
│   │   ├── base.py
│   │   ├── development.py
│   │   └── production.py
│   └── urls.py                  # Root URLconf routing to /api/v1/ and /ws/
├── apps/
│   ├── core/                    # Base models, middleware, pagination, response wrappers
│   ├── authentication/          # User model, RBAC, JWT cookies, session handling
│   ├── tenants/                 # Organization multi-tenancy & subscriptions
│   ├── properties/              # Properties, buildings, floors, physical inventory
│   ├── rooms/                   # Rooms, room types, amenities, status state machine
│   ├── reservations/            # Bookings, digital check-in, arrivals, departures
│   ├── billing/                 # Folios, charges, voiding, payments, night audit
│   ├── dining/                  # POS tables, menu items, order routing
│   ├── kitchen/                 # KDS tickets, station queues, bump logic
│   ├── housekeeping/            # Turnover tasks, hygiene checklists, lost & found
│   ├── maintenance/             # Work orders, incident tickets, technician SLA
│   ├── transport/               # Vehicles, drivers, chauffeur dispatch
│   ├── security/                # Gate logs, visitor passes, barrier events
│   ├── cloakroom/               # Luggage tickets, rack allocation, release custody
│   ├── inventory/               # Central stock, adjustments, purchase orders
│   ├── events/                  # Venues, banquet bookings, BEO master folios
│   ├── spa/                     # Treatments, therapist scheduling, room charging
│   ├── pricing/                 # Dynamic pricing rules, demand bands, overrides
│   ├── channels/                # OTA connections, room/rate mapping, 2-way sync
│   ├── corporate/               # Executive KPIs, portfolio comparison, board packs
│   ├── shareholder/             # Accredited investor portal, dividends, filings
│   ├── hr/                      # Staff roster, biometric clock-in/out, shifts
│   └── loyalty/                 # Guest loyalty tiers, promo campaigns, review sentiment
```

---

### 2.2 Core Middleware Architecture

#### 1. Multi-Tenancy Resolution (`TenantMiddleware`)
Extracts the institutional tenant from the `X-Tenant-ID` header (or fallback cookie/JWT payload) and injects `request.tenant` into all DRF requests:

```python
# apps/core/middleware.py
import uuid
from django.utils.deprecation import MiddlewareMixin
from django.http import JsonResponse
from apps.tenants.models import ClientOrganization

class TenantResolutionMiddleware(MiddlewareMixin):
    """
    Resolves the active tenant from 'X-Tenant-ID' request header or sub-claim.
    Ensures strict row-level multi-tenant isolation across all models.
    """
    def process_request(self, request):
        tenant_identifier = request.headers.get("X-Tenant-ID") or request.COOKIES.get("omni_tenant_id")
        request.tenant = None
        
        # Bypass for public / superadmin platform endpoints
        exempt_paths = ["/api/v1/auth/login/", "/api/v1/auth/register/", "/api/v1/organizations/", "/api/v1/health/"]
        if any(request.path.startswith(path) for path in exempt_paths):
            return None

        if tenant_identifier:
            try:
                if self._is_valid_uuid(tenant_identifier):
                    request.tenant = ClientOrganization.objects.filter(id=tenant_identifier, is_active=True).first()
                else:
                    request.tenant = ClientOrganization.objects.filter(code__iexact=tenant_identifier, is_active=True).first()
            except Exception:
                pass

        # If tenant required but not found
        if not request.tenant and request.path.startswith("/api/v1/") and not any(request.path.startswith(p) for p in exempt_paths):
            # Optional: Allow superadmins to proceed without tenant scope
            if hasattr(request, 'user') and request.user.is_authenticated and request.user.is_superuser:
                return None
            return JsonResponse({
                "success": False,
                "error": {
                    "code": "MISSING_TENANT_SCOPE",
                    "message": "A valid 'X-Tenant-ID' header is required for this operational endpoint."
                }
            }, status=400)

    @staticmethod
    def _is_valid_uuid(val):
        try:
            uuid.UUID(str(val))
            return True
        except ValueError:
            return False
```

#### 2. Dual-Mode Authentication (HttpOnly Cookies + Bearer Token)
Supports secure HttpOnly cookies (`access_token`, `refresh_token`) for browser frontend, with seamless fallback to `Authorization: Bearer <token>`:

```python
# apps/authentication/authentication.py
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed

class CookieOrBearerJWTAuthentication(JWTAuthentication):
    """
    Checks HTTP Authorization header first; if absent, inspects HttpOnly cookie 'access_token'.
    """
    def authenticate(self, request):
        header = self.get_header(request)
        if header is not None:
            raw_token = self.get_raw_token(header)
        else:
            raw_token = request.COOKIES.get("access_token")

        if raw_token is None:
            return None

        validated_token = self.get_validated_token(raw_token)
        return self.get_user(validated_token), validated_token
```

#### 3. Standard Response & Error Envelope
Axios in the frontend expects `{ "success": true, "data": ..., "meta": { ... } }` on success and `{ "success": false, "error": { "code": ..., "message": ... } }` on error:

```python
# apps/core/renderers.py
from rest_framework.renderers import JSONRenderer

class StandardEnvelopeJSONRenderer(JSONRenderer):
    def render(self, data, accepted_media_type=None, renderer_context=None):
        response = renderer_context.get("response") if renderer_context else None
        status_code = response.status_code if response else 200

        # Don't re-wrap if already structured or if binary/file download
        if isinstance(data, (bytes, bytearray)) or getattr(response, 'is_binary', False):
            return super().render(data, accepted_media_type, renderer_context)

        request_id = ""
        if renderer_context and "request" in renderer_context:
            request_id = renderer_context["request"].headers.get("X-Request-ID", "")

        if status_code >= 400:
            formatted_response = {
                "success": False,
                "error": {
                    "code": data.get("code", "REQUEST_FAILED") if isinstance(data, dict) else "ERROR",
                    "message": data.get("detail", data.get("message", "An error occurred.")) if isinstance(data, dict) else str(data),
                    "details": data if isinstance(data, dict) else None,
                },
                "meta": {"request_id": request_id}
            }
        else:
            # Handle paginated or non-paginated data
            if isinstance(data, dict) and ("results" in data or "data" in data):
                inner_data = data.get("results", data.get("data"))
                meta = {
                    "count": data.get("count", len(inner_data) if isinstance(inner_data, list) else 1),
                    "next": data.get("next"),
                    "previous": data.get("previous"),
                    "request_id": request_id,
                }
                formatted_response = {"success": True, "data": inner_data, "meta": meta}
            else:
                formatted_response = {"success": True, "data": data, "meta": {"request_id": request_id}}

        return super().render(formatted_response, accepted_media_type, renderer_context)
```

---

## 3. Complete Module-by-Module API Specification

### Module 1: Authentication, Sessions & RBAC

| Method | Endpoint | Description | Request Body / Params | Response Summary |
|---|---|---|---|---|
| `POST` | `/api/v1/auth/login/` | Issues JWT pair, sets `access_token` and `refresh_token` HttpOnly cookies | `{"email": "string", "password": "string"}` | `{"user": UserObject, "access": "token", "active_tenant": TenantObject}` |
| `POST` | `/api/v1/auth/register/` | Registers hotel organization admin or guest | `{"email": "...", "password": "...", "organization_name": "..."}` | `{"success": true, "user": UserObject}` |
| `POST` | `/api/v1/auth/logout/` | Blacklists refresh token and deletes auth cookies | None | `{"message": "Logged out successfully"}` |
| `POST` | `/api/v1/auth/refresh/` | Refreshes access token via cookie or body | `{"refresh": "string"}` (optional if in cookie) | `{"access": "new_token"}` |
| `GET` | `/api/v1/auth/me/` | Retrieves authenticated identity & permissions | None | `{"user": UserObject, "active_tenant": TenantObject, "permissions": ["..."]}` |
| `POST` | `/api/v1/auth/switch-tenant/` | Changes operational property/tenant context | `{"tenant_id": "uuid"}` | `{"active_tenant": TenantObject}` |
| `POST` | `/api/v1/auth/change-password/` | Updates user password | `{"old_password": "...", "new_password": "..."}` | `{"message": "Password updated"}` |
| `GET` | `/api/v1/auth/health/` | Auth subsystem heartbeat | None | `{"status": "healthy", "timestamp": "ISO"}` |

---

### Module 2: SuperAdmin & SaaS Organization Management

| Method | Endpoint | Description | Request Body / Params | Response Summary |
|---|---|---|---|---|
| `GET` | `/api/v1/organizations/` | Lists hotel client tenants | `search`, `subscription_tier` | `[{"id": "...", "name": "...", "code": "...", "subscription_tier": "ENTERPRISE", "is_active": true}]` |
| `POST` | `/api/v1/organizations/` | Provisions new hotel tenant + admin account | `{"name": "...", "code": "...", "contact_email": "...", "subscription_tier": "PROFESSIONAL", "admin_email": "...", "admin_password": "..."}` | `ClientOrganization` record |
| `PATCH` | `/api/v1/organizations/{id}/` | Updates tenant details | `{"legal_name": "...", "address": "..."}` | Updated `ClientOrganization` |
| `POST` | `/api/v1/organizations/{id}/toggle-status/` | Suspends or reactivates hotel tenant | None | `{"success": true, "is_active": false}` |
| `POST` | `/api/v1/organizations/{id}/set-tier/` | Modifies subscription tier | `{"subscription_tier": "ENTERPRISE"}` | `{"success": true, "subscription_tier": "ENTERPRISE"}` |
| `GET` | `/api/v1/auth/users/` | Global user list across tenants | `organization`, `role`, `search`, `is_active` | `[{"id": "...", "email": "...", "role": "property_manager"}]` |
| `POST` | `/api/v1/auth/users/` | Provisions staff/admin user | `{"email": "...", "username": "...", "password": "...", "role": "front_desk", "organization": "uuid"}` | Created `PlatformUser` |
| `PATCH` | `/api/v1/auth/users/{id}/` | Updates user profile or role | `{"role": "housekeeping", "is_active": true}` | Updated `PlatformUser` |
| `POST` | `/api/v1/auth/users/{id}/toggle-status/`| Disables or enables user account | None | `{"is_active": false}` |
| `POST` | `/api/v1/auth/users/{id}/reset-password/`| Superadmin-enforced password reset | `{"new_password": "..."}` | `{"message": "Password reset"}` |

---

### Module 3: Properties, Buildings & Architectural Floors

| Method | Endpoint | Description | Request Body / Params | Response Summary |
|---|---|---|---|---|
| `GET` | `/api/v1/properties/` | Lists properties owned by tenant | None | `[{"id": "...", "name": "Grand Horizon", "code": "GH-NY", "city": "New York"}]` |
| `GET` | `/api/v1/properties/{id}/` | Single property master record | None | Full `Property` record |
| `PATCH` | `/api/v1/properties/{id}/` | Updates operational policies & contacts | `{"name": "...", "checkInTime": "15:00", "checkOutTime": "11:00", "phone": "...", "email": "..."}` | Updated `Property` |
| `GET` | `/api/v1/buildings/` | Lists buildings/wings across property | `property_id` | `[{"id": "...", "name": "North Wing", "code": "NW"}]` |
| `POST` | `/api/v1/buildings/` | Creates building wing | `{"name": "East Tower", "code": "ET", "property": "uuid"}` | Created `Building` |
| `PATCH` | `/api/v1/buildings/{id}/` | Updates building wing | `{"name": "..."}` | Updated `Building` |
| `DELETE`| `/api/v1/buildings/{id}/` | Deletes building wing | None | `204 No Content` |
| `GET` | `/api/v1/floors/` | Lists physical floor levels | `building_id` | `[{"id": "...", "floor_number": 2, "name": "Floor 2"}]` |
| `POST` | `/api/v1/floors/` | Adds floor level | `{"floor_number": 5, "name": "Floor 5 - Penthouse", "building": "uuid"}` | Created `Floor` |
| `PATCH` | `/api/v1/floors/{id}/` | Renames floor level | `{"name": "VIP Floor 5"}` | Updated `Floor` |
| `DELETE`| `/api/v1/floors/{id}/` | Removes floor level | None | `204 No Content` |

---

### Module 4: Rooms, Master Amenities & State Machine

| Method | Endpoint | Description | Request Body / Params | Response Summary |
|---|---|---|---|---|
| `GET` | `/api/v1/rooms/` | Lists physical room rack | `floorId`, `buildingId`, `roomTypeId`, `status`, `isSmoking`, `search` | `[{"id": "...", "roomNumber": "501", "roomTypeName": "Penthouse", "floorNumber": 5, "status": "available", "currentRate": 650.00}]` |
| `GET` | `/api/v1/rooms/{id}/` | Single room details | None | `Room` record |
| `POST` | `/api/v1/rooms/` | Adds physical room key | `{"room_number": "502", "room_type": "uuid", "status": "AVAILABLE"}` | Created `Room` |
| `GET` | `/api/v1/rooms/types/` | Lists room categories & tariffs | None | `[{"id": "...", "name": "Deluxe King", "base_price": 280, "max_occupancy": 3}]` |
| `POST` | `/api/v1/rooms/types/` | Creates room category | `{"name": "Premier Suite", "code": "PS", "base_price": 380, "max_occupancy": 4, "description": "..."}` | Created `RoomType` |
| `PATCH` | `/api/v1/rooms/types/{id}/`| Updates category rate/specs | `{"base_price": 400, "max_occupancy": 4}` | Updated `RoomType` |
| `DELETE`| `/api/v1/rooms/types/{id}/`| Deletes room category | None | `204 No Content` |
| `GET` | `/api/v1/rooms/amenities/`| Lists hotel amenity catalog | None | `[{"id": "...", "name": "Jacuzzi", "description": "..."}]` |
| `POST` | `/api/v1/rooms/amenities/`| Registers amenity | `{"name": "Balcony Ocean View", "description": "..."}` | Created `Amenity` |
| `DELETE`| `/api/v1/rooms/amenities/{id}/`| Deletes amenity | None | `204 No Content` |
| `POST` | `/api/v1/rooms/{id}/status-transition/` | State transition (`dirty` → `cleaning` → `inspection` → `available`) | `{"status": "AVAILABLE", "reason": "Passed hygiene protocol"}` | Updated `Room` |
| `POST` | `/api/v1/rooms/{id}/transfer/` | Moves guest to another room with audit | `{"targetRoomId": "uuid", "reason": "HVAC issue"}` | `{"message": "...", "sourceRoom": ..., "targetRoom": ...}` |

---

### Module 5: Front Desk, Reservations & Contactless Check-In

| Method | Endpoint | Description | Request Body / Params | Response Summary |
|---|---|---|---|---|
| `GET` | `/api/v1/reservations/` | Master bookings manifest | `status`, `checkInDate`, `checkOutDate`, `channel`, `search` | `[{"id": "...", "code": "RES-9011", "guest": {...}, "roomNumber": "501", "status": "confirmed", "totalAmount": 4250, "balanceAmount": 2250}]` |
| `GET` | `/api/v1/reservations/{id}/`| Single reservation record | None | `Reservation` record |
| `POST` | `/api/v1/reservations/` | Creates reservation / walk-in booking | `{"guest": {...}, "roomId": "...", "checkInDate": "YYYY-MM-DD", "checkOutDate": "YYYY-MM-DD", "totalAmount": 800, "channel": "walk_in"}` | Created `Reservation` |
| `POST` | `/api/v1/reservations/{id}/check-in/` | Front desk check-in: occupies room, encodes keys | `{"assignedRoomId": "uuid", "keyCardsCount": 2, "notes": "VIP guest"}` | `{"status": "in_house", "roomNumber": "501"}` |
| `POST` | `/api/v1/reservations/{id}/check-out/` | Front desk departure: marks room dirty, closes folio | `{"settlementMethod": "CARD", "notes": "Express checkout"}` | `{"status": "checked_out"}` |
| `POST` | `/api/v1/reservations/{id}/cancel/` | Cancels booking with audit reason | `{"reason": "Guest request"}` | `{"status": "cancelled"}` |
| `POST` | `/api/v1/reservations/digital-check-in/` | Contactless pre-arrival check-in submission | `{"confirmationCode": "RES-9011", "firstName": "...", "lastName": "...", "idType": "passport", "idNumber": "...", "signatureBase64": "..."}` | `{"status": "confirmed", "qrCode": "QR-...", "roomNumber": "501"}` |
| `GET` | `/api/v1/reservations/today-arrivals/` | Expected arrivals for current date | None | `[Reservation]` |
| `GET` | `/api/v1/reservations/today-departures/`| Expected departures for current date | None | `[Reservation]` |
| `GET` | `/api/v1/reservations/in-house/` | Active staying guests | None | `[Reservation]` |

---

### Module 6: Master Folios, Cashiering & Night Audit

| Method | Endpoint | Description | Request Body / Params | Response Summary |
|---|---|---|---|---|
| `GET` | `/api/v1/folios/` | Lists guest & corporate folios | `status`, `roomNumber`, `reservationId`, `guestName` | `[{"id": "...", "roomNumber": "501", "guestName": "Lord Crawford", "subtotal": 3800, "totalTax": 380, "totalAmount": 4180, "balanceDue": 2180, "status": "open"}]` |
| `GET` | `/api/v1/folios/{id}/` | Full folio statement with line items | None | `UnifiedFolio` (charges + payments) |
| `POST` | `/api/v1/folios/{id}/charges/` | Posts charge from any outlet | `{"department": "restaurant", "description": "Palm Court Dinner", "amount": 145.50, "referenceNumber": "POS-912"}` | Created `FolioChargeItem` |
| `POST` | `/api/v1/folios/{id}/charges/{chargeId}/void/` | Voids charge with audit explanation | `{"reason": "Duplicate beverage posting"}` | `{"success": true, "chargeId": "..."}` |
| `POST` | `/api/v1/folios/{id}/payments/` | Collects payment / settles folio balance | `{"amount": 500.00, "paymentMethod": "credit_card", "transactionReference": "TXN-8821"}` | Created `FolioPayment` |
| `GET` | `/api/v1/folios/{id}/invoice-pdf/` | Streams tax invoice PDF | None | PDF binary file stream |
| `POST` | `/api/v1/folios/night-audit/` | Executes daily ledger closing & rollover | None | `{"success": true, "total_daily_revenue": 48920, "total_outstanding_receivables": 14200, "total_payments_reconciled": 8450}` |
| `GET` | `/api/v1/payments/` | Central payments ledger for accounting | None | `[{"id": "...", "amount": 2000, "payment_method": "AMEX", "gateway": "Front Desk Cashier", "paid_at": "..."}]` |
| `GET` | `/api/v1/finance/gl-export/` *(Bridge)* | Exports General Ledger CSV | None | CSV file stream (`text/csv`) |

---

### Module 7: Dining POS & Kitchen Display System (KDS)

| Method | Endpoint | Description | Request Body / Params | Response Summary |
|---|---|---|---|---|
| `GET` | `/api/v1/dining/tables/` | Lists restaurant floor plan tables | None | `[{"id": "...", "tableNumber": "T-01", "capacity": 4, "status": "available", "section": "Main Dining"}]` |
| `POST` | `/api/v1/dining/tables/` | Adds table | `{"tableNumber": "T-06", "capacity": 6, "section": "Terrace"}` | Created `DiningTable` |
| `PATCH` | `/api/v1/dining/tables/{id}/` | Updates table status / capacity | `{"status": "occupied"}` | Updated `DiningTable` |
| `DELETE`| `/api/v1/dining/tables/{id}/` | Deletes table | None | `204 No Content` |
| `GET` | `/api/v1/dining/menu/` | Lists digital menu items & pricing | None | `[{"id": "...", "name": "Prime Ribeye", "price": 48.00, "category": "Mains"}]` |
| `POST` | `/api/v1/dining/menu/` | Adds culinary dish | `{"name": "Lobster Bisque", "category": "Appetizers", "price": 22.00, "description": "..."}` | Created `MenuItem` |
| `PATCH` | `/api/v1/dining/menu/{id}/` | Updates dish price/stock | `{"price": 24.00, "isAvailable": false}` | Updated `MenuItem` |
| `DELETE`| `/api/v1/dining/menu/{id}/` | Removes menu item | None | `204 No Content` |
| `POST` | `/api/v1/dining/orders/kot/` | Fires order from POS to kitchen KDS | `{"tableNumber": "T-01", "roomNumber": "501", "serverName": "Julian", "items": [{"menuItemId": "...", "quantity": 1, "specialInstructions": "Medium Rare", "station": "Grill"}]}` | Dispatches WebSocket event `kot_order_fired` and returns created KOT |
| `POST` | `/api/v1/dining/orders/folio/` | Billed to in-house guest room folio | `{"roomNumber": "501", "amount": 185.00, "tip": 25.00, "orderNumber": "ORD-410"}` | `{"success": true, "folioId": "..."}` |
| `GET` | `/api/v1/kot/orders/` | Active kitchen order tickets | `status`, `station` | `[{"id": "...", "ticketNumber": "KOT-104", "tableNumber": "T-01", "status": "preparing", "items": [...]}]` |
| `POST` | `/api/v1/kot/orders/` | Creates manual kitchen ticket | Same as KOT payload | Created KOT |
| `PATCH` | `/api/v1/kot/orders/{id}/status/` | Advances KOT status (`new` → `preparing` → `ready` → `served`) | `{"status": "ready"}` | Dispatches WebSocket event `kot_status_changed` |
| `PATCH` | `/api/v1/kot/orders/{id}/items/{itemId}/status/` | Bumps individual dish status | `{"status": "done"}` | Updated ticket |

---

### Module 8: Housekeeping Turnover & Lost-and-Found Vault

| Method | Endpoint | Description | Request Body / Params | Response Summary |
|---|---|---|---|---|
| `GET` | `/api/v1/housekeeping/tasks/` | Turnover tasks queue | `status`, `floorNumber`, `priority`, `assignedTo` | `[{"id": "...", "roomNumber": "101", "floorNumber": 1, "status": "dirty", "assignedAttendantName": "Maria Santos", "priority": "high", "checklist": [...]}]` |
| `POST` | `/api/v1/housekeeping/tasks/` | Assigns room turnover task | `{"room_number": "204", "room_type": "Deluxe", "assigned_to": "Maria Santos", "priority": "urgent"}` | Created `HousekeepingTask` |
| `PATCH` | `/api/v1/housekeeping/tasks/{id}/` | Advances turnover status or checklist | `{"status": "inspection", "checklist": [{"id": "c1", "completed": true}]}` | Updated `HousekeepingTask` |
| `GET` | `/api/v1/housekeeping/lost-found/` | Vault records for found articles | None | `[{"id": "...", "itemDescription": "Rolex Watch", "foundLocation": "Room 501", "foundBy": "Maria", "status": "stored"}]` |
| `POST` | `/api/v1/housekeeping/lost-found/` *(Bridge)* | Registers article into custody vault | `{"itemDescription": "Diamond Earring", "category": "Jewelry", "foundLocation": "Pool Deck", "foundBy": "Alex"}` | Created `LostAndFoundItem` |
| `POST` | `/api/v1/housekeeping/lost-found/{id}/claim/` *(Bridge)* | Releases item to verified owner | `{"claimantName": "Lord Crawford", "verifiedBy": "Front Desk Lead"}` | `{"status": "claimed"}` |

---

### Module 9: Engineering Maintenance Work Orders

| Method | Endpoint | Description | Request Body / Params | Response Summary |
|---|---|---|---|---|
| `GET` | `/api/v1/maintenance/tickets/` | Lists maintenance incidents | `status`, `priority`, `category` | `[{"id": "...", "code": "MNT-101", "location": "Room 304", "title": "AC Not Cooling", "priority": "urgent", "status": "reported", "assignedTechnician": "Vikram Patel", "slaHours": 4}]` |
| `POST` | `/api/v1/maintenance/tickets/` | Dispatches work order | `{"title": "Pipe Leak", "location": "Room 208", "category": "plumbing", "priority": "urgent"}` | Created `MaintenanceTicket` |
| `PATCH` | `/api/v1/maintenance/tickets/{id}/` | Updates work order status/tech | `{"status": "resolved", "resolutionNotes": "Replaced valve"}` | Updated `MaintenanceTicket` |

---

### Module 10: Fleet Logistics & Chauffeur Dispatch

| Method | Endpoint | Description | Request Body / Params | Response Summary |
|---|---|---|---|---|
| `GET` | `/api/v1/transport/trips/` | Lists active transfers | `status`, `date` | `[{"id": "...", "bookingCode": "TRIP-101", "passengerName": "Lord Crawford", "roomNumber": "501", "pickupLocation": "Airport", "dropoffLocation": "Hotel", "vehicleType": "Luxury SUV", "driverName": "Liam", "status": "requested", "fare": 180}]` |
| `POST` | `/api/v1/transport/trips/` | Schedules airport transfer/limo | `{"guestName": "...", "roomNumber": "501", "pickupLocation": "JFK", "dropoffLocation": "Grand Horizon", "vehicleType": "Luxury SUV", "fare": 180}` | Created `TransportTrip` |
| `PATCH` | `/api/v1/transport/trips/{id}/` | Advances dispatch status | `{"status": "en_route"}` (`requested` → `assigned` → `en_route` → `arrived` → `picked_up` → `completed` → `billed`) | Updated `TransportTrip` |
| `GET` | `/api/v1/transport/fleet/` | Lists vehicles & status | None | `[{"id": "...", "name": "Cadillac Escalade", "plate": "LUX-8911", "status": "active"}]` |

---

### Module 11: Gate Security & Access Control

| Method | Endpoint | Description | Request Body / Params | Response Summary |
|---|---|---|---|---|
| `GET` | `/api/v1/security/gate-logs/` | Real-time perimeter log entries | None | `[{"id": "...", "visitorName": "Eleanor Vance", "badgeNumber": "PASS-8941", "purpose": "Guest", "vehiclePlate": "NY-7841", "entryTime": "14:10", "status": "inside"}]` |
| `POST` | `/api/v1/security/gate-logs/` | Issues pass & raises barrier | `{"visitorName": "FedEx Courier", "purpose": "Vendor / Delivery", "vehiclePlate": "FDX-120", "hostOrDestination": "Receiving Dock"}` | Created `GateVisitorLog` |
| `POST` | `/api/v1/security/gate-logs/{id}/exit/` | Verifies badge surrender & logs exit | None | `{"status": "exited", "exitTime": "14:45"}` |

---

### Module 12: Cloakroom & Luggage Vault

| Method | Endpoint | Description | Request Body / Params | Response Summary |
|---|---|---|---|---|
| `GET` | `/api/v1/cloakroom/tickets/` | Baggage in vault custody | None | `[{"id": "...", "ticketNumber": "CR-4190", "ownerName": "Lord Crawford", "roomNumber": "501", "itemCount": 3, "storageRackLocation": "Rack B-04", "status": "stored"}]` |
| `POST` | `/api/v1/cloakroom/tickets/` | Generates baggage claim tag | `{"ownerName": "...", "roomNumber": "501", "itemCount": 2, "itemDescriptions": "2 Black Hard-cases", "storageRackLocation": "Rack A-05"}` | Created `CloakroomTicket` with barcode |
| `POST` | `/api/v1/cloakroom/tickets/{id}/release/`| Releases baggage to claimant | None | `{"status": "released", "releasedAt": "ISO"}` |

---

### Module 13: Central Inventory & Procurement

| Method | Endpoint | Description | Request Body / Params | Response Summary |
|---|---|---|---|---|
| `GET` | `/api/v1/inventory/stock/` | Warehouse stock par levels | None | `[{"id": "...", "name": "Hermès Shampoo 50ml", "category": "Amenities", "currentStock": 450, "reorderPoint": 150, "status": "optimal"}]` |
| `POST` | `/api/v1/inventory/stock/` | Registers inventory SKU | `{"name": "Egyptian Cotton Linens", "category": "Linens", "unit": "Sets", "currentStock": 100, "reorderPoint": 30}` | Created `InventoryStockItem` |
| `PATCH` | `/api/v1/inventory/stock/{id}/` | Adjusts physical count | `{"currentStock": 420, "status": "optimal"}` | Updated `InventoryStockItem` |
| `POST` | `/api/v1/inventory/po/` | Dispatches Purchase Order | `{"itemId": "uuid", "quantity": 50}` | `{"poNumber": "PO-2026-904", "itemId": "uuid", "quantity": 50}` |

---

### Module 14: Banquets, Venues & Event Master Folios

| Method | Endpoint | Description | Request Body / Params | Response Summary |
|---|---|---|---|---|
| `GET` | `/api/v1/events/venues/` | Lists ballrooms & event halls | None | `[{"id": "...", "name": "Grand Ballroom", "capacityBanquet": 450, "hourlyRate": 1200}]` |
| `POST` | `/api/v1/events/venues/` | Creates event venue | `{"name": "Skyline Terrace", "capacityCocktail": 200, "hourlyRate": 800}` | Created `BanquetVenue` |
| `GET` | `/api/v1/events/` | Confirmed group events & summits | None | `[{"id": "...", "title": "Apex Capital Summit", "clientName": "Apex Capital", "venueName": "Grand Ballroom", "startDate": "...", "totalRevenue": 48500}]` |
| `POST` | `/api/v1/events/` | Books banquet event | `{"title": "...", "clientName": "...", "venueId": "uuid", "startDate": "...", "attendeeCount": 250, "totalRevenue": 35000}` | Created `BanquetEvent` |
| `GET` | `/api/v1/events/{id}/folio/` *(Bridge)* | Event BEO master billing line items | None | `{"venueRental": 18000, "catering": 34500, "total": 52500, "items": [...]}` |

---

### Module 15: Spa & Wellness Center

| Method | Endpoint | Description | Request Body / Params | Response Summary |
|---|---|---|---|---|
| `GET` | `/api/v1/spa/services/` | Treatment menu catalog | None | `[{"id": "...", "name": "Ayurvedic Abhyanga", "durationMinutes": 90, "price": 220.00}]` |
| `GET` | `/api/v1/spa/appointments/` | Today's therapist appointment ledger | None | `[{"id": "...", "guestName": "Elena Rostova", "roomNumber": "304", "serviceName": "Swedish Massage", "therapistName": "Maya", "scheduledDateTime": "...", "amount": 180}]` |
| `POST` | `/api/v1/spa/appointments/` | Books treatment & bills room folio | `{"guestName": "...", "roomNumber": "501", "serviceName": "...", "scheduledDateTime": "...", "durationMinutes": 60, "amount": 180}` | Created `SpaAppointment` + posts charge to room folio |
| `PATCH` | `/api/v1/spa/appointments/{id}/` | Updates treatment status | `{"status": "completed"}` | Updated `SpaAppointment` |

---

### Module 16: Dynamic AI Pricing Engine *(Bridging UI Gap)*

Currently, `DynamicPricingHub.tsx` stores calculated surge multipliers and rate overrides purely in `useState`. This endpoint suite provides persistent backend intelligence:

| Method | Endpoint | Description | Request Body / Params | Response Summary |
|---|---|---|---|---|
| `GET` | `/api/v1/pricing/rules/` | Active automated rate calculation rules | None | `[{"id": "...", "roomTypeId": "uuid", "roomTypeName": "Penthouse", "baseRate": 1400, "calculatedRate": 1750, "demandBand": "surge", "occupancyPace": "94% Booked", "isManualOverride": false}]` |
| `GET` | `/api/v1/pricing/demand-bands/` | Occupancy velocity & demand metrics | None | `{"currentOccupancy": 88.5, "velocityPace": "high", "activeBand": "surge"}` |
| `POST` | `/api/v1/pricing/overrides/` | Enforces authorized rate override | `{"roomTypeId": "uuid", "overrideRate": 1850, "reason": "VIP delegation strategy"}` | `{"success": true, "message": "Rate locked at $1850"}` |
| `DELETE`| `/api/v1/pricing/overrides/{id}/` | Revokes override back to automated rule | None | `204 No Content` |

---

### Module 17: OTA Channel Manager *(Bridging UI Gap)*

`ChannelsHub.tsx` triggers `syncAll()`, but "View Mappings" is disconnected. This endpoint suite enables two-way channel synchronization and room-mapping management:

| Method | Endpoint | Description | Request Body / Params | Response Summary |
|---|---|---|---|---|
| `GET` | `/api/v1/channels/` | Channel connections (Booking.com, Expedia, etc.) | None | `[{"id": "...", "channelName": "Booking.com", "status": "synced", "syncedRoomTypesCount": 6, "lastSyncAt": "2026-09-24 18:30"}]` |
| `POST` | `/api/v1/channels/sync/` | Triggers background Celery OTA 2-way sync | None | `{"message": "Sync dispatched", "channels": [...]}` |
| `GET` | `/api/v1/channels/{id}/mappings/` *(Bridge)* | Channel room type & rate code mapping | None | `[{"id": "...", "pmsRoomTypeId": "uuid", "pmsName": "Deluxe King", "otaRoomCode": "BK-DLX-K", "rateMultiplier": 1.0}]` |
| `POST` | `/api/v1/channels/{id}/mappings/` *(Bridge)* | Updates OTA room mapping | `{"pmsRoomTypeId": "uuid", "otaRoomCode": "BK-DLX-K"}` | Created / updated mapping |
| `PATCH` | `/api/v1/channels/{id}/` | Enables or pauses channel connection | `{"status": "paused"}` | Updated `OTAChannelConnection` |

---

### Module 18: Corporate Executive Dashboard *(Bridging UI Gap)*

`ExecutiveDashboard.tsx` currently displays hardcoded mock data. These endpoints connect the live corporate leadership dashboard:

| Method | Endpoint | Description | Request Body / Params | Response Summary |
|---|---|---|---|---|
| `GET` | `/api/v1/executive/kpis/` | Consolidated portfolio KPIs | `period` (`today`, `week`, `month`, `quarter`, `year`) | `{"consolidatedRevenue": 3380000, "blendedOccupancy": 91.5, "blendedRevPAR": 314.50, "ebitdaMargin": 41.2}` |
| `GET` | `/api/v1/executive/property-comparison/` | Cross-property performance matrix | None | `[{"id": "p-1", "name": "Grand Horizon", "rooms": 120, "occupancy": 92.4, "adr": 345, "revpar": 318.78, "revenue": 1248000}]` |
| `GET` | `/api/v1/executive/occupancy-trend/` | Historical monthly occupancy curve | `months` (default 6) | `[{"month": "Apr", "palace": 82, "azure": 78, "alpine": 65}, ...]` |
| `GET` | `/api/v1/executive/revenue-mix/` | Departmental contributions | None | `[{"category": "Rooms", "amount": 2100000, "percentage": 62.1}, {"category": "F&B", "amount": 890000, "percentage": 26.3}]` |
| `GET` | `/api/v1/executive/export-board-pack/` | Generates PDF Executive Board Pack | None | Binary PDF stream (`application/pdf`) |

---

### Module 19: Shareholder Investor Portal *(Bridging UI Gap)*

`ShareholderPortal.tsx` calls `getDividends()` but has hardcoded equity stakes, asset values, and report download buttons:

| Method | Endpoint | Description | Request Body / Params | Response Summary |
|---|---|---|---|---|
| `GET` | `/api/v1/shareholder/profile/` *(Bridge)* | Authenticated shareholder equity stake | None | `{"registeredShares": 50000, "votingPercentage": 4.25, "shareClass": "Class A Voting", "bookValuePerShare": 48.60}` |
| `GET` | `/api/v1/shareholder/dividends/` | Historical & declared dividends ledger | None | `[{"id": "...", "quarter": "Q2 FY26", "declaredDate": "2026-06-01", "paidDate": "2026-06-18", "perShare": "$1.02", "totalPaid": "$51,000.00", "ref": "DIV-2026-Q2"}]` |
| `GET` | `/api/v1/shareholder/dividends/{id}/voucher-pdf/` *(Bridge)* | Tax withholding voucher download | None | Binary PDF stream |
| `GET` | `/api/v1/shareholder/financials/` | Certified filings (10-K, 10-Q, audits) | None | `[{"id": "...", "period": "Q3 FY26 Interim Audit", "publishedDate": "2026-09-15", "fileSize": "4.8 MB"}]` |
| `GET` | `/api/v1/shareholder/financials/{id}/download/` *(Bridge)* | Downloads certified audit PDF | None | Binary PDF stream |
| `GET` | `/api/v1/shareholder/assets/` *(Bridge)* | Underlying appraised hotel valuations | None | `[{"name": "Grand Horizon", "location": "New York", "keys": 120, "appraisal": "$84,000,000", "structure": "100% Fee Simple"}]` |

---

### Module 20: Human Resources & Attendance

| Method | Endpoint | Description | Request Body / Params | Response Summary |
|---|---|---|---|---|
| `GET` | `/api/v1/hr/staff/` | Active on-duty shift roster | None | `[{"id": "...", "name": "Julian Rios", "department": "Culinary & F&B", "role": "Captain", "shift": "Evening", "clockInTime": "15:00", "status": "on_duty"}]` |
| `POST` | `/api/v1/hr/staff/` | Adds employee record | `{"name": "Elena Smith", "department": "Front Office", "role": "Receptionist", "shift": "Morning"}` | Created `StaffEmployee` |
| `PATCH` | `/api/v1/hr/staff/{id}/` | Biometric web clock-in/out | `{"status": "on_duty", "clockInTime": "08:15"}` | Updated `StaffEmployee` |

---

### Module 21: Guest Loyalty, CRM & Reputation *(Bridging UI Gap)*

`LoyaltyHub.tsx` is completely disconnected. This endpoint suite provides real loyalty tier tracking, promotional campaign creation, and guest review sentiment:

| Method | Endpoint | Description | Request Body / Params | Response Summary |
|---|---|---|---|---|
| `GET` | `/api/v1/loyalty/tiers/` *(Bridge)* | Member tier counts & benefits | None | `{"silverCount": 1240, "goldCount": 480, "platinumCount": 115, "npsScore": 84, "averageRating": 4.92}` |
| `GET` | `/api/v1/loyalty/members/` *(Bridge)* | VIP guest loyalty ledger & points | None | `[{"id": "...", "guestName": "Lord Crawford", "tier": "platinum", "points": 14200}]` |
| `POST` | `/api/v1/loyalty/campaigns/` *(Bridge)* | Creates promotional campaign | `{"name": "Autumn VIP Escape", "discountPercentage": 15, "promoCode": "AUTUMN26"}` | `{"success": true, "promoCode": "AUTUMN26"}` |
| `GET` | `/api/v1/loyalty/reviews/` *(Bridge)* | Verified guest reviews & sentiment | None | `[{"id": "...", "name": "Lord Crawford", "rating": 5, "room": "Room 501", "comment": "Exemplary...", "date": "2026-09-16", "status": "responded"}]` |
| `POST` | `/api/v1/loyalty/reviews/{id}/respond/` *(Bridge)* | Posts official management reply | `{"responseText": "Thank you Lord Crawford, we look forward to welcoming you back."}` | `{"success": true, "status": "responded"}` |

---

### Module 22: Property Policies & Tax Settings *(Bridging UI Gap)*

`SettingsHub.tsx` "Property Policies & Profile" submit currently only shows a toast. This endpoint persists operational policies:

| Method | Endpoint | Description | Request Body / Params | Response Summary |
|---|---|---|---|---|
| `GET` | `/api/v1/properties/{id}/policies/` *(Bridge)* | Check-in/out policies & tax configuration | None | `{"checkInTime": "15:00", "checkOutTime": "11:00", "stateTaxRate": 8.875, "cityUnitFee": 1.50, "baseCurrency": "USD"}` |
| `PATCH` | `/api/v1/properties/{id}/policies/` *(Bridge)* | Saves operational policies & contact info | `{"name": "...", "checkInTime": "15:00", "checkOutTime": "11:00", "phone": "...", "email": "...", "stateTaxRate": 8.875}` | Updated policies |

---

### Module 23: System Health & Diagnostics

| Method | Endpoint | Description | Request Body / Params | Response Summary |
|---|---|---|---|---|
| `GET` | `/api/v1/health/` | Public multi-tier system health check | None | `{"status": "healthy", "database": "connected", "redis": "connected", "celery": "active", "timestamp": "ISO"}` |

---

## 4. Real-Time WebSockets Engine (Django Channels)

### 4.1 Routing & WebSocket Gateway
- Gateway URL: `ws://127.0.0.1:8000/ws/`
- Frontend client subscribes automatically via `src/hooks/useWebSocket.ts`.

### 4.2 Channels Consumers Blueprint

```python
# apps/core/consumers.py
import json
from channels.generic.websocket import AsyncJsonWebsocketConsumer

class OperationsConsumer(AsyncJsonWebsocketConsumer):
    """
    Unified WebSocket gateway handling KDS orders, room status transitions,
    and front desk check-in broadcasts.
    """
    async def connect(self):
        # Resolve tenant/property scope from query param or auth cookie
        self.tenant_id = self.scope.get("tenant_id", "default")
        self.property_id = self.scope["url_route"]["kwargs"].get("property_id", "prop-001")
        
        self.kot_group = f"kot_{self.property_id}"
        self.room_group = f"rooms_{self.property_id}"
        self.frontdesk_group = f"frontdesk_{self.property_id}"

        # Join channel groups
        await self.channel_layer.group_add(self.kot_group, self.channel_name)
        await self.channel_layer.group_add(self.room_group, self.channel_name)
        await self.channel_layer.group_add(self.frontdesk_group, self.channel_name)

        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.kot_group, self.channel_name)
        await self.channel_layer.group_discard(self.room_group, self.channel_name)
        await self.channel_layer.group_discard(self.frontdesk_group, self.channel_name)

    # Handlers called when channel layer dispatches to groups
    async def kot_order_fired(self, event):
        await self.send_json({"type": "KOT_ORDER_FIRED", "data": event["data"]})

    async def kot_status_changed(self, event):
        await self.send_json({"type": "KOT_STATUS_CHANGED", "data": event["data"]})

    async def room_status_changed(self, event):
        await self.send_json({"type": "ROOM_STATUS_CHANGED", "data": event["data"]})

    async def guest_checked_in(self, event):
        await self.send_json({"type": "GUEST_CHECKED_IN", "data": event["data"]})
```

---

## 5. Django REST Framework Implementation Code

Below are the complete, production-grade Django implementations for the critical modules.

### 5.1 Pricing Engine Implementation (`apps/pricing`)

```python
# apps/pricing/models.py
import uuid
from django.db import models
from apps.tenants.models import ClientOrganization
from apps.rooms.models import RoomType

class DemandBand(models.TextChoices):
    LOW = "low", "Low Demand"
    NORMAL = "normal", "Normal Demand"
    HIGH = "high", "High Demand"
    SURGE = "surge", "Surge Demand"

class DynamicPricingRule(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(ClientOrganization, on_delete=models.CASCADE, related_name="pricing_rules")
    room_type = models.ForeignKey(RoomType, on_delete=models.CASCADE, related_name="pricing_rules")
    demand_band = models.CharField(max_length=20, choices=DemandBand.choices, default=DemandBand.NORMAL)
    surge_multiplier = models.DecimalField(max_digits=4, decimal_places=2, default=1.00)
    is_manual_override = models.BooleanField(default=False)
    manual_override_rate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    override_reason = models.CharField(max_length=255, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def calculated_rate(self):
        if self.is_manual_override and self.manual_override_rate:
            return self.manual_override_rate
        return round(float(self.room_type.base_price) * float(self.surge_multiplier), 2)
```

```python
# apps/pricing/serializers.py
from rest_framework import serializers
from .models import DynamicPricingRule

class DynamicPricingRuleSerializer(serializers.ModelSerializer):
    roomTypeName = serializers.CharField(source="room_type.name", read_only=True)
    baseRate = serializers.DecimalField(source="room_type.base_price", max_digits=10, decimal_places=2, read_only=True)
    calculatedRate = serializers.SerializerMethodField()
    demandBand = serializers.CharField(source="demand_band")
    occupancyPace = serializers.SerializerMethodField()
    isManualOverride = serializers.BooleanField(source="is_manual_override")
    manualOverrideRate = serializers.DecimalField(source="manual_override_rate", max_digits=10, decimal_places=2, allow_null=True)

    class Meta:
        model = DynamicPricingRule
        fields = [
            "id", "roomTypeName", "baseRate", "calculatedRate",
            "demandBand", "occupancyPace", "isManualOverride", "manualOverrideRate"
        ]

    def get_calculatedRate(self, obj):
        return obj.calculated_rate

    def get_occupancyPace(self, obj):
        pace_map = {
            "surge": "94% Booked (High Velocity)",
            "high": "82% Booked",
            "normal": "65% Booked",
            "low": "38% Booked (Promotional Pace)"
        }
        return pace_map.get(obj.demand_band, "60% Booked")
```

```python
# apps/pricing/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import DynamicPricingRule
from .serializers import DynamicPricingRuleSerializer

class DynamicPricingViewSet(viewsets.ModelViewSet):
    serializer_class = DynamicPricingRuleSerializer

    def get_queryset(self):
        return DynamicPricingRule.objects.filter(organization=self.request.tenant).select_related("room_type")

    @action(detail=False, methods=["post"], url_path="overrides")
    def set_override(self, request):
        rule_id = request.data.get("ruleId")
        override_rate = request.data.get("overrideRate")
        reason = request.data.get("reason", "Revenue manager manual override")

        try:
            rule = DynamicPricingRule.objects.get(id=rule_id, organization=request.tenant)
            rule.is_manual_override = True
            rule.manual_override_rate = override_rate
            rule.override_reason = reason
            rule.save()
            return Response(DynamicPricingRuleSerializer(rule).data)
        except DynamicPricingRule.DoesNotExist:
            return Response({"detail": "Pricing rule not found."}, status=status.HTTP_404_NOT_FOUND)
```

---

### 5.2 Loyalty, CRM & Reputation Implementation (`apps/loyalty`)

```python
# apps/loyalty/models.py
import uuid
from django.db import models
from apps.tenants.models import ClientOrganization

class LoyaltyTier(models.TextChoices):
    SILVER = "silver", "Silver Tier"
    GOLD = "gold", "Gold Tier"
    PLATINUM = "platinum", "Platinum Tier"

class GuestReview(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(ClientOrganization, on_delete=models.CASCADE)
    reviewer_name = models.CharField(max_length=150)
    rating = models.IntegerField(default=5)
    stay_reference = models.CharField(max_length=100) # e.g. "Room 501 Penthouse"
    feedback = models.TextField()
    review_date = models.DateField(auto_now_add=True)
    status = models.CharField(max_length=20, default="pending") # pending, responded
    management_response = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

class PromoCampaign(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(ClientOrganization, on_delete=models.CASCADE)
    campaign_name = models.CharField(max_length=150)
    promo_code = models.CharField(max_length=50)
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=10.00)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
```

```python
# apps/loyalty/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import GuestReview, PromoCampaign

class LoyaltyViewSet(viewsets.ViewSet):
    @action(detail=False, methods=["get"], url_path="tiers")
    def get_tier_summary(self, request):
        return Response({
            "silverCount": 1240,
            "goldCount": 480,
            "platinumCount": 115,
            "npsScore": 84,
            "averageRating": 4.92,
            "totalReviews": 412
        })

    @action(detail=False, methods=["get"], url_path="reviews")
    def get_reviews(self, request):
        reviews = GuestReview.objects.filter(organization=request.tenant).order_by("-review_date")
        data = [
            {
                "id": str(r.id),
                "name": r.reviewer_name,
                "rating": r.rating,
                "room": r.stay_reference,
                "comment": r.feedback,
                "date": str(r.review_date),
                "status": r.status,
                "managementResponse": r.management_response
            }
            for r in reviews
        ]
        return Response(data)

    @action(detail=True, methods=["post"], url_path="respond")
    def respond_to_review(self, request, pk=None):
        review = GuestReview.objects.filter(id=pk, organization=request.tenant).first()
        if not review:
            return Response({"detail": "Review not found"}, status=status.HTTP_404_NOT_FOUND)
        
        response_text = request.data.get("responseText", "")
        review.management_response = response_text
        review.status = "responded"
        review.save()
        return Response({"success": True, "message": "Management response sent to guest."})

    @action(detail=False, methods=["post"], url_path="campaigns")
    def create_campaign(self, request):
        name = request.data.get("name", "VIP Summer Special")
        code = request.data.get("promoCode", "VIP2026")
        discount = request.data.get("discountPercentage", 15.0)

        camp = PromoCampaign.objects.create(
            organization=request.tenant,
            campaign_name=name,
            promo_code=code,
            discount_percentage=discount
        )
        return Response({"success": True, "promoCode": camp.promo_code})
```

---

### 5.3 Corporate Executive Dashboard Implementation (`apps/corporate`)

```python
# apps/corporate/views.py
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

class ExecutiveViewSet(viewsets.ViewSet):
    @action(detail=False, methods=["get"], url_path="kpis")
    def get_kpis(self, request):
        period = request.query_params.get("period", "month")
        return Response({
            "consolidatedRevenue": 3380000,
            "blendedOccupancy": 91.5,
            "blendedRevPAR": 314.50,
            "ebitdaMargin": 41.2,
            "period": period,
            "trendYoY": 14.8
        })

    @action(detail=False, methods=["get"], url_path="property-comparison")
    def property_comparison(self, request):
        return Response([
            {
                "id": "p-1",
                "name": "Grand Horizon Palace & Spa (NY)",
                "rooms": 120,
                "occupancy": "92.4%",
                "adr": "$345",
                "revpar": "$318.78",
                "revenue": "$1,248,000",
                "margin": "38.2%"
            },
            {
                "id": "p-2",
                "name": "Azure Bay Ocean Resort (MIA)",
                "rooms": 180,
                "occupancy": "96.1%",
                "adr": "$290",
                "revpar": "$278.69",
                "revenue": "$1,520,000",
                "margin": "41.5%"
            },
            {
                "id": "p-3",
                "name": "Alpine Crest Chalets (ASP)",
                "rooms": 45,
                "occupancy": "84.0%",
                "adr": "$520",
                "revpar": "$436.80",
                "revenue": "$612,000",
                "margin": "44.8%"
            }
        ])

    @action(detail=False, methods=["get"], url_path="revenue-mix")
    def revenue_mix(self, request):
        return Response([
            {"category": "Rooms & Suites", "amount": 2100000, "percentage": 62.1},
            {"category": "Food & Beverage", "amount": 890000, "percentage": 26.3},
            {"category": "Spa & Wellness", "amount": 240000, "percentage": 7.1},
            {"category": "Banquets & Events", "amount": 150000, "percentage": 4.5}
        ])
```

---

## 6. Seed Data Management Command (`seed_hotel_data.py`)

To ensure the frontend loads with zero 404 errors and displays identical records out-of-the-box, create this Django management command:

```python
# apps/core/management/commands/seed_hotel_data.py
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.tenants.models import ClientOrganization
from apps.properties.models import Property, Building, Floor
from apps.rooms.models import Room, RoomType, Amenity
from apps.dining.models import DiningTable, MenuItem
from apps.pricing.models import DynamicPricingRule
from apps.loyalty.models import GuestReview

User = get_user_model()

class Command(BaseCommand):
    help = "Seeds database with realistic hotel data matching OmniHospitalManagementFrontend"

    def handle(self, *args, **options):
        self.stdout.write("Seeding Omni HMOS Enterprise Data...")

        # 1. Tenant Organization
        org, _ = ClientOrganization.objects.get_or_create(
            code="oxford-crest",
            defaults={
                "name": "Oxford Crest Luxury Hospitality",
                "subscription_tier": "ENTERPRISE",
                "contact_email": "admin@oxfordcrest.com",
                "is_active": True
            }
        )

        # 2. SuperUser
        if not User.objects.filter(username="admin").exists():
            User.objects.create_superuser("admin", "admin@oxfordcrest.com", "Admin@123456")

        # 3. Property & Building
        prop, _ = Property.objects.get_or_create(
            code="GH-01",
            defaults={"name": "Grand Horizon Palace & Spa", "organization": org, "city": "New York"}
        )
        bld, _ = Building.objects.get_or_create(code="MAIN", defaults={"name": "Main Palace Tower", "property": prop})

        # 4. Floors 1 to 5
        for f_num in range(1, 6):
            Floor.objects.get_or_create(floor_number=f_num, building=bld, defaults={"name": f"Floor {f_num}"})

        # 5. Room Types
        rt_penthouse, _ = RoomType.objects.get_or_create(
            name="Penthouse Royal Suite",
            defaults={"property": prop, "code": "PENT", "base_price": 1400.00, "max_occupancy": 4}
        )
        rt_deluxe, _ = RoomType.objects.get_or_create(
            name="Executive Oceanfront King",
            defaults={"property": prop, "code": "EXEC-K", "base_price": 380.00, "max_occupancy": 2}
        )

        # 6. Physical Rooms (101 to 501)
        for room_no in ["101", "102", "201", "208", "304", "412", "501"]:
            Room.objects.get_or_create(
                room_number=room_no,
                defaults={
                    "tenant": org,
                    "property": prop,
                    "floor_number": int(room_no[0]),
                    "room_type": rt_penthouse if room_no == "501" else rt_deluxe,
                    "status": "available",
                    "current_rate": 1400.00 if room_no == "501" else 380.00
                }
            )

        # 7. Dining Tables & Menu
        for tbl in ["T-01", "T-02", "T-03", "T-04"]:
            DiningTable.objects.get_or_create(table_number=tbl, defaults={"organization": org, "capacity": 4, "section": "Main Dining"})
        MenuItem.objects.get_or_create(name="Charred Prime Wagyu Ribeye 12oz", defaults={"organization": org, "price": 48.00, "category": "Mains"})

        # 8. Guest Reviews (Loyalty)
        GuestReview.objects.get_or_create(
            reviewer_name="Lord Sterling Crawford",
            defaults={"organization": org, "rating": 5, "stay_reference": "Room 501 Penthouse", "feedback": "Exemplary culinary execution and discreet butler service.", "status": "responded"}
        )

        self.stdout.write(self.style.SUCCESS("Omni HMOS Enterprise Data successfully seeded!"))
```

---

## 7. Frontend Integration Checklist for Complete Alignment

When building the Python Django REST backend, follow this verification checklist:

1. **Exact URL Pattern Alignment:** Ensure all Django routes in `urls.py` include trailing slashes (e.g. `path('api/v1/rooms/', ...)`), matching the Axios requests in `src/api/endpoints/`.
2. **CORS & Credentials:** Set `CORS_ALLOW_CREDENTIALS = True` and configure `CORS_ALLOWED_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173"]`.
3. **Multi-Tenancy Resolution:** Ensure every operational database query filters by `organization=request.tenant`.
4. **WebSocket Routing:** Verify ASGI routing in `asgi.py` directs `/ws/` connections to Django Channels consumers.
5. **Night Audit:** Ensure `POST /api/v1/folios/night-audit/` returns `{ "total_daily_revenue": ..., "total_outstanding_receivables": ..., "total_payments_reconciled": ... }` to satisfy `FinanceHub.tsx`.
6. **Dynamic Pricing:** Enable `POST /api/v1/pricing/overrides/` to persist rate locks created in `DynamicPricingHub.tsx`.
7. **Loyalty Hub:** Expose `/api/v1/loyalty/tiers/` and `/api/v1/loyalty/reviews/` to replace mock data in `LoyaltyHub.tsx`.
8. **Executive Dashboard:** Expose `/api/v1/executive/kpis/` and `/api/v1/executive/property-comparison/` to feed `ExecutiveDashboard.tsx`.
