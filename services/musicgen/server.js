const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();
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

const PORT = process.env.PORT || 8080;

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

function extractFirstUrl(value) {
  const isUrl = (s) => typeof s === 'string' && /^https?:\/\//i.test(s);
  if (!value) return null;
  if (isUrl(value)) return value;
  if (Array.isArray(value)) {
    for (const v of value) {
      const u = extractFirstUrl(v);
      if (u) return u;
    }
  } else if (typeof value === 'object') {
    for (const k of Object.keys(value)) {
      const u = extractFirstUrl(value[k]);
      if (u) return u;
    }
  }
  return null;
}

function extractAudioUrl(data) {
  if (!data) return null;
  // Direct common fields
  const direct = data.audio_url || data.audio;
  if (direct) {
    if (typeof direct === 'string') return direct;
    if (Array.isArray(direct) && typeof direct[0] === 'string') return direct[0];
    const url = extractFirstUrl(direct);
    if (url) return url;
  }
  // Output array or object
  if (data.output !== undefined) {
    if (Array.isArray(data.output)) {
      const first = data.output[0];
      if (typeof first === 'string') return first;
      if (first && typeof first === 'object') {
        return (
          first.audio_url ||
          (typeof first.audio === 'string' ? first.audio : Array.isArray(first.audio) ? first.audio[0] : null) ||
          first.url ||
          extractFirstUrl(first)
        );
      }
    } else if (typeof data.output === 'object') {
      const out = data.output;
      const url = out.url || out.audio_url || (typeof out.audio === 'string' ? out.audio : Array.isArray(out.audio) ? out.audio[0] : null) || extractFirstUrl(out);
      if (url) return url;
    } else if (typeof data.output === 'string') {
      if (/^https?:\/\//i.test(data.output)) return data.output;
    }
  }
  // Fallback: search whole object
  return extractFirstUrl(data);
}

async function pollReplicatePrediction(getUrl, headers, deadlineMs) {
  // Wait up to 150 seconds for Replicate to finish
  let maxWait = 150; // seconds
  let waited = 0;
  let status = null;
  let response = null;

  while (waited < maxWait) {
    await new Promise(resolve => setTimeout(resolve, 5000)); // check every 5 seconds
    waited += 5;

    const check = await axios.get(getUrl, {
      headers: { Authorization: `Token ${process.env.AI_MUSIC_KEY}` }
    });
    status = check?.data?.status;

    if (status === 'succeeded' || status === 'failed') {
      response = check.data;
      break;
    }
  }

  if (status !== 'succeeded') {
    throw new Error(`Timed out after ${maxWait}s waiting for Replicate prediction.`);
  }

  console.log("DEBUG full Replicate final response:", JSON.stringify(response, null, 2));
  const url = extractAudioUrl(response);
  if (!url) throw new Error('Replicate prediction succeeded but no audio URL in output');
  return url;
}

async function callProvider(prompt, duration, modelVersion, { endpoint, key, requestId }, timeoutMs) {
  console.log(`Model chosen: ${modelVersion}`);
  const isReplicateStyle = !!process.env.AI_MUSIC_VERSION || /replicate/i.test(String(endpoint || ''));

  const headers = {
    'Content-Type': 'application/json',
    Authorization: isReplicateStyle ? `Token ${key}` : `Bearer ${key}`,
  };

  // Build payload based on provider style
  const version = process.env.AI_MUSIC_VERSION;
  if (isReplicateStyle && !version) {
    throw new Error('AI_MUSIC_VERSION is not set for Replicate-style endpoint');
  }
  const payload = isReplicateStyle
    ? {
        version,
        input: {
          // include common variants to maximize compatibility across models
          prompt: prompt,
          prompt_a: prompt,
          duration: Number(duration) || 30,
          duration_seconds: Number(duration) || 30,
        },
      }
    : {
        prompt,
        duration,
        model: modelVersion,
      };

  // For Replicate-style endpoints, a POST usually returns a prediction object to poll.
  let response;
  try {
    response = await axios.post(endpoint, payload, { headers, timeout: timeoutMs });
  } catch (err) {
    const errBody = err?.response?.data || err?.message || String(err);
    try {
      console.error('Replicate API error:', typeof errBody === 'string' ? errBody : JSON.stringify(errBody));
    } catch {}
    // Save job error if we have a requestId context
    if (requestId) {
      jobs.set(requestId, { status: 'error', error: err?.response?.data || err.message });
    }
    throw err;
  }
  console.log("DEBUG full Replicate response:", JSON.stringify(response.data, null, 2));
  const data = response?.data || {};

  // Immediate audio URL check (common variants): output[0] or urls.audio
  try {
    let immediateAudio = null;
    if (Array.isArray(data?.output) && data.output[0]) {
      immediateAudio = data.output[0];
    } else if (data?.urls?.audio) {
      immediateAudio = data.urls.audio;
    }
    if (immediateAudio && requestId) {
      jobs.set(requestId, { status: 'done', audio_url: immediateAudio });
    }
  } catch {}

  if (isReplicateStyle) {
    // First, try direct output (some hosted gateways may return output immediately).
    const directUrl = extractAudioUrl(data);
    if (directUrl) return directUrl;
    const getUrl = (data.urls && data.urls.get) || null;
    const id = data.id || null;
    if (getUrl) {
      // Respect the original timeout budget for polling
      const deadline = Date.now() + (timeoutMs || 150_000);
      return await pollReplicatePrediction(getUrl, headers, deadline);
    }
    // If no get URL but an id exists and the endpoint is the predictions root, construct a GET URL.
    if (id && /\/v1\/predictions/i.test(String(endpoint))) {
      const base = endpoint.replace(/\/v1\/predictions.*/, '/v1/predictions');
      const constructedGet = `${base}/${id}`;
      const deadline = Date.now() + (timeoutMs || 150_000);
      return await pollReplicatePrediction(constructedGet, headers, deadline);
    }
    const debugInfo = {
      keys: Object.keys(data || {}),
      id: data?.id || null,
      status: data?.status || data?.state || null,
      hasUrls: !!data?.urls,
      outputType: Array.isArray(data?.output) ? 'array' : typeof data?.output,
    };
    throw new Error('No audio URL from provider: ' + JSON.stringify(debugInfo));
  }

  // Generic style: expect immediate audio URL in response
  const genericUrl = extractAudioUrl(data);
  if (!genericUrl) {
    const debugInfo = {
      keys: Object.keys(data || {}),
      outputType: Array.isArray(data?.output) ? 'array' : typeof data?.output,
    };
    throw new Error('No audio URL from provider: ' + JSON.stringify(debugInfo));
  }
  return genericUrl;
}

async function callProviderWithModel(prompt, duration, { endpoint, key, estimatedCost, requestId }) {
  const { primary, fast, fallback } = getModels();
  const MAX_COST = parseFloat(process.env.MAX_COST_PER_GEN || '0') || Number.POSITIVE_INFINITY;
  let selected = estimatedCost > MAX_COST ? fast : primary;
  try {
  const audioUrl = await enqueue(() => callProvider(prompt, duration, selected, { endpoint, key, requestId }, selected === primary ? 120_000 : 150_000));
    return { audioUrl, modelUsed: selected };
  } catch (e) {
    const isTimeout = (e?.code === 'ECONNABORTED') || /timeout/i.test(String(e?.message || ''));
    if (selected === primary && isTimeout) {
      try {
  const audioUrl = await enqueue(() => callProvider(prompt, duration, fast, { endpoint, key, requestId }, 150_000));
        return { audioUrl, modelUsed: fast };
      } catch (e2) {
        console.warn('Fallback used');
  const audioUrl = await enqueue(() => callProvider(prompt, duration, fallback, { endpoint, key, requestId }, 150_000));
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
  res.send(" Orinowo MusicGen service is live - v2025-10-06-1");
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'musicgen', time: new Date().toISOString() });
});

// Compatibility endpoint as requested: POST /api/musicgen
app.post('/api/musicgen', async (req, res) => {
  try {
    const { prompt, duration } = req.body || {};
    const endpoint = process.env.AI_MUSIC_ENDPOINT;
    const version = process.env.AI_MUSIC_VERSION;
    const key = process.env.AI_MUSIC_KEY;
    if (!endpoint || !key) {
      return res.status(500).json({ error: 'AI service not configured' });
    }
    const response = await axios.post(
      endpoint,
      {
        version: version,
        input: {
          prompt: prompt || 'afrobeat instrumental',
          prompt_a: prompt || 'afrobeat instrumental',
          duration: duration || 30,
          duration_seconds: duration || 30,
        },
      },
      {
        headers: {
          Authorization: `Token ${key}`,
          'Content-Type': 'application/json',
        },
        timeout: 120000,
      }
    );

    // Wait for completion if needed (Replicate-style)
    let prediction = response.data;
    if (prediction && prediction.urls && prediction.urls.get && prediction.status !== 'succeeded') {
      let maxWait = 150; // seconds
      let waited = 0;
      let status = prediction.status;
      while (waited < maxWait && status !== 'succeeded' && status !== 'failed') {
        await new Promise(r => setTimeout(r, 5000)); // 5s
        waited += 5;
        const check = await axios.get(prediction.urls.get, { headers: { Authorization: `Token ${key}` } });
        status = check?.data?.status;
        if (status === 'succeeded' || status === 'failed') {
          prediction = check.data;
          break;
        }
      }
      if (status !== 'succeeded') {
        return res.status(200).json({ status: status || 'unknown', message: `Timed out after ${maxWait}s waiting for Replicate prediction.`, replicate_output: prediction });
      }
    }

    // ✅ Handle final Replicate response
    console.log("DEBUG full Replicate final response:", JSON.stringify(prediction, null, 2));

    // Extract audio URL safely
    let audioUrl = null;
    if (prediction && prediction.output) {
      if (Array.isArray(prediction.output)) {
        audioUrl = prediction.output[0];
      } else if (typeof prediction.output === 'object' && prediction.output.audio) {
        audioUrl = prediction.output.audio;
      }
    }

    // Build final result
    if (!audioUrl) {
      console.warn("\u26A0\uFE0F No audio URL found in Replicate response. Check output structure.");
      return res.status(200).json({
        status: prediction?.status || 'unknown',
        message: 'Generation succeeded but no audio URL found',
        replicate_output: prediction,
      });
    }

    return res.status(200).json({
      status: 'succeeded',
      audio_url: audioUrl,
      duration,
      prompt,
    });
  } catch (err) {
    const details = err?.response?.data || err?.message || String(err);
    console.error('MusicGen error:', details);
    return res.status(500).json({ error: 'AI music generation failed.' });
  }
});

// Lightweight probe for the compatibility route
app.get('/api/musicgen', (req, res) => {
  res.json({ ok: true, endpoint: process.env.AI_MUSIC_ENDPOINT ? 'configured' : 'missing', version: process.env.AI_MUSIC_VERSION ? 'set' : 'unset' });
});

// Alternate compatibility path to avoid potential provider/proxy filters on /api/*
app.post('/compat/musicgen', async (req, res) => {
  try {
    const { prompt, duration } = req.body || {};
    const endpoint = process.env.AI_MUSIC_ENDPOINT;
    const version = process.env.AI_MUSIC_VERSION;
    const key = process.env.AI_MUSIC_KEY;
    if (!endpoint || !key) {
      return res.status(500).json({ error: 'AI service not configured' });
    }
    const response = await axios.post(
      endpoint,
      {
        version: version,
        input: {
          prompt: prompt || 'afrobeat instrumental',
          prompt_a: prompt || 'afrobeat instrumental',
          duration: duration || 30,
          duration_seconds: duration || 30,
        },
      },
      {
        headers: {
          Authorization: `Token ${key}`,
          'Content-Type': 'application/json',
        },
        timeout: 120000,
      }
    );

    // Wait for completion if needed (Replicate-style)
    let prediction = response.data;
    if (prediction && prediction.urls && prediction.urls.get && prediction.status !== 'succeeded') {
      let maxWait = 150; // seconds
      let waited = 0;
      let status = prediction.status;
      while (waited < maxWait && status !== 'succeeded' && status !== 'failed') {
        await new Promise(r => setTimeout(r, 5000)); // 5s
        waited += 5;
        const check = await axios.get(prediction.urls.get, { headers: { Authorization: `Token ${key}` } });
        status = check?.data?.status;
        if (status === 'succeeded' || status === 'failed') {
          prediction = check.data;
          break;
        }
      }
      if (status !== 'succeeded') {
        return res.status(200).json({ status: status || 'unknown', message: `Timed out after ${maxWait}s waiting for Replicate prediction.`, replicate_output: prediction });
      }
    }

    // ✅ Handle final Replicate response
    console.log("DEBUG full Replicate final response:", JSON.stringify(prediction, null, 2));

    // Extract audio URL safely
    let audioUrl = null;
    if (prediction && prediction.output) {
      if (Array.isArray(prediction.output)) {
        audioUrl = prediction.output[0];
      } else if (typeof prediction.output === 'object' && prediction.output.audio) {
        audioUrl = prediction.output.audio;
      }
    }

    // Build final result
    if (!audioUrl) {
      console.warn("\u26A0\uFE0F No audio URL found in Replicate response. Check output structure.");
      return res.status(200).json({
        status: prediction?.status || 'unknown',
        message: 'Generation succeeded but no audio URL found',
        replicate_output: prediction,
      });
    }

    return res.status(200).json({
      status: 'succeeded',
      audio_url: audioUrl,
      duration,
      prompt,
    });
  } catch (err) {
    const details = err?.response?.data || err?.message || String(err);
    console.error('MusicGen compat error:', details);
    return res.status(500).json({ error: 'AI music generation failed.' });
  }
});

app.get('/compat/musicgen', (req, res) => {
  res.json({ ok: true, endpoint: process.env.AI_MUSIC_ENDPOINT ? 'configured' : 'missing', version: process.env.AI_MUSIC_VERSION ? 'set' : 'unset' });
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
  const { audioUrl, modelUsed } = await callProviderWithModel(englishPrompt, duration, { endpoint: AI_MUSIC_ENDPOINT, key: AI_MUSIC_KEY, estimatedCost: estCost, requestId });

        // 2) Fetch generated audio bytes
        let audioResp;
        try {
          audioResp = await axios.get(audioUrl, { responseType: 'arraybuffer', timeout: 120000 });
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

// Debug: list all routes (enable via DEBUG_ROUTES=true)
app.get('/_routes', (req, res) => {
  if (String(process.env.DEBUG_ROUTES).toLowerCase() !== 'true') {
    return res.status(404).send('Not found');
  }
  const routes = [];
  app._router.stack.forEach((m) => {
    if (m.route && m.route.path) {
      const methods = Object.keys(m.route.methods || {}).filter(Boolean);
      routes.push({ path: m.route.path, methods });
    } else if (m.name === 'router' && m.handle && m.handle.stack) {
      m.handle.stack.forEach((h) => {
        if (h.route && h.route.path) {
          const methods = Object.keys(h.route.methods || {}).filter(Boolean);
          routes.push({ path: h.route.path, methods });
        }
      });
    }
  });
  res.json({ routes });
});

app.listen(PORT, () => {
  console.log(`Music generation service running on port ${PORT}`);
});
