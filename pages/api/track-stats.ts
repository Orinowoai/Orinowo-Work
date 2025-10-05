import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL as string, process.env.SUPABASE_SERVICE_ROLE_KEY as string)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') return getTop(req, res)
  if (req.method === 'POST') return updateStat(req, res)
  res.setHeader('Allow', ['GET', 'POST'])
  return res.status(405).json({ error: 'Method Not Allowed' })
}

async function getTop(req: NextApiRequest, res: NextApiResponse) {
  try {
    const sort = (req.query.sort as string) || 'plays' // 'plays' | 'likes' | 'earnings'
    const valid = new Set(['plays', 'likes', 'earnings'])
    const sortCol = valid.has(sort) ? sort : 'plays'

    const { data, error } = await supabase
      .from('track_stats')
      .select(`track_id, plays, likes, downloads, earnings, last_updated, tracks:track_id ( prompt, audio_url, user_id )`)
      .order(sortCol, { ascending: false })
      .limit(10)

    if (error) {
      console.error('track-stats get error:', error.message || error)
      return res.status(500).json({ error: 'Failed to fetch stats', details: error.message || String(error) })
    }

    return res.status(200).json({ items: data || [] })
  } catch (e: any) {
    console.error('track-stats get handler error:', e?.message || e)
    return res.status(500).json({ error: 'Internal Server Error', details: e?.message || 'unknown' })
  }
}

async function updateStat(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { track_id, action, amount } = req.body || {}
    if (!track_id || !action) {
      return res.status(400).json({ error: 'Missing required fields: track_id, action' })
    }

    const inc = typeof amount === 'number' ? amount : 1
    const fields: any = { last_updated: new Date().toISOString() }
    if (action === 'play') fields.plays = supabase.rpc as any // placeholder to satisfy TS
    if (action === 'like') fields.likes = supabase.rpc as any
    if (action === 'download') fields.downloads = supabase.rpc as any
    if (action === 'earn') fields.earnings = (inc as number)

    // Upsert-like behavior: ensure a row exists, then increment
    const { data: existing, error: findError } = await supabase
      .from('track_stats')
      .select('id, plays, likes, downloads, earnings, sponsor_clicks')
      .eq('track_id', track_id)
      .maybeSingle()

    if (findError) {
      console.error('track-stats find error:', findError.message || findError)
      return res.status(500).json({ error: 'Failed to load current stats', details: findError.message || String(findError) })
    }

    if (!existing) {
      const initial = {
        track_id,
        plays: action === 'play' ? inc : 0,
        likes: action === 'like' ? inc : 0,
        downloads: action === 'download' ? inc : 0,
        sponsor_clicks: action === 'sponsor_click' ? inc : 0,
        earnings: action === 'earn' ? inc : 0,
      }
      const { error: insertError } = await supabase.from('track_stats').insert(initial)
      if (insertError) {
        console.error('track-stats insert error:', insertError.message || insertError)
        return res.status(500).json({ error: 'Failed to initialize stats', details: insertError.message || String(insertError) })
      }
      return res.status(200).json({ success: true })
    } else {
      const patch: any = { last_updated: new Date().toISOString() }
      if (action === 'play') patch.plays = (existing.plays || 0) + inc
      if (action === 'like') patch.likes = (existing.likes || 0) + inc
      if (action === 'download') patch.downloads = (existing.downloads || 0) + inc
      if (action === 'sponsor_click') patch.sponsor_clicks = (existing.sponsor_clicks || 0) + inc
      if (action === 'earn') patch.earnings = Number(existing.earnings || 0) + inc

      // Ad revenue sharing: +$0.5 per 100 sponsor clicks
      if (action === 'sponsor_click') {
        const totalClicks = (existing.sponsor_clicks || 0) + inc
        const prevBuckets = Math.floor((existing.sponsor_clicks || 0) / 100)
        const currBuckets = Math.floor(totalClicks / 100)
        const bucketsDelta = currBuckets - prevBuckets
        if (bucketsDelta > 0) {
          const bonus = 0.5 * bucketsDelta
          patch.earnings = Number(existing.earnings || 0) + (patch.earnings ? Number(patch.earnings) : 0) + bonus
        }
      }

      const { error: updateError } = await supabase
        .from('track_stats')
        .update(patch)
        .eq('track_id', track_id)

      if (updateError) {
        console.error('track-stats update error:', updateError.message || updateError)
        return res.status(500).json({ error: 'Failed to update stats', details: updateError.message || String(updateError) })
      }
      return res.status(200).json({ success: true })
    }
  } catch (e: any) {
    console.error('track-stats post handler error:', e?.message || e)
    return res.status(500).json({ error: 'Internal Server Error', details: e?.message || 'unknown' })
  }
}
