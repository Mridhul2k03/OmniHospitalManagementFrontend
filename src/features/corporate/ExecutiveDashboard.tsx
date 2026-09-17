import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { StatCard } from '@/components/ui/stat-card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/auth/useAuth'
import { useToast } from '@/components/ui/toast'
import {
  TrendingUp,
  DollarSign,
  PieChart,
  Building2,
  Download,
} from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts'

const OCCUPANCY_TREND_DATA = [
  { month: 'Apr', palace: 82, azure: 78, alpine: 65 },
  { month: 'May', palace: 86, azure: 84, alpine: 58 },
  { month: 'Jun', palace: 91, azure: 95, alpine: 72 },
  { month: 'Jul', palace: 94, azure: 98, alpine: 80 },
  { month: 'Aug', palace: 92, azure: 96, alpine: 84 },
  { month: 'Sep', palace: 89, azure: 88, alpine: 79 },
]

const PROPERTY_PERFORMANCE_METRICS = [
  { id: 'p-1', name: 'Grand Horizon Palace & Spa (NY)', rooms: 120, occupancy: '92.4%', adr: '$345', revpar: '$318.78', revenue: '$1,248,000', margin: '38.2%' },
  { id: 'p-2', name: 'Azure Bay Ocean Resort (MIA)', rooms: 180, occupancy: '96.1%', adr: '$290', revpar: '$278.69', revenue: '$1,520,000', margin: '41.5%' },
  { id: 'p-3', name: 'Alpine Crest Chalets (ASP)', rooms: 45, occupancy: '84.0%', adr: '$520', revpar: '$436.80', revenue: '$612,000', margin: '44.8%' },
]

export const ExecutiveDashboard: React.FC = () => {
  const { user } = useAuth()
  const { success } = useToast()
  const [executivePerspective, setExecutivePerspective] = useState<'President' | 'CEO' | 'VP' | 'Ops'>('President')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Corporate Executive Governance</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Consolidated enterprise intelligence across all properties • Logged as <span className="font-semibold text-foreground capitalize">{user?.role.replace(/_/g, ' ')}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Executive Role Switcher tabs */}
          <div className="flex rounded-lg border border-border bg-card p-1 text-xs">
            {(['President', 'CEO', 'VP', 'Ops'] as const).map((roleView) => (
              <button
                key={roleView}
                onClick={() => setExecutivePerspective(roleView)}
                className={`rounded-md px-3 py-1 font-semibold transition-colors cursor-pointer ${
                  executivePerspective === roleView ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {roleView} View
              </button>
            ))}
          </div>

          <Button variant="outline" size="sm" onClick={() => success('Executive Board Pack PDF generated')}>
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Export Board Pack
          </Button>
        </div>
      </div>

      {/* Strategic KPI Stat Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Consolidated Group Revenue"
          value="$3,380,000"
          subtitle="Q3 FY26 (Month-to-Date)"
          trend={{ value: 14.8, label: 'YoY' }}
          icon={<DollarSign className="h-4 w-4" />}
        />
        <StatCard
          title="Group Blended Occupancy"
          value="91.5%"
          subtitle="345 Total Keys"
          trend={{ value: 4.2, label: 'vs benchmark' }}
          icon={<TrendingUp className="h-4 w-4 text-emerald-600" />}
        />
        <StatCard
          title="Group Blended RevPAR"
          value="$314.50"
          subtitle="Average Daily Rate: $343.70"
          trend={{ value: 9.6, label: 'YoY' }}
          icon={<PieChart className="h-4 w-4 text-purple-600" />}
        />
        <StatCard
          title="Consolidated EBITDA Margin"
          value="41.2%"
          subtitle="Net Operating Income: $1.39M"
          icon={<Building2 className="h-4 w-4 text-amber-600" />}
        />
      </div>

      {/* Recharts Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Occupancy Velocity Trend Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Occupancy Trends by Property (Last 6 Months)</span>
              <Badge variant="outline">Trailing H1</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={OCCUPANCY_TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="palaceGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d97706" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="azureGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} domain={[50, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(20, 20, 25, 0.95)',
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Area type="monotone" dataKey="palace" name="Grand Horizon Palace" stroke="#d97706" fill="url(#palaceGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="azure" name="Azure Bay Resort" stroke="#0284c7" fill="url(#azureGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Contribution Comparison */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Gross Revenue Mix by Property ($ USD)</span>
              <Badge variant="outline">Q3 Actuals</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: 'Palace NY', Rooms: 920000, FnB: 220000, Spa: 108000 },
                    { name: 'Azure Bay', Rooms: 1100000, FnB: 310000, Spa: 110000 },
                    { name: 'Alpine Crest', Rooms: 450000, FnB: 120000, Spa: 42000 },
                  ]}
                  margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(20, 20, 25, 0.95)',
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="Rooms" fill="#059669" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="FnB" fill="#d97706" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Spa" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Property Performance Matrix Table */}
      <Card>
        <CardHeader className="pb-3 border-b border-border">
          <CardTitle className="text-base">Portfolio Property Comparison Matrix</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property Name</TableHead>
                <TableHead>Total Keys</TableHead>
                <TableHead>Occupancy</TableHead>
                <TableHead>ADR</TableHead>
                <TableHead>RevPAR</TableHead>
                <TableHead>Gross Revenue</TableHead>
                <TableHead>EBITDA Margin</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {PROPERTY_PERFORMANCE_METRICS.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-bold text-xs text-foreground">{p.name}</TableCell>
                  <TableCell className="font-mono text-xs">{p.rooms} Keys</TableCell>
                  <TableCell className="font-mono font-bold text-xs text-emerald-600">{p.occupancy}</TableCell>
                  <TableCell className="font-mono text-xs">{p.adr}</TableCell>
                  <TableCell className="font-mono font-bold text-xs text-primary">{p.revpar}</TableCell>
                  <TableCell className="font-mono font-bold text-xs text-foreground">{p.revenue}</TableCell>
                  <TableCell>
                    <Badge variant="success">{p.margin}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
