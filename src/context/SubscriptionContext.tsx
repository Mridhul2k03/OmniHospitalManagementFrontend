import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { SubscriptionTier, SubscriptionPlanDetails } from '@/types'
import { useToast } from '@/components/ui/toast'
import { apiClient } from '@/api/client/axios'

export const SUBSCRIPTION_PLANS: Record<SubscriptionTier, SubscriptionPlanDetails> = {
  starter: {
    id: 'starter',
    name: 'Starter Boutique',
    tagline: 'Essential PMS, front office & room operations for independent hotels',
    monthlyPrice: 199,
    annualPrice: 159,
    maxProperties: 1,
    maxRooms: 50,
    allowedModules: [
      'frontdesk',
      'rooms',
      'reservations',
      'checkin',
      'housekeeping',
      'maintenance',
      'folios',
      'settings',
    ],
    features: [
      'Single Property License (Up to 50 Rooms)',
      'Front Desk & Room Availability Matrix',
      'Guest Check-In & Folio Cashiering',
      'Housekeeping Cleanliness Queue',
      'Maintenance Work Orders',
      'Standard Invoicing & Payments',
    ],
  },
  professional: {
    id: 'professional',
    name: 'Professional Resort',
    tagline: 'Multi-outlet dining, events, spa & logistics for luxury resorts',
    monthlyPrice: 499,
    annualPrice: 399,
    maxProperties: 5,
    maxRooms: 500,
    isPopular: true,
    allowedModules: [
      'frontdesk',
      'rooms',
      'reservations',
      'checkin',
      'housekeeping',
      'maintenance',
      'folios',
      'finance',
      'settings',
      'pos',
      'kds',
      'events',
      'spa',
      'inventory',
      'transport',
      'security',
      'cloakroom',
      'hr',
      'loyalty',
      'students',
    ],
    features: [
      'Up to 5 Properties (Up to 500 Rooms)',
      'Everything in Starter',
      'Restaurant POS & Kitchen Display (KOT)',
      'Banquets, Events & Spa Wellness',
      'Inventory & Procurement Supply Chain',
      'Transport Fleet & Gate Security Access',
      'Staff HR Rostering & Loyalty Engine',
    ],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Global Enterprise',
    tagline: 'Unrestricted multi-property portfolio, AI pricing, OTA & Investor portal',
    monthlyPrice: 1299,
    annualPrice: 999,
    maxProperties: 999,
    maxRooms: 9999,
    allowedModules: [
      'frontdesk',
      'rooms',
      'reservations',
      'checkin',
      'housekeeping',
      'maintenance',
      'folios',
      'finance',
      'settings',
      'pos',
      'kds',
      'events',
      'spa',
      'inventory',
      'transport',
      'security',
      'cloakroom',
      'hr',
      'loyalty',
      'students',
      'pricing',
      'channels',
      'corporate',
      'shareholder',
      'system-status',
    ],
    features: [
      'Unlimited Properties & Global Key Inventory',
      'Everything in Professional',
      'Dynamic AI Yield & Rate Pricing Engine',
      'Global 2-Way OTA Channel Manager (Booking/Expedia)',
      'Executive Cross-Property Portfolio Dashboards',
      'Read-Only Shareholder & Investor Relations Portal',
      'System & API Telemetry Deep Diagnostics',
      'Dedicated 24/7 Enterprise SLA Support',
    ],
  },
}

const TIER_HIERARCHY: Record<SubscriptionTier, number> = {
  starter: 1,
  professional: 2,
  enterprise: 3,
}

export interface SubscriptionContextType {
  currentPlan: SubscriptionTier
  planDetails: SubscriptionPlanDetails
  isFeatureAllowed: (minPlan?: SubscriptionTier) => boolean
  upgradePlan: (newPlan: SubscriptionTier) => Promise<void>
  isUpgradeModalOpen: boolean
  openUpgradeModal: (featureName?: string, requiredPlan?: SubscriptionTier) => void
  closeUpgradeModal: () => void
  upgradeModalContext: { featureName: string; requiredPlan: SubscriptionTier } | null
}

export const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { success } = useToast()

  const [currentPlan, setCurrentPlan] = useState<SubscriptionTier>(() => {
    const saved = localStorage.getItem('hms_subscription_plan') as SubscriptionTier
    if (saved && SUBSCRIPTION_PLANS[saved]) {
      return saved
    }
    return 'enterprise' // Default to enterprise initially for full demo richness
  })

  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false)
  const [upgradeModalContext, setUpgradeModalContext] = useState<{
    featureName: string
    requiredPlan: SubscriptionTier
  } | null>(null)

  const isFeatureAllowed = useCallback(
    (minPlan?: SubscriptionTier): boolean => {
      if (!minPlan) return true
      return TIER_HIERARCHY[currentPlan] >= TIER_HIERARCHY[minPlan]
    },
    [currentPlan]
  )

  const upgradePlan = useCallback(
    async (newPlan: SubscriptionTier) => {
      setCurrentPlan(newPlan)
      localStorage.setItem('hms_subscription_plan', newPlan)

      try {
        // Persist to backend if API is reachable
        await apiClient.post('/organizations/switch-plan/', {
          subscription_tier: newPlan.toUpperCase(),
        })
      } catch {
        // Silently fallback if offline or demo mode
      }

      success(
        'Subscription Plan Updated',
        `Your organization has been switched to the ${SUBSCRIPTION_PLANS[newPlan].name} plan.`
      )
      setIsUpgradeModalOpen(false)
    },
    [success]
  )

  const openUpgradeModal = useCallback(
    (featureName: string = 'Premium Feature', requiredPlan: SubscriptionTier = 'professional') => {
      setUpgradeModalContext({ featureName, requiredPlan })
      setIsUpgradeModalOpen(true)
    },
    []
  )

  const closeUpgradeModal = useCallback(() => {
    setIsUpgradeModalOpen(false)
    setUpgradeModalContext(null)
  }, [])

  return (
    <SubscriptionContext.Provider
      value={{
        currentPlan,
        planDetails: SUBSCRIPTION_PLANS[currentPlan],
        isFeatureAllowed,
        upgradePlan,
        isUpgradeModalOpen,
        openUpgradeModal,
        closeUpgradeModal,
        upgradeModalContext,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  )
}

export const useSubscription = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext)
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider')
  }
  return context
}
