import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTenant } from '@/context/useTenant'
import { useToast } from '@/components/ui/toast'
import { Building2, DollarSign, Save, Crown, Check } from 'lucide-react'
import { useSubscription, SUBSCRIPTION_PLANS } from '@/context/SubscriptionContext'

export const SettingsHub: React.FC = () => {
  const { activeProperty, activeOrg } = useTenant()
  const { success } = useToast()

  const [propName, setPropName] = useState(activeProperty.name)
  const [checkInTime, setCheckInTime] = useState(activeProperty.checkInTime)
  const [checkOutTime, setCheckOutTime] = useState(activeProperty.checkOutTime)
  const [phone, setPhone] = useState(activeProperty.phone)
  const [email, setEmail] = useState(activeProperty.email)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    success('Property Policies Saved', 'Updated operational check-in/out parameters and contact records.')
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Property & System Settings</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Operational policies, tax configuration, and property master parameters
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              <span>Property Master Profile</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Property Registered Name" value={propName} onChange={(e) => setPropName(e.target.value)} />
              <Input label="Property Code (PMS Code)" value={activeProperty.code} disabled />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Contact Telephone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <Input label="Concierge Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Standard Check-In Time" value={checkInTime} onChange={(e) => setCheckInTime(e.target.value)} />
              <Input label="Standard Check-Out Time" value={checkOutTime} onChange={(e) => setCheckOutTime(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-600" />
              <span>Financial & Tax Configuration</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-3 text-xs">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <span className="text-muted-foreground font-semibold block mb-1">Base Currency:</span>
                <p className="font-mono font-bold text-foreground text-sm">{activeOrg.currency} (United States Dollar)</p>
              </div>
              <div>
                <span className="text-muted-foreground font-semibold block mb-1">State Hotel Occupancy Tax:</span>
                <p className="font-mono font-bold text-foreground text-sm">8.875% Statutory</p>
              </div>
              <div>
                <span className="text-muted-foreground font-semibold block mb-1">City Hotel Unit Fee:</span>
                <p className="font-mono font-bold text-foreground text-sm">$1.50 / key / night</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Plan & License Tier */}
        <SubscriptionSettingsCard />

        <div className="flex justify-end">
          <Button type="submit" className="gap-2">
            <Save className="h-4 w-4" />
            Save Configuration Changes
          </Button>
        </div>
      </form>
    </div>
  )
}

const SubscriptionSettingsCard: React.FC = () => {
  const { currentPlan, upgradePlan } = useSubscription()
  const tiers: ('starter' | 'professional' | 'enterprise')[] = ['starter', 'professional', 'enterprise']

  return (
    <Card>
      <CardHeader className="pb-3 border-b border-border">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Crown className="h-4 w-4 text-amber-500" />
            <span>Organization Subscription & Plan Tier</span>
          </CardTitle>
          <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            Current: {currentPlan}
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-4 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tiers.map((t) => {
            const plan = SUBSCRIPTION_PLANS[t]
            const isCurrent = currentPlan === t
            return (
              <div
                key={t}
                className={`relative flex flex-col justify-between rounded-xl border p-4 transition-all ${
                  isCurrent
                    ? 'border-primary bg-primary/5 shadow-xs'
                    : 'border-border bg-card/60 hover:border-border/80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-foreground">{plan.name}</h4>
                    {isCurrent && (
                      <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[9px] font-bold text-primary uppercase">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1 mb-2">{plan.tagline}</p>
                  <p className="text-xl font-extrabold text-foreground mb-3">
                    ${plan.monthlyPrice} <span className="text-xs font-normal text-muted-foreground">/mo</span>
                  </p>
                  <ul className="space-y-1.5 border-t border-border/50 pt-2 text-[11px] text-muted-foreground">
                    {plan.features.slice(0, 4).map((f, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <Check className="h-3 w-3 text-emerald-500 shrink-0" />
                        <span className="truncate">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 pt-2">
                  <Button
                    type="button"
                    variant={isCurrent ? 'outline' : 'default'}
                    disabled={isCurrent}
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => upgradePlan(t)}
                  >
                    {isCurrent ? 'Current Tier' : `Switch to ${plan.name}`}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
