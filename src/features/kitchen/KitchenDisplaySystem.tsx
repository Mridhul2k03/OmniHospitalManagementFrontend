import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { useToast } from '@/components/ui/toast'
import { KitchenOrderTicket, KOTStatus } from '@/types'
import {
  Flame,
  Clock,
  CheckCircle,
  ChevronRight,
} from 'lucide-react'

const INITIAL_KOT_TICKETS: KitchenOrderTicket[] = [
  {
    id: 'kot-101',
    ticketNumber: 'KOT-4081',
    outletName: 'The Palm Court Fine Dining',
    orderType: 'dine_in',
    tableNumber: 'Table T-04',
    serverName: 'Captain Rios',
    status: 'new',
    priority: 'rush',
    createdAt: '20:41',
    elapsedMinutes: 4,
    items: [
      { id: 'i-1', menuItemName: 'Charred Prime Wagyu Ribeye 12oz', quantity: 2, notes: 'Medium Rare, Truffle Butter on side', station: 'Grill', status: 'pending' },
      { id: 'i-2', menuItemName: 'Heirloom Tomato & Burrata Salad', quantity: 1, notes: 'No balsamic glaze', station: 'Salad', status: 'pending' },
      { id: 'i-3', menuItemName: 'Truffle Parmesan Fries', quantity: 2, station: 'Sauté', status: 'pending' },
    ],
  },
  {
    id: 'kot-102',
    ticketNumber: 'KOT-4082',
    outletName: 'In-Room Private Dining',
    orderType: 'room_service',
    roomNumber: 'Room 501 (Penthouse)',
    serverName: 'Server Clara',
    status: 'preparing',
    priority: 'vip',
    createdAt: '20:30',
    elapsedMinutes: 15,
    items: [
      { id: 'i-4', menuItemName: 'Pan-Seared Chilean Sea Bass', quantity: 1, notes: 'Asparagus risotto', station: 'Sauté', status: 'preparing' },
      { id: 'i-5', menuItemName: 'Lobster Bisque Royale', quantity: 1, notes: 'Extra croutons', station: 'Sauté', status: 'preparing' },
      { id: 'i-6', menuItemName: 'Dom Pérignon 2013 Chilled', quantity: 1, station: 'Bar', status: 'ready' },
    ],
  },
  {
    id: 'kot-103',
    ticketNumber: 'KOT-4078',
    outletName: 'The Palm Court Fine Dining',
    orderType: 'dine_in',
    tableNumber: 'Table T-12 (Terrace)',
    serverName: 'Captain Rios',
    status: 'preparing',
    priority: 'normal',
    createdAt: '20:25',
    elapsedMinutes: 21,
    items: [
      { id: 'i-7', menuItemName: 'Wild Mushroom Risotto', quantity: 2, notes: 'Gluten-free', station: 'Sauté', status: 'preparing' },
      { id: 'i-8', menuItemName: 'Crispy Calamari Fritti', quantity: 1, station: 'Grill', status: 'ready' },
    ],
  },
  {
    id: 'kot-104',
    ticketNumber: 'KOT-4075',
    outletName: 'The Palm Court Fine Dining',
    orderType: 'dine_in',
    tableNumber: 'Table T-02',
    serverName: 'Server Liam',
    status: 'ready',
    priority: 'normal',
    createdAt: '20:18',
    elapsedMinutes: 28,
    items: [
      { id: 'i-9', menuItemName: 'Molten Valrhona Chocolate Fondant', quantity: 2, station: 'Dessert' as any, status: 'ready' },
      { id: 'i-10', menuItemName: 'Espresso Double Shot', quantity: 2, station: 'Bar', status: 'ready' },
    ],
  },
]

export const KitchenDisplaySystem: React.FC = () => {
  const { success, warning } = useToast()
  const [tickets, setTickets] = useState<KitchenOrderTicket[]>(INITIAL_KOT_TICKETS)
  const [stationFilter, setStationFilter] = useState<'All' | 'Grill' | 'Sauté' | 'Salad' | 'Bar'>('All')
  const [cancelTicket, setCancelTicket] = useState<KitchenOrderTicket | null>(null)

  // Simulation timer incrementing elapsed time
  useEffect(() => {
    const timer = setInterval(() => {
      setTickets((prev) =>
        prev.map((t) => ({ ...t, elapsedMinutes: t.elapsedMinutes + 1 }))
      )
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  // Progressive state bump following authoritative DRF state machine
  const handleBumpStatus = (ticketId: string) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId) return t

        let nextStatus: KOTStatus = t.status
        if (t.status === 'new') nextStatus = 'accepted'
        else if (t.status === 'accepted') nextStatus = 'preparing'
        else if (t.status === 'preparing') nextStatus = 'ready'
        else if (t.status === 'ready') nextStatus = 'served'

        return { ...t, status: nextStatus }
      })
    )

    const target = tickets.find((t) => t.id === ticketId)
    if (target) {
      success(`Ticket ${target.ticketNumber} Advanced`, `Station updated status transition to next phase.`)
    }
  }

  // Handle Void / Cancel Ticket
  const handleConfirmCancel = (reason?: string) => {
    if (!cancelTicket) return
    setTickets((prev) =>
      prev.map((t) => (t.id === cancelTicket.id ? { ...t, status: 'cancelled' } : t))
    )
    warning(`KOT ${cancelTicket.ticketNumber} Cancelled`, `Reason: "${reason || 'Chef recall'}"`)
    setCancelTicket(null)
  }

  // Filter active tickets
  const activeTickets = tickets.filter((t) => {
    if (t.status === 'served' || t.status === 'cancelled') return false
    if (stationFilter === 'All') return true
    return t.items.some((i) => i.station === stationFilter)
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

        <div className="flex items-center gap-3 text-xs text-slate-400">
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
            const isUrgent = ticket.elapsedMinutes > 20 || ticket.priority === 'rush'
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
                          <span className="rounded-sm bg-rose-600 px-1.5 py-0.2 text-[9px] font-black uppercase text-white tracking-widest animate-pulse">
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
                          <span className="inline-block mt-1 text-[10px] font-mono uppercase tracking-wider text-slate-400 bg-slate-800/80 rounded px-1.5 py-0.2">
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
