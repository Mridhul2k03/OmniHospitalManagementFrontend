import React from 'react'
import { Outlet, Link } from 'react-router-dom'
import { Flame, ArrowLeft, Wifi } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const KDSLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-950 text-slate-100 antialiased">
      {/* High-Contrast Kitchen Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-900 px-6">
        <div className="flex items-center gap-3">
          <Link to="/app/frontdesk">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Exit KDS
            </Button>
          </Link>
          <div className="h-4 w-px bg-slate-800" />
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-600 text-white shadow-sm">
              <Flame className="h-4 w-4" />
            </div>
            <span className="font-bold tracking-tight text-white">Kitchen Display System (KDS)</span>
            <span className="rounded-md bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-400 border border-rose-500/30">
              Live Line
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs text-emerald-400">
            <Wifi className="h-3.5 w-3.5 animate-pulse" />
            <span>KOT Stream Connected</span>
          </div>
          <div className="text-xs font-mono text-slate-400">
            {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
        </div>
      </header>

      {/* Fullscreen Workspace */}
      <main className="flex-1 p-6 overflow-x-auto">
        <Outlet />
      </main>
    </div>
  )
}
