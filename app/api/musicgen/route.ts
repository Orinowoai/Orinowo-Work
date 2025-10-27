import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: Request) {
  const HF_TOKEN = process.env.HF_TOKEN || process.env.HUGGING_FACE_TOKEN
  if (!HF_TOKEN) {
    return NextResponse.json({ error: 'Server not configured: set HF_TOKEN in environment variables' }, { status: 500 })
  }
  try {
    const { prompt, duration = 15 } = await req.json()
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Missing required field: prompt (string)' }, { status: 400 })
    }
    const seconds = Number.isFinite(Number(duration)) ? Math.max(1, Math.min(60, Math.floor(Number(duration)))) : 15
    const url = 'https://api-inference.huggingface.co/models/facebook/musicgen-large'
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        Accept: 'audio/mpeg, audio/wav;q=0.9, application/json;q=0.8, */*;q=0.1',
        'Content-Type': 'application/json',
        'X-Wait-For-Model': 'true'
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: { duration: seconds },
        options: { wait_for_model: true }
      })
    })
    const ct = resp.headers.get('content-type') || ''
    if (resp.ok && /^audio\//i.test(ct)) {
      const buf = Buffer.from(await resp.arrayBuffer())
      return new Response(buf, { status: 200, headers: { 'Content-Type': ct || 'audio/mpeg', 'Cache-Control': 'no-store' } })
    }
    const text = await resp.text().catch(() => '')
    return NextResponse.json({ error: 'Upstream error from Hugging Face', details: text.slice(0, 500) }, { status: 502 })
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ status: 'ok', endpoint: '/api/musicgen', method: 'POST' }, { status: 200, headers: { Allow: 'POST, GET, OPTIONS' } })
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: { 'Allow': 'POST, GET, OPTIONS' } })
}
