import React, { useState, useEffect, useCallback, useContext } from 'react'
import { TenantContext } from '@/context/TenantContext'
import { Button } from '@/components/ui/button'
import { Badge, RoomStatusBadge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { useToast } from '@/components/ui/toast'
import { HousekeepingTask, HousekeepingStatus, LostAndFoundItem } from '@/types'
import { housekeepingApi } from '@/api/endpoints/housekeeping.api'
import {
  Sparkles,
  Filter,
  Wrench,
  RefreshCw,
  Plus,
  User,
  CheckSquare,
  Search,
  PackageSearch,
  CheckCircle2,
  ShieldCheck,
  Clock,
} from 'lucide-react'

// Helper to calculate exact status-matched box shadow and borders (same design as Room Availability Matrix)
const getHousekeepingCardStyles = (status: HousekeepingStatus | string) => {
  const s = (status || '').toLowerCase()
  if (s === 'available' || s === 'cleaning_completed') {
    return {
      cardClass: 'border-emerald-500/50 hover:border-emerald-500 bg-card hover:bg-emerald-500/[0.04]',
      shadowStyle: {
        boxShadow: '0 4px 18px -2px rgba(16, 185, 129, 0.35), 0 2px 8px -1px rgba(16, 185, 129, 0.20)',
      },
      badgeStatus: 'available',
    }
  }
  if (s === 'cleaning_started' || s === 'cleaning_assigned' || s === 'in_progress') {
    return {
      cardClass: 'border-amber-500/50 hover:border-amber-500 bg-card hover:bg-amber-500/[0.04]',
      shadowStyle: {
        boxShadow: '0 4px 18px -2px rgba(245, 158, 11, 0.35), 0 2px 8px -1px rgba(245, 158, 11, 0.20)',
      },
      badgeStatus: 'cleaning',
    }
  }
  if (s === 'inspection') {
    return {
      cardClass: 'border-sky-500/50 hover:border-sky-500 bg-card hover:bg-sky-500/[0.04]',
      shadowStyle: {
        boxShadow: '0 4px 18px -2px rgba(14, 165, 233, 0.35), 0 2px 8px -1px rgba(14, 165, 233, 0.20)',
      },
      badgeStatus: 'inspection',
    }
  }
  if (s === 'maintenance' || s === 'out_of_order') {
    return {
      cardClass: 'border-purple-500/50 hover:border-purple-500 bg-card hover:bg-purple-500/[0.04]',
      shadowStyle: {
        boxShadow: '0 4px 18px -2px rgba(168, 85, 247, 0.35), 0 2px 8px -1px rgba(168, 85, 247, 0.20)',
      },
      badgeStatus: 'maintenance',
    }
  }
  // Default dirty checkout
  return {
    cardClass: 'border-rose-500/50 hover:border-rose-500 bg-card hover:bg-rose-500/[0.04]',
    shadowStyle: {
      boxShadow: '0 4px 18px -2px rgba(244, 63, 94, 0.35), 0 2px 8px -1px rgba(244, 63, 94, 0.20)',
    },
    badgeStatus: 'dirty',
  }
}

export const HousekeepingHub: React.FC = () => {
  const tenantContext = useContext(TenantContext)
  const activeProperty = tenantContext?.activeProperty || { id: 'prop-001', name: 'Grand Horizon Resort & Spa' }
  const { success, error: toastError, info } = useToast()

  // Main board state
  const [tasks, setTasks] = useState<HousekeepingTask[]>([])
  const [lostAndFound, setLostAndFound] = useState<LostAndFoundItem[]>([])
  const [activeTab, setActiveTab] = useState<'matrix' | 'lost_found'>('matrix')
  const [selectedFloor, setSelectedFloor] = useState<number | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<string | 'all'>('all')
  const [search, setSearch] = useState('')
  const [selectedTask, setSelectedTask] = useState<HousekeepingTask | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isChecklistOpen, setIsChecklistOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // New task form fields
  const [newRoomNumber, setNewRoomNumber] = useState('')
  const [newFloorNumber, setNewFloorNumber] = useState(1)
  const [newRoomType, setNewRoomType] = useState('Superior King Room')
  const [newAttendant, setNewAttendant] = useState('Maria Santos')
  const [newTaskType, setNewTaskType] = useState('turnover')
  const [newPriority, setNewPriority] = useState<HousekeepingTask['priority']>('medium')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const DEFAULT_CHECKLIST = [
    { id: 'c1', task: 'Replace bed linen with 400TC sheets', completed: true },
    { id: 'c2', task: 'Sanitize marble surfaces', completed: true },
    { id: 'c3', task: 'Strip bed linens & replace with fresh 400TC Egyptian cotton', completed: true },
    { id: 'c4', task: 'Disinfect bathroom vanities, shower enclosure & restock Hermès amenities', completed: true },
    { id: 'c5', task: 'Vacuum hardwood floors & wool carpets with HEPA filtration', completed: false },
    { id: 'c6', task: 'Restock complimentary crystal water carafes & Nespresso pods', completed: false },
    { id: 'c7', task: 'Inspect mini-bar seal, climate thermostat, and master room tablet', completed: false },
  ]

  // Map arbitrary backend status strings to valid HousekeepingStatus
  const normalizeStatus = (statusStr?: string): HousekeepingStatus => {
    if (!statusStr) return 'dirty'
    const s = statusStr.toLowerCase()
    if (s === 'in_progress') return 'cleaning_started'
    if (s === 'completed') return 'available'
    if (s === 'pending') return 'dirty'
    if (['dirty', 'cleaning_assigned', 'cleaning_started', 'cleaning_completed', 'inspection', 'available', 'maintenance'].includes(s)) {
      return s as HousekeepingStatus
    }
    return 'dirty'
  }

  // Derive floor number safely from room number string (e.g. "201" -> 2, "305" -> 3)
  const parseFloorNumber = (roomNumber: string, fallback?: number): number => {
    if (fallback) return fallback
    const digits = roomNumber.replace(/\D/g, '')
    if (digits.length >= 3) {
      const parsed = parseInt(digits.substring(0, digits.length - 2), 10)
      if (!isNaN(parsed) && parsed > 0 && parsed <= 10) return parsed
    }
    return 1
  }

  // Fetch live data from backend
  const loadData = useCallback(() => {
    setIsLoading(true)
    Promise.all([
      housekeepingApi.getTasks().catch(() => []),
      housekeepingApi.getLostAndFound().catch(() => []),
    ])
      .then(([rawTasks, rawItems]) => {
        const taskList = Array.isArray(rawTasks)
          ? rawTasks
          : ((rawTasks as unknown as { results?: HousekeepingTask[] })?.results || [])

        const normalizedTasks: HousekeepingTask[] = (taskList || []).filter(Boolean).map((t) => {
          const rawChecklist = Array.isArray(t.checklist) && t.checklist.length > 0 ? t.checklist : DEFAULT_CHECKLIST
          const roomNum = t.roomNumber || '101'
          const floorNum = parseFloorNumber(roomNum, (t as any).floorNumber)

          return {
            ...t,
            id: t.id || `hk-${Math.random().toString(36).substring(2, 7)}`,
            propertyId: t.propertyId || 'prop-001',
            roomId: t.roomId || `room-${roomNum}`,
            roomNumber: roomNum,
            floorNumber: floorNum,
            roomTypeName: t.roomTypeName || `Floor ${floorNum} Deluxe Room`,
            assignedAttendantName:
              t.assignedAttendantName || (t as any).assignedTo || 'Staff Member',
            assignedTo: t.assignedAttendantName || (t as any).assignedTo || 'Staff Member',
            priority: (['low', 'medium', 'high', 'urgent'].includes(t.priority) ? t.priority : 'medium') as HousekeepingTask['priority'],
            status: normalizeStatus(t.status),
            scheduledTime: t.scheduledTime || '10:00 AM',
            checklist: rawChecklist.map((c, idx) => ({
              id: c?.id || `c-${idx + 1}`,
              task: c?.task || 'Standard room turnover protocol',
              completed: Boolean(c?.completed),
            })),
          }
        })
        setTasks(normalizedTasks)

        const itemList = Array.isArray(rawItems)
          ? rawItems
          : ((rawItems as unknown as { results?: LostAndFoundItem[] })?.results || [])

        const normalizedItems: LostAndFoundItem[] = (itemList || []).filter(Boolean).map((item) => {
          const itemRecord = item as unknown as Record<string, unknown>
          return {
            ...item,
            id: item.id || `lf-${Math.random().toString(36).substring(2, 7)}`,
            propertyId: item.propertyId || 'prop-001',
            itemDescription: item.itemDescription || (itemRecord.item_description as string) || 'Unspecified Item',
            category: (item.category || 'Other') as LostAndFoundItem['category'],
            foundLocation: item.foundLocation || (itemRecord.locationFound as string) || 'Hotel Grounds',
            foundDate: item.foundDate || (itemRecord.dateFound as string) || new Date().toISOString().split('T')[0],
            foundBy: item.foundBy || (itemRecord.finderName as string) || 'Staff Member',
            status: (item.status || 'stored') as LostAndFoundItem['status'],
          }
        })
        setLostAndFound(normalizedItems)
      })
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData, activeProperty.id])

  // Advance task state machine
  const handleAdvanceState = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    let nextStatus: HousekeepingStatus = 'cleaning_started'
    if (task.status === 'dirty' || task.status === 'cleaning_assigned') {
      nextStatus = 'cleaning_started'
    } else if (task.status === 'cleaning_started') {
      nextStatus = 'inspection'
    } else if (task.status === 'inspection') {
      nextStatus = 'available'
    } else {
      nextStatus = 'dirty'
    }

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: nextStatus } : t))
    )
    success('Turnover Advanced', `Room ${task.roomNumber} advanced to ${nextStatus.toUpperCase()}`)

    if (selectedTask?.id === taskId) {
      setSelectedTask((prev) => (prev ? { ...prev, status: nextStatus } : null))
    }

    try {
      await housekeepingApi.updateTask(taskId, { status: nextStatus })
    } catch (err) {
      console.warn('Backend task update failed, keeping optimistic state:', err)
    }
  }

  // Direct status transition in detail modal
  const handleTransitionStatus = async (newStat: HousekeepingStatus) => {
    if (!selectedTask) return
    const prevStatus = selectedTask.status

    setTasks((prev) =>
      prev.map((t) => (t.id === selectedTask.id ? { ...t, status: newStat } : t))
    )
    setSelectedTask({ ...selectedTask, status: newStat })
    success(
      'Turnover State Transitioned',
      `Room ${selectedTask.roomNumber} updated from ${prevStatus.toUpperCase()} to ${newStat.toUpperCase()}`
    )

    try {
      await housekeepingApi.updateTask(selectedTask.id, { status: newStat })
    } catch (err) {
      console.warn('Backend task status update failed:', err)
    }
  }

  // Toggle checklist item
  const toggleChecklistItem = (itemId: string) => {
    if (!selectedTask) return
    const updatedChecklist = (selectedTask.checklist || []).map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    )
    const updatedTask = { ...selectedTask, checklist: updatedChecklist }
    setSelectedTask(updatedTask)
    setTasks((prev) => prev.map((t) => (t.id === selectedTask.id ? updatedTask : t)))
  }

  // Handle create task submission
  const handleCreateTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRoomNumber.trim()) {
      toastError('Validation Error', 'Please enter a valid room number.')
      return
    }

    setIsSubmitting(true)
    try {
      const created = await housekeepingApi.createTask({
        room_number: newRoomNumber.trim(),
        room_type: newRoomType,
        assigned_to: newAttendant,
        task_type: newTaskType,
        priority: newPriority,
        notes: `Turnover assigned to ${newAttendant}`,
      })

      const newTaskObj: HousekeepingTask = {
        id: (created as any).id || `hk-${Date.now()}`,
        propertyId: activeProperty.id,
        roomId: `room-${newRoomNumber.trim()}`,
        roomNumber: newRoomNumber.trim(),
        floorNumber: Number(newFloorNumber),
        roomTypeName: newRoomType,
        assignedAttendantName: newAttendant,
        assignedTo: newAttendant,
        priority: newPriority,
        status: 'dirty',
        scheduledTime: 'Now',
        checklist: DEFAULT_CHECKLIST,
      }

      setTasks((prev) => [newTaskObj, ...prev])
      success('Turnover Task Created', `Task for Room ${newRoomNumber.trim()} assigned to ${newAttendant}.`)
      setIsCreateModalOpen(false)
      setNewRoomNumber('')
      setNewFloorNumber(1)
    } catch (err) {
      toastError('Task Creation Failed', 'Could not create housekeeping task.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filter tasks by floor, status, and search query
  const filteredTasks = tasks.filter((t) => {
    if (selectedFloor !== 'all' && t.floorNumber !== selectedFloor) return false

    if (statusFilter !== 'all') {
      if (statusFilter === 'available' && t.status !== 'available' && t.status !== 'cleaning_completed') return false
      if (statusFilter === 'cleaning' && t.status !== 'cleaning_started' && t.status !== 'cleaning_assigned') return false
      if (statusFilter === 'dirty' && t.status !== 'dirty') return false
      if (statusFilter === 'inspection' && t.status !== 'inspection') return false
      if (statusFilter === 'maintenance' && t.status !== 'maintenance') return false
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      const matchRoom = t.roomNumber.toLowerCase().includes(q)
      const matchAttendant = (t.assignedAttendantName || t.assignedTo || '').toLowerCase().includes(q)
      const matchType = (t.roomTypeName || '').toLowerCase().includes(q)
      if (!matchRoom && !matchAttendant && !matchType) return false
    }

    return true
  })

  // Count summaries for status pills (exact same 5-card layout as Room Availability Matrix)
  const countAvailable = tasks.filter((t) => t.status === 'available' || t.status === 'cleaning_completed').length
  const countCleaning = tasks.filter((t) => t.status === 'cleaning_started' || t.status === 'cleaning_assigned').length
  const countDirty = tasks.filter((t) => t.status === 'dirty').length
  const countInspection = tasks.filter((t) => t.status === 'inspection').length
  const countMaintenance = tasks.filter((t) => t.status === 'maintenance').length

  return (
    <div className="space-y-6">
      {/* Top Header - Exact Same Layout as Room Availability & Matrix */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Housekeeping & Inspections</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Interactive housekeeping room rack and turnover state machine controller for {activeProperty.name}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center rounded-lg border border-border p-0.5 bg-muted/30">
            <button
              onClick={() => setActiveTab('matrix')}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'matrix'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Turnover Matrix
            </button>
            <button
              onClick={() => setActiveTab('lost_found')}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'lost_found'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Lost & Found ({lostAndFound.length})
            </button>
          </div>

          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Refresh Board
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Create Turnover Task
          </Button>
        </div>
      </div>

      {activeTab === 'matrix' ? (
        <>
          {/* Status Summary Pills - Exact Same 5-Card Layout as Room Availability */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div
              onClick={() => setStatusFilter(statusFilter === 'available' ? 'all' : 'available')}
              className={`cursor-pointer rounded-xl border p-3 transition-all ${
                statusFilter === 'available'
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-border bg-card hover:border-border/80'
              }`}
            >
              <span className="text-xs text-muted-foreground font-semibold">Available Clean</span>
              <p className="text-xl font-bold text-emerald-600 mt-1">{countAvailable}</p>
            </div>
            <div
              onClick={() => setStatusFilter(statusFilter === 'cleaning' ? 'all' : 'cleaning')}
              className={`cursor-pointer rounded-xl border p-3 transition-all ${
                statusFilter === 'cleaning'
                  ? 'border-amber-500 bg-amber-500/10'
                  : 'border-border bg-card hover:border-border/80'
              }`}
            >
              <span className="text-xs text-muted-foreground font-semibold">Cleaning In-Progress</span>
              <p className="text-xl font-bold text-amber-600 mt-1">{countCleaning}</p>
            </div>
            <div
              onClick={() => setStatusFilter(statusFilter === 'dirty' ? 'all' : 'dirty')}
              className={`cursor-pointer rounded-xl border p-3 transition-all ${
                statusFilter === 'dirty'
                  ? 'border-rose-500 bg-rose-500/10'
                  : 'border-border bg-card hover:border-border/80'
              }`}
            >
              <span className="text-xs text-muted-foreground font-semibold">Dirty Checkout</span>
              <p className="text-xl font-bold text-rose-600 mt-1">{countDirty}</p>
            </div>
            <div
              onClick={() => setStatusFilter(statusFilter === 'inspection' ? 'all' : 'inspection')}
              className={`cursor-pointer rounded-xl border p-3 transition-all ${
                statusFilter === 'inspection'
                  ? 'border-sky-500 bg-sky-500/10'
                  : 'border-border bg-card hover:border-border/80'
              }`}
            >
              <span className="text-xs text-muted-foreground font-semibold">Supervisor Inspection</span>
              <p className="text-xl font-bold text-sky-600 mt-1">{countInspection}</p>
            </div>
            <div
              onClick={() => setStatusFilter(statusFilter === 'maintenance' ? 'all' : 'maintenance')}
              className={`cursor-pointer rounded-xl border p-3 transition-all ${
                statusFilter === 'maintenance'
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-border bg-card hover:border-border/80'
              }`}
            >
              <span className="text-xs text-muted-foreground font-semibold">Maintenance Hold</span>
              <p className="text-xl font-bold text-purple-600 mt-1">{countMaintenance}</p>
            </div>
          </div>

          {/* Filter Bar - Exact Same Layout as Room Availability */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
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
                    selectedFloor === fl.val
                      ? 'bg-primary text-primary-foreground font-bold'
                      : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                  }`}
                >
                  {fl.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-48 sm:w-56">
                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search room or staff..."
                  className="w-full rounded-md border border-border bg-background py-1 pl-8 pr-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {statusFilter !== 'all' && (
                <Button variant="ghost" size="sm" onClick={() => setStatusFilter('all')} className="text-xs h-7">
                  Clear filter
                </Button>
              )}
            </div>
          </div>

          {/* Interactive Room Turnover Grid with Status-Matched Box Shadows */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredTasks.length === 0 ? (
              <div className="col-span-full py-12 text-center text-muted-foreground text-sm border border-dashed rounded-xl bg-card">
                No active housekeeping turnover tasks at this time.
              </div>
            ) : (
              filteredTasks.map((task) => {
                const colorInfo = getHousekeepingCardStyles(task.status)
                const checklistItems = Array.isArray(task.checklist) ? task.checklist : []
                const completedCount = checklistItems.filter((c) => Boolean(c?.completed)).length
                const totalCount = checklistItems.length

                return (
                  <div
                    key={task.id}
                    onClick={() => {
                      setSelectedTask(task)
                      setIsDetailOpen(true)
                    }}
                    style={colorInfo.shadowStyle}
                    className={`group cursor-pointer rounded-xl border p-4 transition-all duration-200 hover:-translate-y-0.5 ${colorInfo.cardClass}`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs text-muted-foreground font-mono">Floor {task.floorNumber || 1}</span>
                        <h3 className="text-xl font-black tracking-tight text-foreground group-hover:text-primary transition-colors">
                          Room {task.roomNumber}
                        </h3>
                      </div>
                      <RoomStatusBadge status={colorInfo.badgeStatus} />
                    </div>

                    <p className="mt-1.5 text-xs text-muted-foreground truncate">{task.roomTypeName || 'Deluxe Room'}</p>

                    <div className="mt-2.5 flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground flex items-center gap-1 truncate max-w-[140px]">
                        <User className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="truncate">{task.assignedAttendantName || task.assignedTo || 'Staff Member'}</span>
                      </span>
                      <Badge
                        variant={
                          task.priority === 'urgent'
                            ? 'destructive'
                            : task.priority === 'high'
                            ? 'warning'
                            : 'neutral'
                        }
                        className="text-[10px] px-1.5 py-0"
                      >
                        {(task.priority || 'medium').toUpperCase()}
                      </Badge>
                    </div>

                    {/* Bottom Action Row */}
                    <div className="mt-3 pt-3 border-t border-border/80 flex items-center justify-between gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs px-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedTask(task)
                          setIsChecklistOpen(true)
                        }}
                      >
                        <CheckSquare className="h-3 w-3 mr-1" />
                        Checklist ({completedCount}/{totalCount})
                      </Button>
                      <Button
                        size="sm"
                        className="h-7 text-xs px-2.5 bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAdvanceState(task.id)
                        }}
                      >
                        Advance
                      </Button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </>
      ) : (
        /* Lost & Found Vault View */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Lost & Found Vault Records</h2>
            <p className="text-xs text-muted-foreground">Authoritative secure custody catalog</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {lostAndFound.length === 0 ? (
              <div className="col-span-full py-12 text-center text-muted-foreground text-sm border border-dashed rounded-xl bg-card">
                No items currently logged in the Lost & Found vault.
              </div>
            ) : (
              lostAndFound.map((item) => (
                <div key={item.id} className="rounded-xl border border-border bg-card p-4 space-y-2.5 shadow-sm">
                  <div className="flex items-start justify-between">
                    <span className="font-bold text-sm text-foreground truncate">{item.itemDescription}</span>
                    <Badge variant="warning" className="text-[10px]">In Vault</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Category: {item.category}</p>
                  <div className="text-xs border-t border-border pt-2 flex items-center justify-between text-muted-foreground">
                    <span>📍 {item.foundLocation}</span>
                    <span>👤 {item.foundBy}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Room Detail & State Machine Transition Drawer Modal (Exact Same Design as Room Availability) */}
      {selectedTask && (
        <Modal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title={`Room ${selectedTask.roomNumber} Inspector & Turnover Control`}
          description={`${selectedTask.roomTypeName} • Floor ${selectedTask.floorNumber || 1}`}
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-muted/40 p-3 border border-border">
              <div>
                <span className="text-xs text-muted-foreground">Authoritative Turnover State:</span>
                <div className="mt-1">
                  <RoomStatusBadge status={getHousekeepingCardStyles(selectedTask.status).badgeStatus} />
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-muted-foreground">Assigned Attendant:</span>
                <p className="font-bold text-sm text-foreground">
                  {selectedTask.assignedAttendantName || selectedTask.assignedTo || 'Staff Member'}
                </p>
              </div>
            </div>

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
                  onClick={() => handleTransitionStatus('cleaning_started')}
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

            {/* Quick Checklist Launcher */}
            <div className="rounded-xl border border-border bg-card p-3 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-foreground block">Hygiene Inspection Checklist</span>
                <span className="text-[11px] text-muted-foreground">
                  {selectedTask.checklist?.filter((c) => c.completed).length || 0} of{' '}
                  {selectedTask.checklist?.length || 0} protocol items verified
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={() => {
                  setIsDetailOpen(false)
                  setIsChecklistOpen(true)
                }}
              >
                Open Checklist
              </Button>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="default" onClick={() => setIsDetailOpen(false)}>
                Close Inspector
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Hygiene & Inspection Checklist Modal */}
      {selectedTask && (
        <Modal
          isOpen={isChecklistOpen}
          onClose={() => setIsChecklistOpen(false)}
          title={`Hygiene & Inspection Checklist - Room ${selectedTask.roomNumber}`}
          description={`Attendant: ${selectedTask.assignedAttendantName || selectedTask.assignedTo || 'Staff Member'} • ${selectedTask.roomTypeName}`}
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="space-y-2 divide-y divide-border/60">
              {Array.isArray(selectedTask.checklist) &&
                selectedTask.checklist.map((item) => (
                  <label
                    key={item.id}
                    className="pt-2.5 first:pt-0 flex items-start gap-3 cursor-pointer select-none text-xs hover:text-foreground transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(item.completed)}
                      onChange={() => toggleChecklistItem(item.id)}
                      className="h-4 w-4 mt-0.5 rounded border-border text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span className={item.completed ? 'line-through text-muted-foreground' : 'font-medium text-foreground'}>
                      {item.task}
                    </span>
                  </label>
                ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <span className="text-xs text-muted-foreground">
                {(selectedTask.checklist || []).filter((c) => c.completed).length} of{' '}
                {(selectedTask.checklist || []).length} items completed
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsChecklistOpen(false)}
                >
                  Close
                </Button>
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => {
                    handleAdvanceState(selectedTask.id)
                    setIsChecklistOpen(false)
                  }}
                >
                  Sign-off & Advance
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Create Turnover Task Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Turnover Task"
        description={`Schedule a housekeeping assignment for ${activeProperty.name}`}
        maxWidth="md"
      >
        <form onSubmit={handleCreateTaskSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Room Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 101, 204"
                value={newRoomNumber}
                onChange={(e) => setNewRoomNumber(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Floor Number <span className="text-rose-500">*</span>
              </label>
              <select
                value={newFloorNumber}
                onChange={(e) => setNewFloorNumber(Number(e.target.value))}
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value={1}>Floor 1 (Ground & Garden)</option>
                <option value={2}>Floor 2 (Executive Level)</option>
                <option value={3}>Floor 3 (Premier Suites)</option>
                <option value={4}>Floor 4 (Penthouses)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Room Category</label>
              <select
                value={newRoomType}
                onChange={(e) => setNewRoomType(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="Superior King Room">Superior King Room</option>
                <option value="Ocean View Executive">Ocean View Executive</option>
                <option value="Presidential Suite">Presidential Suite</option>
                <option value="Garden Bungalow">Garden Bungalow</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Assigned Attendant</label>
              <select
                value={newAttendant}
                onChange={(e) => setNewAttendant(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="Maria Santos">Maria Santos</option>
                <option value="Carlos Ruiz">Carlos Ruiz</option>
                <option value="Amina Diallo">Amina Diallo</option>
                <option value="Liam O'Connor">Liam O'Connor</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Task Category</label>
              <select
                value={newTaskType}
                onChange={(e) => setNewTaskType(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="turnover">Full Departure Turnover</option>
                <option value="stayover">Stayover Daily Tidy</option>
                <option value="deep_clean">Deep Clean Sanitization</option>
                <option value="turndown">Evening Turndown Service</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Dispatch Priority</label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as HousekeepingTask['priority'])}
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="medium">Standard Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent (Immediate)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={isSubmitting}
              className="bg-primary text-primary-foreground"
            >
              {isSubmitting ? 'Creating...' : 'Dispatch Task'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
