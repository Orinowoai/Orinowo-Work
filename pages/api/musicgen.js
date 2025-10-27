// Next.js API route for MusicGen proxying Hugging Face Inference API
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const HF_TOKEN = process.env.HF_TOKEN || process.env.HUGGING_FACE_TOKEN;
  if (!HF_TOKEN) {
    return res.status(500).json({ error: 'Server not configured: set HF_TOKEN in environment variables' });
  }

  try {
    const { prompt, duration = 15 } = (req.body || {});
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Missing required field: prompt (string)' });
    }

    const seconds = Number.isFinite(Number(duration)) ? Math.max(1, Math.min(60, Math.floor(Number(duration)))) : 15;

    const url = 'https://api-inference.huggingface.co/models/facebook/musicgen-large';
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        Accept: 'audio/mpeg, audio/wav;q=0.9, application/json;q=0.8, */*;q=0.1',
        'Content-Type': 'application/json',
        'X-Wait-For-Model': 'true',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: { duration: seconds },
        options: { wait_for_model: true },
      }),
    });

    const ct = resp.headers.get('content-type') || '';
    if (resp.ok && /^audio\//i.test(ct)) {
      const arrayBuffer = await resp.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      res.setHeader('Content-Type', ct || 'audio/mpeg');
      res.setHeader('Content-Length', buffer.length);
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).send(buffer);
    }

    const text = await resp.text().catch(() => '');
    return res.status(502).json({ error: 'Upstream error from Hugging Face', details: text.slice(0, 500) });
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
