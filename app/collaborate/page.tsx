'use client'

import { useMemo, useState } from 'react'

type Profile = {
  id: string
  name: string
  role: 'Artist' | 'Producer' | 'Songwriter' | 'Engineer'
  genre: string
  location: string
  credits: number
}

const MOCK_PROFILES: Profile[] = [
  { id: 'p1', name: 'Luna Rodriguez', role: 'Artist', genre: 'Pop', location: 'London', credits: 420 },
  { id: 'p2', name: 'Marcus Chen', role: 'Producer', genre: 'EDM', location: 'Berlin', credits: 610 },
  { id: 'p3', name: 'Aria Thompson', role: 'Songwriter', genre: 'R&B', location: 'Los Angeles', credits: 310 },
  { id: 'p4', name: 'Jordan Blake', role: 'Engineer', genre: 'Hip-Hop', location: 'New York', credits: 220 },
  { id: 'p5', name: 'Sam Rivera', role: 'Producer', genre: 'Afrobeats', location: 'Lagos', credits: 530 },
  { id: 'p6', name: 'Alex Morgan', role: 'Artist', genre: 'Indie', location: 'Toronto', credits: 180 },
]

export default function CollaboratePage() {
  const [role, setRole] = useState<string>('')
  const [genre, setGenre] = useState<string>('')
  const [query, setQuery] = useState<string>('')

  const results = useMemo(() => {
    return MOCK_PROFILES.filter(p =>
      (!role || p.role === role) &&
      (!genre || p.genre === genre) &&
      (!query || [p.name, p.location, p.genre].join(' ').toLowerCase().includes(query.toLowerCase()))
    )
  }, [role, genre, query])

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="mb-10 text-center">
          <div className="inline-block px-4 py-2 rounded-full bg-gold/10 border border-gold/20 backdrop-blur-sm mb-4">
            <span className="text-gold font-semibold text-sm tracking-wide">🤝 AI MATCHMAKER</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3 text-gradient">Find your perfect collaborator</h1>
          <p className="text-white/70 max-w-2xl mx-auto">Match with artists, producers, and songwriters who complement your sound and goals.</p>
        </div>

        {/* Filters */}
        <div className="rounded-2xl border border-gold/20 bg-white/5 backdrop-blur-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select value={role} onChange={e => setRole(e.target.value)} className="w-full rounded-xl bg-black/50 border border-gold/20 px-4 py-3 text-white">
              <option value="">All roles</option>
              {['Artist','Producer','Songwriter','Engineer'].map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <select value={genre} onChange={e => setGenre(e.target.value)} className="w-full rounded-xl bg-black/50 border border-gold/20 px-4 py-3 text-white">
              <option value="">All genres</option>
              {['Pop','EDM','R&B','Hip-Hop','Afrobeats','Indie'].map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search name or location" className="w-full rounded-xl bg-black/50 border border-gold/20 px-4 py-3 text-white placeholder-white/40" />
            <button className="rounded-xl bg-gradient-to-br from-gold to-gold-dark text-black font-semibold px-6 py-3">Request Match</button>
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {results.map((p) => (
            <div key={p.id} className="group rounded-2xl overflow-hidden border border-gold/20 bg-black/40 backdrop-blur-xl hover:border-gold/40 transition-all">
              <div className="relative aspect-video bg-white/5">
                <div className="absolute inset-0 flex items-center justify-center text-white/30">{p.name} • {p.role}</div>
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/80 text-xs tracking-wide">{p.genre}</div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-white font-semibold">{p.name}</div>
                  <div className="text-gold font-bold">{p.credits} credits</div>
                </div>
                <div className="text-white/60 text-sm mb-4">{p.role} • {p.location}</div>
                <div className="flex gap-3">
                  <button className="rounded-xl bg-gradient-to-br from-gold to-gold-dark text-black font-semibold px-4 py-2">Request Collab</button>
                  <button className="rounded-xl border border-gold/30 text-gold px-4 py-2">View Profile</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
