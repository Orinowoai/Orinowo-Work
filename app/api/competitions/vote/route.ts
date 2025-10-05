import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const supabase = getServiceSupabase()

    // NOTE: Replace with your auth validation (e.g., reading cookies/JWT)
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { competitionId, entryId, userId } = await request.json()
    if (!competitionId || !entryId || !userId) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // Check user subscription tier
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', userId)
      .single()

    if (profileErr) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    if (!profile || profile.subscription_tier === 'free' || profile.subscription_tier === 'novice') {
      return NextResponse.json({ 
        error: 'Voting requires Rising Star tier or higher',
        upgradeRequired: true 
      }, { status: 403 })
    }

    // Upsert vote (one per competition per user)
    const { data: existing } = await supabase
      .from('competition_votes')
      .select('id')
      .eq('competition_id', competitionId)
      .eq('user_id', userId)
      .maybeSingle?.() ?? { data: null }

    if (existing) {
      const { error } = await supabase
        .from('competition_votes')
        .update({ entry_id: entryId, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
      if (error) throw error
    } else {
      const { error } = await supabase
        .from('competition_votes')
        .insert({ competition_id: competitionId, entry_id: entryId, user_id: userId })
      if (error) throw error
    }

    // Basic anti-abuse metadata log (optional)
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    // Optional: if vote_logs table exists, log metadata
    try {
      await supabase.from('vote_logs').insert({ user_id: userId, competition_id: competitionId, ip_address: ip })
    } catch {}

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Voting error:', error)
    return NextResponse.json({ error: 'Failed to record vote' }, { status: 500 })
  }
}
