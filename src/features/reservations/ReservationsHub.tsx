import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge, ReservationStatusBadge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/toast'
import { Reservation } from '@/types'
import { reservationsApi } from '@/api/endpoints/reservations.api'
import { Search, Plus } from 'lucide-react'

export const ReservationsHub: React.FC = () => {
  const { success } = useToast()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  React.useEffect(() => {
    setIsLoading(true)
    reservationsApi
      .getReservations()
      .then((data) => {
        setReservations(data || [])
      })
      .catch((err) => {
        console.warn('Backend reservations endpoint error:', err)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

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
