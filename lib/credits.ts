// Credits earn/burn rules and helpers

export type CreditAction =
  | 'upload_asset'
  | 'complete_collab'
  | 'invite_accepted'
  | 'weekly_challenge_submission'
  | 'streak_day'

export const EARN_RULES: Record<CreditAction, { amount: number; dailyCap?: number }> = {
  upload_asset: { amount: 10, dailyCap: 30 },
  complete_collab: { amount: 15 },
  invite_accepted: { amount: 25, dailyCap: 100 },
  weekly_challenge_submission: { amount: 20 },
  streak_day: { amount: 5 },
}

export type ToolRedeem =
  | 'songwriting_prompt'
  | 'hook_generator'
  | 'mastering_single'
  | 'vocal_tuning'
  | 'stem_separation'
  | 'style_transfer'
  | 'ar_scoring'
  | 'featured_listing_boost'
  | 'dsp_fast_track'

export const REDEEM_COSTS: Record<ToolRedeem, number> = {
  songwriting_prompt: 5,
  hook_generator: 5,
  mastering_single: 25,
  vocal_tuning: 15,
  stem_separation: 20,
  style_transfer: 10,
  ar_scoring: 10,
  featured_listing_boost: 100,
  dsp_fast_track: 200,
}
