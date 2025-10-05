import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { trackEvent } from '@/lib/events'

export async function GET(req: NextRequest) {
  const supabase = getServiceSupabase()
  const { searchParams } = new URL(req.url)
  const challengeId = searchParams.get('challengeId')
  const userId = searchParams.get('userId')
  let query = supabase.from('challenge_submissions').select('*').order('submitted_at', { ascending: false })
  if (challengeId) query = query.eq('challenge_id', challengeId)
  if (userId) query = query.eq('user_id', userId)
  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ submissions: data })
}

export async function POST(req: NextRequest) {
  const supabase = getServiceSupabase()
  const { challengeId, userId, title, description, trackUrl } = await req.json()
  if (!challengeId || !userId || !trackUrl) {
    return NextResponse.json({ error: 'challengeId, userId, and trackUrl are required' }, { status: 400 })
  }

  // Check if already submitted
  const { data: existing, error: exErr } = await supabase
    .from('challenge_submissions')
    .select('id')
    .eq('challenge_id', challengeId)
    .eq('user_id', userId)
    .maybeSingle()
  if (exErr && exErr.code !== 'PGRST116') {
    return NextResponse.json({ error: exErr.message }, { status: 500 })
  }

  let submissionId: string | null = existing?.id ?? null
  if (submissionId) {
    const { error: upErr } = await supabase
      .from('challenge_submissions')
      .update({ title: title ?? null, description: description ?? null, track_url: trackUrl })
      .eq('id', submissionId)
    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 })
  } else {
    const { data: ins, error: inErr } = await supabase
      .from('challenge_submissions')
      .insert({ challenge_id: challengeId, user_id: userId, title: title ?? null, description: description ?? null, track_url: trackUrl })
      .select('id')
      .single()
    if (inErr) return NextResponse.json({ error: inErr.message }, { status: 500 })
    submissionId = ins.id
    // First submission bonus using RPC adjust_credits
    try {
      const { data: newBal, error: rpcErr } = await supabase
        .rpc('adjust_credits', { p_user_id: userId, p_delta: 20, p_reason: 'weekly_challenge_submission', p_meta: { challengeId } as any })
      if (!rpcErr) {
        await trackEvent({ userId, event: 'credits_earned', properties: { action: 'weekly_challenge_submission', amount: 20, challengeId } })
      }
    } catch {}
  }

  return NextResponse.json({ ok: true, id: submissionId })
}

export async function PUT(req: NextRequest) {
  const supabase = getServiceSupabase()
  const { id, userId, title, description, trackUrl } = await req.json()
  if (!id || !userId) return NextResponse.json({ error: 'id and userId are required' }, { status: 400 })
  const { error } = await supabase
    .from('challenge_submissions')
    .update({ title: title ?? null, description: description ?? null, track_url: trackUrl ?? null })
    .eq('id', id)
    .eq('user_id', userId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
