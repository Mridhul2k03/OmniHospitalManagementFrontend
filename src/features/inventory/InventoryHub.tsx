import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/toast'
import { InventoryStockItem } from '@/types'
import { inventoryApi } from '@/api/endpoints'
import { Plus } from 'lucide-react'

export const InventoryHub: React.FC = () => {
  const { success, error } = useToast()
  const [items, setItems] = useState<InventoryStockItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

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
        <Button size="sm" className="gap-1.5" onClick={() => success('Audit Started', 'Physical stock counting audit session started.')}>
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
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
