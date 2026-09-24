import React, { useState } from 'react'
import { Outlet, Link } from 'react-router-dom'
import { Sidebar } from '@/components/navigation/Sidebar'
import { Topbar } from '@/components/navigation/Topbar'
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs'
import { useAuth } from '@/auth/useAuth'
import { ShieldCheck, Sparkles, ArrowRight } from 'lucide-react'

export const AppShell: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const { user } = useAuth()

  const isSuperAdmin = Boolean(
    user?.role === 'super_admin' ||
    user?.permissions?.includes('*')
  )

  const activeTenantSlug = localStorage.getItem('omni_active_tenant_slug') || user?.organizationName || 'Hotel Tenant'

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground flex-col">
      {/* ILA SaaS SuperAdmin Active Workspace Inspection Banner */}
      {isSuperAdmin && (
        <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-slate-950 border-b border-purple-500/30 px-4 py-2 flex items-center justify-between text-xs z-50 shrink-0">
          <div className="flex items-center gap-2 text-purple-300 font-semibold">
            <Sparkles className="h-3.5 w-3.5 text-purple-400" />
            <span>
              ILA Platform SuperAdmin • Inspecting Tenant Segment: <strong className="text-white uppercase font-mono">{activeTenantSlug}</strong>
            </span>
          </div>
          <Link
            to="/ila-admin"
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-lg text-xs shadow-xs transition-all"
          >
            <span>Return to ILA Platform Console</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      <div className="flex flex-1 w-full min-h-0">
        {/* Responsive Left Navigation */}
        <Sidebar isCollapsed={isSidebarCollapsed} />

        {/* Main Workspace Layout */}
        <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
          <Topbar onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
          <Breadcrumbs />
          <main className="flex-1 overflow-y-auto p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
