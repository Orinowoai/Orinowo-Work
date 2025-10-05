"use client";
import { useEffect, useState } from 'react'

type Sponsor = {
  id: string
  name: string
  logo_url?: string | null
  tagline?: string | null
  website?: string | null
  region?: string | null
}

export default function SponsorShowcase() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/fetch-sponsors', { cache: 'force-cache' })
        const json = await res.json()
        if (!res.ok) throw new Error(json?.error || 'Failed to load sponsors')
        setSponsors(json.sponsors || [])
      } catch (e:any) {
        setError(e?.message || 'Failed to load sponsors')
        console.error('SponsorShowcase error:', e)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (loading || error || sponsors.length === 0) {
    return (
      <div className="mt-10 rounded-2xl border border-gold/10 bg-black/40 p-4 text-center text-white/50">
        <div className="text-sm">Supporters of New Sound Culture</div>
        <div className="text-xs">Every play supports emerging music creators.</div>
      </div>
    )
  }

  return (
    <div className="mt-10 rounded-2xl border border-gold/20 bg-black/60 p-4">
      <div className="text-center mb-3">
        <span className="text-white/60 text-sm">Presented in partnership with</span>
      </div>
      <div className="flex items-center justify-center gap-6 overflow-x-auto py-2">
        {sponsors.map((s) => (
          <a
            key={s.id}
            href={s.website || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 px-4 py-2 rounded-xl border border-gold/20 bg-black/40 hover:border-gold/40"
            title={s.tagline || s.name}
          >
            {s.logo_url ? (
              <img src={s.logo_url} alt={s.name} className="h-8 w-auto opacity-80 group-hover:opacity-100" />
            ) : (
              <div className="text-gold font-semibold">{s.name}</div>
            )}
            <div className="hidden sm:block text-white/70 text-xs">{s.tagline || 'Supporters of New Sound Culture'}</div>
          </a>
        ))}
      </div>
      <div className="text-center mt-2 text-white/50 text-xs">Every play supports emerging music creators.</div>
    </div>
  )
}
