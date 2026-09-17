import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { useToast } from '@/components/ui/toast'
import { HousekeepingTask, LostAndFoundItem } from '@/types'
import {
  Sparkles,
  CheckSquare,
  PackageSearch,
  User,
} from 'lucide-react'

const MOCK_TASKS: HousekeepingTask[] = [
  {
    id: 'hk-1',
    propertyId: 'prop-001',
    roomId: 'r-103',
    roomNumber: '103',
    roomTypeName: 'Garden Twin Deluxe',
    assignedAttendantName: 'Maria Santos',
    priority: 'high',
    status: 'dirty',
    scheduledTime: '11:00 AM',
    checklist: [
      { id: 'c1', task: 'Strip bed linen & replace with fresh Egyptian cotton', completed: false },
      { id: 'c2', task: 'Sanitize marble bathroom surfaces & replenish amenities', completed: false },
      { id: 'c3', task: 'Vacuum carpet & mop patio terrace', completed: false },
      { id: 'c4', task: 'Inspect & restock minibar refrigerator', completed: false },
    ],
  },
  {
    id: 'hk-2',
    propertyId: 'prop-001',
    roomId: 'r-104',
    roomNumber: '104',
    roomTypeName: 'Garden Twin Deluxe',
    assignedAttendantName: 'Carlos Gomez',
    priority: 'medium',
    status: 'cleaning_started',
    scheduledTime: '11:30 AM',
    checklist: [
      { id: 'c5', task: 'Strip bed linen & replace with fresh Egyptian cotton', completed: true },
      { id: 'c6', task: 'Sanitize marble bathroom surfaces & replenish amenities', completed: true },
      { id: 'c7', task: 'Vacuum carpet & mop patio terrace', completed: false },
      { id: 'c8', task: 'Inspect & restock minibar refrigerator', completed: false },
    ],
  },
  {
    id: 'hk-3',
    propertyId: 'prop-001',
    roomId: 'r-203',
    roomNumber: '203',
    roomTypeName: 'Ocean View Executive',
    assignedAttendantName: 'Maria Santos',
    priority: 'urgent',
    status: 'cleaning_completed',
    scheduledTime: '10:15 AM',
    checklist: [
      { id: 'c9', task: 'Full Executive Deep Clean Checklist', completed: true },
      { id: 'c10', task: 'VIP Welcome Fruit Basket and Floral Arrangement', completed: true },
    ],
  },
]

const MOCK_LOST_AND_FOUND: LostAndFoundItem[] = [
  {
    id: 'lf-1',
    propertyId: 'prop-001',
    itemDescription: 'Apple iPad Pro 11" with navy magnetic case',
    category: 'Electronics',
    foundLocation: 'Room 302 (Under nightstand)',
    foundDate: '2026-09-16',
    foundBy: 'Carlos Gomez',
    status: 'stored',
  },
  {
    id: 'lf-2',
    propertyId: 'prop-001',
    itemDescription: 'Tiffany & Co. Silver Cufflink pair',
    category: 'Jewelry',
    foundLocation: 'Main Lobby Restroom',
    foundDate: '2026-09-15',
    foundBy: 'Maria Santos',
    status: 'stored',
  },
]

export const HousekeepingHub: React.FC = () => {
  const { success } = useToast()
  const [tasks, setTasks] = useState<HousekeepingTask[]>(MOCK_TASKS)
  const [activeTab, setActiveTab] = useState<'tasks' | 'lost_found'>('tasks')
  const [selectedTask, setSelectedTask] = useState<HousekeepingTask | null>(null)
  const [isChecklistOpen, setIsChecklistOpen] = useState(false)

  // Toggle checklist item
  const toggleChecklistItem = (checkId: string) => {
    if (!selectedTask) return
    const updatedChecklist = selectedTask.checklist.map((item) =>
      item.id === checkId ? { ...item, completed: !item.completed } : item
    )
    const updated = { ...selectedTask, checklist: updatedChecklist }
    setSelectedTask(updated)
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
  }

  // Advance Task state
  const handleAdvanceState = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t
        let nextStatus = t.status
        if (t.status === 'dirty') nextStatus = 'cleaning_started'
        else if (t.status === 'cleaning_started') nextStatus = 'cleaning_completed'
        else if (t.status === 'cleaning_completed') nextStatus = 'inspection'
        else if (t.status === 'inspection') nextStatus = 'available'
        return { ...t, status: nextStatus }
      })
    )
    success('Housekeeping State Advanced', 'Status synchronized with PMS room matrix.')
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
            Lost & Found Vault (2)
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
                {tasks.map((task) => {
                  const completedCount = task.checklist.filter((c) => c.completed).length
                  const totalCount = task.checklist.length

                  return (
                    <TableRow key={task.id}>
                      <TableCell className="font-bold text-sm text-foreground font-mono">
                        Room {task.roomNumber}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{task.roomTypeName}</TableCell>
                      <TableCell className="text-xs">
                        <div className="flex items-center gap-1.5 font-medium text-foreground">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{task.assignedAttendantName}</span>
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
                          {task.priority.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-xs">
                          <div className="w-20 bg-muted rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-emerald-500 h-full rounded-full transition-all"
                              style={{ width: `${(completedCount / totalCount) * 100}%` }}
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
                            task.status === 'cleaning_completed'
                              ? 'success'
                              : task.status === 'cleaning_started'
                              ? 'warning'
                              : 'destructive'
                          }
                        >
                          {task.status.replace(/_/g, ' ').toUpperCase()}
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
                })}
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
                {MOCK_LOST_AND_FOUND.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-bold text-xs text-foreground">{item.itemDescription}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.category}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{item.foundLocation}</TableCell>
                    <TableCell className="text-xs font-mono">{item.foundDate}</TableCell>
                    <TableCell className="text-xs">{item.foundBy}</TableCell>
                    <TableCell>
                      <Badge variant="warning">In Secure Vault</Badge>
                    </TableCell>
                  </TableRow>
                ))}
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
          description={`Attendant: ${selectedTask.assignedAttendantName} • ${selectedTask.roomTypeName}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="space-y-2">
              {selectedTask.checklist.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleChecklistItem(item.id)}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => {}}
                    className="h-4 w-4 rounded border-border text-primary cursor-pointer"
                  />
                  <span className={`font-medium ${item.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {item.task}
                  </span>
                </div>
              ))}
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
