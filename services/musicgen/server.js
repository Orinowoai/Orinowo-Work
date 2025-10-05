const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 8080;

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

    return res.json({ audio_url: audioUrl });
  } catch (err) {
    const message = err?.message || 'Unknown error';
    console.error('Music generation error:', message);
    return res.status(500).json({ error: 'Failed to generate music', details: message });
  }
});

app.listen(port, () => {
  console.log(` Music generation service listening on port ${port}`);
});
