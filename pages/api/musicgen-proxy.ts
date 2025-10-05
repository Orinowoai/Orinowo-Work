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

    return res.status(200).json(typeof data === 'string' ? { result: data } : data)
  } catch (e: any) {
    const message = e?.message || 'Unknown error'
    console.error('musicgen-proxy error:', message)
    return res.status(500).json({ error: 'Proxy failed', message })
  }
}
