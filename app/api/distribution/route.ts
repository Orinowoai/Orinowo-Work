import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { trackEvent } from '@/lib/events'

export async function POST(req: NextRequest) {
  const { type, title, artist, audioUrl, userId } = await req.json()
  if (!type || !title || !artist || !audioUrl) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }
  const supabase = getServiceSupabase()
  // Store as an event for now; can be upgraded to a real table/queue
  await trackEvent({ userId: userId ?? null, event: 'upload_asset', properties: { kind: 'distribution_submission', type, title, artist, audioUrl } })
  // Optional: send to a dedicated table
  try {
    await supabase.from('events').insert({ user_id: userId ?? null, event: 'distribution_request', properties: { type, title, artist, audioUrl } })
  } catch {}
  return NextResponse.json({ ok: true })
}
