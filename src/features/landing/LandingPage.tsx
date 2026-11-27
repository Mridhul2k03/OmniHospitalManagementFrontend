import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Building2,
  CalendarCheck2,
  ChefHat,
  CreditCard,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Layers,
  BedDouble,
  Wrench,
  Package,
  BarChart3,
  Lock,
} from 'lucide-react'
import { useAuth } from '@/auth/useAuth'

type ModuleTab = 'pms' | 'pos' | 'operations' | 'governance'

const MODULE_TABS: Record<
  ModuleTab,
  {
    label: string
    title: string
    summary: string
    bullets: string[]
    metrics: { label: string; value: string }[]
  }
> = {
  pms: {
    label: 'PMS & Front Office',
    title: 'Concurrency-Safe Reservations, Check-In & Room Inventory',
    summary:
      'Manage multi-property room inventory, rate plans, digital check-in, room transfers, and stay logs from one unified operational console.',
    bullets: [
      'Atomic room availability locking prevents double-booking under peak load',
      'End-to-end stay lifecycle: Search → Hold → Confirm → Check-In → Check-Out',
      'Real-time room board across floors, buildings, and room categories',
    ],
    metrics: [
      { label: 'Inventory Model', value: 'Single Source' },
      { label: 'Check-In Flow', value: 'Digital + Desk' },
      { label: 'Scope', value: 'Multi-Property' },
    ],
  },
  pos: {
    label: 'POS, KOT & KDS',
    title: 'Synchronized Restaurant POS & Live Kitchen Display System',
    summary:
      'Route dining orders directly from table service to station-specific kitchen displays with durable database persistence and live WebSocket updates.',
    bullets: [
      'Station-routed KOT tickets (Grill, Pantry, Pastry, Bar) with status tracking',
      'Direct-to-room folio posting for in-house guests with itemized charges',
      'Event-replayed WebSocket updates so kitchen screens recover cleanly on reconnect',
    ],
    metrics: [
      { label: 'Persistence', value: 'PostgreSQL' },
      { label: 'Live Sync', value: 'Channels WS' },
      { label: 'Billing', value: 'Room Folio' },
    ],
  },
  operations: {
    label: 'Housekeeping & ERP',
    title: 'Housekeeping, Maintenance, Inventory & Guest Logistics',
    summary:
      'Coordinate room turnover checklists, engineering work orders, stock movements, purchase orders, transport dispatch, and security gate logs.',
    bullets: [
      'Housekeeping inspection workflows automatically update room readiness status',
      'Auditable stock movement ledger with reorder alerts and purchase orders',
      'Unified operational hub for Spa, Events/Banquets, Cloakroom, and Fleet',
    ],
    metrics: [
      { label: 'Room Sync', value: 'Automated' },
      { label: 'Stock Ledger', value: 'IN / OUT / ADJ' },
      { label: 'Departments', value: '10+ Modules' },
    ],
  },
  governance: {
    label: 'Finance & Isolation',
    title: 'Auditable Financial Folios & Multi-Tenant Security',
    summary:
      'Protect guest folios, payments, refunds, and corporate reporting with strict organisation-to-property isolation and role-based access.',
    bullets: [
      'Immutable charge events, void tracking, and cumulative refund protection',
      'Organisation → Property → Department permission boundaries across APIs & WS',
      'Executive KPI dashboards and read-only Shareholder Portal',
    ],
    metrics: [
      { label: 'Tenancy', value: 'Strict Scope' },
      { label: 'Ledger', value: 'Auditable' },
      { label: 'Access', value: 'RBAC + JWT' },
    ],
  },
}

const CAPABILITIES = [
  {
    icon: BedDouble,
    title: 'Front Office & Room Board',
    desc: 'Live room status across AVAILABLE, OCCUPIED, DIRTY, CLEANING, and INSPECTION states.',
  },
  {
    icon: CalendarCheck2,
    title: 'Reservations & Availability',
    desc: 'Idempotent booking creation with transaction-locked room inventory.',
  },
  {
    icon: CreditCard,
    title: 'Folios, Billing & Refunds',
    desc: 'Consolidated guest folios with room, restaurant, and service charge postings.',
  },
  {
    icon: ChefHat,
    title: 'Restaurant POS & KDS',
    desc: 'Table management, KOT firing, station routing, and fullscreen kitchen display.',
  },
  {
    icon: Sparkles,
    title: 'Housekeeping & Lost-Found',
    desc: 'Room turnover checklists, supervisor inspections, and lost-and-found tracking.',
  },
  {
    icon: Wrench,
    title: 'Engineering & Maintenance',
    desc: 'Priority work orders, technician assignment, and full resolution logs.',
  },
  {
    icon: Package,
    title: 'Inventory & Procurement',
    desc: 'Stock levels, audit adjustments, reorder thresholds, and purchase orders.',
  },
  {
    icon: BarChart3,
    title: 'Corporate & Shareholder Views',
    desc: 'Cross-property KPIs, occupancy trends, and read-only stakeholder reporting.',
  },
]

const PLANS = [
  {
    name: 'Starter',
    audience: 'Boutique & Single Property',
    desc: 'Core PMS, Front Desk, Room Board, Reservations, and Guest Folios.',
    features: [
      '1 Property & Unlimited Rooms',
      'Reservations & Front Office Desk',
      'Guest Folios & Payment Recording',
      'Housekeeping & Maintenance',
    ],
    cta: 'Start with Starter',
    highlighted: false,
  },
  {
    name: 'Professional',
    audience: 'Full-Service Hotels & Resorts',
    desc: 'Adds live Restaurant POS, KOT/KDS, Inventory, Spa, Transport & Events.',
    features: [
      'Up to 5 Properties per Organisation',
      'Restaurant POS + Live KDS',
      'Inventory & Purchase Orders',
      'Spa, Events, Transport & Security',
    ],
    cta: 'Launch Professional',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    audience: 'Hospitality Groups & Chains',
    desc: 'Multi-property governance, Dynamic Pricing, OTA Channels & Shareholder Portal.',
    features: [
      'Unlimited Properties & Regions',
      'Dynamic Pricing & OTA Channel Sync',
      'Executive & Shareholder Portals',
      'Dedicated Platform Tenant Controls',
    ],
    cta: 'Provision Enterprise',
    highlighted: false,
  },
]

function useScrollReveal() {
  const ref = useRef<HTMLDivElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.12 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return { ref, visible }
}

export const LandingPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth()
  const [activeTab, setActiveTab] = useState<ModuleTab>('pms')

  const platformReveal = useScrollReveal()
  const modulesReveal = useScrollReveal()
  const plansReveal = useScrollReveal()

  const dashboardPath =
    user?.role === 'super_admin'
      ? '/ila-admin'
      : user?.role === 'shareholder'
        ? '/app/shareholder'
        : user?.role === 'chef_kitchen'
          ? '/app/kds'
          : '/app/frontdesk'

  const activeModule = MODULE_TABS[activeTab]

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-amber-100 selection:text-amber-900 scroll-smooth">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="group flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-sm shadow-amber-500/20 transition-transform duration-300 group-hover:scale-105">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900">HMOS</span>
              <span className="ml-2 hidden rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium text-amber-700 sm:inline-block">
                Hospitality Operating System
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a href="#platform" className="transition hover:text-slate-900">
              Platform
            </a>
            <a href="#modules" className="transition hover:text-slate-900">
              Modules
            </a>
            <a href="#plans" className="transition hover:text-slate-900">
              Plans
            </a>
            <Link to="/ila-admin/login" className="transition hover:text-amber-600">
              Platform Admin
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to={dashboardPath}
                className="group inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Open Workspace
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/auth/login"
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth/register"
                  className="group inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-500"
                >
                  Onboard Property
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-amber-50/70 via-white to-white">
        {/* Ambient Animated Glows */}
        <div className="pointer-events-none absolute -top-24 left-1/2 h-80 w-[44rem] -translate-x-1/2 rounded-full bg-amber-300/20 blur-3xl animate-pulse" />
        <div className="pointer-events-none absolute top-28 right-10 h-56 w-56 rounded-full bg-orange-200/25 blur-3xl animate-pulse [animation-delay:1200ms]" />

        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-semibold text-amber-800 animate-in fade-in slide-in-from-bottom-3 duration-500">
              <ShieldCheck className="h-4 w-4 text-amber-600" />
              Multi-Tenant Hospitality PMS, POS &amp; Enterprise Operations
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl animate-in fade-in slide-in-from-bottom-4 duration-700">
              One Operating System for{' '}
              <span className="bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
                Every Property &amp; Department
              </span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-slate-600 animate-in fade-in slide-in-from-bottom-5 duration-700 [animation-delay:120ms]">
              Unify reservations, front desk check-in, guest folios, live restaurant POS &amp; KDS,
              housekeeping, engineering, and executive reporting in a single tenant-isolated platform.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row animate-in fade-in slide-in-from-bottom-6 duration-700 [animation-delay:220ms]">
              {isAuthenticated ? (
                <Link
                  to={dashboardPath}
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3.5 text-base font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800 sm:w-auto"
                >
                  Continue to Dashboard
                  <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/auth/register"
                    className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 px-6 py-3.5 text-base font-semibold text-white shadow-md shadow-amber-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-amber-500 hover:shadow-lg hover:shadow-amber-600/25 sm:w-auto"
                  >
                    Register Your Organisation
                    <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
                  </Link>
                  <Link
                    to="/auth/login"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-base font-medium text-slate-700 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900 sm:w-auto"
                  >
                    Staff &amp; Guest Sign In
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Trust / Architecture Strip */}
          <div className="mt-16 grid grid-cols-2 gap-4 rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur-xs sm:grid-cols-4 animate-in fade-in slide-in-from-bottom-6 duration-700 [animation-delay:320ms]">
            <div className="text-center transition-transform duration-200 hover:scale-[1.03]">
              <div className="text-xl font-bold text-slate-900">Multi-Tenant</div>
              <div className="mt-1 text-xs text-slate-500">Organisation → Property Isolation</div>
            </div>
            <div className="text-center transition-transform duration-200 hover:scale-[1.03]">
              <div className="text-xl font-bold text-slate-900">Real-Time KDS</div>
              <div className="mt-1 text-xs text-slate-500">Durable DB + WebSocket Sync</div>
            </div>
            <div className="text-center transition-transform duration-200 hover:scale-[1.03]">
              <div className="text-xl font-bold text-slate-900">Auditable Folios</div>
              <div className="mt-1 text-xs text-slate-500">Charge Events &amp; Net Refunds</div>
            </div>
            <div className="text-center transition-transform duration-200 hover:scale-[1.03]">
              <div className="text-xl font-bold text-slate-900">Role-Scoped</div>
              <div className="mt-1 text-xs text-slate-500">Department &amp; Executive Portals</div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Platform Showcase */}
      <section
        id="platform"
        ref={platformReveal.ref}
        className={`mx-auto max-w-7xl px-6 py-20 transition-all duration-700 ${
          platformReveal.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Built for Hospitality Reliability
            </h2>
            <p className="mt-2 max-w-2xl text-slate-600">
              Explore how HMOS connects front-of-house guest journeys with back-of-house execution.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(MODULE_TABS) as ModuleTab[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 cursor-pointer ${
                  activeTab === key
                    ? 'bg-slate-900 text-white shadow-sm scale-[1.02]'
                    : 'border border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:text-slate-900'
                }`}
              >
                {MODULE_TABS[key].label}
              </button>
            ))}
          </div>
        </div>

        <div
          key={activeTab}
          className="grid gap-8 rounded-2xl border border-slate-200 bg-slate-50/70 p-8 lg:grid-cols-5 animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          <div className="lg:col-span-3">
            <div className="inline-flex items-center gap-2 rounded-md bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
              <Layers className="h-3.5 w-3.5" />
              {activeModule.label}
            </div>
            <h3 className="mt-4 text-2xl font-bold text-slate-900">{activeModule.title}</h3>
            <p className="mt-3 text-slate-600">{activeModule.summary}</p>
            <ul className="mt-6 space-y-3">
              {activeModule.bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-3 text-sm text-slate-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-xs lg:col-span-2">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Architecture Highlights
              </div>
              <div className="mt-5 space-y-4">
                {activeModule.metrics.map((m) => (
                  <div
                    key={m.label}
                    className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-none last:pb-0"
                  >
                    <span className="text-sm text-slate-600">{m.label}</span>
                    <span className="font-mono text-sm font-semibold text-amber-700">
                      {m.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-4">
              <Link
                to={isAuthenticated ? dashboardPath : '/auth/login'}
                className="group inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                {isAuthenticated ? 'Open Module in App' : 'Sign In to Explore'}
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities Grid */}
      <section
        id="modules"
        ref={modulesReveal.ref}
        className="border-t border-slate-200 bg-slate-50 py-20"
      >
        <div
          className={`mx-auto max-w-7xl px-6 transition-all duration-700 ${
            modulesReveal.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Complete Operational Coverage
            </h2>
            <p className="mt-2 text-slate-600">
              Every department works from the same authoritative property, room, and guest state.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {CAPABILITIES.map((cap, idx) => {
              const Icon = cap.icon
              return (
                <div
                  key={cap.title}
                  style={{ transitionDelay: modulesReveal.visible ? `${idx * 55}ms` : '0ms' }}
                  className={`group rounded-xl border border-slate-200 bg-white p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-amber-400 hover:shadow-md ${
                    modulesReveal.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600 transition-transform duration-300 group-hover:scale-110">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-slate-900">{cap.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{cap.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section
        id="plans"
        ref={plansReveal.ref}
        className={`mx-auto max-w-7xl px-6 py-20 transition-all duration-700 ${
          plansReveal.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Flexible Tiers for Every Hospitality Scale
          </h2>
          <p className="mt-2 text-slate-600">
            Start with a single boutique hotel and scale to a multi-region portfolio.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {PLANS.map((plan, idx) => (
            <div
              key={plan.name}
              style={{ transitionDelay: plansReveal.visible ? `${idx * 90}ms` : '0ms' }}
              className={`flex flex-col justify-between rounded-2xl border p-8 transition-all duration-300 hover:-translate-y-1 ${
                plan.highlighted
                  ? 'border-amber-400 bg-white shadow-xl shadow-amber-500/10 ring-1 ring-amber-400/30 hover:shadow-2xl hover:shadow-amber-500/15'
                  : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:shadow-md'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                  {plan.highlighted && (
                    <span className="rounded-full bg-amber-100 px-3 py-0.5 text-xs font-semibold text-amber-800">
                      Most Popular
                    </span>
                  )}
                </div>
                <div className="mt-1 text-xs font-semibold text-amber-600">{plan.audience}</div>
                <p className="mt-4 text-sm text-slate-600">{plan.desc}</p>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5 text-sm text-slate-700">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                to="/auth/register"
                className={`group mt-8 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  plan.highlighted
                    ? 'bg-amber-600 text-white shadow-sm hover:bg-amber-500'
                    : 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
                }`}
              >
                {plan.cta}
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 text-sm text-slate-500 sm:flex-row">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-amber-600" />
            <span>HMOS — Hospitality Management Operating System</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/auth/login" className="hover:text-slate-900">
              Staff Login
            </Link>
            <Link to="/auth/register" className="hover:text-slate-900">
              Register Property
            </Link>
            <Link to="/ila-admin/login" className="hover:text-slate-900">
              ILA Platform Admin
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
