import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../useAuth'
import { ShieldAlert, ArrowLeft } from 'lucide-react'

/**
 * ILA SaaS Platform SuperAdmin Route Guard (Recipe E from Blueprint)
 * Strictly guards the ILA Company Platform Owner Console.
 * Client hotel administrators (ORG_ADMIN, etc.) and staff are strictly restricted.
 */
export const AdminRoute: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/ila-admin/login" replace />
  }

  // Enforce ILA Platform SuperAdmin privilege
  const isSuperAdmin = Boolean(
    user.role === 'super_admin' ||
    user.permissions?.includes('*')
  )

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-slate-950 text-slate-100">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/30 mb-4">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">
          Access Restricted — ILA Platform SuperAdmin Only
        </h1>
        <p className="mt-2 text-sm text-slate-400 max-w-lg leading-relaxed">
          The ILA SaaS Platform Command Console is reserved exclusively for the ILA platform owner and company infrastructure superusers.
          Hotel clients and staff members can manage their operational segment via the Hotel Workspace.
        </p>
        <a
          href="/app/frontdesk"
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-purple-600/25 transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Hotel Workspace</span>
        </a>
      </div>
    )
  }

  return <Outlet />
}

export default AdminRoute
