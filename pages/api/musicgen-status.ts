import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const id = (req.query.id as string) || ''
    const baseUrl = process.env.NEXT_PUBLIC_AI_SERVICE_URL
    if (!baseUrl) {
      return res.status(500).json({ error: 'Service URL not configured' })
    }
    if (!id) return res.status(400).json({ error: 'Missing id' })

    const upstreamUrl = `${baseUrl.replace(/\/$/, '')}/status/${encodeURIComponent(id)}`
    const upstream = await fetch(upstreamUrl, { method: 'GET' })
    const contentType = upstream.headers.get('content-type') || ''
    const data = contentType.includes('application/json') ? await upstream.json() : await upstream.text()

    return res.status(upstream.status).json(typeof data === 'string' ? { status: 'unknown', details: data } : data)
  } catch (e: any) {
    const message = e?.message || 'Unknown error'
    return res.status(500).json({ error: 'Proxy failed', message })
  }
}
