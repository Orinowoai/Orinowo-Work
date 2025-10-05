import Link from 'next/link'

type Challenge = {
  id: string
  title: string
  theme: string
  prize_credits: number
  starts_at: string
  ends_at: string | null
}

function statusFor(ch: Challenge) {
  const now = Date.now()
  const start = new Date(ch.starts_at).getTime()
  const end = ch.ends_at ? new Date(ch.ends_at).getTime() : null
  if (end && now > end) return 'Ended'
  if (now >= start && (!end || now <= end)) return 'LIVE'
  return 'Opens Soon'
}

function formatEnds(ch: Challenge) {
  if (!ch.ends_at) return 'TBA'
  const d = new Date(ch.ends_at)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

async function fetchChallenges(): Promise<Challenge[]> {
  try {
    const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const res = await fetch(`${base}/api/challenges`, { cache: 'no-store' })
    if (!res.ok) throw new Error('Failed to load challenges')
    const json = await res.json()
    return json.challenges ?? []
  } catch (e) {
    return []
  }
}

export default async function ChallengesPage() {
  const challenges = await fetchChallenges()
  const [featured, ...rest] = challenges

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Featured */}
        <div className="rounded-3xl border border-gold/30 bg-white/5 backdrop-blur-xl p-8 md:p-12 mb-10">
          {featured ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              <div className="md:col-span-2">
                <div className="inline-block px-4 py-2 rounded-full bg-gold/10 border border-gold/20 backdrop-blur-sm mb-4">
                  <span className="text-gold font-semibold text-sm tracking-wide">🏆 FEATURED CHALLENGE</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{featured.title}</h1>
                <p className="text-white/70 mb-3">Theme: {featured.theme}</p>
                <div className="text-gold font-semibold">Prize Pool: {featured.prize_credits} credits</div>
                <div className="text-white/50 text-sm mt-1">Ends {formatEnds(featured)} • {statusFor(featured)}</div>
              </div>
              <div className="text-center md:text-right">
                <Link href="/spotlight#competitions" className="btn-primary inline-flex items-center justify-center px-8 py-4">Enter Now</Link>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Challenges</h1>
              <p className="text-white/70">No challenges found. You can seed demo challenges via POST /api/admin/seed-challenges.</p>
            </div>
          )}
        </div>

        {/* Grid */}
        {rest.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {rest.map(u => (
              <div key={u.id} className="rounded-2xl border border-gold/20 bg-black/40 backdrop-blur-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-white font-semibold">{u.title}</div>
                  <div className="text-gold font-bold">{u.prize_credits} credits</div>
                </div>
                <div className="text-white/60 text-sm mb-4">Ends {formatEnds(u)}</div>
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/70 text-xs">{statusFor(u)}</span>
                  <button className="rounded-xl border border-gold/30 text-gold px-4 py-2">Notify Me</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
