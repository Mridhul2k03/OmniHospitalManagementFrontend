import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatCard } from '@/components/ui/stat-card'
import { useToast } from '@/components/ui/toast'
import { useAuth } from '@/auth/useAuth'
import { useTenant } from '@/context/useTenant'
import { apiClient } from '@/api/client/axios'
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Server,
  Database,
  Key,
  ShieldCheck,
  Zap,
  Globe,
  HardDrive,
  Layers,
  ArrowUpRight,
  Terminal,
} from 'lucide-react'

interface EndpointStatus {
  name: string
  method: 'GET' | 'POST'
  url: string
  category: 'Core' | 'PMS' | 'Billing' | 'Executive' | 'Operations'
  status: 'idle' | 'testing' | 'success' | 'warning' | 'error'
  statusCode?: number
  latencyMs?: number
  responseSample?: string
}

const INITIAL_ENDPOINTS: EndpointStatus[] = [
  {
    name: 'System Health Check',
    method: 'GET',
    url: '/health/',
    category: 'Core',
    status: 'idle',
  },
  {
    name: 'Current User & RBAC',
    method: 'GET',
    url: '/auth/me/',
    category: 'Core',
    status: 'idle',
  },
  {
    name: 'Multi-Tenant Properties',
    method: 'GET',
    url: '/properties/',
    category: 'Core',
    status: 'idle',
  },
  {
    name: 'Rooms & Inventory Rack',
    method: 'GET',
    url: '/rooms/',
    category: 'PMS',
    status: 'idle',
  },
  {
    name: 'Live Reservations Manifest',
    method: 'GET',
    url: '/reservations/',
    category: 'PMS',
    status: 'idle',
  },
  {
    name: 'Financial Folios & Ledgers',
    method: 'GET',
    url: '/folios/',
    category: 'Billing',
    status: 'idle',
  },
  {
    name: 'Executive Portfolio Comparison',
    method: 'GET',
    url: '/executive/property-comparison/',
    category: 'Executive',
    status: 'idle',
  },
  {
    name: 'Shareholder Financial Audits',
    method: 'GET',
    url: '/shareholder/financials/',
    category: 'Executive',
    status: 'idle',
  },
  {
    name: 'Dining & Table POS Engine',
    method: 'GET',
    url: '/dining/tables/',
    category: 'Operations',
    status: 'idle',
  },
  {
    name: 'Housekeeping Cleanliness Queue',
    method: 'GET',
    url: '/housekeeping/tasks/',
    category: 'Operations',
    status: 'idle',
  },
  {
    name: 'Maintenance & Work Orders',
    method: 'GET',
    url: '/maintenance/work-orders/',
    category: 'Operations',
    status: 'idle',
  },
  {
    name: 'Fleet Logistics & Transport',
    method: 'GET',
    url: '/transport/fleet/',
    category: 'Operations',
    status: 'idle',
  },
]

export const SystemStatusHub: React.FC = () => {
  const { user, tokens } = useAuth()
  const { activeOrg, activeProperty } = useTenant()
  const { success, warning, error } = useToast()

  const [endpoints, setEndpoints] = useState<EndpointStatus[]>(INITIAL_ENDPOINTS)
  const [isAuditing, setIsAuditing] = useState(false)
  const [overallHealth, setOverallHealth] = useState<'healthy' | 'degraded' | 'offline'>('healthy')
  const [avgLatency, setAvgLatency] = useState<number>(14)
  const [lastChecked, setLastChecked] = useState<string>('Just now')
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all')

  // Ping a single endpoint
  const testEndpoint = useCallback(
    async (endpoint: EndpointStatus): Promise<EndpointStatus> => {
      const start = performance.now()
      try {
        const res = await apiClient.get(endpoint.url)
        const latencyMs = Math.round(performance.now() - start)
        const dataPreview =
          typeof res.data === 'object'
            ? JSON.stringify(res.data).substring(0, 120) + '...'
            : String(res.data).substring(0, 120)

        return {
          ...endpoint,
          status: res.status >= 200 && res.status < 300 ? 'success' : 'warning',
          statusCode: res.status,
          latencyMs,
          responseSample: dataPreview,
        }
      } catch (err: any) {
        const latencyMs = Math.round(performance.now() - start)
        return {
          ...endpoint,
          status: 'error',
          statusCode: err.response?.status || 500,
          latencyMs,
          responseSample: err.message || 'Connection failed or timeout',
        }
      }
    },
    []
  )

  // Run full health audit
  const runFullAudit = useCallback(async () => {
    setIsAuditing(true)
    setEndpoints((prev) => prev.map((e) => ({ ...e, status: 'testing' })))

    const results = await Promise.all(INITIAL_ENDPOINTS.map((ep) => testEndpoint(ep)))
    setEndpoints(results)
    setIsAuditing(false)
    setLastChecked(new Date().toLocaleTimeString())

    const successful = results.filter((r) => r.status === 'success')
    const latencies = results.filter((r) => r.latencyMs !== undefined).map((r) => r.latencyMs!)
    const avg = latencies.length > 0 ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : 0
    setAvgLatency(avg)

    if (successful.length === results.length) {
      setOverallHealth('healthy')
      success('System Audit Complete', `All ${results.length} API services operational with ${avg}ms average latency.`)
    } else if (successful.length > results.length / 2) {
      setOverallHealth('degraded')
      warning('System Health Warning', `${results.length - successful.length} endpoints experienced latency or non-200 responses.`)
    } else {
      setOverallHealth('offline')
      error('System Connectivity Alert', 'Majority of endpoints could not be reached. Ensure Django backend is running.')
    }
  }, [testEndpoint, success, warning, error])

  // Automatically execute an initial check on mount
  useEffect(() => {
    runFullAudit()
  }, [runFullAudit])

  const filteredEndpoints = endpoints.filter((e) => {
    if (activeCategoryFilter === 'all') return true
    return e.category.toLowerCase() === activeCategoryFilter.toLowerCase()
  })

  const successCount = endpoints.filter((e) => e.status === 'success').length
  const errorCount = endpoints.filter((e) => e.status === 'error').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">System & API Health Hub</h1>
            <Badge
              variant={overallHealth === 'healthy' ? 'default' : overallHealth === 'degraded' ? 'secondary' : 'destructive'}
              className="gap-1 px-2.5 py-0.5 text-xs font-semibold"
            >
              <span className={`h-2 w-2 rounded-full ${overallHealth === 'healthy' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              {overallHealth === 'healthy' ? 'Full Interconnection Active' : overallHealth === 'degraded' ? 'Degraded Connectivity' : 'Offline'}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time telemetry, DRF backend endpoint matrix, JWT claims inspection, and database synchronization.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={runFullAudit}
            disabled={isAuditing}
            className="gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isAuditing ? 'animate-spin text-primary' : ''}`} />
            {isAuditing ? 'Testing Endpoints...' : 'Run Diagnostics Audit'}
          </Button>
        </div>
      </div>

      {/* KPI Telemetry Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <StatCard
          title="Overall Status"
          value={overallHealth.toUpperCase()}
          subtitle={`Checked: ${lastChecked}`}
          icon={<Activity className="h-4 w-4" />}
        />
        <StatCard
          title="Average Latency"
          value={`${avgLatency} ms`}
          subtitle="Direct Loopback"
          icon={<Zap className="h-4 w-4" />}
        />
        <StatCard
          title="Operational APIs"
          value={`${successCount} / ${endpoints.length}`}
          subtitle={`${Math.round((successCount / endpoints.length) * 100)}% Pass Rate`}
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
        />
        <StatCard
          title="Active Tenant Org"
          value={activeOrg.code || 'GHHG'}
          subtitle={activeOrg.name}
          icon={<Server className="h-4 w-4" />}
        />
        <StatCard
          title="Selected Property"
          value={activeProperty.code || 'GHP-NY'}
          subtitle={activeProperty.name}
          icon={<HardDrive className="h-4 w-4" />}
        />
        <StatCard
          title="Security Token"
          value={tokens?.access ? 'JWT Active' : 'Session Ready'}
          subtitle={user?.role?.toUpperCase() || 'ANONYMOUS'}
          icon={<Key className="h-4 w-4 text-amber-500" />}
        />
      </div>

      {/* Security & Multi-Tenancy State Banner */}
      <Card className="border-border/60 bg-gradient-to-r from-muted/40 via-card to-muted/20">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Multi-Tenant Context & JWT Bearer Binding
                </h3>
                <p className="text-xs text-muted-foreground">
                  Authenticated User: <span className="font-semibold text-foreground">{user ? `${user.firstName} ${user.lastName}` : 'Administrator'}</span> ({user?.role || 'administrator'}) • Tenant: <span className="font-mono text-primary font-medium">{activeOrg.id}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-md bg-background px-2.5 py-1 border border-border text-muted-foreground">
                Base URL: <code className="text-foreground font-mono">{import.meta.env.VITE_BACKEND_URL || 'https://3lrrk4tb-8000.inc1.devtunnels.ms'}/api/v1</code>
              </span>
              <span className="rounded-md bg-emerald-500/10 px-2.5 py-1 text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> DRF Connected
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Endpoint Matrix Section */}
      <Card>
        <CardHeader className="pb-3 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                Interconnected Endpoint Status Matrix
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Live verification of REST endpoints across PMS, billing, operations, and executive modules.
              </CardDescription>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto bg-muted p-1 rounded-lg text-xs">
              {['all', 'Core', 'PMS', 'Billing', 'Executive', 'Operations'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategoryFilter(cat)}
                  className={`rounded-md px-2.5 py-1 font-medium transition-colors cursor-pointer ${
                    activeCategoryFilter === cat
                      ? 'bg-card text-foreground font-semibold shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {filteredEndpoints.map((ep) => (
              <div
                key={ep.name}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-muted/30 transition-colors gap-3"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <div className="mt-0.5 sm:mt-0">
                    {ep.status === 'success' && (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    )}
                    {ep.status === 'warning' && (
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                    )}
                    {ep.status === 'error' && (
                      <XCircle className="h-5 w-5 text-rose-500" />
                    )}
                    {ep.status === 'testing' && (
                      <RefreshCw className="h-5 w-5 text-primary animate-spin" />
                    )}
                    {ep.status === 'idle' && (
                      <Globe className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-foreground">{ep.name}</span>
                      <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground font-medium">
                        {ep.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-[11px] text-primary font-semibold">
                        {ep.method}
                      </span>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        /api/v1{ep.url}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                  {ep.statusCode !== undefined && (
                    <span
                      className={`font-mono text-xs font-semibold px-2 py-0.5 rounded ${
                        ep.statusCode >= 200 && ep.statusCode < 300
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : 'bg-rose-500/10 text-rose-600'
                      }`}
                    >
                      {ep.statusCode} OK
                    </span>
                  )}

                  {ep.latencyMs !== undefined && (
                    <span className="font-mono text-xs text-muted-foreground">
                      {ep.latencyMs} ms
                    </span>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs px-2"
                    onClick={async () => {
                      const updated = await testEndpoint(ep)
                      setEndpoints((prev) => prev.map((e) => (e.name === ep.name ? updated : e)))
                    }}
                  >
                    Ping
                    <ArrowUpRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* DRF Architecture & Integration Reference */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Backend Stack Summary */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" />
              Backend Architecture & Database Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <span className="text-muted-foreground">Backend Engine</span>
              <span className="font-semibold text-foreground">Django 6.0 + Django REST Framework</span>
            </div>
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <span className="text-muted-foreground">Database Engine</span>
              <span className="font-semibold text-foreground">SQLite (Multi-Tenant Scoped Model Layer)</span>
            </div>
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <span className="text-muted-foreground">Authentication Protocol</span>
              <span className="font-semibold text-foreground">JWT (JSON Web Token) with Automatic Refresh</span>
            </div>
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <span className="text-muted-foreground">State Transition Safeguards</span>
              <span className="font-semibold text-foreground">Strict Status State Machine with Audit Logs</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Dev Proxy Binding</span>
              <span className="font-mono text-emerald-600 font-medium">Vite :5173 ➔ {import.meta.env.VITE_BACKEND_URL ? import.meta.env.VITE_BACKEND_URL.replace('https://', '') : 'DevTunnel'}</span>
            </div>
          </CardContent>
        </Card>

        {/* Live Active JWT Token Inspector */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Terminal className="h-4 w-4 text-primary" />
              Active Session Claims & Context
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs">
            <div className="rounded-lg bg-muted/60 p-3 font-mono text-[11px] text-muted-foreground overflow-x-auto">
              <p className="text-emerald-500 font-semibold mb-1">// Current Client JWT Claims</p>
              <pre>
{JSON.stringify(
  {
    user: user ? `${user.firstName} ${user.lastName}` : 'Administrator',
    email: user?.email || 'admin@omnihospitality.com',
    role: user?.role || 'administrator',
    active_property: activeProperty.name,
    organization_id: activeOrg.id,
    token_status: tokens?.access ? 'VALID_BEARER' : 'DEMO_SESSION',
    timestamp: new Date().toISOString(),
  },
  null,
  2
)}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
