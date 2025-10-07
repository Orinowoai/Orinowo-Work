import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function normalizeBaseUrl(u?: string | null) {
  if (!u) return null
  try {
    const raw = u.trim()
    const parsed = new URL(raw)
    if (!/^https?:$/i.test(parsed.protocol)) return null
    if (/\/generate\/?$/.test(parsed.pathname)) {
      parsed.pathname = parsed.pathname.replace(/\/generate\/?$/, '')
    }
    parsed.pathname = parsed.pathname.replace(/\/$/, '')
    return parsed.origin + parsed.pathname
  } catch {
    return null
  }
}

export async function GET() {
  const backend = normalizeBaseUrl(process.env.MUSICGEN_URL || process.env.NEXT_PUBLIC_MUSICGEN_URL)
  const hfConfigured = !!(process.env.HF_API_KEY || '').trim()

  const diagnostics: any = {
    time: new Date().toISOString(),
    commit: {
      sha: process.env.VERCEL_GIT_COMMIT_SHA || null,
      message: process.env.VERCEL_GIT_COMMIT_MESSAGE || null,
      branch: process.env.VERCEL_GIT_COMMIT_REF || null,
    },
    env: {
      NEXT_PUBLIC_MUSICGEN_URL: process.env.NEXT_PUBLIC_MUSICGEN_URL || null,
      MUSICGEN_URL: process.env.MUSICGEN_URL || null,
      HF_API_KEY: process.env.HF_API_KEY ? 'Loaded' : 'Missing',
      NODE_ENV: process.env.NODE_ENV || null
    },
    backend,
    hfConfigured
  }

  if (backend) {
    try {
      const r = await fetch(`${backend}/health`, { cache: 'no-store' })
      const ct = r.headers.get('content-type') || ''
      const body = ct.includes('application/json') ? await r.json() : await r.text()
      diagnostics.health = { status: r.status, ok: r.ok, body }
    } catch (e: any) {
      diagnostics.health = { error: e?.message || String(e) }
    }
  } else {
    diagnostics.health = { error: 'No backend configured' }
  }

  return NextResponse.json(diagnostics, { headers: { 'Cache-Control': 'no-store' } })
}
