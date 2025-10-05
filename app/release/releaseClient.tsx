"use client"

import { DistributionModal } from '@/components/DistributionModal'
import { useComingSoon } from '@/components/ui/ComingSoon'
import { convertPrice } from '@/lib/currency'
import { useEffect, useState } from 'react'

type Plan = { id: 'video' | 'spotify' | 'apple'; title: string; desc: string; price: number; note?: string }

export default function Client({ plans, currency }: { plans: Plan[]; currency: string }) {
  const [distType, setDistType] = useState<null | 'spotify' | 'apple' | 'video'>(null)
  const { ComingSoonButton, ComingSoonModal } = useComingSoon()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <main className="min-h-screen py-16">
      <div className="max-w-5xl mx-auto px-6">
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-gradient mb-2">Release Your Music</h1>
          <p className="text-white/70">Choose a distribution package that fits your rollout.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map(p => (
            <div key={p.id} className="rounded-2xl border border-gold/20 bg-black/40 p-6">
              <div className="text-white font-bold text-lg mb-1">{p.title}</div>
              <div className="text-white/70 text-sm mb-3">{p.desc}</div>
              <div className="text-gold font-bold mb-1">{p.price ? `${mounted ? convertPrice(p.price) : `$${p.price.toFixed(2)}`} / year` : 'Included'}</div>
              <div className="text-white/50 text-xs mb-4">Prices shown in {mounted ? currency : 'USD'}. Billed in USD.</div>
              {p.id === 'video' ? (
                <button onClick={() => setDistType('video')} className="btn-primary w-full">Continue</button>
              ) : (
                <button onClick={() => setDistType(p.id)} className="btn-primary w-full">Continue</button>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 text-white/50 text-xs">
          DSP brand names are used strictly for identification. No affiliation or endorsement is implied. Distribution is facilitated through third-party delivery services. Timelines and availability may vary.
        </div>
      </div>

      <DistributionModal open={!!distType} onClose={() => setDistType(null)} type={(distType ?? 'spotify')} />
      {ComingSoonModal}
    </main>
  )
}
