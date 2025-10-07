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

// Hugging Face MusicGen: return audio data URL (wav)
app.post('/generate', async (req, res) => {
  const { prompt, duration } = req.body || {};
  if (!prompt) return res.status(400).json({ error: 'Missing required field: prompt' });
  try {
    const response = await axios.post(
      process.env.HF_MODEL_ENDPOINT || 'https://api-inference.huggingface.co/models/facebook/musicgen-small',
      {
        inputs: prompt,
        parameters: { max_new_tokens: 512 }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.HF_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'audio/wav'
        },
        responseType: 'arraybuffer',
        timeout: 150000
      }
    );

    const audioBase64 = Buffer.from(response.data).toString('base64');
    const audioUrl = `data:audio/wav;base64,${audioBase64}`;
    return res.json({ status: 'done', audio_url: audioUrl });
  } catch (error) {
    const details = error?.response?.data || error?.message || String(error);
    console.error('HF MusicGen error:', details);
    return res.status(500).json({ error: 'Music generation failed' });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(' Orinowo MusicGen running on port ' + PORT);
});
