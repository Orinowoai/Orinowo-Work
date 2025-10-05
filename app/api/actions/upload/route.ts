import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { trackEvent } from '@/lib/events'

// Awards credits for an upload action with a simple daily cap
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({})) as any
  const cookieUser = req.cookies.get('x-user-id')?.value
  const userId = req.headers.get('x-user-id') || cookieUser || body.userId
  if (!userId) return NextResponse.json({ error: 'Missing user' }, { status: 400 })

  const supabase = getServiceSupabase()

  // Count today's earned uploads for this user (cap: 3/day → 30 credits)
  const startOfDay = new Date();
  startOfDay.setHours(0,0,0,0)
  const { data: todayEvents, error: evErr } = await supabase
    .from('events')
    .select('id, created_at, properties')
    .eq('user_id', userId)
    .eq('event', 'credits_earned')
    .gte('created_at', startOfDay.toISOString())

  if (evErr) return NextResponse.json({ error: evErr.message }, { status: 500 })

  const earnedUploadsToday = (todayEvents || []).filter((e: any) => e.properties?.action === 'upload_asset').length
  if (earnedUploadsToday >= 3) {
    return NextResponse.json({ ok: true, message: 'Daily upload credits cap reached', balance: undefined })
  }

  // Call credits API logic directly (upsert balance)
  const { data: balData, error: balErr } = await supabase
    .from('credits_balance')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (balErr && balErr.code !== 'PGRST116') return NextResponse.json({ error: balErr.message }, { status: 500 })

  const current = balData?.balance ?? 0
  const next = current + 10
  const { error: upErr } = await supabase
    .from('credits_balance')
    .upsert({ user_id: userId, balance: next }, { onConflict: 'user_id' })
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 })

  await trackEvent({ userId, event: 'credits_earned', properties: { action: 'upload_asset', amount: 10 } })

  return NextResponse.json({ ok: true, balance: next })
}
