const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Serve static web UI from /public
try {
  const staticDir = path.join(__dirname, '../../public');
  app.use(express.static(staticDir));
  console.log('Static UI served from', staticDir);
} catch {}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'musicgen', time: new Date().toISOString() });
});

// Simple root banner
app.get('/', (req, res) => {
  res.send('Orinowo MusicGen (HF) is live');
});

// Hugging Face MusicGen: return audio data URL (mp3)
app.post('/generate', async (req, res) => {
  const { prompt, duration } = req.body || {};
  if (!prompt) return res.status(400).json({ error: 'Missing required field: prompt' });
  try {
    const apiKey = (process.env.HF_API_KEY || '').trim();
    if (!apiKey) {
      return res.status(500).json({ error: 'HF_API_KEY not configured on server' });
    }

    // Use explicit MusicGen model endpoint
    const endpoint = 'https://api-inference.huggingface.co/models/facebook/musicgen-small';

    // HF simple request body (minimal expected format)
    // We keep duration client-side only; HF will decide length/model-specific behavior
    const body = { inputs: prompt };

    const sleep = (ms) => new Promise(r => setTimeout(r, ms));
    const maxTimeMs = 150000; // 150s cap
    const start = Date.now();
    let attempt = 0;
    let lastErr = null;

    while (Date.now() - start < maxTimeMs) {
      attempt++;
      try {
        const remaining = Math.max(10_000, maxTimeMs - (Date.now() - start));
        console.log(`[HF] Attempt ${attempt}: POST ${endpoint} (timeout ${remaining}ms)`);
        const response = await axios.post(endpoint, body, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'audio/mpeg'
          },
          responseType: 'arraybuffer',
          timeout: remaining
        });

        const ct = (response.headers && response.headers['content-type']) || '';
        console.log(`[HF] Response attempt ${attempt}: status ${response.status}, content-type ${ct}`);
        // If audio is returned as binary
        if (/audio\//i.test(ct)) {
          const audioBase64 = Buffer.from(response.data).toString('base64');
          const mime = /audio\/(\w+)/i.test(ct) ? ct : 'audio/mp3';
          const audioUrl = `data:${mime};base64,${audioBase64}`;
          return res.json({ status: 'succeeded', audio_url: audioUrl });
        }

        // If HF returns JSON (e.g., model loading, or base64-encoded payload)
        try {
          const text = Buffer.from(response.data).toString('utf8');
          const data = JSON.parse(text);
          console.log('[HF] JSON body:', JSON.stringify(data).slice(0, 500));
          if (data.error || data.estimated_time) {
            const waitMs = Math.min(15_000, Math.ceil((data.estimated_time || 5) * 1000));
            console.log(`Model not ready (attempt ${attempt}). Waiting ${waitMs}ms...`);
            await sleep(waitMs);
            continue;
          }
          // Try known shapes for base64 audio
          const b64 = data.audio || data.binary || data.data || null;
          if (b64 && typeof b64 === 'string') {
            const audioUrl = `data:audio/mp3;base64,${b64}`;
            return res.json({ status: 'succeeded', audio_url: audioUrl });
          }
          return res.status(502).json({ status: 'error', message: data.error || 'Unexpected provider response', provider: data });
        } catch {}

        // Unknown non-audio response
        const sample = Buffer.from(response.data).toString('utf8').slice(0, 200);
        lastErr = new Error(`Unexpected non-audio response: ${sample}`);
      } catch (e) {
        lastErr = e;
        const status = e?.response?.status;
        if (status === 401) {
          const detail = (() => { try { return JSON.stringify(e?.response?.data); } catch { return 'Unauthorized'; } })();
          return res.status(401).json({ status: 'error', error: 'Unauthorized: check HF_API_KEY', details: detail });
        }
        if (status === 403) {
          const detail = (() => { try { return JSON.stringify(e?.response?.data); } catch { return 'Forbidden'; } })();
          return res.status(403).json({ status: 'error', error: 'Forbidden: check model access/quota', details: detail });
        }
        // Retry on model loading (503) or rate limiting (429)
        if (status === 503 || status === 429) {
          const details = (() => {
            try { return JSON.stringify(e?.response?.data); } catch { return String(e); }
          })();
          const backoff = Math.min(15_000, 2000 * attempt);
          console.log(`HF ${status} (attempt ${attempt}): ${details}. Retrying in ${backoff}ms...`);
          await sleep(backoff);
          continue;
        }
        // Network/timeout errors
        if (!status) {
          const code = e?.code || 'UNKNOWN';
          const msg = e?.message || String(e);
          console.warn(`[HF] Network error (attempt ${attempt}) code=${code} message=${msg}`);
          const backoff = Math.min(15_000, 2000 * attempt);
          await sleep(backoff);
          continue;
        }
        // For other errors, break
        break;
      }
    }

    const msg = lastErr?.response?.data || lastErr?.message || 'Unknown error from HF MusicGen';
    console.error('HF MusicGen error (final):', typeof msg === 'string' ? msg : JSON.stringify(msg));
    return res.status(500).json({ status: 'error', error: 'Music generation failed', details: (typeof msg === 'string' ? msg : JSON.stringify(msg)) });
  } catch (error) {
    const details = error?.response?.data || error?.message || String(error);
    console.error('HF MusicGen error (outer catch):', details);
    const info = (typeof details === 'string') ? details : (() => { try { return JSON.stringify(details); } catch { return String(details); } })();
    return res.status(500).json({ status: 'error', error: 'Music generation failed', details: info });
  }
});

// Simple environment check for Hugging Face API Key
app.get('/env-check', (req, res) => {
  const hfKey = process.env.HF_API_KEY ? ' Loaded' : ' Missing or undefined';
  res.json({
    HF_API_KEY: hfKey,
    Service: 'Orinowo MusicGen ready'
  });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(' Orinowo MusicGen running on port ' + PORT);
});
