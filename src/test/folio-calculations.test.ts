import { describe, it, expect } from 'vitest'
import { FolioChargeItem, FolioPaymentItem } from '@/types'

export function calculateFolioBalance(
  charges: FolioChargeItem[],
  payments: FolioPaymentItem[]
) {
  const activeCharges = charges.filter((c) => !c.isVoided)
  const subtotal = activeCharges.reduce((acc, curr) => acc + curr.unitPrice * curr.quantity, 0)
  const totalTax = activeCharges.reduce((acc, curr) => acc + curr.taxAmount, 0)
  const totalAmount = subtotal + totalTax

  const totalPaid = payments
    .filter((p) => p.status === 'settled')
    .reduce((acc, curr) => acc + curr.amount, 0)

  const balanceDue = Math.max(0, Number((totalAmount - totalPaid).toFixed(2)))

  return {
    subtotal: Number(subtotal.toFixed(2)),
    totalTax: Number(totalTax.toFixed(2)),
    totalAmount: Number(totalAmount.toFixed(2)),
    totalPaid: Number(totalPaid.toFixed(2)),
    balanceDue,
  }
}

describe('Unified Folio & Calculation Invariants', () => {
  it('correctly aggregates multi-department charges and computes tax and balance due', () => {
    const charges: FolioChargeItem[] = [
      {
        id: 'c1',
        folioId: 'f1',
        category: 'room',
        outletName: 'Front Desk',
        description: 'Deluxe Ocean View (Night 1)',
        quantity: 1,
        unitPrice: 350.0,
        taxAmount: 42.0, // 12% tax
        totalAmount: 392.0,
        postedAt: '2026-09-17T18:00:00Z',
        postedBy: 'Desk Agent',
        isVoided: false,
      },
      {
        id: 'c2',
        folioId: 'f1',
        category: 'restaurant',
        outletName: 'L’Azur Fine Dining',
        description: 'Pan-Seared Wagyu Ribeye + Wine',
        quantity: 1,
        unitPrice: 120.0,
        taxAmount: 14.4,
        totalAmount: 134.4,
        postedAt: '2026-09-17T20:30:00Z',
        postedBy: 'Server Marc',
        isVoided: false,
      },
      {
        id: 'c3',
        folioId: 'f1',
        category: 'spa',
        outletName: 'Lotus Spa',
        description: 'Hot Stone Treatment',
        quantity: 1,
        unitPrice: 150.0,
        taxAmount: 18.0,
        totalAmount: 168.0,
        postedAt: '2026-09-17T21:00:00Z',
        postedBy: 'Therapist Maya',
        isVoided: true, // VOIDED WITH AUDIT REASON - SHOULD NOT BE BILLED
        voidReason: 'Guest rescheduled to tomorrow',
      },
    ]

    const payments: FolioPaymentItem[] = [
      {
        id: 'p1',
        folioId: 'f1',
        paymentMethod: 'credit_card',
        amount: 300.0,
        transactionReference: 'TXN-998182',
        timestamp: '2026-09-17T19:00:00Z',
        processedBy: 'Desk Agent',
        status: 'settled',
      },
    ]

    const result = calculateFolioBalance(charges, payments)

    // Expected:
    // Subtotal: 350 + 120 = 470.00
    // Tax: 42 + 14.4 = 56.40
    // Total Amount: 470 + 56.4 = 526.40
    // Total Paid: 300.00
    // Balance Due: 526.40 - 300 = 226.40
    expect(result.subtotal).toBe(470.0)
    expect(result.totalTax).toBe(56.4)
    expect(result.totalAmount).toBe(526.4)
    expect(result.totalPaid).toBe(300.0)
    expect(result.balanceDue).toBe(226.4)
  })
})
