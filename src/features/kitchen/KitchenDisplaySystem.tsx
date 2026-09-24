import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { Modal } from '@/components/ui/modal'
import { useToast } from '@/components/ui/toast'
import { useAuth } from '@/auth/useAuth'
import { KitchenOrderTicket, KOTStatus } from '@/types'
import { kotApi } from '@/api/endpoints/kot.api'
import { useHotelWebSocket } from '@/hooks/useWebSocket'
import {
  Flame,
  Clock,
  CheckCircle,
  ChevronRight,
  Plus,
  RefreshCw,
  Radio,
} from 'lucide-react'

export const KitchenDisplaySystem: React.FC = () => {
  const { success, warning, error: toastError } = useToast()
  const { hasRole, user } = useAuth()
  const { isConnected: isWsConnected, lastMessage } = useHotelWebSocket()
  const [tickets, setTickets] = useState<KitchenOrderTicket[]>([])
  const [stationFilter, setStationFilter] = useState<'All' | 'Grill' | 'Sauté' | 'Salad' | 'Bar'>('All')
  const [cancelTicket, setCancelTicket] = useState<KitchenOrderTicket | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false)

  // New manual ticket form state
  const [newTable, setNewTable] = useState('Table T-01')
  const [newStation, setNewStation] = useState<'Grill' | 'Sauté' | 'Salad' | 'Bar'>('Grill')
  const [newPriority, setNewPriority] = useState<'normal' | 'rush' | 'vip'>('rush')
  const [newDishName, setNewDishName] = useState('Charred Prime Wagyu Ribeye 12oz')
  const [newQuantity, setNewQuantity] = useState(1)
  const [newNotes, setNewNotes] = useState('Urgent VIP - Medium Rare')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canManageKitchen = hasRole([
    'super_admin',
    'org_admin',
    'property_manager',
    'chef_kitchen',
    'restaurant_pos',
    'operations_director',
  ])

  // Normalize order from backend format to KitchenOrderTicket
  const normalizeOrder = (raw: any): KitchenOrderTicket => {
    const rawItems = Array.isArray(raw.items) ? raw.items : []
    const createdDate = raw.createdAt ? new Date(raw.createdAt) : new Date()
    const elapsedMinutes = Math.max(
      1,
      Math.round((Date.now() - createdDate.getTime()) / 60000)
    )

    return {
      id: raw.id || `kot-${Math.random().toString(36).substring(2, 7)}`,
      ticketNumber: raw.ticketNumber || raw.ticket_number || `KOT-${Math.floor(1000 + Math.random() * 9000)}`,
      outletName: raw.outletName || 'The Palm Court Fine Dining',
      orderType: (raw.orderType || 'dine_in') as KitchenOrderTicket['orderType'],
      tableNumber: raw.tableNumber ? (raw.tableNumber.startsWith('Table') ? raw.tableNumber : `Table ${raw.tableNumber}`) : (raw.roomNumber ? `Room ${raw.roomNumber}` : 'Table T-01'),
      roomNumber: raw.roomNumber,
      serverName: raw.serverName || 'Captain Rios',
      status: (raw.status || 'new').toLowerCase() as KOTStatus,
      priority: (raw.priority || 'normal') as KitchenOrderTicket['priority'],
      createdAt: createdDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      elapsedMinutes: isNaN(elapsedMinutes) ? 5 : elapsedMinutes,
      items: rawItems.map((item: any, idx: number) => ({
        id: item.id || `item-${idx + 1}`,
        menuItemName: item.name || item.menuItemName || 'Special Culinary Item',
        quantity: Number(item.quantity) || 1,
        notes: item.specialInstructions || item.notes || '',
        station: (item.station || raw.station || 'Grill') as any,
        status: (item.status || 'pending') as any,
      })),
    }
  }

  // Load orders from backend
  const loadOrders = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await kotApi.getOrders()
      if (Array.isArray(data) && data.length > 0) {
        setTickets(data.map(normalizeOrder))
      }
    } catch (err) {
      console.warn('Backend KOT orders unreachable, keeping local tickets:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  // Handle incoming real-time WebSocket events from Django Channels gateway
  useEffect(() => {
    if (!lastMessage) return

    if (
      lastMessage.type === 'KOT_ORDER_FIRED' ||
      lastMessage.type === 'KOT_ORDER_CREATED' ||
      lastMessage.type === 'kot_order_fired'
    ) {
      const normalized = normalizeOrder(lastMessage.data)
      setTickets((prev) => [normalized, ...prev.filter((t) => t.id !== normalized.id)])
      success(
        'Real-Time Order Fired',
        `New ticket #${normalized.ticketNumber} arrived for ${normalized.tableNumber || 'room'}.`
      )
    } else if (
      lastMessage.type === 'KOT_STATUS_CHANGED' ||
      lastMessage.type === 'kot_status_changed'
    ) {
      const payload = lastMessage.data || {}
      const targetId = payload.id || payload.orderId || payload.ticketId
      const newStatus = (payload.status || '').toLowerCase()
      if (targetId && newStatus) {
        setTickets((prev) =>
          prev.map((t) =>
            t.id === targetId || t.ticketNumber === payload.ticketNumber
              ? { ...t, status: newStatus as KOTStatus }
              : t
          )
        )
      }
    }
  }, [lastMessage, success])

  // Simulation timer incrementing elapsed time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setTickets((prev) =>
        prev.map((t) => ({ ...t, elapsedMinutes: t.elapsedMinutes + 1 }))
      )
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  // Progressive state bump following authoritative DRF state machine
  const handleBumpStatus = async (ticketId: string) => {
    const target = tickets.find((t) => t.id === ticketId)
    if (!target) return

    let nextStatus: KOTStatus = target.status
    if (target.status === 'new') nextStatus = 'accepted'
    else if (target.status === 'accepted') nextStatus = 'preparing'
    else if (target.status === 'preparing') nextStatus = 'ready'
    else if (target.status === 'ready') nextStatus = 'served'

    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status: nextStatus } : t))
    )

    try {
      await kotApi.updateOrderStatus(ticketId, nextStatus)
    } catch (err) {
      console.warn('Backend KOT status update warning:', err)
    }

    success(`Ticket ${target.ticketNumber} Advanced`, `Status updated to ${nextStatus.toUpperCase()}.`)
  }

  // Handle Void / Cancel Ticket
  const handleConfirmCancel = async (reason?: string) => {
    if (!cancelTicket) return
    const cancelReason = reason || 'Chef recall'
    setTickets((prev) =>
      prev.map((t) => (t.id === cancelTicket.id ? { ...t, status: 'cancelled' } : t))
    )

    try {
      await kotApi.cancelOrder(cancelTicket.id, cancelReason)
    } catch (err) {
      console.warn('Backend KOT cancellation warning:', err)
    }

    warning(`KOT ${cancelTicket.ticketNumber} Cancelled`, `Reason: "${cancelReason}"`)
    setCancelTicket(null)
  }

  // Handle Create Manual Rush Ticket (Admin / Chef operation)
  const handleCreateRushTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const payload = {
        tableNumber: newTable,
        station: newStation.toLowerCase(),
        serverName: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Executive Chef',
        guestCount: 2,
        priority: newPriority,
        items: [
          {
            name: newDishName,
            quantity: newQuantity,
            specialInstructions: newNotes,
          },
        ],
      }
      const created = await kotApi.createOrder(payload)
      const normalized = normalizeOrder(created)
      setTickets((prev) => [normalized, ...prev])
      success('Rush Ticket Dispatched', `KOT ${normalized.ticketNumber} fired to ${newStation} Station.`)
      setIsNewTicketOpen(false)
      setNewDishName('')
      setNewNotes('')
    } catch (err) {
      toastError('Ticket Creation Failed', 'Could not dispatch KOT to server.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filter active tickets
  const activeTickets = tickets.filter((t) => {
    if (t.status === 'served' || t.status === 'cancelled') return false
    if (stationFilter === 'All') return true
    return t.items.some((i) => i.station.toLowerCase() === stationFilter.toLowerCase())
  })

  return (
    <div className="space-y-6">
      {/* Station Filter Bar & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-bold uppercase text-slate-400 mr-2 flex items-center gap-1">
            <Flame className="h-4 w-4 text-rose-500" /> Station Queue:
          </span>
          {(['All', 'Grill', 'Sauté', 'Salad', 'Bar'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStationFilter(st)}
              className={`rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                stationFilter === st
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/40'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400 mr-2">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              &lt;10m Normal
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              10-20m Warning
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              &gt;20m Delayed
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                isWsConnected
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              }`}
            >
              <Radio className={`h-3 w-3 ${isWsConnected ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`} />
              <span>{isWsConnected ? 'Live WS Connected' : 'WS Connecting...'}</span>
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={loadOrders}
            className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Sync
          </Button>

          {canManageKitchen && (
            <Button
              size="sm"
              onClick={() => setIsNewTicketOpen(true)}
              className="bg-rose-600 hover:bg-rose-700 text-white gap-1.5 font-semibold"
            >
              <Plus className="h-4 w-4" />
              Manual KOT
            </Button>
          )}
        </div>
      </div>

      {/* Ticket Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {activeTickets.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center p-16 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/40">
            <CheckCircle className="h-12 w-12 text-emerald-500/60 mb-3" />
            <h3 className="text-lg font-bold text-slate-200">Kitchen Display Cleared</h3>
            <p className="text-xs text-slate-500 mt-1">All current order tickets have been prepared and served.</p>
          </div>
        ) : (
          activeTickets.map((ticket) => {
            const isUrgent = ticket.elapsedMinutes > 20 || ticket.priority === 'rush' || ticket.priority === 'vip'
            const elapsedColor =
              ticket.elapsedMinutes > 20
                ? 'text-rose-400 bg-rose-950/60 border-rose-800'
                : ticket.elapsedMinutes > 10
                ? 'text-amber-400 bg-amber-950/60 border-amber-800'
                : 'text-emerald-400 bg-emerald-950/60 border-emerald-800'

            return (
              <div
                key={ticket.id}
                className={`flex flex-col justify-between rounded-2xl border bg-slate-900/90 shadow-xl overflow-hidden transition-all ${
                  isUrgent ? 'border-rose-600/80 shadow-rose-950/50' : 'border-slate-800'
                }`}
              >
                {/* Ticket Top Header */}
                <div className="p-4 border-b border-slate-800 bg-slate-900">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-black text-white">{ticket.ticketNumber}</span>
                        {ticket.priority !== 'normal' && (
                          <span className="rounded-sm bg-rose-600 px-1.5 py-0.5 text-[9px] font-black uppercase text-white tracking-widest animate-pulse">
                            {ticket.priority}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-amber-400 mt-0.5">
                        {ticket.tableNumber || ticket.roomNumber}
                      </p>
                    </div>

                    <div className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-mono text-xs font-bold ${elapsedColor}`}>
                      <Clock className="h-3.5 w-3.5" />
                      <span>{ticket.elapsedMinutes}m</span>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{ticket.outletName}</span>
                    <span className="font-mono">{ticket.serverName}</span>
                  </div>
                </div>

                {/* Ticket Item Body */}
                <div className="flex-1 p-4 space-y-3 divide-y divide-slate-800/60">
                  {ticket.items.map((item) => (
                    <div key={item.id} className="pt-2 first:pt-0">
                      <div className="flex items-start gap-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-slate-800 font-mono text-xs font-bold text-white">
                          {item.quantity}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-slate-100 leading-snug">{item.menuItemName}</p>
                          {item.notes && (
                            <p className="text-xs font-medium text-amber-400/90 italic mt-0.5">
                              ⚠️ {item.notes}
                            </p>
                          )}
                          <span className="inline-block mt-1 text-[10px] font-mono uppercase tracking-wider text-slate-400 bg-slate-800/80 rounded px-1.5 py-0.5">
                            {item.station} Station
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom Action Footer with Progressive Bump Button */}
                <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-slate-400 hover:text-rose-400"
                    onClick={() => setCancelTicket(ticket)}
                  >
                    Void
                  </Button>

                  <Button
                    size="sm"
                    className={`flex-1 gap-1.5 font-bold text-xs uppercase tracking-wider ${
                      ticket.status === 'new'
                        ? 'bg-sky-600 hover:bg-sky-700 text-white'
                        : ticket.status === 'accepted'
                        ? 'bg-amber-600 hover:bg-amber-700 text-white'
                        : ticket.status === 'preparing'
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                    onClick={() => handleBumpStatus(ticket.id)}
                  >
                    <span>
                      {ticket.status === 'new' && 'Accept KOT'}
                      {ticket.status === 'accepted' && 'Start Prep'}
                      {ticket.status === 'preparing' && 'Mark Ready'}
                      {ticket.status === 'ready' && 'Confirm Served'}
                    </span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Manual Urgent KOT Creator Modal */}
      <Modal
        isOpen={isNewTicketOpen}
        onClose={() => setIsNewTicketOpen(false)}
        title="Dispatch Manual Kitchen Order (KOT)"
        description="Fire priority ticket directly to culinary kitchen station queue"
        maxWidth="md"
      >
        <form onSubmit={handleCreateRushTicket} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Destination Table / Room</label>
              <input
                type="text"
                value={newTable}
                onChange={(e) => setNewTable(e.target.value)}
                required
                placeholder="Table T-03 or Room 501"
                className="w-full rounded-lg border border-border bg-background p-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Station</label>
              <select
                value={newStation}
                onChange={(e) => setNewStation(e.target.value as any)}
                className="w-full rounded-lg border border-border bg-background p-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="Grill">Grill Station</option>
                <option value="Sauté">Sauté Station</option>
                <option value="Salad">Salad / Pantry</option>
                <option value="Bar">Bar / Beverage</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Priority Level</label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as any)}
                className="w-full rounded-lg border border-border bg-background p-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="rush">🔥 Rush (Priority Fast-Track)</option>
                <option value="vip">⭐ VIP Guest Order</option>
                <option value="normal">Standard Order</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Quantity</label>
              <input
                type="number"
                min="1"
                max="20"
                value={newQuantity}
                onChange={(e) => setNewQuantity(parseInt(e.target.value) || 1)}
                required
                className="w-full rounded-lg border border-border bg-background p-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Dish Description / Menu Item</label>
            <input
              type="text"
              value={newDishName}
              onChange={(e) => setNewDishName(e.target.value)}
              required
              placeholder="e.g. Pan-Seared Chilean Sea Bass"
              className="w-full rounded-lg border border-border bg-background p-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Chef Special Instructions</label>
            <input
              type="text"
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              placeholder="e.g. Allergy warning: No shellfish, sauce on side"
              className="w-full rounded-lg border border-border bg-background p-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsNewTicketOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit" isLoading={isSubmitting} className="bg-rose-600 hover:bg-rose-700 text-white">
              Fire Ticket to Kitchen
            </Button>
          </div>
        </form>
      </Modal>

      {/* Void KOT Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!cancelTicket}
        onClose={() => setCancelTicket(null)}
        onConfirm={handleConfirmCancel}
        title="Void Kitchen Ticket"
        message={`Are you sure you want to cancel Ticket ${cancelTicket?.ticketNumber} (${cancelTicket?.tableNumber || cancelTicket?.roomNumber})? This will send an alert to server ${cancelTicket?.serverName} and log a kitchen waste audit.`}
        confirmText="Void Ticket"
        requireReason={true}
        reasonLabel="Mandatory Reason for Kitchen Void (e.g. Order Error, Ingredient Out of Stock)"
      />
    </div>
  )
}
