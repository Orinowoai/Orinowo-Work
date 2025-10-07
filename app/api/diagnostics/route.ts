import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  const payload = {
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
    }
  }
  return NextResponse.json(payload, { headers: { 'Cache-Control': 'no-store' } })
}
