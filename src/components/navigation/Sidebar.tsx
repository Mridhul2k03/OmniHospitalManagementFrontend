import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'
import { useSubscription } from '@/context/SubscriptionContext'
import { SubscriptionUpgradeModal } from '@/components/subscription/SubscriptionUpgradeModal'
import { UserRole, SubscriptionTier } from '@/types'
import {
  Hotel,
  CalendarDays,
  LayoutGrid,
  Users,
  Sparkles,
  Wrench,
  UtensilsCrossed,
  Flame,
  PartyPopper,
  Receipt,
  CreditCard,
  Truck,
  ShieldCheck,
  Luggage,
  TrendingUp,
  Globe2,
  PieChart,
  Award,
  Building2,
  FileSpreadsheet,
  Boxes,
  UserCheck,
  Settings,
  GraduationCap,
  Activity,
  Lock,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Administrative and operational executive roles that oversee all modules
const LEADERSHIP_ROLES: UserRole[] = [
  'super_admin',
  'org_admin',
  'property_manager',
  'president',
  'vice_president',
  'ceo',
  'operations_director',
]

interface NavItem {
  label: string
  path: string
  icon: React.ComponentType<{ className?: string }>
  roles: UserRole[]
  minPlan?: SubscriptionTier
  badge?: string
}

interface NavSection {
  title: string
  roles: UserRole[]
  items: NavItem[]
}

const NAVIGATION_SCHEMA: NavSection[] = [
  {
    title: 'Front Office & Rooms',
    roles: [...LEADERSHIP_ROLES, 'front_desk', 'housekeeping', 'maintenance'],
    items: [
      { label: 'Front Desk Hub', path: '/app/frontdesk', icon: Hotel, roles: [...LEADERSHIP_ROLES, 'front_desk'], minPlan: 'starter' },
      { label: 'Room Availability Board', path: '/app/rooms', icon: LayoutGrid, roles: [...LEADERSHIP_ROLES, 'front_desk', 'housekeeping', 'maintenance'], minPlan: 'starter' },
      { label: 'Reservations', path: '/app/reservations', icon: CalendarDays, roles: [...LEADERSHIP_ROLES, 'front_desk'], minPlan: 'starter' },
      { label: 'Digital Check-in', path: '/app/checkin', icon: UserCheck, roles: [...LEADERSHIP_ROLES, 'front_desk', 'guest'], minPlan: 'starter', badge: 'Live' },
      { label: 'Students & Admissions', path: '/app/students', icon: GraduationCap, roles: [...LEADERSHIP_ROLES, 'front_desk'], minPlan: 'professional', badge: 'API' },
    ],
  },
  {
    title: 'Operations & Facilities',
    roles: [...LEADERSHIP_ROLES, 'housekeeping', 'maintenance', 'security_gate', 'front_desk'],
    items: [
      { label: 'Housekeeping Board', path: '/app/housekeeping', icon: Sparkles, roles: [...LEADERSHIP_ROLES, 'housekeeping'], minPlan: 'starter' },
      { label: 'Maintenance Work Orders', path: '/app/maintenance', icon: Wrench, roles: [...LEADERSHIP_ROLES, 'maintenance', 'housekeeping'], minPlan: 'starter' },
      { label: 'Gate Security & Access', path: '/app/security', icon: ShieldCheck, roles: [...LEADERSHIP_ROLES, 'security_gate'], minPlan: 'professional' },
      { label: 'Cloakroom / Luggage', path: '/app/cloakroom', icon: Luggage, roles: [...LEADERSHIP_ROLES, 'front_desk', 'security_gate', 'housekeeping'], minPlan: 'professional' },
    ],
  },
  {
    title: 'Food & Beverage / Events',
    roles: [...LEADERSHIP_ROLES, 'restaurant_pos', 'chef_kitchen', 'guest'],
    items: [
      { label: 'Restaurant POS', path: '/app/pos', icon: UtensilsCrossed, roles: [...LEADERSHIP_ROLES, 'restaurant_pos', 'chef_kitchen', 'guest'], minPlan: 'professional' },
      { label: 'Kitchen Display (KOT)', path: '/app/kds', icon: Flame, roles: [...LEADERSHIP_ROLES, 'chef_kitchen', 'restaurant_pos'], minPlan: 'professional', badge: 'Realtime' },
      { label: 'Banquets & Events', path: '/app/events', icon: PartyPopper, roles: [...LEADERSHIP_ROLES], minPlan: 'professional' },
      { label: 'Spa & Wellness', path: '/app/spa', icon: Sparkles, roles: [...LEADERSHIP_ROLES, 'guest'], minPlan: 'professional' },
    ],
  },
  {
    title: 'Cashiering & Finance',
    roles: [...LEADERSHIP_ROLES, 'front_desk', 'accountant'],
    items: [
      { label: 'Unified Folios', path: '/app/folios', icon: Receipt, roles: [...LEADERSHIP_ROLES, 'front_desk', 'accountant'], minPlan: 'starter' },
      { label: 'Billing & Cashiering', path: '/app/finance', icon: CreditCard, roles: [...LEADERSHIP_ROLES, 'accountant'], minPlan: 'professional' },
      { label: 'Inventory & Procurement', path: '/app/inventory', icon: Boxes, roles: [...LEADERSHIP_ROLES, 'accountant'], minPlan: 'professional' },
    ],
  },
  {
    title: 'Mobility & Distribution',
    roles: [...LEADERSHIP_ROLES, 'transport'],
    items: [
      { label: 'Transport & Fleet', path: '/app/transport', icon: Truck, roles: [...LEADERSHIP_ROLES, 'transport'], minPlan: 'professional' },
      { label: 'Dynamic Pricing', path: '/app/pricing', icon: TrendingUp, roles: [...LEADERSHIP_ROLES], minPlan: 'enterprise', badge: 'AI' },
      { label: 'OTA Channel Manager', path: '/app/channels', icon: Globe2, roles: [...LEADERSHIP_ROLES], minPlan: 'enterprise' },
    ],
  },
  {
    title: 'Governance & Analytics',
    roles: [...LEADERSHIP_ROLES, 'accountant', 'hr', 'shareholder'],
    items: [
      { label: 'Executive Dashboards', path: '/app/corporate', icon: PieChart, roles: [...LEADERSHIP_ROLES, 'accountant'], minPlan: 'enterprise' },
      { label: 'Shareholder Portal', path: '/app/shareholder', icon: FileSpreadsheet, roles: [...LEADERSHIP_ROLES, 'shareholder'], minPlan: 'enterprise', badge: 'Read-Only' },
      { label: 'Staff & HR Roster', path: '/app/hr', icon: Users, roles: [...LEADERSHIP_ROLES, 'hr'], minPlan: 'professional' },
      { label: 'Loyalty & CRM', path: '/app/loyalty', icon: Award, roles: [...LEADERSHIP_ROLES, 'hr', 'guest'], minPlan: 'professional' },
      { label: 'System & API Health', path: '/app/system-status', icon: Activity, roles: [...LEADERSHIP_ROLES], minPlan: 'enterprise', badge: 'Live' },
      { label: 'Settings', path: '/app/settings', icon: Settings, roles: [...LEADERSHIP_ROLES], minPlan: 'starter' },
    ],
  },
  {
    title: 'Platform Administration',
    roles: ['super_admin'],
    items: [
      {
        label: 'Superadmin Console',
        path: '/app/superadmin',
        icon: ShieldCheck,
        roles: ['super_admin'],
        minPlan: 'starter',
        badge: 'Root',
      },
    ],
  },
]

export const Sidebar: React.FC<{ isCollapsed?: boolean }> = ({ isCollapsed = false }) => {
  const { user } = useAuth()
  const { isFeatureAllowed, openUpgradeModal } = useSubscription()

  const userRole: UserRole = ((user?.role || 'super_admin').toLowerCase() as UserRole)
  const isSuperAdmin = userRole === 'super_admin'

  // Filter sections and items strictly based on the user's role (super admin sees all sections)
  const visibleSections = NAVIGATION_SCHEMA.map((section) => {
    // Check if section applies to user's role
    if (!isSuperAdmin && !section.roles.includes(userRole)) {
      return null
    }

    // Filter items inside section that user has permission to see
    const visibleItems = section.items.filter((item) => isSuperAdmin || item.roles.includes(userRole))
    if (visibleItems.length === 0) {
      return null
    }

    return {
      ...section,
      items: visibleItems,
    }
  }).filter(Boolean) as NavSection[]

  return (
    <>
      <aside
        className={cn(
          'sticky top-0 flex h-screen flex-col border-r border-border bg-card text-card-foreground transition-all duration-200 z-30',
          isCollapsed ? 'w-20' : 'w-64'
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-border px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 text-white shadow-md">
            <Building2 className="h-5 w-5" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-foreground">OmniHospitality</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-500">
                Enterprise OS
              </span>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {visibleSections.length === 0 ? (
            <div className="p-4 text-center text-xs text-muted-foreground">
              No navigation areas allocated to this role profile.
            </div>
          ) : (
            visibleSections.map((section, idx) => (
              <div key={idx} className="space-y-1">
                {!isCollapsed && (
                  <div className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
                    {section.title}
                  </div>
                )}
                {section.items.map((item) => {
                  const isPlanUnlocked = isFeatureAllowed(item.minPlan)
                  const Icon = item.icon

                  if (!isPlanUnlocked) {
                    // Feature is role-allowed but plan-locked
                    return (
                      <button
                        key={item.path}
                        type="button"
                        onClick={() => openUpgradeModal(item.label, item.minPlan)}
                        className="group flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors text-muted-foreground/60 hover:bg-muted/40 hover:text-foreground cursor-pointer"
                        title={`Requires ${item.minPlan?.toUpperCase()} plan`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-4 w-4 shrink-0 text-muted-foreground/50" />
                          {!isCollapsed && <span className="truncate">{item.label}</span>}
                        </div>
                        {!isCollapsed && (
                          <span className="flex items-center gap-1 rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-bold text-amber-600 dark:text-amber-400">
                            <Lock className="h-2.5 w-2.5" />
                            {item.minPlan === 'enterprise' ? 'ENT' : 'PRO'}
                          </span>
                        )}
                      </button>
                    )
                  }

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        cn(
                          'group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        )
                      }
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4 shrink-0" />
                        {!isCollapsed && <span>{item.label}</span>}
                      </div>
                      {!isCollapsed && item.badge && (
                        <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  )
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer / User Profile snippet */}
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-3 rounded-lg p-2 bg-muted/40">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary uppercase">
              {user?.firstName?.[0] || 'U'}
              {user?.lastName?.[0] || 'S'}
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-semibold text-foreground truncate">
                  {user?.firstName} {user?.lastName}
                </span>
                <span className="text-[10px] text-muted-foreground capitalize truncate">
                  {user?.role.replace(/_/g, ' ')}
                </span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Subscription Upgrade Modal */}
      <SubscriptionUpgradeModal />
    </>
  )
}
