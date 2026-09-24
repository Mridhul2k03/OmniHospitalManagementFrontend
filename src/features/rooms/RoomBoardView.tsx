import React, { useState, useEffect, useCallback } from 'react'
import { useTenant } from '@/context/useTenant'
import { useAuth } from '@/auth/useAuth'
import { Button } from '@/components/ui/button'
import { RoomStatusBadge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { useToast } from '@/components/ui/toast'
import { Room, RoomStatus, RoomType, Floor } from '@/types'
import { roomsApi } from '@/api/endpoints/rooms.api'
import { propertiesApi } from '@/api/endpoints/properties.api'
import { HotelSelectionsManager } from '@/features/admin/HotelSelectionsManager'
import {
  Sparkles,
  Filter,
  Wrench,
  RefreshCw,
  Plus,
  BedDouble,
  Shield,
  DollarSign,
  Layers,
  Sliders,
} from 'lucide-react'

// Helper to calculate exact status-matched box shadow and borders
const getRoomStatusColorInfo = (status: RoomStatus | string) => {
  switch ((status || '').toLowerCase()) {
    case 'available':
      return {
        cardClass: 'border-emerald-500/50 hover:border-emerald-500 bg-card hover:bg-emerald-500/[0.04]',
        shadowStyle: {
          boxShadow: '0 4px 18px -2px rgba(16, 185, 129, 0.35), 0 2px 8px -1px rgba(16, 185, 129, 0.20)',
        },
        badgeColor: 'text-emerald-600 dark:text-emerald-400',
      }
    case 'occupied':
      return {
        cardClass: 'border-sky-500/50 hover:border-sky-500 bg-card hover:bg-sky-500/[0.04]',
        shadowStyle: {
          boxShadow: '0 4px 18px -2px rgba(14, 165, 233, 0.35), 0 2px 8px -1px rgba(14, 165, 233, 0.20)',
        },
        badgeColor: 'text-sky-600 dark:text-sky-400',
      }
    case 'dirty':
      return {
        cardClass: 'border-rose-500/50 hover:border-rose-500 bg-card hover:bg-rose-500/[0.04]',
        shadowStyle: {
          boxShadow: '0 4px 18px -2px rgba(244, 63, 94, 0.35), 0 2px 8px -1px rgba(244, 63, 94, 0.20)',
        },
        badgeColor: 'text-rose-600 dark:text-rose-400',
      }
    case 'cleaning':
      return {
        cardClass: 'border-amber-500/50 hover:border-amber-500 bg-card hover:bg-amber-500/[0.04]',
        shadowStyle: {
          boxShadow: '0 4px 18px -2px rgba(245, 158, 11, 0.35), 0 2px 8px -1px rgba(245, 158, 11, 0.20)',
        },
        badgeColor: 'text-amber-600 dark:text-amber-400',
      }
    case 'maintenance':
    case 'out_of_order':
      return {
        cardClass: 'border-purple-500/50 hover:border-purple-500 bg-card hover:bg-purple-500/[0.04]',
        shadowStyle: {
          boxShadow: '0 4px 18px -2px rgba(168, 85, 247, 0.35), 0 2px 8px -1px rgba(168, 85, 247, 0.20)',
        },
        badgeColor: 'text-purple-600 dark:text-purple-400',
      }
    case 'reserved':
      return {
        cardClass: 'border-violet-500/50 hover:border-violet-500 bg-card hover:bg-violet-500/[0.04]',
        shadowStyle: {
          boxShadow: '0 4px 18px -2px rgba(139, 92, 246, 0.35), 0 2px 8px -1px rgba(139, 92, 246, 0.20)',
        },
        badgeColor: 'text-violet-600 dark:text-violet-400',
      }
    case 'inspection':
      return {
        cardClass: 'border-indigo-500/50 hover:border-indigo-500 bg-card hover:bg-indigo-500/[0.04]',
        shadowStyle: {
          boxShadow: '0 4px 18px -2px rgba(99, 102, 241, 0.35), 0 2px 8px -1px rgba(99, 102, 241, 0.20)',
        },
        badgeColor: 'text-indigo-600 dark:text-indigo-400',
      }
    default:
      return {
        cardClass: 'border-border hover:border-primary/50 bg-card',
        shadowStyle: {
          boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.08)',
        },
        badgeColor: 'text-muted-foreground',
      }
  }
}

const DEFAULT_ROOM_TYPES = [
  { name: 'Ocean Executive King', rate: 340 },
  { name: 'Deluxe Premier Suite', rate: 280 },
  { name: 'Presidential Grand Suite', rate: 650 },
  { name: 'Garden Villa Bungalow', rate: 420 },
  { name: 'Standard Deluxe Room', rate: 210 },
]

export const RoomBoardView: React.FC = () => {
  const { activeProperty } = useTenant()
  const { hasRole, hasPermission } = useAuth()
  const { success, error, info } = useToast()

  // Room state
  const [rooms, setRooms] = useState<Room[]>([])
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [floors, setFloors] = useState<Floor[]>([])
  const [selectedFloor, setSelectedFloor] = useState<number | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<RoomStatus | 'all'>('all')
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Create Room modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isCreatingRoom, setIsCreatingRoom] = useState(false)
  const [newRoomNumber, setNewRoomNumber] = useState('')
  const [newFloorNumber, setNewFloorNumber] = useState(1)
  const [newRoomTypeName, setNewRoomTypeName] = useState('Deluxe Premier Suite')
  const [newRate, setNewRate] = useState(280)
  const [newStatus, setNewStatus] = useState<RoomStatus>('available')
  const [newMaxOccupancy, setNewMaxOccupancy] = useState(2)

  // Admin Master Options & Quick Creation Modals
  const [isManageOptionsOpen, setIsManageOptionsOpen] = useState(false)
  const [isQuickFloorOpen, setIsQuickFloorOpen] = useState(false)
  const [quickFloorNum, setQuickFloorNum] = useState<number>(6)
  const [quickFloorName, setQuickFloorName] = useState('')
  const [isQuickTypeOpen, setIsQuickTypeOpen] = useState(false)
  const [quickTypeName, setQuickTypeName] = useState('')
  const [quickTypeRate, setQuickTypeRate] = useState(300)
  const [quickTypeOccupancy, setQuickTypeOccupancy] = useState(2)

  // RBAC Permission Guard: only authorized managers or admins can create rooms and manage options
  const canCreateRoom =
    hasRole([
      'super_admin',
      'org_admin',
      'property_manager',
      'president',
      'vice_president',
      'ceo',
      'operations_director',
    ]) ||
    hasPermission('room:create') ||
    hasPermission('rooms:create') ||
    hasPermission('property:manage') ||
    hasPermission('*')

  // Fetch live rooms from backend
  const loadRooms = useCallback(() => {
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

  // Fetch live room types
  const loadRoomTypes = useCallback(() => {
    roomsApi
      .getRoomTypes()
      .then((types) => {
        if (types && types.length > 0) {
          setRoomTypes(types)
        }
      })
      .catch(() => {
        // Fallback gracefully
      })
  }, [])

  // Fetch live physical floors
  const loadFloors = useCallback(() => {
    propertiesApi
      .getFloors()
      .then((data) => {
        if (data && data.length > 0) {
          setFloors(data)
        }
      })
      .catch(() => {
        // Fallback gracefully
      })
  }, [])

  const loadAllData = useCallback(() => {
    loadRooms()
    loadRoomTypes()
    loadFloors()
  }, [loadRooms, loadRoomTypes, loadFloors])

  useEffect(() => {
    loadAllData()
  }, [activeProperty.id, loadAllData])

  // Status transition handler
  const handleTransitionStatus = async (newStat: RoomStatus) => {
    if (!selectedRoom) return
    const prevStatus = selectedRoom.status
    setRooms((prev) =>
      prev.map((r) =>
        r.id === selectedRoom.id
          ? {
              ...r,
              status: newStat,
              isClean: newStat === 'available' || newStat === 'inspection',
              isOccupied: newStat === 'occupied',
            }
          : r
      )
    )
    success(
      'Room State Transitioned',
      `Room ${selectedRoom.roomNumber} updated from ${prevStatus.toUpperCase()} to ${newStat.toUpperCase()}`
    )
    setSelectedRoom({ ...selectedRoom, status: newStat })

    try {
      await roomsApi.updateRoomStatus(selectedRoom.id, newStat, `Transitioned to ${newStat}`)
    } catch (err) {
      console.warn('Backend room status update failed, keeping optimistic state:', err)
    }
  }

  const handleRefreshRack = async () => {
    try {
      const data = await roomsApi.getRooms()
      setRooms(data || [])
      loadRoomTypes()
      loadFloors()
      success('Room Rack Synchronized', 'Loaded latest room states and master options from backend.')
    } catch (err) {
      info('Room Rack synchronized')
    }
  }

  // Create room handler
  const handleCreateRoomSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRoomNumber.trim()) {
      error('Validation Error', 'Please specify a room number.')
      return
    }

    // Check duplicate room number
    const duplicate = rooms.some(
      (r) => r.roomNumber.toLowerCase() === newRoomNumber.trim().toLowerCase()
    )
    if (duplicate) {
      error('Duplicate Room', `Room ${newRoomNumber.trim()} already exists on this property.`)
      return
    }

    setIsCreatingRoom(true)
    try {
      const selectedTypeObj = roomTypes.find((t) => t.name === newRoomTypeName)
      const created = await roomsApi.createRoom({
        roomNumber: newRoomNumber.trim(),
        roomTypeId: selectedTypeObj?.id,
        roomTypeName: newRoomTypeName,
        floorNumber: Number(newFloorNumber),
        currentRate: Number(newRate),
        status: newStatus,
      })

      const completeNewRoom: Room = {
        id: created.id || `room-${Date.now()}`,
        propertyId: activeProperty.id,
        roomNumber: newRoomNumber.trim(),
        floorNumber: Number(newFloorNumber),
        roomTypeId: selectedTypeObj?.id || 'rt-standard',
        roomTypeName: newRoomTypeName,
        currentRate: Number(newRate),
        status: newStatus,
        isClean: newStatus === 'available' || newStatus === 'inspection',
        isOccupied: newStatus === 'occupied',
        isSmoking: false,
        features: ['High-Speed Wi-Fi', 'Smart TV', 'Climate Control'],
        maxOccupancy: Number(newMaxOccupancy),
      }

      setRooms((prev) => [completeNewRoom, ...prev])
      success('Room Unit Created', `Room ${newRoomNumber.trim()} (${newRoomTypeName}) added successfully to rack.`)
      setIsCreateModalOpen(false)
      setNewRoomNumber('')
      setNewRate(280)
      setNewFloorNumber(1)
    } catch (err: any) {
      error('Creation Failed', err?.response?.data?.detail || err?.message || 'Could not create room unit.')
    } finally {
      setIsCreatingRoom(false)
    }
  }

  // Quick Add Floor
  const handleQuickAddFloorSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!quickFloorName.trim()) return
    try {
      const created = await propertiesApi.createFloor({
        floor_number: Number(quickFloorNum),
        name: quickFloorName.trim(),
      })
      setFloors((prev) => [...prev, created])
      setNewFloorNumber(created.number ?? created.floorNumber ?? 1)
      success('Floor Added', `Added ${created.name} and selected for new room.`)
      setIsQuickFloorOpen(false)
      setQuickFloorName('')
    } catch (err) {
      error('Floor Creation Failed', 'Could not create floor level.')
    }
  }

  // Quick Add Room Type
  const handleQuickAddTypeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!quickTypeName.trim()) return
    try {
      const created = await roomsApi.createRoomType({
        name: quickTypeName.trim(),
        basePrice: Number(quickTypeRate),
        maxOccupancy: Number(quickTypeOccupancy),
        propertyId: activeProperty.id,
      })
      setRoomTypes((prev) => [...prev, created])
      setNewRoomTypeName(created.name)
      setNewRate(created.basePrice)
      setNewMaxOccupancy(created.maxOccupancy)
      success('Room Category Added', `Added ${created.name} and selected for new room.`)
      setIsQuickTypeOpen(false)
      setQuickTypeName('')
    } catch (err) {
      error('Category Creation Failed', 'Could not create room category.')
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

          {/* Manage Selections / Options Button - Accessible to Admins */}
          {canCreateRoom && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsManageOptionsOpen(true)}
              className="gap-1.5"
            >
              <Sliders className="h-3.5 w-3.5" />
              Manage Options
            </Button>
          )}

          {/* Create Room Button - Displayed and enabled only for users with required permissions */}
          {canCreateRoom && (
            <Button
              variant="default"
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Create Room
            </Button>
          )}
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
            ...(floors.length > 0
              ? floors.map((fl) => ({ label: fl.name, val: fl.number ?? fl.floorNumber ?? 1 }))
              : [
                  { label: 'Floor 1 (Ground & Garden)', val: 1 },
                  { label: 'Floor 2 (Ocean Executive)', val: 2 },
                  { label: 'Floor 3 (Premier Suites)', val: 3 },
                  { label: 'Floor 4 (Penthouses)', val: 4 },
                ]),
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

      {/* Interactive Room Grid with Status-Matched Box Shadows */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredRooms.map((room) => {
          const colorInfo = getRoomStatusColorInfo(room.status)
          return (
            <div
              key={room.id}
              onClick={() => {
                setSelectedRoom(room)
                setIsDetailOpen(true)
              }}
              style={colorInfo.shadowStyle}
              className={`group cursor-pointer rounded-xl border p-4 transition-all duration-200 hover:-translate-y-0.5 ${colorInfo.cardClass}`}
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

              <div className="mt-3 pt-3 border-t border-border/80 flex items-center justify-between text-xs">
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
          )
        })}
      </div>

      {/* Create Room Modal (Guarded by Permission) */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Hotel Room"
        description={`Deploy a new room or suite unit to ${activeProperty.name}`}
        maxWidth="lg"
      >
        <form onSubmit={handleCreateRoomSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Room Number / Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 105, 302, Penthouse-1"
                value={newRoomNumber}
                onChange={(e) => setNewRoomNumber(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-foreground">
                  Floor Number <span className="text-rose-500">*</span>
                </label>
                {canCreateRoom && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuickFloorNum(floors.length + 1)
                      setQuickFloorName(`Floor ${floors.length + 1}`)
                      setIsQuickFloorOpen(true)
                    }}
                    className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <Plus className="h-3 w-3" /> Add Floor
                  </button>
                )}
              </div>
              <select
                value={newFloorNumber}
                onChange={(e) => setNewFloorNumber(Number(e.target.value))}
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {floors.length > 0
                  ? floors.map((f) => (
                      <option key={f.id} value={f.floorNumber}>
                        {f.name} (Level {f.floorNumber})
                      </option>
                    ))
                  : [
                      { num: 1, label: 'Floor 1 (Ground & Garden)' },
                      { num: 2, label: 'Floor 2 (Executive Level)' },
                      { num: 3, label: 'Floor 3 (Premier Suites)' },
                      { num: 4, label: 'Floor 4 (Penthouses)' },
                      { num: 5, label: 'Floor 5 (Villas & Residences)' },
                    ].map((fl) => (
                      <option key={fl.num} value={fl.num}>
                        {fl.label}
                      </option>
                    ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-foreground">
                  Room Category / Type <span className="text-rose-500">*</span>
                </label>
                {canCreateRoom && (
                  <button
                    type="button"
                    onClick={() => setIsQuickTypeOpen(true)}
                    className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <Plus className="h-3 w-3" /> Add Category
                  </button>
                )}
              </div>
              <select
                value={newRoomTypeName}
                onChange={(e) => {
                  setNewRoomTypeName(e.target.value)
                  const match = roomTypes.find((t) => t.name === e.target.value)
                  if (match) setNewRate(match.basePrice)
                  else {
                    const defaultMatch = DEFAULT_ROOM_TYPES.find((t) => t.name === e.target.value)
                    if (defaultMatch) setNewRate(defaultMatch.rate)
                  }
                }}
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {roomTypes.length > 0
                  ? roomTypes.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name} (${t.basePrice}/night)
                      </option>
                    ))
                  : DEFAULT_ROOM_TYPES.map((t) => (
                      <option key={t.name} value={t.name}>
                        {t.name} (${t.rate}/night)
                      </option>
                    ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Nightly Rate ($ USD) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="number"
                  min="1"
                  required
                  value={newRate}
                  onChange={(e) => setNewRate(Number(e.target.value))}
                  className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Initial Operational Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as RoomStatus)}
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="available">Available (Clean & Ready)</option>
                <option value="cleaning">Cleaning (In Turnover)</option>
                <option value="dirty">Dirty (Needs Turnover)</option>
                <option value="maintenance">Maintenance Hold</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Max Guests Occupancy
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={newMaxOccupancy}
                onChange={(e) => setNewMaxOccupancy(Number(e.target.value))}
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="rounded-lg bg-muted/40 p-3 border border-border flex items-center gap-2.5 text-xs text-muted-foreground">
            <Shield className="h-4 w-4 text-primary shrink-0" />
            <span>
              Authorized administrator action. Unit partition will immediately update the PMS inventory rack and live reservation engine.
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
              disabled={isCreatingRoom}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={isCreatingRoom}
              className="bg-primary text-primary-foreground"
            >
              {isCreatingRoom ? 'Creating Unit...' : 'Create Room Unit'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Quick Add Floor Modal */}
      <Modal
        isOpen={isQuickFloorOpen}
        onClose={() => setIsQuickFloorOpen(false)}
        title="Add New Floor Level"
        description="Expand physical floor capacity for the hotel"
        maxWidth="sm"
      >
        <form onSubmit={handleQuickAddFloorSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Floor Number <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              required
              value={quickFloorNum}
              onChange={(e) => {
                const n = Number(e.target.value)
                setQuickFloorNum(n)
                if (!quickFloorName || quickFloorName.startsWith('Floor ')) {
                  setQuickFloorName(`Floor ${n}`)
                }
              }}
              className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Floor Display Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Floor 6 (Skyline Suites)"
              value={quickFloorName}
              onChange={(e) => setQuickFloorName(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setIsQuickFloorOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary text-primary-foreground">
              Save Floor
            </Button>
          </div>
        </form>
      </Modal>

      {/* Quick Add Category Modal */}
      <Modal
        isOpen={isQuickTypeOpen}
        onClose={() => setIsQuickTypeOpen(false)}
        title="Add New Room Category"
        description="Register a new room type tier into hotel inventory"
        maxWidth="sm"
      >
        <form onSubmit={handleQuickAddTypeSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Category Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Presidential Ocean Villa"
              value={quickTypeName}
              onChange={(e) => setQuickTypeName(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Base Rate ($ USD) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={quickTypeRate}
                onChange={(e) => setQuickTypeRate(Number(e.target.value))}
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Max Guests</label>
              <input
                type="number"
                min="1"
                max="10"
                value={quickTypeOccupancy}
                onChange={(e) => setQuickTypeOccupancy(Number(e.target.value))}
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setIsQuickTypeOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary text-primary-foreground">
              Save Category
            </Button>
          </div>
        </form>
      </Modal>

      {/* Hotel Selections & Options Manager Modal */}
      <Modal
        isOpen={isManageOptionsOpen}
        onClose={() => setIsManageOptionsOpen(false)}
        title="Hotel Master Selections & Inventory Architecture"
        description="Create and manage physical room types, floors, amenities, and wings"
        maxWidth="xl"
      >
        <div className="py-2">
          <HotelSelectionsManager onDataChanged={loadAllData} />
        </div>
      </Modal>

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
