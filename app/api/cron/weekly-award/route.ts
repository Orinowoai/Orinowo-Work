import { NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { awardWinnerCredits } from '@/lib/creditsActions'
import { trackEvent } from '@/lib/events'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = getServiceSupabase()

  // Look back 7 days for credits_earned events and pick top 3 users by total amount
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { data: events, error } = await supabase
    .from('events')
    .select('user_id, properties, created_at, event')
    .eq('event', 'credits_earned')
    .gte('created_at', since)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const totals = new Map<string, number>()
  for (const e of events ?? []) {
    if (!e.user_id) continue
    const amt = typeof e.properties?.amount === 'number' ? e.properties.amount : 0
    totals.set(e.user_id, (totals.get(e.user_id) ?? 0) + amt)
  }

  const sorted = Array.from(totals.entries()).sort((a, b) => b[1] - a[1])
  const winners = sorted.slice(0, 3).map(([user]) => user)

  const results: Array<{ userId: string; newBalance: number }> = []
  for (const userId of winners) {
    const newBalance = await awardWinnerCredits(userId, 500)
    await trackEvent({ userId, event: 'credits_earned', properties: { action: 'weekly_winner_bonus', amount: 500 } })
    results.push({ userId, newBalance })
  }

  return NextResponse.json({ ok: true, winners: results })
}
