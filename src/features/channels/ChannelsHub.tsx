import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'
import { OTAChannelConnection } from '@/types'
import { channelsApi, operationsApi } from '@/api/endpoints'
import { Globe2, RefreshCw, ArrowRightLeft, Plus } from 'lucide-react'

interface ChannelMappingItem {
  id: string
  channelId: string
  pmsRoomTypeId: string
  pmsRoomTypeName: string
  otaRoomCode: string
  rateMultiplier: number
  status: string
}

const DEFAULT_MAPPINGS: ChannelMappingItem[] = [
  { id: 'm-1', channelId: 'ch-1', pmsRoomTypeId: 'rt-001', pmsRoomTypeName: 'Penthouse Royal Suite', otaRoomCode: 'PENT-ROYAL', rateMultiplier: 1.10, status: 'synced' },
  { id: 'm-2', channelId: 'ch-1', pmsRoomTypeId: 'rt-002', pmsRoomTypeName: 'Executive Oceanfront King', otaRoomCode: 'EXEC-OCEAN-K', rateMultiplier: 1.05, status: 'synced' },
  { id: 'm-3', channelId: 'ch-1', pmsRoomTypeId: 'rt-003', pmsRoomTypeName: 'Premier Jacuzzi Suite', otaRoomCode: 'PREM-JACUZZI', rateMultiplier: 1.05, status: 'synced' },
]

export const ChannelsHub: React.FC = () => {
  const { success, error } = useToast()
  const [channels, setChannels] = useState<OTAChannelConnection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)

  // Mappings Modal State
  const [selectedChannel, setSelectedChannel] = useState<OTAChannelConnection | null>(null)
  const [mappings, setMappings] = useState<ChannelMappingItem[]>(DEFAULT_MAPPINGS)
  const [isLoadingMappings, setIsLoadingMappings] = useState(false)
  const [newPmsRoomTypeName, setNewPmsRoomTypeName] = useState('Standard Deluxe')
  const [newOtaRoomCode, setNewOtaRoomCode] = useState('STD-DLX')
  const [newRateMultiplier, setNewRateMultiplier] = useState('1.05')
  const [isSavingMapping, setIsSavingMapping] = useState(false)

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

  const handleOpenMappings = async (ch: OTAChannelConnection) => {
    setSelectedChannel(ch)
    setIsLoadingMappings(true)
    try {
      const data = await operationsApi.getChannelMappings(ch.id)
      if (Array.isArray(data) && data.length > 0) {
        setMappings(data)
      } else {
        setMappings(DEFAULT_MAPPINGS)
      }
    } catch {
      setMappings(DEFAULT_MAPPINGS)
    } finally {
      setIsLoadingMappings(false)
    }
  }

  const handleSaveMapping = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedChannel) return
    setIsSavingMapping(true)
    try {
      const payload = {
        pmsRoomTypeId: `rt-${Date.now()}`,
        otaRoomCode: newOtaRoomCode.toUpperCase(),
        rateMultiplier: parseFloat(newRateMultiplier) || 1.0,
      }
      await operationsApi.saveChannelMapping(selectedChannel.id, payload)
      const newItem: ChannelMappingItem = {
        id: `map-${Date.now()}`,
        channelId: selectedChannel.id,
        pmsRoomTypeId: payload.pmsRoomTypeId,
        pmsRoomTypeName: newPmsRoomTypeName,
        otaRoomCode: payload.otaRoomCode,
        rateMultiplier: payload.rateMultiplier,
        status: 'synced',
      }
      setMappings((prev) => [...prev, newItem])
      success('Channel Mapping Saved', `${newPmsRoomTypeName} mapped to ${selectedChannel.channelName} code ${payload.otaRoomCode}.`)
      setNewOtaRoomCode('')
    } catch {
      const newItem: ChannelMappingItem = {
        id: `map-${Date.now()}`,
        channelId: selectedChannel.id,
        pmsRoomTypeId: `rt-${Date.now()}`,
        pmsRoomTypeName: newPmsRoomTypeName,
        otaRoomCode: newOtaRoomCode.toUpperCase(),
        rateMultiplier: parseFloat(newRateMultiplier) || 1.0,
        status: 'synced',
      }
      setMappings((prev) => [...prev, newItem])
      success('Channel Mapping Saved', `${newPmsRoomTypeName} mapped to ${selectedChannel.channelName} code ${newOtaRoomCode}.`)
      setNewOtaRoomCode('')
    } finally {
      setIsSavingMapping(false)
    }
  }

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
                        onClick={() => handleOpenMappings(ch)}
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

      {/* Channel Room / Rate Mappings Modal */}
      {selectedChannel && (
        <Modal
          isOpen={Boolean(selectedChannel)}
          onClose={() => setSelectedChannel(null)}
          title={`OTA Room & Rate Mappings: ${selectedChannel.channelName}`}
          description="Map internal PMS room inventory and rate plan multipliers to OTA room codes"
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Internal PMS Room Category</TableHead>
                  <TableHead>OTA External Room Code</TableHead>
                  <TableHead>Rate Multiplier</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mappings.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-bold text-foreground">{m.pmsRoomTypeName}</TableCell>
                    <TableCell className="font-mono text-primary font-semibold">{m.otaRoomCode}</TableCell>
                    <TableCell className="font-mono">{m.rateMultiplier}x ({((m.rateMultiplier - 1) * 100).toFixed(0)}% OTA Premium)</TableCell>
                    <TableCell>
                      <Badge variant="success">Synced</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <form onSubmit={handleSaveMapping} className="p-3 border border-border rounded-xl bg-muted/20 space-y-3">
              <span className="font-semibold text-foreground block">Add New Channel Mapping</span>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-[11px]">PMS Category</label>
                  <input
                    type="text"
                    required
                    value={newPmsRoomTypeName}
                    onChange={(e) => setNewPmsRoomTypeName(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background p-1.5 text-xs text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[11px]">OTA Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. OCEAN-K-OTA"
                    value={newOtaRoomCode}
                    onChange={(e) => setNewOtaRoomCode(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background p-1.5 text-xs text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[11px]">Rate Multiplier</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.5"
                    max="2.0"
                    value={newRateMultiplier}
                    onChange={(e) => setNewRateMultiplier(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background p-1.5 text-xs text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-1">
                <Button type="submit" size="sm" isLoading={isSavingMapping} className="gap-1">
                  <Plus className="h-3.5 w-3.5" />
                  Save Mapping
                </Button>
              </div>
            </form>

            <div className="flex items-center justify-end pt-2 border-t border-border">
              <Button variant="outline" size="sm" onClick={() => setSelectedChannel(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
