import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/toast'
import { OTAChannelConnection } from '@/types'
import { Globe2, RefreshCw, ArrowRightLeft } from 'lucide-react'

const MOCK_CHANNELS: OTAChannelConnection[] = [
  { id: 'ch-1', propertyId: 'prop-001', channelName: 'Booking.com', status: 'synced', lastSyncAt: '2026-09-17 21:12', syncedRoomTypesCount: 6, pendingErrorsCount: 0 },
  { id: 'ch-2', propertyId: 'prop-001', channelName: 'Expedia', status: 'synced', lastSyncAt: '2026-09-17 21:10', syncedRoomTypesCount: 6, pendingErrorsCount: 0 },
  { id: 'ch-3', propertyId: 'prop-001', channelName: 'Agoda', status: 'synced', lastSyncAt: '2026-09-17 21:05', syncedRoomTypesCount: 5, pendingErrorsCount: 0 },
  { id: 'ch-4', propertyId: 'prop-001', channelName: 'Airbnb', status: 'synced', lastSyncAt: '2026-09-17 20:45', syncedRoomTypesCount: 3, pendingErrorsCount: 0 },
]

export const ChannelsHub: React.FC = () => {
  const { success } = useToast()
  const [channels, setChannels] = useState<OTAChannelConnection[]>(MOCK_CHANNELS)
  const [isSyncing, setIsSyncing] = useState(false)

  const handleTriggerGlobalSync = () => {
    setIsSyncing(true)
    setTimeout(() => {
      setIsSyncing(false)
      setChannels((prev) =>
        prev.map((c) => ({
          ...c,
          status: 'synced',
          lastSyncAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
        }))
      )
      success('Two-Way Channel Sync Completed', 'Inventory availability and rate parity pushed to all connected OTAs.')
    }, 1200)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">OTA Channels & Distribution Manager</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Two-way inventory sync, rate parity monitoring, and reservation webhook listeners
          </p>
        </div>
        <Button size="sm" onClick={handleTriggerGlobalSync} isLoading={isSyncing} className="gap-1.5">
          <RefreshCw className="h-4 w-4" />
          Sync All Channels Now
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b border-border">
          <CardTitle className="text-base">Active Channel Connections</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Channel Provider</TableHead>
                <TableHead>Health State</TableHead>
                <TableHead>Mapped Room Categories</TableHead>
                <TableHead>Last Successful Sync</TableHead>
                <TableHead>Pending Errors</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {channels.map((ch) => (
                <TableRow key={ch.id}>
                  <TableCell className="font-bold text-xs text-foreground flex items-center gap-2">
                    <Globe2 className="h-4 w-4 text-primary" />
                    <span>{ch.channelName}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={ch.status === 'synced' ? 'success' : 'warning'}>
                      {ch.status === 'synced' ? 'Healthy & Connected' : 'Syncing'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{ch.syncedRoomTypesCount} Room Types</TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono">{ch.lastSyncAt}</TableCell>
                  <TableCell>
                    <span className="text-xs font-mono font-bold text-emerald-600">0 Errors</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => success(`${ch.channelName} mapping catalog verified`)}
                    >
                      <ArrowRightLeft className="h-3 w-3 mr-1" />
                      View Mappings
                    </Button>
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
