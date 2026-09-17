import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { useToast } from '@/components/ui/toast'
import { SpaService, SpaAppointment } from '@/types'
import { Hotel, Plus } from 'lucide-react'

const MOCK_SPA_SERVICES: SpaService[] = [
  { id: 's-1', propertyId: 'prop-001', category: 'Massage', name: 'Royal Thai Herbal Poultice Massage', durationMinutes: 90, price: 210, description: 'Steamed medicinal herbs applied with acupressure' },
  { id: 's-2', propertyId: 'prop-001', category: 'Massage', name: 'Deep Tissue Muscle Relief', durationMinutes: 60, price: 175, description: 'Targeted myofascial release with organic arnica oils' },
  { id: 's-3', propertyId: 'prop-001', category: 'Ayurveda', name: 'Shirodhara Mind Calming Ritual', durationMinutes: 75, price: 240, description: 'Continuous stream of warm medicated herbal oil on the forehead' },
  { id: 's-4', propertyId: 'prop-001', category: 'Facial', name: 'Caviar Radiance Anti-Aging Facial', durationMinutes: 60, price: 195, description: 'Marine DNA extracts and collagen infusion' },
]

const MOCK_APPOINTMENTS: SpaAppointment[] = [
  { id: 'apt-1', propertyId: 'prop-001', guestName: 'Elena Rostova', roomNumber: '304', serviceName: 'Royal Thai Herbal Poultice Massage', therapistName: 'Maya Thorne', scheduledDateTime: '2026-09-17 15:30', durationMinutes: 90, amount: 210, status: 'booked' },
  { id: 'apt-2', propertyId: 'prop-001', guestName: 'Kenji Takahashi', roomNumber: '412', serviceName: 'Deep Tissue Muscle Relief', therapistName: 'Sanjay Kumar', scheduledDateTime: '2026-09-17 17:00', durationMinutes: 60, amount: 175, status: 'booked' },
]

export const SpaHub: React.FC = () => {
  const { success } = useToast()
  const [appointments, setAppointments] = useState<SpaAppointment[]>(MOCK_APPOINTMENTS)
  const [services] = useState<SpaService[]>(MOCK_SPA_SERVICES)
  const [isBookOpen, setIsBookOpen] = useState(false)

  // New booking state
  const [guestName, setGuestName] = useState('')
  const [roomNum, setRoomNum] = useState('501')
  const [selectedServiceId, setSelectedServiceId] = useState(services[0].id)
  const [scheduledTime, setScheduledTime] = useState('18:00')

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault()
    const svc = services.find((s) => s.id === selectedServiceId)!
    const newApt: SpaAppointment = {
      id: `apt-${Date.now()}`,
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
    setAppointments([...appointments, newApt])
    success(
      'Spa Treatment Booked & Posted',
      `${svc.name} scheduled for ${guestName}. Charge posted to Room ${roomNum} Folio.`
    )
    setIsBookOpen(false)
    setGuestName('')
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
              {appointments.map((apt) => (
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Services Menu Catalog */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
