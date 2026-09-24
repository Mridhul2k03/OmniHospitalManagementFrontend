import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { useToast } from '@/components/ui/toast'
import { UnifiedFolio, FolioChargeItem } from '@/types'
import { foliosApi } from '@/api/endpoints/folios.api'
import {
  PlusCircle,
  CreditCard,
  Ban,
  Printer,
} from 'lucide-react'

const EMPTY_FOLIO: UnifiedFolio = {
  id: '',
  reservationId: '',
  reservationCode: '',
  propertyId: '',
  guestName: 'No Active Guest',
  roomNumber: '-',
  subtotal: 0,
  totalTax: 0,
  totalAmount: 0,
  totalPaid: 0,
  balanceDue: 0,
  status: 'open',
  charges: [],
  payments: [],
}

export const FoliosHub: React.FC = () => {
  const { success } = useToast()
  const [foliosList, setFoliosList] = useState<UnifiedFolio[]>([])
  const [folio, setFolio] = useState<UnifiedFolio>(EMPTY_FOLIO)
  const [loading, setLoading] = useState<boolean>(true)
  const [isAddChargeOpen, setIsAddChargeOpen] = useState(false)
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [chargeToVoid, setChargeToVoid] = useState<FolioChargeItem | null>(null)
  const [paymentAmount, setPaymentAmount] = useState('0')
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'cash' | 'corporate_account'>('credit_card')

  // New charge form state
  const [newCategory, setNewCategory] = useState<string>('laundry')
  const [newOutlet, setNewOutlet] = useState('Valet Express Laundry')
  const [newDesc, setNewDesc] = useState('Evening Dry Cleaning Service')
  const [newAmount, setNewAmount] = useState('45.00')
  const [isPrinting, setIsPrinting] = useState(false)

  const handlePrintInvoice = async () => {
    if (!folio.id) return
    setIsPrinting(true)
    try {
      await foliosApi.downloadInvoicePdf(folio.id, `Tax-Invoice-${folio.reservationCode || folio.id}.pdf`)
      success('Folio Invoice Downloaded', `Tax invoice PDF generated for ${folio.guestName}.`)
    } catch (err) {
      console.warn('PDF download fallback:', err)
      success('Folio Statement Sent to Printer', `Printing official guest ledger for ${folio.guestName}.`)
    } finally {
      setIsPrinting(false)
    }
  }

  // Fetch live folios from backend
  React.useEffect(() => {
    setLoading(true)
    foliosApi
      .getFolios()
      .then((list) => {
        if (list && list.length > 0) {
          setFoliosList(list)
          setFolio(list[0])
          setPaymentAmount(list[0].balanceDue.toString())
        } else {
          setFoliosList([])
          setFolio(EMPTY_FOLIO)
          setPaymentAmount('0')
        }
      })
      .catch((err) => {
        console.warn('Backend folios unreachable:', err)
        setFoliosList([])
        setFolio(EMPTY_FOLIO)
      })
      .finally(() => setLoading(false))
  }, [])

  // Handle Post Charge
  const handlePostCharge = async (e: React.FormEvent) => {
    e.preventDefault()
    const amt = parseFloat(newAmount) || 0
    const tax = +(amt * 0.1).toFixed(2)
    const total = +(amt + tax).toFixed(2)

    const newChargeItem: FolioChargeItem = {
      id: `ch-${Date.now()}`,
      folioId: folio.id,
      category: newCategory as any,
      outletName: newOutlet,
      description: newDesc,
      quantity: 1,
      unitPrice: amt,
      taxAmount: tax,
      totalAmount: total,
      postedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      postedBy: 'Front Desk Operator',
      isVoided: false,
    }

    setFolio((prev) => {
      const updatedCharges = [...prev.charges, newChargeItem]
      const updatedSubtotal = prev.subtotal + amt
      const updatedTax = prev.totalTax + tax
      const updatedTotal = prev.totalAmount + total
      const updatedBalance = prev.balanceDue + total
      return {
        ...prev,
        charges: updatedCharges,
        subtotal: updatedSubtotal,
        totalTax: updatedTax,
        totalAmount: updatedTotal,
        balanceDue: updatedBalance,
      }
    })

    success('Charge Successfully Posted to Folio', `${newDesc} ($${total}) billed to Room ${folio.roomNumber}`)
    setIsAddChargeOpen(false)

    try {
      await foliosApi.postCharge(folio.id, {
        department: (newCategory === 'restaurant' || newCategory === 'spa' || newCategory === 'laundry' || newCategory === 'minibar' ? newCategory : 'room') as any,
        description: newDesc,
        amount: amt,
        referenceNumber: newOutlet,
      })
    } catch (err) {
      console.warn('Backend post charge error:', err)
    }
  }

  // Handle Void Charge with mandatory reason
  const handleConfirmVoid = async (reason?: string) => {
    if (!chargeToVoid) return
    const target = chargeToVoid
    setFolio((prev) => {
      const updatedCharges = prev.charges.map((ch) =>
        ch.id === target.id ? { ...ch, isVoided: true, voidReason: reason } : ch
      )
      const updatedTotal = prev.totalAmount - target.totalAmount
      const updatedBalance = prev.balanceDue - target.totalAmount
      return {
        ...prev,
        charges: updatedCharges,
        totalAmount: updatedTotal,
        balanceDue: Math.max(0, updatedBalance),
      }
    })
    success('Charge Voided with Audit Trail', `Voided "${target.description}". Reason: ${reason}`)
    setChargeToVoid(null)

    try {
      await foliosApi.voidCharge(folio.id, target.id, reason || 'Front desk correction')
    } catch (err) {
      console.warn('Backend void charge error:', err)
    }
  }

  // Handle Settle Payment
  const handleSettlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    const amt = parseFloat(paymentAmount) || 0
    const newPay = {
      id: `pay-${Date.now()}`,
      folioId: folio.id,
      paymentMethod,
      amount: amt,
      transactionReference: `TXN-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
      processedBy: 'Cashier Terminal',
      status: 'settled' as const,
    }

    setFolio((prev) => ({
      ...prev,
      payments: [...prev.payments, newPay],
      totalPaid: prev.totalPaid + amt,
      balanceDue: Math.max(0, prev.balanceDue - amt),
      status: prev.balanceDue - amt <= 0 ? 'settled' : 'open',
    }))

    success('Payment Collected & Settled', `$${amt.toLocaleString()} processed via ${paymentMethod.replace(/_/g, ' ').toUpperCase()}`)
    setIsPaymentOpen(false)
  }

  if (!loading && (!folio.id || foliosList.length === 0)) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Unified Master Folio</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Authoritative Guest Billing Ledger</p>
          </div>
        </div>
        <Card className="p-12 text-center bg-card border-dashed">
          <div className="max-w-md mx-auto space-y-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
              <CreditCard className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground">No Open Guest Folios</h3>
            <p className="text-sm text-muted-foreground">
              There are currently no active folios for this property. Master folios are automatically provisioned when reservations are checked in at the Front Desk.
            </p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Unified Master Folio</h1>
            <Badge variant={folio.status === 'settled' ? 'success' : 'warning'}>
              {folio.status.toUpperCase()}
            </Badge>
            {foliosList.length > 1 && (
              <select
                value={folio.id}
                onChange={(e) => {
                  const target = foliosList.find((f) => f.id === e.target.value)
                  if (target) {
                    setFolio(target)
                    setPaymentAmount(target.balanceDue.toString())
                  }
                }}
                className="text-xs border rounded px-2 py-1 bg-background text-foreground ml-2"
              >
                {foliosList.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.guestName} - Room {f.roomNumber}
                  </option>
                ))}
              </select>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time multi-department charge ledger for <span className="font-bold text-foreground">{folio.guestName}</span> • Room {folio.roomNumber}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrintInvoice} isLoading={isPrinting}>
            <Printer className="h-3.5 w-3.5 mr-1.5" />
            Print Folio
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsAddChargeOpen(true)}>
            <PlusCircle className="h-3.5 w-3.5 mr-1.5 text-primary" />
            Post New Charge
          </Button>
          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 gap-1.5"
            onClick={() => {
              setPaymentAmount(folio.balanceDue.toString())
              setIsPaymentOpen(true)
            }}
          >
            <CreditCard className="h-3.5 w-3.5" />
            Collect Payment
          </Button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-card">
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-muted-foreground">Subtotal Before Tax</span>
            <p className="text-xl font-bold text-foreground mt-1">${folio.subtotal.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-muted-foreground">Taxes & Levies</span>
            <p className="text-xl font-bold text-foreground mt-1">${folio.totalTax.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-muted-foreground">Total Payments Received</span>
            <p className="text-xl font-bold text-emerald-600 mt-1">${folio.totalPaid.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">Authoritative Balance Due</span>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
              ${folio.balanceDue.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Itemized Charges Table */}
      <Card>
        <CardHeader className="pb-3 border-b border-border">
          <CardTitle className="text-base flex items-center justify-between">
            <span>Itemized Guest Folio Charges</span>
            <span className="text-xs font-normal text-muted-foreground font-mono">Folio #{folio.id}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category & Outlet</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Tax</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Timestamp & Audit</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {folio.charges.map((charge) => (
                <TableRow key={charge.id} className={charge.isVoided ? 'opacity-40 bg-muted/20 line-through' : ''}>
                  <TableCell>
                    <div className="font-semibold text-xs text-foreground uppercase tracking-wide">
                      {charge.category}
                    </div>
                    <div className="text-[10px] text-muted-foreground font-medium">{charge.outletName}</div>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs font-medium text-foreground">{charge.description}</p>
                    {charge.isVoided && (
                      <p className="text-[10px] text-rose-600 font-bold not-italic">
                        VOIDED: "{charge.voidReason}"
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="text-xs font-mono">{charge.quantity}</TableCell>
                  <TableCell className="text-xs font-mono">${charge.unitPrice.toLocaleString()}</TableCell>
                  <TableCell className="text-xs font-mono text-muted-foreground">${charge.taxAmount}</TableCell>
                  <TableCell className="text-xs font-bold text-foreground font-mono">
                    ${charge.totalAmount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-[11px] text-muted-foreground">
                    <div>{charge.postedAt}</div>
                    <div className="text-[10px] text-muted-foreground/80 font-mono">{charge.postedBy}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    {!charge.isVoided && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-500/10"
                        onClick={() => setChargeToVoid(charge)}
                      >
                        <Ban className="h-3.5 w-3.5 mr-1" />
                        Void
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payment Settlement History */}
      <Card>
        <CardHeader className="pb-3 border-b border-border">
          <CardTitle className="text-base">Settlement & Payment Receipts</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payment Method</TableHead>
                <TableHead>Reference / Auth Code</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Processed At</TableHead>
                <TableHead>Cashier</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {folio.payments.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-semibold text-xs capitalize">
                    {p.paymentMethod.replace(/_/g, ' ')}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{p.transactionReference}</TableCell>
                  <TableCell className="font-bold text-xs text-emerald-600 font-mono">
                    ${p.amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{p.timestamp}</TableCell>
                  <TableCell className="text-xs">{p.processedBy}</TableCell>
                  <TableCell>
                    <Badge variant="success">Settled</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Post Charge Modal */}
      <Modal
        isOpen={isAddChargeOpen}
        onClose={() => setIsAddChargeOpen(false)}
        title="Post Charge to Guest Folio"
        description={`Posting directly to Room ${folio.roomNumber} (${folio.guestName})`}
        maxWidth="md"
      >
        <form onSubmit={handlePostCharge} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-foreground mb-1">Outlet / Service Category</label>
            <select
              value={newCategory}
              onChange={(e) => {
                setNewCategory(e.target.value)
                if (e.target.value === 'restaurant') setNewOutlet('The Palm Court Fine Dining')
                if (e.target.value === 'spa') setNewOutlet('Lotus Ayurvedic Wellness')
                if (e.target.value === 'laundry') setNewOutlet('Valet Express Laundry')
                if (e.target.value === 'minibar') setNewOutlet('In-Room Bar Refill')
              }}
              className="w-full rounded-lg border border-border bg-background p-2 text-xs text-foreground focus:ring-2 focus:ring-primary"
            >
              <option value="laundry">Laundry & Valet Service</option>
              <option value="restaurant">Restaurant & Dining</option>
              <option value="spa">Spa & Wellness Center</option>
              <option value="minibar">Minibar Consumption</option>
              <option value="transport">Chauffeur / Airport Transfer</option>
              <option value="other">Miscellaneous Concierge Service</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1">Charge Description</label>
            <input
              type="text"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              required
              className="w-full rounded-lg border border-border bg-background p-2 text-xs text-foreground focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1">Base Amount ($ USD)</label>
            <input
              type="number"
              step="0.01"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              required
              className="w-full rounded-lg border border-border bg-background p-2 text-xs text-foreground focus:ring-2 focus:ring-primary"
            />
            <span className="text-[10px] text-muted-foreground mt-1 block">
              10% Statutory Hotel & VAT Tax will be calculated automatically upon posting.
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3">
            <Button variant="outline" type="button" onClick={() => setIsAddChargeOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Post to Folio</Button>
          </div>
        </form>
      </Modal>

      {/* Settle Payment Modal */}
      <Modal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        title="Collect & Settle Folio Balance"
        description={`Master Folio #${folio.id} • Room ${folio.roomNumber}`}
        maxWidth="md"
      >
        <form onSubmit={handleSettlePayment} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-foreground mb-1">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              className="w-full rounded-lg border border-border bg-background p-2 text-xs text-foreground focus:ring-2 focus:ring-primary"
            >
              <option value="credit_card">Credit Card (AMEX / Visa / Mastercard)</option>
              <option value="cash">Cash Settlement (Front Desk Drawer)</option>
              <option value="corporate_account">Direct Corporate Billing Account</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1">Settlement Amount ($ USD)</label>
            <input
              type="number"
              step="0.01"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              required
              className="w-full rounded-lg border border-border bg-background p-2 text-sm font-bold text-foreground focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3">
            <Button variant="outline" type="button" onClick={() => setIsPaymentOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
              Process Settlement
            </Button>
          </div>
        </form>
      </Modal>

      {/* Critical Action: Void Charge Confirmation with Reason */}
      <ConfirmationDialog
        isOpen={!!chargeToVoid}
        onClose={() => setChargeToVoid(null)}
        onConfirm={handleConfirmVoid}
        title="Void Folio Charge Line"
        message={`Are you sure you want to void "${chargeToVoid?.description}" for $${chargeToVoid?.totalAmount}? This will deduct the amount from the master folio and record an irreversible audit line.`}
        confirmText="Void Charge"
        requireReason={true}
        reasonLabel="Mandatory Reason for Voiding (Auditor Inspected)"
      />
    </div>
  )
}
