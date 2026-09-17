import React, { useState } from 'react'
import { useTenant } from '@/context/useTenant'
import { useAuth } from '@/auth/useAuth'
import { UserRole } from '@/types'
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
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const ALL_TEST_ROLES: { role: UserRole; label: string }[] = [
  { role: 'super_admin', label: 'Super Admin' },
  { role: 'president', label: 'President (Corporate)' },
  { role: 'ceo', label: 'CEO (Corporate)' },
  { role: 'property_manager', label: 'Property Manager' },
  { role: 'front_desk', label: 'Front Desk Agent' },
  { role: 'housekeeping', label: 'Housekeeping Lead' },
  { role: 'chef_kitchen', label: 'Executive Chef (KOT)' },
  { role: 'restaurant_pos', label: 'F&B POS Captain' },
  { role: 'security_gate', label: 'Gate Security' },
  { role: 'transport', label: 'Fleet & Transport' },
  { role: 'shareholder', label: 'Shareholder (Read-Only)' },
]

export const Topbar: React.FC<{ onToggleSidebar?: () => void }> = ({ onToggleSidebar }) => {
  const { activeProperty, propertiesList, setActivePropertyById } = useTenant()
  const { user, switchRole, logout } = useAuth()
  const [showPropertyMenu, setShowPropertyMenu] = useState(false)
  const [showRoleMenu, setShowRoleMenu] = useState(false)
  const [isWsConnected] = useState(true) // Live simulated indicator

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full shrink-0 items-center justify-between border-b border-border bg-card/80 px-6 backdrop-blur-md">
      {/* Left Section: Sidebar Toggle & Property Switcher */}
      <div className="flex items-center gap-4">
        {onToggleSidebar && (
          <Button variant="ghost" size="icon-sm" onClick={onToggleSidebar}>
            <Menu className="h-5 w-5 text-muted-foreground" />
          </Button>
        )}

        {/* Property Selector Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowPropertyMenu(!showPropertyMenu)}
            className="flex items-center gap-2.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <Building2 className="h-4 w-4 text-amber-600 dark:text-amber-500" />
            <div className="flex flex-col text-left">
              <span className="font-semibold text-xs leading-none">{activeProperty.name}</span>
              <span className="text-[10px] text-muted-foreground font-mono">{activeProperty.code} • {activeProperty.city}</span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground ml-1" />
          </button>

          {showPropertyMenu && (
            <div className="absolute left-0 mt-2 w-72 rounded-xl border border-border bg-card p-1.5 shadow-xl animate-in fade-in zoom-in-95 z-50">
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Switch Authorized Property
              </div>
              {propertiesList.map((prop) => (
                <button
                  key={prop.id}
                  onClick={() => {
                    setActivePropertyById(prop.id)
                    setShowPropertyMenu(false)
                  }}
                  className={`flex w-full items-start gap-2.5 rounded-lg p-2 text-left text-xs transition-colors ${
                    prop.id === activeProperty.id ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-muted text-foreground'
                  }`}
                >
                  <Building2 className="h-4 w-4 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium leading-none">{prop.name}</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground font-mono">
                      {prop.code} • {prop.totalRooms} Rooms
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Center / Quick Global Search */}
      <div className="hidden md:flex items-center w-72 max-w-sm">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Quick search (Room #, Guest, Folio, Reservation)..."
            className="w-full rounded-lg border border-border bg-background/80 py-1.5 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Right Section: Status, Role Switcher, Notifications, Logout */}
      <div className="flex items-center gap-3">
        {/* Real-time WS Status Pill */}
        <div className={`hidden sm:flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
          isWsConnected
            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
            : 'border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400'
        }`}>
          {isWsConnected ? <Wifi className="h-3 w-3 animate-pulse" /> : <WifiOff className="h-3 w-3" />}
          <span>{isWsConnected ? 'Realtime Live' : 'Offline'}</span>
        </div>

        {/* Quick Role Tester Selector for Pair Programming & Exploration */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 transition-colors"
          >
            <UserCheck className="h-3.5 w-3.5" />
            <span className="capitalize">{user?.role.replace(/_/g, ' ')}</span>
            <ChevronDown className="h-3 w-3" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl border border-border bg-card p-1.5 shadow-xl animate-in fade-in zoom-in-95 z-50 max-h-96 overflow-y-auto">
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Simulate System Role
              </div>
              {ALL_TEST_ROLES.map(({ role, label }) => (
                <button
                  key={role}
                  onClick={() => {
                    switchRole(role)
                    setShowRoleMenu(false)
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors ${
                    user?.role === role ? 'bg-primary text-primary-foreground font-semibold' : 'hover:bg-muted text-foreground'
                  }`}
                >
                  <span>{label}</span>
                  {user?.role === role && <span className="text-[10px] uppercase font-bold">Active</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Icon */}
        <Button variant="ghost" size="icon-sm" className="relative">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-amber-600 animate-pulse" />
        </Button>

        {/* Logout */}
        <Button variant="ghost" size="icon-sm" onClick={logout} title="Sign out">
          <LogOut className="h-4 w-4 text-muted-foreground hover:text-destructive" />
        </Button>
      </div>
    </header>
  )
}
