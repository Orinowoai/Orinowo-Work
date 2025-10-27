const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Serve static web UI from service-local public first, then fallback to repo public
try {
  const localStatic = path.join(__dirname, 'public');
  app.use(express.static(localStatic));
  console.log('Static UI served from', localStatic);
} catch {}
try {
  const fallbackStatic = path.join(__dirname, '../../public');
  app.use(express.static(fallbackStatic));
  console.log('Static UI fallback served from', fallbackStatic);
} catch {}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'musicgen', time: new Date().toISOString() });
});

// Simple root banner
app.get('/', (req, res) => {
  res.send('Orinowo MusicGen (HF) is live');
});

// Hugging Face MusicGen: return audio data (raw binary)
app.post('/generate', async (req, res) => {
  const { prompt, duration } = req.body || {};
  if (!prompt) return res.status(400).json({ error: 'Missing required field: prompt' });
  try {
    const apiKey = (process.env.HF_API_KEY || '').trim();
    if (!apiKey) {
      return res.status(500).json({ error: 'HF_API_KEY not configured on server' });
    }

    // Single, explicit router endpoint for MusicGen
    const url = 'https://router.huggingface.co/hf-inference/models/facebook/musicgen-small';
    const body = { inputs: prompt || 'uplifting cinematic music' };

    try {
      const response = await axios.post(url, body, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer',
        timeout: 150000,
      });

      // Attempt to detect whether HF returned raw audio or a JSON wrapper
      let audioData = response.data;
      try {
        const text = Buffer.from(audioData).toString('utf8');
        if (text && (text.trim().startsWith('{') || text.trim().startsWith('['))) {
          const parsed = JSON.parse(text);
          // Newer HF router responses sometimes wrap blobs in parsed.data[0].blob
          if (parsed?.data?.[0]?.blob) {
            audioData = Buffer.from(parsed.data[0].blob, 'base64');
          } else if (parsed?.audio || parsed?.binary || parsed?.data) {
            // Fallback shapes
            const b64 = parsed.audio || parsed.binary || parsed.data;
            if (typeof b64 === 'string') {
              audioData = Buffer.from(b64, 'base64');
            } else {
              throw new Error('Unexpected JSON structure for audio payload');
            }
          } else if (parsed?.error || parsed?.estimated_time) {
            // Model warming or error
            const msg = parsed?.error || `Model warming; estimated_time=${parsed?.estimated_time}`;
            return res.status(502).json({ status: 'error', message: msg, provider: parsed });
          } else {
            throw new Error('Unexpected JSON response from Hugging Face');
          }
        }
      } catch (e) {
        console.error('Error parsing audio response:', e?.message || e);
        return res.status(500).json({ error: 'Invalid audio response' });
      }

      // Return raw audio with appropriate content-type
      res.setHeader('Content-Type', 'audio/mpeg');
      return res.send(audioData);
    } catch (e) {
      const status = e?.response?.status;
      if (status === 401) {
        return res.status(401).json({ status: 'error', error: 'Unauthorized: check HF_API_KEY' });
      }
      if (status === 403) {
        return res.status(403).json({ status: 'error', error: 'Forbidden: check model access/quota' });
      }
      if (status === 404) {
        return res.status(404).json({ status: 'error', error: 'Model not found at HF router endpoint' });
      }
      console.error('HF request failed:', e?.message || e);
      return res.status(500).json({ status: 'error', error: 'Music generation request failed', details: e?.message || String(e) });
    }
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
