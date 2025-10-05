export const dynamic = 'force-static'

import { Trophy, Flame, Handshake, Upload, Star, Shield, Crown, Gem } from 'lucide-react'
import Link from 'next/link'

export default function LoyaltyPage() {
  const balance = 1240 // PLACEHOLDER
  const streakDays = 12 // PLACEHOLDER

  const earn = [
    { icon: Upload, label: 'Upload track', value: '+50' },
    { icon: Handshake, label: 'Complete collaboration', value: '+100' },
    { icon: Flame, label: '7-day streak', value: '+150' },
    { icon: Trophy, label: 'Monthly challenge', value: '+300' },
  ]

  const spend = ['AI Tools', 'VIP Jam Rooms', 'Merch Discounts', 'DSP Fast Track']

  const levels = [
    { id: 'novice', name: 'NOVICE', range: '0-500', benefits: 'Basic AI tools, Community access', icon: Star, border: 'from-[#cd7f32]/60 to-[#a46a2e]/40' },
    { id: 'rising', name: 'RISING STAR', range: '501-2,000', benefits: 'Priority support, Advanced tools', icon: Shield, border: 'from-[#C0C0C0]/60 to-[#9aa0a6]/40' },
    { id: 'master', name: 'MASTER', range: '2,001-10,000', benefits: 'Unlimited AI, DSP Fast Track, Exclusive events', icon: Crown, border: 'from-gold/60 to-gold-dark/40' },
    { id: 'pioneer', name: 'GLOBAL PIONEER', range: '10,000+', benefits: 'Revenue opportunities, Summit invites', icon: Gem, border: 'from-[#E5E4E2]/70 to-[#BCC6CC]/40' },
  ]

  const tx = [
    { type: 'Earned', reason: 'Collaboration completed', amount: '+100', date: '2025-10-02' },
    { type: 'Spent', reason: 'AI Mastering', amount: '-50', date: '2025-10-01' },
    { type: 'Earned', reason: '7-day streak', amount: '+150', date: '2025-09-30' },
  ]

  return (
    <div className="min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 text-gradient">Loyalty Dashboard</h1>
          <p className="text-white/60">Orinowo Credits • Prestige • Momentum</p>
        </div>

        {/* Balance & Streak */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="md:col-span-2 card-glass rounded-2xl border border-gold/30 p-8 bg-white/5 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white/70 text-sm tracking-widest mb-2">CURRENT BALANCE</div>
                <div className="text-5xl font-black text-gold drop-shadow">{balance.toLocaleString()} Credits</div>
              </div>
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center shadow-glow">
                <span className="text-black font-extrabold text-2xl">◎</span>
              </div>
            </div>
          </div>
          <div className="card-glass rounded-2xl border border-gold/20 p-8 bg-white/5 backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <Flame className="w-8 h-8 text-gold" />
              <div>
                <div className="text-sm text-white/60">Day Streak</div>
                <div className="text-3xl font-bold text-white">🔥 {streakDays}</div>
              </div>
            </div>
            <div className="mt-4 h-2 w-full bg-white/10 rounded-full">
              <div className="h-2 rounded-full bg-gold" style={{ width: `${(streakDays % 7) * (100/7)}%` }} />
            </div>
            <div className="mt-2 text-xs text-white/50">{7 - (streakDays % 7)} days to next milestone</div>
          </div>
        </div>

        {/* Earn & Spend */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="card-glass rounded-2xl border border-gold/20 p-8">
            <h2 className="text-2xl font-bold text-white mb-6">How to Earn</h2>
            <div className="space-y-4">
              {earn.map((e) => (
                <div key={e.label} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-gold/10">
                  <div className="flex items-center gap-3">
                    <e.icon className="w-6 h-6 text-gold" />
                    <span className="text-white/90 font-medium">{e.label}</span>
                  </div>
                  <span className="text-gold font-semibold">{e.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card-glass rounded-2xl border border-gold/20 p-8">
            <h2 className="text-2xl font-bold text-white mb-6">How to Spend</h2>
            <ul className="grid grid-cols-2 gap-4">
              {spend.map(s => (
                <li key={s} className="p-4 rounded-xl bg-white/5 border border-gold/10 text-white/80">{s}</li>
              ))}
            </ul>
            <div className="mt-6 text-sm text-white/60">Use credits across AI tools, sessions, and exclusive perks.</div>
          </div>
        </div>

        {/* Levels */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Creator Levels</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {levels.map(L => (
              <div key={L.id} className={`relative rounded-2xl p-[2px] bg-gradient-to-br ${L.border}`}>
                <div className="rounded-2xl h-full w-full bg-black p-6">
                  <div className="flex items-center justify-between mb-4">
                    <L.icon className="w-6 h-6 text-gold" />
                    {L.id === 'rising' && (
                      <span className="text-xs px-2 py-1 rounded-full bg-gold/15 border border-gold/30 text-gold">Current Level</span>
                    )}
                  </div>
                  <div className="text-white font-bold tracking-wider">{L.name}</div>
                  <div className="text-white/50 text-sm mb-3">Credits: {L.range}</div>
                  <div className="text-white/80 text-sm">{L.benefits}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transactions */}
        <div className="card-glass rounded-2xl border border-gold/20 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Recent Activity</h2>
            <Link href="/plans" className="text-gold hover:text-gold-light transition-colors">Earn more credits</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="text-white/60 text-sm">
                  <th className="py-3 pr-6">Type</th>
                  <th className="py-3 pr-6">Details</th>
                  <th className="py-3 pr-6">Amount</th>
                  <th className="py-3 pr-6">Date</th>
                </tr>
              </thead>
              <tbody>
                {tx.map((t, i) => (
                  <tr key={i} className="border-t border-white/10 text-white/80">
                    <td className="py-4 pr-6">{t.type}</td>
                    <td className="py-4 pr-6">{t.reason}</td>
                    <td className={`py-4 pr-6 ${t.amount.startsWith('-') ? 'text-red-400' : 'text-gold'}`}>{t.amount}</td>
                    <td className="py-4 pr-6">{t.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
