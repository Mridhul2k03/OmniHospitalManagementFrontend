import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { useToast } from '@/components/ui/toast'
import { Sliders } from 'lucide-react'

interface RateRule {
  id: string
  roomTypeName: string
  baseRate: number
  calculatedRate: number
  demandBand: 'low' | 'normal' | 'high' | 'surge'
  occupancyPace: string
  isManualOverride: boolean
  manualOverrideRate?: number
}

const INITIAL_RULES: RateRule[] = [
  { id: 'rr-1', roomTypeName: 'Penthouse Royal Suite', baseRate: 1400, calculatedRate: 1750, demandBand: 'surge', occupancyPace: '94% Booked (High Velocity)', isManualOverride: false },
  { id: 'rr-2', roomTypeName: 'Executive Oceanfront King', baseRate: 380, calculatedRate: 460, demandBand: 'high', occupancyPace: '82% Booked', isManualOverride: false },
  { id: 'rr-3', roomTypeName: 'Premier Jacuzzi Suite', baseRate: 520, calculatedRate: 520, demandBand: 'normal', occupancyPace: '65% Booked', isManualOverride: false },
  { id: 'rr-4', roomTypeName: 'Garden Deluxe King', baseRate: 240, calculatedRate: 215, demandBand: 'low', occupancyPace: '38% Booked (Promotional Pace)', isManualOverride: false },
]

export const DynamicPricingHub: React.FC = () => {
  const { success } = useToast()
  const [rules, setRules] = useState<RateRule[]>(INITIAL_RULES)
  const [selectedRule, setSelectedRule] = useState<RateRule | null>(null)
  const [overrideInput, setOverrideInput] = useState('')
  const [isOverrideOpen, setIsOverrideOpen] = useState(false)

  const handleConfirmOverride = (reason?: string) => {
    if (!selectedRule || !overrideInput) return
    const customRate = parseFloat(overrideInput)
    setRules((prev) =>
      prev.map((r) =>
        r.id === selectedRule.id
          ? { ...r, isManualOverride: true, manualOverrideRate: customRate }
          : r
      )
    )
    success(
      'Manual Rate Override Enforced',
      `${selectedRule.roomTypeName} rate locked at $${customRate}/night. Reason: "${reason || 'Revenue manager strategy'}"`
    )
    setIsOverrideOpen(false)
    setSelectedRule(null)
    setOverrideInput('')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Dynamic Pricing & Revenue Engine</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time demand surges, occupancy thresholds, and authorized manual rate overrides
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b border-border">
          <CardTitle className="text-base flex items-center justify-between">
            <span>Room Type Rate Plan Calculations</span>
            <span className="text-xs font-normal text-muted-foreground">Pace Evaluator: Every 15 minutes</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Room Type Category</TableHead>
                <TableHead>Occupancy Velocity & Pace</TableHead>
                <TableHead>Demand Band</TableHead>
                <TableHead>Base Rate</TableHead>
                <TableHead>Algorithm Rate</TableHead>
                <TableHead>Live Published Rate</TableHead>
                <TableHead className="text-right">Overrides</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-bold text-xs text-foreground">{r.roomTypeName}</TableCell>
                  <TableCell className="text-xs font-medium text-muted-foreground">{r.occupancyPace}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        r.demandBand === 'surge'
                          ? 'destructive'
                          : r.demandBand === 'high'
                          ? 'warning'
                          : r.demandBand === 'normal'
                          ? 'info'
                          : 'secondary'
                      }
                    >
                      {r.demandBand.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">${r.baseRate}</TableCell>
                  <TableCell className="font-mono font-semibold text-xs text-foreground">
                    ${r.calculatedRate}
                  </TableCell>
                  <TableCell>
                    {r.isManualOverride ? (
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-sm text-amber-600 dark:text-amber-400">
                          ${r.manualOverrideRate}
                        </span>
                        <Badge variant="warning">Manual Lock</Badge>
                      </div>
                    ) : (
                      <span className="font-mono font-bold text-sm text-emerald-600">
                        ${r.calculatedRate}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => {
                        setSelectedRule(r)
                        setOverrideInput((r.manualOverrideRate || r.calculatedRate).toString())
                        setIsOverrideOpen(true)
                      }}
                    >
                      <Sliders className="h-3 w-3 mr-1" />
                      Override
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Manual Override Confirmation with Mandatory Audit Reason */}
      <ConfirmationDialog
        isOpen={isOverrideOpen}
        onClose={() => setIsOverrideOpen(false)}
        onConfirm={handleConfirmOverride}
        title={`Override Rate Plan: ${selectedRule?.roomTypeName}`}
        message={`You are about to manually override the automated revenue algorithm for ${selectedRule?.roomTypeName} to $${overrideInput}/night. This will publish across all direct and OTA distribution channels.`}
        confirmText="Enforce Rate Override"
        isDestructive={true}
        requireReason={true}
        reasonLabel="Mandatory Revenue Management Strategy Reason"
      />
    </div>
  )
}
