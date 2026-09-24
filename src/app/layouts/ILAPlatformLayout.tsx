import React, { useState, useEffect } from 'react'
import { Outlet, useNavigate, Link } from 'react-router-dom'
import {
  ShieldCheck,
  Building2,
  ExternalLink,
  LogOut,
  Zap,
  Activity,
  Layers,
  Sparkles,
  Server,
} from 'lucide-react'
import { useAuth } from '@/auth/useAuth'
import { superAdminApi } from '@/api/endpoints/superadmin.api'
import { ClientOrganization } from '@/types'

export const ILAPlatformLayout: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [clients, setClients] = useState<ClientOrganization[]>([])
  const [selectedClientToInspect, setSelectedClientToInspect] = useState<string>('')

  useEffect(() => {
    superAdminApi.getClients().then((data) => {
      setClients(data.filter((c) => c.is_active))
    }).catch(() => {
      // non-blocking fallback
    })
  }, [])

  const handleInspectTenant = (tenantId: string) => {
    if (!tenantId) return
    const target = clients.find((c) => c.id === tenantId)
    if (target) {
      localStorage.setItem('omni_active_tenant_id', target.id)
      localStorage.setItem('omni_active_tenant_slug', target.code)
      localStorage.setItem('hms_active_org_id', target.id)
      navigate('/app/frontdesk')
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/ila-admin/login')
  }

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col selection:bg-purple-500/30">
      {/* Top Platform Command Header */}
      <header className="sticky top-0 z-50 border-b border-purple-500/20 bg-slate-950/80 backdrop-blur-xl px-4 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* ILA Brand & Context */}
        <div className="flex items-center gap-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-amber-500 text-white shadow-lg shadow-purple-600/30 ring-1 ring-white/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg tracking-tight bg-gradient-to-r from-purple-300 via-indigo-200 to-amber-300 bg-clip-text text-transparent">
                ILA SaaS
              </span>
              <span className="rounded-md bg-purple-500/15 border border-purple-500/30 px-2 py-0.5 text-[10px] font-bold text-purple-300 uppercase tracking-widest">
                Platform SuperAdmin
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Central Command Console • Software Segment & Tenant Infrastructure
            </p>
          </div>
        </div>

        {/* Action Controls & Fast Tenant Switcher */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* System Status Pill */}
          <div className="hidden md:flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>All Segments Operational</span>
          </div>

          {/* Quick Tenant Workspace Access / Impersonation Dropdown */}
          <div className="hidden lg:flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1 text-xs">
            <Building2 className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-[11px] text-slate-400">Inspect Segment:</span>
            <select
              value={selectedClientToInspect}
              onChange={(e) => {
                setSelectedClientToInspect(e.target.value)
                handleInspectTenant(e.target.value)
              }}
              className="bg-transparent text-slate-200 font-medium text-xs focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-slate-900 text-slate-400">Select Client Hotel...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-slate-200">
                  {c.name} ({c.code.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {/* Direct Link to Default Hotel Workspace */}
          <Link
            to="/app/frontdesk"
            className="flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 px-3 py-1.5 text-xs font-bold transition-all shadow-xs"
            title="Inspect Current Hotel Segment Workspace"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Hotel Segment</span>
          </Link>

          {/* User Profile Pill */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20 text-purple-300 font-black text-xs border border-purple-500/40">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="hidden xl:block text-left">
              <div className="text-xs font-bold text-slate-200">
                {user?.firstName || 'ILA Owner'}
              </div>
              <div className="text-[10px] text-purple-400 font-mono">
                Company SuperUser
              </div>
            </div>
          </div>

          {/* Sign Out */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 px-2.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer"
            title="Sign out of ILA Console"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 lg:p-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 px-6 py-4 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Server className="h-3.5 w-3.5 text-purple-400" />
          <span>ILA Multi-Tenant SaaS Engine • Version 2.4.0-Enterprise</span>
        </div>
        <div>
          <span>Row-Level Logical Isolation • Zero-Trust Tenant Context</span>
        </div>
      </footer>
    </div>
  )
}

export default ILAPlatformLayout
