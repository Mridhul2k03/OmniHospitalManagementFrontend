import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { useToast } from '@/components/ui/toast'
import { MaintenanceTicket, MaintenanceStatus } from '@/types'
import { maintenanceApi } from '@/api/endpoints/maintenance.api'
import { Clock, Plus } from 'lucide-react'

export const MaintenanceHub: React.FC = () => {
  const { success } = useToast()
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([])
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newLocation, setNewLocation] = useState('')
  const [newCategory, setNewCategory] = useState<'HVAC / AC' | 'Plumbing' | 'Electrical' | 'Carpentry'>('HVAC / AC')
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium')

  // Fetch live tickets from backend
  React.useEffect(() => {
    maintenanceApi.getTickets().then(setTickets).catch((err) => {
      console.warn('Backend maintenance tickets unreachable:', err)
    })
  }, [])

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault()
    const newTkt: MaintenanceTicket = {
      id: `m-${Date.now()}`,
      code: `MNT-${Math.floor(100 + Math.random() * 900)}`,
      propertyId: 'prop-001',
      category: newCategory,
      location: newLocation,
      title: newTitle,
      description: 'Logged via Engineering Dispatch Board',
      priority: newPriority,
      status: 'reported',
      reportedBy: 'Engineering Dispatch',
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      slaHours: newPriority === 'urgent' ? 4 : 12,
      isOverdue: false,
      estimatedCost: 0,
    }
    setTickets([newTkt, ...tickets])
    success('Work Order Logged', `Ticket ${newTkt.code} dispatched to Engineering Team.`)
    setIsNewTicketOpen(false)
    setNewTitle('')
    setNewLocation('')
  }

  const handleAdvanceStatus = (ticketId: string) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId) return t
        let next: MaintenanceStatus = t.status
        if (t.status === 'reported') next = 'assigned'
        else if (t.status === 'assigned') next = 'in_progress'
        else if (t.status === 'in_progress') next = 'resolved'
        else if (t.status === 'resolved') next = 'verified'
        else if (t.status === 'verified') next = 'closed'
        return { ...t, status: next }
      })
    )
    success('Ticket State Advanced', 'Updated maintenance state machine.')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Maintenance & Engineering</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Work order ticket board, SLA breach monitoring, and parts allocation
          </p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setIsNewTicketOpen(true)}>
          <Plus className="h-4 w-4" />
          Log Work Order Ticket
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b border-border">
          <CardTitle className="text-base">Active Engineering Work Orders</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket #</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Category & Title</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Technician</TableHead>
                <TableHead>SLA Status</TableHead>
                <TableHead>State</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-mono font-bold text-xs text-primary">{t.code}</TableCell>
                  <TableCell className="font-semibold text-xs text-foreground">{t.location}</TableCell>
                  <TableCell>
                    <div className="text-xs font-semibold text-foreground">{t.title}</div>
                    <div className="text-[10px] text-muted-foreground">{t.category}</div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        t.priority === 'urgent'
                          ? 'destructive'
                          : t.priority === 'high'
                          ? 'warning'
                          : 'neutral'
                      }
                    >
                      {t.priority.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">{t.assignedTechnician || 'Unassigned'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{t.slaHours}h Target</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        t.status === 'resolved' || t.status === 'verified'
                          ? 'success'
                          : t.status === 'in_progress'
                          ? 'info'
                          : 'warning'
                      }
                    >
                      {t.status.replace(/_/g, ' ').toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {t.status !== 'closed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() => handleAdvanceStatus(t.id)}
                      >
                        Advance
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Log Work Order Modal */}
      <Modal
        isOpen={isNewTicketOpen}
        onClose={() => setIsNewTicketOpen(false)}
        title="Log Engineering Work Order"
        description="Dispatch maintenance technician to property asset"
        maxWidth="md"
      >
        <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-foreground mb-1">Asset Location</label>
            <input
              type="text"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              placeholder="e.g. Room 304, Main Lobby Elevator #2, Pool Pump House"
              required
              className="w-full rounded-lg border border-border bg-background p-2 text-xs text-foreground focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-foreground mb-1">Trade Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="w-full rounded-lg border border-border bg-background p-2 text-xs text-foreground focus:ring-2 focus:ring-primary"
              >
                <option value="HVAC / AC">HVAC / Air Conditioning</option>
                <option value="Plumbing">Plumbing & Water</option>
                <option value="Electrical">Electrical & Lighting</option>
                <option value="Carpentry">Carpentry & Structural</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-foreground mb-1">Priority SLA</label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as any)}
                className="w-full rounded-lg border border-border bg-background p-2 text-xs text-foreground focus:ring-2 focus:ring-primary"
              >
                <option value="urgent">Urgent (&lt;4 Hours)</option>
                <option value="high">High (&lt;6 Hours)</option>
                <option value="medium">Medium (&lt;12 Hours)</option>
                <option value="low">Low (&lt;24 Hours)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1">Issue Description</label>
            <textarea
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
              rows={3}
              placeholder="Describe fault symptoms and equipment observed..."
              className="w-full rounded-lg border border-border bg-background p-2 text-xs text-foreground focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setIsNewTicketOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Dispatch Work Order</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
