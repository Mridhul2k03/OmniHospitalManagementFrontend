import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi, RegisterPayload } from '@/api/endpoints/auth.api'
import { useAuth } from '@/auth/useAuth'
import { ShieldCheck, Building2, User, Mail, Lock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react'

export const RegisterView: React.FC = () => {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [formData, setFormData] = useState<RegisterPayload>({
    organization_name: '',
    organization_code: '',
    first_name: '',
    last_name: '',
    email: '',
    username: '',
    password: '',
    role: 'ORG_ADMIN',
    subscription_tier: 'enterprise',
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    if (name === 'organization_name' && !formData.organization_code) {
      // Auto-generate code from name
      setFormData((prev) => ({
        ...prev,
        organization_name: value,
        organization_code: value.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)

    if (!formData.email || !formData.password || !formData.organization_name) {
      setError('Please provide all required fields including organization name, email, and password.')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    setIsLoading(true)

    try {
      const res = await authApi.register(formData)
      setSuccessMessage(res.message || 'Property organization registered successfully! Logging you in...')

      // Automatically authenticate the newly registered user
      try {
        await login({
          email: formData.email,
          password: formData.password,
          tenantId: formData.organization_code || res.active_tenant?.slug,
        })
        navigate('/app/frontdesk', { replace: true })
      } catch {
        // If auto-login fails, redirect to login page with credentials
        setTimeout(() => {
          navigate('/auth/login', { replace: true })
        }, 1500)
      }
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { error?: string } }; message?: string }
      setError(
        errObj?.response?.data?.error ||
          errObj?.message ||
          'Failed to register property organization. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-500 uppercase tracking-wide">
            Enterprise Onboarding
          </span>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-foreground mt-1.5">
          Register New Hospitality Organization
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Provision your property tenant, primary administrator account, and subscription tier.
        </p>
      </div>

      {/* Security Badge */}
      <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-[11px] text-emerald-700 dark:text-emerald-400">
        <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
        <span>Multi-Tenant Isolated Environment &bull; Enterprise Cryptographic Keys</span>
      </div>

      {/* Status Alerts */}
      {error && (
        <div className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive animate-in fade-in">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{error}</div>
        </div>
      )}

      {successMessage && (
        <div className="flex items-start gap-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-400 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{successMessage}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Organization / Property Info */}
        <div className="space-y-3 rounded-xl border border-border/70 bg-muted/20 p-3.5">
          <div className="flex items-center gap-2 text-xs font-bold text-foreground">
            <Building2 className="h-4 w-4 text-amber-500" />
            <span>Hospitality Organization Profile</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground">Organization / Property Name *</label>
              <input
                type="text"
                name="organization_name"
                required
                placeholder="e.g. Azure Skyline Resort"
                value={formData.organization_name}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-amber-500/50"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">Subdomain / Tenant Slug *</label>
              <input
                type="text"
                name="organization_code"
                required
                placeholder="azure-skyline"
                value={formData.organization_code}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-xs font-mono text-foreground focus:outline-hidden focus:ring-2 focus:ring-amber-500/50"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground">Subscription Tier *</label>
            <select
              name="subscription_tier"
              value={formData.subscription_tier}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground focus:outline-hidden cursor-pointer"
            >
              <option value="starter">Starter Plan ($99/mo &bull; Front Office & Basic PMS)</option>
              <option value="professional">Professional Plan ($299/mo &bull; POS, KDS, Housekeeping, Transport)</option>
              <option value="enterprise">Enterprise Plan ($699/mo &bull; Dynamic Pricing, OTA, Shareholder)</option>
            </select>
          </div>
        </div>

        {/* Administrator Account Details */}
        <div className="space-y-3 rounded-xl border border-border/70 bg-muted/20 p-3.5">
          <div className="flex items-center gap-2 text-xs font-bold text-foreground">
            <User className="h-4 w-4 text-amber-500" />
            <span>Primary Administrator Account</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground">First Name</label>
              <input
                type="text"
                name="first_name"
                placeholder="Marcus"
                value={formData.first_name}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground focus:outline-hidden"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground">Last Name</label>
              <input
                type="text"
                name="last_name"
                placeholder="Aurelius"
                value={formData.last_name}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground">Business Email *</label>
              <div className="relative mt-1">
                <Mail className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="admin@azureskyline.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-border bg-card pl-8 pr-3 py-2 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-amber-500/50"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">Admin Username</label>
              <input
                type="text"
                name="username"
                placeholder="Optional (defaults to email handle)"
                value={formData.username}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-xs font-mono text-foreground focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground">Admin Password *</label>
            <div className="relative mt-1">
              <Lock className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="password"
                name="password"
                required
                placeholder="Min 6 characters"
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-lg border border-border bg-card pl-8 pr-3 py-2 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-amber-500/50"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 py-2.5 text-xs font-bold text-white shadow-md shadow-amber-600/20 transition-all cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <span>Provisioning Organization...</span>
          ) : (
            <>
              <span>Provision & Onboard Organization</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <div className="text-center pt-2 border-t border-border/60 space-y-1.5">
        <p className="text-xs text-muted-foreground">
          Already have an existing property organization?{' '}
          <Link
            to="/auth/login"
            className="font-bold text-amber-500 hover:text-amber-400 hover:underline transition-colors"
          >
            Sign in here
          </Link>
        </p>
        <p className="text-xs text-muted-foreground">
          System Administrator?{' '}
          <Link
            to="/auth/admin-login"
            className="font-bold text-amber-500 hover:text-amber-400 hover:underline transition-colors"
          >
            Access Admin Console
          </Link>
        </p>
      </div>
    </div>
  )
}
export default RegisterView
