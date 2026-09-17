import React, { useState } from 'react'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/auth/useAuth'
import { useToast } from '@/components/ui/toast'
import {
  FileCheck2,
  TrendingUp,
  Download,
} from 'lucide-react'

const MOCK_DIVIDENDS = [
  { id: 'div-1', quarter: 'Q3 FY26', declaredDate: '2026-09-01', paidDate: '2026-09-15', perShare: '$1.45', totalPaid: '$72,500.00', ref: 'DIV-FED-99120', status: 'paid' },
  { id: 'div-2', quarter: 'Q2 FY26', declaredDate: '2026-06-01', paidDate: '2026-06-15', perShare: '$1.38', totalPaid: '$69,000.00', ref: 'DIV-FED-84102', status: 'paid' },
  { id: 'div-3', quarter: 'Q1 FY26', declaredDate: '2026-03-01', paidDate: '2026-03-15', perShare: '$1.25', totalPaid: '$62,500.00', ref: 'DIV-FED-71994', status: 'paid' },
]

export const ShareholderPortal: React.FC = () => {
  const { user } = useAuth()
  const { success } = useToast()
  const [activeTab, setActiveTab] = useState<'overview' | 'dividends' | 'financials'>('overview')

  return (
    <div className="space-y-6">
      {/* Shareholder Welcome Card */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black tracking-tight text-white">
                Welcome, {user?.firstName} {user?.lastName}
              </h2>
              <Badge variant="success">Certified Shareholder</Badge>
            </div>
            <p className="text-sm text-slate-400 mt-1 max-w-xl leading-relaxed">
              Grand Horizon Hospitality Group PLC Official Investor Portal. Access certified quarterly audited financial statements, historical dividend records, and portfolio distributions.
            </p>
          </div>

          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-right">
            <span className="text-xs font-semibold text-amber-400">Total Registered Equity Stake</span>
            <p className="text-3xl font-black text-amber-400 font-mono mt-0.5">50,000 Shares</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Representing 4.25% Class A Voting Stock</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs (Strictly Read-Only) */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`rounded-lg px-4 py-2 transition-colors cursor-pointer ${
            activeTab === 'overview' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          Portfolio Overview
        </button>
        <button
          onClick={() => setActiveTab('dividends')}
          className={`rounded-lg px-4 py-2 transition-colors cursor-pointer ${
            activeTab === 'dividends' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          Dividend Ledger ({MOCK_DIVIDENDS.length})
        </button>
        <button
          onClick={() => setActiveTab('financials')}
          className={`rounded-lg px-4 py-2 transition-colors cursor-pointer ${
            activeTab === 'financials' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          Audited Annual & Quarterly Filings
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metric Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
              <span className="text-xs font-semibold text-slate-400">YTD Dividends Disbursed</span>
              <p className="text-2xl font-black text-emerald-400 font-mono mt-1">$204,000.00</p>
              <p className="text-xs text-slate-500 mt-1">Paid directly via ACH/Fedwire</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
              <span className="text-xs font-semibold text-slate-400">Book Value Per Share</span>
              <p className="text-2xl font-black text-slate-100 font-mono mt-1">$48.60</p>
              <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> +16.2% NAV Growth YoY
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
              <span className="text-xs font-semibold text-slate-400">External Auditor Rating</span>
              <p className="text-2xl font-black text-amber-400 font-mono mt-1">Unqualified / Clean</p>
              <p className="text-xs text-slate-500 mt-1">Ernst & Young Audit Opinion</p>
            </div>
          </div>

          {/* Asset Portfolio Summary */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
            <div className="p-5 border-b border-slate-800">
              <h3 className="font-bold text-base text-white">Underlying Hotel Asset Portfolio</h3>
            </div>
            <Table className="text-slate-200">
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-slate-900">
                  <TableHead className="text-slate-400">Property Asset</TableHead>
                  <TableHead className="text-slate-400">Location</TableHead>
                  <TableHead className="text-slate-400">Keys</TableHead>
                  <TableHead className="text-slate-400">Appraised Valuation</TableHead>
                  <TableHead className="text-slate-400">Ownership Structure</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { name: 'Grand Horizon Palace & Spa', loc: 'New York, USA', keys: 120, val: '$84,000,000', own: '100% Fee Simple' },
                  { name: 'Azure Bay Ocean Resort', loc: 'Miami Beach, USA', keys: 180, val: '$112,000,000', own: '100% Fee Simple' },
                  { name: 'Alpine Crest Chalets', loc: 'Aspen, Colorado', keys: 45, val: '$42,000,000', own: '100% Fee Simple' },
                ].map((a, idx) => (
                  <TableRow key={idx} className="border-slate-800 hover:bg-slate-800/40">
                    <TableCell className="font-bold text-white text-xs">{a.name}</TableCell>
                    <TableCell className="text-xs text-slate-400">{a.loc}</TableCell>
                    <TableCell className="text-xs font-mono">{a.keys} Keys</TableCell>
                    <TableCell className="text-xs font-mono font-bold text-amber-400">{a.val}</TableCell>
                    <TableCell className="text-xs text-slate-400">{a.own}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {activeTab === 'dividends' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
          <div className="p-5 border-b border-slate-800">
            <h3 className="font-bold text-base text-white">Official Certified Dividend Disbursements</h3>
          </div>
          <Table className="text-slate-200">
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-slate-900">
                <TableHead className="text-slate-400">Quarter Period</TableHead>
                <TableHead className="text-slate-400">Dividend / Share</TableHead>
                <TableHead className="text-slate-400">Net Amount Disbursed</TableHead>
                <TableHead className="text-slate-400">Payment Reference</TableHead>
                <TableHead className="text-slate-400">Settled Date</TableHead>
                <TableHead className="text-slate-400 text-right">Certificate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_DIVIDENDS.map((d) => (
                <TableRow key={d.id} className="border-slate-800 hover:bg-slate-800/40">
                  <TableCell className="font-bold text-xs text-white">{d.quarter}</TableCell>
                  <TableCell className="font-mono text-xs">{d.perShare}</TableCell>
                  <TableCell className="font-mono font-bold text-xs text-emerald-400">{d.totalPaid}</TableCell>
                  <TableCell className="font-mono text-xs text-slate-400">{d.ref}</TableCell>
                  <TableCell className="text-xs text-slate-400 font-mono">{d.paidDate}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs text-amber-400 hover:text-amber-300 hover:bg-slate-800"
                      onClick={() => success('Tax Withholding & Dividend Voucher PDF downloaded')}
                    >
                      <Download className="h-3.5 w-3.5 mr-1" />
                      Tax Voucher
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {activeTab === 'financials' && (
        <div className="space-y-4">
          {[
            { period: 'Q3 FY26 Interim Financial Statement & Audit Review', date: 'September 15, 2026', size: '4.8 MB PDF' },
            { period: 'Q2 FY26 Certified Balance Sheet & Income Statement', date: 'June 18, 2026', size: '5.2 MB PDF' },
            { period: 'FY25 Annual Report & Audited Accounts', date: 'February 10, 2026', size: '14.6 MB PDF' },
          ].map((rep, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-900 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileCheck2 className="h-5 w-5 text-amber-400" />
                <div>
                  <h4 className="font-bold text-sm text-white">{rep.period}</h4>
                  <p className="text-xs text-slate-400">Certified Published: {rep.date} • {rep.size}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-slate-700 text-slate-200 hover:bg-slate-800"
                onClick={() => success(`Downloading signed copy: ${rep.period}`)}
              >
                <Download className="h-3.5 w-3.5 mr-1.5" />
                Download Certified Copy
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
