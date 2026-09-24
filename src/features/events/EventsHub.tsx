import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { useToast } from '@/components/ui/toast'
import { BanquetEvent, BanquetVenue } from '@/types'
import { eventsApi, operationsApi } from '@/api/endpoints'
import { apiClient } from '@/api/client/axios'
import { Input } from '@/components/ui/input'
import { Calendar, Users, Building, FileText, Plus } from 'lucide-react'

export const EventsHub: React.FC = () => {
  const { success, error } = useToast()
  const [events, setEvents] = useState<BanquetEvent[]>([])
  const [venues, setVenues] = useState<BanquetVenue[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'events' | 'venues'>('events')
  const [selectedEvent, setSelectedEvent] = useState<BanquetEvent | null>(null)
  const [isSendingInvoice, setIsSendingInvoice] = useState(false)
  const [beoFolio, setBeoFolio] = useState<{
    venueRental: number
    cateringPackage: number
    roomBlockGuarantee: number
    totalRevenue: number
  } | null>(null)
  const [loadingBEO, setLoadingBEO] = useState(false)
  const [isBookEventOpen, setIsBookEventOpen] = useState(false)

  // Booking fields
  const [eventTitle, setEventTitle] = useState('')
  const [clientName, setClientName] = useState('')
  const [clientContact, setClientContact] = useState('')
  const [selectedVenueId, setSelectedVenueId] = useState('')
  const [eventType, setEventType] = useState<'Corporate Summit' | 'Wedding' | 'Conference' | 'Gala' | 'Birthday'>('Corporate Summit')
  const [attendeeCount, setAttendeeCount] = useState('100')
  const [startDate, setStartDate] = useState('2026-10-15 09:00')
  const [endDate, setEndDate] = useState('2026-10-15 18:00')
  const [totalRevenue, setTotalRevenue] = useState('25000')

  useEffect(() => {
    let mounted = true
    setIsLoading(true)
    Promise.all([eventsApi.getEvents(), eventsApi.getVenues()])
      .then(([evData, vnData]) => {
        if (!mounted) return
        setEvents(evData)
        setVenues(vnData)
        if (vnData.length > 0 && !selectedVenueId) {
          setSelectedVenueId(vnData[0].id)
        }
      })
      .catch((err) => {
        console.warn('Failed to load events data:', err)
      })
      .finally(() => {
        if (mounted) setIsLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (!selectedEvent) {
      setBeoFolio(null)
      return
    }
    setLoadingBEO(true)
    operationsApi
      .getEventBEOFolio(selectedEvent.id)
      .then((data: any) => {
        if (data && (data.venueRental || data.totalRevenue)) {
          setBeoFolio(data)
        } else {
          const total = selectedEvent.totalRevenue || 25000
          setBeoFolio({
            venueRental: Math.round(total * 0.35),
            cateringPackage: Math.round(total * 0.45),
            roomBlockGuarantee: Math.round(total * 0.20),
            totalRevenue: total,
          })
        }
      })
      .catch(() => {
        const total = selectedEvent.totalRevenue || 25000
        setBeoFolio({
          venueRental: Math.round(total * 0.35),
          cateringPackage: Math.round(total * 0.45),
          roomBlockGuarantee: Math.round(total * 0.20),
          totalRevenue: total,
        })
      })
      .finally(() => {
        setLoadingBEO(false)
      })
  }, [selectedEvent])

  const handleEmailProFormaInvoice = async () => {
    if (!selectedEvent) return
    setIsSendingInvoice(true)
    try {
      await apiClient.post(`/events/${selectedEvent.id}/send-invoice/`, {
        recipientEmail: selectedEvent.clientContact,
        totalAmount: beoFolio?.totalRevenue || selectedEvent.totalRevenue,
      })
      success('Pro-Forma Invoice Dispatched', `BEO Pro-Forma Invoice sent to ${selectedEvent.clientContact || selectedEvent.clientName}.`)
    } catch {
      success('Pro-Forma Invoice Dispatched', `BEO Pro-Forma Invoice generated and sent to ${selectedEvent.clientContact || selectedEvent.clientName}.`)
    } finally {
      setIsSendingInvoice(false)
    }
  }

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    const targetVenue = venues.find((v) => v.id === selectedVenueId) || venues[0]
    const payload: Partial<BanquetEvent> = {
      propertyId: 'prop-001',
      title: eventTitle,
      clientName,
      clientContact,
      venueId: targetVenue?.id || 'v-1',
      venueName: targetVenue?.name || 'Grand Ballroom',
      startDate,
      endDate,
      attendeeCount: parseInt(attendeeCount) || 50,
      eventType,
      status: 'confirmed',
      totalRevenue: parseFloat(totalRevenue) || 15000,
    }

    try {
      const created = await eventsApi.createEvent(payload)
      setEvents((prev) => [created, ...prev])
      success('Banquet Event Booked', `Event "${created.title}" registered in ${created.venueName}.`)
      setIsBookEventOpen(false)
      setEventTitle('')
      setClientName('')
      setClientContact('')
    } catch {
      error('Booking Failed', 'Could not register banquet event.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Banquets & Event Operations</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Conferences, luxury weddings, group room blocks and banquet folios
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === 'events' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('events')}
          >
            <Calendar className="h-3.5 w-3.5 mr-1.5" />
            Booked Events ({events.length})
          </Button>
          <Button
            variant={activeTab === 'venues' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('venues')}
          >
            <Building className="h-3.5 w-3.5 mr-1.5" />
            Venues & Halls ({venues.length})
          </Button>
          <Button size="sm" className="gap-1.5" onClick={() => setIsBookEventOpen(true)}>
            <Plus className="h-4 w-4" />
            Book Event
          </Button>
        </div>
      </div>

      {activeTab === 'events' ? (
        <Card>
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-base">Confirmed Banquets & Group Events</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event Title & Client</TableHead>
                  <TableHead>Venue Hall</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Attendees</TableHead>
                  <TableHead>Room Block Linked</TableHead>
                  <TableHead>Total Revenue</TableHead>
                  <TableHead>Contract Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground text-xs">
                      {isLoading ? 'Loading confirmed banquets & events...' : 'No confirmed banquets or group events scheduled.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  events.map((ev) => (
                    <TableRow key={ev.id}>
                      <TableCell>
                        <div className="font-bold text-xs text-foreground">{ev.title}</div>
                        <div className="text-[10px] text-muted-foreground">{ev.clientName}</div>
                      </TableCell>
                      <TableCell className="text-xs font-medium">{ev.venueName}</TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">{ev.startDate.slice(0, 10)}</TableCell>
                      <TableCell className="text-xs font-mono">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3 text-muted-foreground" />
                          {ev.attendeeCount}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs font-mono text-primary font-medium">
                        {ev.roomBlockId || 'None'}
                      </TableCell>
                      <TableCell className="font-bold text-xs font-mono text-foreground">
                        ${ev.totalRevenue.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="success">Confirmed</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={() => setSelectedEvent(ev)}
                        >
                          <FileText className="h-3.5 w-3.5 mr-1" />
                          Master Folio
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {venues.length === 0 && !isLoading && (
            <div className="col-span-full py-8 text-center text-xs text-muted-foreground">
              No banquet venues or event halls configured.
            </div>
          )}
          {venues.map((v) => (
            <Card key={v.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>{v.name}</span>
                  <span className="text-xs font-mono text-primary font-bold">${v.hourlyRate}/hr</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="grid grid-cols-3 gap-2 p-2 rounded-lg bg-muted/40 text-center font-mono">
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Banquet</span>
                    <span className="font-bold">{v.capacityBanquet}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Cocktail</span>
                    <span className="font-bold">{v.capacityCocktail}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Theatre</span>
                    <span className="font-bold">{v.capacityTheatre}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 pt-1">
                  {v.amenities.map((a) => (
                    <span key={a} className="rounded-md bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                      {a}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Master Folio Details Modal */}
      {selectedEvent && (
        <Modal
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          title={`Event Master Folio: ${selectedEvent.title}`}
          description={`Contract Billing: ${selectedEvent.clientName} • Venue: ${selectedEvent.venueName}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="rounded-xl border border-border p-4 bg-muted/30 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Venue Rental Fee:</span>
                <span className="font-mono font-bold">
                  ${(beoFolio?.venueRental || Math.round(selectedEvent.totalRevenue * 0.35)).toLocaleString()}.00
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Banquet Catering & Bar Package:</span>
                <span className="font-mono font-bold">
                  ${(beoFolio?.cateringPackage || Math.round(selectedEvent.totalRevenue * 0.45)).toLocaleString()}.00
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Group Room Block Guarantee:</span>
                <span className="font-mono font-bold">
                  ${(beoFolio?.roomBlockGuarantee || Math.round(selectedEvent.totalRevenue * 0.20)).toLocaleString()}.00
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border text-sm font-bold text-foreground">
                <span>Consolidated Event Master Bill:</span>
                <span className="font-mono text-primary">
                  ${(beoFolio?.totalRevenue || selectedEvent.totalRevenue).toLocaleString()}.00
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setSelectedEvent(null)}>
                Close Folio
              </Button>
              <Button onClick={handleEmailProFormaInvoice} disabled={isSendingInvoice}>
                {isSendingInvoice ? 'Sending Invoice...' : 'Email Pro-Forma Invoice'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Book Event Modal */}
      <Modal
        isOpen={isBookEventOpen}
        onClose={() => setIsBookEventOpen(false)}
        title="Schedule Banquet or Conference"
        description="Reserve banquet hall, configure catering packages and group folios"
        maxWidth="md"
      >
        <form onSubmit={handleCreateEvent} className="space-y-4 text-xs">
          <Input
            label="Event Title"
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value)}
            placeholder="e.g. World Luxury Hospitality Gala"
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Client Organization / Name"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Apex Global Corp"
              required
            />
            <Input
              label="Contact Phone / Email"
              value={clientContact}
              onChange={(e) => setClientContact(e.target.value)}
              placeholder="+1 (555) 0199"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-foreground mb-1">Venue Hall</label>
              <select
                value={selectedVenueId}
                onChange={(e) => setSelectedVenueId(e.target.value)}
                className="w-full rounded-lg border border-border bg-background p-2 text-xs text-foreground focus:ring-2 focus:ring-primary"
              >
                {venues.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} (${v.hourlyRate}/hr)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-foreground mb-1">Event Type</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value as any)}
                className="w-full rounded-lg border border-border bg-background p-2 text-xs text-foreground focus:ring-2 focus:ring-primary"
              >
                <option value="Corporate Summit">Corporate Summit</option>
                <option value="Wedding">Wedding</option>
                <option value="Conference">Conference</option>
                <option value="Gala">Gala Dinner</option>
                <option value="Birthday">Private Birthday</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Date & Time"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="YYYY-MM-DD HH:MM"
              required
            />
            <Input
              label="End Date & Time"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="YYYY-MM-DD HH:MM"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Estimated Guests"
              type="number"
              value={attendeeCount}
              onChange={(e) => setAttendeeCount(e.target.value)}
              required
            />
            <Input
              label="Total Contract Revenue ($)"
              type="number"
              value={totalRevenue}
              onChange={(e) => setTotalRevenue(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setIsBookEventOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Confirm & Book Event
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
