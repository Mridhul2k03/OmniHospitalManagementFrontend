import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { Star, Ticket } from 'lucide-react'

export const LoyaltyHub: React.FC = () => {
  const { success } = useToast()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Guest Loyalty, CRM & Reputation</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            VIP member tiers, points redemption ledger, and multi-channel guest sentiment reviews
          </p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => success('New promo code generated and distributed')}>
          <Ticket className="h-4 w-4" />
          Create Promo Campaign
        </Button>
      </div>

      {/* Loyalty Tiers Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <Badge variant="outline">Silver Tier</Badge>
          <p className="text-2xl font-bold text-foreground mt-2">1,240 Members</p>
          <p className="text-xs text-muted-foreground mt-1">10% F&B Discount • Late Checkout</p>
        </div>
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
          <Badge variant="warning">Gold Tier</Badge>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">480 Members</p>
          <p className="text-xs text-muted-foreground mt-1">Room Upgrades • Free Spa Access</p>
        </div>
        <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-4">
          <Badge variant="purple">Platinum Tier</Badge>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-2">115 Members</p>
          <p className="text-xs text-muted-foreground mt-1">Butler Service • Complimentary Airport Chauffeur</p>
        </div>
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
          <Badge variant="success">Net Promoter Score (NPS)</Badge>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">+84</p>
          <p className="text-xs text-muted-foreground mt-1">4.92 / 5.0 Star Average from 412 Reviews</p>
        </div>
      </div>

      {/* Guest Reviews Sentiment Feed */}
      <Card>
        <CardHeader className="pb-3 border-b border-border">
          <CardTitle className="text-base flex items-center justify-between">
            <span>Verified In-Stay & Post-Departure Reviews</span>
            <Badge variant="outline">Sentiment AI Monitored</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Guest Reviewer</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Stay Reference</TableHead>
                <TableHead>Feedback & Sentiment</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Management Response</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { name: 'Lord Sterling Crawford', rating: 5, room: 'Room 501 Penthouse', comment: 'Exemplary culinary execution at Palm Court. Butler service was discreet and flawless.', date: '2026-09-16', status: 'responded' },
                { name: 'Dr. Michael Thorne', rating: 5, room: 'Room 208 Deluxe King', comment: 'Quiet garden view room, immaculate hygiene standards and swift front desk check-in.', date: '2026-09-15', status: 'pending' },
                { name: 'Helena Bergman', rating: 4, room: 'Room 305 Oceanfront', comment: 'Stunning sunset views. Poolside drink service took slightly longer than expected during peak hours.', date: '2026-09-14', status: 'responded' },
              ].map((rev, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-bold text-xs text-foreground">{rev.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center text-amber-500 font-bold text-xs">
                      <Star className="h-3.5 w-3.5 fill-current mr-1" />
                      <span>{rev.rating}.0</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono">{rev.room}</TableCell>
                  <TableCell className="text-xs text-foreground max-w-md">{rev.comment}</TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono">{rev.date}</TableCell>
                  <TableCell className="text-right">
                    {rev.status === 'responded' ? (
                      <Badge variant="success">Responded</Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() => success('Management response sent to guest')}
                      >
                        Reply
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
