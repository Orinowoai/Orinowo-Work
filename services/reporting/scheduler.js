const cron = require('node-cron');
const nodemailer = require('nodemailer');
const { createClient } = require('@supabase/supabase-js');

// Guard: only enable if required envs exist
const {
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  ADMIN_EMAIL,
  EMAIL_FROM,
  EMAIL_SERVER_HOST,
  EMAIL_SERVER_PORT,
  EMAIL_SERVER_USER,
  EMAIL_SERVER_PASS,
} = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('[reporting] Supabase env not set — scheduler disabled');
} else if (!ADMIN_EMAIL || !EMAIL_FROM || !EMAIL_SERVER_HOST || !EMAIL_SERVER_PORT || !EMAIL_SERVER_USER || !EMAIL_SERVER_PASS) {
  console.warn('[reporting] SMTP env not set — scheduler disabled');
} else {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const transporter = nodemailer.createTransport({
    host: EMAIL_SERVER_HOST,
    port: Number(EMAIL_SERVER_PORT),
    secure: Number(EMAIL_SERVER_PORT) === 465, // true for 465, false for other ports
    auth: {
      user: EMAIL_SERVER_USER,
      pass: EMAIL_SERVER_PASS,
    },
  });

  function formatCurrencyGBP(n) {
    try { return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(n); } catch { return `£${(n || 0).toFixed(2)}` }
  }

  async function buildReport() {
    const end = new Date();
    const start = new Date(Date.now() - 24 * 60 * 60 * 1000); // last 24h
    const sinceISO = start.toISOString();

    // generation_logs aggregates
    const { data: logs, error: logsErr } = await supabase
      .from('generation_logs')
      .select('status, latency, is_cache_hit, model_used, prompt, created_at')
      .gte('created_at', sinceISO);
    if (logsErr) throw logsErr;

    const totalGenerations = logs?.length || 0;
    const latencies = (logs || []).map((l) => Number(l.latency || 0)).filter((n) => Number.isFinite(n) && n >= 0);
    const avgLatency = latencies.length ? (latencies.reduce((a, b) => a + b, 0) / latencies.length) : 0;
    const cacheHits = (logs || []).filter((l) => !!l.is_cache_hit).length;
    const cacheHitRate = totalGenerations ? cacheHits / totalGenerations : 0;

    const modelUsage = { primary: 0, fast: 0, fallback: 0, cache: 0 };
    for (const l of (logs || [])) {
      const m = (l.model_used || '').toLowerCase();
      if (m.includes('fast')) modelUsage.fast++;
      else if (m.includes('fallback')) modelUsage.fallback++;
      else if (m.includes('cache')) modelUsage.cache++;
      else if (m) modelUsage.primary++;
    }

    // naive top prompts (trim and group)
    const counts = new Map();
    for (const l of (logs || [])) {
      const p = (l.prompt || '').trim();
      if (!p) continue;
      counts.set(p, (counts.get(p) || 0) + 1);
    }
    const topPrompts = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([prompt, count]) => ({ prompt, count }));

    // track_stats delta
    const { data: stats, error: statsErr } = await supabase
      .from('track_stats')
      .select('plays, downloads, last_updated')
      .gte('last_updated', sinceISO);
    if (statsErr) throw statsErr;
    const totalPlays = (stats || []).reduce((sum, s) => sum + Number(s.plays || 0), 0);
    const totalDownloads = (stats || []).reduce((sum, s) => sum + Number(s.downloads || 0), 0);

    // Estimated cost using the same BASE_RATE (server uses £0.002/sec; approximate via logs if duration needed)
    // If duration not in logs, we estimate cost proportional to successful, non-cache generations
    const successful = (logs || []).filter((l) => l.status === 'success' && !l.is_cache_hit).length;
    const BASE_RATE = 0.002; // £/sec
    // Assume an average of 30s if duration is not tracked here
    const estCost = successful * 30 * BASE_RATE;

    const dateLabel = end.toISOString().slice(0, 10);
    return {
      date: dateLabel,
      totalGenerations,
      avgLatency,
      cacheHitRate,
      modelUsage,
      topPrompts,
      estCost,
      plays: totalPlays,
      downloads: totalDownloads,
    };
  }

  function renderEmailHTML(summary) {
    const rows = [
      ['Total Generations', String(summary.totalGenerations)],
      ['Average Latency', `${summary.avgLatency.toFixed(0)} ms`],
      ['Cache Hit Rate', `${(summary.cacheHitRate * 100).toFixed(1)}%`],
      ['Model Usage', `Primary: ${summary.modelUsage.primary} • Fast: ${summary.modelUsage.fast} • Fallback: ${summary.modelUsage.fallback} • Cache: ${summary.modelUsage.cache}`],
      ['Top Prompts', summary.topPrompts.map((t) => `${t.prompt.slice(0, 48)} (${t.count})`).join(' • ') || '—'],
      ['New Plays', String(summary.plays)],
      ['New Downloads', String(summary.downloads)],
      ['Estimated Cost', formatCurrencyGBP(summary.estCost)],
    ];

    return `
      <div style="font-family:Inter,system-ui,Segoe UI,Roboto,Arial,sans-serif;background:#0b0b0c;color:#fff;padding:24px;">
        <h1 style="margin:0 0 12px;color:#d4af37;">Orinowo Daily Report – ${summary.date}</h1>
        <p style="margin:0 0 16px;color:#b7b7b7;">Daily summary of AI generation activity and system metrics.</p>
        <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse:collapse;background:#111;border:1px solid #2a2a2a;border-radius:12px;overflow:hidden;">
          ${rows.map(([k,v]) => `
            <tr>
              <td style="border-bottom:1px solid #222;color:#b7b7b7;width:220px;">${k}</td>
              <td style="border-bottom:1px solid #222;color:#fff;">${v}</td>
            </tr>`).join('')}
        </table>
        <p style="margin:16px 0 0;color:#b7b7b7;">Keep creating the future of music. – Orinowo System</p>
      </div>
    `;
  }

  async function sendEmail(html, subject) {
    const mail = {
      from: EMAIL_FROM,
      to: ADMIN_EMAIL,
      subject,
      html,
    };
    try {
      const info = await transporter.sendMail(mail);
      console.log('[reporting] Email sent:', info?.messageId || 'ok');
      return true;
    } catch (e) {
      console.error('[reporting] Email send failed:', e?.message || e);
      return false;
    }
  }

  async function runOnce() {
    try {
      const summary = await buildReport();
      const html = renderEmailHTML(summary);
      const subject = `Orinowo Daily AI Summary – ${summary.date}`;
      let ok = await sendEmail(html, subject);
      if (!ok) {
        console.log('[reporting] Retrying once...');
        ok = await sendEmail(html, subject);
      }
      if (ok) console.log('[reporting] Delivery complete');
      else console.warn('[reporting] Delivery failed after retry');
    } catch (e) {
      console.error('[reporting] Scheduler error (non-fatal):', e?.message || e);
    }
  }

  // Schedule daily at 23:59 UTC
  cron.schedule('59 23 * * *', async () => {
    console.log('[reporting] Daily report job triggered');
    await runOnce();
  }, { timezone: 'UTC' });

  console.log('[reporting] Scheduler active: daily 23:59 UTC');
}
