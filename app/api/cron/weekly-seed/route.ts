import { NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = getServiceSupabase()
  const themes = [
    { title: 'Afrobeat x EDM', theme: 'Fusion' },
    { title: 'K-pop x Jazz', theme: 'Fusion' },
    { title: 'Amapiano x House', theme: 'Fusion' },
    { title: 'Drill x R&B', theme: 'Fusion' },
  ]
  const startsAt = new Date()
  const endsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  for (const t of themes) {
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
