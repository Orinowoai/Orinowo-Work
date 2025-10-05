export const dynamic = 'force-static'

import { convertPrice, getCurrencyName } from '@/lib/currency'
import Client from './releaseClient'

const PLANS: Array<{ id: 'video' | 'spotify' | 'apple'; title: string; desc: string; price: number; note?: string }> = [
  { id: 'video', title: 'Orinowo Video Premiere', desc: 'Premiere your track on our owned channel (YouTube-equivalent).', price: 0, note: 'Free for subscribers' },
  { id: 'spotify', title: 'DSP Distribution — Spotify', desc: 'Deliver to Spotify via third-party delivery. No affiliation implied.', price: 40 },
  { id: 'apple', title: 'DSP Distribution — Apple Music', desc: 'Deliver to Apple Music via third-party delivery. No affiliation implied.', price: 40 },
]

export default function ReleasePage() {
  const currency = getCurrencyName()
  return <Client plans={PLANS} currency={currency} />
}
