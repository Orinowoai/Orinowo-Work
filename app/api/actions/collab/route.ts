import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { trackEvent } from '@/lib/events'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({})) as any
  const cookieUser = req.cookies.get('x-user-id')?.value
  const userId = req.headers.get('x-user-id') || cookieUser || body.userId
  if (!userId) return NextResponse.json({ error: 'Missing user' }, { status: 400 })
  const supabase = getServiceSupabase()

  const { data: balData, error: balErr } = await supabase
    .from('credits_balance')
    .select('*')
    .eq('user_id', userId)
    .single()
  if (balErr && balErr.code !== 'PGRST116') return NextResponse.json({ error: balErr.message }, { status: 500 })

  const current = balData?.balance ?? 0
  const next = current + 15
  const { error: upErr } = await supabase
    .from('credits_balance')
    .upsert({ user_id: userId, balance: next }, { onConflict: 'user_id' })
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 })

  await trackEvent({ userId, event: 'credits_earned', properties: { action: 'complete_collab', amount: 15 } })

  return NextResponse.json({ ok: true, balance: next })
}
