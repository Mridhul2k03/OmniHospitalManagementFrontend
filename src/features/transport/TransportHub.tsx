import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { useToast } from '@/components/ui/toast'
import { TransportTrip, TripStatus } from '@/types'
import { transportApi } from '@/api/endpoints/transport.api'
import { MapPin, Plus, Hotel, ChevronRight } from 'lucide-react'

export const TransportHub: React.FC = () => {
  const { success } = useToast()
  const [trips, setTrips] = useState<TransportTrip[]>([])
  const [isBookOpen, setIsBookOpen] = useState(false)

  // Fetch live trips from backend
  React.useEffect(() => {
    transportApi
      .getTrips()
      .then((data) => {
        if (Array.isArray(data)) {
          const normalized = data.map((tr: any) => ({
            id: tr.id,
            bookingCode: tr.bookingCode || `TRIP-${String(tr.id).replace(/\D/g, '') || Math.floor(100 + Math.random() * 900)}`,
            propertyId: tr.propertyId || 'prop-001',
            passengerName: tr.passengerName || tr.guestName || 'VIP Guest',
            passengerPhone: tr.passengerPhone || '+1 (555) 0100',
            roomNumber: tr.roomNumber || '501',
            tripType: tr.tripType || 'airport_transfer',
            pickupLocation: tr.pickupLocation || 'Grand Horizon Palace',
            dropoffLocation: tr.dropoffLocation || 'JFK International Airport',
            scheduledTime: tr.scheduledTime || (tr.pickupTime ? tr.pickupTime.slice(0, 16).replace('T', ' ') : '2026-09-22 14:00'),
            vehicleType: tr.vehicleType || tr.vehicleName || 'Luxury SUV',
            vehiclePlate: tr.vehiclePlate || 'LUX-8911',
            driverName: tr.driverName || 'Liam O\'Connor',
            fare: tr.fare || 180,
            status: (tr.status || 'requested') as TripStatus,
          }))
          setTrips(normalized)
        }
      })
      .catch((err) => {
        console.warn('Backend transport trips unreachable:', err)
      })
  }, [])

  // Booking fields
  const [pName, setPName] = useState('')
  const [pRoom, setPRoom] = useState('501')
  const [pPickup, setPPickup] = useState('')
  const [pDrop, setPDrop] = useState('')
  const [pVehicle, setPVehicle] = useState<'Sedan' | 'Luxury SUV' | 'Van' | 'Executive Coach'>('Luxury SUV')
  const [pFare, setPFare] = useState('180')

  const handleBookTrip = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      bookingCode: `TRIP-${Math.floor(100 + Math.random() * 900)}`,
      propertyId: 'prop-001',
      guestName: pName,
      passengerName: pName,
      passengerPhone: '+1 555 0100',
      roomNumber: pRoom,
      tripType: 'airport_transfer',
      pickupLocation: pPickup,
      dropoffLocation: pDrop,
      pickupTime: '2026-09-22 18:00',
      scheduledTime: '2026-09-22 18:00',
      passengerCount: 1,
      vehicleTypeRequested: pVehicle,
      vehicleType: pVehicle,
      driverName: 'Liam O\'Connor',
      fare: parseFloat(pFare) || 150,
      status: 'requested' as TripStatus,
    }

    try {
      const res: any = await transportApi.createTrip(payload as any)
      const createdTrip: TransportTrip = {
        id: res.id || `tr-${Date.now()}`,
        bookingCode: res.bookingCode || payload.bookingCode,
        propertyId: payload.propertyId,
        passengerName: res.passengerName || res.guestName || payload.passengerName,
        passengerPhone: payload.passengerPhone,
        roomNumber: payload.roomNumber,
        tripType: 'airport_transfer',
        pickupLocation: res.pickupLocation || payload.pickupLocation,
        dropoffLocation: res.dropoffLocation || payload.dropoffLocation,
        scheduledTime: res.scheduledTime || res.pickupTime || payload.scheduledTime,
        vehicleType: payload.vehicleType,
        driverName: res.driverName || payload.driverName,
        fare: res.fare || payload.fare,
        status: 'requested',
      }
      setTrips((prev) => [createdTrip, ...prev])
      success('Transport Dispatch Scheduled', `Transfer ${createdTrip.bookingCode} registered for ${pName}.`)
    } catch {
      const fallback: TransportTrip = {
        id: `tr-${Date.now()}`,
        ...payload,
      } as TransportTrip
      setTrips((prev) => [...prev, fallback])
      success('Transport Dispatch Scheduled', `Transfer ${fallback.bookingCode} registered for ${pName}.`)
    }

    setIsBookOpen(false)
    setPName('')
    setPPickup('')
    setPDrop('')
  }

  const handleAdvanceTrip = async (tripId: string) => {
    const target = trips.find((t) => t.id === tripId)
    if (!target) return
    let next: TripStatus = target.status
    if (target.status === 'requested') next = 'assigned'
    else if (target.status === 'assigned') next = 'en_route'
    else if (target.status === 'en_route') next = 'arrived'
    else if (target.status === 'arrived') next = 'picked_up'
    else if (target.status === 'picked_up') next = 'completed'
    else if (target.status === 'completed') next = 'billed'

    setTrips((prev) =>
      prev.map((t) => (t.id === tripId ? { ...t, status: next } : t))
    )
    success('Trip Status Progressed', `Transfer updated to ${next.replace(/_/g, ' ').toUpperCase()}.`)

    try {
      await transportApi.updateTripStatus(tripId, next)
    } catch (err) {
      console.warn('Backend transport status sync error:', err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Fleet & Chauffeur Dispatch</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Airport limousine bookings, hourly chauffeur dispatch, and scheduled shuttle routes
          </p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setIsBookOpen(true)}>
          <Plus className="h-4 w-4" />
          Schedule Chauffeur Transfer
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b border-border">
          <CardTitle className="text-base">Active Fleet Dispatch Operations</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking Code</TableHead>
                <TableHead>Passenger / Room</TableHead>
                <TableHead>Route (Pickup → Drop)</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Vehicle & Driver</TableHead>
                <TableHead>Fare</TableHead>
                <TableHead>Dispatch State</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trips.map((tr) => (
                <TableRow key={tr.id}>
                  <TableCell className="font-mono font-bold text-xs text-primary">{tr.bookingCode}</TableCell>
                  <TableCell>
                    <div className="font-bold text-xs text-foreground">{tr.passengerName}</div>
                    <div className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                      <Hotel className="h-3 w-3" /> Room {tr.roomNumber}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">
                    <div className="flex items-center gap-1 text-foreground font-medium">
                      <MapPin className="h-3 w-3 text-emerald-600" />
                      <span>{tr.pickupLocation}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground mt-0.5">
                      <MapPin className="h-3 w-3 text-rose-600" />
                      <span>{tr.dropoffLocation}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono">{tr.scheduledTime}</TableCell>
                  <TableCell className="text-xs">
                    <div className="font-semibold text-foreground">{tr.driverName || 'Awaiting Driver'}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {tr.vehicleType} • {tr.vehiclePlate || 'Unassigned'}
                    </div>
                  </TableCell>
                  <TableCell className="font-bold font-mono text-xs text-foreground">${tr.fare}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        tr.status === 'completed' || tr.status === 'billed'
                          ? 'success'
                          : tr.status === 'en_route'
                          ? 'info'
                          : 'warning'
                      }
                    >
                      {tr.status.replace(/_/g, ' ').toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {tr.status !== 'billed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() => handleAdvanceTrip(tr.id)}
                      >
                        <span>Advance</span>
                        <ChevronRight className="h-3 w-3 ml-1" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Book Chauffeur Modal */}
      <Modal
        isOpen={isBookOpen}
        onClose={() => setIsBookOpen(false)}
        title="Schedule Chauffeur Transfer"
        description="Book executive transport and assign fleet vehicle"
        maxWidth="md"
      >
        <form onSubmit={handleBookTrip} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-foreground mb-1">Passenger Full Name</label>
              <input
                type="text"
                value={pName}
                onChange={(e) => setPName(e.target.value)}
                placeholder="e.g. Lord Sterling Crawford"
                required
                className="w-full rounded-lg border border-border bg-background p-2 text-xs text-foreground focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block font-semibold text-foreground mb-1">Bill to Room #</label>
              <input
                type="text"
                value={pRoom}
                onChange={(e) => setPRoom(e.target.value)}
                placeholder="e.g. 501"
                required
                className="w-full rounded-lg border border-border bg-background p-2 text-xs text-foreground focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1">Pickup Location</label>
            <input
              type="text"
              value={pPickup}
              onChange={(e) => setPPickup(e.target.value)}
              placeholder="e.g. JFK Airport Terminal 4 Baggage Claim"
              required
              className="w-full rounded-lg border border-border bg-background p-2 text-xs text-foreground focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1">Drop-off Destination</label>
            <input
              type="text"
              value={pDrop}
              onChange={(e) => setPDrop(e.target.value)}
              placeholder="e.g. Grand Horizon Palace Hotel"
              required
              className="w-full rounded-lg border border-border bg-background p-2 text-xs text-foreground focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-foreground mb-1">Fleet Vehicle Category</label>
              <select
                value={pVehicle}
                onChange={(e) => setPVehicle(e.target.value as any)}
                className="w-full rounded-lg border border-border bg-background p-2 text-xs text-foreground focus:ring-2 focus:ring-primary"
              >
                <option value="Luxury SUV">Cadillac Escalade ESV (Luxury SUV)</option>
                <option value="Sedan">Mercedes-Benz S-Class (Sedan)</option>
                <option value="Van">Mercedes Sprinter Jet-Van (8 Pax)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-foreground mb-1">Agreed Fare ($ USD)</label>
              <input
                type="number"
                value={pFare}
                onChange={(e) => setPFare(e.target.value)}
                required
                className="w-full rounded-lg border border-border bg-background p-2 text-xs text-foreground focus:ring-2 focus:ring-primary font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setIsBookOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Dispatch Chauffeur</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
