import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { EARN_RULES, REDEEM_COSTS, CreditAction, ToolRedeem } from '@/lib/credits'
import { trackEvent } from '@/lib/events'

export async function GET(req: NextRequest) {
  const userId = req.headers.get('x-user-id')
  if (!userId) return NextResponse.json({ error: 'Missing user' }, { status: 400 })
  const supabase = getServiceSupabase()
  const { data, error } = await supabase
    .from('credits_balance')
    .select('*')
    .eq('user_id', userId)
    .single()
  // If no row found, return zero balance gracefully
  if (error) {
    const code = (error as any).code
    if (code === 'PGRST116' || /No rows|Results contain 0 rows/i.test(error.message)) {
      return NextResponse.json({ balance: 0 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ balance: data?.balance ?? 0 })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { type, action, tool }: { type: 'earn' | 'redeem'; action?: CreditAction; tool?: ToolRedeem } = body
  const userId = req.headers.get('x-user-id')
  if (!userId) return NextResponse.json({ error: 'Missing user' }, { status: 400 })

  const supabase = getServiceSupabase()
  const { data: balData, error: balErr } = await supabase
    .from('credits_balance')
    .select('*')
    .eq('user_id', userId)
    .single()
  if (balErr && balErr.code !== 'PGRST116') return NextResponse.json({ error: balErr.message }, { status: 500 })

  let current = balData?.balance ?? 0
  let delta = 0
  if (type === 'earn' && action) {
    const rule = EARN_RULES[action]
    if (!rule) return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    delta = rule.amount
    await trackEvent({ userId, event: 'credits_earned', properties: { action, amount: rule.amount } })
  } else if (type === 'redeem' && tool) {
    const cost = REDEEM_COSTS[tool]
    if (!cost) return NextResponse.json({ error: 'Invalid tool' }, { status: 400 })
    if (current < cost) return NextResponse.json({ error: 'Insufficient credits' }, { status: 400 })
    delta = -cost
    await trackEvent({ userId, event: 'credits_redeemed', properties: { tool, cost } })
  } else {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  // Atomic adjust via RPC and ledger write
  const { data: newBal, error: rpcErr } = await supabase.rpc('adjust_credits', {
    p_user_id: userId,
    p_delta: delta,
    p_reason: type === 'earn' ? (action as string) : (tool as string),
    p_meta: { source: 'api/credits' } as any,
  })
  if (rpcErr) return NextResponse.json({ error: rpcErr.message }, { status: 500 })
  return NextResponse.json({ balance: (newBal as number) ?? current + delta })
}
