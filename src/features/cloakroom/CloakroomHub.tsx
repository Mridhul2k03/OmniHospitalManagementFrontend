import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { useToast } from '@/components/ui/toast'
import { CloakroomTicket } from '@/types'
import { QrCode, Plus, CheckCircle2 } from 'lucide-react'

const MOCK_CLOAKROOM_TICKETS: CloakroomTicket[] = [
  {
    id: 'clk-1',
    ticketNumber: 'CLOAK-8021',
    propertyId: 'prop-001',
    ownerName: 'Lord Sterling Crawford',
    roomNumber: '501',
    contactPhone: '+44 20 7946 0912',
    itemCount: 4,
    itemDescriptions: '2x Rimowa Aluminum Trunks, 1x Louis Vuitton Garment Bag, 1x Golf Set',
    storageRackLocation: 'Rack B-04 (VIP High Security Vault)',
    issuedAt: '2026-09-17 14:15',
    status: 'stored',
  },
  {
    id: 'clk-2',
    ticketNumber: 'CLOAK-8019',
    propertyId: 'prop-001',
    ownerName: 'David K. (Conference Speaker)',
    contactPhone: '+1 415 555 0188',
    itemCount: 2,
    itemDescriptions: '1x Tumi Roller Suitcase, 1x Laptop Briefcase',
    storageRackLocation: 'Rack A-12 (Bell Desk Hold)',
    issuedAt: '2026-09-17 11:30',
    status: 'stored',
  },
]

export const CloakroomHub: React.FC = () => {
  const { success } = useToast()
  const [tickets, setTickets] = useState<CloakroomTicket[]>(MOCK_CLOAKROOM_TICKETS)
  const [isIssueOpen, setIsIssueOpen] = useState(false)
  const [ticketToRelease, setTicketToRelease] = useState<CloakroomTicket | null>(null)

  // New ticket state
  const [owner, setOwner] = useState('')
  const [room, setRoom] = useState('')
  const [phone, setPhone] = useState('')
  const [count, setCount] = useState('2')
  const [desc, setDesc] = useState('')
  const [rack, setRack] = useState('Rack A-05')

  const handleIssueTicket = (e: React.FormEvent) => {
    e.preventDefault()
    const newTkt: CloakroomTicket = {
      id: `clk-${Date.now()}`,
      ticketNumber: `CLOAK-${Math.floor(8000 + Math.random() * 1000)}`,
      propertyId: 'prop-001',
      ownerName: owner,
      roomNumber: room || undefined,
      contactPhone: phone,
      itemCount: parseInt(count) || 1,
      itemDescriptions: desc,
      storageRackLocation: rack,
      issuedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      status: 'stored',
    }
    setTickets([newTkt, ...tickets])
    success('Cloakroom Baggage Tag Generated', `Ticket ${newTkt.ticketNumber} registered to ${owner}. Assigned: ${rack}`)
    setIsIssueOpen(false)
    setOwner('')
    setDesc('')
  }

  const handleConfirmRelease = () => {
    if (!ticketToRelease) return
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketToRelease.id
          ? {
              ...t,
              status: 'released',
              releasedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
              releasedTo: ticketToRelease.ownerName,
            }
          : t
      )
    )
    success('Luggage Released & Verified', `All ${ticketToRelease.itemCount} items returned to ${ticketToRelease.ownerName}. Ticket archived.`)
    setTicketToRelease(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Cloakroom & Luggage Vault</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Bell desk baggage tickets, secure rack allocations, and verified claim release
          </p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setIsIssueOpen(true)}>
          <Plus className="h-4 w-4" />
          Issue Luggage Tag Ticket
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b border-border">
          <CardTitle className="text-base">Active Luggage Storage Custody</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket #</TableHead>
                <TableHead>Guest Owner</TableHead>
                <TableHead>Room / Contact</TableHead>
                <TableHead>Item Count</TableHead>
                <TableHead>Item Descriptions</TableHead>
                <TableHead>Vault Rack Location</TableHead>
                <TableHead>Issued At</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((t) => (
                <TableRow key={t.id} className={t.status === 'released' ? 'opacity-40 bg-muted/20' : ''}>
                  <TableCell className="font-mono font-bold text-xs text-primary flex items-center gap-1.5">
                    <QrCode className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{t.ticketNumber}</span>
                  </TableCell>
                  <TableCell className="font-bold text-xs text-foreground">{t.ownerName}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {t.roomNumber ? `Room ${t.roomNumber}` : 'Day Visitor'}
                  </TableCell>
                  <TableCell className="font-mono font-bold text-xs">{t.itemCount} Bags</TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                    {t.itemDescriptions}
                  </TableCell>
                  <TableCell className="font-mono font-semibold text-xs text-amber-600 dark:text-amber-400">
                    {t.storageRackLocation}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono">{t.issuedAt}</TableCell>
                  <TableCell>
                    <Badge variant={t.status === 'stored' ? 'warning' : 'neutral'}>
                      {t.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {t.status === 'stored' && (
                      <Button
                        size="sm"
                        className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => setTicketToRelease(t)}
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Release
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Issue Tag Modal */}
      <Modal
        isOpen={isIssueOpen}
        onClose={() => setIsIssueOpen(false)}
        title="Check Luggage into Cloakroom"
        description="Print luggage tag barcode and assign vault storage slot"
        maxWidth="md"
      >
        <form onSubmit={handleIssueTicket} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-foreground mb-1">Guest Owner Full Name</label>
            <input
              type="text"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              placeholder="e.g. Lord Sterling Crawford"
              required
              className="w-full rounded-lg border border-border bg-background p-2 text-xs text-foreground focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-foreground mb-1">Guest Room # (Optional)</label>
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="e.g. 501"
                className="w-full rounded-lg border border-border bg-background p-2 text-xs text-foreground focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block font-semibold text-foreground mb-1">Contact Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +1 555 0199"
                className="w-full rounded-lg border border-border bg-background p-2 text-xs text-foreground focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block font-semibold text-foreground mb-1">Total Piece Count</label>
              <input
                type="number"
                min="1"
                value={count}
                onChange={(e) => setCount(e.target.value)}
                required
                className="w-full rounded-lg border border-border bg-background p-2 text-xs text-foreground focus:ring-2 focus:ring-primary font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1">Item Descriptions & Identifiers</label>
            <input
              type="text"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="e.g. 2 Black Samsonite Hard-cases, 1 Leather Suit Bag"
              required
              className="w-full rounded-lg border border-border bg-background p-2 text-xs text-foreground focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1">Vault Storage Rack Location</label>
            <select
              value={rack}
              onChange={(e) => setRack(e.target.value)}
              className="w-full rounded-lg border border-border bg-background p-2 text-xs text-foreground focus:ring-2 focus:ring-primary"
            >
              <option value="Rack A-01">Rack A-01 (General Bell Vault)</option>
              <option value="Rack A-05">Rack A-05 (General Bell Vault)</option>
              <option value="Rack B-04 (VIP Vault)">Rack B-04 (VIP High Security Vault)</option>
              <option value="Cold Room Storage">Cold Room Storage (Wine & Perishables)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setIsIssueOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Print Tag & Store</Button>
          </div>
        </form>
      </Modal>

      {/* Release Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!ticketToRelease}
        onClose={() => setTicketToRelease(null)}
        onConfirm={handleConfirmRelease}
        title="Verify Baggage Claim & Release"
        message={`Verify matching claim receipt ticket ${ticketToRelease?.ticketNumber} before releasing ${ticketToRelease?.itemCount} items to ${ticketToRelease?.ownerName}.`}
        confirmText="Confirm Baggage Release"
        isDestructive={false}
      />
    </div>
  )
}
