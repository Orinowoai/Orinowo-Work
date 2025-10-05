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

app.get("/", (req, res) => {
  res.send(" Orinowo MusicGen service is live");
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'musicgen', time: new Date().toISOString() });
});

app.post('/generate', async (req, res) => {
  try {
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

    console.log('New generation triggered');
    // Placeholder external API call – replace with your provider
    const response = await axios.post(
      AI_MUSIC_ENDPOINT,
      { prompt, duration },
      {
        headers: {
          Authorization: `Bearer ${AI_MUSIC_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 60000,
      }
    );

    const replicateResponse = response?.data || {};
    const audioUrl = Array.isArray(replicateResponse.output)
      ? replicateResponse.output[0]
      : null;

    if (!audioUrl) {
      throw new Error('No audio URL found in response');
    }

    // Fetch generated audio bytes
    let audioResp;
    try {
      audioResp = await axios.get(audioUrl, { responseType: 'arraybuffer', timeout: 60000 });
    } catch (e) {
      const msg = e?.message || 'Failed to download generated audio';
      console.error('Download error:', msg);
      return res.status(502).json({ error: 'Failed to retrieve generated audio', details: msg });
    }

    // Determine content type and file extension
    const contentType = (audioResp.headers && audioResp.headers['content-type']) || 'audio/mpeg';
    const ext = contentType.includes('wav') ? 'wav'
      : contentType.includes('ogg') ? 'ogg'
      : contentType.includes('aac') ? 'aac'
      : 'mp3';

  // Create unique filename
  const rand = Math.random().toString(36).slice(2);
  const objectPath = `${Date.now()}-${rand}.${ext}`;

    // Upload to Supabase Storage
    const bucketName = process.env.SUPABASE_BUCKET || 'generated-tracks';
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({
        error: 'Supabase not configured: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY',
      });
    }

    const { error: uploadError } = await supabase
      .storage
      .from(bucketName)
      .upload(objectPath, Buffer.from(audioResp.data), {
        contentType,
        upsert: false,
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError.message || uploadError);
      return res.status(500).json({ error: 'Failed to upload to storage', details: uploadError.message || String(uploadError) });
    }

    // Get public URL
    const { data: pub } = supabase.storage.from(bucketName).getPublicUrl(objectPath);
    const publicUrl = pub?.publicUrl;
    if (!publicUrl) {
      return res.status(500).json({ error: 'Failed to obtain public URL for uploaded file' });
    }

    // Ensure the URL is a public path
    const base = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
    const expectedPrefix = `${base}/storage/v1/object/public/`;
    if (!publicUrl.startsWith(expectedPrefix)) {
      console.warn('Unexpected public URL format:', publicUrl);
      // Continue returning the URL, but surface a hint for configuration
    }

    // Insert track record into DB
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

    if (insertError) {
      console.error('Supabase insert error:', insertError.message || insertError);
      return res.status(500).json({ error: 'Failed to save track metadata', details: insertError.message || String(insertError) });
    }

    // Save to generation cache
    try {
      await supabase.from('generation_cache').insert({ prompt, duration: Number(duration) || 0, audio_url: publicUrl });
    } catch (e) {
      console.warn('Cache insert failed:', e?.message || e);
    }

    return res.json({ success: true, track_id: inserted.id, audio_url: publicUrl, cached: false });
  } catch (err) {
    const message = err?.message || 'Unknown error';
    console.error('Music generation error:', message);
    return res.status(500).json({ error: 'Failed to generate music', details: message });
  }
});

app.listen(port, () => {
  console.log(` Music generation service listening on port ${port}`);
});
