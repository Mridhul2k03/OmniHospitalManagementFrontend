import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTenant } from '@/context/useTenant'
import { useAuth } from '@/auth/useAuth'
import { educationalApi } from '@/api/endpoints/educational.api'
import { AppNotificationItem, UserRole } from '@/types'
import {
  Building2,
  ChevronDown,
  Bell,
  Search,
  Wifi,
  WifiOff,
  LogOut,
  UserCheck,
  Menu,
  Check,
  CheckCheck,
  Crown,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSubscription, SUBSCRIPTION_PLANS } from '@/context/SubscriptionContext'

const ALL_TEST_ROLES: { role: UserRole; label: string }[] = [
  { role: 'super_admin', label: 'Super Admin / Institution Admin' },
  { role: 'president', label: 'President (Corporate)' },
  { role: 'ceo', label: 'CEO (Corporate)' },
  { role: 'property_manager', label: 'Property Manager / Faculty' },
  { role: 'front_desk', label: 'Front Desk / Admissions' },
  { role: 'housekeeping', label: 'Housekeeping Lead' },
  { role: 'chef_kitchen', label: 'Executive Chef (KOT)' },
  { role: 'restaurant_pos', label: 'F&B POS Captain' },
  { role: 'security_gate', label: 'Gate Security' },
  { role: 'transport', label: 'Fleet & Transport' },
  { role: 'shareholder', label: 'Shareholder (Read-Only)' },
  { role: 'guest', label: 'Student / Guest Portal' },
]

export const Topbar: React.FC<{ onToggleSidebar?: () => void }> = ({ onToggleSidebar }) => {
  const navigate = useNavigate()
  const { activeProperty, propertiesList, setActivePropertyById } = useTenant()
  const { user, activeTenant, accessibleTenants, switchTenant, switchRole, logout } = useAuth()
  const { currentPlan, upgradePlan } = useSubscription()
  
  const [showPropertyMenu, setShowPropertyMenu] = useState(false)
  const [showRoleMenu, setShowRoleMenu] = useState(false)
  const [showPlanMenu, setShowPlanMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [isWsConnected] = useState(true)

  // Live in-app notifications
  const [notifications, setNotifications] = useState<AppNotificationItem[]>([
    {
      id: 'notif-001',
      title: 'Welcome to OmniEducationalManagement',
      message: 'Active institutional tenant: Oxford Crest University. Session secured with HttpOnly cookies.',
      is_read: false,
      created_at: new Date().toISOString(),
    },
    {
      id: 'notif-002',
      title: 'Semester Registration Deadline',
      message: 'Course add/drop period is open until Friday, October 2nd.',
      is_read: false,
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
  ])

  useEffect(() => {
    let isMounted = true
    educationalApi
      .getNotifications()
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setNotifications(data)
        }
      })
      .catch(() => {
        // Fallback to local initial notifications
      })
    return () => {
      isMounted = false
    }
  }, [])

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
  }

  const handleMarkRead = async (id: string) => {
    try {
      await educationalApi.markNotificationRead(id)
    } catch {
      // client update
    }
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    )
  }

  const unreadCount = (notifications || []).filter((n) => !n?.is_read).length

  const handleLogout = async () => {
    await logout()
    navigate('/auth/login', { replace: true })
  }

  // Active institutional or property name
  const currentDisplayName = activeTenant?.name || activeProperty.name
  const currentDisplayCode = activeTenant?.slug || activeProperty.code

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full shrink-0 items-center justify-between border-b border-border bg-card/80 px-6 backdrop-blur-md">
      {/* Left Section: Sidebar Toggle & Tenant / Property Switcher */}
      <div className="flex items-center gap-4">
        {onToggleSidebar && (
          <Button variant="ghost" size="icon-sm" onClick={onToggleSidebar}>
            <Menu className="h-5 w-5 text-muted-foreground" />
          </Button>
        )}

        {/* Multi-Tenant Scope Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowPropertyMenu(!showPropertyMenu)}
            className="flex items-center gap-2.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <Building2 className="h-4 w-4 text-amber-600 dark:text-amber-500" />
            <div className="flex flex-col text-left">
              <span className="font-semibold text-xs leading-none">{currentDisplayName}</span>
              <span className="text-[10px] text-muted-foreground font-mono">
                {currentDisplayCode} &bull; X-Tenant-ID
              </span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground ml-1" />
          </button>

          {showPropertyMenu && (
            <div className="absolute left-0 mt-2 w-72 rounded-xl border border-border bg-card p-1.5 shadow-xl animate-in fade-in zoom-in-95 z-50">
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Switch Authorized Tenant / Property
              </div>

              {/* If accessible educational tenants exist */}
              {accessibleTenants && accessibleTenants.length > 0 && (
                <div className="border-b border-border/60 pb-1 mb-1">
                  {accessibleTenants.map((tenant) => (
                    <button
                      key={tenant.id}
                      onClick={() => {
                        switchTenant?.(tenant.id)
                        setShowPropertyMenu(false)
                      }}
                      className={`flex w-full items-start gap-2.5 rounded-lg p-2 text-left text-xs transition-colors ${
                        tenant.id === activeTenant?.id
                          ? 'bg-primary/10 text-primary font-semibold'
                          : 'hover:bg-muted text-foreground'
                      }`}
                    >
                      <Building2 className="h-4 w-4 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium leading-none">{tenant.name}</p>
                        <p className="mt-0.5 text-[10px] text-muted-foreground font-mono">
                          {tenant.slug} &bull; {tenant.institution_type || 'Institution'}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Operational Properties list */}
              {propertiesList.map((prop) => (
                <button
                  key={prop.id}
                  onClick={() => {
                    setActivePropertyById(prop.id)
                    setShowPropertyMenu(false)
                  }}
                  className={`flex w-full items-start gap-2.5 rounded-lg p-2 text-left text-xs transition-colors ${
                    prop.id === activeProperty.id
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'hover:bg-muted text-foreground'
                  }`}
                >
                  <Building2 className="h-4 w-4 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium leading-none">{prop.name}</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground font-mono">
                      {prop.code} &bull; {prop.totalRooms} Units
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Center: Global Search */}
      <div className="hidden md:flex items-center w-72 max-w-sm">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Quick search (ID, Student, Room, Folio)..."
            className="w-full rounded-lg border border-border bg-background/80 py-1.5 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Right Section: Realtime indicator, Role Simulator, Notifications, Logout */}
      <div className="flex items-center gap-3">
        {/* Real-time WS Status Pill */}
        <div
          className={`hidden sm:flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
            isWsConnected
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400'
          }`}
        >
          {isWsConnected ? <Wifi className="h-3 w-3 animate-pulse" /> : <WifiOff className="h-3 w-3" />}
          <span>{isWsConnected ? 'Connected' : 'Offline'}</span>
        </div>

        {/* Role Simulator Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 transition-colors cursor-pointer"
          >
            <UserCheck className="h-3.5 w-3.5" />
            <span className="capitalize">{user?.role?.replace(/_/g, ' ') || 'Admin'}</span>
            <ChevronDown className="h-3 w-3" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl border border-border bg-card p-1.5 shadow-xl animate-in fade-in zoom-in-95 z-50 max-h-96 overflow-y-auto">
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Simulate System Role
              </div>
              {ALL_TEST_ROLES.map(({ role, label }) => {
                const isActive = user?.role?.toLowerCase() === role.toLowerCase()
                return (
                  <button
                    key={role}
                    onClick={() => {
                      switchRole(role)
                      setShowRoleMenu(false)
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground font-semibold'
                        : 'hover:bg-muted text-foreground'
                    }`}
                  >
                    <span>{label}</span>
                    {isActive && <span className="text-[10px] uppercase font-bold">Active</span>}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Superadmin Console Quick Access Button */}
        {(user?.role?.toLowerCase() === 'super_admin' || user?.permissions?.includes('*')) && (
          <button
            type="button"
            onClick={() => navigate('/app/superadmin')}
            className="flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-gradient-to-r from-amber-500/15 to-amber-600/15 px-2.5 py-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-500/25 transition-all shadow-xs cursor-pointer"
            title="Open Platform Superadmin Control Center"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-amber-500" />
            <span className="hidden sm:inline">Admin Console</span>
          </button>
        )}

        {/* Subscription Plan Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowPlanMenu(!showPlanMenu)}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
              currentPlan === 'enterprise'
                ? 'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20'
                : currentPlan === 'professional'
                ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20'
                : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
            }`}
          >
            <Crown className="h-3.5 w-3.5" />
            <span className="uppercase tracking-wider">{currentPlan}</span>
            <ChevronDown className="h-3 w-3" />
          </button>

          {showPlanMenu && (
            <div className="absolute right-0 mt-2 w-60 rounded-xl border border-border bg-card p-1.5 shadow-xl animate-in fade-in zoom-in-95 z-50">
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Simulate Subscription Plan
              </div>
              {(['starter', 'professional', 'enterprise'] as const).map((tier) => {
                const plan = SUBSCRIPTION_PLANS[tier]
                return (
                  <button
                    key={tier}
                    onClick={() => {
                      upgradePlan(tier)
                      setShowPlanMenu(false)
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${
                      currentPlan === tier
                        ? 'bg-primary text-primary-foreground font-semibold'
                        : 'hover:bg-muted text-foreground'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{plan.name}</div>
                      <div
                        className={`text-[10px] ${
                          currentPlan === tier ? 'text-primary-foreground/80' : 'text-muted-foreground'
                        }`}
                      >
                        ${plan.monthlyPrice}/mo • {plan.maxProperties === 999 ? 'Unlimited' : plan.maxProperties} Prop
                      </div>
                    </div>
                    {currentPlan === tier && (
                      <span className="text-[10px] uppercase font-bold tracking-wider">Active</span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon-sm"
            className="relative cursor-pointer"
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
          >
            <Bell className="h-4 w-4 text-muted-foreground" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600"></span>
              </span>
            )}
          </Button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-border bg-card p-3 shadow-2xl animate-in fade-in zoom-in-95 z-50">
              <div className="flex items-center justify-between border-b border-border pb-2 mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-foreground">Campus & System Alerts</span>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-primary/10 px-1.5 py-0.2 text-[10px] font-bold text-primary">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck className="h-3 w-3" />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`rounded-lg p-2 text-xs transition-colors ${
                      notif.is_read ? 'bg-muted/30 text-muted-foreground' : 'bg-muted/70 text-foreground font-medium'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <p className="font-semibold text-xs leading-tight">{notif.title}</p>
                      {!notif.is_read && (
                        <button
                          onClick={() => handleMarkRead(notif.id)}
                          title="Mark read"
                          className="text-muted-foreground hover:text-primary cursor-pointer"
                        >
                          <Check className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                    <p className="mt-1 text-[11px] leading-snug opacity-90">{notif.message}</p>
                    <span className="mt-1 block text-[9px] text-muted-foreground font-mono">
                      {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <Button variant="ghost" size="icon-sm" onClick={handleLogout} title="Sign Out & Clear Auth Cookies">
          <LogOut className="h-4 w-4 text-muted-foreground hover:text-destructive transition-colors" />
        </Button>
      </div>
    </header>
  )
}

