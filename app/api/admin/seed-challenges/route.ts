import { NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

const THEMES = [
  { title: 'Afrobeat x EDM', theme: 'Fusion' },
  { title: 'K-pop x Jazz', theme: 'Fusion' },
  { title: 'Amapiano x House', theme: 'Fusion' },
  { title: 'Drill x R&B', theme: 'Fusion' },
]

export async function POST() {
  const supabase = getServiceSupabase()
  const startsAt = new Date()
  const endsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  for (const t of THEMES) {
    await supabase.from('challenges').insert({
      title: t.title,
      theme: t.theme,
      prize_credits: 500,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
    })
  }
  return NextResponse.json({ ok: true })
}
