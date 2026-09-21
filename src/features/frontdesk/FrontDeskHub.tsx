import React, { useState } from 'react'
import { useTenant } from '@/context/useTenant'
import { StatCard } from '@/components/ui/stat-card'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ReservationStatusBadge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { useToast } from '@/components/ui/toast'
import {
  Users,
  LogIn,
  LogOut,
  BedDouble,
  Sparkles,
  Wrench,
  DollarSign,
  Search,
  CheckCircle2,
  ArrowRightLeft,
  CalendarPlus,
  UserCheck,
} from 'lucide-react'
import { Reservation } from '@/types'
import { reservationsApi } from '@/api/endpoints/reservations.api'
import { roomsApi } from '@/api/endpoints/rooms.api'

// Mock Operational Reservations for the Active Property
const INITIAL_OPERATIONAL_RESERVATIONS: Reservation[] = [
  {
    id: 'res-101',
    code: 'RES-9011',
    propertyId: 'prop-001',
    propertyName: 'Grand Horizon Palace & Spa',
    guest: {
      id: 'g-001',
      firstName: 'Lord Sterling',
      lastName: 'Crawford',
      email: 'crawford@estates.uk',
      phone: '+44 20 7946 0912',
      idType: 'passport',
      idNumber: 'GB9821884',
      country: 'United Kingdom',
      vipStatus: 'platinum',
      totalStays: 8,
      totalSpend: 24500,
    },
    roomTypeId: 'rt-001',
    roomTypeName: 'Penthouse Royal Suite',
    roomId: 'rm-501',
    roomNumber: '501',
    checkInDate: '2026-09-17',
    checkOutDate: '2026-09-22',
    nightsCount: 5,
    adultsCount: 2,
    childrenCount: 0,
    status: 'confirmed',
    totalAmount: 4250,
    paidAmount: 2000,
    balanceAmount: 2250,
    channel: 'direct',
    createdDate: '2026-09-10',
  },
  {
    id: 'res-102',
    code: 'RES-9012',
    propertyId: 'prop-001',
    propertyName: 'Grand Horizon Palace & Spa',
    guest: {
      id: 'g-002',
      firstName: 'Elena',
      lastName: 'Rostova',
      email: 'e.rostova@techcorp.ch',
      phone: '+41 22 555 0192',
      idType: 'passport',
      idNumber: 'CH773192',
      country: 'Switzerland',
      vipStatus: 'gold',
      totalStays: 4,
      totalSpend: 11200,
    },
    roomTypeId: 'rt-002',
    roomTypeName: 'Executive Oceanfront King',
    roomId: 'rm-304',
    roomNumber: '304',
    checkInDate: '2026-09-17',
    checkOutDate: '2026-09-20',
    nightsCount: 3,
    adultsCount: 1,
    childrenCount: 0,
    status: 'confirmed',
    totalAmount: 1800,
    paidAmount: 1800,
    balanceAmount: 0,
    channel: 'corporate',
    createdDate: '2026-09-12',
  },
  {
    id: 'res-103',
    code: 'RES-8994',
    propertyId: 'prop-001',
    propertyName: 'Grand Horizon Palace & Spa',
    guest: {
      id: 'g-003',
      firstName: 'Dr. Michael',
      lastName: 'Thorne',
      email: 'mthorne@hopkins.edu',
      phone: '+1 (410) 555-0144',
      idType: 'driver_license',
      idNumber: 'MD482910',
      country: 'United States',
      vipStatus: 'standard',
      totalStays: 2,
      totalSpend: 3400,
    },
    roomTypeId: 'rt-003',
    roomTypeName: 'Deluxe Garden View King',
    roomId: 'rm-208',
    roomNumber: '208',
    checkInDate: '2026-09-14',
    checkOutDate: '2026-09-17',
    nightsCount: 3,
    adultsCount: 2,
    childrenCount: 1,
    status: 'in_house',
    totalAmount: 1350,
    paidAmount: 1350,
    balanceAmount: 0,
    channel: 'ota_booking',
    createdDate: '2026-09-01',
  },
  {
    id: 'res-104',
    code: 'RES-8998',
    propertyId: 'prop-001',
    propertyName: 'Grand Horizon Palace & Spa',
    guest: {
      id: 'g-004',
      firstName: 'Kenji',
      lastName: 'Takahashi',
      email: 'kenji@global-ventures.jp',
      phone: '+81 3 5555 0142',
      idType: 'passport',
      idNumber: 'JP441092',
      country: 'Japan',
      vipStatus: 'silver',
      totalStays: 3,
      totalSpend: 7800,
    },
    roomTypeId: 'rt-002',
    roomTypeName: 'Executive Oceanfront King',
    roomId: 'rm-412',
    roomNumber: '412',
    checkInDate: '2026-09-15',
    checkOutDate: '2026-09-17',
    nightsCount: 2,
    adultsCount: 1,
    childrenCount: 0,
    status: 'in_house',
    totalAmount: 1200,
    paidAmount: 800,
    balanceAmount: 400,
    channel: 'direct',
    createdDate: '2026-09-08',
  },
]

export const FrontDeskHub: React.FC = () => {
  const { activeProperty } = useTenant()
  const { success, info } = useToast()
  const [reservations, setReservations] = useState<Reservation[]>(INITIAL_OPERATIONAL_RESERVATIONS)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'arrivals' | 'departures' | 'in_house'>('arrivals')

  // Modals & Action States
  const [selectedRes, setSelectedRes] = useState<Reservation | null>(null)
  const [isCheckInOpen, setIsCheckInOpen] = useState(false)
  const [isTransferOpen, setIsTransferOpen] = useState(false)
  const [newRoomNumber, setNewRoomNumber] = useState('')
  const [confirmTransferOpen, setConfirmTransferOpen] = useState(false)

  // Fetch live operational reservations from backend
  React.useEffect(() => {
    reservationsApi
      .getReservations()
      .then((data) => {
        if (data && data.length > 0) {
          // Merge API items with initial items, prioritizing API items by code
          const apiCodes = new Set(data.map((r) => r.code))
          const nonOverlapping = INITIAL_OPERATIONAL_RESERVATIONS.filter((r) => !apiCodes.has(r.code))
          setReservations([...data, ...nonOverlapping])
        }
      })
      .catch((err) => {
        console.warn('Backend reservations unreachable, running with mock roster:', err)
      })
  }, [activeProperty.id])

  // Filter reservations based on active tab and query
  const filteredReservations = reservations.filter((r) => {
    const matchesQuery =
      r.guest.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.guest.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.roomNumber && r.roomNumber.includes(searchQuery))

    if (!matchesQuery) return false

    if (activeTab === 'arrivals') {
      return r.status === 'confirmed' || r.status === 'pending' || r.status === 'checked_in'
    }
    if (activeTab === 'departures') {
      return r.status === 'in_house'
    }
    return r.status === 'in_house'
  })

  // Check In Handler
  const handleCheckIn = async (resId: string) => {
    const target = reservations.find((r) => r.id === resId)
    setReservations((prev) =>
      prev.map((r) => (r.id === resId ? { ...r, status: 'in_house' } : r))
    )
    success(
      'Guest Successfully Checked In',
      `${target?.guest.firstName} ${target?.guest.lastName} has been checked into Room ${target?.roomNumber || 'Pending'}. Keycard encoded.`
    )
    setIsCheckInOpen(false)

    try {
      await reservationsApi.checkIn(resId, {
        assignedRoomId: target?.roomId || 'default-room',
      })
    } catch (err) {
      console.warn('Backend check-in sync error:', err)
    }
  }

  // Check Out Handler
  const handleCheckOut = async (resId: string) => {
    const target = reservations.find((r) => r.id === resId)
    setReservations((prev) =>
      prev.map((r) => (r.id === resId ? { ...r, status: 'checked_out' } : r))
    )
    success(
      'Guest Successfully Checked Out',
      `Folio for ${target?.guest.firstName} ${target?.guest.lastName} settled. Room ${target?.roomNumber} marked as DIRTY for Housekeeping inspection.`
    )

    try {
      await reservationsApi.checkOut(resId, {
        settlementMethod: 'CARD',
      })
    } catch (err) {
      console.warn('Backend check-out sync error:', err)
    }
  }

  // Room Transfer Handler
  const handleConfirmTransfer = async (reason?: string) => {
    if (!selectedRes || !newRoomNumber) return
    const oldRoom = selectedRes.roomNumber
    setReservations((prev) =>
      prev.map((r) => (r.id === selectedRes.id ? { ...r, roomNumber: newRoomNumber } : r))
    )
    success(
      'Room Transfer Executed',
      `Guest ${selectedRes.guest.lastName} transferred from Room ${oldRoom} to Room ${newRoomNumber}. Audit Reason: "${reason || 'Operational adjustment'}"`
    )
    setConfirmTransferOpen(false)
    setIsTransferOpen(false)

    if (selectedRes.roomId) {
      try {
        await roomsApi.transferRoom(selectedRes.roomId, newRoomNumber, reason || 'Operational adjustment')
      } catch (err) {
        console.warn('Backend transfer sync warning:', err)
      }
    }
    setSelectedRes(null)
  }

  const arrivalsCount = reservations.filter((r) => r.status === 'confirmed' || r.status === 'pending' || r.status === 'checked_in').length
  const departuresCount = reservations.filter((r) => r.status === 'in_house').length
  const inHouseCount = reservations.filter((r) => r.status === 'in_house').length

  return (
    <div className="space-y-6">
      {/* Property Operational Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Front Desk Operations</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Live occupancy, arrivals and room dispatch for <span className="font-semibold text-foreground">{activeProperty.name}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => info('Checking real-time PMS sync...')}>
            Sync PMS Roster
          </Button>
          <Button size="sm" className="gap-1.5" onClick={() => info('Opening Walk-in Guest Engine...')}>
            <CalendarPlus className="h-4 w-4" />
            New Walk-in Booking
          </Button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <StatCard title="Today Arrivals" value={arrivalsCount.toString()} subtitle="VIP & Standard" icon={<LogIn className="h-4 w-4" />} />
        <StatCard title="Today Departures" value={departuresCount.toString()} subtitle="Pending Checkout" icon={<LogOut className="h-4 w-4" />} />
        <StatCard title="In-House Guests" value={inHouseCount.toString()} subtitle="Active Roster" icon={<Users className="h-4 w-4" />} />
        <StatCard title="Available Rooms" value="18" subtitle="Clean & Ready" icon={<BedDouble className="h-4 w-4" />} />
        <StatCard title="Cleaning Queue" value="8" subtitle="Attendants On-Floor" icon={<Sparkles className="h-4 w-4" />} />
        <StatCard title="Maintenance" value="3" subtitle="HVAC / Plumbing" icon={<Wrench className="h-4 w-4" />} />
        <StatCard title="Today Revenue" value="$18,420" subtitle="ADR: $310" icon={<DollarSign className="h-4 w-4" />} />
      </div>

      {/* Main Operational Table Container */}
      <Card>
        <CardHeader className="pb-3 border-b border-border">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 rounded-lg bg-muted p-1 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('arrivals')}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition-colors cursor-pointer ${
                  activeTab === 'arrivals' ? 'bg-card text-foreground font-semibold shadow-xs' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Today's Arrivals</span>
                <span className="rounded-full bg-primary/10 px-1.5 py-0.2 text-[10px] font-bold text-primary">{arrivalsCount}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('departures')}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition-colors cursor-pointer ${
                  activeTab === 'departures' ? 'bg-card text-foreground font-semibold shadow-xs' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Today's Departures</span>
                <span className="rounded-full bg-muted-foreground/20 px-1.5 py-0.2 text-[10px] font-bold text-foreground">{departuresCount}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('in_house')}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition-colors cursor-pointer ${
                  activeTab === 'in_house' ? 'bg-card text-foreground font-semibold shadow-xs' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                <span>In-House Guests</span>
                <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.2 text-[10px] font-bold text-emerald-600">{inHouseCount}</span>
              </button>
            </div>

            {/* Quick Filter Search */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search guest, reservation code, room #..."
                className="w-full rounded-lg border border-border bg-background py-1.5 pl-8 pr-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reservation</TableHead>
                <TableHead>Guest Profile</TableHead>
                <TableHead>Room Allocation</TableHead>
                <TableHead>Dates & Stay</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Folio Balance</TableHead>
                <TableHead className="text-right">Front Desk Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReservations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground text-xs">
                    No active reservations matching this operational filter.
                  </TableCell>
                </TableRow>
              ) : (
                filteredReservations.map((res) => (
                  <TableRow key={res.id}>
                    <TableCell className="font-mono text-xs font-semibold text-primary">
                      {res.code}
                      <div className="text-[10px] text-muted-foreground uppercase font-sans font-medium">
                        {res.channel.replace(/_/g, ' ')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted font-bold text-xs">
                          {res.guest.firstName[0]}
                          {res.guest.lastName[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-xs text-foreground">
                            {res.guest.firstName} {res.guest.lastName}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                            <span>{res.guest.country}</span>
                            {res.guest.vipStatus && res.guest.vipStatus !== 'standard' && (
                              <span className="rounded-sm bg-amber-500/10 px-1 py-0.2 font-bold text-amber-600 dark:text-amber-400 uppercase">
                                {res.guest.vipStatus}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-semibold text-foreground">
                        Room {res.roomNumber || <span className="text-amber-600">Unassigned</span>}
                      </div>
                      <div className="text-[10px] text-muted-foreground truncate max-w-[150px]">
                        {res.roomTypeName}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      <div>
                        {res.checkInDate} → {res.checkOutDate}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {res.nightsCount} Nights • {res.adultsCount} Adults
                      </div>
                    </TableCell>
                    <TableCell>
                      <ReservationStatusBadge status={res.status} />
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-semibold text-foreground">
                        ${res.totalAmount.toLocaleString()}
                      </div>
                      {res.balanceAmount > 0 ? (
                        <div className="text-[10px] font-semibold text-rose-600">
                          Due: ${res.balanceAmount.toLocaleString()}
                        </div>
                      ) : (
                        <div className="text-[10px] font-semibold text-emerald-600">Paid in Full</div>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-1.5">
                      {res.status === 'confirmed' && (
                        <Button
                          size="sm"
                          className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => {
                            setSelectedRes(res)
                            setIsCheckInOpen(true)
                          }}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                          Check-In
                        </Button>
                      )}

                      {res.status === 'in_house' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => {
                              setSelectedRes(res)
                              setIsTransferOpen(true)
                            }}
                          >
                            <ArrowRightLeft className="h-3 w-3 mr-1" />
                            Transfer
                          </Button>
                          <Button
                            size="sm"
                            variant="default"
                            className="h-7 text-xs"
                            onClick={() => handleCheckOut(res.id)}
                          >
                            <LogOut className="h-3 w-3 mr-1" />
                            Check-Out
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Check-In Modal Flow */}
      {selectedRes && (
        <Modal
          isOpen={isCheckInOpen}
          onClose={() => setIsCheckInOpen(false)}
          title={`Check-In Guest: ${selectedRes.guest.firstName} ${selectedRes.guest.lastName}`}
          description={`Reservation Ref: ${selectedRes.code} • ${selectedRes.roomTypeName}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4 rounded-xl border border-border p-4 bg-muted/30">
              <div>
                <span className="text-muted-foreground font-semibold">Identification Verified:</span>
                <p className="font-mono text-foreground font-bold mt-0.5">
                  {selectedRes.guest.idType.toUpperCase()}: {selectedRes.guest.idNumber}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground font-semibold">Assigned Room:</span>
                <p className="font-bold text-foreground mt-0.5 text-sm">Room {selectedRes.roomNumber}</p>
              </div>
              <div>
                <span className="text-muted-foreground font-semibold">Payment Status:</span>
                <p className="font-semibold text-foreground mt-0.5">
                  {selectedRes.balanceAmount === 0 ? 'Prepaid (Settled)' : `$${selectedRes.balanceAmount} balance due`}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground font-semibold">Keycard Station:</span>
                <p className="text-emerald-600 font-bold mt-0.5">Ready for Encoder #1</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setIsCheckInOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={() => handleCheckIn(selectedRes.id)}
              >
                <UserCheck className="h-4 w-4 mr-1.5" />
                Issue Keys & Confirm Check-In
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Room Transfer Prompt Modal */}
      {selectedRes && (
        <Modal
          isOpen={isTransferOpen}
          onClose={() => setIsTransferOpen(false)}
          title="Room Transfer Request"
          description={`Current: Room ${selectedRes.roomNumber} (${selectedRes.guest.lastName})`}
          maxWidth="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Select Destination Room (Available & Clean)
              </label>
              <select
                value={newRoomNumber}
                onChange={(e) => setNewRoomNumber(e.target.value)}
                className="w-full rounded-lg border border-border bg-background p-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select destination room...</option>
                <option value="305">Room 305 - Executive King (Floor 3)</option>
                <option value="306">Room 306 - Executive King (Floor 3)</option>
                <option value="402">Room 402 - Ocean View Suite (Floor 4)</option>
                <option value="502">Room 502 - Royal Penthouse (Floor 5)</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsTransferOpen(false)}>
                Cancel
              </Button>
              <Button
                disabled={!newRoomNumber}
                onClick={() => {
                  setConfirmTransferOpen(true)
                }}
              >
                Proceed to Transfer Authorization
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* High-Impact Action Confirmation Dialog for Room Transfer */}
      <ConfirmationDialog
        isOpen={confirmTransferOpen}
        onClose={() => setConfirmTransferOpen(false)}
        onConfirm={handleConfirmTransfer}
        title="Authorize Room Transfer"
        message={`Transferring guest ${selectedRes?.guest.lastName} from Room ${selectedRes?.roomNumber} to Room ${newRoomNumber} will mark Room ${selectedRes?.roomNumber} as DIRTY and post a transfer audit event to the master folio.`}
        confirmText="Execute Transfer"
        requireReason={true}
        reasonLabel="Mandatory Audit Reason (e.g. Guest Upgrade, Maintenance Issue)"
      />
    </div>
  )
}
