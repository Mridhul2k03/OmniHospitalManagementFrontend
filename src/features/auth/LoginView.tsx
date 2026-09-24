import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'
import { UserRole } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ShieldCheck, ShieldAlert, Lock, Mail, Eye, EyeOff, AlertCircle, Building, Sparkles } from 'lucide-react'

export const LoginView: React.FC = () => {
  const { login, isLoading, error: authContextError, clearError } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  // From route redirect state if user was pushed here by RequireAuth
  const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/app/frontdesk'

  const [email, setEmail] = useState('superadmin@omnihospitality.com')
  const [password, setPassword] = useState('Password123!')
  const [tenantSlug, setTenantSlug] = useState('grand-horizon')
  const [showPassword, setShowPassword] = useState(false)
  const [selectedRole, setSelectedRole] = useState<UserRole>('super_admin')
  const [localError, setLocalError] = useState<string | null>(null)

  const handleDemoAccountSelect = (demoEmail: string, demoPass: string, demoRole: UserRole, demoTenant = 'grand-horizon') => {
    clearError?.()
    setLocalError(null)
    setEmail(demoEmail)
    setPassword(demoPass)
    setSelectedRole(demoRole)
    setTenantSlug(demoTenant)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError?.()
    setLocalError(null)

    try {
      await login({
        email,
        password,
        tenantId: tenantSlug,
        role: selectedRole,
      })

      // Route based on role or original destination
      if (selectedRole === 'shareholder') {
        navigate('/app/shareholder', { replace: true })
      } else if (selectedRole === 'chef_kitchen') {
        navigate('/app/kds', { replace: true })
      } else {
        navigate(from, { replace: true })
      }
    } catch (err: unknown) {
      const errObj = err as { message?: string }
      setLocalError(errObj?.message || 'Authentication failed. Please verify credentials.')
    }
  }

  const activeError = localError || authContextError

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">Sign in to Enterprise Console</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Authenticate using authorized institutional or operational credentials.
        </p>
      </div>

      {/* Cookie Auth Security Badge */}
      <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-[11px] text-emerald-700 dark:text-emerald-400">
        <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
        <span>HttpOnly Cookie Authentication Active &bull; Multi-Tenant Scoped</span>
      </div>

      {/* Admin Console Switcher Link Card */}
      <div className="rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent p-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
            <ShieldAlert className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-black text-foreground flex items-center gap-1.5">
              System Administrator?
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-500 font-bold uppercase">Restricted</span>
            </p>
            <p className="text-[11px] text-muted-foreground">Access the dedicated Admin Console & Master Options</p>
          </div>
        </div>
        <Link
          to="/auth/admin-login"
          className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-lg border border-amber-500/30 transition-all hover:scale-[1.02] cursor-pointer"
        >
          Admin Console &rarr;
        </Link>
      </div>

      {/* Error Alert Box */}
      {activeError && (
        <div className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Authentication Error</p>
            <p className="mt-0.5 text-[11px] opacity-90">{activeError}</p>
          </div>
        </div>
      )}

      {/* Quick Demo Credentials Picker */}
      <div className="space-y-1.5 rounded-xl border border-border/80 bg-muted/40 p-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            Quick Demo Accounts (API v1.0.0)
          </span>
          <span className="text-[10px] text-muted-foreground font-mono">1-Click Fill</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5 pt-1">
          <button
            type="button"
            onClick={() =>
              handleDemoAccountSelect('superadmin@omnihospitality.com', 'Password123!', 'super_admin')
            }
            className="rounded-lg border border-border bg-background/90 p-2 text-left hover:border-amber-500/50 hover:bg-muted/80 transition-all cursor-pointer"
          >
            <p className="text-[11px] font-bold leading-none text-foreground">Super Admin</p>
            <p className="text-[9px] text-muted-foreground mt-1 truncate font-mono">superadmin</p>
          </button>
          <button
            type="button"
            onClick={() =>
              handleDemoAccountSelect('manager.palace@omnihospitality.com', 'Password123!', 'property_manager')
            }
            className="rounded-lg border border-border bg-background/90 p-2 text-left hover:border-primary/50 hover:bg-muted/80 transition-all cursor-pointer"
          >
            <p className="text-[11px] font-bold leading-none text-foreground">Manager</p>
            <p className="text-[9px] text-muted-foreground mt-1 truncate font-mono">manager.palace</p>
          </button>
          <button
            type="button"
            onClick={() =>
              handleDemoAccountSelect('frontdesk.palace@omnihospitality.com', 'Password123!', 'front_desk')
            }
            className="rounded-lg border border-border bg-background/90 p-2 text-left hover:border-primary/50 hover:bg-muted/80 transition-all cursor-pointer"
          >
            <p className="text-[11px] font-bold leading-none text-foreground">Front Desk</p>
            <p className="text-[9px] text-muted-foreground mt-1 truncate font-mono">frontdesk.p</p>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Email Input */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            Corporate / Institutional Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="alexander@omnihospitality.com"
              className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Password Input with Show/Hide */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••••••"
              className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-9 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-2 text-muted-foreground hover:text-foreground p-0.5 cursor-pointer"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Institutional Tenant Identifier */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            Tenant Context (<code className="text-[10px] text-primary">X-Tenant-ID</code>)
          </label>
          <div className="relative">
            <Building className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={tenantSlug}
              onChange={(e) => setTenantSlug(e.target.value)}
              required
              placeholder="ghhg"
              className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Slug or UUID for data isolation (e.g. <code className="font-mono">ghhg</code>).
          </p>
        </div>

        {/* Role Simulation Selector */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            Access Role Context
          </label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as UserRole)}
            className="w-full rounded-lg border border-border bg-background p-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
          >
            <option value="org_admin">Hotel General Manager / Org Admin</option>
            <option value="property_manager">Property Manager (Operations & PMS)</option>
            <option value="front_desk">Front Desk Agent (Reception & Reservations)</option>
            <option value="accountant">Financial Accountant (Invoices & Folios)</option>
            <option value="hr">HR Director (Staff Rosters)</option>
            <option value="chef_kitchen">Executive Chef (Kitchen KDS)</option>
            <option value="restaurant_pos">Point of Sale (Dining & Outlets)</option>
            <option value="shareholder">Shareholder (Audited Portal)</option>
            <option value="guest">Guest Portal (Self-Service)</option>
            <option value="super_admin">ILA Platform SuperAdmin (Root Authority)</option>
          </select>
        </div>

        <Button type="submit" className="w-full mt-3 py-2 font-semibold shadow-md" isLoading={isLoading}>
          Authenticate & Enter Portal
        </Button>
      </form>

      <div className="text-center pt-3 border-t border-border/60 space-y-2">
        <p className="text-xs text-muted-foreground">
          ILA SaaS Platform Owner?{' '}
          <Link
            to="/ila-admin/login"
            className="font-bold text-purple-400 hover:text-purple-300 hover:underline transition-colors"
          >
            Access ILA Platform Console &rarr;
          </Link>
        </p>
        <p className="text-xs text-muted-foreground">
          New hospitality client or property?{' '}
          <Link
            to="/auth/register"
            className="font-bold text-amber-500 hover:text-amber-400 hover:underline transition-colors"
          >
            Register & Onboard your property
          </Link>
        </p>
      </div>
    </div>
  )
}
