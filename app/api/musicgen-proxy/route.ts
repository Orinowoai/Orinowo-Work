import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type Body = { prompt?: string; duration?: number }

const HF_ENDPOINTS = [
  'https://api-inference.huggingface.co/models/facebook/musicgen-small',
  'https://api-inference.huggingface.co/pipeline/text-to-audio/facebook/musicgen-small'
]

function normalizeBaseUrl(u: string | undefined | null) {
  if (!u) return null
  try {
    const raw = u.trim()
    const parsed = new URL(raw)
    if (!/^https?:$/i.test(parsed.protocol)) return null
    // Strip accidental trailing /generate from env values
    if (/\/generate\/?$/.test(parsed.pathname)) {
      parsed.pathname = parsed.pathname.replace(/\/generate\/?$/, '')
    }
    // Ensure no trailing slash on remaining path
    parsed.pathname = parsed.pathname.replace(/\/$/, '')
    return parsed.origin + parsed.pathname
  } catch {
    return null
  }
}

async function callBackend(prompt: string, duration: number) {
  const base = normalizeBaseUrl(process.env.MUSICGEN_URL || process.env.NEXT_PUBLIC_MUSICGEN_URL)
  if (!base) return null
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 150000)
  try {
    const url = `${base}/generate`
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, duration }),
      signal: ctrl.signal
    })
    clearTimeout(timer)
    if (!r.ok) {
      // Try to decode any upstream text/binary to readable message
      let body = ''
      try { body = await r.text() } catch {}
      const snippet = body ? body.slice(0, 500) : `<${r.headers.get('content-type') || 'unknown'}>`
      throw new Error(`Upstream backend error ${r.status} at ${url}: ${snippet}`)
    }
    // Prefer JSON; if somehow not JSON, try parse
    const text = await r.text()
    try { return JSON.parse(text) } catch { return { raw: text } }
  } catch (e) {
    clearTimeout(timer)
    // Surface a normalized error for caller to include in final response if needed
    const msg = (e as any)?.message || 'Unknown backend error'
    return { _backendError: msg }
  }
}

async function callHF(prompt: string, duration: number) {
  const key = (process.env.HF_API_KEY || '').trim()
  if (!key) throw new Error('HF_API_KEY not configured on server')

  const seconds = Number.isFinite(Number(duration)) ? Math.max(1, Math.min(60, Math.floor(Number(duration)))) : 15
  const maxNewTokens = Math.max(128, Math.min(1024, seconds * 64))

  const body = {
    inputs: prompt,
    parameters: { max_new_tokens: maxNewTokens },
    options: { wait_for_model: true, use_cache: true }
  }

  const started = Date.now()
  const capMs = 150000
  let attempt = 0
  let epIndex = 0
  while (Date.now() - started < capMs) {
    attempt++
    const ctrl = new AbortController()
    const rem = Math.max(10000, capMs - (Date.now() - started))
    const timer = setTimeout(() => ctrl.abort(), rem)
    try {
      const base = HF_ENDPOINTS[Math.min(epIndex, HF_ENDPOINTS.length - 1)]
      const url = base.includes('?') ? `${base}&wait_for_model=true` : `${base}?wait_for_model=true`
      const r = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg, audio/wav;q=0.9, application/json;q=0.8, */*;q=0.1'
        },
        body: JSON.stringify(body),
        signal: ctrl.signal
      })
      clearTimeout(timer)

      const ct = r.headers.get('content-type') || ''
      if (r.ok && /audio\//i.test(ct)) {
        const buf = Buffer.from(await r.arrayBuffer())
        const b64 = buf.toString('base64')
        const mime = ct || 'audio/mp3'
        return { status: 'succeeded', audio_url: `data:${mime};base64,${b64}` }
      }

      // If JSON response (warming, errors, or base64 payloads)
      const text = await r.text()
      let json: any = null
      try { json = JSON.parse(text) } catch {}

      if (r.status === 401) {
        throw new Error(`Unauthorized (401): ${text}`)
      }
      if (r.status === 404) {
        // Try alternate endpoint once
        if (epIndex < HF_ENDPOINTS.length - 1) {
          epIndex++
          continue
        }
        throw new Error(`Not Found (404) from HF endpoint: ${text || 'Not Found'}`)
      }

      // Model loading or rate limit
      if (r.status === 503 || r.status === 429 || json?.estimated_time) {
        const waitMs = Math.min(15000, Math.ceil((json?.estimated_time || 5) * 1000))
        await new Promise(res => setTimeout(res, waitMs))
        continue
      }

      // Try base64 shapes if provided
      const b64 = json?.audio || json?.binary || json?.data
      if (b64 && typeof b64 === 'string') {
        return { status: 'succeeded', audio_url: `data:audio/mp3;base64,${b64}` }
      }

      throw new Error(`Unexpected HF response (${r.status}): ${(text || '').slice(0, 500)}`)
    } catch (e: any) {
      clearTimeout(timer)
      // Retry on transient network or continue loop
      if (attempt < 6) {
        await new Promise(res => setTimeout(res, Math.min(15000, 2000 * attempt)))
        continue
      }
      throw e
    }
  }
  throw new Error('Timed out waiting for Hugging Face response')
}

export async function POST(req: Request) {
  try {
    const { prompt, duration }: Body = await req.json()
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Missing required field: prompt' }, { status: 400 })
    }
    const dur = Number.isFinite(Number(duration)) ? Number(duration) : 15

    // Try backend first if configured
    const proxied = await callBackend(prompt, dur)
    let backendErr: string | null = null
    if (proxied && (proxied as any)._backendError) {
      backendErr = (proxied as any)._backendError
    } else if (proxied && (proxied as any).audio_url) {
      return NextResponse.json(proxied)
    } else if (proxied && (proxied as any).status) {
      return NextResponse.json(proxied)
    }

    // Fallback to direct HF call
    const result = await callHF(prompt, dur)
    return NextResponse.json(result)
  } catch (e: any) {
    const message = e?.message || 'Generation failed'
    // Return a clear, actionable error
    const payload: any = {
      status: 'error',
      error: 'Music generation failed',
      details: message,
      hints: [
        'Verify NEXT_PUBLIC_MUSICGEN_URL points to your Render backend (https, no trailing slash).',
        'If using fallback, ensure HF_API_KEY is set in your server environment.',
        'First generation may take up to ~120s while the model warms.'
      ]
    }
    return NextResponse.json(payload, { status: 500 })
  }
}
