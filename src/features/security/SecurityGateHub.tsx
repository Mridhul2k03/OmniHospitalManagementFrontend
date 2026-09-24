import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { useToast } from '@/components/ui/toast'
import { GateVisitorLog } from '@/types'
import { securityApi } from '@/api/endpoints'
import { Plus, LogOut } from 'lucide-react'

export const SecurityGateHub: React.FC = () => {
  const { success, error } = useToast()
  const [logs, setLogs] = useState<GateVisitorLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [plate, setPlate] = useState('')
  const [dest, setDest] = useState('')
  const [purpose, setPurpose] = useState<'Guest' | 'Vendor / Delivery' | 'Contractor'>('Guest')

  useEffect(() => {
    let mounted = true
    setIsLoading(true)
    securityApi
      .getGateLogs()
      .then((data) => {
        if (mounted) setLogs(data)
      })
      .catch((err) => {
        console.warn('Failed to load gate logs:', err)
      })
      .finally(() => {
        if (mounted) setIsLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  const handleRegisterEntry = async (e: React.FormEvent) => {
    e.preventDefault()
    const newLogData: Partial<GateVisitorLog> = {
      propertyId: 'prop-001',
      visitorName: name,
      purpose,
      hostOrDestination: dest,
      entryTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      badgeNumber: `PASS-${Math.floor(1000 + Math.random() * 9000)}`,
      vehiclePlate: plate || undefined,
      status: 'inside',
    }

    try {
      const created = await securityApi.registerEntry(newLogData)
      setLogs((prev) => [created, ...prev])
      success('Visitor Pass Issued', `Badge ${created.badgeNumber} granted to ${name}. Barrier opened.`)
      setIsEntryModalOpen(false)
      setName('')
      setPlate('')
      setDest('')
    } catch (err) {
      error('Registration Failed', 'Unable to record visitor entry.')
    }
  }

  const handleLogExit = async (id: string) => {
    try {
      const updated = await securityApi.logExit(id)
      setLogs((prev) => prev.map((l) => (l.id === id ? updated : l)))
      success('Exit Verified & Logged', 'Visitor pass surrendered. Barrier opened for exit.')
    } catch (err) {
      error('Exit Log Failed', 'Unable to record visitor exit.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Gate Security & Access Control</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Main Guardhouse live checkpoint, vehicle barrier logs, and contractor pass management
          </p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setIsEntryModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Issue Visitor / Vehicle Pass
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b border-border">
          <CardTitle className="text-base flex items-center justify-between">
            <span>Live Perimeter Checkpoint Logs</span>
            <span className="text-xs font-normal text-muted-foreground">Gate 1: North Portico</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pass Badge #</TableHead>
                <TableHead>Visitor / Driver</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Vehicle Plate</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Entry Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground text-xs">
                    {isLoading ? 'Loading visitor logs...' : 'No visitor or gate activity recorded.'}
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono font-bold text-xs text-primary">{log.badgeNumber}</TableCell>
                    <TableCell className="font-semibold text-xs text-foreground">{log.visitorName}</TableCell>
                    <TableCell>
                      <Badge variant={log.purpose === 'Vendor / Delivery' ? 'warning' : 'info'}>{log.purpose}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{log.vehiclePlate || 'Pedestrian'}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{log.hostOrDestination}</TableCell>
                    <TableCell className="text-xs font-mono">{log.entryTime}</TableCell>
                    <TableCell>
                      <Badge variant={log.status === 'inside' ? 'success' : 'neutral'}>
                        {log.status === 'inside' ? 'On-Premises' : 'Exited'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {log.status === 'inside' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={() => handleLogExit(log.id)}
                        >
                          <LogOut className="h-3 w-3 mr-1" />
                          Log Exit
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Visitor Entry Modal */}
      <Modal
        isOpen={isEntryModalOpen}
        onClose={() => setIsEntryModalOpen(false)}
        title="Issue Gate Access Pass"
        description="Verify driver identification and vehicle plate before issuing entry pass"
        maxWidth="md"
      >
        <form onSubmit={handleRegisterEntry} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-foreground mb-1">Visitor / Driver Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Johnathan Smith"
              required
              className="w-full rounded-lg border border-border bg-background p-2 text-xs text-foreground focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-foreground mb-1">Pass Purpose</label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value as any)}
                className="w-full rounded-lg border border-border bg-background p-2 text-xs text-foreground focus:ring-2 focus:ring-primary"
              >
                <option value="Guest">Hotel Guest / Chauffeur</option>
                <option value="Vendor / Delivery">Vendor Food / Beverage Supply</option>
                <option value="Contractor">Engineering Contractor</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-foreground mb-1">Vehicle Plate (If Driving)</label>
              <input
                type="text"
                value={plate}
                onChange={(e) => setPlate(e.target.value)}
                placeholder="e.g. NY-982-XYZ"
                className="w-full rounded-lg border border-border bg-background p-2 text-xs text-foreground focus:ring-2 focus:ring-primary font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1">Destination / Host Room</label>
            <input
              type="text"
              value={dest}
              onChange={(e) => setDest(e.target.value)}
              placeholder="e.g. Room 501, Banquet Hall, Main Kitchen"
              required
              className="w-full rounded-lg border border-border bg-background p-2 text-xs text-foreground focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setIsEntryModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Issue Pass & Open Gate</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
