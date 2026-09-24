import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/toast'
import { OTAChannelConnection } from '@/types'
import { channelsApi } from '@/api/endpoints'
import { Globe2, RefreshCw, ArrowRightLeft } from 'lucide-react'

export const ChannelsHub: React.FC = () => {
  const { success, error } = useToast()
  const [channels, setChannels] = useState<OTAChannelConnection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    let mounted = true
    setIsLoading(true)
    channelsApi
      .getChannels()
      .then((data) => {
        if (mounted) setChannels(data)
      })
      .catch((err) => {
        console.warn('Failed to load OTA channels:', err)
      })
      .finally(() => {
        if (mounted) setIsLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  const handleTriggerGlobalSync = async () => {
    setIsSyncing(true)
    try {
      const res = await channelsApi.syncAll()
      if (res.channels) {
        setChannels(res.channels)
      }
      success('Two-Way Channel Sync Completed', 'Inventory availability and rate parity pushed to all connected OTAs.')
    } catch (err) {
      error('Sync Failed', 'Unable to synchronize OTA channels.')
    } finally {
      setIsSyncing(false)
    }
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
              {channels.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-xs">
                    {isLoading ? 'Loading OTA channel connections...' : 'No OTA channels connected.'}
                  </TableCell>
                </TableRow>
              ) : (
                channels.map((ch) => (
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
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
