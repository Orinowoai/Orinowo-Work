'use client'
export const dynamic = 'force-static'

import { useEffect, useMemo, useState } from 'react'
import SponsorShowcase from '@/components/SponsorShowcase'
import { convertPrice, getCurrencyName } from '@/lib/currency'

type Comp = {
  id: string
  name: string
  theme: string
  endsAt: string
  entries: number
  prizeBaseUSD: number
}

const ENTRY_FEE_USD = 5

const MOCK: Comp[] = [
  { id: 'gfc', name: 'Global Fusion Challenge', theme: 'Fuse two genres from different continents', endsAt: new Date(Date.now()+30*864e5).toISOString(), entries: 847, prizeBaseUSD: 5000 },
  { id: 'afro', name: 'Afrobeat Evolution Challenge', theme: 'Modern Afrobeat innovation', endsAt: new Date(Date.now()+45*864e5).toISOString(), entries: 1247, prizeBaseUSD: 7500 },
  { id: 'aihuman', name: 'AI × Human Collaboration', theme: 'Best AI-human collaborative track', endsAt: new Date(Date.now()+20*864e5).toISOString(), entries: 523, prizeBaseUSD: 3000 },
]

function formatCountdown(iso: string) {
  const diff = new Date(iso).getTime() - Date.now()
  const days = Math.max(0, Math.floor(diff / 86400000))
  return `${days} days`
}

// Calculate prize breakdown using a normalized distribution to ensure
// exactly 70% of the total pool goes to winners and 30% to operations.
type PrizeBreakdown = {
  totalPool: number
  prizePool: number
  operations: number
  grand: number
  second: number
  third: number
  fourth: number
  fifth: number
  sixth: number
  seventh: number
  eighth: number
  ninth: number
  tenth: number
}

function calculatePrizeBreakdown(totalEntries: number, entryFeeUSD: number): PrizeBreakdown {
  const totalPool = totalEntries * entryFeeUSD
  const prizePool = totalPool * 0.7 // 70% to winners
  const operations = totalPool * 0.3 // 30% to operations
  const weights = {
    grand: 40,
    second: 15,
    third: 8,
    fourth: 3.5,
    fifth: 3.5,
    sixth: 1,
    seventh: 1,
    eighth: 1,
    ninth: 1,
    tenth: 1,
  }
  const weightSum = Object.values(weights).reduce((a, b) => a + b, 0) // 75
  const alloc: any = {}
  for (const [k, w] of Object.entries(weights)) alloc[k] = prizePool * (w / weightSum)
  return { totalPool, prizePool, operations, ...alloc } as PrizeBreakdown
}

export default function CompetitionsPage() {
  const [active, setActive] = useState<Comp | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [email, setEmail] = useState('')
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const entryPrice = convertPrice(ENTRY_FEE_USD)
  const currency = getCurrencyName()

  const modalPrize = useMemo(() => {
    if (!active) return null
    const breakdown = calculatePrizeBreakdown(active.entries, ENTRY_FEE_USD)
    return convertPrice(breakdown.grand)
  }, [active])

  return (
    <main className="min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-6">
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-gradient mb-2">Global Creative Challenges</h1>
          <p className="text-white/70">Compete. Create. Win. Shape the future of music.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MOCK.map(c => {
            const breakdown = calculatePrizeBreakdown(c.entries, ENTRY_FEE_USD)
            const grandDisplay = mounted ? convertPrice(breakdown.grand) : `$${breakdown.grand.toFixed(2)}`
            return (
            <div key={c.id} className="rounded-2xl border border-gold/20 bg-black/40 p-6">
              <div className="flex items-center justify-between mb-1">
                <div className="text-white font-bold">{c.name}</div>
                <span className="px-3 py-1 rounded-full bg-gold/15 border border-gold/30 text-gold text-xs">OPEN</span>
              </div>
              <div className="text-white/70 text-sm mb-2">Theme: {c.theme}</div>
              <div className="text-white/60 text-sm mb-1">Entry: {mounted ? entryPrice : '$5.00'}</div>
              <div className="text-white/60 text-sm mb-1">Grand Prize: <span className="text-gold font-semibold">{grandDisplay}+</span> <span className="text-white/50">• + 9 more winners</span></div>
              <div className="text-white/50 text-sm">Current entries: {c.entries} • Deadline: {formatCountdown(c.endsAt)}</div>
              <div className="text-white/40 text-xs">70% to prizes • 30% operations</div>
              <details className="mt-3 rounded-xl border border-white/10 bg-white/5 p-4">
                <summary className="cursor-pointer text-white/80 font-semibold">View prize breakdown</summary>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center justify-between"><span className="text-white/70">Grand Prize</span><span className="text-gold font-semibold">{mounted ? convertPrice(breakdown.grand) : `$${breakdown.grand.toFixed(2)}`}</span></div>
                  <div className="flex items-center justify-between"><span className="text-white/70">Second</span><span className="text-gold font-semibold">{mounted ? convertPrice(breakdown.second) : `$${breakdown.second.toFixed(2)}`}</span></div>
                  <div className="flex items-center justify-between"><span className="text-white/70">Third</span><span className="text-gold font-semibold">{mounted ? convertPrice(breakdown.third) : `$${breakdown.third.toFixed(2)}`}</span></div>
                  <div className="flex items-center justify-between"><span className="text-white/70">4th</span><span className="text-gold font-semibold">{mounted ? convertPrice(breakdown.fourth) : `$${breakdown.fourth.toFixed(2)}`}</span></div>
                  <div className="flex items-center justify-between"><span className="text-white/70">5th</span><span className="text-gold font-semibold">{mounted ? convertPrice(breakdown.fifth) : `$${breakdown.fifth.toFixed(2)}`}</span></div>
                  <div className="flex items-center justify-between col-span-2"><span className="text-white/70">6th-10th (each)</span><span className="text-gold font-semibold">{mounted ? convertPrice(breakdown.sixth) : `$${breakdown.sixth.toFixed(2)}`}</span></div>
                  <div className="flex items-center justify-between col-span-2"><span className="text-white/50 text-xs">Operations</span><span className="text-white/60 text-xs">{mounted ? convertPrice(breakdown.operations) : `$${breakdown.operations.toFixed(2)}`}</span></div>
                </div>
              </details>
              <div className="mt-3" />
              <button onClick={() => { setActive(c); setShowModal(true) }} className="w-full btn-primary">Enter Competition — {mounted ? entryPrice : '$5.00'}</button>
            </div>
            )
          })}
        </div>

        {showModal && active && (() => {
          const calc = calculatePrizeBreakdown(active.entries, ENTRY_FEE_USD)
          const prizePoolDisplay = mounted ? convertPrice(calc.prizePool) : `$${calc.prizePool.toFixed(2)}`
          const grandDisplay = mounted ? convertPrice(calc.grand) : `$${calc.grand.toFixed(2)}`
          return (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
            <div className="bg-black border border-gold/30 rounded-2xl p-8 max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-2xl font-bold text-gold mb-4">{active.name}</h3>
              <div className="space-y-4 mb-6">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="text-white/80 mb-1">Grand Prize: <span className="text-gold font-bold">{grandDisplay}</span> <span className="text-white/60 text-sm">(based on current entries)</span></div>
                  <div className="text-white/60 text-sm">+ 9 additional prize winners</div>
                  <div className="text-white/70 text-sm mt-2">Total Prize Pool: <span className="text-gold font-semibold">{prizePoolDisplay}</span> <span className="text-white/50">(70% of entries, growing with more entries)</span></div>
                </div>
                <div className="text-white/80">Entry Fee: {mounted ? entryPrice : '$5.00'}</div>
                <div className="text-white/70 text-sm">
                  <p className="mb-1 font-semibold">How prizes are funded</p>
                  <p className="text-white/60">Entry fees create the prize pool:</p>
                  <ul className="list-disc pl-5 text-white/60 space-y-1 mt-1">
                    <li>70% distributed among top 10 creators</li>
                    <li>30% covers judging, platform operations, and marketing</li>
                  </ul>
                  <p className="text-white/60 mt-2">The more entries, the larger all prizes become.</p>
                </div>
                <details className="mt-2 rounded-xl border border-white/10 bg-white/5 p-4">
                  <summary className="cursor-pointer text-white/80 font-semibold">Prize Details</summary>
                  <div className="text-white/70 text-sm mt-2 space-y-1">
                    <p>Competition Prize Structure</p>
                    <p>70% of all entry fees fund creator prizes across multiple winners</p>
                    <p>30% supports platform operations including:</p>
                    <ul className="list-disc pl-5">
                      <li>Expert judging and curation</li>
                      <li>Technical infrastructure and hosting</li>
                      <li>Marketing and creator promotion</li>
                      <li>Competition administration</li>
                      <li>Community features and support</li>
                    </ul>
                    <p className="text-white/60">This structure ensures sustainable, high-quality competitions while rewarding multiple talented creators.</p>
                  </div>
                </details>
                <details className="mt-2 rounded-xl border border-white/10 bg-white/5 p-4">
                  <summary className="cursor-pointer text-white/80 font-semibold">How Winners Are Selected</summary>
                  <div className="text-white/70 text-sm mt-2 space-y-2">
                    <p>Our competitions use a fair, multi-layered judging process:</p>
                    <ul className="space-y-1">
                      <li>🗳️ <strong>Subscriber Votes</strong> (40%) — Premium members vote for their favorites.</li>
                      <li>👨‍🎨 <strong>Expert Panel</strong> (40%) — Evaluates originality, quality, and artistic merit.</li>
                      <li>🤖 <strong>AI Analysis</strong> (20%) — Objective technical assessment.</li>
                    </ul>
                    <p className="text-white/60">In case of ties, Orinowo makes the final determination to ensure the best outcome for the community. All entries are subject to content policy, and rule violations may be disqualified regardless of votes.</p>
                  </div>
                </details>
                <div className="flex flex-col gap-2 pt-2">
                  <label className="text-white/80 text-sm inline-flex items-center gap-2"><input type="checkbox" className="accent-gold"/> I understand the prize structure</label>
                  <label className="text-white/80 text-sm inline-flex items-center gap-2"><input type="checkbox" className="accent-gold"/> I agree to Competition Terms</label>
                </div>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setShowModal(false)} className="flex-1 px-6 py-3 border border-white/20 rounded-xl text-white hover:bg-white/5">Cancel</button>
                <button onClick={() => { alert("Thank you! We'll notify you when competitions launch."); setShowModal(false); setEmail('') }} className="flex-1 px-6 py-3 bg-gold text-black rounded-xl font-semibold hover:bg-gold/90">Enter Competition — {mounted ? entryPrice : '$5.00'}</button>
              </div>
            </div>
          </div>
          )})()}
        <div className="mt-8">
          <SponsorShowcase />
        </div>
      </div>
    </main>
  )
}
