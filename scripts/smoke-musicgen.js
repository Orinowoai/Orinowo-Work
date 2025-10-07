#!/usr/bin/env node
/*
 Simple smoke test for live deployment endpoints:
 - GET /api/diagnostics
 - GET /api/musicgen-proxy
 - POST /api/musicgen-proxy

Usage:
  PUBLIC_SITE_URL=https://your-site.vercel.app node scripts/smoke-musicgen.js
or via npm script:
  npm run smoke --
Make sure PUBLIC_SITE_URL is set in env.
*/

const assert = (cond, msg) => { if (!cond) { throw new Error(msg) } }

async function main() {
  const base = (process.env.PUBLIC_SITE_URL || '').trim().replace(/\/$/, '')
  if (!base || !/^https?:\/\//i.test(base)) {
    throw new Error('PUBLIC_SITE_URL env var is required (e.g., https://orinowo-next-2025.vercel.app)')
  }
  const fetchImpl = globalThis.fetch || (await import('node-fetch')).default

  const get = async (path) => {
    const res = await fetchImpl(`${base}${path}`, { headers: { 'Accept': 'application/json' } })
    const text = await res.text()
    let json
    try { json = JSON.parse(text) } catch { json = { raw: text } }
    return { status: res.status, headers: Object.fromEntries(res.headers), body: json }
  }

  const postJSON = async (path, body) => {
    const res = await fetchImpl(`${base}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(body)
    })
    const text = await res.text()
    let json
    try { json = JSON.parse(text) } catch { json = { raw: text } }
    return { status: res.status, headers: Object.fromEntries(res.headers), body: json }
  }

  console.log(`Checking diagnostics at ${base}/api/diagnostics ...`)
  const diag = await get('/api/diagnostics')
  assert(diag.status >= 200 && diag.status < 300, `Diagnostics failed: ${diag.status} ${JSON.stringify(diag.body).slice(0,200)}`)
  console.log('Diagnostics OK:', JSON.stringify(diag.body).slice(0, 200))

  console.log(`Checking proxy info at ${base}/api/musicgen-proxy ...`)
  const info = await get('/api/musicgen-proxy')
  assert(info.status >= 200 && info.status < 300, `Proxy GET failed: ${info.status} ${JSON.stringify(info.body).slice(0,200)}`)
  console.log('Proxy GET OK:', JSON.stringify(info.body))

  console.log('Testing generation via POST /api/musicgen-proxy ...')
  const req = { prompt: 'upbeat lo-fi hip hop with vinyl crackle', duration: 5 }
  const gen = await postJSON('/api/musicgen-proxy', req)
  if (gen.status >= 200 && gen.status < 300) {
    assert(gen.body && (gen.body.audio_url || gen.body.status === 'succeeded'), `Unexpected success payload: ${JSON.stringify(gen.body).slice(0,200)}`)
    if (gen.body.audio_url) {
      assert(/^data:audio\//.test(gen.body.audio_url), 'audio_url must be a data:audio/* URL')
    }
    console.log('Generation OK:', gen.body.audio_url ? 'got audio_url' : gen.body.status)
  } else {
    console.warn(`Generation returned ${gen.status}. Details:`)
    console.warn(JSON.stringify(gen.body, null, 2))
    process.exitCode = 1
  }
}

main().catch((err) => {
  console.error(err.stack || err.message || String(err))
  process.exit(1)
})
