'use client'

import { useEffect, useState } from 'react'
import { convertPrice, getCurrencyName } from '@/lib/currency'
import CurrencyClient from '@/components/CurrencyClient'

type Product = { id: number; name: string; category: string; price: string; image: string; description: string; soldOut?: boolean }

const essentials: Product[] = [
  { id: 1, name: 'Orinowo Premium Hoodie', category: 'Essentials', price: '£89', image: '/merch/hoodie.jpg', description: 'Black hoodie • Golden emblem', soldOut: false },
  { id: 2, name: 'Orinowo Signature Tee', category: 'Essentials', price: '£49', image: '/merch/tee.jpg', description: 'Cotton tee • Gold crest', soldOut: true },
  { id: 3, name: 'Orinowo Snapback', category: 'Essentials', price: '£39', image: '/merch/hat.jpg', description: 'Embroidered emblem', soldOut: false },
  { id: 4, name: 'Orinowo Ceramic Mug', category: 'Essentials', price: '£29', image: '/merch/mug.jpg', description: 'Matte black • Gold mark', soldOut: false },
  { id: 5, name: 'Orinowo Art Poster', category: 'Essentials', price: '£59', image: '/merch/poster.jpg', description: 'Framed print • Limited run', soldOut: true },
  { id: 6, name: 'Orinowo Tote', category: 'Essentials', price: '£45', image: '/merch/tote.jpg', description: 'Eco canvas • Gold print', soldOut: false },
]

const collabs = [
  { id: 101, name: 'Limited Edition Drop — Series I', price: '£180', note: 'Coming Soon' },
  { id: 102, name: 'Studio Essentials Pack', price: '£300', note: 'Coming Soon' },
  { id: 103, name: 'Creator Capsule Collection', price: '£220', note: 'Coming Soon' },
]

function Countdown() {
  const [time, setTime] = useState({ d: 2, h: 12, m: 45, s: 8 })
  useEffect(() => {
    const t = setInterval(() => {
      setTime((prev) => {
        let { d, h, m, s } = prev
        s = (s + 59) % 60
        if (s === 59) { m = (m + 59) % 60; if (m === 59) { h = (h + 23) % 24; if (h === 23) { d = Math.max(0, d - 1) } } }
        return { d, h, m, s }
      })
    }, 1000)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="flex items-center gap-3 text-white/80">
      {[{k:'D',v:time.d},{k:'H',v:time.h},{k:'M',v:time.m},{k:'S',v:time.s}].map((x) => (
        <div key={x.k} className="text-center">
          <div className="text-2xl font-black text-gold">{x.v.toString().padStart(2,'0')}</div>
          <div className="text-xs text-white/50">{x.k}</div>
        </div>
      ))}
    </div>
  )
}

export default function MerchPage() {
  type LiveProduct = { id: string; name: string; thumbnail: string; price: number | string; currency: string; url: string }
  const [products, setProducts] = useState<LiveProduct[]>([])
  const [loading, setLoading] = useState(true)

  // Derive storefront base for fallbacks
  const STORE_INPUT = process.env.NEXT_PUBLIC_PRINTFUL_STORE || 'orinowo.printful.com'
  const STORE_BASE = (STORE_INPUT.includes('.') ? `https://${STORE_INPUT}` : `https://${STORE_INPUT}.printful.me`).replace(/\/$/, '')

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/printful/products', { cache: 'no-store' })
        const json = await res.json()
        setProducts(json.products || [])
      } catch (e) {
        console.error('Failed to load Printful products', e)
      } finally {
        setLoading(false)
      }
    })()
  }, [])
  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="rounded-3xl border border-gold/30 bg-white/5 backdrop-blur-xl p-10 md:p-14 mb-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3 text-gradient">Exclusive Drops</h1>
              <p className="text-white/70 max-w-xl">Luxury-grade essentials and limited collaborations. Curated for creators who lead.</p>
            </div>
            <div className="text-right">
              <div className="text-white/60 text-sm mb-1">Next release in</div>
              <Countdown />
            </div>
          </div>
        </div>

        {/* Live Products from Printful */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Orinowo Collection</h2>
          </div>
          {loading ? (
            <div className="text-center py-16 text-white/50">Loading collection…</div>
          ) : (products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map(p => (
                <div key={p.id} className="group rounded-2xl overflow-hidden border border-gold/20 bg-black/40 backdrop-blur-xl hover:border-gold/40 transition-all">
                  <div className="relative aspect-square bg-white/5">
                    <img src={p.thumbnail} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-white font-semibold">{p.name}</div>
                      <div className="text-gold font-bold">{typeof p.price === 'number' ? <CurrencyClient amount={p.price} /> : `$${Number(p.price || 0).toFixed(2)}`}</div>
                    </div>
                    <div className="text-white/40 text-xs mb-4">Prices shown in {getCurrencyName()}. Checkout via Printful.</div>
                    {p.url ? (
                      <a href={p.url} target="_blank" rel="noopener noreferrer" className="w-full inline-flex justify-center rounded-xl py-3 font-semibold bg-gradient-to-br from-gold to-gold-dark text-black hover:scale-[1.02]">Shop Now</a>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <a href={STORE_BASE} target="_blank" rel="noopener noreferrer" className="w-full inline-flex justify-center rounded-xl py-3 font-semibold bg-gradient-to-br from-gold to-gold-dark text-black hover:scale-[1.02]">See Storefront</a>
                        <button onClick={() => alert('Product link unavailable right now. Please try the Storefront link above.')} className="w-full inline-flex justify-center rounded-xl py-3 font-semibold border border-gold/40 text-gold">Contact for Purchase</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-white/60">Collection launching soon.</div>
          ))}
        </div>

        {/* Essentials (legacy showcase) */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Orinowo Essentials</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {essentials.map(p => (
              <div key={p.id} className="group rounded-2xl overflow-hidden border border-gold/20 bg-black/40 backdrop-blur-xl hover:border-gold/40 transition-all">
                <div className="relative aspect-video bg-white/5">
                  {/* PLACEHOLDER image area */}
                  <div className="absolute inset-0 flex items-center justify-center text-white/30">{p.name}</div>
                  {p.soldOut && <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/80 text-xs tracking-wide">Sold Out</div>}
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-white font-semibold">{p.name}</div>
                    <div className="text-gold font-bold"><CurrencyClient amount={parseFloat(p.price.replace('£',''))} /></div>
                  </div>
                  <div className="text-white/60 text-sm mb-2">{p.description}</div>
                  <div className="text-white/40 text-xs mb-4">Prices shown in {getCurrencyName()}. Billed in USD.</div>
                  <button className={`w-full rounded-xl py-3 font-semibold transition-all ${p.soldOut ? 'bg-white/10 text-white/40 cursor-not-allowed' : 'bg-gradient-to-br from-gold to-gold-dark text-black hover:scale-[1.02]'}`}>{p.soldOut ? 'Unavailable' : 'Add to Collection'}</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Collaborations */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Limited Collaborations</h2>
            <span className="text-white/70 text-sm">Invitation-only</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {collabs.map(c => (
              <div key={c.id} className="rounded-2xl border border-gold/30 bg-black/40 backdrop-blur-xl p-6">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-white font-semibold">{c.name}</div>
                  <div className="text-gold font-bold"><CurrencyClient amount={parseFloat(c.price.replace('£',''))} /></div>
                </div>
                <div className="text-white/60 text-sm mb-2">{c.note}</div>
                <div className="text-white/40 text-xs mb-4">Prices shown in {getCurrencyName()}. Billed in USD.</div>
                <div className="flex gap-3">
                  <button className="rounded-xl border border-gold/30 text-gold px-4 py-2">Join Waitlist</button>
                  <button className="rounded-xl bg-white/10 text-white/60 px-4 py-2 cursor-not-allowed">Preview</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Checkout CTA */}
        <div className="text-center">
          <button className="inline-flex items-center gap-2 rounded-2xl px-8 py-4 border border-gold/40 text-gold hover:bg-gold/10 transition-colors">
            Complete Your Legacy
          </button>
        </div>
      </div>
    </div>
  )
}