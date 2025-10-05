const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 8080;

// Supabase client (requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY)
console.log("Supabase URL:", process.env.SUPABASE_URL ? "Loaded " : "Missing ");
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// In-memory cooldowns and background jobs (ephemeral)
const cooldowns = new Map(); // key: user_ip, value: timestamp (ms)
const jobs = new Map(); // key: request_id, value: { status, audio_url?, track_id?, error? }

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function getClientIp(req) {
  const xf = req.headers['x-forwarded-for'];
  if (typeof xf === 'string' && xf.length > 0) {
    return xf.split(',')[0].trim();
  }
  return req.headers['x-real-ip'] || req.ip || 'unknown';
}

async function generateTrack(prompt, duration, { endpoint, key }) {
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`Retry ${attempt}/${maxAttempts} — calling AI provider`);
      const response = await axios.post(
        endpoint,
        { prompt, duration },
        {
          headers: {
            Authorization: `Bearer ${key}`,
            'Content-Type': 'application/json',
          },
          timeout: 60000,
        }
      );
      const replicateResponse = response?.data || {};
      const audioUrl = Array.isArray(replicateResponse.output)
        ? replicateResponse.output[0]
        : null;
      if (!audioUrl) throw new Error('No audio URL from provider');
      return audioUrl;
    } catch (e) {
      const msg = e?.message || String(e);
      console.warn(`Generation attempt ${attempt} failed:`, msg);
      if (attempt < maxAttempts) {
        await sleep(3000);
        continue;
      }
      throw e;
    }
  }
}

app.get("/", (req, res) => {
  res.send(" Orinowo MusicGen service is live");
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'musicgen', time: new Date().toISOString() });
});

app.post('/generate', async (req, res) => {
  try {
    console.log('Request started');
    const { prompt, duration } = req.body || {};
    const { AI_MUSIC_ENDPOINT, AI_MUSIC_KEY } = process.env;

    if (!AI_MUSIC_ENDPOINT || !AI_MUSIC_KEY) {
      return res.status(500).json({
        error: 'Service not configured: set AI_MUSIC_ENDPOINT and AI_MUSIC_KEY',
      });
    }
    if (!prompt) {
      return res.status(400).json({ error: 'Missing required field: prompt' });
    }

    // Cooldown control by client IP (60s)
    const userIp = getClientIp(req);
    const now = Date.now();
    const last = cooldowns.get(userIp) || 0;
    if (now - last < 60_000) {
      console.log('Cooldown blocked');
      return res.status(429).json({ error: 'Cooldown active, please wait a moment' });
    }
    // set cooldown and auto-clear after 60s
    cooldowns.set(userIp, now);
    setTimeout(() => {
      cooldowns.delete(userIp);
    }, 60_000).unref?.();

    // Check cache (7-day TTL)
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data: cached, error: cacheError } = await supabase
        .from('generation_cache')
        .select('audio_url, created_at')
        .eq('prompt', prompt)
        .eq('duration', Number(duration) || 0)
        .gte('created_at', sevenDaysAgo)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (cacheError) {
        console.warn('Cache lookup error:', cacheError.message || cacheError);
      } else if (cached && cached.audio_url) {
        console.log('Cache hit');
        return res.json({ success: true, audio_url: cached.audio_url, cached: true });
      }
    } catch (e) {
      console.warn('Cache check failed:', e?.message || e);
    }
    // Background processing flow
    console.log('New generation triggered');
    const requestId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    jobs.set(requestId, { status: 'processing' });
    console.log('Background started');

    (async () => {
      try {
        // 1) Call provider with retries
        const audioUrl = await generateTrack(prompt, duration, { endpoint: AI_MUSIC_ENDPOINT, key: AI_MUSIC_KEY });

        // 2) Fetch generated audio bytes
        let audioResp;
        try {
          audioResp = await axios.get(audioUrl, { responseType: 'arraybuffer', timeout: 60000 });
        } catch (e) {
          throw new Error(e?.message || 'Failed to download generated audio');
        }

        // 3) Determine content type and ext
        const contentType = (audioResp.headers && audioResp.headers['content-type']) || 'audio/mpeg';
        const ext = contentType.includes('wav') ? 'wav'
          : contentType.includes('ogg') ? 'ogg'
          : contentType.includes('aac') ? 'aac'
          : 'mp3';
        const rand = Math.random().toString(36).slice(2);
        const objectPath = `${Date.now()}-${rand}.${ext}`;

        // 4) Upload to Supabase
        const bucketName = process.env.SUPABASE_BUCKET || 'generated-tracks';
        if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
          throw new Error('Supabase not configured');
        }
        const { error: uploadError } = await supabase
          .storage
          .from(bucketName)
          .upload(objectPath, Buffer.from(audioResp.data), {
            contentType,
            upsert: false,
          });
        if (uploadError) {
          throw new Error(uploadError.message || String(uploadError));
        }

        // 5) Get public URL
        const { data: pub } = supabase.storage.from(bucketName).getPublicUrl(objectPath);
        const publicUrl = pub?.publicUrl;
        if (!publicUrl) throw new Error('Failed to obtain public URL for uploaded file');

        // 6) Insert track record
        const trackPayload = {
          user_id: req.headers['x-user-id'] || null,
          prompt,
          duration: Number(duration) || null,
          audio_url: publicUrl,
          category: 'personal',
        };
        const { data: inserted, error: insertError } = await supabase
          .from('tracks')
          .insert(trackPayload)
          .select('id')
          .single();
        if (insertError) throw new Error(insertError.message || String(insertError));

        // 7) Save to generation cache
        try {
          await supabase.from('generation_cache').insert({ prompt, duration: Number(duration) || 0, audio_url: publicUrl });
        } catch (e) {
          console.warn('Cache insert failed:', e?.message || e);
        }

        jobs.set(requestId, { status: 'done', audio_url: publicUrl, track_id: inserted.id });
        console.log('Success');
        // cleanup job after 10 minutes
        setTimeout(() => jobs.delete(requestId), 10 * 60_000).unref?.();
      } catch (e) {
        const message = e?.message || 'Background generation failed';
        jobs.set(requestId, { status: 'error', error: message });
        console.error('Music generation error:', message);
        setTimeout(() => jobs.delete(requestId), 10 * 60_000).unref?.();
      }
    })();

    return res.json({ status: 'processing', request_id: requestId });
  } catch (err) {
    const message = err?.message || 'Unknown error';
    console.error('Music generation error:', message);
    return res.status(500).json({ error: 'Failed to generate music', details: message });
  }
});

// Polling endpoint for background job status
app.get('/status/:id', (req, res) => {
  const { id } = req.params;
  const job = jobs.get(id);
  if (!job) return res.status(404).json({ status: 'not_found' });
  return res.json(job);
});

app.listen(port, () => {
  console.log(` Music generation service listening on port ${port}`);
});
