import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge, ReservationStatusBadge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/toast'
import { Reservation } from '@/types'
import { Search, Plus } from 'lucide-react'

const MOCK_RESERVATIONS_LIST: Reservation[] = [
  {
    id: 'res-201',
    code: 'RES-9104',
    propertyId: 'prop-001',
    propertyName: 'Grand Horizon Palace & Spa',
    guest: { id: 'g-21', firstName: 'Julian', lastName: 'Montague', email: 'j.montague@london.co.uk', phone: '+44 20 7111 2222', idType: 'passport', idNumber: 'GB882910', country: 'United Kingdom', vipStatus: 'platinum', totalStays: 12, totalSpend: 38000 },
    roomTypeId: 'rt-001',
    roomTypeName: 'Penthouse Royal Suite',
    roomId: 'rm-501',
    roomNumber: '501',
    checkInDate: '2026-09-20',
    checkOutDate: '2026-09-25',
    nightsCount: 5,
    adultsCount: 2,
    childrenCount: 1,
    status: 'confirmed',
    totalAmount: 7250,
    paidAmount: 7250,
    balanceAmount: 0,
    channel: 'direct',
    createdDate: '2026-09-14',
  },
  {
    id: 'res-202',
    code: 'RES-9105',
    propertyId: 'prop-001',
    propertyName: 'Grand Horizon Palace & Spa',
    guest: { id: 'g-22', firstName: 'Helena', lastName: 'Bergman', email: 'h.bergman@nordic.se', phone: '+46 8 555 0199', idType: 'passport', idNumber: 'SE991042', country: 'Sweden', vipStatus: 'silver', totalStays: 3, totalSpend: 6200 },
    roomTypeId: 'rt-002',
    roomTypeName: 'Executive Oceanfront King',
    roomNumber: '305',
    checkInDate: '2026-09-21',
    checkOutDate: '2026-09-24',
    nightsCount: 3,
    adultsCount: 1,
    childrenCount: 0,
    status: 'confirmed',
    totalAmount: 1380,
    paidAmount: 1380,
    balanceAmount: 0,
    channel: 'ota_booking',
    createdDate: '2026-09-15',
  },
  {
    id: 'res-203',
    code: 'RES-9106',
    propertyId: 'prop-001',
    propertyName: 'Grand Horizon Palace & Spa',
    guest: { id: 'g-23', firstName: 'Alexander', lastName: 'Vance', email: 'avance@vancecorp.com', phone: '+1 212 555 0111', idType: 'driver_license', idNumber: 'NY882910', country: 'United States', vipStatus: 'gold', totalStays: 7, totalSpend: 19400 },
    roomTypeId: 'rt-003',
    roomTypeName: 'Premier Suite',
    roomNumber: '302',
    checkInDate: '2026-09-22',
    checkOutDate: '2026-09-26',
    nightsCount: 4,
    adultsCount: 2,
    childrenCount: 0,
    status: 'confirmed',
    totalAmount: 2080,
    paidAmount: 1000,
    balanceAmount: 1080,
    channel: 'corporate',
    createdDate: '2026-09-15',
  },
]

export const ReservationsHub: React.FC = () => {
  const { success } = useToast()
  const [reservations] = useState<Reservation[]>(MOCK_RESERVATIONS_LIST)
  const [search, setSearch] = useState('')

  const filtered = reservations.filter(
    (r) =>
      r.guest.lastName.toLowerCase().includes(search.toLowerCase()) ||
      r.code.toLowerCase().includes(search.toLowerCase()) ||
      (r.roomNumber && r.roomNumber.includes(search))
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Reservations Management</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Individual, group, corporate, and OTA reservation master manifest
          </p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => success('New reservation wizard initialized')}>
          <Plus className="h-4 w-4" />
          Create Reservation
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-base">Master Booking Records</CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search reservation code, guest..."
                className="w-full rounded-lg border border-border bg-background py-1.5 pl-8 pr-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking Ref</TableHead>
                <TableHead>Primary Guest</TableHead>
                <TableHead>Room Category</TableHead>
                <TableHead>Check-In → Check-Out</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Total & Balance</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono font-bold text-xs text-primary">{r.code}</TableCell>
                  <TableCell>
                    <div className="font-semibold text-xs text-foreground">
                      {r.guest.firstName} {r.guest.lastName}
                    </div>
                    <div className="text-[10px] text-muted-foreground">{r.guest.email}</div>
                  </TableCell>
                  <TableCell className="text-xs">
                    <span className="font-medium text-foreground">{r.roomTypeName}</span>
                    <span className="text-[10px] text-muted-foreground block font-mono">
                      Room {r.roomNumber || 'Unassigned'}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono">
                    {r.checkInDate} → {r.checkOutDate} ({r.nightsCount}N)
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{r.channel.replace(/_/g, ' ')}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs font-bold text-foreground font-mono">${r.totalAmount.toLocaleString()}</div>
                    {r.balanceAmount > 0 && (
                      <span className="text-[10px] text-rose-600 font-bold font-mono">
                        Due: ${r.balanceAmount}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <ReservationStatusBadge status={r.status} />
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
