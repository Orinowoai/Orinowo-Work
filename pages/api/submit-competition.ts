import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL as string, process.env.SUPABASE_SERVICE_ROLE_KEY as string)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const { track_id, user_id, category } = req.body || {}
    if (!track_id) {
      return res.status(400).json({ error: 'Missing required field: track_id' })
    }

    const newCategory = category === 'competition' ? 'competition' : 'competition'

    const { data, error } = await supabase
      .from('tracks')
      .update({ category: newCategory, user_id: user_id || null })
      .eq('id', track_id)
      .select('id, category')
      .single()

    if (error) {
      console.error('submit-competition error:', error.message || error)
      return res.status(500).json({ error: 'Failed to update track category', details: error.message || String(error) })
    }

    return res.status(200).json({ success: true, track_id: data?.id, category: data?.category })
  } catch (e: any) {
    console.error('submit-competition handler error:', e?.message || e)
    return res.status(500).json({ error: 'Internal Server Error', details: e?.message || 'unknown' })
  }
}
