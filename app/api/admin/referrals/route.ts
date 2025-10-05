import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

function randomCode(len = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let out = ''
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)]
  return out
}

export async function POST(req: NextRequest) {
  // TODO: Gate with admin auth; for now assume service role usage
  const { userId } = await req.json()
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
  const supabase = getServiceSupabase()

  const code = randomCode()
  const { data, error } = await supabase.from('referrals').insert({ user_id: userId, code }).select('*').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ code: data.code })
}
