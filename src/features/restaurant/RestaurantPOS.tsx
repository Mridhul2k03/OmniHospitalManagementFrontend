import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { useToast } from '@/components/ui/toast'
import { DiningTable, MenuItem, CartOrderItem } from '@/types'
import {
  UtensilsCrossed,
  Plus,
  Minus,
  Flame,
  CreditCard,
  Hotel,
} from 'lucide-react'

const MOCK_TABLES: DiningTable[] = [
  { id: 't-1', restaurantId: 'rest-1', tableNumber: 'T-01', capacity: 2, status: 'available', section: 'Main Dining' },
  { id: 't-2', restaurantId: 'rest-1', tableNumber: 'T-02', capacity: 2, status: 'occupied', section: 'Main Dining', activeOrderId: 'ord-81' },
  { id: 't-3', restaurantId: 'rest-1', tableNumber: 'T-03', capacity: 4, status: 'available', section: 'Main Dining' },
  { id: 't-4', restaurantId: 'rest-1', tableNumber: 'T-04', capacity: 6, status: 'occupied', section: 'Terrace', activeOrderId: 'ord-82' },
  { id: 't-5', restaurantId: 'rest-1', tableNumber: 'T-05', capacity: 4, status: 'billing', section: 'Terrace' },
  { id: 't-6', restaurantId: 'rest-1', tableNumber: 'T-06', capacity: 8, status: 'available', section: 'Poolside' },
]

const MOCK_MENU: MenuItem[] = [
  { id: 'm-1', restaurantId: 'rest-1', category: 'Mains', name: 'Charred Prime Wagyu Ribeye', description: '12oz Australian Wagyu, black garlic glaze, truffle butter', price: 68, isVegetarian: false, isVegan: false, isSpicy: false, isAvailable: true, prepTimeMinutes: 20 },
  { id: 'm-2', restaurantId: 'rest-1', category: 'Mains', name: 'Pan-Seared Chilean Sea Bass', description: 'Asparagus risotto, champagne beurre blanc', price: 54, isVegetarian: false, isVegan: false, isSpicy: false, isAvailable: true, prepTimeMinutes: 18 },
  { id: 'm-3', restaurantId: 'rest-1', category: 'Appetizers', name: 'Heirloom Burrata & Peach Salad', description: 'Wild arugula, 25-yr balsamic, roasted pine nuts', price: 24, isVegetarian: true, isVegan: false, isSpicy: false, isAvailable: true, prepTimeMinutes: 8 },
  { id: 'm-4', restaurantId: 'rest-1', category: 'Appetizers', name: 'Maine Lobster Bisque', description: 'Cognac cream, butter-poached claw meat', price: 28, isVegetarian: false, isVegan: false, isSpicy: false, isAvailable: true, prepTimeMinutes: 10 },
  { id: 'm-5', restaurantId: 'rest-1', category: 'Desserts', name: 'Valrhona Molten Lava Cake', description: 'Bourbon vanilla bean gelato, raspberry coulis', price: 18, isVegetarian: true, isVegan: false, isSpicy: false, isAvailable: true, prepTimeMinutes: 12 },
  { id: 'm-6', restaurantId: 'rest-1', category: 'Cocktails', name: 'Smoked Mezcal Negroni', description: 'Artisanal mezcal, Campari, Antica Formula, orange peel', price: 22, isVegetarian: true, isVegan: true, isSpicy: false, isAvailable: true, prepTimeMinutes: 4 },
  { id: 'm-7', restaurantId: 'rest-1', category: 'Wine', name: 'Château Margaux Premier Grand Cru', description: 'Glass pour from Coravin preservation system', price: 95, isVegetarian: true, isVegan: true, isSpicy: false, isAvailable: true, prepTimeMinutes: 2 },
]

export const RestaurantPOS: React.FC = () => {
  const { success } = useToast()
  const [selectedTable, setSelectedTable] = useState<DiningTable>(MOCK_TABLES[0])
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [cart, setCart] = useState<CartOrderItem[]>([
    { menuItemId: 'm-1', name: 'Charred Prime Wagyu Ribeye', quantity: 2, unitPrice: 68 },
    { menuItemId: 'm-6', name: 'Smoked Mezcal Negroni', quantity: 2, unitPrice: 22 },
  ])
  const [isRoomPostOpen, setIsRoomPostOpen] = useState(false)
  const [targetRoom, setTargetRoom] = useState('501')

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

  // Fire Order to KOT
  const handleFireKOT = () => {
    if (cart.length === 0) return
    success(
      'KOT Generated & Dispatched to Kitchen',
      `Ticket sent to Grill and Bar stations for ${selectedTable.tableNumber}.`
    )
  }

  // Post to Room Folio
  const handleConfirmRoomPost = (e: React.FormEvent) => {
    e.preventDefault()
    success(
      'F&B Check Posted to Guest Folio',
      `$${total} posted to Room ${targetRoom} master folio. Check closed on ${selectedTable.tableNumber}.`
    )
    setIsRoomPostOpen(false)
    setCart([])
  }

  const filteredMenu =
    selectedCategory === 'All' ? MOCK_MENU : MOCK_MENU.filter((m) => m.category === selectedCategory)

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
      </div>

      {/* Table Floor Plan Grid */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">
          Table Floor Layout & Active Checks
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {MOCK_TABLES.map((table) => {
            const isSelected = selectedTable.id === table.id
            return (
              <button
                key={table.id}
                type="button"
                onClick={() => setSelectedTable(table)}
                className={`rounded-xl border p-3 text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-primary bg-primary/10 shadow-sm'
                    : 'border-border bg-card hover:border-border/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-foreground">{table.tableNumber}</span>
                  <span
                    className={`h-2 w-2 rounded-full ${
                      table.status === 'available'
                        ? 'bg-emerald-500'
                        : table.status === 'occupied'
                        ? 'bg-sky-500'
                        : 'bg-amber-500'
                    }`}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1 font-medium">{table.section}</p>
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
            {['All', 'Appetizers', 'Mains', 'Desserts', 'Cocktails', 'Wine'].map((cat) => (
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
                onClick={() => addToCart(item)}
                className="group cursor-pointer rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/60 hover:shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                      {item.name}
                    </h4>
                    <span className="font-mono font-bold text-sm text-foreground">${item.price}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between pt-2 border-t border-border/40 text-[10px] text-muted-foreground">
                  <span className="font-mono">Prep: ~{item.prepTimeMinutes}m</span>
                  <Button size="icon-sm" variant="ghost" className="h-6 w-6">
                    <Plus className="h-3.5 w-3.5 text-primary" />
                  </Button>
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
              <Badge variant={selectedTable.status === 'available' ? 'success' : 'info'}>
                {selectedTable.status.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-4 flex-1">
            {cart.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground">
                <UtensilsCrossed className="h-8 w-8 mx-auto opacity-40 mb-2" />
                Cart is currently empty. Tap menu items to add.
              </div>
            ) : (
              <div className="space-y-3 divide-y divide-border/60">
                {cart.map((item) => (
                  <div key={item.menuItemId} className="pt-2 first:pt-0 flex items-center justify-between gap-2 text-xs">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">{item.name}</p>
                      <span className="text-muted-foreground font-mono">${item.unitPrice} each</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="icon-sm"
                        variant="outline"
                        className="h-6 w-6"
                        onClick={() => updateQuantity(item.menuItemId, -1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-5 text-center font-bold font-mono">{item.quantity}</span>
                      <Button
                        size="icon-sm"
                        variant="outline"
                        className="h-6 w-6"
                        onClick={() => updateQuantity(item.menuItemId, 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <span className="font-mono font-bold w-12 text-right">
                      ${(item.unitPrice * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Price Calculations */}
            <div className="mt-6 pt-4 border-t border-border space-y-1.5 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal:</span>
                <span className="font-mono">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>VAT & Service (10%):</span>
                <span className="font-mono">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-foreground pt-1 border-t border-border">
                <span>Total Payable:</span>
                <span className="font-mono text-base text-primary">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-2">
              <Button
                className="w-full gap-2 bg-rose-600 hover:bg-rose-700 text-white"
                onClick={handleFireKOT}
                disabled={cart.length === 0}
              >
                <Flame className="h-4 w-4" />
                Fire KOT to Kitchen
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="gap-1.5 text-xs"
                  onClick={() => setIsRoomPostOpen(true)}
                  disabled={cart.length === 0}
                >
                  <Hotel className="h-3.5 w-3.5" />
                  Post to Room
                </Button>
                <Button
                  variant="outline"
                  className="gap-1.5 text-xs text-emerald-600"
                  onClick={() => {
                    success('Settlement complete via Terminal Card Reader')
                    setCart([])
                  }}
                  disabled={cart.length === 0}
                >
                  <CreditCard className="h-3.5 w-3.5" />
                  Pay at Table
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Post to Room Folio Modal */}
      <Modal
        isOpen={isRoomPostOpen}
        onClose={() => setIsRoomPostOpen(false)}
        title="Charge Check to In-House Guest Room"
        description={`Table ${selectedTable.tableNumber} • Total: $${total}`}
        maxWidth="sm"
      >
        <form onSubmit={handleConfirmRoomPost} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-foreground mb-1">Target In-House Room</label>
            <select
              value={targetRoom}
              onChange={(e) => setTargetRoom(e.target.value)}
              className="w-full rounded-lg border border-border bg-background p-2 text-xs text-foreground focus:ring-2 focus:ring-primary"
            >
              <option value="501">Room 501 - Lord Sterling Crawford (Penthouse)</option>
              <option value="304">Room 304 - Elena Rostova (Executive Suite)</option>
              <option value="208">Room 208 - Dr. Michael Thorne (Deluxe)</option>
              <option value="412">Room 412 - Kenji Takahashi (Executive)</option>
            </select>
          </div>

          <p className="text-[11px] text-muted-foreground">
            The full restaurant bill and itemized check will be attached to the active guest folio.
          </p>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setIsRoomPostOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Authorize Room Post</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
