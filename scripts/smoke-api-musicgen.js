#!/usr/bin/env node
/* Cold test: POST to deployed /api/musicgen and save MP3 */
const fs = require('fs');
const path = require('path');

async function main() {
  const base = 'https://orinowo-next-2025.vercel.app';
  const url = base.replace(/\/$/, '') + '/api/musicgen';
  const payload = { prompt: 'upbeat lo-fi hip hop with vinyl crackle', duration: 8 };
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' },
    body: JSON.stringify(payload)
  });
  const ct = res.headers.get('content-type') || '';
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText}: ${text.slice(0,500)}`);
  }
  if (!/^audio\//i.test(ct)) {
    const text = await res.text().catch(() => '');
    throw new Error(`Non-audio response (${ct}): ${text.slice(0,500)}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  const out = path.join(require('os').tmpdir(), `musicgen_test_${Date.now()}.mp3`);
  fs.writeFileSync(out, buf);
  console.log('Saved audio to:', out);
  console.log('Bytes:', buf.length);
}

main().catch((err) => { console.error(err.stack || err.message || String(err)); process.exit(1); });
