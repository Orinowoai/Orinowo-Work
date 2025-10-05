import React from 'react'
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import { createClient } from '@supabase/supabase-js'
import { Bar, Line, Pie } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement)

type Props = {
  total7d: number
  avgLatency: number
  cacheRate: number
  topPrompts: { prompt: string; count: number }[]
  topCountries: { country: string; count: number }[]
  dailyCounts: { day: string; count: number }[]
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const adminEmail = process.env.ADMIN_EMAIL
  const userEmail = ctx.req.cookies['user-email'] || (ctx.req.headers['x-user-email'] as string | undefined)
  if (!adminEmail || userEmail !== adminEmail) {
    return { redirect: { destination: '/403', permanent: false } } as any
  }

  const url = process.env.SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const supabase = createClient(url, key)

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  // totals and avg latency
  const { data: recent, error: errRecent } = await supabase
    .from('generation_logs')
    .select('id, latency, is_cache_hit, status, created_at')
    .gte('created_at', since)
  if (errRecent) throw errRecent

  const total7d = recent?.length || 0
  const latencies = (recent || []).map((r: any) => Number(r.latency || 0)).filter((n) => Number.isFinite(n) && n >= 0)
  const avgLatency = latencies.length ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0
  const cacheHits = (recent || []).filter((r: any) => r.is_cache_hit).length
  const cacheRate = total7d ? cacheHits / total7d : 0

  // top prompts
  const { data: topPromptData } = await supabase
    .from('generation_logs')
    .select('prompt, count:count(*)')
    .gte('created_at', since)
    .not('prompt', 'is', null)
    .order('count', { ascending: false })
    .limit(5)
  const topPrompts = (topPromptData || []).map((r: any) => ({ prompt: r.prompt || 'Unknown', count: Number(r.count) }))

  // top countries
  const { data: topCountryData } = await supabase
    .from('generation_logs')
    .select('country, count:count(*)')
    .gte('created_at', since)
    .not('country', 'is', null)
    .order('count', { ascending: false })
    .limit(10)
  const topCountries = (topCountryData || []).map((r: any) => ({ country: r.country || 'Unknown', count: Number(r.count) }))

  // daily counts (last 7 days)
  const { data: dailyData } = await supabase.rpc('daily_generation_counts', { since_ts: since })
  const dailyCounts = (dailyData || []).map((d: any) => ({ day: d.day, count: Number(d.count) }))

  return {
    props: { total7d, avgLatency, cacheRate, topPrompts, topCountries, dailyCounts },
  }
}

export default function AnalyticsPage({ total7d, avgLatency, cacheRate, topPrompts, topCountries, dailyCounts }: Props) {
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <Head>
        <title>Admin Analytics — Orinowo</title>
      </Head>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gold mb-6">Global AI Usage & Performance</h1>

        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="rounded-xl border border-gold/20 bg-black/50 p-4">
            <div className="text-white/60 text-sm">Total (7d)</div>
            <div className="text-3xl font-bold">{total7d}</div>
          </div>
          <div className="rounded-xl border border-gold/20 bg-black/50 p-4">
            <div className="text-white/60 text-sm">Avg Latency</div>
            <div className="text-3xl font-bold">{avgLatency.toFixed(0)} ms</div>
          </div>
          <div className="rounded-xl border border-gold/20 bg-black/50 p-4">
            <div className="text-white/60 text-sm">Cache Hit Rate</div>
            <div className="text-3xl font-bold">{(cacheRate * 100).toFixed(1)}%</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Line Chart */}
          <div className="rounded-xl border border-gold/20 bg-black/50 p-4 lg:col-span-2">
            <h2 className="text-xl font-semibold mb-2">Daily Generations</h2>
            <Line
              data={{
                labels: dailyCounts.map((d) => d.day),
                datasets: [{
                  label: 'Generations',
                  data: dailyCounts.map((d) => d.count),
                  borderColor: 'rgba(212, 175, 55, 0.9)',
                  backgroundColor: 'rgba(212, 175, 55, 0.2)'
                }]
              }}
              options={{ responsive: true, plugins: { legend: { labels: { color: '#fff' } } }, scales: { x: { ticks: { color: '#ddd' } }, y: { ticks: { color: '#ddd' } } } }}
            />
          </div>

          {/* System Health Sidebar */}
          <div className="rounded-xl border border-gold/20 bg-black/50 p-4">
            <h2 className="text-xl font-semibold mb-2">System Health</h2>
            <SystemHealthWidget />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Top Prompts */}
          <div className="rounded-xl border border-gold/20 bg-black/50 p-4">
            <h2 className="text-xl font-semibold mb-2">Top Prompts</h2>
            <Bar
              data={{
                labels: topPrompts.map((p) => p.prompt.slice(0, 24)),
                datasets: [{ label: 'Count', data: topPrompts.map((p) => p.count), backgroundColor: 'rgba(212, 175, 55, 0.6)' }]
              }}
              options={{ indexAxis: 'y' as const, plugins: { legend: { labels: { color: '#fff' } } }, scales: { x: { ticks: { color: '#ddd' } }, y: { ticks: { color: '#ddd' } } } }}
            />
          </div>

          {/* Regional Distribution */}
          <div className="rounded-xl border border-gold/20 bg-black/50 p-4">
            <h2 className="text-xl font-semibold mb-2">Regional Usage</h2>
            <Pie
              data={{
                labels: topCountries.map((c) => c.country || 'Unknown'),
                datasets: [{
                  label: 'Generations',
                  data: topCountries.map((c) => c.count),
                  backgroundColor: ['#d4af37', '#b8860b', '#daa520', '#ffd700', '#a98600', '#8b7500']
                }]
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function SystemHealthWidget() {
  const [data, setData] = React.useState<any>(null)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let mounted = true
    const fetchData = async () => {
      try {
        const res = await fetch('/api/system-health')
        const json = await res.json()
        if (!res.ok) throw new Error(json?.error || 'Failed to load health')
        if (mounted) setData(json)
      } catch (e: any) {
        if (mounted) setError(e?.message || 'Failed to load health')
      }
    }
    fetchData()
    const t = setInterval(fetchData, 5000)
    return () => { mounted = false; clearInterval(t) }
  }, [])

  if (error) return <div className="text-red-400 text-sm">{error}</div>
  if (!data) return <div className="text-white/60 text-sm">Loading…</div>

  return (
    <div className="text-sm text-white/80 space-y-1">
      <div>Uptime: {data.uptime.toFixed(0)}s</div>
      <div>Active Requests: {data.activeRequests}</div>
      <div>Avg Latency: {data.averageLatency.toFixed(0)} ms</div>
      <div>Success Rate: {(data.successRate * 100).toFixed(1)}%</div>
    </div>
  )
}
