import React from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useSubscription, SUBSCRIPTION_PLANS } from '@/context/SubscriptionContext'
import { SubscriptionTier } from '@/types'
import { Check, Sparkles, Lock, ArrowRight, ShieldCheck, Zap } from 'lucide-react'

export const SubscriptionUpgradeModal: React.FC = () => {
  const {
    currentPlan,
    isUpgradeModalOpen,
    closeUpgradeModal,
    upgradeModalContext,
    upgradePlan,
  } = useSubscription()

  if (!isUpgradeModalOpen) return null

  const requiredTier: SubscriptionTier = upgradeModalContext?.requiredPlan || 'professional'
  const featureName = upgradeModalContext?.featureName || 'Advanced Module'

  const plansList: SubscriptionTier[] = ['starter', 'professional', 'enterprise']

  return (
    <Modal
      isOpen={isUpgradeModalOpen}
      onClose={closeUpgradeModal}
      title="Unlock Premium Module"
      description={`"${featureName}" requires an upgrade from your current ${SUBSCRIPTION_PLANS[currentPlan].name} tier.`}
      maxWidth="4xl"
    >
      <div className="space-y-6 pt-2">
        {/* Banner Alert */}
        <div className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-800 dark:text-amber-300">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400">
            <Lock className="h-4 w-4" />
          </div>
          <div>
            <p className="font-semibold text-foreground">
              Module Locked: <span className="text-amber-600 dark:text-amber-400">{featureName}</span>
            </p>
            <p className="text-muted-foreground mt-0.5">
              Available on the <span className="font-bold text-foreground">{SUBSCRIPTION_PLANS[requiredTier].name}</span> plan and above. Upgrade instantly to unlock full real-time access.
            </p>
          </div>
        </div>

        {/* Pricing & Tier Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plansList.map((tierKey) => {
            const plan = SUBSCRIPTION_PLANS[tierKey]
            const isCurrent = currentPlan === tierKey
            const meetsRequirement =
              (tierKey === 'enterprise') ||
              (tierKey === 'professional' && requiredTier === 'professional') ||
              (tierKey === 'starter' && requiredTier === 'starter')

            return (
              <div
                key={tierKey}
                className={`relative flex flex-col justify-between rounded-xl border p-5 transition-all ${
                  isCurrent
                    ? 'border-primary/50 bg-primary/5 shadow-md'
                    : meetsRequirement
                    ? 'border-border bg-card hover:border-border/80 shadow-sm'
                    : 'border-border/60 bg-muted/20 opacity-70'
                }`}
              >
                {plan.isPopular && (
                  <span className="absolute -top-2.5 right-4 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
                    MOST POPULAR
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-sm text-foreground">{plan.name}</h4>
                    {isCurrent && (
                      <Badge variant="outline" className="text-[10px] font-semibold border-primary text-primary">
                        Active Plan
                      </Badge>
                    )}
                  </div>

                  <p className="text-[11px] text-muted-foreground mt-1 min-h-[32px]">{plan.tagline}</p>

                  <div className="mt-3 mb-4">
                    <span className="text-2xl font-black text-foreground">${plan.monthlyPrice}</span>
                    <span className="text-xs text-muted-foreground"> / month</span>
                  </div>

                  <div className="space-y-2 border-t border-border/50 pt-3 text-xs text-muted-foreground">
                    {plan.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-[11px] leading-tight text-foreground/90">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-2">
                  {isCurrent ? (
                    <Button variant="outline" disabled className="w-full text-xs">
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      variant={meetsRequirement ? 'default' : 'secondary'}
                      className="w-full text-xs gap-1.5 shadow-xs"
                      onClick={() => upgradePlan(tierKey)}
                    >
                      <span>Switch to {plan.name}</span>
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer Guarantee */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 rounded-xl bg-muted/40 p-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Instant provisioning • No lock-in contracts • Downgrade anytime</span>
          </div>
          <Button variant="ghost" size="sm" onClick={closeUpgradeModal} className="h-7 text-xs">
            Dismiss
          </Button>
        </div>
      </div>
    </Modal>
  )
}
