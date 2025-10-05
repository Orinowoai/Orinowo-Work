import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL as string, process.env.SUPABASE_SERVICE_ROLE_KEY as string)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ error: 'Method Not Allowed' })
  }
  try {
    // Cache for 1 hour
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=60')

    const { data, error } = await supabase
      .from('sponsors')
      .select('id, name, logo_url, tagline, website, region')
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(3)

    if (error) {
      console.error('fetch-sponsors error:', error.message || error)
      return res.status(500).json({ error: 'Failed to fetch sponsors', details: error.message || String(error) })
    }

    return res.status(200).json({ sponsors: data || [] })
  } catch (e: any) {
    console.error('fetch-sponsors handler error:', e?.message || e)
    return res.status(500).json({ error: 'Internal Server Error', details: e?.message || 'unknown' })
  }
}
