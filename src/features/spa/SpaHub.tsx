import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { useToast } from '@/components/ui/toast'
import { SpaService, SpaAppointment } from '@/types'
import { spaApi } from '@/api/endpoints'
import { Hotel, Plus } from 'lucide-react'

export const SpaHub: React.FC = () => {
  const { success, error } = useToast()
  const [appointments, setAppointments] = useState<SpaAppointment[]>([])
  const [services, setServices] = useState<SpaService[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isBookOpen, setIsBookOpen] = useState(false)

  // New booking state
  const [guestName, setGuestName] = useState('')
  const [roomNum, setRoomNum] = useState('501')
  const [selectedServiceId, setSelectedServiceId] = useState('')
  const [scheduledTime, setScheduledTime] = useState('18:00')

  React.useEffect(() => {
    let mounted = true
    setIsLoading(true)
    Promise.all([spaApi.getServices(), spaApi.getAppointments()])
      .then(([svcData, aptData]) => {
        if (!mounted) return
        setServices(svcData)
        setAppointments(aptData)
        if (svcData.length > 0 && !selectedServiceId) {
          setSelectedServiceId(svcData[0].id)
        }
      })
      .catch((err) => {
        console.warn('Live spa data load failed:', err)
      })
      .finally(() => {
        if (mounted) setIsLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault()
    const svc = services.find((s) => s.id === selectedServiceId)
    if (!svc) return

    const newAptData: Partial<SpaAppointment> = {
      propertyId: 'prop-001',
      guestName,
      roomNumber: roomNum,
      serviceName: svc.name,
      therapistName: 'Maya Thorne',
      scheduledDateTime: `2026-09-17 ${scheduledTime}`,
      durationMinutes: svc.durationMinutes,
      amount: svc.price,
      status: 'booked',
    }

    try {
      const created = await spaApi.createAppointment(newAptData)
      setAppointments((prev) => [created, ...prev])
      success(
        'Spa Treatment Booked & Posted',
        `${svc.name} scheduled for ${guestName}. Charge posted to Room ${roomNum} Folio.`
      )
      setIsBookOpen(false)
      setGuestName('')
    } catch (err) {
      error('Booking Failed', 'Unable to persist spa appointment.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Lotus Ayurvedic & Spa Wellness</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Treatment bookings, therapist schedules, and direct room folio charging
          </p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setIsBookOpen(true)}>
          <Plus className="h-4 w-4" />
          Book Treatment
        </Button>
      </div>

      {/* Appointments Today Table */}
      <Card>
        <CardHeader className="pb-3 border-b border-border">
          <CardTitle className="text-base">Today's Spa Treatment Schedule</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Guest Name & Room</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Assigned Therapist</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Folio Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-xs">
                    {isLoading ? 'Loading treatment schedule...' : 'No spa treatments scheduled for today.'}
                  </TableCell>
                </TableRow>
              ) : (
                appointments.map((apt) => (
                  <TableRow key={apt.id}>
                    <TableCell className="font-mono font-bold text-xs text-primary">
                      {apt.scheduledDateTime.slice(11)}
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-xs text-foreground">{apt.guestName}</div>
                      <div className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                        <Hotel className="h-3 w-3" /> Room {apt.roomNumber}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-medium">{apt.serviceName}</TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">{apt.durationMinutes} min</TableCell>
                    <TableCell className="text-xs">{apt.therapistName}</TableCell>
                    <TableCell className="font-mono font-bold text-xs text-foreground">${apt.amount}</TableCell>
                    <TableCell>
                      <Badge variant="success">Billed to Folio</Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Services Menu Catalog */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {services.length === 0 && !isLoading && (
          <div className="col-span-full py-8 text-center text-xs text-muted-foreground">
            No spa services catalog available.
          </div>
        )}
        {services.map((s) => (
          <Card key={s.id} className="p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <Badge variant="outline">{s.category}</Badge>
                <span className="font-mono font-bold text-sm text-primary">${s.price}</span>
              </div>
              <h4 className="font-bold text-sm text-foreground mt-2">{s.name}</h4>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{s.description}</p>
            </div>
            <div className="mt-3 pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground font-mono">
              <span>{s.durationMinutes} minutes</span>
              <Button
                size="sm"
                variant="ghost"
                className="text-xs text-primary"
                onClick={() => {
                  setSelectedServiceId(s.id)
                  setIsBookOpen(true)
                }}
              >
                Book
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Book Treatment Modal */}
      <Modal
        isOpen={isBookOpen}
        onClose={() => setIsBookOpen(false)}
        title="Schedule Spa Treatment"
        description="Treatment will automatically bill to active guest folio upon booking"
        maxWidth="md"
      >
        <form onSubmit={handleCreateAppointment} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-foreground mb-1">Guest Name</label>
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="e.g. Elena Rostova"
              required
              className="w-full rounded-lg border border-border bg-background p-2 text-xs text-foreground focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-foreground mb-1">Charge to Room</label>
              <input
                type="text"
                value={roomNum}
                onChange={(e) => setRoomNum(e.target.value)}
                placeholder="e.g. 501"
                required
                className="w-full rounded-lg border border-border bg-background p-2 text-xs text-foreground focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block font-semibold text-foreground mb-1">Appointment Time</label>
              <input
                type="text"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                placeholder="16:00"
                required
                className="w-full rounded-lg border border-border bg-background p-2 text-xs text-foreground focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1">Treatment Service</label>
            <select
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
              className="w-full rounded-lg border border-border bg-background p-2 text-xs text-foreground focus:ring-2 focus:ring-primary"
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} - ${s.price} ({s.durationMinutes} min)
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setIsBookOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Confirm & Post to Room Folio</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
