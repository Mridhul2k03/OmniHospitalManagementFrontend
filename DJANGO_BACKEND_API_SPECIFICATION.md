# Django REST Framework Backend API Specification
## Hospitality Management Operating System (HMOS) & Enterprise SaaS

**Target Framework:** Python 3.12+ / Django 5.x / Django REST Framework 3.15+ / Django Channels (WebSockets)  
**Standard Version:** `v1.0.0`  
**Base URL:** `http://127.0.0.1:8000/api/v1/`  
**WebSocket Gateway:** `ws://127.0.0.1:8000/ws/`  
**Authoritative Frontend Client:** OmniHospitalManagementFrontend (React 19 + TypeScript + Vite + Tailwind CSS)

---

## Table of Contents
1. [Architectural Protocols & Middleware](#1-architectural-protocols--middleware)
   - [Cookie Authentication & Security Headers](#11-cookie-authentication--security-headers)
   - [Multi-Tenancy Resolution Middleware](#12-multi-tenancy-resolution-middleware)
   - [Standard Response & Error Envelopes](#13-standard-response--error-envelopes)
   - [Pagination Specification](#14-pagination-specification)
2. [Module-by-Module API Endpoints Reference](#2-module-by-module-api-endpoints-reference)
   - [1. Front Office & Stays Management](#21-front-office--stays-management)
   - [2. Rooms, Matrix & Availability Engine](#22-rooms-matrix--availability-engine)
   - [3. Reservations & Contactless Digital Check-In](#23-reservations--contactless-digital-check-in)
   - [4. Unified Master Folios, Billing & Payments](#24-unified-master-folios-billing--payments)
   - [5. Food & Beverage, Restaurant POS & Kitchen KDS](#25-food--beverage-restaurant-pos--kitchen-kds)
   - [6. Housekeeping Turnover & Lost & Found Vault](#26-housekeeping-turnover--lost--found-vault)
   - [7. Engineering & Maintenance Work Orders](#27-engineering--maintenance-work-orders)
   - [8. Banquets & Group Events](#28-banquets--group-events)
   - [9. Spa & Wellness Center](#29-spa--wellness-center)
   - [10. Inventory & Procurement](#210-inventory--procurement)
   - [11. Fleet Transport & Chauffeur Dispatch](#211-fleet-transport--chauffeur-dispatch)
   - [12. Gate Security Checkpoint & Visitor Passes](#212-gate-security-checkpoint--visitor-passes)
   - [13. Cloakroom & Luggage Vault](#213-cloakroom--luggage-vault)
   - [14. Dynamic Pricing Engine & OTA Channels](#214-dynamic-pricing-engine--ota-channels)
   - [15. Corporate Governance & Shareholder Portal](#215-corporate-governance--shareholder-portal)
3. [Real-time WebSockets Specification (Django Channels)](#3-real-time-websockets-specification-django-channels)
4. [Django Implementation Blueprint (Models, Serializers, Views)](#4-django-implementation-blueprint-models-serializers-views)

---

## 1. Architectural Protocols & Middleware

### 1.1 Cookie Authentication & Security Headers
The backend authentication uses secure, HttpOnly cookies for browser clients, with automatic fallback to standard Bearer JWT headers:

| Cookie / Header | Type | Value / Purpose |
|---|---|---|
| `Set-Cookie: access_token` | HttpOnly Cookie | 60-minute JWT token (`Path=/`, `SameSite=Lax`, `HttpOnly`, `Secure` in prod). |
| `Set-Cookie: refresh_token`| HttpOnly Cookie | 7-day token refresh cookie (`Path=/api/v1/auth/refresh/`, `SameSite=Lax`, `HttpOnly`). |
| `Authorization` | Request Header | `Bearer <access_token>` (Dual-mode fallback). |
| `X-Tenant-ID` | Request Header | Institutional/Property Tenant UUID or Slug (`oxford-crest`, `prop-001`). Mandatory on tenant-scoped routes. |
| `X-Request-ID` | Request Header | Unique client UUID for distributed logging and audit entries. |

### 1.2 Multi-Tenancy Resolution Middleware
Create a Django Middleware (`TenantResolutionMiddleware`):
```python
# middleware.py
class TenantResolutionMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        tenant_header = request.headers.get("X-Tenant-ID")
        request.tenant = None
        if tenant_header:
            from apps.tenants.models import Tenant
            try:
                if is_valid_uuid(tenant_header):
                    request.tenant = Tenant.objects.get(id=tenant_header, is_active=True)
                else:
                    request.tenant = Tenant.objects.get(slug=tenant_header, is_active=True)
            except Tenant.DoesNotExist:
                pass
        return self.get_response(request)
```

### 1.3 Standard Response & Error Envelopes

#### Success Envelope (`200 OK`, `201 Created`):
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "request_id": "9f323df4-6663-4ce4-82a1-ebfcf8951db4"
  }
}
```

#### Error Envelope (`400`, `401`, `403`, `404`, `500`):
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "No active account found with the given credentials.",
    "details": {
      "field_name": ["Specific field error."]
    }
  },
  "meta": {
    "request_id": "a9649d33-12bb-43b1-a3f4-4c70a3625cc6"
  }
}
```

### 1.4 Pagination Specification
All listing endpoints implement `StandardResultsSetPagination`:
```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "count": 142,
    "total_pages": 6,
    "current_page": 1,
    "page_size": 25,
    "next": "http://127.0.0.1:8000/api/v1/endpoint/?page=2",
    "previous": null,
    "request_id": "e924f4ec-fa2d-454b-b865-b3c1f7666e91"
  }
}
```

---

## 2. Module-by-Module API Endpoints Reference

### 2.1 Front Office & Stays Management

#### `POST /api/v1/frontoffice/check-in/`
Executes guest check-in: validates reservation state, transitions room to `occupied`, generates digital key card, and creates active `Stay` session.
- **Request Body:**
```json
{
  "reservation_id": "782806ff-e737-4f68-b7a4-ef79a613589b",
  "assigned_room_id": "e920630b-d24a-436f-8083-d5d85c88b901",
  "key_card_count": 2,
  "id_document_type": "passport",
  "id_document_number": "PA-9920141",
  "signature_data_url": "data:image/png;base64,...",
  "special_notes": "Late checkout requested."
}
```
- **Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Check-in completed successfully. Room 201 occupied.",
  "data": {
    "stay_id": "c3e414c2-9e19-482a-a92e-3d8fa1c4a001",
    "room_number": "201",
    "guest_name": "Dr. Eleanor Vance",
    "check_in_time": "2026-09-20T14:30:00Z"
  }
}
```

#### `POST /api/v1/frontoffice/check-out/`
Executes departure: verifies zero-balance folio (or settles remaining), marks room `dirty`, and releases stay.
- **Request Body:**
```json
{
  "stay_id": "c3e414c2-9e19-482a-a92e-3d8fa1c4a001",
  "settlement_method": "card",
  "notes": "Express checkout verified."
}
```

#### `POST /api/v1/frontoffice/transfer-room/`
Transfers active guest to another room with mandatory audit reason.
- **Request Body:**
```json
{
  "current_room_id": "e920630b-d24a-436f-8083-d5d85c88b901",
  "target_room_id": "f512720a-e35b-437a-9094-e6e96d99c902",
  "reason": "AC compressor malfunction in original room."
}
```

#### `GET /api/v1/frontoffice/stays/`
Lists current active stays. Filters: `status` (`in_house`, `checked_out`), `search`.

---

### 2.2 Rooms, Matrix & Availability Engine

#### `GET /api/v1/rooms/rooms/`
Lists all physical rooms scoped to active tenant/property.
- **Query Filters:** `floor_id`, `building_id`, `room_type_id`, `status` (`available`, `occupied`, `dirty`, `cleaning`, `inspection`, `maintenance`, `reserved`, `blocked`).

#### `POST /api/v1/rooms/rooms/{id}/status-transition/`
State machine transition endpoint (e.g. `dirty` → `cleaning` → `inspection` → `available`).
- **Request Body:**
```json
{
  "status": "available",
  "reason": "Turnover inspection passed by Lead Supervisor."
}
```

#### `GET /api/v1/availability/search/`
Real-time availability matrix for dates and guest occupancy.
- **Query Params:** `check_in_date` (`YYYY-MM-DD`), `check_out_date` (`YYYY-MM-DD`), `adults`, `children`, `room_type`.

#### `GET /api/v1/buildings/` & `GET /api/v1/floors/`
Lists institutional/property architectural physical structures.

#### `GET /api/v1/rooms/types/`
Lists configured room types (`Standard King`, `Executive Suite`, `Presidential Penthouse`).

---

### 2.3 Reservations & Contactless Digital Check-In

#### `GET /api/v1/reservations/`
Lists bookings with pagination.
- **Query Filters:** `status` (`confirmed`, `checked_in`, `cancelled`, `no_show`), `check_in_from`, `check_in_to`, `search`.

#### `GET /api/v1/reservations/today-arrivals/`
Optimized query for arrivals expected on the current operational date.

#### `GET /api/v1/reservations/today-departures/`
Departures scheduled for today.

#### `POST /api/v1/reservations/{id}/cancel/`
Cancels booking, calculates cancellation penalty fee, and updates availability.
- **Request Body:**
```json
{
  "cancellation_reason": "Flight cancellation reported.",
  "waive_penalty": false
}
```

#### `POST /api/v1/check-in/wizard-submit/`
Contactless check-in wizard submission from mobile / self-service kiosk.
- **Request Body:**
```json
{
  "reservation_code": "RES-2026-8941",
  "guest_verified": true,
  "id_document_image": "data:image/jpeg;base64,...",
  "emergency_contact": {
    "name": "David Vance",
    "phone": "+15551234567",
    "relationship": "spouse"
  },
  "digital_signature": "data:image/png;base64,..."
}
```

---

### 2.4 Unified Master Folios, Billing & Payments

#### `GET /api/v1/billing/folios/`
Lists guest and corporate master folios.
- **Filters:** `stay_id`, `guest_id`, `status` (`open`, `settled`, `closed`).

#### `POST /api/v1/billing/folios/{id}/charges/`
Posts an arbitrary department charge onto the guest folio.
- **Request Body:**
```json
{
  "department": "restaurant",
  "description": "Table #4 Fine Dining Bill - KOT #104",
  "amount": "145.50",
  "tax_amount": "14.55",
  "reference_id": "POS-ORD-991"
}
```

#### `POST /api/v1/billing/folios/{id}/void-charge/`
Voids a folio item. Requires mandatory audit explanation.
- **Request Body:**
```json
{
  "charge_id": "b128794c-819a-4e2b-93ca-efc98124b801",
  "void_reason": "Duplicate beverage charge posted in error."
}
```

#### `POST /api/v1/payments/`
Records an idempotent payment transaction against a folio.
- **Request Body:**
```json
{
  "folio_id": "c92841bc-9918-4a18-b8ca-91bce4718901",
  "amount": "160.05",
  "payment_method": "card",
  "transaction_reference": "TXN-STRIPE-49120",
  "notes": "Full settlement at checkout."
}
```

#### `POST /api/v1/payments/{id}/refund/`
Executes partial or full refund with audit trail.

---

### 2.5 Food & Beverage, Restaurant POS & Kitchen KDS

#### `GET /api/v1/dining/tables/`
Lists dining room floor plan tables (`table_number`, `capacity`, `status`: `available`, `seated`, `bill_requested`).

#### `GET /api/v1/dining/menu/`
Hierarchical menu categories and menu items with allergen and pricing tags.

#### `POST /api/v1/dining/orders/fire-kot/`
Fires dining table order items to the kitchen display system (KDS).
- **Request Body:**
```json
{
  "table_id": "t-04",
  "server_name": "Julian Rios",
  "covers": 2,
  "guest_room_number": "201",
  "items": [
    {
      "menu_item_id": "item-ribeye",
      "quantity": 1,
      "station": "grill",
      "modifiers": "Medium-Rare, Truffle Butter"
    },
    {
      "menu_item_id": "item-caesar",
      "quantity": 1,
      "station": "cold",
      "modifiers": "Dressing on the side"
    }
  ]
}
```
*Note: Triggers immediate Django Channels broadcast on group `kot_orders`.*

#### `GET /api/v1/kot/tickets/`
Active kitchen order queue. Filter: `station` (`all`, `grill`, `hot_line`, `cold`, `pastry`, `beverage`).

#### `POST /api/v1/kot/tickets/{id}/bump/`
Transitions KOT ticket or item state: `new` → `accepted` → `preparing` → `ready` → `served`.

---

### 2.6 Housekeeping Turnover & Lost & Found Vault

#### `GET /api/v1/housekeeping/tasks/`
Lists room turnover tasks prioritized by checkout departure and VIP arrivals.

#### `POST /api/v1/housekeeping/tasks/{id}/transition/`
Updates task state: `assigned` → `in_progress` → `inspected` → `completed`.
- Attaches optional cleaning checklist verification array.

#### `GET /api/v1/housekeeping/lost-found/`
Lists registered lost items in the custody vault.

#### `POST /api/v1/housekeeping/lost-found/`
Registers newly found item:
```json
{
  "room_number": "204",
  "item_name": "Gold Cartier Watch",
  "category": "jewelry",
  "storage_locker_id": "VAULT-LOCKER-12",
  "founder_staff_name": "Maria Santos",
  "photo_url": "https://...",
  "notes": "Found in master bedside drawer."
}
```

---

### 2.7 Engineering & Maintenance Work Orders

#### `GET /api/v1/maintenance/tickets/`
Lists engineering work orders. Filters: `priority` (`low`, `medium`, `high`, `urgent`), `status` (`reported`, `in_progress`, `waiting_parts`, `resolved`).

#### `POST /api/v1/maintenance/tickets/`
Logs new maintenance incident. Automatically flags room if urgent.

#### `POST /api/v1/maintenance/tickets/{id}/assign/`
Assigns lead technician and target completion SLA timestamp.

---

### 2.8 Banquets & Group Events

#### `GET /api/v1/events/venues/`
Lists event spaces, maximum capacities by configuration (theatre, banquet, classroom).

#### `GET /api/v1/events/bookings/` & `POST /api/v1/events/bookings/`
Manages banquets, corporate summits, and weddings with linked room blocks and master event folios.

---

### 2.9 Spa & Wellness Center

#### `GET /api/v1/spa/treatments/` & `GET /api/v1/spa/appointments/`
Appointment scheduling, therapist duty assignment, and automatic posting of treatment charges to room folios.

---

### 2.10 Inventory & Procurement

#### `GET /api/v1/inventory/items/`
Monitors stock levels, minimum par thresholds, unit costs, and warehouse locations.

#### `POST /api/v1/inventory/requisitions/`
Generates departmental internal store stock requisitions or purchase orders.

---

### 2.11 Fleet Transport & Chauffeur Dispatch

#### `GET /api/v1/transport/vehicles/` & `GET /api/v1/transport/drivers/`
Lists vehicles (capacity, plate number, type) and licensed chauffeurs.

#### `GET /api/v1/transport/trips/` & `POST /api/v1/transport/trips/`
Airport transfer dispatch and lifecycle: `scheduled` → `dispatched` → `in_transit` → `completed`.

---

### 2.12 Gate Security Checkpoint & Visitor Passes

#### `GET /api/v1/security/visitor-passes/` & `POST /api/v1/security/visitor-passes/`
Issues temporary RFID or badge passes for contractors and visitors with host verification.

#### `GET /api/v1/security/gate-logs/` & `POST /api/v1/security/gate-logs/`
Logs vehicle barrier entry/exit (license plate OCR, delivery vs guest vehicle, driver identification).

---

### 2.13 Cloakroom & Luggage Vault

#### `GET /api/v1/cloakroom/tags/` & `POST /api/v1/cloakroom/tags/`
Generates baggage claim tag, assigns rack position, and processes identity-verified release on pickup.

---

### 2.14 Dynamic Pricing Engine & OTA Channels

#### `GET /api/v1/pricing/demand-bands/`
Retrieves automated pricing bands (`surge`, `high`, `normal`, `low`) calculated against forecasted occupancy.

#### `POST /api/v1/pricing/overrides/`
Sets manual rate override. Mandatory fields: `date_start`, `date_end`, `room_type_id`, `new_rate`, `audit_reason`.

#### `GET /api/v1/channels/status/`
Health of 2-way sync with Booking.com, Expedia, Agoda, and Airbnb.

#### `POST /api/v1/channels/trigger-sync/`
Dispatches background Celery task to push updated rate parity and availability inventory across all OTA channels.

---

### 2.15 Corporate Governance & Shareholder Portal

#### `GET /api/v1/corporate/kpis/`
Consolidated corporate metrics: Occupancy %, RevPAR, ADR, GOPPAR, Gross Revenue, and property comparisons.

#### `GET /api/v1/shareholder/profile/`
Strictly read-only profile for accredited shareholders (ownership units, dividend entitlement).

#### `GET /api/v1/shareholder/dividends/`
Historical and pending dividend distribution disbursements.

#### `GET /api/v1/shareholder/reports/`
Certified financial statements (Balance Sheet, P&L, Audit Opinions) available for download.

---

## 3. Real-time WebSockets Specification (Django Channels)

### 3.1 Gateway Endpoint
- URL: `ws://127.0.0.1:8000/ws/operations/` or `ws://127.0.0.1:8000/ws/kot/`
- Authentication Handshake: Reads `access_token` HttpOnly cookie or query param `?token=<jwt>`.

### 3.2 Channel Groups & Events
1. `group_kot_{property_id}`:
   - `kot_order_fired`: Dispatched when POS places an order.
   - `kot_item_bumped`: Dispatched when cook bumps item status.
2. `group_housekeeping_{property_id}`:
   - `room_state_changed`: Dispatched when attendant updates room status (`dirty` -> `clean` -> `available`).
3. `group_frontdesk_{property_id}`:
   - `stay_checkin`: Dispatched on guest check-in.
   - `gate_security_alert`: Dispatched if an unauthorized vehicle enters.

---

## 4. Django Implementation Blueprint (Models, Serializers, Views)

### 4.1 Sample Core Models
```python
# apps/rooms/models.py
import uuid
from django.db import models
from apps.tenants.models import Tenant

class RoomStatus(models.TextChoices):
    AVAILABLE = "available", "Available"
    OCCUPIED = "occupied", "Occupied"
    DIRTY = "dirty", "Dirty"
    CLEANING = "cleaning", "Cleaning"
    INSPECTION = "inspection", "Inspection"
    MAINTENANCE = "maintenance", "Maintenance"
    RESERVED = "reserved", "Reserved"
    BLOCKED = "blocked", "Blocked"

class Room(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name="rooms")
    floor_number = models.PositiveIntegerField()
    room_number = models.CharField(max_length=20)
    room_type = models.ForeignKey("rooms.RoomType", on_delete=models.PROTECT)
    status = models.CharField(max_length=20, choices=RoomStatus.choices, default=RoomStatus.AVAILABLE)
    is_clean = models.BooleanField(default=True)
    is_occupied = models.BooleanField(default=False)
    is_smoking = models.BooleanField(default=False)
    current_rate = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("tenant", "room_number")
```

### 4.2 Standard API ViewSet Pattern
```python
# apps/rooms/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.common.pagination import StandardResultsSetPagination
from .models import Room, RoomStatus
from .serializers import RoomSerializer

class RoomViewSet(viewsets.ModelViewSet):
    serializer_class = RoomSerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        # Enforce strict multi-tenant isolation via request.tenant
        return Room.objects.filter(tenant=self.request.tenant).order_by("room_number")

    @action(detail=True, methods=["post"], url_path="status-transition")
    def status_transition(self, request, pk=None):
        room = self.get_object()
        new_status = request.data.get("status")
        reason = request.data.get("reason", "")

        if new_status not in RoomStatus.values:
            return Response(
                {"success": False, "error": {"code": "INVALID_STATUS", "message": "Unknown room status."}},
                status=status.HTTP_400_BAD_REQUEST
            )

        room.status = new_status
        room.is_clean = new_status in [RoomStatus.AVAILABLE, RoomStatus.INSPECTION]
        room.is_occupied = new_status == RoomStatus.OCCUPIED
        room.save(update_fields=["status", "is_clean", "is_occupied"])

        # Broadcast via WebSockets to Front Desk & Housekeeping screens
        # ...

        return Response({"success": True, "data": RoomSerializer(room).data})
```

---

*This specification serves as the authoritative blueprint for Django developers to implement all remaining endpoints to connect the full enterprise UI.*
