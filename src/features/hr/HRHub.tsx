import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/toast'
import { apiClient } from '@/api/client/axios'
import { Clock } from 'lucide-react'

interface StaffEmployee {
  id: string
  name: string
  department: 'Front Office' | 'Housekeeping' | 'Culinary & F&B' | 'Engineering' | 'Security'
  role: string
  shift: 'Morning (07:00 - 15:30)' | 'Evening (15:00 - 23:30)' | 'Night Audit (23:00 - 07:30)'
  clockInTime?: string
  status: 'on_duty' | 'break' | 'absent' | 'off_duty'
}

export const HRHub: React.FC = () => {
  const { success } = useToast()
  const [staff, setStaff] = useState<StaffEmployee[]>([])
  const [hasClockedIn, setHasClockedIn] = useState(false)

  // Fetch live staff from backend
  React.useEffect(() => {
    apiClient.get('/hr/staff/').then((res) => {
      if (Array.isArray(res.data)) setStaff(res.data)
    }).catch((err) => {
      console.warn('Backend HR staff unreachable:', err)
    })
  }, [])

  const handlePunchClock = async () => {
    const nextState = !hasClockedIn
    setHasClockedIn(nextState)
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    if (nextState) {
      success('Shift Clock-In Registered', `Digital biometric punch logged at ${timeStr}`)
    } else {
      success('Shift Clock-Out Registered', `Shift hours finalized and transmitted to payroll.`)
    }

    if (staff.length > 0) {
      const targetId = staff[0].id
      setStaff((prev) =>
        prev.map((s, idx) =>
          idx === 0
            ? { ...s, status: nextState ? 'on_duty' : 'off_duty', clockInTime: nextState ? timeStr : undefined }
            : s
        )
      )
      try {
        await apiClient.patch(`/hr/staff/${targetId}/`, {
          status: nextState ? 'on_duty' : 'off_duty',
          clockInTime: nextState ? timeStr : null,
        })
      } catch (err) {
        console.warn('Backend HR punch sync error:', err)
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Human Resources & Attendance</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Shift scheduling, biometric clock terminal, department rosters, and leave authorizations
          </p>
        </div>
        <Button
          size="sm"
          className={hasClockedIn ? 'bg-rose-600 hover:bg-rose-700 gap-1.5' : 'bg-emerald-600 hover:bg-emerald-700 gap-1.5'}
          onClick={handlePunchClock}
        >
          <Clock className="h-4 w-4" />
          {hasClockedIn ? 'Punch Out Shift' : 'Web Clock-In Now'}
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b border-border">
          <CardTitle className="text-base">Today's Active On-Duty Shift Roster</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff Member</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Role Title</TableHead>
                <TableHead>Assigned Shift</TableHead>
                <TableHead>Biometric Punch</TableHead>
                <TableHead>Duty Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell className="font-bold text-xs text-foreground">{emp.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{emp.department}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{emp.role}</TableCell>
                  <TableCell className="text-xs font-mono">{emp.shift}</TableCell>
                  <TableCell className="text-xs font-mono text-emerald-600 font-semibold">
                    {emp.clockInTime}
                  </TableCell>
                  <TableCell>
                    <Badge variant="success">On Duty</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
