import React from 'react'
import { useSubscription } from '@/context/SubscriptionContext'
import { SubscriptionTier } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Lock, ArrowRight, Sparkles } from 'lucide-react'

interface RequirePlanProps {
  children: React.ReactNode
  minPlan: SubscriptionTier
  featureName?: string
}

export const RequirePlan: React.FC<RequirePlanProps> = ({
  children,
  minPlan,
  featureName = 'This operational module',
}) => {
  const { isFeatureAllowed, openUpgradeModal, planDetails } = useSubscription()

  if (isFeatureAllowed(minPlan)) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-[65vh] items-center justify-center p-4">
      <Card className="max-w-md border-amber-500/30 bg-card shadow-xl">
        <CardContent className="p-6 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <Lock className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              {minPlan.toUpperCase()} Plan Required
            </h2>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              <span className="font-semibold text-foreground">{featureName}</span> is not available on your current <span className="font-semibold text-foreground">{planDetails.name}</span> subscription.
            </p>
          </div>
          <div className="pt-2 flex justify-center">
            <Button
              className="gap-2 shadow-xs text-xs"
              onClick={() => openUpgradeModal(featureName, minPlan)}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Unlock with {minPlan.toUpperCase()}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
