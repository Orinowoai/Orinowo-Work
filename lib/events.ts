import { getServiceSupabase } from './supabase'

export type EventName =
  | 'sign_up'
  | 'invite_sent'
  | 'invite_accepted'
  | 'jamroom_joined'
  | 'collab_created'
  | 'upload_asset'
  | 'purchase_made'
  | 'tip_sent'
  | 'credits_earned'
  | 'credits_redeemed'
  | 'streak_day_completed'
  | 'challenge_joined'
  | 'spotlight_featured'

export interface TrackEventInput {
  userId?: string | null
  event: EventName
  properties?: Record<string, any>
}

export async function trackEvent({ userId, event, properties = {} }: TrackEventInput) {
  const supabase = getServiceSupabase()
  await supabase.from('events').insert({
    user_id: userId ?? null,
    event,
    properties,
  })
}
