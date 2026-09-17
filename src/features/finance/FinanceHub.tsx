import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { StatCard } from '@/components/ui/stat-card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { useToast } from '@/components/ui/toast'
import { DollarSign, ShieldAlert, ArrowDownRight, ArrowUpRight, Lock, FileSpreadsheet } from 'lucide-react'

export const FinanceHub: React.FC = () => {
  const { success } = useToast()
  const [isNightAuditOpen, setIsNightAuditOpen] = useState(false)

  const handleRunNightAudit = () => {
    setIsNightAuditOpen(true)
  }

  const handleConfirmClose = () => {
    success('Daily Ledger Closed & Reconciled', 'Night audit completed. Daily room revenue posted to General Ledger.')
    setIsNightAuditOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Accounting & Night Audit</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Cashier reconciliation, receivables, daily closing and general ledger synchronizer
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => success('General Ledger export CSV generated')}>
            <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" />
            Export GL CSV
          </Button>
          <Button size="sm" className="bg-purple-600 hover:bg-purple-700 gap-1.5" onClick={handleRunNightAudit}>
            <Lock className="h-3.5 w-3.5" />
            Execute Night Audit & Day Close
          </Button>
        </div>
      </div>

      {/* Finance KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Gross Daily Revenue" value="$48,920" subtitle="Rooms + F&B + Spa" trend={{ value: 12.4, label: 'vs yesterday' }} icon={<DollarSign className="h-4 w-4" />} />
        <StatCard title="Total Accounts Receivable" value="$14,200" subtitle="Corporate Direct Bill" icon={<ArrowUpRight className="h-4 w-4 text-emerald-600" />} />
        <StatCard title="Accounts Payable" value="$8,450" subtitle="Vendor Food & Bev Supplies" icon={<ArrowDownRight className="h-4 w-4 text-rose-600" />} />
        <StatCard title="Cash in Front Desk Vault" value="$4,850" subtitle="Drawer Balanced" icon={<ShieldAlert className="h-4 w-4 text-amber-600" />} />
      </div>

      {/* Recent High-Value Transactions */}
      <Card>
        <CardHeader className="pb-3 border-b border-border">
          <CardTitle className="text-base">Recent High-Value Settlements & Gateway Payments</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction Ref</TableHead>
                <TableHead>Folio / Account</TableHead>
                <TableHead>Channel / Outlet</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Gateway Auth</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Settlement State</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { id: 'TXN-8831', folio: 'FOL-801 (Lord Crawford)', outlet: 'Front Desk Cashier', amt: '$2,000.00', method: 'AMEX Corporate', time: '2026-09-17 14:05', status: 'settled' },
                { id: 'TXN-8829', folio: 'FOL-798 (Eleanor Vance)', outlet: 'The Palm Court Fine Dining', amt: '$580.00', method: 'Visa Infinite', time: '2026-09-17 13:40', status: 'settled' },
                { id: 'TXN-8825', folio: 'FOL-794 (Apex Capital Group)', outlet: 'Banquet Master Billing', amt: '$12,500.00', method: 'Fedwire Wire Transfer', time: '2026-09-17 11:15', status: 'settled' },
              ].map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-mono font-bold text-xs text-primary">{tx.id}</TableCell>
                  <TableCell className="font-semibold text-xs text-foreground">{tx.folio}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{tx.outlet}</TableCell>
                  <TableCell className="font-bold text-xs font-mono text-foreground">{tx.amt}</TableCell>
                  <TableCell className="text-xs font-mono">{tx.method}</TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono">{tx.time}</TableCell>
                  <TableCell>
                    <Badge variant="success">Webhook Confirmed</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Night Audit Modal */}
      <Modal
        isOpen={isNightAuditOpen}
        onClose={() => setIsNightAuditOpen(false)}
        title="Automated Night Audit & Day Closing Wizard"
        description="Verify daily reconciliations before closing business day 2026-09-17"
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <div className="space-y-2">
            {[
              { label: 'Automatic Room Charge Posting for In-House Guests (114 Rooms)', status: 'Verified' },
              { label: 'POS Terminal Cashier Drawer Settlement (F&B + Spa)', status: 'Balanced' },
              { label: 'Payment Gateway Webhook Reconciliation Check (0 Discrepancies)', status: 'Reconciled' },
              { label: 'No-Show Reservation Cancellation and Guarantee Forfeiture', status: 'Processed' },
              { label: 'General Ledger Export to Enterprise ERP', status: 'Ready' },
            ].map((step, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
                <span className="font-medium text-foreground">{step.label}</span>
                <Badge variant="success">{step.status}</Badge>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button variant="outline" onClick={() => setIsNightAuditOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleConfirmClose}>
              Finalize Night Audit & Roll Date
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
