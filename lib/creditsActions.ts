import { getServiceSupabase } from '@/lib/supabase'
import { trackEvent } from '@/lib/events'

async function adjustBalance(userId: string, delta: number, reason: string, meta: Record<string, any> = {}) {
  const supabase = getServiceSupabase()
  const { data, error } = await supabase.rpc('adjust_credits', {
    p_user_id: userId,
    p_delta: delta,
    p_reason: reason,
    p_meta: meta as any,
  })
  if (error) throw error
  return (data as number) ?? 0
}

export async function awardUploadCredits(userId: string) {
  const balance = await adjustBalance(userId, 10, 'upload_asset')
  await trackEvent({ userId, event: 'credits_earned', properties: { action: 'upload_asset', amount: 10 } })
  return balance
}

export async function awardCollabCredits(userId: string) {
  const balance = await adjustBalance(userId, 15, 'complete_collab')
  await trackEvent({ userId, event: 'credits_earned', properties: { action: 'complete_collab', amount: 15 } })
  return balance
}

export async function awardWinnerCredits(userId: string, amount = 500) {
  const balance = await adjustBalance(userId, amount, 'challenge_winner', { source: 'weekly-award' })
  await trackEvent({ userId, event: 'credits_earned', properties: { action: 'challenge_winner', amount } })
  return balance
}
