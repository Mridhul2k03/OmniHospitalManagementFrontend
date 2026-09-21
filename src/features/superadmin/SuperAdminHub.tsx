import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building2,
  Users,
  ShieldCheck,
  Plus,
  Search,
  KeyRound,
  UserCheck,
  UserX,
  CheckCircle2,
  AlertTriangle,
  Zap,
  RefreshCw,
  Mail,
  Phone,
  Filter,
  ArrowUpRight,
  Edit3,
  X,
  Building,
  Check,
  Trash2,
  ExternalLink,
  Layers,
  Activity,
  Cpu,
  Lock,
  Globe,
  Hotel,
  CalendarDays,
  LayoutGrid,
  Sparkles,
  Wrench,
  UtensilsCrossed,
  Flame,
  PartyPopper,
  Receipt,
  CreditCard,
  Truck,
  Luggage,
  TrendingUp,
  Globe2,
  PieChart,
  FileSpreadsheet,
  Boxes,
  GraduationCap,
  Award,
  Sliders,
  ChevronRight,
  Eye,
} from 'lucide-react'
import { superAdminApi, CreateClientPayload, CreateUserPayload } from '@/api/endpoints/superadmin.api'
import { ClientOrganization, PlatformUser, SubscriptionTier, UserRole } from '@/types'
import { SUBSCRIPTION_PLANS, useSubscription } from '@/context/SubscriptionContext'
import { useAuth } from '@/auth/useAuth'

// Product Module definition for the Product Access & Entitlements Engine
interface ProductModule {
  id: string
  name: string
  category: 'Front Office' | 'Operations' | 'Food & Beverage' | 'Cashiering & Finance' | 'Mobility & Distribution' | 'Governance & Analytics'
  path: string
  description: string
  minPlan: 'starter' | 'professional' | 'enterprise'
  allowedRoles: string[]
  icon: React.ComponentType<{ className?: string }>
  badge?: string
}

const PRODUCT_MODULES: ProductModule[] = [
  {
    id: 'frontdesk',
    name: 'Front Desk Hub',
    category: 'Front Office',
    path: '/app/frontdesk',
    description: 'Centralized reception console for walk-ins, guest arrivals, folio lookups, and fast checkout.',
    minPlan: 'starter',
    allowedRoles: ['super_admin', 'org_admin', 'property_manager', 'front_desk'],
    icon: Hotel,
  },
  {
    id: 'rooms',
    name: 'Room Availability Board',
    category: 'Front Office',
    path: '/app/rooms',
    description: 'Real-time interactive matrix of room inventory, cleanliness status, and occupancy locks.',
    minPlan: 'starter',
    allowedRoles: ['super_admin', 'org_admin', 'property_manager', 'front_desk', 'housekeeping', 'maintenance'],
    icon: LayoutGrid,
  },
  {
    id: 'reservations',
    name: 'Reservations & Booking',
    category: 'Front Office',
    path: '/app/reservations',
    description: 'Multi-room bookings, deposit tracking, guest manifests, and reservation modifications.',
    minPlan: 'starter',
    allowedRoles: ['super_admin', 'org_admin', 'property_manager', 'front_desk'],
    icon: CalendarDays,
  },
  {
    id: 'checkin',
    name: 'Digital Mobile Check-in',
    category: 'Front Office',
    path: '/app/checkin',
    description: 'Self-service contact-free guest check-in terminal with digital registration cards.',
    minPlan: 'starter',
    allowedRoles: ['super_admin', 'org_admin', 'front_desk', 'guest'],
    icon: UserCheck,
    badge: 'Live',
  },
  {
    id: 'students',
    name: 'Students & Admissions',
    category: 'Front Office',
    path: '/app/students',
    description: 'Campus accommodation, student rosters, academic calendar synchronization.',
    minPlan: 'professional',
    allowedRoles: ['super_admin', 'org_admin', 'front_desk'],
    icon: GraduationCap,
    badge: 'API',
  },
  {
    id: 'housekeeping',
    name: 'Housekeeping Board',
    category: 'Operations',
    path: '/app/housekeeping',
    description: 'Live room cleanliness board, maid sector assignments, turndown service, and linen tracking.',
    minPlan: 'starter',
    allowedRoles: ['super_admin', 'org_admin', 'property_manager', 'housekeeping'],
    icon: Sparkles,
  },
  {
    id: 'maintenance',
    name: 'Engineering & Work Orders',
    category: 'Operations',
    path: '/app/maintenance',
    description: 'Preventative maintenance schedules, repair work orders, and equipment telemetry.',
    minPlan: 'starter',
    allowedRoles: ['super_admin', 'org_admin', 'property_manager', 'maintenance'],
    icon: Wrench,
  },
  {
    id: 'security',
    name: 'Gate Security & Access',
    category: 'Operations',
    path: '/app/security',
    description: 'License plate logging, visitor screening, perimeter access, and security logs.',
    minPlan: 'professional',
    allowedRoles: ['super_admin', 'org_admin', 'property_manager', 'security_gate'],
    icon: ShieldCheck,
  },
  {
    id: 'cloakroom',
    name: 'Luggage & Cloakroom',
    category: 'Operations',
    path: '/app/cloakroom',
    description: 'Baggage holding slips, QR claim tags, bellhop dispatch, and safe custody tracking.',
    minPlan: 'professional',
    allowedRoles: ['super_admin', 'org_admin', 'front_desk', 'security_gate', 'housekeeping'],
    icon: Luggage,
  },
  {
    id: 'pos',
    name: 'Restaurant POS',
    category: 'Food & Beverage',
    path: '/app/pos',
    description: 'Multi-outlet point-of-sale for dining rooms, bars, and poolside with room charge settlement.',
    minPlan: 'professional',
    allowedRoles: ['super_admin', 'org_admin', 'property_manager', 'restaurant_pos', 'chef_kitchen'],
    icon: UtensilsCrossed,
  },
  {
    id: 'kds',
    name: 'Kitchen Display System (KOT)',
    category: 'Food & Beverage',
    path: '/app/kds',
    description: 'High-contrast kitchen display, ticket prep countdowns, course firing, and expeditor screen.',
    minPlan: 'professional',
    allowedRoles: ['super_admin', 'org_admin', 'chef_kitchen', 'restaurant_pos'],
    icon: Flame,
    badge: 'Realtime',
  },
  {
    id: 'events',
    name: 'Banquets & Events',
    category: 'Food & Beverage',
    path: '/app/events',
    description: 'Grand ballroom and banquet reservations, catering menus, and audiovisual scheduling.',
    minPlan: 'professional',
    allowedRoles: ['super_admin', 'org_admin', 'property_manager'],
    icon: PartyPopper,
  },
  {
    id: 'spa',
    name: 'Spa & Wellness',
    category: 'Food & Beverage',
    path: '/app/spa',
    description: 'Therapist booking schedules, treatment packages, massage suites, and fitness club lockers.',
    minPlan: 'professional',
    allowedRoles: ['super_admin', 'org_admin', 'property_manager', 'guest'],
    icon: Sparkles,
  },
  {
    id: 'folios',
    name: 'Unified Guest Folios',
    category: 'Cashiering & Finance',
    path: '/app/folios',
    description: 'Master ledger combining accommodation, dining, spa, and ancillary charges into one bill.',
    minPlan: 'starter',
    allowedRoles: ['super_admin', 'org_admin', 'front_desk', 'accountant'],
    icon: Receipt,
  },
  {
    id: 'finance',
    name: 'Billing & Cashiering',
    category: 'Cashiering & Finance',
    path: '/app/finance',
    description: 'Cashier shift closures, tax split auditing, multi-currency credit card batches.',
    minPlan: 'professional',
    allowedRoles: ['super_admin', 'org_admin', 'accountant'],
    icon: CreditCard,
  },
  {
    id: 'inventory',
    name: 'Inventory & Procurement',
    category: 'Cashiering & Finance',
    path: '/app/inventory',
    description: 'Par stock levels, purchase orders, vendor invoices, linen cycle counts, and perishables.',
    minPlan: 'professional',
    allowedRoles: ['super_admin', 'org_admin', 'accountant'],
    icon: Boxes,
  },
  {
    id: 'transport',
    name: 'Transport & Fleet Dispatch',
    category: 'Mobility & Distribution',
    path: '/app/transport',
    description: 'Airport transfers, luxury fleet dispatch, driver manifests, and vehicle fuel logs.',
    minPlan: 'professional',
    allowedRoles: ['super_admin', 'org_admin', 'transport'],
    icon: Truck,
  },
  {
    id: 'pricing',
    name: 'Dynamic AI Pricing Engine',
    category: 'Mobility & Distribution',
    path: '/app/pricing',
    description: 'Algorithmic RevPAR maximizer, surge pricing, competitive rate shopping, and seasonality curves.',
    minPlan: 'enterprise',
    allowedRoles: ['super_admin', 'org_admin', 'president', 'ceo', 'operations_director'],
    icon: TrendingUp,
    badge: 'AI',
  },
  {
    id: 'channels',
    name: 'Global OTA Channel Manager',
    category: 'Mobility & Distribution',
    path: '/app/channels',
    description: 'Two-way pooled inventory synchronization across Booking.com, Expedia, Agoda, and Airbnb.',
    minPlan: 'enterprise',
    allowedRoles: ['super_admin', 'org_admin', 'president', 'ceo', 'operations_director'],
    icon: Globe2,
  },
  {
    id: 'corporate',
    name: 'Executive Portfolio Dashboards',
    category: 'Governance & Analytics',
    path: '/app/corporate',
    description: 'Consolidated ADR, RevPAR, and GOPPAR financial intelligence across all hotel properties.',
    minPlan: 'enterprise',
    allowedRoles: ['super_admin', 'org_admin', 'president', 'vice_president', 'ceo', 'operations_director'],
    icon: PieChart,
  },
  {
    id: 'shareholder',
    name: 'Shareholder Financial Portal',
    category: 'Governance & Analytics',
    path: '/app/shareholder',
    description: 'Audited financial statements, EBITDA reports, dividend distribution logs (strictly read-only).',
    minPlan: 'enterprise',
    allowedRoles: ['super_admin', 'org_admin', 'shareholder'],
    icon: FileSpreadsheet,
    badge: 'Read-Only',
  },
  {
    id: 'hr',
    name: 'Staff & HR Roster',
    category: 'Governance & Analytics',
    path: '/app/hr',
    description: 'Departmental staff schedules, biometric timeclock, certifications, and overtime tracking.',
    minPlan: 'professional',
    allowedRoles: ['super_admin', 'org_admin', 'hr'],
    icon: Users,
  },
  {
    id: 'loyalty',
    name: 'Loyalty & Guest CRM',
    category: 'Governance & Analytics',
    path: '/app/loyalty',
    description: 'Guest preferences, VIP tiers, repeat visit tracking, and reward points redemption.',
    minPlan: 'professional',
    allowedRoles: ['super_admin', 'org_admin', 'hr', 'guest'],
    icon: Award,
  },
  {
    id: 'system-status',
    name: 'System Health & Diagnostics',
    category: 'Governance & Analytics',
    path: '/app/system-status',
    description: 'Live latency probes, ASGI Daphne gateway health, Redis layers, and database connectivity.',
    minPlan: 'enterprise',
    allowedRoles: ['super_admin', 'org_admin'],
    icon: Activity,
    badge: 'Live',
  },
]

export const SuperAdminHub: React.FC = () => {
  const navigate = useNavigate()
  const { user, switchRole } = useAuth()
  const { currentPlan, upgradePlan } = useSubscription()

  const [activeTab, setActiveTab] = useState<'overview' | 'clients' | 'users' | 'products' | 'health'>('overview')
  const [clients, setClients] = useState<ClientOrganization[]>([])
  const [users, setUsers] = useState<PlatformUser[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [actionLoading, setActionLoading] = useState<boolean>(false)
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Filters for Clients
  const [clientSearch, setClientSearch] = useState('')
  const [clientTierFilter, setClientTierFilter] = useState<string>('all')
  const [clientStatusFilter, setClientStatusFilter] = useState<string>('all')

  // Filters for Users
  const [userSearch, setUserSearch] = useState('')
  const [userOrgFilter, setUserOrgFilter] = useState<string>('all')
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all')
  const [userStatusFilter, setUserStatusFilter] = useState<string>('all')

  // Product Matrix Filter
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('all')
  const [productSearch, setProductSearch] = useState('')
  const [simulatorRole, setSimulatorRole] = useState<string>('front_desk')

  // Modals state
  const [showCreateClientModal, setShowCreateClientModal] = useState(false)
  const [showEditClientModal, setShowEditClientModal] = useState(false)
  const [selectedClient, setSelectedClient] = useState<ClientOrganization | null>(null)

  const [showCreateUserModal, setShowCreateUserModal] = useState(false)
  const [showEditUserModal, setShowEditUserModal] = useState(false)
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<PlatformUser | null>(null)

  // New Client Form
  const [newClient, setNewClient] = useState<CreateClientPayload>({
    name: '',
    code: '',
    legal_name: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    subscription_tier: 'enterprise',
    admin_email: '',
    admin_password: '',
    admin_first_name: '',
    admin_last_name: '',
    admin_username: '',
  })

  // Edit Client Form
  const [editClientData, setEditClientData] = useState<{
    name: string
    legal_name: string
    contact_email: string
    contact_phone: string
    address: string
    subscription_tier: SubscriptionTier
  }>({
    name: '',
    legal_name: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    subscription_tier: 'enterprise',
  })

  // New User Form
  const [newUser, setNewUser] = useState<CreateUserPayload>({
    email: '',
    username: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'FRONT_DESK',
    organization: '',
    phone_number: '',
    is_active: true,
  })

  // Reset Password State
  const [newPassword, setNewPassword] = useState('')

  // Edit User State
  const [editUserData, setEditUserData] = useState<{
    role: string
    organization: string
    is_active: boolean
    first_name: string
    last_name: string
    phone_number: string
  }>({
    role: '',
    organization: '',
    is_active: true,
    first_name: '',
    last_name: '',
    phone_number: '',
  })

  // Health probe data
  const [healthStatus, setHealthStatus] = useState<{
    status: string
    database: string
    timestamp: string
    version: string
  }>({
    status: 'healthy',
    database: 'operational',
    timestamp: new Date().toISOString(),
    version: '1.0.0-enterprise',
  })

  const notify = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 4500)
  }

  // Fetch initial data
  const fetchData = async () => {
    setLoading(true)
    try {
      const [clientsData, usersData] = await Promise.all([
        superAdminApi.getClients(),
        superAdminApi.getGlobalUsers(),
      ])
      setClients(clientsData)
      setUsers(usersData)
    } catch (err: unknown) {
      console.error('Failed to load superadmin data', err)
      notify('Failed to load platform data from backend.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // KPI Calculations
  const stats = useMemo(() => {
    const totalClients = clients.length
    const activeClients = clients.filter((c) => c.is_active).length
    const totalUsers = users.length
    const activeUsers = users.filter((u) => u.is_active).length

    const starterCount = clients.filter((c) => c.subscription_tier.toLowerCase() === 'starter').length
    const proCount = clients.filter((c) => c.subscription_tier.toLowerCase() === 'professional').length
    const entCount = clients.filter((c) => c.subscription_tier.toLowerCase() === 'enterprise').length

    return { totalClients, activeClients, totalUsers, activeUsers, starterCount, proCount, entCount }
  }, [clients, users])

  // Filtered Clients
  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const query = clientSearch.toLowerCase()
      const matchesSearch =
        c.name.toLowerCase().includes(query) ||
        c.code.toLowerCase().includes(query) ||
        c.contact_email.toLowerCase().includes(query)
      const matchesTier = clientTierFilter === 'all' || c.subscription_tier.toLowerCase() === clientTierFilter.toLowerCase()
      const matchesStatus =
        clientStatusFilter === 'all' ||
        (clientStatusFilter === 'active' && c.is_active) ||
        (clientStatusFilter === 'suspended' && !c.is_active)
      return matchesSearch && matchesTier && matchesStatus
    })
  }, [clients, clientSearch, clientTierFilter, clientStatusFilter])

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const query = userSearch.toLowerCase()
      const matchesSearch =
        u.email.toLowerCase().includes(query) ||
        (u.username && u.username.toLowerCase().includes(query)) ||
        (u.full_name && u.full_name.toLowerCase().includes(query)) ||
        (u.first_name && u.first_name.toLowerCase().includes(query)) ||
        (u.last_name && u.last_name.toLowerCase().includes(query))

      const matchesOrg = userOrgFilter === 'all' || u.organization === userOrgFilter
      const matchesRole = userRoleFilter === 'all' || u.role.toLowerCase() === userRoleFilter.toLowerCase()
      const matchesStatus =
        userStatusFilter === 'all' ||
        (userStatusFilter === 'active' && u.is_active) ||
        (userStatusFilter === 'inactive' && !u.is_active)

      return matchesSearch && matchesOrg && matchesRole && matchesStatus
    })
  }, [users, userSearch, userOrgFilter, userRoleFilter, userStatusFilter])

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return PRODUCT_MODULES.filter((p) => {
      const matchesCategory = productCategoryFilter === 'all' || p.category === productCategoryFilter
      const query = productSearch.toLowerCase()
      const matchesSearch =
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.path.toLowerCase().includes(query)
      return matchesCategory && matchesSearch
    })
  }, [productCategoryFilter, productSearch])

  // Handlers for Clients
  const handleToggleClientStatus = async (id: string, currentName: string) => {
    setActionLoading(true)
    try {
      const res = await superAdminApi.toggleClientStatus(id)
      setClients((prev) =>
        prev.map((c) => (c.id === id ? { ...c, is_active: res.is_active } : c))
      )
      notify(res.message || `Client "${currentName}" status changed to ${res.is_active ? 'Active' : 'Suspended'}.`)
    } catch {
      notify(`Failed to update status for ${currentName}`, 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleSetClientTier = async (id: string, tier: SubscriptionTier, clientName: string) => {
    setActionLoading(true)
    try {
      await superAdminApi.setClientTier(id, tier)
      setClients((prev) =>
        prev.map((c) => (c.id === id ? { ...c, subscription_tier: tier } : c))
      )
      notify(`Upgraded client "${clientName}" to ${tier.toUpperCase()} plan.`)
    } catch {
      notify(`Failed to change plan for ${clientName}`, 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleOpenEditClient = (client: ClientOrganization) => {
    setSelectedClient(client)
    setEditClientData({
      name: client.name,
      legal_name: client.legal_name || '',
      contact_email: client.contact_email,
      contact_phone: client.contact_phone || '',
      address: client.address || '',
      subscription_tier: (client.subscription_tier.toLowerCase() as SubscriptionTier) || 'enterprise',
    })
    setShowEditClientModal(true)
  }

  const handleEditClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedClient) return
    setActionLoading(true)
    try {
      const updated = await superAdminApi.updateClient(selectedClient.id, editClientData)
      setClients((prev) => prev.map((c) => (c.id === selectedClient.id ? { ...c, ...updated } : c)))
      setShowEditClientModal(false)
      notify(`Organization "${updated.name}" details updated successfully.`)
    } catch {
      notify('Failed to update client details.', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newClient.name || !newClient.code || !newClient.contact_email) {
      notify('Please fill out all required client details.', 'error')
      return
    }

    setActionLoading(true)
    try {
      const created = await superAdminApi.createClient(newClient)
      setClients((prev) => [created, ...prev])
      setShowCreateClientModal(false)
      setNewClient({
        name: '',
        code: '',
        legal_name: '',
        contact_email: '',
        contact_phone: '',
        address: '',
        subscription_tier: 'enterprise',
        admin_email: '',
        admin_password: '',
        admin_first_name: '',
        admin_last_name: '',
        admin_username: '',
      })
      notify(`Client "${created.name}" onboarded successfully!`)
      if (newClient.admin_email) {
        const updatedUsers = await superAdminApi.getGlobalUsers()
        setUsers(updatedUsers)
      }
    } catch {
      notify('Failed to create client organization. Check uniqueness of name/code.', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  // Handlers for Users
  const handleToggleUserActive = async (id: string, email: string) => {
    setActionLoading(true)
    try {
      const res = await superAdminApi.toggleUserActive(id)
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, is_active: res.is_active } : u))
      )
      notify(res.message || `User account ${email} is now ${res.is_active ? 'Active' : 'Locked'}.`)
    } catch {
      notify(`Failed to toggle active status for ${email}`, 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUser.email || !newUser.username || !newUser.password) {
      notify('Please provide email, username, and initial password.', 'error')
      return
    }

    setActionLoading(true)
    try {
      const created = await superAdminApi.createGlobalUser(newUser)
      setUsers((prev) => [created, ...prev])
      setShowCreateUserModal(false)
      setNewUser({
        email: '',
        username: '',
        password: '',
        first_name: '',
        last_name: '',
        role: 'FRONT_DESK',
        organization: '',
        phone_number: '',
        is_active: true,
      })
      notify(`User ${created.email} created successfully.`)
    } catch {
      notify('Failed to create user. Ensure email and username are unique.', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleOpenResetPassword = (userObj: PlatformUser) => {
    setSelectedUser(userObj)
    setNewPassword('')
    setShowResetPasswordModal(true)
  }

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser || !newPassword || newPassword.length < 6) {
      notify('Password must be at least 6 characters long.', 'error')
      return
    }

    setActionLoading(true)
    try {
      const res = await superAdminApi.resetUserPassword(selectedUser.id, newPassword)
      setShowResetPasswordModal(false)
      notify(res.message || `Password for ${selectedUser.email} has been updated.`)
    } catch {
      notify(`Failed to reset password for ${selectedUser.email}`, 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleOpenEditUser = (userObj: PlatformUser) => {
    setSelectedUser(userObj)
    setEditUserData({
      role: userObj.role,
      organization: userObj.organization || '',
      is_active: userObj.is_active,
      first_name: userObj.first_name || '',
      last_name: userObj.last_name || '',
      phone_number: userObj.phone_number || '',
    })
    setShowEditUserModal(true)
  }

  const handleEditUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return

    setActionLoading(true)
    try {
      const updated = await superAdminApi.updateGlobalUser(selectedUser.id, {
        role: editUserData.role,
        organization: editUserData.organization || null,
        is_active: editUserData.is_active,
        first_name: editUserData.first_name,
        last_name: editUserData.last_name,
        phone_number: editUserData.phone_number,
      })
      setUsers((prev) => prev.map((u) => (u.id === selectedUser.id ? updated : u)))
      setShowEditUserModal(false)
      notify(`User ${updated.email} updated successfully.`)
    } catch {
      notify(`Failed to update user profile`, 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteUser = async (id: string, email: string) => {
    if (!confirm(`Are you sure you want to permanently delete user account ${email}?`)) {
      return
    }
    setActionLoading(true)
    try {
      await superAdminApi.deleteUser(id)
      setUsers((prev) => prev.filter((u) => u.id !== id))
      notify(`User ${email} deleted permanently.`)
    } catch {
      notify(`Failed to delete user ${email}`, 'error')
    } finally {
      setActionLoading(false)
    }
  }

  // Product Sandbox Launcher
  const handleLaunchProduct = (mod: ProductModule) => {
    const targetRole = (mod.allowedRoles.includes(simulatorRole) ? simulatorRole : mod.allowedRoles[0]) as UserRole
    switchRole(targetRole)
    notify(`Simulating role "${targetRole.replace(/_/g, ' ')}" — Launching ${mod.name}...`)
    setTimeout(() => {
      navigate(mod.path)
    }, 400)
  }

  return (
    <div className="space-y-8 p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Notification Toast */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl px-5 py-3.5 shadow-2xl backdrop-blur-md border text-sm font-medium transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 ${
            notification.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
              : 'bg-rose-950/90 border-rose-500/50 text-rose-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Superadmin Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 text-white shadow-lg shadow-amber-500/25">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-foreground">
                  Superadmin Control Center
                </h1>
                <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-[11px] font-bold text-amber-500 uppercase tracking-wide">
                  Platform Root
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Centralized multi-tenant client provisioning, global user accounts management, and product access governance.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-border bg-card/60 px-3.5 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowCreateClientModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white px-3.5 py-2 text-xs font-bold shadow-md shadow-amber-600/20 transition-all cursor-pointer"
          >
            <Building2 className="h-3.5 w-3.5" />
            + Onboard Client
          </button>
          <button
            onClick={() => setShowCreateUserModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground px-3.5 py-2 text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            + Create User
          </button>
        </div>
      </div>

      {/* KPI Stats Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Clients */}
        <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-card to-card/60 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Client Tenants
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-foreground">
              {stats.totalClients}
            </span>
            <span className="text-xs font-semibold text-emerald-500">
              {stats.activeClients} Active
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {stats.totalClients - stats.activeClients} suspended organizations
          </p>
        </div>

        {/* Global Users */}
        <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-card to-card/60 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Global Platform Users
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-foreground">
              {stats.totalUsers}
            </span>
            <span className="text-xs font-semibold text-emerald-500">
              {stats.activeUsers} Active
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Across all client hotel institutions</p>
        </div>

        {/* Tier Distribution */}
        <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-card to-card/60 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Subscription Tiers
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
              <Zap className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs font-bold">
            <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-zinc-300">
              {stats.starterCount} Starter
            </span>
            <span className="rounded-md bg-blue-500/20 px-2 py-0.5 text-blue-400">
              {stats.proCount} Pro
            </span>
            <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-amber-400">
              {stats.entCount} Ent
            </span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Active client license allocations</p>
        </div>

        {/* Product Modules Available */}
        <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-card to-card/60 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Product Modules
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-foreground">
              {PRODUCT_MODULES.length}
            </span>
            <span className="text-xs font-semibold text-emerald-500">
              100% Operational
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Unified enterprise hospitality suite</p>
        </div>
      </div>

      {/* 5-Tab Navigation Header */}
      <div className="flex items-center gap-2 border-b border-border/60 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'overview'
              ? 'border-amber-500 text-amber-500'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Activity className="h-4 w-4" />
          Mission Control
        </button>
        <button
          onClick={() => setActiveTab('clients')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'clients'
              ? 'border-amber-500 text-amber-500'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Building2 className="h-4 w-4" />
          Client Organizations ({clients.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'users'
              ? 'border-amber-500 text-amber-500'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Users className="h-4 w-4" />
          Global User Accounts ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'products'
              ? 'border-amber-500 text-amber-500'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Layers className="h-4 w-4" />
          Product Access & Entitlements ({PRODUCT_MODULES.length})
        </button>
        <button
          onClick={() => setActiveTab('health')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'health'
              ? 'border-amber-500 text-amber-500'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Cpu className="h-4 w-4" />
          System & Telemetry
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: MISSION CONTROL OVERVIEW */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Fast Quick-Action Ribbon */}
          <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-transparent p-6 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-amber-500" />
                  Administrator Command Center
                </h2>
                <p className="text-xs text-muted-foreground mt-1 max-w-2xl">
                  You are operating with root authority over all multi-tenant hotel client accounts, RBAC roles, product entitlements, and operational endpoints.
                </p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => setActiveTab('clients')}
                  className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold hover:bg-muted cursor-pointer"
                >
                  <Building2 className="h-3.5 w-3.5 text-blue-500" />
                  Manage Tenants
                </button>
                <button
                  onClick={() => setActiveTab('users')}
                  className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold hover:bg-muted cursor-pointer"
                >
                  <Users className="h-3.5 w-3.5 text-purple-500" />
                  Manage Users
                </button>
                <button
                  onClick={() => setActiveTab('products')}
                  className="flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white px-3.5 py-2 text-xs font-bold shadow-sm cursor-pointer"
                >
                  <Layers className="h-3.5 w-3.5" />
                  Product Matrix
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Client Organizations Card */}
            <div className="lg:col-span-2 rounded-2xl border border-border/60 bg-card p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-amber-500" />
                    Provisioned Client Organizations
                  </h3>
                  <p className="text-xs text-muted-foreground">Recent hotel groups and multi-property tenants</p>
                </div>
                <button
                  onClick={() => setActiveTab('clients')}
                  className="text-xs font-bold text-amber-500 hover:underline flex items-center gap-1"
                >
                  View All <ChevronRight className="h-3 w-3" />
                </button>
              </div>

              <div className="divide-y divide-border/60">
                {clients.slice(0, 4).map((c) => (
                  <div key={c.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 font-bold text-xs">
                        {c.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-foreground flex items-center gap-2">
                          <span>{c.name}</span>
                          <span className="text-[10px] font-mono text-muted-foreground uppercase bg-muted px-1.5 py-0.5 rounded">
                            {c.code}
                          </span>
                        </div>
                        <div className="text-[11px] text-muted-foreground truncate max-w-xs">
                          {c.contact_email} • {c.properties_count ?? 0} properties • {c.users_count ?? 0} users
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          c.subscription_tier.toLowerCase() === 'enterprise'
                            ? 'bg-amber-500/15 text-amber-500'
                            : c.subscription_tier.toLowerCase() === 'professional'
                            ? 'bg-blue-500/15 text-blue-400'
                            : 'bg-zinc-800 text-zinc-300'
                        }`}
                      >
                        {c.subscription_tier}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          c.is_active ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                        }`}
                      >
                        {c.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Product Access Sandbox Card */}
            <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-primary" />
                  Product Access Sandbox
                </h3>
                <p className="text-xs text-muted-foreground">Test how any system role accesses products</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-foreground">Select Simulation Role</label>
                  <select
                    value={simulatorRole}
                    onChange={(e) => setSimulatorRole(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border bg-muted/40 px-3 py-2 text-xs text-foreground focus:outline-hidden cursor-pointer"
                  >
                    <option value="super_admin">Super Admin (Global Root)</option>
                    <option value="org_admin">Organization Admin</option>
                    <option value="property_manager">Property Manager</option>
                    <option value="front_desk">Front Desk Agent</option>
                    <option value="housekeeping">Housekeeping Lead</option>
                    <option value="chef_kitchen">Executive Chef (KOT)</option>
                    <option value="restaurant_pos">Restaurant POS Captain</option>
                    <option value="maintenance">Maintenance Engineer</option>
                    <option value="accountant">Senior Accountant</option>
                    <option value="security_gate">Gate Security Officer</option>
                    <option value="transport">Fleet Transport Dispatcher</option>
                    <option value="shareholder">Shareholder (Read-Only)</option>
                    <option value="guest">Guest / Mobile Check-in</option>
                  </select>
                </div>

                <div className="rounded-xl border border-border/60 bg-muted/20 p-3 text-xs space-y-1">
                  <div className="font-bold text-foreground">Active Role Capabilities:</div>
                  <div className="text-muted-foreground text-[11px]">
                    Role <strong className="text-amber-500">{simulatorRole.replace(/_/g, ' ')}</strong> has access to{' '}
                    <strong>
                      {
                        PRODUCT_MODULES.filter((p) =>
                          simulatorRole === 'super_admin' ? true : p.allowedRoles.includes(simulatorRole)
                        ).length
                      }
                    </strong>{' '}
                    out of {PRODUCT_MODULES.length} products in the application suite.
                  </div>
                </div>

                <button
                  onClick={() => {
                    switchRole(simulatorRole as UserRole)
                    notify(`Switched active system role to ${simulatorRole.replace(/_/g, ' ')}.`)
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground py-2 text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <UserCheck className="h-3.5 w-3.5" />
                  Simulate Role in Topbar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CLIENT ORGANIZATIONS */}
      {/* ========================================================================= */}
      {activeTab === 'clients' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search clients by name, slug code, or email..."
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                className="w-full rounded-xl border border-border bg-card/60 pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-amber-500/50"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-xl border border-border bg-card/60 px-3 py-1.5 text-xs">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Tier:</span>
                <select
                  value={clientTierFilter}
                  onChange={(e) => setClientTierFilter(e.target.value)}
                  className="bg-transparent font-medium text-foreground focus:outline-hidden cursor-pointer"
                >
                  <option value="all">All Plans</option>
                  <option value="starter">Starter</option>
                  <option value="professional">Professional</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 rounded-xl border border-border bg-card/60 px-3 py-1.5 text-xs">
                <span className="text-muted-foreground">Status:</span>
                <select
                  value={clientStatusFilter}
                  onChange={(e) => setClientStatusFilter(e.target.value)}
                  className="bg-transparent font-medium text-foreground focus:outline-hidden cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
          </div>

          {/* Clients Table */}
          <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border/80 bg-muted/40 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4">Client Organization</th>
                    <th className="px-6 py-4">Contact Info</th>
                    <th className="px-6 py-4">Subscription Plan</th>
                    <th className="px-6 py-4 text-center">Properties</th>
                    <th className="px-6 py-4 text-center">Users</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredClients.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                        No client organizations match your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredClients.map((client) => {
                      const tier = client.subscription_tier.toLowerCase()
                      return (
                        <tr key={client.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 font-bold">
                                {client.name.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-foreground flex items-center gap-2">
                                  <span>{client.name}</span>
                                  <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground uppercase">
                                    {client.code}
                                  </span>
                                </div>
                                {client.legal_name && (
                                  <div className="text-xs text-muted-foreground truncate max-w-xs">
                                    {client.legal_name}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col text-xs text-muted-foreground gap-0.5">
                              <div className="flex items-center gap-1.5 text-foreground">
                                <Mail className="h-3 w-3 text-muted-foreground" />
                                <span>{client.contact_email}</span>
                              </div>
                              {client.contact_phone && (
                                <div className="flex items-center gap-1.5">
                                  <Phone className="h-3 w-3 text-muted-foreground" />
                                  <span>{client.contact_phone}</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span
                                className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${
                                  tier === 'enterprise'
                                    ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                                    : tier === 'professional'
                                    ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                                    : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                                }`}
                              >
                                {tier}
                              </span>
                              <select
                                value={tier}
                                onChange={(e) =>
                                  handleSetClientTier(
                                    client.id,
                                    e.target.value as SubscriptionTier,
                                    client.name
                                  )
                                }
                                disabled={actionLoading}
                                className="rounded-lg border border-border bg-card/60 px-2 py-0.5 text-[11px] text-muted-foreground hover:text-foreground cursor-pointer"
                              >
                                <option value="starter">Starter</option>
                                <option value="professional">Pro</option>
                                <option value="enterprise">Enterprise</option>
                              </select>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center font-semibold text-foreground">
                            {client.properties_count ?? 0}
                          </td>
                          <td className="px-6 py-4 text-center font-semibold text-foreground">
                            {client.users_count ?? 0}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                client.is_active
                                  ? 'bg-emerald-500/15 text-emerald-400'
                                  : 'bg-rose-500/15 text-rose-400'
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  client.is_active ? 'bg-emerald-400' : 'bg-rose-400'
                                }`}
                              />
                              {client.is_active ? 'Active' : 'Suspended'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenEditClient(client)}
                                className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                                title="Edit Client Details"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleToggleClientStatus(client.id, client.name)}
                                disabled={actionLoading}
                                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                                  client.is_active
                                    ? 'border border-rose-500/30 text-rose-400 hover:bg-rose-500/10'
                                    : 'border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                                }`}
                              >
                                {client.is_active ? 'Suspend' : 'Activate'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: GLOBAL USER ACCOUNTS */}
      {/* ========================================================================= */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search users by name, username, or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full rounded-xl border border-border bg-card/60 pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-amber-500/50"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 rounded-xl border border-border bg-card/60 px-3 py-1.5 text-xs">
                <Building className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Tenant:</span>
                <select
                  value={userOrgFilter}
                  onChange={(e) => setUserOrgFilter(e.target.value)}
                  className="bg-transparent font-medium text-foreground focus:outline-hidden cursor-pointer"
                >
                  <option value="all">All Tenants</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 rounded-xl border border-border bg-card/60 px-3 py-1.5 text-xs">
                <span className="text-muted-foreground">Role:</span>
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="bg-transparent font-medium text-foreground focus:outline-hidden cursor-pointer"
                >
                  <option value="all">All Roles</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                  <option value="ORG_ADMIN">Org Admin</option>
                  <option value="PROPERTY_MANAGER">Property Manager</option>
                  <option value="FRONT_DESK">Front Desk</option>
                  <option value="HOUSEKEEPING">Housekeeping</option>
                  <option value="RESTAURANT_POS">Restaurant POS</option>
                  <option value="CHEF_KITCHEN">Chef / Kitchen</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="ACCOUNTANT">Accountant</option>
                  <option value="HR">HR</option>
                  <option value="SECURITY_STAFF">Security</option>
                  <option value="TRANSPORT_DISPATCHER">Transport</option>
                  <option value="SHAREHOLDER">Shareholder</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 rounded-xl border border-border bg-card/60 px-3 py-1.5 text-xs">
                <span className="text-muted-foreground">Status:</span>
                <select
                  value={userStatusFilter}
                  onChange={(e) => setUserStatusFilter(e.target.value)}
                  className="bg-transparent font-medium text-foreground focus:outline-hidden cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Locked</option>
                </select>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border/80 bg-muted/40 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4">User Account</th>
                    <th className="px-6 py-4">Organization / Tenant</th>
                    <th className="px-6 py-4">Assigned Role</th>
                    <th className="px-6 py-4">Access Status</th>
                    <th className="px-6 py-4">Date Joined</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                        No user accounts match your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((userObj) => {
                      const roleUpper = userObj.role.toUpperCase()
                      return (
                        <tr key={userObj.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500 font-bold text-xs">
                                {(userObj.first_name?.[0] || userObj.email[0]).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-foreground flex items-center gap-1.5">
                                  <span>{userObj.full_name || userObj.username || 'System User'}</span>
                                  {userObj.is_superuser && (
                                    <span className="rounded-md bg-amber-500/20 px-1.5 py-0.2 text-[9px] font-bold text-amber-500 uppercase">
                                      Root
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground">{userObj.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {userObj.organization_name ? (
                              <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
                                <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                <span className="truncate max-w-xs">{userObj.organization_name}</span>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground italic">Global Platform Root</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                                roleUpper.includes('SUPER')
                                  ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                                  : roleUpper.includes('ADMIN')
                                  ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                                  : roleUpper.includes('MANAGER')
                                  ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                                  : roleUpper.includes('DESK')
                                  ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                                  : roleUpper.includes('CHEF') || roleUpper.includes('POS')
                                  ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
                                  : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                              }`}
                            >
                              {userObj.role.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                userObj.is_active
                                  ? 'bg-emerald-500/15 text-emerald-400'
                                  : 'bg-rose-500/15 text-rose-400'
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  userObj.is_active ? 'bg-emerald-400' : 'bg-rose-400'
                                }`}
                              />
                              {userObj.is_active ? 'Active' : 'Locked'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs text-muted-foreground">
                            {userObj.date_joined ? new Date(userObj.date_joined).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Reset Password */}
                              <button
                                onClick={() => handleOpenResetPassword(userObj)}
                                className="rounded-lg border border-border p-1.5 text-muted-foreground hover:text-amber-500 hover:bg-muted cursor-pointer"
                                title="Reset User Password"
                              >
                                <KeyRound className="h-3.5 w-3.5" />
                              </button>

                              {/* Edit User Profile */}
                              <button
                                onClick={() => handleOpenEditUser(userObj)}
                                className="rounded-lg border border-border p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                                title="Edit User Details & Role"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>

                              {/* Lock / Unlock Toggle */}
                              <button
                                onClick={() => handleToggleUserActive(userObj.id, userObj.email)}
                                disabled={actionLoading}
                                className={`rounded-lg p-1.5 border transition-colors cursor-pointer ${
                                  userObj.is_active
                                    ? 'border-rose-500/30 text-rose-400 hover:bg-rose-500/10'
                                    : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                                }`}
                                title={userObj.is_active ? 'Lock Account' : 'Unlock Account'}
                              >
                                {userObj.is_active ? (
                                  <UserX className="h-3.5 w-3.5" />
                                ) : (
                                  <UserCheck className="h-3.5 w-3.5" />
                                )}
                              </button>

                              {/* Delete User */}
                              <button
                                onClick={() => handleDeleteUser(userObj.id, userObj.email)}
                                disabled={actionLoading || userObj.email === user?.email}
                                className="rounded-lg border border-border p-1.5 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 disabled:opacity-30 cursor-pointer"
                                title="Delete User Account"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: PRODUCT ACCESS & ENTITLEMENTS ENGINE */}
      {/* ========================================================================= */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="rounded-2xl border border-border/60 bg-gradient-to-r from-card via-card/80 to-muted/20 p-6 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Layers className="h-5 w-5 text-amber-500" />
                  Product Catalog & Role Entitlements Matrix
                </h2>
                <p className="text-xs text-muted-foreground mt-1 max-w-2xl">
                  Super administrators can audit, configure, and simulate all 24 operational modules. Ensure users in every department have seamless access to their assigned operational tools.
                </p>
              </div>

              {/* Simulation Role Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground">Test as Role:</span>
                <select
                  value={simulatorRole}
                  onChange={(e) => setSimulatorRole(e.target.value)}
                  className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-500 focus:outline-hidden cursor-pointer"
                >
                  <option value="super_admin">Super Admin (All Access)</option>
                  <option value="org_admin">Organization Admin</option>
                  <option value="property_manager">Property Manager</option>
                  <option value="front_desk">Front Desk Agent</option>
                  <option value="housekeeping">Housekeeping Staff</option>
                  <option value="chef_kitchen">Executive Chef (KOT)</option>
                  <option value="restaurant_pos">Restaurant POS Captain</option>
                  <option value="maintenance">Maintenance Engineer</option>
                  <option value="accountant">Financial Accountant</option>
                  <option value="security_gate">Gate Security</option>
                  <option value="transport">Transport Dispatcher</option>
                  <option value="shareholder">Shareholder (Read-Only)</option>
                  <option value="guest">Guest Portal</option>
                </select>
              </div>
            </div>
          </div>

          {/* Category & Search Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search product modules by name, description, or route..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full rounded-xl border border-border bg-card/60 pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-amber-500/50"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {['all', 'Front Office', 'Operations', 'Food & Beverage', 'Cashiering & Finance', 'Mobility & Distribution', 'Governance & Analytics'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setProductCategoryFilter(cat)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    productCategoryFilter === cat
                      ? 'bg-amber-500 text-white font-bold'
                      : 'border border-border bg-card/60 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {cat === 'all' ? 'All Modules' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((mod) => {
              const IconComp = mod.icon
              const hasAccess =
                simulatorRole === 'super_admin' || mod.allowedRoles.includes(simulatorRole)

              return (
                <div
                  key={mod.id}
                  className={`rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                    hasAccess
                      ? 'border-border/80 bg-card hover:border-amber-500/50 hover:shadow-md'
                      : 'border-border/40 bg-card/40 opacity-70'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold ${
                            hasAccess
                              ? 'bg-amber-500/10 text-amber-500'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          <IconComp className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                            <span>{mod.name}</span>
                            {mod.badge && (
                              <span className="rounded-full bg-primary/10 px-2 py-0.2 text-[9px] font-bold text-primary uppercase">
                                {mod.badge}
                              </span>
                            )}
                          </h4>
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                            {mod.category}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                          mod.minPlan === 'enterprise'
                            ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                            : mod.minPlan === 'professional'
                            ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                            : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {mod.minPlan}
                      </span>
                    </div>

                    <p className="mt-3 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {mod.description}
                    </p>

                    <div className="mt-4 pt-3 border-t border-border/60">
                      <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1.5">
                        Permitted System Roles:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {mod.allowedRoles.map((r) => (
                          <span
                            key={r}
                            className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                              simulatorRole === r
                                ? 'bg-amber-500 text-white font-bold'
                                : 'bg-muted/80 text-muted-foreground'
                            }`}
                          >
                            {r.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono text-muted-foreground">
                      {mod.path}
                    </span>

                    <button
                      onClick={() => handleLaunchProduct(mod)}
                      className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                        hasAccess
                          ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-xs'
                          : 'border border-border text-muted-foreground hover:text-foreground'
                      }`}
                      title={`Launch ${mod.name} as ${simulatorRole}`}
                    >
                      <ExternalLink className="h-3 w-3" />
                      Launch Product
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Subscription Tier Product Entitlement Matrix */}
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              Subscription Tier Feature Entitlements
            </h3>
            <p className="text-xs text-muted-foreground">
              Feature entitlements automatically cascade to client tenants based on their subscription tier.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* Starter Plan */}
              <div className="rounded-2xl border border-zinc-700 bg-zinc-900/40 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-foreground">Starter Tier</h4>
                  <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] font-bold text-zinc-300 uppercase">
                    Core Operations
                  </span>
                </div>
                <ul className="text-xs space-y-1.5 text-muted-foreground">
                  <li className="flex items-center gap-2 text-foreground">
                    <Check className="h-3.5 w-3.5 text-emerald-400" /> Front Desk Hub & Registrations
                  </li>
                  <li className="flex items-center gap-2 text-foreground">
                    <Check className="h-3.5 w-3.5 text-emerald-400" /> Room Availability Board
                  </li>
                  <li className="flex items-center gap-2 text-foreground">
                    <Check className="h-3.5 w-3.5 text-emerald-400" /> Unified Guest Folios
                  </li>
                  <li className="flex items-center gap-2 text-foreground">
                    <Check className="h-3.5 w-3.5 text-emerald-400" /> Housekeeping & Maintenance
                  </li>
                  <li className="flex items-center gap-2 text-foreground">
                    <Check className="h-3.5 w-3.5 text-emerald-400" /> Mobile Digital Check-in
                  </li>
                </ul>
              </div>

              {/* Professional Plan */}
              <div className="rounded-2xl border border-blue-500/40 bg-blue-500/5 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-foreground">Professional Tier</h4>
                  <span className="rounded-md bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-400 uppercase">
                    Full F&B & Facilities
                  </span>
                </div>
                <ul className="text-xs space-y-1.5 text-muted-foreground">
                  <li className="flex items-center gap-2 text-foreground">
                    <Check className="h-3.5 w-3.5 text-blue-400" /> Everything in Starter
                  </li>
                  <li className="flex items-center gap-2 text-foreground">
                    <Check className="h-3.5 w-3.5 text-blue-400" /> Restaurant POS & KDS (Kitchen Display)
                  </li>
                  <li className="flex items-center gap-2 text-foreground">
                    <Check className="h-3.5 w-3.5 text-blue-400" /> Banquets, Events & Spa
                  </li>
                  <li className="flex items-center gap-2 text-foreground">
                    <Check className="h-3.5 w-3.5 text-blue-400" /> Fleet Transport & Gate Security
                  </li>
                  <li className="flex items-center gap-2 text-foreground">
                    <Check className="h-3.5 w-3.5 text-blue-400" /> HR Rosters & Loyalty CRM
                  </li>
                </ul>
              </div>

              {/* Enterprise Plan */}
              <div className="rounded-2xl border border-amber-500/40 bg-amber-500/5 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-foreground">Enterprise Tier</h4>
                  <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400 uppercase">
                    AI & Multi-Property
                  </span>
                </div>
                <ul className="text-xs space-y-1.5 text-muted-foreground">
                  <li className="flex items-center gap-2 text-foreground">
                    <Check className="h-3.5 w-3.5 text-amber-400" /> Everything in Professional
                  </li>
                  <li className="flex items-center gap-2 text-foreground">
                    <Check className="h-3.5 w-3.5 text-amber-400" /> Dynamic AI Revenue & Pricing Engine
                  </li>
                  <li className="flex items-center gap-2 text-foreground">
                    <Check className="h-3.5 w-3.5 text-amber-400" /> Global OTA Two-Way Channel Manager
                  </li>
                  <li className="flex items-center gap-2 text-foreground">
                    <Check className="h-3.5 w-3.5 text-amber-400" /> Executive Multi-Property Portfolios
                  </li>
                  <li className="flex items-center gap-2 text-foreground">
                    <Check className="h-3.5 w-3.5 text-amber-400" /> Shareholder Portal & Root Auditing
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: SYSTEM & TELEMETRY */}
      {/* ========================================================================= */}
      {activeTab === 'health' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-400" />
              Backend Infrastructure Health & Subsystems
            </h3>
            <p className="text-xs text-muted-foreground">
              Real-time health status of databases, ASGI asynchronous gateway, and cryptographic JWT layers.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-1">
                <div className="text-[11px] font-bold text-muted-foreground uppercase">PostgreSQL / SQLite</div>
                <div className="text-lg font-black text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" /> Operational
                </div>
                <div className="text-[11px] text-muted-foreground">Latency: &lt; 4ms</div>
              </div>

              <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-1">
                <div className="text-[11px] font-bold text-muted-foreground uppercase">Daphne ASGI Server</div>
                <div className="text-lg font-black text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" /> Active Port 8000
                </div>
                <div className="text-[11px] text-muted-foreground">WebSocket & HTTP/1.1</div>
              </div>

              <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-1">
                <div className="text-[11px] font-bold text-muted-foreground uppercase">Channels Redis Layer</div>
                <div className="text-lg font-black text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" /> InMemory / Redis
                </div>
                <div className="text-[11px] text-muted-foreground">KDS & Frontdesk Events</div>
              </div>

              <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-1">
                <div className="text-[11px] font-bold text-muted-foreground uppercase">Security & Auth</div>
                <div className="text-lg font-black text-amber-500 flex items-center gap-2">
                  <Lock className="h-5 w-5" /> HttpOnly JWT
                </div>
                <div className="text-[11px] text-muted-foreground">Tenant-Scoped RBAC</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ONBOARD CLIENT ORGANIZATION */}
      {/* ========================================================================= */}
      {showCreateClientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-amber-500" />
                <h3 className="text-base font-bold text-foreground">Onboard New Client Hotel Organization</h3>
              </div>
              <button
                onClick={() => setShowCreateClientModal(false)}
                className="rounded-lg p-1 text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-foreground">Company / Hotel Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Mirage Hotels"
                    value={newClient.name}
                    onChange={(e) => {
                      const name = e.target.value
                      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                      setNewClient({ ...newClient, name, code: newClient.code || slug })
                    }}
                    className="mt-1 w-full rounded-xl border border-border bg-muted/40 px-3.5 py-2 text-sm text-foreground focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground">Tenant Slug Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. royal-mirage"
                    value={newClient.code}
                    onChange={(e) => setNewClient({ ...newClient, code: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-border bg-muted/40 px-3.5 py-2 text-sm text-foreground focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-foreground">Legal Entity Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Royal Mirage Hospitality LLC"
                    value={newClient.legal_name}
                    onChange={(e) => setNewClient({ ...newClient, legal_name: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-border bg-muted/40 px-3.5 py-2 text-sm text-foreground focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground">Subscription Tier *</label>
                  <select
                    value={newClient.subscription_tier}
                    onChange={(e) =>
                      setNewClient({
                        ...newClient,
                        subscription_tier: e.target.value as SubscriptionTier,
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-border bg-muted/40 px-3.5 py-2 text-sm text-foreground focus:outline-hidden cursor-pointer"
                  >
                    <option value="starter">Starter Plan (Core Front Office)</option>
                    <option value="professional">Professional Plan (F&B + Spa)</option>
                    <option value="enterprise">Enterprise Plan (AI Pricing + OTA)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-foreground">Contact Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="corp@royalmirage.com"
                    value={newClient.contact_email}
                    onChange={(e) => setNewClient({ ...newClient, contact_email: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-border bg-muted/40 px-3.5 py-2 text-sm text-foreground focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground">Contact Phone</label>
                  <input
                    type="text"
                    placeholder="+1 (555) 019-2831"
                    value={newClient.contact_phone}
                    onChange={(e) => setNewClient({ ...newClient, contact_phone: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-border bg-muted/40 px-3.5 py-2 text-sm text-foreground focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground">Corporate Address</label>
                <input
                  type="text"
                  placeholder="100 Ocean Drive, Miami, FL 33139"
                  value={newClient.address}
                  onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-border bg-muted/40 px-3.5 py-2 text-sm text-foreground focus:outline-hidden"
                />
              </div>

              {/* Initial Organization Admin Credentials */}
              <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-amber-500" />
                  Primary Organization Administrator (Optional Auto-Provision)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Admin Email</label>
                    <input
                      type="email"
                      placeholder="admin@royalmirage.com"
                      value={newClient.admin_email}
                      onChange={(e) => setNewClient({ ...newClient, admin_email: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Initial Password</label>
                    <input
                      type="password"
                      placeholder="Password123!"
                      value={newClient.admin_password}
                      onChange={(e) => setNewClient({ ...newClient, admin_password: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowCreateClientModal(false)}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 px-5 py-2 text-xs font-bold text-white shadow-md cursor-pointer"
                >
                  {actionLoading ? 'Provisioning...' : 'Provision Client Organization'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT CLIENT ORGANIZATION */}
      {/* ========================================================================= */}
      {showEditClientModal && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-amber-500" />
                <h3 className="text-base font-bold text-foreground">Edit Client Organization</h3>
              </div>
              <button
                onClick={() => setShowEditClientModal(false)}
                className="rounded-lg p-1 text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleEditClientSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-foreground">Organization Name</label>
                <input
                  type="text"
                  required
                  value={editClientData.name}
                  onChange={(e) => setEditClientData({ ...editClientData, name: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-border bg-muted/40 px-3.5 py-2 text-sm text-foreground focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground">Legal Entity Name</label>
                <input
                  type="text"
                  value={editClientData.legal_name}
                  onChange={(e) => setEditClientData({ ...editClientData, legal_name: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-border bg-muted/40 px-3.5 py-2 text-sm text-foreground focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-foreground">Contact Email</label>
                  <input
                    type="email"
                    required
                    value={editClientData.contact_email}
                    onChange={(e) => setEditClientData({ ...editClientData, contact_email: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-border bg-muted/40 px-3.5 py-2 text-sm text-foreground focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground">Contact Phone</label>
                  <input
                    type="text"
                    value={editClientData.contact_phone}
                    onChange={(e) => setEditClientData({ ...editClientData, contact_phone: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-border bg-muted/40 px-3.5 py-2 text-sm text-foreground focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground">Address</label>
                <input
                  type="text"
                  value={editClientData.address}
                  onChange={(e) => setEditClientData({ ...editClientData, address: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-border bg-muted/40 px-3.5 py-2 text-sm text-foreground focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowEditClientModal(false)}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow-md cursor-pointer"
                >
                  {actionLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE GLOBAL USER */}
      {/* ========================================================================= */}
      {showCreateUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-amber-500" />
                <h3 className="text-base font-bold text-foreground">Create New Platform User Account</h3>
              </div>
              <button
                onClick={() => setShowCreateUserModal(false)}
                className="rounded-lg p-1 text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-foreground">First Name</label>
                  <input
                    type="text"
                    value={newUser.first_name}
                    onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-border bg-muted/40 px-3.5 py-2 text-sm text-foreground focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground">Last Name</label>
                  <input
                    type="text"
                    value={newUser.last_name}
                    onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-border bg-muted/40 px-3.5 py-2 text-sm text-foreground focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="agent@omnihospitality.com"
                  value={newUser.email}
                  onChange={(e) => {
                    const email = e.target.value
                    const username = email.split('@')[0]
                    setNewUser({ ...newUser, email, username: newUser.username || username })
                  }}
                  className="mt-1 w-full rounded-xl border border-border bg-muted/40 px-3.5 py-2 text-sm text-foreground focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-foreground">Username *</label>
                  <input
                    type="text"
                    required
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-border bg-muted/40 px-3.5 py-2 text-sm text-foreground focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground">Initial Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Min 6 characters"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-border bg-muted/40 px-3.5 py-2 text-sm text-foreground focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground">Assign Client Tenant</label>
                <select
                  value={newUser.organization || ''}
                  onChange={(e) => setNewUser({ ...newUser, organization: e.target.value || null })}
                  className="mt-1 w-full rounded-xl border border-border bg-muted/40 px-3.5 py-2 text-sm text-foreground focus:outline-hidden cursor-pointer"
                >
                  <option value="">None (Platform-Wide Superadmin)</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground">Assigned Role *</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-border bg-muted/40 px-3.5 py-2 text-sm text-foreground focus:outline-hidden cursor-pointer"
                >
                  <option value="SUPER_ADMIN">Super Admin (Global Root)</option>
                  <option value="ORG_ADMIN">Organization Admin</option>
                  <option value="PROPERTY_MANAGER">Property Manager</option>
                  <option value="FRONT_DESK">Front Desk</option>
                  <option value="HOUSEKEEPING">Housekeeping</option>
                  <option value="RESTAURANT_POS">Restaurant / POS</option>
                  <option value="CHEF_KITCHEN">Chef / Kitchen</option>
                  <option value="MAINTENANCE">Maintenance Engineer</option>
                  <option value="ACCOUNTANT">Accountant</option>
                  <option value="HR">HR Staff</option>
                  <option value="SECURITY_STAFF">Security / Gate Staff</option>
                  <option value="TRANSPORT_DISPATCHER">Transport Dispatcher</option>
                  <option value="DRIVER">Driver</option>
                  <option value="SHAREHOLDER">Shareholder</option>
                  <option value="GUEST">Guest</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowCreateUserModal(false)}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow-md cursor-pointer"
                >
                  {actionLoading ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: RESET PASSWORD */}
      {/* ========================================================================= */}
      {showResetPasswordModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-amber-500" />
                <h3 className="text-base font-bold text-foreground">Reset User Password</h3>
              </div>
              <button
                onClick={() => setShowResetPasswordModal(false)}
                className="rounded-lg p-1 text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Set a new secure password for <strong className="text-foreground">{selectedUser.email}</strong>.
            </p>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-foreground">New Password</label>
                <input
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-muted/40 px-3.5 py-2 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowResetPasswordModal(false)}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-xl bg-amber-600 hover:bg-amber-500 px-5 py-2 text-xs font-bold text-white shadow-md cursor-pointer"
                >
                  {actionLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT USER */}
      {/* ========================================================================= */}
      {showEditUserModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-amber-500" />
                <h3 className="text-base font-bold text-foreground">Edit User Profile & Role</h3>
              </div>
              <button
                onClick={() => setShowEditUserModal(false)}
                className="rounded-lg p-1 text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Editing platform credentials for <strong className="text-foreground">{selectedUser.email}</strong>.
            </p>

            <form onSubmit={handleEditUserSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-foreground">First Name</label>
                  <input
                    type="text"
                    value={editUserData.first_name}
                    onChange={(e) =>
                      setEditUserData({ ...editUserData, first_name: e.target.value })
                    }
                    className="mt-1 w-full rounded-xl border border-border bg-muted/40 px-3.5 py-2 text-sm text-foreground focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground">Last Name</label>
                  <input
                    type="text"
                    value={editUserData.last_name}
                    onChange={(e) =>
                      setEditUserData({ ...editUserData, last_name: e.target.value })
                    }
                    className="mt-1 w-full rounded-xl border border-border bg-muted/40 px-3.5 py-2 text-sm text-foreground focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground">Assigned Role</label>
                <select
                  value={editUserData.role}
                  onChange={(e) => setEditUserData({ ...editUserData, role: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-border bg-muted/40 px-3.5 py-2 text-sm text-foreground focus:outline-hidden cursor-pointer"
                >
                  <option value="SUPER_ADMIN">Super Admin (Global Root)</option>
                  <option value="ORG_ADMIN">Organization Admin</option>
                  <option value="PROPERTY_MANAGER">Property Manager</option>
                  <option value="FRONT_DESK">Front Desk</option>
                  <option value="HOUSEKEEPING">Housekeeping</option>
                  <option value="RESTAURANT_POS">Restaurant / POS</option>
                  <option value="CHEF_KITCHEN">Chef / Kitchen</option>
                  <option value="MAINTENANCE">Maintenance Engineer</option>
                  <option value="ACCOUNTANT">Accountant</option>
                  <option value="HR">HR Staff</option>
                  <option value="SECURITY_STAFF">Security / Gate Staff</option>
                  <option value="TRANSPORT_DISPATCHER">Transport Dispatcher</option>
                  <option value="DRIVER">Driver</option>
                  <option value="SHAREHOLDER">Shareholder</option>
                  <option value="GUEST">Guest</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground">Assigned Client Tenant</label>
                <select
                  value={editUserData.organization}
                  onChange={(e) =>
                    setEditUserData({ ...editUserData, organization: e.target.value })
                  }
                  className="mt-1 w-full rounded-xl border border-border bg-muted/40 px-3.5 py-2 text-sm text-foreground focus:outline-hidden cursor-pointer"
                >
                  <option value="">None (Platform Root)</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="user_active_check"
                  checked={editUserData.is_active}
                  onChange={(e) =>
                    setEditUserData({ ...editUserData, is_active: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-border text-amber-600 focus:ring-amber-500 cursor-pointer"
                />
                <label
                  htmlFor="user_active_check"
                  className="text-xs font-semibold text-foreground cursor-pointer"
                >
                  Account is Active (allows user login and product access)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowEditUserModal(false)}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow-md cursor-pointer"
                >
                  {actionLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default SuperAdminHub
