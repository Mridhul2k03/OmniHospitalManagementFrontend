// ==========================================
// HOSPITALITY MANAGEMENT SYSTEM (HMS) DOMAIN TYPES
// Single Source of Truth Aligned with Django REST API
// ==========================================

// --- AUTH & ROLES ---
export type UserRole =
  | 'super_admin'
  | 'org_admin'
  | 'property_manager'
  | 'front_desk'
  | 'housekeeping'
  | 'restaurant_pos'
  | 'chef_kitchen'
  | 'maintenance'
  | 'accountant'
  | 'hr'
  | 'president'
  | 'vice_president'
  | 'ceo'
  | 'operations_director'
  | 'shareholder'
  | 'security_gate'
  | 'transport'
  | 'guest'

export interface UserPermission {
  id: string
  code: string
  name: string
  category: string
}

export interface AuthenticatedUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  organizationId: string
  organizationName: string
  propertyIds: string[]
  assignedPropertyId?: string
  permissions: string[]
  avatarUrl?: string
}

export interface AuthTokens {
  access: string
  refresh: string
}

// --- TENANT & PROPERTY HIERARCHY ---
export interface Organization {
  id: string
  name: string
  code: string
  logoUrl?: string
  currency: string
  taxIdNumber?: string
  createdAt: string
}

export interface Property {
  id: string
  organizationId: string
  name: string
  code: string
  type: 'resort' | 'hotel' | 'boutique' | 'business' | 'luxury_villas'
  address: string
  city: string
  state: string
  country: string
  postalCode: string
  phone: string
  email: string
  checkInTime: string // e.g. "14:00"
  checkOutTime: string // e.g. "11:00"
  totalRooms: number
  activeRooms: number
  rating?: number
  bannerImage?: string
  status: 'active' | 'inactive' | 'maintenance'
}

export interface Building {
  id: string
  propertyId: string
  name: string
  floorsCount: number
}

export interface Floor {
  id: string
  buildingId: string
  number: number
  name: string
}

// --- ROOMS & AVAILABILITY ---
export type RoomStatus =
  | 'available'
  | 'reserved'
  | 'occupied'
  | 'dirty'
  | 'cleaning'
  | 'inspection'
  | 'out_of_order'
  | 'maintenance'
  | 'blocked'

export interface RoomType {
  id: string
  propertyId: string
  name: string
  code: string
  description: string
  baseOccupancy: number
  maxOccupancy: number
  basePrice: number
  amenities: string[]
  bedType: 'King' | 'Queen' | 'Twin' | 'Suite'
  images: string[]
}

export interface Room {
  id: string
  propertyId: string
  buildingId?: string
  buildingName?: string
  floorId?: string
  floorNumber?: number
  roomNumber: string
  roomTypeId: string
  roomTypeName: string
  status: RoomStatus
  currentGuestName?: string
  currentReservationId?: string
  isClean: boolean
  isOccupied: boolean
  isSmoking: boolean
  currentRate: number
  features: string[]
  notes?: string
}

// --- RESERVATIONS & GUESTS ---
export type ReservationStatus =
  | 'pending'
  | 'confirmed'
  | 'checked_in'
  | 'in_house'
  | 'checked_out'
  | 'cancelled'
  | 'no_show'
  | 'completed'

export interface GuestProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  idType: 'passport' | 'national_id' | 'driver_license'
  idNumber: string
  idDocumentUrl?: string
  country: string
  vipStatus?: 'standard' | 'silver' | 'gold' | 'platinum'
  specialRequests?: string
  totalStays: number
  totalSpend: number
}

export interface Reservation {
  id: string
  code: string // e.g. "RES-88392"
  propertyId: string
  propertyName: string
  guest: GuestProfile
  roomTypeId: string
  roomTypeName: string
  roomId?: string
  roomNumber?: string
  checkInDate: string
  checkOutDate: string
  nightsCount: number
  adultsCount: number
  childrenCount: number
  status: ReservationStatus
  totalAmount: number
  paidAmount: number
  balanceAmount: number
  channel: 'direct' | 'ota_booking' | 'ota_expedia' | 'corporate' | 'walk_in'
  createdDate: string
  sourceNotes?: string
  digitalSignatureUrl?: string
  emergencyContact?: {
    name: string
    phone: string
    relationship: string
  }
}

// --- UNIFIED FOLIO & BILLING ---
export type FolioCategory =
  | 'room'
  | 'restaurant'
  | 'room_service'
  | 'laundry'
  | 'minibar'
  | 'spa'
  | 'activities'
  | 'banquet'
  | 'transport'
  | 'other'

export interface FolioChargeItem {
  id: string
  folioId: string
  category: FolioCategory
  outletName: string
  description: string
  quantity: number
  unitPrice: number
  taxAmount: number
  totalAmount: number
  postedAt: string
  postedBy: string
  isVoided: boolean
  voidReason?: string
  referenceId?: string
}

export interface FolioPaymentItem {
  id: string
  folioId: string
  paymentMethod: 'cash' | 'credit_card' | 'debit_card' | 'upi' | 'bank_transfer' | 'corporate_account'
  amount: number
  transactionReference: string
  timestamp: string
  processedBy: string
  status: 'settled' | 'pending' | 'refunded'
}

export interface UnifiedFolio {
  id: string
  reservationId: string
  reservationCode: string
  propertyId: string
  guestName: string
  roomNumber: string
  charges: FolioChargeItem[]
  payments: FolioPaymentItem[]
  subtotal: number
  totalTax: number
  totalAmount: number
  totalPaid: number
  balanceDue: number
  status: 'open' | 'settled' | 'closed'
}

// --- RESTAURANT & POINT OF SALE (POS) ---
export type TableStatus = 'available' | 'occupied' | 'reserved' | 'billing' | 'cleaning'

export interface DiningTable {
  id: string
  restaurantId: string
  tableNumber: string
  capacity: number
  status: TableStatus
  section: 'Main Dining' | 'Terrace' | 'Poolside' | 'Lounge' | 'Bar'
  activeOrderId?: string
  assignedServer?: string
}

export interface MenuItem {
  id: string
  restaurantId: string
  category: 'Appetizers' | 'Mains' | 'Desserts' | 'Beverages' | 'Cocktails' | 'Wine'
  name: string
  description: string
  price: number
  isVegetarian: boolean
  isVegan: boolean
  isSpicy: boolean
  isAvailable: boolean
  prepTimeMinutes: number
  image?: string
}

export interface CartOrderItem {
  menuItemId: string
  name: string
  quantity: number
  unitPrice: number
  specialInstructions?: string
}

// --- KITCHEN DISPLAY SYSTEM (KDS / KOT) ---
export type KOTStatus =
  | 'new'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'served'
  | 'cancelled'
  | 'voided'

export interface KOTItem {
  id: string
  menuItemName: string
  quantity: number
  notes?: string
  station: 'Grill' | 'Sauté' | 'Salad' | 'Dessert' | 'Bar'
  status: 'pending' | 'preparing' | 'ready'
}

export interface KitchenOrderTicket {
  id: string
  ticketNumber: string
  outletName: string
  orderType: 'dine_in' | 'room_service' | 'takeaway' | 'banquet'
  tableNumber?: string
  roomNumber?: string
  serverName: string
  status: KOTStatus
  priority: 'normal' | 'rush' | 'vip'
  createdAt: string
  elapsedMinutes: number
  items: KOTItem[]
}

// --- HOUSEKEEPING ---
export type HousekeepingStatus =
  | 'dirty'
  | 'cleaning_assigned'
  | 'cleaning_started'
  | 'cleaning_completed'
  | 'inspection'
  | 'available'

export interface HousekeepingTask {
  id: string
  propertyId: string
  roomId: string
  roomNumber: string
  roomTypeName: string
  assignedAttendantId?: string
  assignedAttendantName?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: HousekeepingStatus
  scheduledTime: string
  startedAt?: string
  completedAt?: string
  checklist: {
    id: string
    task: string
    completed: boolean
  }[]
  notes?: string
}

export interface LostAndFoundItem {
  id: string
  propertyId: string
  itemDescription: string
  category: 'Electronics' | 'Jewelry' | 'Clothing' | 'Documents' | 'Other'
  foundLocation: string // e.g. "Room 304"
  foundDate: string
  foundBy: string
  claimedBy?: string
  claimDate?: string
  status: 'stored' | 'claimed' | 'disposed'
}

// --- MAINTENANCE ---
export type MaintenanceStatus =
  | 'reported'
  | 'assigned'
  | 'in_progress'
  | 'waiting'
  | 'resolved'
  | 'verified'
  | 'closed'

export interface MaintenanceTicket {
  id: string
  code: string // e.g. "MNT-102"
  propertyId: string
  category: 'Plumbing' | 'HVAC / AC' | 'Electrical' | 'Carpentry' | 'Appliance' | 'Internet'
  location: string // e.g. "Room 214" or "Main Lobby Elevator"
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: MaintenanceStatus
  reportedBy: string
  assignedTechnician?: string
  createdAt: string
  resolvedAt?: string
  slaHours: number
  isOverdue: boolean
  estimatedCost: number
}

// --- BANQUETS & EVENTS ---
export interface BanquetVenue {
  id: string
  propertyId: string
  name: string
  capacityCocktail: number
  capacityBanquet: number
  capacityTheatre: number
  hourlyRate: number
  amenities: string[]
}

export interface BanquetEvent {
  id: string
  propertyId: string
  title: string
  clientName: string
  clientContact: string
  venueId: string
  venueName: string
  startDate: string
  endDate: string
  attendeeCount: number
  eventType: 'Wedding' | 'Corporate Summit' | 'Conference' | 'Gala' | 'Birthday'
  status: 'inquiry' | 'proposal' | 'confirmed' | 'active' | 'completed' | 'cancelled'
  totalRevenue: number
  roomBlockId?: string
}

// --- SPA & WELLNESS ---
export interface SpaService {
  id: string
  propertyId: string
  category: 'Massage' | 'Facial' | 'Body Treatment' | 'Ayurveda' | 'Hydrotherapy'
  name: string
  durationMinutes: number
  price: number
  description: string
}

export interface SpaAppointment {
  id: string
  propertyId: string
  guestName: string
  roomNumber?: string
  serviceName: string
  therapistName: string
  scheduledDateTime: string
  durationMinutes: number
  amount: number
  status: 'booked' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
}

// --- GATE SECURITY & CLOAKROOM ---
export interface GateVisitorLog {
  id: string
  propertyId: string
  visitorName: string
  purpose: 'Guest' | 'Vendor / Delivery' | 'Contractor' | 'Interview' | 'Official'
  hostOrDestination: string
  entryTime: string
  exitTime?: string
  badgeNumber: string
  vehiclePlate?: string
  status: 'inside' | 'exited'
}

export interface CloakroomTicket {
  id: string
  ticketNumber: string // e.g. "CLOAK-8021"
  propertyId: string
  ownerName: string
  roomNumber?: string
  contactPhone: string
  itemCount: number
  itemDescriptions: string
  storageRackLocation: string
  issuedAt: string
  releasedAt?: string
  releasedTo?: string
  status: 'stored' | 'partial_released' | 'released'
}

// --- FLEET & TRANSPORT ---
export type TripStatus =
  | 'requested'
  | 'quoted'
  | 'assigned'
  | 'driver_confirmed'
  | 'en_route'
  | 'arrived'
  | 'picked_up'
  | 'completed'
  | 'billed'
  | 'cancelled'

export interface TransportTrip {
  id: string
  bookingCode: string
  propertyId: string
  passengerName: string
  passengerPhone: string
  roomNumber?: string
  tripType: 'airport_transfer' | 'city_tour' | 'hourly_chauffeur' | 'shuttle'
  pickupLocation: string
  dropoffLocation: string
  scheduledTime: string
  vehicleType: 'Sedan' | 'Luxury SUV' | 'Van' | 'Executive Coach'
  driverName?: string
  driverPhone?: string
  vehiclePlate?: string
  fare: number
  status: TripStatus
}

// --- DYNAMIC PRICING & REVENUE ---
export type DemandBand = 'low' | 'normal' | 'high' | 'surge'

export interface DynamicPricingRule {
  id: string
  propertyId: string
  roomTypeId: string
  name: string
  demandBand: DemandBand
  occupancyThresholdMin: number
  occupancyThresholdMax: number
  multiplier: number // e.g. 1.25 for +25%
  isActive: boolean
  effectiveFrom: string
  effectiveTo: string
}

// --- CHANNELS & OTA ---
export interface OTAChannelConnection {
  id: string
  propertyId: string
  channelName: 'Booking.com' | 'Expedia' | 'Agoda' | 'Airbnb' | 'MakeMyTrip'
  status: 'synced' | 'syncing' | 'error' | 'disconnected'
  lastSyncAt: string
  syncedRoomTypesCount: number
  pendingErrorsCount: number
}

// --- SHAREHOLDER PORTAL (READ-ONLY) ---
export interface ShareholderProfile {
  id: string
  fullName: string
  shareholderFolioNumber: string
  totalShares: number
  equityPercentage: number
  joinedDate: string
}

export interface ShareholderDividend {
  id: string
  financialQuarter: string // e.g. "Q3 FY26"
  declaredDate: string
  paidDate: string
  dividendPerShare: number
  totalAmountReceived: number
  paymentReference: string
  taxDeducted: number
  status: 'paid' | 'declared' | 'processing'
}

export interface FinancialStatementSummary {
  id: string
  fiscalPeriod: string
  totalRevenue: number
  netProfit: number
  ebitda: number
  ebitdaMargin: number
  occupancyRate: number
  reportPdfUrl?: string
}

// --- EXECUTIVE KPIS & ANALYTICS ---
export interface ExecutiveMetrics {
  totalRevenue: number
  revenueChangePercent: number
  occupancyRate: number
  occupancyChangePercent: number
  adr: number // Average Daily Rate
  revpar: number // Revenue per Available Room
  totalGuestsInHouse: number
  netOperatingIncome: number
  profitMarginPercent: number
}

// Canonical Aliases for System Ergonomics
export type Folio = UnifiedFolio
export type FolioCharge = FolioChargeItem
export type FolioPayment = FolioPaymentItem
export type KOTOrder = KitchenOrderTicket
export type HousekeepingTaskStatus = HousekeepingStatus
export type MaintenancePriority = 'low' | 'medium' | 'high' | 'urgent'
export type DividendDistribution = ShareholderDividend
export type ShareholderFinancialReport = FinancialStatementSummary
export type ExecutiveKPIs = ExecutiveMetrics

export interface PropertyPerformance {
  propertyId: string
  propertyName: string
  occupancyRate: number
  adr: number
  revpar: number
  revenue: number
  margin: number
}

export interface TransportVehicle {
  id: string
  plateNumber: string
  model: string
  vehicleType: string
  capacity: number
  status: 'available' | 'in_transit' | 'maintenance'
}

export interface Driver {
  id: string
  name: string
  phone: string
  licenseNumber: string
  rating: number
  status: 'available' | 'on_trip' | 'off_duty'
}

// ==========================================
// OMNIEDUCATIONAL SAAS BACKEND INTEGRATION TYPES
// ==========================================

export interface ApiEnvelope<T> {
  success: boolean
  data: T
  meta?: {
    request_id?: string
    [key: string]: unknown
  }
}

export interface ApiPaginatedEnvelope<T> {
  success: boolean
  data: T[]
  meta: {
    count: number
    total_pages: number
    current_page: number
    page_size: number
    next: string | null
    previous: string | null
    request_id?: string
  }
}

export interface InstitutionTenant {
  id: string
  name: string
  slug: string
  institution_type?: 'k12_school' | 'university_college' | 'coaching_institute' | 'vocational' | string
  is_default?: boolean
  domain?: string
  features?: Record<string, boolean>
  terminology?: Record<string, string>
}

export interface EduUser {
  id: string
  email: string
  first_name: string
  last_name: string
  full_name: string
  is_staff?: boolean
  role?: string
  permissions?: string[]
}

export interface AuthLoginResponse {
  access?: string
  refresh?: string
  user: EduUser
  accessible_tenants: InstitutionTenant[]
  active_tenant: InstitutionTenant
}

export interface StudentGuardianLink {
  id: string
  guardian_name: string
  relationship: string
  phone_number: string
  is_primary?: boolean
}

export interface Student {
  id: string
  admission_number: string
  first_name: string
  last_name: string
  full_name: string
  email: string
  user_id?: string
  class_cohort_name?: string
  section_name?: string
  date_of_birth?: string
  gender?: 'M' | 'F' | 'O'
  status: 'admitted' | 'enrolled' | 'suspended' | 'graduated' | 'withdrawn'
  guardian_links?: StudentGuardianLink[]
  created_at?: string
}

export interface StudentAdmissionPayload {
  first_name: string
  last_name: string
  email: string
  date_of_birth: string
  gender: 'M' | 'F' | 'O'
  admission_date: string
  admission_number: string
  class_name: string
  section_name: string
  guardian: {
    first_name: string
    last_name: string
    phone_number: string
    relationship: string
  }
}

export interface StaffMember {
  id: string
  employee_id: string
  user: string | EduUser
  department?: string
  designation: string
  qualification?: string
  joined_date?: string
  employment_type: 'full_time' | 'part_time' | 'contract'
  status?: string
}

export interface AcademicYear {
  id: string
  name: string
  start_date: string
  end_date: string
  is_current: boolean
}

export interface AcademicTerm {
  id: string
  name: string
  academic_year: string
  start_date: string
  end_date: string
}

export interface AcademicDepartment {
  id: string
  name: string
  code: string
  head_of_department?: string
}

export interface AttendanceEntry {
  student_id: string
  status: 'present' | 'absent' | 'late' | 'excused'
  remarks?: string
}

export interface BulkAttendancePayload {
  section_id: string
  date: string
  entries: AttendanceEntry[]
}

export interface Exam {
  id: string
  name: string
  academic_term: string
  start_date: string
  end_date: string
  is_published: boolean
}

export interface ExamMark {
  id: string
  exam: string
  student: string
  subject: string
  marks_obtained: string
  max_marks: string
}

export interface EduInvoice {
  id: string
  student: string | Student
  invoice_number: string
  amount: string
  due_date: string
  status: 'issued' | 'partially_paid' | 'paid' | 'overdue'
  created_at: string
}

export interface RecordPaymentPayload {
  invoice_id: string
  amount: string
  payment_method: 'card' | 'cash' | 'bank_transfer' | 'cheque'
  transaction_reference: string
}

export interface PaymentReceipt {
  id: string
  receipt_number: string
  amount: string
  payment_method: string
  status: string
  payment_date: string
}

export interface AnnouncementItem {
  id: string
  title: string
  content: string
  target_audience: 'all' | 'students' | 'faculty' | 'staff' | string
  is_published: boolean
  created_at: string
}

export interface AppNotificationItem {
  id: string
  title: string
  message: string
  is_read: boolean
  created_at: string
  action_url?: string
}

export interface AuditLogItem {
  id: string
  actor_email: string
  action: 'CREATE' | 'UPDATE' | 'DELETE' | string
  resource_type: string
  resource_id: string
  description: string
  ip_address?: string
  timestamp: string
}


