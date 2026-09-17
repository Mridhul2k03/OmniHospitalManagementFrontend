import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/toast'
import { Plus } from 'lucide-react'

interface InventoryStockItem {
  id: string
  name: string
  category: 'F&B Provisions' | 'Guest Amenities' | 'Linens' | 'Engineering Spares' | 'Bar Spirits'
  currentStock: number
  reorderPoint: number
  unit: string
  storeLocation: string
  status: 'optimal' | 'low_stock' | 'reorder_required'
}

const MOCK_STOCK_ITEMS: InventoryStockItem[] = [
  { id: 'inv-1', name: 'Macallan 18 Single Malt Scotch', category: 'Bar Spirits', currentStock: 8, reorderPoint: 12, unit: 'Bottles (750ml)', storeLocation: 'Main Cellar Vault', status: 'low_stock' },
  { id: 'inv-2', name: 'Bulgari White Tea Luxury Shampoo 75ml', category: 'Guest Amenities', currentStock: 450, reorderPoint: 200, unit: 'Pieces', storeLocation: 'Housekeeping Central Store', status: 'optimal' },
  { id: 'inv-3', name: 'Egyptian Cotton Bath Sheets (White)', category: 'Linens', currentStock: 120, reorderPoint: 80, unit: 'Sheets', storeLocation: 'Laundry Warehouse', status: 'optimal' },
  { id: 'inv-4', name: 'HVAC Blower Motor Fan Belts #A42', category: 'Engineering Spares', currentStock: 2, reorderPoint: 6, unit: 'Units', storeLocation: 'Engineering Workshop', status: 'reorder_required' },
  { id: 'inv-5', name: 'Australian Wagyu Striploin MB9+', category: 'F&B Provisions', currentStock: 14, reorderPoint: 20, unit: 'Kilograms', storeLocation: 'Walk-In Meat Chiller', status: 'low_stock' },
]

export const InventoryHub: React.FC = () => {
  const { success } = useToast()
  const [items] = useState<InventoryStockItem[]>(MOCK_STOCK_ITEMS)

  const handleCreatePO = (item: InventoryStockItem) => {
    success('Purchase Order Generated', `Automated PO dispatched to certified vendor for ${item.name}.`)
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
        <Button size="sm" className="gap-1.5" onClick={() => success('Stock counting audit session started')}>
          <Plus className="h-4 w-4" />
          Start Physical Stock Count
        </Button>
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
              {items.map((item) => (
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
                    {item.status !== 'optimal' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs border-amber-500/30 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10"
                        onClick={() => handleCreatePO(item)}
                      >
                        Generate PO
                      </Button>
                    )}
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
