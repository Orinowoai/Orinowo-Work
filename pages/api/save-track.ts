import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL as string, process.env.SUPABASE_SERVICE_ROLE_KEY as string)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const { prompt, duration, audio_url, user_id, category } = req.body || {}
    if (!audio_url) {
      return res.status(400).json({ error: 'Missing required field: audio_url' })
    }

    const record = {
      user_id: user_id || null,
      prompt: prompt || null,
      duration: typeof duration === 'number' ? duration : (duration ? Number(duration) : null),
      audio_url,
      category: category || 'personal',
    }

    const { data, error } = await supabase
      .from('tracks')
      .insert(record)
      .select('id')
      .single()

    if (error) {
      console.error('save-track insert error:', error.message || error)
      return res.status(500).json({ error: 'Failed to save track', details: error.message || String(error) })
    }

    return res.status(200).json({ success: true, track_id: data?.id })
  } catch (e: any) {
    console.error('save-track handler error:', e?.message || e)
    return res.status(500).json({ error: 'Internal Server Error', details: e?.message || 'unknown' })
  }
}
