# Music Generation Service

Placeholder for AI music generation implementation.

## Status
In development - evaluating API providers and implementation approach.

## Quick start

1. Install dependencies
	- From project root:
	  - `cd services/musicgen`
	  - `npm install`
2. Configure environment
	- PowerShell (Windows):
	  - `$env:AI_MUSIC_ENDPOINT = "https://YOUR-API-ENDPOINT"`
	  - `$env:AI_MUSIC_KEY = "YOUR_API_KEY"`
3. Start service
	- `npm start`
4. Health check
	- `GET http://localhost:3001/health`
5. Generate (placeholder)
	- `POST http://localhost:3001/generate`
	- Body: `{ "prompt": "lofi beat", "duration": 30 }`
