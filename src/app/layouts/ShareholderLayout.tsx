import React from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'
import { Building2, ShieldCheck, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const ShareholderLayout: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-950 text-slate-100">
      {/* Dedicated Executive Shareholder Navigation Bar */}
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-900/90 px-8 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 shadow-md">
            <Building2 className="h-5 w-5 font-bold" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-slate-100">Grand Horizon Group</h1>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-amber-400">
                Shareholder Relations Portal
              </span>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.2 text-[9px] font-bold text-emerald-400 border border-emerald-500/30">
                Verified Stakeholder
              </span>
            </div>
          </div>
        </div>

        {/* Security & Access Banner */}
        <div className="hidden md:flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/80 px-3 py-1 text-xs text-slate-300">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>Strict Read-Only Governance Portal</span>
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs font-semibold text-slate-200">{user?.firstName} {user?.lastName}</p>
            <p className="text-[10px] text-slate-400 font-mono">Folio: SH-9042-ALPHA</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              logout()
              navigate('/auth/login')
            }}
            className="text-slate-400 hover:text-rose-400 hover:bg-slate-800"
          >
            <LogOut className="h-4 w-4 mr-1.5" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-8 max-w-7xl w-full mx-auto">
        <Outlet />
      </main>

      {/* Corporate Investor Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/50 py-6 px-8 text-center text-xs text-slate-500">
        <p>© 2026 Grand Horizon Hospitality Group PLC. Confidential & Privileged Investor Communication.</p>
        <p className="mt-1 text-[11px]">All reported quarterly dividends and P&L statements are certified by External Audit.</p>
      </footer>
    </div>
  )
}
