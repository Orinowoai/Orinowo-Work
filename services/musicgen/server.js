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

    return res.json({ audio_url: publicUrl });
  } catch (err) {
    const message = err?.message || 'Unknown error';
    console.error('Music generation error:', message);
    return res.status(500).json({ error: 'Failed to generate music', details: message });
  }
});

app.listen(port, () => {
  console.log(` Music generation service listening on port ${port}`);
});
