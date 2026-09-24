import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/toast'
import { InventoryStockItem } from '@/types'
import { inventoryApi } from '@/api/endpoints'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Plus, PackagePlus, ArrowUpCircle, ArrowDownCircle } from 'lucide-react'

export const InventoryHub: React.FC = () => {
  const { success, error } = useToast()
  const [items, setItems] = useState<InventoryStockItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddOpen, setIsAddOpen] = useState(false)

  // New item form
  const [name, setName] = useState('')
  const [category, setCategory] = useState('Room Amenities')
  const [unit, setUnit] = useState('Pieces')
  const [currentStock, setCurrentStock] = useState('50')
  const [reorderPoint, setReorderPoint] = useState('20')
  const [storeLocation, setStoreLocation] = useState('Central Warehouse A')

  useEffect(() => {
    let mounted = true
    setIsLoading(true)
    inventoryApi
      .getStockItems()
      .then((data) => {
        if (mounted) setItems(data)
      })
      .catch((err) => {
        console.warn('Failed to load inventory stock:', err)
      })
      .finally(() => {
        if (mounted) setIsLoading(false)
      })
    return () => {
      mounted = false
    }
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
      success(
        'Purchase Order Generated',
        `PO ${po.poNumber || ''} dispatched for ${item.name} (${neededQty} ${item.unit}).`
      )
    } catch (err) {
      error('PO Generation Failed', 'Unable to dispatch purchase order.')
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
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => success('Audit Started', 'Physical stock counting audit session started.')}>
            Start Stock Count
          </Button>
          <Button size="sm" className="gap-1.5" onClick={() => setIsAddOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Stock Item
          </Button>
        </div>
      </div>

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
    </div>
  )
}
