#!/usr/bin/env node
// Posts to local Next.js API /api/musicgen and saves the audio to out.mp3
// Usage: node scripts/test-musicgen-local.js "your prompt" 10

const fs = require('fs')

async function main() {
  const prompt = process.argv[2] || 'ambient piano with soft pads'
  const duration = Number(process.argv[3] || 8)
  const tokenArg = process.argv[4] || ''

  const base = process.env.BASE_URL || 'http://localhost:3000'
  const url = `${base.replace(/\/$/, '')}/api/musicgen`
  console.log(`POST ${url} ...`)
  const replicateToken = tokenArg || process.env.REPLICATE_API_TOKEN || ''
  const payload = { prompt, duration }
  if (replicateToken) {
    payload.replicate_token = replicateToken
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  if (!res.ok) {
    let text = ''
    try { text = await res.text() } catch {}
    throw new Error(`Request failed ${res.status}: ${text.slice(0, 500)}`)
  }

  const arrayBuffer = await res.arrayBuffer()
  const buf = Buffer.from(arrayBuffer)
  fs.writeFileSync('out.mp3', buf)
  console.log(`Saved ${buf.length} bytes to out.mp3`)
}

main().catch((err) => {
  console.error(err.stack || err.message || String(err))
  process.exit(1)
})
