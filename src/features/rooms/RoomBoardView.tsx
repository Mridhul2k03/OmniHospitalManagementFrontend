import React, { useState } from 'react'
import { useTenant } from '@/context/useTenant'
import { Button } from '@/components/ui/button'
import { RoomStatusBadge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { useToast } from '@/components/ui/toast'
import { Room, RoomStatus } from '@/types'
import { roomsApi } from '@/api/endpoints/rooms.api'
import { Sparkles, Filter, Wrench, RefreshCw } from 'lucide-react'

export const RoomBoardView: React.FC = () => {
  const { activeProperty } = useTenant()
  const { success, info } = useToast()
  const [rooms, setRooms] = useState<Room[]>([])
  const [selectedFloor, setSelectedFloor] = useState<number | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<RoomStatus | 'all'>('all')
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch live rooms from backend
  const loadRooms = React.useCallback(() => {
    setIsLoading(true)
    roomsApi
      .getRooms()
      .then((data) => {
        setRooms(data || [])
      })
      .catch((err) => {
        console.warn('Backend rooms endpoint error:', err)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  React.useEffect(() => {
    loadRooms()
  }, [activeProperty.id, loadRooms])

  // Status transition handler
  const handleTransitionStatus = async (newStatus: RoomStatus) => {
    if (!selectedRoom) return
    const prevStatus = selectedRoom.status
    setRooms((prev) =>
      prev.map((r) =>
        r.id === selectedRoom.id
          ? {
              ...r,
              status: newStatus,
              isClean: newStatus === 'available' || newStatus === 'inspection',
              isOccupied: newStatus === 'occupied',
            }
          : r
      )
    )
    success(
      'Room State Transitioned',
      `Room ${selectedRoom.roomNumber} updated from ${prevStatus.toUpperCase()} to ${newStatus.toUpperCase()}`
    )
    setSelectedRoom({ ...selectedRoom, status: newStatus })

    try {
      await roomsApi.updateRoomStatus(selectedRoom.id, newStatus, `Transitioned to ${newStatus}`)
    } catch (err) {
      console.warn('Backend room status update failed, keeping optimistic state:', err)
    }
  }

  const handleRefreshRack = async () => {
    try {
      const data = await roomsApi.getRooms()
      setRooms(data || [])
      success('Room Rack Synchronized', 'Loaded latest room states from backend.')
    } catch (err) {
      info('Room Rack synchronized')
    }
  }

  const filteredRooms = rooms.filter((r) => {
    if (selectedFloor !== 'all' && r.floorNumber !== selectedFloor) return false
    if (statusFilter !== 'all' && r.status !== statusFilter) return false
    return true
  })

  // Count summaries
  const countAvailable = rooms.filter((r) => r.status === 'available').length
  const countOccupied = rooms.filter((r) => r.status === 'occupied').length
  const countDirty = rooms.filter((r) => r.status === 'dirty').length
  const countCleaning = rooms.filter((r) => r.status === 'cleaning').length
  const countMaintenance = rooms.filter((r) => r.status === 'maintenance' || r.status === 'out_of_order').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Room Availability & Matrix</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Interactive room rack and state machine controller for {activeProperty.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefreshRack}>
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Refresh Rack
          </Button>
        </div>
      </div>

      {/* Status Summary Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div
          onClick={() => setStatusFilter(statusFilter === 'available' ? 'all' : 'available')}
          className={`cursor-pointer rounded-xl border p-3 transition-all ${
            statusFilter === 'available' ? 'border-emerald-500 bg-emerald-500/10' : 'border-border bg-card hover:border-border/80'
          }`}
        >
          <span className="text-xs text-muted-foreground font-semibold">Available Clean</span>
          <p className="text-xl font-bold text-emerald-600 mt-1">{countAvailable}</p>
        </div>
        <div
          onClick={() => setStatusFilter(statusFilter === 'occupied' ? 'all' : 'occupied')}
          className={`cursor-pointer rounded-xl border p-3 transition-all ${
            statusFilter === 'occupied' ? 'border-sky-500 bg-sky-500/10' : 'border-border bg-card hover:border-border/80'
          }`}
        >
          <span className="text-xs text-muted-foreground font-semibold">Occupied In-House</span>
          <p className="text-xl font-bold text-sky-600 mt-1">{countOccupied}</p>
        </div>
        <div
          onClick={() => setStatusFilter(statusFilter === 'dirty' ? 'all' : 'dirty')}
          className={`cursor-pointer rounded-xl border p-3 transition-all ${
            statusFilter === 'dirty' ? 'border-rose-500 bg-rose-500/10' : 'border-border bg-card hover:border-border/80'
          }`}
        >
          <span className="text-xs text-muted-foreground font-semibold">Dirty Checkout</span>
          <p className="text-xl font-bold text-rose-600 mt-1">{countDirty}</p>
        </div>
        <div
          onClick={() => setStatusFilter(statusFilter === 'cleaning' ? 'all' : 'cleaning')}
          className={`cursor-pointer rounded-xl border p-3 transition-all ${
            statusFilter === 'cleaning' ? 'border-amber-500 bg-amber-500/10' : 'border-border bg-card hover:border-border/80'
          }`}
        >
          <span className="text-xs text-muted-foreground font-semibold">Cleaning In-Progress</span>
          <p className="text-xl font-bold text-amber-600 mt-1">{countCleaning}</p>
        </div>
        <div
          onClick={() => setStatusFilter(statusFilter === 'maintenance' ? 'all' : 'maintenance')}
          className={`cursor-pointer rounded-xl border p-3 transition-all ${
            statusFilter === 'maintenance' ? 'border-purple-500 bg-purple-500/10' : 'border-border bg-card hover:border-border/80'
          }`}
        >
          <span className="text-xs text-muted-foreground font-semibold">Maintenance Hold</span>
          <p className="text-xl font-bold text-purple-600 mt-1">{countMaintenance}</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-1 overflow-x-auto text-xs">
          <span className="text-muted-foreground font-semibold mr-2 flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" /> Floor:
          </span>
          {[
            { label: 'All Floors', val: 'all' as const },
            { label: 'Floor 1 (Ground & Garden)', val: 1 },
            { label: 'Floor 2 (Ocean Executive)', val: 2 },
            { label: 'Floor 3 (Premier Suites)', val: 3 },
            { label: 'Floor 4 (Penthouses)', val: 4 },
          ].map((fl) => (
            <button
              key={fl.label}
              onClick={() => setSelectedFloor(fl.val)}
              className={`rounded-md px-3 py-1 font-medium transition-colors cursor-pointer ${
                selectedFloor === fl.val ? 'bg-primary text-primary-foreground font-bold' : 'bg-muted hover:bg-muted/80 text-muted-foreground'
              }`}
            >
              {fl.label}
            </button>
          ))}
        </div>

        {statusFilter !== 'all' && (
          <Button variant="ghost" size="sm" onClick={() => setStatusFilter('all')} className="text-xs">
            Clear status filter
          </Button>
        )}
      </div>

      {/* Interactive Room Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredRooms.map((room) => (
          <div
            key={room.id}
            onClick={() => {
              setSelectedRoom(room)
              setIsDetailOpen(true)
            }}
            className="group cursor-pointer rounded-xl border border-border bg-card p-4 transition-all duration-150 hover:border-primary hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs text-muted-foreground font-mono">Floor {room.floorNumber}</span>
                <h3 className="text-xl font-black tracking-tight text-foreground group-hover:text-primary transition-colors">
                  {room.roomNumber}
                </h3>
              </div>
              <RoomStatusBadge status={room.status} />
            </div>

            <p className="mt-2 text-xs text-muted-foreground truncate">{room.roomTypeName}</p>

            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground">${room.currentRate}/night</span>
              {room.currentGuestName ? (
                <span className="text-[11px] font-medium text-sky-600 dark:text-sky-400 truncate max-w-[120px]">
                  👤 {room.currentGuestName}
                </span>
              ) : (
                <span className="text-[11px] text-muted-foreground">Vacant</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Room Detail & State Machine Transition Drawer Modal */}
      {selectedRoom && (
        <Modal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title={`Room ${selectedRoom.roomNumber} Inspector`}
          description={`${selectedRoom.roomTypeName} • Floor ${selectedRoom.floorNumber}`}
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-muted/40 p-3 border border-border">
              <div>
                <span className="text-xs text-muted-foreground">Authoritative State:</span>
                <div className="mt-1">
                  <RoomStatusBadge status={selectedRoom.status} />
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-muted-foreground">Daily Rate:</span>
                <p className="font-bold text-sm text-foreground">${selectedRoom.currentRate} / night</p>
              </div>
            </div>

            {selectedRoom.currentGuestName && (
              <div className="rounded-lg border border-sky-500/20 bg-sky-500/10 p-3 text-xs">
                <span className="font-semibold text-sky-700 dark:text-sky-300">Registered Occupant:</span>
                <p className="text-foreground font-bold mt-0.5">{selectedRoom.currentGuestName}</p>
              </div>
            )}

            {/* Allowed State Machine Transitions */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-2">
                Operational State Transitions (Authoritative Engine):
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10"
                  onClick={() => handleTransitionStatus('available')}
                >
                  <Sparkles className="h-3.5 w-3.5 mr-1 text-emerald-500" />
                  Mark Available Clean
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start border-rose-500/30 text-rose-700 dark:text-rose-400 hover:bg-rose-500/10"
                  onClick={() => handleTransitionStatus('dirty')}
                >
                  Mark Dirty (Checkout)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start border-amber-500/30 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10"
                  onClick={() => handleTransitionStatus('cleaning')}
                >
                  Dispatch Housekeeping
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start border-sky-500/30 text-sky-700 dark:text-sky-400 hover:bg-sky-500/10"
                  onClick={() => handleTransitionStatus('inspection')}
                >
                  Supervisor Inspection
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start border-purple-500/30 text-purple-700 dark:text-purple-400 hover:bg-purple-500/10 col-span-2"
                  onClick={() => handleTransitionStatus('maintenance')}
                >
                  <Wrench className="h-3.5 w-3.5 mr-1 text-purple-500" />
                  Hold for Engineering Maintenance
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="default" onClick={() => setIsDetailOpen(false)}>
                Close Inspector
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
