import { NextRequest, NextResponse } from 'next/server'
import { awardWinnerCredits } from '@/lib/creditsActions'

export async function POST(req: NextRequest) {
  const { userId, amount } = await req.json()
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
  const balance = await awardWinnerCredits(userId, amount ?? 500)
  return NextResponse.json({ ok: true, balance })
}
