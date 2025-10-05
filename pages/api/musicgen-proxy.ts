import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const { prompt, duration } = req.body || {}
    const baseUrl = process.env.NEXT_PUBLIC_AI_SERVICE_URL
    if (!baseUrl) {
      console.error('musicgen-proxy: Missing NEXT_PUBLIC_AI_SERVICE_URL')
      return res.status(500).json({ error: 'Service URL not configured' })
    }
    if (!prompt) {
      return res.status(400).json({ error: 'Missing required field: prompt' })
    }

    const upstreamUrl = `${baseUrl.replace(/\/$/, '')}/generate`

    // Log request
    console.log('musicgen-proxy: Request sent')
    const upstream = await fetch(upstreamUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, duration }),
    })

    const contentType = upstream.headers.get('content-type') || ''
    if (!upstream.ok) {
      const errBody = contentType.includes('application/json')
        ? await upstream.json()
        : await upstream.text()
      console.error('musicgen-proxy upstream error:', {
        status: upstream.status,
        statusText: upstream.statusText,
        body: errBody,
      })
      return res.status(upstream.status).json({ error: 'Upstream error', details: errBody })
    }

    // Pass-through JSON only (keep it simple for now)
    const data = contentType.includes('application/json')
      ? await upstream.json()
      : await upstream.text()

    // If backend is now backgrounding, return as-is (status: processing)
    if (typeof data === 'object' && data && data.status === 'processing' && data.request_id) {
      return res.status(200).json(data)
    }

    // Otherwise normalize to { audio_url }
    let audio_url: string | null = null
    let track_id: string | undefined
    if (typeof data === 'string') {
      audio_url = data
    } else if (data) {
      audio_url = data.audio_url || data.result || null
      track_id = data.track_id
    }

    console.log('musicgen-proxy: Response received', audio_url)

    if (!audio_url) {
      return res.status(502).json({ error: 'No audio_url in upstream response' })
    }

    return res.status(200).json(track_id ? { audio_url, track_id } : { audio_url })
  } catch (e: any) {
    const message = e?.message || 'Unknown error'
    console.error('musicgen-proxy error:', message)
    return res.status(500).json({ error: 'Proxy failed', message })
  }
}
