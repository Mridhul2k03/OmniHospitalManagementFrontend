import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { useToast } from '@/components/ui/toast'
import { BanquetEvent, BanquetVenue } from '@/types'
import { Calendar, Users, Building, FileText } from 'lucide-react'

const MOCK_VENUES: BanquetVenue[] = [
  { id: 'v-1', propertyId: 'prop-001', name: 'The Grand Ballroom', capacityCocktail: 450, capacityBanquet: 300, capacityTheatre: 500, hourlyRate: 1200, amenities: ['Stage Lighting', 'Surround Sound', 'Bridal Suite'] },
  { id: 'v-2', propertyId: 'prop-001', name: 'Azure Pavilion & Lawn', capacityCocktail: 250, capacityBanquet: 180, capacityTheatre: 220, hourlyRate: 850, amenities: ['Ocean View', 'Outdoor Lawn', 'Fire Pit'] },
  { id: 'v-3', propertyId: 'prop-001', name: 'Executive Boardroom Alpha', capacityCocktail: 40, capacityBanquet: 24, capacityTheatre: 30, hourlyRate: 350, amenities: ['Video Conference 4K', 'Smart Screen', 'Executive Catering'] },
]

const MOCK_EVENTS: BanquetEvent[] = [
  {
    id: 'ev-1',
    propertyId: 'prop-001',
    title: 'Global Fintech Leaders Summit 2026',
    clientName: 'Apex Capital Partners',
    clientContact: 'Sarah Jenkins (+1 415 555 0199)',
    venueId: 'v-1',
    venueName: 'The Grand Ballroom',
    startDate: '2026-09-24 08:00',
    endDate: '2026-09-26 18:00',
    attendeeCount: 280,
    eventType: 'Corporate Summit',
    status: 'confirmed',
    totalRevenue: 68000,
    roomBlockId: 'rb-901 (45 Deluxe Suites Blocked)',
  },
  {
    id: 'ev-2',
    propertyId: 'prop-001',
    title: 'Vance & Montgomery Royal Wedding',
    clientName: 'Eleanor Vance',
    clientContact: 'vance.family@invest.com',
    venueId: 'v-2',
    venueName: 'Azure Pavilion & Lawn',
    startDate: '2026-10-02 15:00',
    endDate: '2026-10-03 01:00',
    attendeeCount: 160,
    eventType: 'Wedding',
    status: 'confirmed',
    totalRevenue: 42500,
    roomBlockId: 'rb-902 (20 Ocean Suites Blocked)',
  },
]

export const EventsHub: React.FC = () => {
  const { success } = useToast()
  const [events] = useState<BanquetEvent[]>(MOCK_EVENTS)
  const [venues] = useState<BanquetVenue[]>(MOCK_VENUES)
  const [activeTab, setActiveTab] = useState<'events' | 'venues'>('events')
  const [selectedEvent, setSelectedEvent] = useState<BanquetEvent | null>(null)

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
                {events.map((ev) => (
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
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <span className="font-mono font-bold">$18,000.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Banquet Catering & Bar Package:</span>
                <span className="font-mono font-bold">$34,500.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Group Room Block Guarantee:</span>
                <span className="font-mono font-bold">$15,500.00</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border text-sm font-bold text-foreground">
                <span>Consolidated Event Master Bill:</span>
                <span className="font-mono text-primary">${selectedEvent.totalRevenue.toLocaleString()}.00</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setSelectedEvent(null)}>
                Close Folio
              </Button>
              <Button onClick={() => success('Event Pro-Forma Invoice Generated & Sent')}>
                Email Pro-Forma Invoice
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
