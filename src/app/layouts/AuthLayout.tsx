import React from 'react'
import { Outlet } from 'react-router-dom'
import { Building2 } from 'lucide-react'

export const AuthLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-600 to-amber-800 text-white shadow-lg mb-3">
            <Building2 className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">OmniHospitality OS</h1>
          <p className="text-xs text-muted-foreground mt-1">Enterprise Hospitality Management System</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-xl">
          <Outlet />
        </div>

        <div className="text-center text-xs text-muted-foreground">
          Protected by Enterprise Multi-Tenant Access Boundaries
        </div>
      </div>
    </div>
  )
}
