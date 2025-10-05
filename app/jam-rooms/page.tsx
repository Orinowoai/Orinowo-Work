'use client'

import { Coins, Lock, Crown, Users, Shield, Headphones, Music2 } from 'lucide-react'
import Link from 'next/link'
import { convertPrice } from '@/lib/currency'

export default function JamRoomsPage() {
  const credits = 120 // PLACEHOLDER

  const tools = [
    { name: 'AI Mastering', cost: 50 },
    { name: 'Vocal Tuning', cost: 30 },
    { name: 'Arrangement AI', cost: 40 },
  ]

  return (
    <div className="min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl border border-gold/20 bg-gradient-to-br from-black to-deep-black p-10 mb-12">
          <div className="absolute -inset-24 opacity-[0.08] pointer-events-none" aria-hidden>
            <div className="w-full h-full bg-[radial-gradient(circle_at_50%_50%,#D4AF37_0%,transparent_35%)]" />
          </div>
          <div className="relative z-10 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 text-gradient">Global Jam Rooms — Where Legends Collaborate</h1>
            <p className="text-white/70 text-lg">Real-time sessions. Worldwide creators. Infinite possibilities.</p>
          </div>
          <div className="absolute top-6 right-6 flex items-center gap-2 text-gold">
            <span className="text-sm">Your Credits:</span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-gold/30 bg-black/40"><Coins className="w-4 h-4"/> {credits}</span>
          </div>
        </div>

        {/* Room Types */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="card-glass rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-white font-bold text-xl">Open Sessions</h2>
              <span className="inline-flex items-center gap-2 text-green-400 text-sm"><span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"/>5 active</span>
            </div>
            <p className="text-white/60 mb-6">Jump in. Create. Share.</p>
            <button className="btn-secondary w-full">Enter Open Session</button>
          </div>

          <div className="card-glass rounded-2xl border border-gold/30 p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-white font-bold text-xl flex items-center gap-2"><Crown className="w-5 h-5 text-gold"/> VIP Sessions</h2>
              <span className="text-white/80 text-sm">2 available</span>
            </div>
            <p className="text-white/60 mb-4">Exclusive access to master creators</p>
            <div className="mb-6"><span className="px-3 py-1 rounded-full bg-gold/15 border border-gold/30 text-gold text-sm">{convertPrice(15)} entry</span></div>
            <button className="btn-primary w-full">Reserve VIP Slot</button>
          </div>

          <div className="card-glass rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-white font-bold text-xl flex items-center gap-2"><Shield className="w-5 h-5 text-gold"/> Private Rooms</h2>
            </div>
            <p className="text-white/60 mb-4">Invite-only, zero distractions</p>
            <div className="mb-6"><span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 text-sm">{convertPrice(5)}/hour</span></div>
            <button className="btn-secondary w-full">Create Private Session</button>
          </div>
        </div>

        {/* Monetization & Tools */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tip Jar */}
          <div className="md:col-span-1 card-glass rounded-2xl border border-gold/20 p-6">
            <h3 className="text-white font-bold mb-2">Support Collaborators</h3>
            <p className="text-white/60 mb-4">Tips go 100% to creators</p>
            <button className="w-full rounded-xl bg-gradient-to-br from-gold to-gold-dark text-black font-bold py-3 hover:scale-[1.02] transition-transform">Tip Jar</button>
          </div>

          {/* Unlockable Tools */}
          <div className="md:col-span-2 card-glass rounded-2xl border border-white/10 p-6">
            <h3 className="text-white font-bold mb-4">Unlockable AI Tools</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {tools.map(t => (
                <div key={t.name} className="relative p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="absolute top-3 right-3 text-white/50"><Lock className="w-4 h-4"/></div>
                  <div className="text-white font-semibold mb-1">{t.name}</div>
                  <div className="text-white/60 text-sm mb-4">Premium enhancement</div>
                  <button className="w-full rounded-lg border border-gold/30 text-gold py-2 hover:bg-gold/10">Unlock • {t.cost} credits</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
