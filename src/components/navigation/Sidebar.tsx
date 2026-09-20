import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'
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
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavSection {
  title: string
  roles?: string[]
  items: {
    label: string
    path: string
    icon: React.ComponentType<{ className?: string }>
    roles?: string[]
    badge?: string
  }[]
}

const NAVIGATION_SCHEMA: NavSection[] = [
  {
    title: 'Front Office & Rooms',
    items: [
      { label: 'Front Desk Hub', path: '/app/frontdesk', icon: Hotel },
      { label: 'Room Availability Board', path: '/app/rooms', icon: LayoutGrid },
      { label: 'Reservations', path: '/app/reservations', icon: CalendarDays },
      { label: 'Digital Check-in', path: '/app/checkin', icon: UserCheck, badge: 'Live' },
      { label: 'Students & Admissions', path: '/app/students', icon: GraduationCap, badge: 'API' },
    ],
  },
  {
    title: 'Operations & Facilities',
    items: [
      { label: 'Housekeeping Board', path: '/app/housekeeping', icon: Sparkles },
      { label: 'Maintenance Work Orders', path: '/app/maintenance', icon: Wrench },
      { label: 'Gate Security & Access', path: '/app/security', icon: ShieldCheck },
      { label: 'Cloakroom / Luggage', path: '/app/cloakroom', icon: Luggage },
    ],
  },
  {
    title: 'Food & Beverage / Events',
    items: [
      { label: 'Restaurant POS', path: '/app/pos', icon: UtensilsCrossed },
      { label: 'Kitchen Display (KOT)', path: '/app/kds', icon: Flame, badge: 'Realtime' },
      { label: 'Banquets & Events', path: '/app/events', icon: PartyPopper },
      { label: 'Spa & Wellness', path: '/app/spa', icon: Sparkles },
    ],
  },
  {
    title: 'Cashiering & Finance',
    items: [
      { label: 'Unified Folios', path: '/app/folios', icon: Receipt },
      { label: 'Billing & Cashiering', path: '/app/finance', icon: CreditCard },
      { label: 'Inventory & Procurement', path: '/app/inventory', icon: Boxes },
    ],
  },
  {
    title: 'Mobility & Distribution',
    items: [
      { label: 'Transport & Fleet', path: '/app/transport', icon: Truck },
      { label: 'Dynamic Pricing', path: '/app/pricing', icon: TrendingUp },
      { label: 'OTA Channel Manager', path: '/app/channels', icon: Globe2 },
    ],
  },
  {
    title: 'Governance & Analytics',
    items: [
      { label: 'Executive Dashboards', path: '/app/corporate', icon: PieChart },
      { label: 'Shareholder Portal', path: '/app/shareholder', icon: FileSpreadsheet, badge: 'Read-Only' },
      { label: 'Staff & HR Roster', path: '/app/hr', icon: Users },
      { label: 'Loyalty & CRM', path: '/app/loyalty', icon: Award },
      { label: 'Settings', path: '/app/settings', icon: Settings },
    ],
  },
]

export const Sidebar: React.FC<{ isCollapsed?: boolean }> = ({ isCollapsed = false }) => {
  const { user } = useAuth()

  // Shareholder role only sees Shareholder Portal
  const isShareholderOnly = user?.role === 'shareholder'

  return (
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
        {isShareholderOnly ? (
          <div>
            <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Investor Relations
            </div>
            <NavLink
              to="/app/shareholder"
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )
              }
            >
              <FileSpreadsheet className="h-4 w-4 shrink-0" />
              <span>Shareholder Portal</span>
            </NavLink>
          </div>
        ) : (
          NAVIGATION_SCHEMA.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {!isCollapsed && (
                <div className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
                  {section.title}
                </div>
              )}
              {section.items.map((item) => {
                // Kitchen user shortcut
                if (user?.role === 'chef_kitchen' && item.path !== '/app/kds') return null
                // Security user shortcut
                if (
                  user?.role === 'security_gate' &&
                  item.path !== '/app/security' &&
                  item.path !== '/app/cloakroom'
                )
                  return null

                const Icon = item.icon
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
  )
}
