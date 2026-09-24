import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'
import { Button } from '@/components/ui/button'
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  Building2,
  KeyRound,
  ArrowLeft,
  Sparkles,
  Server,
} from 'lucide-react'

export const ILALoginView: React.FC = () => {
  const { login, isLoading, error: authContextError, clearError } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/ila-admin'

  const [email, setEmail] = useState('superadmin@omnihospitality.com')
  const [password, setPassword] = useState('Password123!')
  const [showPassword, setShowPassword] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const handleQuickFill = () => {
    clearError?.()
    setLocalError(null)
    setEmail('superadmin@omnihospitality.com')
    setPassword('Password123!')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError?.()
    setLocalError(null)

    try {
      await login({
        email,
        password,
        role: 'super_admin',
        tenantId: 'ghhg',
      })

      navigate(from.includes('ila-admin') ? from : '/ila-admin', { replace: true })
    } catch (err: unknown) {
      const errObj = err as { message?: string }
      setLocalError(errObj?.message || 'ILA SuperAdmin authentication failed. Please verify root credentials.')
    }
  }

  const activeError = localError || authContextError

  return (
    <div className="space-y-6">
      {/* Platform Branding Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/15 text-purple-400 border border-purple-500/30">
            <Sparkles className="h-3 w-3 text-purple-400" />
            ILA SaaS Infrastructure
          </span>
          <span className="text-[10px] font-mono text-slate-400">ROOT-TIER-0</span>
        </div>
        <h2 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
          Platform Owner Console
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Exclusive management console for ILA SaaS company owners and infrastructure administrators.
        </p>
      </div>

      {/* Security Warning Box */}
      <div className="flex items-start gap-2.5 rounded-xl border border-purple-500/30 bg-purple-500/10 p-3 text-[11px] text-purple-300">
        <Server className="h-4 w-4 shrink-0 text-purple-400 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold text-foreground">SaaS Infrastructure Perimeter</p>
          <p className="text-muted-foreground">
            This portal controls all client hotel segments, tenant provisioning, and billing matrices. Hotel staff must log in via their respective Hotel Tenant Portal.
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {activeError && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 px-3.5 py-2.5 text-xs text-rose-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{activeError}</span>
        </div>
      )}

      {/* One-Click SuperAdmin Preset */}
      <div className="rounded-xl border border-border/60 bg-card/60 p-3 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-foreground">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-purple-400" />
            ILA SuperUser Preset
          </span>
          <button
            type="button"
            onClick={handleQuickFill}
            className="text-[11px] font-bold text-purple-400 hover:text-purple-300 hover:underline cursor-pointer"
          >
            Auto-Fill Credentials
          </button>
        </div>
        <div className="flex items-center justify-between text-[11px] text-muted-foreground bg-muted/50 rounded-lg px-2.5 py-1.5 font-mono">
          <span>superadmin@omnihospitality.com</span>
          <span className="text-purple-400 font-bold">is_superuser=True</span>
        </div>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground flex items-center justify-between">
            <span>ILA SuperAdmin Email</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => {
                clearError?.()
                setLocalError(null)
                setEmail(e.target.value)
              }}
              placeholder="superadmin@omnihospitality.com"
              className="w-full rounded-xl border border-border bg-card/60 pl-9 pr-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground flex items-center justify-between">
            <span>Master Password</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => {
                clearError?.()
                setLocalError(null)
                setPassword(e.target.value)
              }}
              placeholder="••••••••••••"
              className="w-full rounded-xl border border-border bg-card/60 pl-9 pr-10 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-600 hover:from-purple-500 hover:to-amber-500 text-white font-bold text-xs py-2.5 shadow-lg shadow-purple-600/25 transition-all cursor-pointer"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              <span>Authenticating Root Authority...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <KeyRound className="h-4 w-4" />
              <span>Enter ILA Platform Console</span>
            </div>
          )}
        </Button>
      </form>

      {/* Return to Hotel Portal */}
      <div className="pt-2 text-center border-t border-border/40">
        <Link
          to="/auth/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Return to Hotel Staff & Client Portal</span>
        </Link>
      </div>
    </div>
  )
}

export default ILALoginView
