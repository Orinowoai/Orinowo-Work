// scripts/full-healthcheck.js
// Automated end-to-end health check for Render backend and Vercel deployment
// Usage: node scripts/full-healthcheck.js <vercel_url> <render_url>

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const [,, vercel, render] = process.argv;
if (!vercel || !render) {
  console.error('Usage: node scripts/full-healthcheck.js <vercel_url> <render_url>');
  process.exit(1);
}

function logResult(name, ok, details = '') {
  if (ok) {
    console.log(`✅ ${name} OK`);
  } else {
    console.error(`❌ ${name} FAILED`);
    if (details) console.error(details);
  }
}

(async () => {
  // 1. Check Render backend
  try {
    const r = await fetch(`${render}/generate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: 'test', duration: 2 }) });
    if (r.ok && r.headers.get('content-type')?.includes('audio')) {
      logResult('Render backend', true);
    } else {
      const text = await r.text();
      logResult('Render backend', false, text);
    }
  } catch (e) {
    logResult('Render backend', false, e.message);
  }

  // 2. Check Vercel diagnostics
  try {
    const r = await fetch(`${vercel}/api/diagnostics`);
    const json = await r.json();
    if (json.status === 'ok') {
      logResult('Vercel diagnostics', true);
    } else {
      logResult('Vercel diagnostics', false, JSON.stringify(json, null, 2));
    }
  } catch (e) {
    logResult('Vercel diagnostics', false, e.message);
  }

  // 3. Check Vercel proxy GET
  try {
    const r = await fetch(`${vercel}/api/musicgen-proxy`);
    const json = await r.json();
    if (json.status === 'ok' || json.usage) {
      logResult('Vercel proxy GET', true);
    } else {
      logResult('Vercel proxy GET', false, JSON.stringify(json, null, 2));
    }
  } catch (e) {
    logResult('Vercel proxy GET', false, e.message);
  }

  // 4. Check Vercel proxy POST (musicgen)
  try {
    const r = await fetch(`${vercel}/api/musicgen-proxy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'upbeat lo-fi hip hop with vinyl crackle', duration: 5 })
    });
    const json = await r.json();
    if (json.status === 'succeeded' && json.audio_url) {
      logResult('Vercel proxy POST (musicgen)', true);
    } else {
      logResult('Vercel proxy POST (musicgen)', false, JSON.stringify(json, null, 2));
    }
  } catch (e) {
    logResult('Vercel proxy POST (musicgen)', false, e.message);
  }
})();
