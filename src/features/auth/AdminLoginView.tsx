import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'
import { UserRole } from '@/types'
import { Button } from '@/components/ui/button'
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  Building,
  KeyRound,
  ExternalLink,
  ArrowLeft,
  Terminal,
  Layers,
} from 'lucide-react'

// Permitted administrative and executive roles for this console
const ADMIN_ROLES: UserRole[] = [
  'super_admin',
  'org_admin',
  'property_manager',
  'operations_director',
  'ceo',
  'president',
  'vice_president',
]

export const AdminLoginView: React.FC = () => {
  const { login, isLoading, error: authContextError, clearError } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/ila-admin'

  const [email, setEmail] = useState('superadmin@omnihospitality.com')
  const [password, setPassword] = useState('Password123!')
  const [tenantSlug, setTenantSlug] = useState('ghhg')
  const [showPassword, setShowPassword] = useState(false)
  const [selectedRole, setSelectedRole] = useState<UserRole>('super_admin')
  const [localError, setLocalError] = useState<string | null>(null)

  const handleQuickFill = (
    demoEmail: string,
    demoPass: string,
    demoRole: UserRole,
    demoTenant = 'ghhg'
  ) => {
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

    // Verify role eligibility for Admin Console
    if (!ADMIN_ROLES.includes(selectedRole)) {
      setLocalError(
        'Access Denied: The Admin Console requires Super Admin, Org Admin, or Executive credentials. Please use the standard Staff & Guest Login.'
      )
      return
    }

    try {
      await login({
        email,
        password,
        tenantId: tenantSlug,
        role: selectedRole,
      })

      // Route based on role
      if (selectedRole === 'super_admin') {
        navigate('/ila-admin', { replace: true })
      } else if (selectedRole === 'operations_director' || selectedRole === 'ceo') {
        navigate('/app/executive', { replace: true })
      } else {
        navigate(from.includes('superadmin') || from.includes('ila-admin') ? '/app/frontdesk' : from, {
          replace: true,
        })
      }
    } catch (err: unknown) {
      const errObj = err as { message?: string }
      setLocalError(errObj?.message || 'Administrative authentication failed. Please verify credentials.')
    }
  }

  const activeError = localError || authContextError

  return (
    <div className="space-y-5">
      {/* Console Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-500 border border-amber-500/30">
            <Terminal className="h-3 w-3" />
            Restricted Admin Console
          </span>
          <span className="text-[10px] font-mono text-muted-foreground">HMOS SEC-GATE</span>
        </div>
        <h2 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
          System Administration
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          High-privilege console for Platform Owners, Super Administrators, and Enterprise Executives.
        </p>
      </div>

      {/* Security Perimeter Alert */}
      <div className="flex items-center gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-700 dark:text-amber-400">
        <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
        <div className="flex-1">
          <span className="font-bold">Administrative Perimeter</span> &bull; Full CRUD for Master Selections, DB Schemas & Tenants
        </div>
      </div>

      {/* Error Alert Box */}
      {activeError && (
        <div className="flex items-start gap-2.5 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Authorization Denied</p>
            <p className="mt-0.5 text-[11px] opacity-90">{activeError}</p>
          </div>
        </div>
      )}

      {/* Quick Fill Admin Accounts */}
      <div className="space-y-2 rounded-xl border border-amber-500/20 bg-muted/40 p-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
            <KeyRound className="h-3.5 w-3.5 text-amber-500" />
            Admin Quick-Fill Presets
          </span>
          <span className="text-[10px] text-amber-500/80 font-mono font-bold">L1 Access</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5 pt-0.5">
          <button
            type="button"
            onClick={() =>
              handleQuickFill('superadmin@omnihospitality.com', 'Password123!', 'super_admin')
            }
            className={`rounded-lg border p-2 text-left transition-all cursor-pointer ${
              selectedRole === 'super_admin'
                ? 'border-amber-500 bg-amber-500/10 shadow-sm'
                : 'border-border bg-background/80 hover:border-amber-500/50 hover:bg-muted/80'
            }`}
          >
            <p className="text-[11px] font-black leading-none text-foreground flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
              Super Admin
            </p>
            <p className="text-[9px] text-muted-foreground mt-1 truncate font-mono">Platform Owner</p>
          </button>

          <button
            type="button"
            onClick={() =>
              handleQuickFill('orgadmin@omnihospitality.com', 'Password123!', 'org_admin')
            }
            className={`rounded-lg border p-2 text-left transition-all cursor-pointer ${
              selectedRole === 'org_admin'
                ? 'border-amber-500 bg-amber-500/10 shadow-sm'
                : 'border-border bg-background/80 hover:border-amber-500/50 hover:bg-muted/80'
            }`}
          >
            <p className="text-[11px] font-black leading-none text-foreground flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
              Org Admin
            </p>
            <p className="text-[9px] text-muted-foreground mt-1 truncate font-mono">Tenant Lead</p>
          </button>

          <button
            type="button"
            onClick={() =>
              handleQuickFill('ops.director@omnihospitality.com', 'Password123!', 'operations_director')
            }
            className={`rounded-lg border p-2 text-left transition-all cursor-pointer ${
              selectedRole === 'operations_director'
                ? 'border-amber-500 bg-amber-500/10 shadow-sm'
                : 'border-border bg-background/80 hover:border-amber-500/50 hover:bg-muted/80'
            }`}
          >
            <p className="text-[11px] font-black leading-none text-foreground flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              Ops Director
            </p>
            <p className="text-[9px] text-muted-foreground mt-1 truncate font-mono">Corporate Exec</p>
          </button>
        </div>
      </div>

      {/* Admin Login Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Email Input */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            Administrator Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="superadmin@omnihospitality.com"
              className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Password Input */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            Security Key / Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••••••"
              className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-9 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500"
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

        {/* Tenant Code */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            Tenant Boundary (<code className="text-[10px] text-amber-500">X-Tenant-ID</code>)
          </label>
          <div className="relative">
            <Building className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={tenantSlug}
              onChange={(e) => setTenantSlug(e.target.value)}
              required
              placeholder="ghhg"
              className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* High-Privilege Role Selection */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            Administrative Role Clearance
          </label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as UserRole)}
            className="w-full rounded-lg border border-border bg-background p-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer font-medium"
          >
            <option value="super_admin">⚡ Super Admin / Platform Owner (Central Governance & All Master Options)</option>
            <option value="org_admin">🏢 Organization Admin (Enterprise Tenant Lead)</option>
            <option value="property_manager">🏨 Property General Manager (Asset Operations)</option>
            <option value="operations_director">🌐 Operations Director (Corporate Oversight)</option>
            <option value="ceo">👔 Chief Executive Officer (Executive Suite)</option>
          </select>
        </div>

        <Button
          type="submit"
          className="w-full mt-3 py-2 font-black bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-500/20 cursor-pointer"
          isLoading={isLoading}
        >
          Authorize & Enter Admin Console
        </Button>
      </form>

      {/* External Django Backend Admin Link */}
      <div className="rounded-lg border border-border/70 bg-muted/30 p-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-amber-500 shrink-0" />
          <span className="text-[11px] text-foreground font-medium">Django Backend Administration</span>
        </div>
        <a
          href="http://localhost:8000/admin/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-500 hover:underline"
        >
          Backend /admin/ <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {/* Switch to Regular Login */}
      <div className="text-center pt-2 border-t border-border/60">
        <Link
          to="/auth/login"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Regular Staff & Guest Login
        </Link>
      </div>
    </div>
  )
}
