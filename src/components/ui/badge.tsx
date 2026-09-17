import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

export const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary/10 text-primary border border-primary/20',
        secondary: 'bg-secondary text-secondary-foreground border border-border',
        outline: 'text-foreground border border-border',
        success: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30',
        warning: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30',
        destructive: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/30',
        info: 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/30',
        purple: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/30',
        neutral: 'bg-muted text-muted-foreground border border-border',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean
}

export const Badge: React.FC<BadgeProps> = ({ className, variant, dot, children, ...props }) => {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </div>
  )
}

// Domain helper for Room Status badge
export const RoomStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  switch (status) {
    case 'available':
      return <Badge variant="success" dot>Available</Badge>
    case 'occupied':
      return <Badge variant="info" dot>Occupied</Badge>
    case 'reserved':
      return <Badge variant="purple" dot>Reserved</Badge>
    case 'dirty':
      return <Badge variant="destructive" dot>Dirty</Badge>
    case 'cleaning':
      return <Badge variant="warning" dot>Cleaning</Badge>
    case 'inspection':
      return <Badge variant="info" dot>Inspection</Badge>
    case 'out_of_order':
    case 'maintenance':
      return <Badge variant="destructive" dot>Maintenance</Badge>
    case 'blocked':
      return <Badge variant="neutral" dot>Blocked</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

// Domain helper for KOT Status badge
export const KOTStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  switch (status) {
    case 'new':
      return <Badge variant="info" dot>New</Badge>
    case 'accepted':
      return <Badge variant="purple" dot>Accepted</Badge>
    case 'preparing':
      return <Badge variant="warning" dot>Preparing</Badge>
    case 'ready':
      return <Badge variant="success" dot>Ready</Badge>
    case 'served':
      return <Badge variant="neutral">Served</Badge>
    case 'cancelled':
    case 'voided':
      return <Badge variant="destructive">Cancelled</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

// Domain helper for Reservation Status badge
export const ReservationStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  switch (status) {
    case 'confirmed':
      return <Badge variant="success">Confirmed</Badge>
    case 'in_house':
    case 'checked_in':
      return <Badge variant="info" dot>In-House</Badge>
    case 'pending':
      return <Badge variant="warning">Pending</Badge>
    case 'checked_out':
      return <Badge variant="neutral">Checked Out</Badge>
    case 'cancelled':
      return <Badge variant="destructive">Cancelled</Badge>
    case 'no_show':
      return <Badge variant="destructive">No Show</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}
