import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { useToast } from '@/components/ui/toast'
import { useAuth } from '@/auth/useAuth'
import { DiningTable, MenuItem, CartOrderItem } from '@/types'
import {
  UtensilsCrossed,
  Plus,
  Minus,
  Flame,
  CreditCard,
  Hotel,
  RefreshCw,
  SlidersHorizontal,
  Trash2,
  Edit2,
  CheckCircle2,
  Check,
} from 'lucide-react'

import { diningApi } from '@/api/endpoints/dining.api'

const DEFAULT_TABLE: DiningTable = {
  id: 'tbl-1',
  restaurantId: 'rest-1',
  tableNumber: 'T-01',
  capacity: 4,
  status: 'available',
  section: 'Main Dining',
}

export const RestaurantPOS: React.FC = () => {
  const { success, warning, error: toastError } = useToast()
  const { hasRole, user } = useAuth()
  const [tables, setTables] = useState<DiningTable[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [selectedTable, setSelectedTable] = useState<DiningTable>(DEFAULT_TABLE)
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [cart, setCart] = useState<CartOrderItem[]>([])
  const [isRoomPostOpen, setIsRoomPostOpen] = useState(false)
  const [targetRoom, setTargetRoom] = useState('501')
  const [loading, setLoading] = useState<boolean>(true)

  // Admin Modals
  const [isManageTablesOpen, setIsManageTablesOpen] = useState(false)
  const [isManageMenuOpen, setIsManageMenuOpen] = useState(false)

  // New Table form state
  const [newTableNumber, setNewTableNumber] = useState('')
  const [newTableSection, setNewTableSection] = useState<'Main Dining' | 'Terrace' | 'Poolside' | 'Lounge' | 'Bar'>('Main Dining')
  const [newTableCapacity, setNewTableCapacity] = useState(4)

  // New Menu Item form state
  const [newItemName, setNewItemName] = useState('')
  const [newItemCategory, setNewItemCategory] = useState<'Appetizers' | 'Mains' | 'Desserts' | 'Beverages' | 'Cocktails' | 'Wine'>('Mains')
  const [newItemPrice, setNewItemPrice] = useState(24.0)
  const [newItemDescription, setNewItemDescription] = useState('')

  const canManageDining = hasRole([
    'super_admin',
    'org_admin',
    'property_manager',
    'restaurant_pos',
    'chef_kitchen',
    'operations_director',
  ])

  // Fetch live tables and menu catalog from backend
  const loadData = useCallback(() => {
    setLoading(true)
    Promise.all([
      diningApi.getTables().catch(() => []),
      diningApi.getMenuItems().catch(() => []),
    ])
      .then(([fetchedTables, fetchedMenu]) => {
        if (fetchedTables && fetchedTables.length > 0) {
          setTables(fetchedTables)
          setSelectedTable((prev) => {
            const found = fetchedTables.find((t) => t.id === prev.id)
            return found || fetchedTables[0]
          })
        } else {
          setTables([DEFAULT_TABLE])
          setSelectedTable(DEFAULT_TABLE)
        }
        if (fetchedMenu && fetchedMenu.length > 0) {
          setMenuItems(fetchedMenu)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Cart math
  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  const tax = +(subtotal * 0.1).toFixed(2)
  const total = +(subtotal + tax).toFixed(2)

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItemId === item.id)
      if (existing) {
        return prev.map((c) => (c.menuItemId === item.id ? { ...c, quantity: c.quantity + 1 } : c))
      }
      return [...prev, { menuItemId: item.id, name: item.name, quantity: 1, unitPrice: item.price }]
    })
  }

  const updateQuantity = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => (c.menuItemId === itemId ? { ...c, quantity: c.quantity + delta } : c))
        .filter((c) => c.quantity > 0)
    )
  }

  // Update table status
  const handleUpdateTableStatus = async (tableId: string, nextStatus: DiningTable['status']) => {
    setTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, status: nextStatus } : t))
    )
    if (selectedTable.id === tableId) {
      setSelectedTable((prev) => ({ ...prev, status: nextStatus }))
    }

    try {
      await diningApi.updateTableStatus(tableId, nextStatus)
      success('Table Status Updated', `Table status updated to ${nextStatus.toUpperCase()}.`)
    } catch (err) {
      console.warn('Backend table status update error:', err)
    }
  }

  // Fire Order to KOT
  const handleFireKOT = async () => {
    if (cart.length === 0 || !selectedTable) return
    try {
      await diningApi.createOrder({
        tableId: selectedTable.tableNumber || selectedTable.id,
        guestCount: selectedTable.capacity || 2,
        serverName: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'POS Server',
        items: cart.map((c) => ({ menuItemId: c.menuItemId, quantity: c.quantity })),
      })
      // Mark table occupied if available
      if (selectedTable.status === 'available') {
        handleUpdateTableStatus(selectedTable.id, 'occupied')
      }
      success(
        'KOT Generated & Dispatched to Kitchen',
        `Ticket fired to kitchen display for ${selectedTable.tableNumber}.`
      )
      setCart([])
    } catch (err) {
      toastError('Order Dispatch Failed', 'Could not send order to kitchen.')
    }
  }

  // Post to Room Folio
  const handleConfirmRoomPost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTable) return
    try {
      await diningApi.postCheckToRoom(selectedTable.id, {
        roomId: targetRoom,
        guestName: 'In-House Guest',
      })
      // Reset table to available
      handleUpdateTableStatus(selectedTable.id, 'available')
      success(
        'F&B Check Posted to Guest Folio',
        `$${total} posted to Room ${targetRoom} master folio. Check settled on ${selectedTable.tableNumber}.`
      )
      setIsRoomPostOpen(false)
      setCart([])
    } catch (err) {
      toastError('Room Charge Failed', 'Could not post charge to room folio.')
    }
  }

  // Create New Table (Admin)
  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const created = await diningApi.createTable({
        tableNumber: newTableNumber.trim() || `T-${tables.length + 1}`,
        section: newTableSection,
        capacity: newTableCapacity,
        status: 'available',
      })
      setTables((prev) => [...prev, created])
      success('Table Added', `Table ${created.tableNumber} created successfully.`)
      setNewTableNumber('')
    } catch (err) {
      toastError('Error', 'Failed to create table in backend.')
    }
  }

  // Delete Table (Admin)
  const handleDeleteTable = async (tableId: string) => {
    try {
      await diningApi.deleteTable(tableId)
      setTables((prev) => prev.filter((t) => t.id !== tableId))
      success('Table Removed', 'Table successfully deleted.')
    } catch (err) {
      toastError('Error', 'Failed to delete table.')
    }
  }

  // Create New Menu Item (Admin)
  const handleCreateMenuItem = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const created = await diningApi.createMenuItem({
        name: newItemName.trim(),
        category: newItemCategory,
        price: Number(newItemPrice) || 20,
        description: newItemDescription,
        isAvailable: true,
      })
      setMenuItems((prev) => [...prev, created])
      success('Menu Item Added', `${created.name} added to catalog.`)
      setNewItemName('')
      setNewItemDescription('')
    } catch (err) {
      toastError('Error', 'Failed to create menu item.')
    }
  }

  // Toggle Item Availability (Admin)
  const handleToggleItemAvailability = async (item: MenuItem) => {
    try {
      const updated = await diningApi.updateMenuItem(item.id, {
        isAvailable: !item.isAvailable,
      })
      setMenuItems((prev) =>
        prev.map((m) => (m.id === item.id ? { ...m, isAvailable: updated.isAvailable } : m))
      )
      success('Availability Updated', `${item.name} is now ${updated.isAvailable ? 'Available' : 'Sold Out'}.`)
    } catch (err) {
      toastError('Error', 'Could not update availability.')
    }
  }

  // Delete Menu Item (Admin)
  const handleDeleteMenuItem = async (itemId: string) => {
    try {
      await diningApi.deleteMenuItem(itemId)
      setMenuItems((prev) => prev.filter((m) => m.id !== itemId))
      success('Menu Item Deleted', 'Item removed from catalog.')
    } catch (err) {
      toastError('Error', 'Failed to delete menu item.')
    }
  }

  const categories = ['All', ...Array.from(new Set(menuItems.map((m) => m.category)))]

  const filteredMenu =
    selectedCategory === 'All'
      ? menuItems
      : menuItems.filter((m) => m.category.toLowerCase() === selectedCategory.toLowerCase())

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Restaurant Point of Sale (POS)</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            The Palm Court Fine Dining • Floor Plan & Table Terminal
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadData} className="gap-1.5">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Sync Catalog
          </Button>

          {canManageDining && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsManageTablesOpen(true)}
                className="gap-1.5"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Manage Tables
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsManageMenuOpen(true)}
                className="gap-1.5"
              >
                <UtensilsCrossed className="h-3.5 w-3.5" />
                Manage Menu
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Table Floor Plan Grid */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Table Floor Layout & Active Checks
          </span>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Available
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-sky-500" /> Occupied
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-amber-500" /> Billing
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {tables.map((table) => {
            const isSelected = selectedTable.id === table.id
            return (
              <button
                key={table.id}
                type="button"
                onClick={() => setSelectedTable(table)}
                className={`rounded-xl border p-3 text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-primary bg-primary/10 shadow-sm ring-1 ring-primary'
                    : 'border-border bg-card hover:border-border/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-foreground">{table.tableNumber}</span>
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      table.status === 'available'
                        ? 'bg-emerald-500 shadow-xs shadow-emerald-500/50'
                        : table.status === 'occupied'
                        ? 'bg-sky-500 shadow-xs shadow-sky-500/50'
                        : 'bg-amber-500 shadow-xs shadow-amber-500/50'
                    }`}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1 font-medium truncate">{table.section}</p>
                <p className="text-[10px] text-muted-foreground font-mono mt-0.5 capitalize">
                  {table.capacity} Seats • {table.status}
                </p>
              </button>
            )
          })}
        </div>
      </div>

      {/* POS Workspace: Menu vs Live Cart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Menu Catalog (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-lg px-3 py-1.5 font-semibold transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Menu Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredMenu.map((item) => (
              <div
                key={item.id}
                onClick={() => (item.isAvailable !== false ? addToCart(item) : undefined)}
                className={`group rounded-xl border border-border bg-card p-4 transition-all flex flex-col justify-between ${
                  item.isAvailable !== false
                    ? 'cursor-pointer hover:border-primary/60 hover:shadow-xs'
                    : 'opacity-50 cursor-not-allowed'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                      {item.name}
                    </h4>
                    <span className="font-mono font-bold text-sm text-foreground">${item.price}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                    {item.description || 'Artisan fine dining selection prepared fresh by executive chef.'}
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between pt-2 border-t border-border/40 text-[10px] text-muted-foreground">
                  <span className="font-mono">
                    {item.isAvailable !== false ? `Prep: ~${item.prepTimeMinutes || 15}m` : '⛔ Sold Out'}
                  </span>
                  {item.isAvailable !== false && (
                    <Button size="icon-sm" variant="ghost" className="h-6 w-6">
                      <Plus className="h-3.5 w-3.5 text-primary" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Table Cart & Ordering Actions (Right Col) */}
        <Card className="flex flex-col justify-between h-fit sticky top-20">
          <CardHeader className="pb-3 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">{selectedTable.tableNumber} Current Order</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">{selectedTable.section}</p>
              </div>
              <Badge
                variant={
                  selectedTable.status === 'available'
                    ? 'success'
                    : selectedTable.status === 'occupied'
                    ? 'info'
                    : 'warning'
                }
              >
                {selectedTable.status.toUpperCase()}
              </Badge>
            </div>

            {/* Quick Table Status Modifier */}
            <div className="flex items-center gap-1.5 pt-2 mt-2 border-t border-border/60">
              <span className="text-[10px] text-muted-foreground font-semibold">Table Status:</span>
              {(['available', 'occupied', 'billing'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => handleUpdateTableStatus(selectedTable.id, st)}
                  className={`text-[10px] px-2 py-0.5 rounded capitalize font-medium cursor-pointer transition-colors ${
                    selectedTable.status === st
                      ? 'bg-primary text-primary-foreground font-bold'
                      : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </CardHeader>

          <CardContent className="p-4 flex-1">
            {cart.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-xs">
                <UtensilsCrossed className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                No items added yet. Click menu items to add to order.
              </div>
            ) : (
              <div className="space-y-3 divide-y divide-border/60">
                {cart.map((c) => (
                  <div key={c.menuItemId} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                    <div className="flex-1 pr-2">
                      <p className="font-semibold text-foreground">{c.name}</p>
                      <span className="font-mono text-muted-foreground text-[11px]">
                        ${c.unitPrice} &times; {c.quantity} = ${(c.unitPrice * c.quantity).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="icon-sm"
                        variant="outline"
                        className="h-6 w-6"
                        onClick={() => updateQuantity(c.menuItemId, -1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="font-mono font-bold text-xs w-4 text-center">{c.quantity}</span>
                      <Button
                        size="icon-sm"
                        variant="outline"
                        className="h-6 w-6"
                        onClick={() => updateQuantity(c.menuItemId, 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Cart Math Summary */}
            {cart.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Tax (10%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-foreground text-sm pt-1 border-t border-border">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-5 space-y-2">
              <Button
                className="w-full gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold"
                disabled={cart.length === 0}
                onClick={handleFireKOT}
              >
                <Flame className="h-4 w-4" />
                Fire Order to Kitchen (KOT)
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="w-full gap-1.5 text-xs"
                  disabled={cart.length === 0}
                  onClick={() => setIsRoomPostOpen(true)}
                >
                  <Hotel className="h-3.5 w-3.5" />
                  Post to Room
                </Button>
                <Button
                  variant="outline"
                  className="w-full gap-1.5 text-xs"
                  disabled={cart.length === 0}
                  onClick={() => {
                    handleUpdateTableStatus(selectedTable.id, 'available')
                    success('Card Payment Settled', `$${total} charged via Terminal POS.`)
                    setCart([])
                  }}
                >
                  <CreditCard className="h-3.5 w-3.5" />
                  Settle Check
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Post Check to Room Modal */}
      <Modal
        isOpen={isRoomPostOpen}
        onClose={() => setIsRoomPostOpen(false)}
        title="Post Dining Check to Room Master Folio"
        description={`Charge $${total} dining check to guest's PMS folio account`}
        maxWidth="sm"
      >
        <form onSubmit={handleConfirmRoomPost} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Target Room Number</label>
            <input
              type="text"
              value={targetRoom}
              onChange={(e) => setTargetRoom(e.target.value)}
              required
              className="w-full rounded-lg border border-border bg-background p-2 text-xs text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              Active folio must be in OPEN status in PMS billing ledger.
            </p>
          </div>

          <div className="rounded-lg bg-muted/40 p-3 border border-border text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Source:</span>
              <span className="font-semibold text-foreground">{selectedTable.tableNumber} (Fine Dining)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Charge:</span>
              <span className="font-mono font-bold text-foreground">${total}</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsRoomPostOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit">
              Post to Folio
            </Button>
          </div>
        </form>
      </Modal>

      {/* Manage Tables Modal (Admin) */}
      <Modal
        isOpen={isManageTablesOpen}
        onClose={() => setIsManageTablesOpen(false)}
        title="Dining Tables Management"
        description="Configure table floor layout, seat capacities, and dining sections"
        maxWidth="md"
      >
        <div className="space-y-5">
          {/* Add Table Form */}
          <form onSubmit={handleCreateTable} className="p-3 rounded-xl border border-border bg-muted/30 space-y-3">
            <span className="text-xs font-bold text-foreground block">Add New Dining Table</span>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-muted-foreground mb-1">Table #</label>
                <input
                  type="text"
                  placeholder="T-06"
                  value={newTableNumber}
                  onChange={(e) => setNewTableNumber(e.target.value)}
                  required
                  className="w-full rounded border border-border bg-background p-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-muted-foreground mb-1">Section</label>
                <select
                  value={newTableSection}
                  onChange={(e) => setNewTableSection(e.target.value as any)}
                  className="w-full rounded border border-border bg-background p-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  <option value="Main Dining">Main Dining</option>
                  <option value="Terrace">Terrace</option>
                  <option value="Poolside">Poolside</option>
                  <option value="Lounge">Lounge</option>
                  <option value="Bar">Bar</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-muted-foreground mb-1">Seats</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={newTableCapacity}
                  onChange={(e) => setNewTableCapacity(parseInt(e.target.value) || 2)}
                  required
                  className="w-full rounded border border-border bg-background p-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
            <Button size="sm" type="submit" className="w-full">
              Add Table to Floor
            </Button>
          </form>

          {/* Existing Tables List */}
          <div className="max-h-60 overflow-y-auto space-y-2 divide-y divide-border/60">
            {tables.map((t) => (
              <div key={t.id} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-foreground font-mono">{t.tableNumber}</span>
                  <span className="text-muted-foreground text-[11px] ml-2">
                    {t.section} • {t.capacity} seats • {t.status}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                    onClick={() => handleDeleteTable(t.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-3 border-t border-border">
            <Button size="sm" onClick={() => setIsManageTablesOpen(false)}>
              Done
            </Button>
          </div>
        </div>
      </Modal>

      {/* Manage Menu Modal (Admin) */}
      <Modal
        isOpen={isManageMenuOpen}
        onClose={() => setIsManageMenuOpen(false)}
        title="Food & Beverage Menu Catalog"
        description="Add dishes, adjust pricing, and toggle culinary station availability"
        maxWidth="lg"
      >
        <div className="space-y-5">
          {/* Add Menu Item Form */}
          <form onSubmit={handleCreateMenuItem} className="p-3 rounded-xl border border-border bg-muted/30 space-y-3">
            <span className="text-xs font-bold text-foreground block">Add New Menu Dish</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-semibold text-muted-foreground mb-1">Dish Name</label>
                <input
                  type="text"
                  placeholder="e.g. Lobster Thermidor"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  required
                  className="w-full rounded border border-border bg-background p-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-muted-foreground mb-1">Price ($)</label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(parseFloat(e.target.value) || 10)}
                  required
                  className="w-full rounded border border-border bg-background p-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-muted-foreground mb-1">Category</label>
                <select
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value as any)}
                  className="w-full rounded border border-border bg-background p-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  <option value="Appetizers">Appetizers</option>
                  <option value="Mains">Mains</option>
                  <option value="Desserts">Desserts</option>
                  <option value="Beverages">Beverages</option>
                  <option value="Cocktails">Cocktails</option>
                  <option value="Wine">Wine</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-muted-foreground mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Flavor profile & ingredients"
                  value={newItemDescription}
                  onChange={(e) => setNewItemDescription(e.target.value)}
                  className="w-full rounded border border-border bg-background p-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <Button size="sm" type="submit" className="w-full">
              Add Dish to Menu
            </Button>
          </form>

          {/* Menu Catalog Table */}
          <div className="max-h-72 overflow-y-auto space-y-2 divide-y divide-border/60">
            {menuItems.map((m) => (
              <div key={m.id} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                <div className="flex-1 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">{m.name}</span>
                    <Badge variant={m.isAvailable !== false ? 'success' : 'destructive'} className="text-[9px] py-0 px-1.5">
                      {m.isAvailable !== false ? 'Available' : 'Sold Out'}
                    </Badge>
                  </div>
                  <span className="text-muted-foreground text-[11px] font-mono">
                    {m.category} • ${m.price}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-[10px]"
                    onClick={() => handleToggleItemAvailability(m)}
                  >
                    {m.isAvailable !== false ? 'Mark Sold Out' : 'Mark Available'}
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                    onClick={() => handleDeleteMenuItem(m.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-3 border-t border-border">
            <Button size="sm" onClick={() => setIsManageMenuOpen(false)}>
              Done
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
