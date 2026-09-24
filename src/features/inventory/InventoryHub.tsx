import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/toast'
import { InventoryStockItem } from '@/types'
import { inventoryApi } from '@/api/endpoints'
import { operationsApi } from '@/api/endpoints/operations.api'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Plus, PackagePlus, ArrowUpCircle, ArrowDownCircle, FileText, ShoppingBag, RefreshCw, CheckCircle2, Clock, Truck } from 'lucide-react'

interface PurchaseOrderRecord {
  id: string
  poNumber: string
  itemName: string
  quantity: number
  status: string
  supplierName: string
  createdAt: string
  totalCost: number
}

const DEFAULT_POS: PurchaseOrderRecord[] = [
  {
    id: 'po-101',
    poNumber: 'PO-2026-0891',
    itemName: 'Egyptian Cotton Bath Linens (King)',
    quantity: 120,
    status: 'Delivered',
    supplierName: 'Grand Hotelier Textiles Ltd',
    createdAt: '2026-09-20',
    totalCost: 3840,
  },
  {
    id: 'po-102',
    poNumber: 'PO-2026-0892',
    itemName: 'Artisan Espresso Roasted Beans (5kg bags)',
    quantity: 40,
    status: 'In Transit',
    supplierName: 'Blue Ridge Roasters',
    createdAt: '2026-09-22',
    totalCost: 1480,
  },
  {
    id: 'po-103',
    poNumber: 'PO-2026-0893',
    itemName: 'Organic Bergamot & Amber Shampoo 250ml',
    quantity: 350,
    status: 'Approved',
    supplierName: 'Aura Luxury Botanicals',
    createdAt: '2026-09-23',
    totalCost: 2100,
  },
  {
    id: 'po-104',
    poNumber: 'PO-2026-0894',
    itemName: 'Stainless Keycard RFID Transponders',
    quantity: 500,
    status: 'Pending',
    supplierName: 'VingCard Assa Abloy',
    createdAt: '2026-09-24',
    totalCost: 1250,
  },
]

export const InventoryHub: React.FC = () => {
  const { success, error } = useToast()
  const [items, setItems] = useState<InventoryStockItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'stock' | 'pos'>('stock')
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderRecord[]>(DEFAULT_POS)
  const [isLoadingPOs, setIsLoadingPOs] = useState(false)

  // New item form
  const [name, setName] = useState('')
  const [category, setCategory] = useState('Room Amenities')
  const [unit, setUnit] = useState('Pieces')
  const [currentStock, setCurrentStock] = useState('50')
  const [reorderPoint, setReorderPoint] = useState('20')
  const [storeLocation, setStoreLocation] = useState('Central Warehouse A')

  const loadStock = () => {
    setIsLoading(true)
    inventoryApi
      .getStockItems()
      .then((data) => {
        if (data && data.length > 0) setItems(data)
      })
      .catch((err) => {
        console.warn('Failed to load inventory stock:', err)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const loadPurchaseOrders = () => {
    setIsLoadingPOs(true)
    operationsApi
      .getPurchaseOrders()
      .then((pos) => {
        if (Array.isArray(pos) && pos.length > 0) {
          setPurchaseOrders(pos)
        }
      })
      .catch((err) => {
        console.warn('Failed to load purchase orders from API:', err)
      })
      .finally(() => {
        setIsLoadingPOs(false)
      })
  }

  useEffect(() => {
    loadStock()
    loadPurchaseOrders()
  }, [])

  const handleCreateStockItem = async (e: React.FormEvent) => {
    e.preventDefault()
    const stockNum = parseInt(currentStock) || 0
    const reorderNum = parseInt(reorderPoint) || 0
    const payload: Partial<InventoryStockItem> = {
      propertyId: 'prop-001',
      name,
      category,
      unit,
      currentStock: stockNum,
      reorderPoint: reorderNum,
      storeLocation,
      status: stockNum <= reorderNum ? 'low_stock' : 'optimal',
    }

    try {
      const created = await inventoryApi.createStockItem(payload)
      setItems((prev) => [created, ...prev])
      success('Inventory Item Registered', `${created.name} added to central store inventory.`)
      setIsAddOpen(false)
      setName('')
    } catch {
      error('Creation Failed', 'Could not create inventory stock item.')
    }
  }

  const handleAdjustStock = async (item: InventoryStockItem, delta: number) => {
    const newStock = Math.max(0, item.currentStock + delta)
    const newStatus = newStock === 0 ? 'out_of_stock' : newStock <= item.reorderPoint ? 'low_stock' : 'optimal'

    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, currentStock: newStock, status: newStatus as any } : i))
    )

    try {
      await inventoryApi.adjustStock(item.id, newStock, newStatus)
      success('Stock Adjusted', `${item.name} level updated to ${newStock} ${item.unit}.`)
    } catch (err) {
      console.warn('Stock adjustment API error:', err)
    }
  }

  const handleCreatePO = async (item: InventoryStockItem) => {
    try {
      const neededQty = Math.max(10, item.reorderPoint - item.currentStock)
      const po = await inventoryApi.createPO(item.id, neededQty)
      const newPO: PurchaseOrderRecord = {
        id: `po-${Date.now()}`,
        poNumber: po.poNumber || `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        itemName: item.name,
        quantity: neededQty,
        status: 'Pending',
        supplierName: 'Designated Master Supplier',
        createdAt: new Date().toISOString().split('T')[0],
        totalCost: neededQty * 25,
      }
      setPurchaseOrders((prev) => [newPO, ...prev])
      success(
        'Purchase Order Generated',
        `PO ${newPO.poNumber} dispatched for ${item.name} (${neededQty} ${item.unit}).`
      )
    } catch (err) {
      error('PO Generation Failed', 'Unable to dispatch purchase order.')
    }
  }

  // Physical Stock Count Audit State
  const [isStockCountOpen, setIsStockCountOpen] = useState(false)
  const [auditCounts, setAuditCounts] = useState<Record<string, number>>({})
  const [isSubmittingAudit, setIsSubmittingAudit] = useState(false)

  const handleStartStockCount = () => {
    const initial: Record<string, number> = {}
    items.forEach((item) => {
      initial[item.id] = item.currentStock
    })
    setAuditCounts(initial)
    setIsStockCountOpen(true)
  }

  const handleCommitStockAudit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmittingAudit(true)
    let adjustedCount = 0

    try {
      for (const item of items) {
        const counted = auditCounts[item.id]
        if (counted !== undefined && counted !== item.currentStock) {
          adjustedCount++
          const newStatus = counted === 0 ? 'out_of_stock' : counted <= item.reorderPoint ? 'low_stock' : 'optimal'
          await inventoryApi.adjustStock(item.id, counted, newStatus)
        }
      }

      setItems((prev) =>
        prev.map((i) => {
          const counted = auditCounts[i.id]
          if (counted !== undefined) {
            const newStatus = counted === 0 ? 'out_of_stock' : counted <= i.reorderPoint ? 'low_stock' : 'optimal'
            return { ...i, currentStock: counted, status: newStatus as any }
          }
          return i
        })
      )

      success(
        'Physical Stock Audit Completed',
        `Reconciled ${items.length} inventory lines. ${adjustedCount} discrepancies committed to ledger.`
      )
      setIsStockCountOpen(false)
    } catch (err) {
      error('Stock Audit Failed', 'Could not record all physical stock adjustments.')
    } finally {
      setIsSubmittingAudit(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Inventory & Procurement</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Store stock levels, batch tracking, automated low-stock POs, and vendor catalog
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="gap-1.5" onClick={handleStartStockCount}>
            Start Stock Count
          </Button>
          <Button size="sm" className="gap-1.5" onClick={() => setIsAddOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Stock Item
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('stock')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'stock'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <PackagePlus className="h-3.5 w-3.5" />
          <span>Central Storehouse Par Levels</span>
          <Badge variant={activeTab === 'stock' ? 'secondary' : 'outline'} className="ml-1 text-[10px] px-1.5 py-0">
            {items.length}
          </Badge>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('pos')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'pos'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <FileText className="h-3.5 w-3.5" />
          <span>Purchase Order History</span>
          <Badge variant={activeTab === 'pos' ? 'secondary' : 'outline'} className="ml-1 text-[10px] px-1.5 py-0">
            {purchaseOrders.length}
          </Badge>
        </button>
      </div>

      {activeTab === 'stock' ? (
        <Card>
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-base">Central Storehouse Par Levels</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Store Location</TableHead>
                  <TableHead>Current Quantity</TableHead>
                  <TableHead>Par Level</TableHead>
                  <TableHead>Stock Health</TableHead>
                  <TableHead className="text-right">Procurement Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-xs">
                      {isLoading ? 'Loading stock items...' : 'No inventory items recorded in central storehouse.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-bold text-xs text-foreground">{item.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.category}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{item.storeLocation}</TableCell>
                      <TableCell className="font-mono font-bold text-xs text-foreground">
                        {item.currentStock} {item.unit}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {item.reorderPoint} {item.unit}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            item.status === 'optimal'
                              ? 'success'
                              : item.status === 'low_stock'
                              ? 'warning'
                              : 'destructive'
                          }
                        >
                          {item.status.replace(/_/g, ' ').toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                            title="Reduce stock (-1)"
                            onClick={() => handleAdjustStock(item, -1)}
                          >
                            -
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                            title="Add stock (+5)"
                            onClick={() => handleAdjustStock(item, 5)}
                          >
                            +
                          </Button>
                          {item.status !== 'optimal' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs border-amber-500/30 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10 ml-1"
                              onClick={() => handleCreatePO(item)}
                            >
                              Generate PO
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3 border-b border-border flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Procurement & Purchase Order Manifest</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Automated and manually fired vendor purchase orders</p>
            </div>
            <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8" onClick={loadPurchaseOrders} disabled={isLoadingPOs}>
              <RefreshCw className={`h-3.5 w-3.5 ${isLoadingPOs ? 'animate-spin' : ''}`} />
              Refresh Orders
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PO Number</TableHead>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Supplier / Vendor</TableHead>
                  <TableHead>Order Quantity</TableHead>
                  <TableHead>Estimated Cost</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchaseOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-xs">
                      {isLoadingPOs ? 'Loading purchase orders...' : 'No purchase orders generated yet.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  purchaseOrders.map((po) => (
                    <TableRow key={po.id}>
                      <TableCell className="font-mono font-bold text-xs text-primary">{po.poNumber}</TableCell>
                      <TableCell className="font-semibold text-xs text-foreground">{po.itemName}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{po.supplierName}</TableCell>
                      <TableCell className="font-mono font-semibold text-xs text-foreground">{po.quantity} units</TableCell>
                      <TableCell className="font-mono text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                        ${po.totalCost?.toLocaleString() || '0'}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{po.createdAt}</TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant={
                            po.status === 'Delivered'
                              ? 'success'
                              : po.status === 'In Transit'
                              ? 'secondary'
                              : po.status === 'Approved'
                              ? 'outline'
                              : 'warning'
                          }
                        >
                          {po.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Add Stock Item Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Register Inventory Stock Item"
        description="Add supplies, guest amenities, or culinary ingredients to the central storehouse"
        maxWidth="md"
      >
        <form onSubmit={handleCreateStockItem} className="space-y-4 text-xs">
          <Input
            label="Item Description / Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Organic Cotton Bathrobes (XL)"
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-foreground mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-border bg-background p-2 text-xs text-foreground focus:ring-2 focus:ring-primary"
              >
                <option value="Room Amenities">Room Amenities</option>
                <option value="Linens & Bedding">Linens & Bedding</option>
                <option value="F&B Provisions">F&B Provisions</option>
                <option value="Housekeeping Supplies">Housekeeping Supplies</option>
                <option value="Engineering & Parts">Engineering & Parts</option>
              </select>
            </div>
            <Input
              label="Packaging Unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="Bottles / Pieces / Kg"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Initial Quantity In-Stock"
              type="number"
              value={currentStock}
              onChange={(e) => setCurrentStock(e.target.value)}
              required
            />
            <Input
              label="Reorder Threshold (Par Level)"
              type="number"
              value={reorderPoint}
              onChange={(e) => setReorderPoint(e.target.value)}
              required
            />
          </div>
          <Input
            label="Warehouse / Storage Location"
            value={storeLocation}
            onChange={(e) => setStoreLocation(e.target.value)}
            placeholder="e.g. Central Warehouse A, Rack 04"
            required
          />
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Register Stock Item
            </Button>
          </div>
        </form>
      </Modal>

      {/* Physical Stock Count Audit Modal */}
      <Modal
        isOpen={isStockCountOpen}
        onClose={() => setIsStockCountOpen(false)}
        title="Physical Inventory Stock Count Audit"
        description="Verify floor quantities and commit actual counts to the general store ledger"
        maxWidth="lg"
      >
        <form onSubmit={handleCommitStockAudit} className="space-y-4 text-xs">
          <div className="max-h-80 overflow-y-auto border border-border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>System Qty</TableHead>
                  <TableHead>Actual Physical Count</TableHead>
                  <TableHead className="text-right">Variance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => {
                  const counted = auditCounts[item.id] !== undefined ? auditCounts[item.id] : item.currentStock
                  const variance = counted - item.currentStock
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-semibold text-foreground">{item.name}</TableCell>
                      <TableCell className="text-muted-foreground">{item.storeLocation}</TableCell>
                      <TableCell className="font-mono">{item.currentStock} {item.unit}</TableCell>
                      <TableCell>
                        <input
                          type="number"
                          min="0"
                          value={counted}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0
                            setAuditCounts((prev) => ({ ...prev, [item.id]: val }))
                          }}
                          className="w-24 rounded border border-border bg-background px-2 py-1 font-mono text-xs focus:ring-1 focus:ring-primary"
                        />
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold">
                        <span className={variance === 0 ? 'text-muted-foreground' : variance > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                          {variance > 0 ? `+${variance}` : variance} {item.unit}
                        </span>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setIsStockCountOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmittingAudit}>
              {isSubmittingAudit ? 'Committing Adjustments...' : 'Commit Physical Stock Audit'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
