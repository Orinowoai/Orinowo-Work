const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
let translate;
try {
  translate = require('@vitalets/google-translate-api');
} catch (e) {
  console.warn('Translation module not available:', e?.message || e);
}

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 8080;

// Supabase client (requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY)
console.log("Supabase URL:", process.env.SUPABASE_URL ? "Loaded " : "Missing ");
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Start daily reporting scheduler (non-blocking)
try { require('../reporting/scheduler.js'); } catch (e) { console.warn('Reporting scheduler not started:', e?.message || e); }

// In-memory cooldowns and background jobs (ephemeral)
const cooldowns = new Map(); // key: user_ip, value: timestamp (ms)
const jobs = new Map(); // key: request_id, value: { status, audio_url?, track_id?, error?, model_used?, model_label? }

// Semaphore queue to limit concurrent provider calls
const MAX_CONCURRENT = 2;
let activeProviderCalls = 0;
const waitQueue = [];
async function enqueue(task) {
  return new Promise((resolve, reject) => {
    const run = async () => {
      activeProviderCalls++;
      try {
        const result = await task();
        resolve(result);
      } catch (e) {
        reject(e);
      } finally {
        activeProviderCalls = Math.max(0, activeProviderCalls - 1);
        const next = waitQueue.shift();
        if (next) next();
      }
    };
    if (activeProviderCalls < MAX_CONCURRENT) {
      run();
    } else {
      console.log('Queued');
      waitQueue.push(run);
    }
  });
}

// Metrics aggregates
let totalRequests = 0;
let totalCompletions = 0;
let totalLatencyMs = 0;
let cacheHitCount = 0;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function getClientIp(req) {
  const xf = req.headers['x-forwarded-for'];
  if (typeof xf === 'string' && xf.length > 0) {
    return xf.split(',')[0].trim();
  }
  return req.headers['x-real-ip'] || req.ip || 'unknown';
}

function getModels() {
  return {
    primary: process.env.REPLICATE_MODEL_PRIMARY || 'primary-default',
    fast: process.env.REPLICATE_MODEL_FAST || 'fast-default',
    fallback: process.env.REPLICATE_MODEL_FALLBACK || 'fallback-default',
  };
}

async function callProvider(prompt, duration, modelVersion, { endpoint, key }, timeoutMs) {
  console.log(`Model chosen: ${modelVersion}`);
  const response = await axios.post(
    endpoint,
    { prompt, duration, model: modelVersion },
    {
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      timeout: timeoutMs,
    }
  );
  const data = response?.data || {};
  const audioUrl = Array.isArray(data.output) ? data.output[0] : null;
  if (!audioUrl) throw new Error('No audio URL from provider');
  return audioUrl;
}

async function callProviderWithModel(prompt, duration, { endpoint, key, estimatedCost }) {
  const { primary, fast, fallback } = getModels();
  const MAX_COST = parseFloat(process.env.MAX_COST_PER_GEN || '0') || Number.POSITIVE_INFINITY;
  let selected = estimatedCost > MAX_COST ? fast : primary;
  try {
    const audioUrl = await enqueue(() => callProvider(prompt, duration, selected, { endpoint, key }, selected === primary ? 45_000 : 60_000));
    return { audioUrl, modelUsed: selected };
  } catch (e) {
    const isTimeout = (e?.code === 'ECONNABORTED') || /timeout/i.test(String(e?.message || ''));
    if (selected === primary && isTimeout) {
      try {
        const audioUrl = await enqueue(() => callProvider(prompt, duration, fast, { endpoint, key }, 60_000));
        return { audioUrl, modelUsed: fast };
      } catch (e2) {
        console.warn('Fallback used');
        const audioUrl = await enqueue(() => callProvider(prompt, duration, fallback, { endpoint, key }, 60_000));
        return { audioUrl, modelUsed: fallback };
      }
    } else {
      console.warn('Fallback used');
      const audioUrl = await enqueue(() => callProvider(prompt, duration, fallback, { endpoint, key }, 60_000));
      return { audioUrl, modelUsed: fallback };
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

    // Detect and translate prompt if needed
    const originalPrompt = String(prompt);
    let englishPrompt = originalPrompt;
    let detectedLang = 'en';
    if (translate) {
      try {
        const det = await translate(originalPrompt, { to: 'en' });
        // library auto-detects the source language and returns translated text
        detectedLang = (det?.from?.language?.iso) || 'auto';
        englishPrompt = det?.text || originalPrompt;
        console.log('Detected language:', detectedLang);
      } catch (e) {
        console.warn('Translation failed, using original prompt:', e?.message || e);
        englishPrompt = originalPrompt;
        detectedLang = 'unknown';
      }
    }

    // Log start (pending)
    totalRequests++;
    const startedAt = Date.now();
    let logId = null;
    try {
      const { data: logRow, error: logErr } = await supabase
        .from('generation_logs')
        .insert({
          user_id: req.headers['x-user-id'] || null,
          prompt: originalPrompt,
          english_prompt: englishPrompt,
          language_detected: detectedLang,
          duration: Number(duration) || null,
          country: req.headers['x-country'] || null,
          status: 'pending',
          is_cache_hit: false
        })
        .select('id')
        .single();
      if (!logErr) logId = logRow?.id || null;
    } catch {}

    // Check cache (7-day TTL)
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data: cached, error: cacheError } = await supabase
        .from('generation_cache')
        .select('audio_url, created_at')
        .eq('prompt', originalPrompt)
        .eq('duration', Number(duration) || 0)
        .gte('created_at', sevenDaysAgo)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (cacheError) {
        console.warn('Cache lookup error:', cacheError.message || cacheError);
      } else if (cached && cached.audio_url) {
        console.log('Cache hit');
        cacheHitCount++;
        // log success with cache hit
        const latency = Date.now() - startedAt;
        if (logId) {
          await supabase
            .from('generation_logs')
            .update({ status: 'success', latency, is_cache_hit: true, model_used: 'cache', cost_est: 0 })
            .eq('id', logId);
        }
        totalCompletions++;
        totalLatencyMs += latency;
        return res.json({ success: true, audio_url: cached.audio_url, cached: true, model_label: 'Cache', original_prompt: originalPrompt, translated_prompt: englishPrompt, language_detected: detectedLang });
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
        // 1) Select model based on cost and fallbacks; use queue to limit concurrency
        const BASE_RATE = 0.002; // £ per second
        const estCost = (Number(duration) || 0) * BASE_RATE;
  const { audioUrl, modelUsed } = await callProviderWithModel(englishPrompt, duration, { endpoint: AI_MUSIC_ENDPOINT, key: AI_MUSIC_KEY, estimatedCost: estCost });

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
          prompt: originalPrompt,
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
          await supabase.from('generation_cache').insert({ prompt: originalPrompt, duration: Number(duration) || 0, audio_url: publicUrl });
        } catch (e) {
          console.warn('Cache insert failed:', e?.message || e);
        }

        const modelLabel = (modelUsed && modelUsed.includes('fast')) ? 'Fast Mode' : (modelUsed && modelUsed.includes('fallback')) ? 'Fallback' : 'High Quality';
        jobs.set(requestId, { status: 'done', audio_url: publicUrl, track_id: inserted.id, model_used: modelUsed, model_label: modelLabel, original_prompt: originalPrompt, translated_prompt: englishPrompt, language_detected: detectedLang });
        // update log success
        try {
          if (logId) {
            const latency = Date.now() - startedAt;
            await supabase
              .from('generation_logs')
              .update({ status: 'success', latency, is_cache_hit: false, model_used: modelUsed, cost_est: estCost, english_prompt: englishPrompt, language_detected: detectedLang })
              .eq('id', logId);
            totalCompletions++;
            totalLatencyMs += latency;
          }
        } catch {}
        console.log('Success');
        // cleanup job after 10 minutes
        setTimeout(() => jobs.delete(requestId), 10 * 60_000).unref?.();
      } catch (e) {
        const message = e?.message || 'Background generation failed';
        jobs.set(requestId, { status: 'error', error: message });
        console.error('Music generation error:', message);
        try {
          if (logId) {
            const latency = Date.now() - startedAt;
            await supabase
              .from('generation_logs')
              .update({ status: 'failed', latency })
              .eq('id', logId);
          }
        } catch {}
        setTimeout(() => jobs.delete(requestId), 10 * 60_000).unref?.();
      }
    })();

    return res.json({ status: 'processing', request_id: requestId, original_prompt: originalPrompt, translated_prompt: englishPrompt, language_detected: detectedLang });
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

// Metrics endpoint for autoscaling
app.get('/metrics', (req, res) => {
  const avgLatency = totalCompletions > 0 ? totalLatencyMs / totalCompletions : 0;
  const cacheHitRate = totalRequests > 0 ? cacheHitCount / totalRequests : 0;
  res.json({ activeRequests: activeProviderCalls, avgLatency, cacheHitRate });
});

app.listen(port, () => {
  console.log(` Music generation service listening on port ${port}`);
});
