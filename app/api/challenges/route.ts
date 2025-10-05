import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

export async function GET() {
  const supabase = getServiceSupabase()
  const { data, error } = await supabase
    .from('challenges')
    .select('*')
    .order('starts_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ challenges: data })
}

export async function POST(req: NextRequest) {
  const supabase = getServiceSupabase()
  const body = await req.json()
  const { title, theme, prizeCredits = 500, startsAt, endsAt } = body
  const { error } = await supabase.from('challenges').insert({
    title,
    theme,
    prize_credits: prizeCredits,
    starts_at: startsAt ?? new Date().toISOString(),
    ends_at: endsAt ?? null,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
