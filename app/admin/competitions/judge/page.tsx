'use client'

import { useEffect, useState } from 'react'

type Entry = {
  id: string
  title: string
  subscriberScore: number
  expertScore: number
  aiScore: number
  totalScore: number
  isTied?: boolean
}

export default function CompetitionJudgePage() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [selectedCompetition, setSelectedCompetition] = useState('')

  useEffect(() => {
    // TODO: fetch competitions and entries
    setEntries([])
  }, [])

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="max-w-6xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-white mb-8">Competition Judging Panel</h1>

        <div className="card-glass p-6 mb-6">
          <label className="block text-white/80 text-sm mb-2">Select Competition</label>
          <select value={selectedCompetition} onChange={(e)=>setSelectedCompetition(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg text-white p-3">
            <option value="">-- Choose --</option>
          </select>
        </div>

        <div className="card-glass p-8">
          <h2 className="text-2xl font-bold text-gold mb-6">Score Breakdown</h2>
          {entries.length === 0 && <p className="text-white/50">No entries yet.</p>}
          {entries.map(entry => (
            <div key={entry.id} className="border-b border-white/10 py-4">
              <h3 className="text-white font-semibold mb-2">{entry.title}</h3>
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-white/40">Subscriber Votes</p>
                  <p className="text-gold font-bold">{entry.subscriberScore}/40</p>
                </div>
                <div>
                  <p className="text-white/40">Expert Panel</p>
                  <p className="text-gold font-bold">{entry.expertScore}/40</p>
                </div>
                <div>
                  <p className="text-white/40">AI Analysis</p>
                  <p className="text-gold font-bold">{entry.aiScore}/20</p>
                </div>
                <div>
                  <p className="text-white/40">Total Score</p>
                  <p className="text-white font-bold text-xl">{entry.totalScore}/100</p>
                </div>
              </div>
              {entry.isTied && (
                <div className="mt-4 p-4 bg-gold/10 border border-gold/30 rounded-lg">
                  <p className="text-gold font-semibold mb-2">⚖️ Tie Detected</p>
                  <button className="btn-primary text-sm">Make Final Determination</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
