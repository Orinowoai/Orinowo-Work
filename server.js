// Minimal MusicGen backend for Render
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// MusicGen generate endpoint (mock for now)
app.post('/generate', async (req, res) => {
  const { prompt, duration } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Missing prompt' });
  // TODO: Integrate with actual MusicGen model or Hugging Face API
  // For now, return a dummy response
  res.json({ status: 'succeeded', audio_url: 'data:audio/mpeg;base64,SUQzAwAAAAAA...' });
});

app.listen(PORT, () => {
  console.log(`MusicGen backend listening on port ${PORT}`);
});
