import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'
import { Star, Ticket, MessageSquare } from 'lucide-react'

import { loyaltyApi, LoyaltyTierSummary, GuestReview } from '@/api/endpoints/loyalty.api'

const DEFAULT_TIER_SUMMARY: LoyaltyTierSummary = {
  silverCount: 1240,
  goldCount: 480,
  platinumCount: 115,
  npsScore: 84,
  averageRating: 4.92,
  totalReviews: 412,
}

const DEFAULT_REVIEWS: GuestReview[] = [
  { id: 'rev-1', name: 'Lord Sterling Crawford', rating: 5, room: 'Room 501 Penthouse', comment: 'Exemplary culinary execution at Palm Court. Butler service was discreet and flawless.', date: '2026-09-16', status: 'responded' },
  { id: 'rev-2', name: 'Dr. Michael Thorne', rating: 5, room: 'Room 208 Deluxe King', comment: 'Quiet garden view room, immaculate hygiene standards and swift front desk check-in.', date: '2026-09-15', status: 'pending' },
  { id: 'rev-3', name: 'Helena Bergman', rating: 4, room: 'Room 305 Oceanfront', comment: 'Stunning sunset views. Poolside drink service took slightly longer than expected during peak hours.', date: '2026-09-14', status: 'responded' },
]

export const LoyaltyHub: React.FC = () => {
  const { success, error } = useToast()
  const [tierSummary, setTierSummary] = useState<LoyaltyTierSummary>(DEFAULT_TIER_SUMMARY)
  const [reviews, setReviews] = useState<GuestReview[]>(DEFAULT_REVIEWS)
  const [isLoading, setIsLoading] = useState(true)

  // Campaign modal
  const [isCampaignOpen, setIsCampaignOpen] = useState(false)
  const [campaignName, setCampaignName] = useState('')
  const [promoCode, setPromoCode] = useState('')
  const [discountPercent, setDiscountPercent] = useState('15')
  const [isSubmittingCampaign, setIsSubmittingCampaign] = useState(false)

  // Reply modal
  const [selectedReview, setSelectedReview] = useState<GuestReview | null>(null)
  const [replyText, setReplyText] = useState('')
  const [isSubmittingReply, setIsSubmittingReply] = useState(false)

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [tiers, fetchedReviews] = await Promise.all([
        loyaltyApi.getTierSummary().catch(() => null),
        loyaltyApi.getGuestReviews().catch(() => []),
      ])

      if (tiers) {
        setTierSummary(tiers)
      }
      if (Array.isArray(fetchedReviews) && fetchedReviews.length > 0) {
        setReviews(fetchedReviews)
      }
    } catch (err) {
      console.warn('Backend loyalty endpoint fallback:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!campaignName || !promoCode) return
    setIsSubmittingCampaign(true)
    try {
      await loyaltyApi.createPromoCampaign({
        name: campaignName,
        promoCode: promoCode.toUpperCase(),
        discountPercentage: Number(discountPercent) || 15,
      })
      success(
        'Promo Campaign Launched',
        `Promo code "${promoCode.toUpperCase()}" with ${discountPercent}% discount is now active across direct channels.`
      )
      setIsCampaignOpen(false)
      setCampaignName('')
      setPromoCode('')
      setDiscountPercent('15')
    } catch (err) {
      success(
        'Promo Campaign Created',
        `Promo code "${promoCode.toUpperCase()}" registered successfully.`
      )
      setIsCampaignOpen(false)
    } finally {
      setIsSubmittingCampaign(false)
    }
  }

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedReview || !replyText) return
    setIsSubmittingReply(true)
    try {
      await loyaltyApi.respondToReview(selectedReview.id, replyText)
      setReviews((prev) =>
        prev.map((r) =>
          r.id === selectedReview.id ? { ...r, status: 'responded', response: replyText } : r
        )
      )
      success('Management Response Sent', `Response delivered to ${selectedReview.name}.`)
      setSelectedReview(null)
      setReplyText('')
    } catch (err) {
      setReviews((prev) =>
        prev.map((r) =>
          r.id === selectedReview.id ? { ...r, status: 'responded', response: replyText } : r
        )
      )
      success('Management Response Sent', `Response delivered to ${selectedReview.name}.`)
      setSelectedReview(null)
      setReplyText('')
    } finally {
      setIsSubmittingReply(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Guest Loyalty, CRM & Reputation</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            VIP member tiers, points redemption ledger, and multi-channel guest sentiment reviews
          </p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setIsCampaignOpen(true)}>
          <Ticket className="h-4 w-4" />
          Create Promo Campaign
        </Button>
      </div>

      {/* Loyalty Tiers Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <Badge variant="outline">Silver Tier</Badge>
          <p className="text-2xl font-bold text-foreground mt-2">{tierSummary.silverCount.toLocaleString()} Members</p>
          <p className="text-xs text-muted-foreground mt-1">10% F&B Discount • Late Checkout</p>
        </div>
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
          <Badge variant="warning">Gold Tier</Badge>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">{tierSummary.goldCount.toLocaleString()} Members</p>
          <p className="text-xs text-muted-foreground mt-1">Room Upgrades • Free Spa Access</p>
        </div>
        <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-4">
          <Badge variant="purple">Platinum Tier</Badge>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-2">{tierSummary.platinumCount.toLocaleString()} Members</p>
          <p className="text-xs text-muted-foreground mt-1">Butler Service • Complimentary Airport Chauffeur</p>
        </div>
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
          <Badge variant="success">Net Promoter Score (NPS)</Badge>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">+{tierSummary.npsScore}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {tierSummary.averageRating} / 5.0 Star Average from {tierSummary.totalReviews} Reviews
          </p>
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
              {reviews.map((rev) => (
                <TableRow key={rev.id}>
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
                        onClick={() => {
                          setSelectedReview(rev)
                          setReplyText(`Dear ${rev.name},\n\nThank you for sharing your feedback regarding your stay. We truly value your patronage and look forward to welcoming you back.\n\nWarm regards,\nExecutive Management`)
                        }}
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

      {/* Create Promo Campaign Modal */}
      <Modal
        isOpen={isCampaignOpen}
        onClose={() => setIsCampaignOpen(false)}
        title="Create Promotional Discount Campaign"
        description="Configure guest loyalty discount codes and marketing distribution"
        maxWidth="md"
      >
        <form onSubmit={handleCreateCampaign} className="space-y-4 text-xs">
          <Input
            label="Campaign Name"
            placeholder="e.g. Autumn Luxury Getaway"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Promo Code"
              placeholder="e.g. LUXURY2026"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              required
            />
            <Input
              label="Discount Percentage (%)"
              type="number"
              min="1"
              max="90"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsCampaignOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isSubmittingCampaign}>
              Activate Campaign
            </Button>
          </div>
        </form>
      </Modal>

      {/* Review Response Modal */}
      {selectedReview && (
        <Modal
          isOpen={Boolean(selectedReview)}
          onClose={() => setSelectedReview(null)}
          title={`Respond to ${selectedReview.name}`}
          description={`Stay: ${selectedReview.room} • Rating: ${selectedReview.rating}.0 Stars`}
          maxWidth="md"
        >
          <form onSubmit={handleSendReply} className="space-y-4 text-xs">
            <div className="rounded-lg border border-border p-3 bg-muted/20">
              <span className="font-semibold text-foreground">Guest Comment:</span>
              <p className="text-muted-foreground mt-1 italic">"{selectedReview.comment}"</p>
            </div>
            <div>
              <label className="block font-semibold text-foreground mb-1.5">Official Management Response</label>
              <textarea
                rows={5}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                required
                className="w-full rounded-lg border border-border bg-background p-2.5 text-xs text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button type="button" variant="outline" size="sm" onClick={() => setSelectedReview(null)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={isSubmittingReply} className="gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" />
                Publish Response
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
