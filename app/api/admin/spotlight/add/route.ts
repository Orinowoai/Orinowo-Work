import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { title, type, image_url, month, active } = await req.json()
  if (!title || !type || !image_url) {
    return NextResponse.json({ error: 'Missing title/type/image_url' }, { status: 400 })
  }
  const supabase = getServiceSupabase()
  const m = month ?? new Date().toISOString().slice(0, 7)
  const { data, error } = await supabase
    .from('spotlight')
    .insert({ title, type, image_url, month: m, active: active ?? true })
    .select('*')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, item: data })
}
