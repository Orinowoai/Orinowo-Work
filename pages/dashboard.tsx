"use client";
import { useEffect, useState } from 'react'
import Leaderboard from '@/components/Leaderboard'
import SponsorShowcase from '@/components/SponsorShowcase'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default function DashboardPage() {
  const [tracks, setTracks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/track-stats?sort=plays', { cache: 'no-store' })
        const json = await res.json()
        if (!res.ok) throw new Error(json?.error || 'Failed to load stats')
        setTracks(json.items || [])
      } catch (e:any) {
        setError(e?.message || 'Failed to load dashboard')
        console.error('dashboard load error:', e)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const labels = tracks.map(t => (t.tracks?.prompt || 'Untitled').slice(0, 16))
  const plays = tracks.map(t => t.plays || 0)
  const likes = tracks.map(t => t.likes || 0)
  const earnings = tracks.map(t => Number(t.earnings || 0))

  const data = {
    labels,
    datasets: [
      { label: 'Plays', data: plays, backgroundColor: 'rgba(212, 175, 55, 0.6)' },
      { label: 'Likes', data: likes, backgroundColor: 'rgba(255, 99, 132, 0.5)' },
      { label: 'Earnings', data: earnings, backgroundColor: 'rgba(255, 159, 64, 0.5)' },
    ],
  }

  return (
    <div className="min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-white mb-6">Monetization Dashboard</h1>

        {loading ? (
          <div className="text-white/60">Loading…</div>
        ) : error ? (
          <div className="text-red-400">{error}</div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            <div className="rounded-2xl border border-gold/20 bg-black/40 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Performance Overview</h2>
              <Bar data={data} options={{ responsive: true, plugins: { legend: { labels: { color: '#fff' } }, title: { display: false } }, scales: { x: { ticks: { color: '#ddd' } }, y: { ticks: { color: '#ddd' } } } }} />
            </div>

            <div className="rounded-2xl border border-gold/20 bg-black/40 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Leaderboard</h2>
              <Leaderboard />
            </div>

            <div className="rounded-2xl border border-gold/20 bg-black/40 p-6 flex gap-4 flex-wrap">
              <button className="btn-primary" title="Support this artist">Promote Track</button>
              <button className="btn-secondary" title="Withdraw available balance">Withdraw Earnings</button>
              <a href="/sponsorship-form" className="btn-secondary" title="Trending track">Submit for Sponsorship</a>
            </div>

            <div>
              <SponsorShowcase />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
