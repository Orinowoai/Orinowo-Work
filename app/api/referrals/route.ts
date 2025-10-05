import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { trackEvent } from '@/lib/events'

export async function POST(req: NextRequest) {
  const { code, invitedUserId } = await req.json()
  const supabase = getServiceSupabase()

  const { data: ref, error } = await supabase
    .from('referrals')
    .select('*')
    .eq('code', code)
    .single()
  if (error || !ref) return NextResponse.json({ error: 'Invalid code' }, { status: 400 })

  // Mark accepted
  await supabase.from('referrals').update({ accepted_by: invitedUserId, accepted_at: new Date().toISOString() }).eq('id', ref.id)
  await trackEvent({ userId: ref.user_id, event: 'invite_accepted', properties: { invitedUserId } })
  await trackEvent({ userId: invitedUserId, event: 'invite_accepted', properties: { referrer: ref.user_id } })

  // Award referrer credits (+25) using RPC; ignore failures but log event if successful
  const { error: rpcErr } = await supabase.rpc('adjust_credits', {
    p_user_id: ref.user_id,
    p_delta: 25,
    p_reason: 'invite_accepted',
    p_meta: { invitedUserId } as any,
  })
  if (!rpcErr) {
    await trackEvent({ userId: ref.user_id, event: 'credits_earned', properties: { action: 'invite_accepted', amount: 25, invitedUserId } })
  }
  return NextResponse.json({ ok: true })
}
