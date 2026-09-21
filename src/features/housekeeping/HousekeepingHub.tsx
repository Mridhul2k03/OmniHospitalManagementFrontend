import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { useToast } from '@/components/ui/toast'
import { HousekeepingTask, LostAndFoundItem } from '@/types'
import { housekeepingApi } from '@/api/endpoints/housekeeping.api'
import {
  Sparkles,
  CheckSquare,
  PackageSearch,
  User,
} from 'lucide-react'

export const HousekeepingHub: React.FC = () => {
  const { success } = useToast()
  const [tasks, setTasks] = useState<HousekeepingTask[]>([])
  const [lostAndFound, setLostAndFound] = useState<LostAndFoundItem[]>([])
  const [activeTab, setActiveTab] = useState<'tasks' | 'lost_found'>('tasks')
  const [selectedTask, setSelectedTask] = useState<HousekeepingTask | null>(null)
  const [isChecklistOpen, setIsChecklistOpen] = useState(false)

  const DEFAULT_CHECKLIST = [
    { id: 'c1', task: 'Strip bed linens & replace with fresh 400TC Egyptian cotton', completed: true },
    { id: 'c2', task: 'Disinfect bathroom vanities, shower enclosure & restock Hermès amenities', completed: true },
    { id: 'c3', task: 'Vacuum hardwood floors & wool carpets with HEPA filtration', completed: false },
    { id: 'c4', task: 'Restock complimentary crystal water carafes & Nespresso pods', completed: false },
    { id: 'c5', task: 'Inspect mini-bar seal, climate thermostat, and master room tablet', completed: false },
  ]

  // Map arbitrary backend status strings to valid HousekeepingStatus
  const normalizeStatus = (statusStr?: string): HousekeepingStatus => {
    if (!statusStr) return 'dirty'
    const s = statusStr.toLowerCase()
    if (s === 'in_progress') return 'cleaning_started'
    if (s === 'completed') return 'available'
    if (s === 'pending') return 'dirty'
    if (['dirty', 'cleaning_assigned', 'cleaning_started', 'cleaning_completed', 'inspection', 'available'].includes(s)) {
      return s as HousekeepingStatus
    }
    return 'dirty'
  }

  // Fetch live data from backend
  React.useEffect(() => {
    housekeepingApi
      .getTasks()
      .then((rawTasks) => {
        const taskList = Array.isArray(rawTasks)
          ? rawTasks
          : ((rawTasks as unknown as { results?: HousekeepingTask[] })?.results || [])

        const normalized: HousekeepingTask[] = (taskList || []).filter(Boolean).map((t) => {
          const rawChecklist = Array.isArray(t.checklist) && t.checklist.length > 0 ? t.checklist : DEFAULT_CHECKLIST
          return {
            ...t,
            id: t.id || `hk-${Math.random().toString(36).substring(2, 7)}`,
            propertyId: t.propertyId || 'prop-001',
            roomId: t.roomId || `room-${t.roomNumber || '101'}`,
            roomNumber: t.roomNumber || '101',
            roomTypeName: t.roomTypeName || `Floor ${(t as unknown as { floorNumber?: number }).floorNumber || 1} Deluxe Room`,
            assignedAttendantName:
              t.assignedAttendantName || (t as unknown as { assignedTo?: string }).assignedTo || 'Staff Member',
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
        setTasks(normalized)
      })
      .catch((err) => {
        console.warn('Backend housekeeping tasks unreachable:', err)
      })

    housekeepingApi
      .getLostAndFound()
      .then((rawItems) => {
        const itemList = Array.isArray(rawItems)
          ? rawItems
          : ((rawItems as unknown as { results?: LostAndFoundItem[] })?.results || [])

        const normalized: LostAndFoundItem[] = (itemList || []).filter(Boolean).map((item) => {
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
        setLostAndFound(normalized)
      })
      .catch((err) => {
        console.warn('Backend lost-and-found unreachable:', err)
      })
  }, [])

  // Toggle checklist item with local state and backend synchronization
  const toggleChecklistItem = async (checkId: string) => {
    if (!selectedTask) return
    const currentList = Array.isArray(selectedTask.checklist) ? selectedTask.checklist : []
    const updatedChecklist = currentList.map((item) =>
      item.id === checkId ? { ...item, completed: !item.completed } : item
    )
    const updated = { ...selectedTask, checklist: updatedChecklist }
    setSelectedTask(updated)
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))

    try {
      const checklistPayload: Record<string, boolean> = {}
      updatedChecklist.forEach((item) => {
        checklistPayload[item.id] = item.completed
      })
      await housekeepingApi.submitChecklist(selectedTask.id, checklistPayload)
    } catch (err) {
      console.warn('Could not sync checklist with backend:', err)
    }
  }

  // Advance Task state through standard PMS lifecycle
  const handleAdvanceState = async (taskId: string) => {
    const target = tasks.find((t) => t.id === taskId)
    if (!target) return

    let nextStatus: HousekeepingStatus = target.status
    if (target.status === 'dirty') nextStatus = 'cleaning_started'
    else if (target.status === 'cleaning_started') nextStatus = 'cleaning_completed'
    else if (target.status === 'cleaning_completed') nextStatus = 'inspection'
    else if (target.status === 'inspection') nextStatus = 'available'
    else if (target.status === 'available') nextStatus = 'dirty'
    else nextStatus = 'cleaning_started'

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: nextStatus } : t))
    )
    if (selectedTask?.id === taskId) {
      setSelectedTask((prev) => (prev ? { ...prev, status: nextStatus } : null))
    }

    try {
      await housekeepingApi.updateTaskStatus(taskId, nextStatus)
    } catch (err) {
      console.warn('Could not persist status to server:', err)
    }

    success(
      'Housekeeping State Advanced',
      `Room ${target.roomNumber} status is now ${nextStatus.replace(/_/g, ' ').toUpperCase()}.`
    )
    setIsChecklistOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Housekeeping & Inspections</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Turnover task queue, hygiene checklists, and property Lost & Found vault
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === 'tasks' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('tasks')}
          >
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            Room Turnover Board
          </Button>
          <Button
            variant={activeTab === 'lost_found' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('lost_found')}
          >
            <PackageSearch className="h-3.5 w-3.5 mr-1.5" />
            Lost & Found Vault ({lostAndFound.length})
          </Button>
        </div>
      </div>

      {activeTab === 'tasks' ? (
        <Card>
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-base">Attendant Task Assignment Queue</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room #</TableHead>
                  <TableHead>Room Type</TableHead>
                  <TableHead>Assigned Attendant</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Checklist Progress</TableHead>
                  <TableHead>Current Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">
                      No active housekeeping turnover tasks at this time.
                    </TableCell>
                  </TableRow>
                ) : (
                  tasks.map((task) => {
                    const checklistItems = Array.isArray(task.checklist) ? task.checklist : []
                    const completedCount = checklistItems.filter((c) => Boolean(c?.completed)).length
                    const totalCount = checklistItems.length
                    const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

                    return (
                      <TableRow key={task.id}>
                        <TableCell className="font-bold text-sm text-foreground font-mono">
                          Room {task.roomNumber}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{task.roomTypeName || 'Deluxe Room'}</TableCell>
                        <TableCell className="text-xs">
                          <div className="flex items-center gap-1.5 font-medium text-foreground">
                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{task.assignedAttendantName || 'Staff Member'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              task.priority === 'urgent'
                                ? 'destructive'
                                : task.priority === 'high'
                                ? 'warning'
                                : 'neutral'
                            }
                          >
                            {(task.priority || 'medium').toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-xs">
                            <div className="w-20 bg-muted rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-emerald-500 h-full rounded-full transition-all"
                                style={{ width: `${progressPct}%` }}
                              />
                            </div>
                            <span className="font-mono text-muted-foreground">
                              {completedCount}/{totalCount}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              task.status === 'cleaning_completed' || task.status === 'available'
                                ? 'success'
                                : task.status === 'cleaning_started' || task.status === 'inspection'
                                ? 'warning'
                                : 'destructive'
                            }
                          >
                            {(task.status || 'dirty').replace(/_/g, ' ').toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => {
                              setSelectedTask(task)
                              setIsChecklistOpen(true)
                            }}
                          >
                            <CheckSquare className="h-3.5 w-3.5 mr-1" />
                            Checklist
                          </Button>
                          <Button
                            size="sm"
                            className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => handleAdvanceState(task.id)}
                          >
                            Advance
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-base">Lost & Found Vault Ledger</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Discovery Location</TableHead>
                  <TableHead>Logged Date</TableHead>
                  <TableHead>Logged By</TableHead>
                  <TableHead>Vault Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lostAndFound.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-sm">
                      No items currently recorded in the Lost & Found vault.
                    </TableCell>
                  </TableRow>
                ) : (
                  lostAndFound.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-bold text-xs text-foreground">{item.itemDescription || 'Unspecified Item'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.category || 'Other'}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{item.foundLocation || 'Hotel Grounds'}</TableCell>
                      <TableCell className="text-xs font-mono">{item.foundDate || 'N/A'}</TableCell>
                      <TableCell className="text-xs">{item.foundBy || 'Staff'}</TableCell>
                      <TableCell>
                        <Badge variant="warning">In Secure Vault</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Checklist Inspection Modal */}
      {selectedTask && (
        <Modal
          isOpen={isChecklistOpen}
          onClose={() => setIsChecklistOpen(false)}
          title={`Hygiene & Inspection Checklist - Room ${selectedTask.roomNumber}`}
          description={`Attendant: ${selectedTask.assignedAttendantName || 'Staff Member'} • ${selectedTask.roomTypeName || 'Deluxe Room'}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="space-y-2">
              {(selectedTask.checklist || []).map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleChecklistItem(item.id)}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={Boolean(item.completed)}
                    onChange={() => toggleChecklistItem(item.id)}
                    className="h-4 w-4 rounded border-border text-primary cursor-pointer"
                  />
                  <span className={`font-medium ${item.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {item.task}
                  </span>
                </div>
              ))}
              {(!selectedTask.checklist || selectedTask.checklist.length === 0) && (
                <div className="p-4 text-center text-muted-foreground text-xs">
                  No checklist items available for this room turnover.
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <Button variant="outline" onClick={() => setIsChecklistOpen(false)}>
                Close Checklist
              </Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={() => handleAdvanceState(selectedTask.id)}
              >
                Verify & Advance State
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
