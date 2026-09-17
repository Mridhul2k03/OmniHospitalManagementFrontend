import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/navigation/Sidebar'
import { Topbar } from '@/components/navigation/Topbar'
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs'

export const AppShell: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
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
  )
}
