'use client'

import { useEffect, useState } from 'react'
import { convertPrice, getCurrencyName } from '@/lib/currency'
import CurrencyClient from '@/components/CurrencyClient'
import Link from 'next/link'
import { LoadingSpinner, ButtonLoading, PageTransition } from '@/components/ui/loading'
import { DistributionModal } from '@/components/DistributionModal'
import { useComingSoon } from '@/components/ui/ComingSoon'

export default function GeneratePage() {
  const [prompt, setPrompt] = useState('')
  const [duration, setDuration] = useState<number>(30)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedTrack, setGeneratedTrack] = useState<string | null>(null)
  const [trackId, setTrackId] = useState<string | null>(null)
  const [requestId, setRequestId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [distType, setDistType] = useState<null | 'spotify' | 'apple' | 'video'>(null)
  const { ComingSoonButton, ComingSoonModal } = useComingSoon()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt to generate music')
      return
    }

    setIsGenerating(true)
    setError(null)
    
    try {
      // Prefer calling external backend directly from client to avoid Vercel timeouts
      const base = process.env.NEXT_PUBLIC_MUSICGEN_URL?.replace(/\/$/, '')
      const reqUrl = base ? `${base}/generate` : '/api/musicgen-proxy'
      console.log('Request sent to', reqUrl)
      const resp = await fetch(reqUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, duration }),
      })
      if (!resp.ok) {
        const text = await resp.text().catch(() => '')
        let err: any = {}
        try { err = JSON.parse(text) } catch { err = { error: text } }
        if (err?.error?.includes('Cooldown active')) {
          setError('Please wait a moment before generating again.')
          console.warn('Cooldown active')
          return
        }
        throw new Error(err?.details || err?.error || `Generation failed (${resp.status})`)
      }
      const data = await resp.json()
      // Background path
      if (data?.status === 'processing' && data?.request_id) {
        setRequestId(data.request_id)
        console.log('Background started')
        // Poll every 3s
        const poll = async () => {
          if (!data.request_id) return
          try {
            const s = await fetch(`/api/musicgen-status?id=${encodeURIComponent(data.request_id)}`)
            const json = await s.json()
            if (json?.status === 'done' && json?.audio_url) {
              console.log('Response received', json.audio_url)
              await new Promise(r => setTimeout(r, 2000))
              console.log('Playback ready')
              try {
                const head = await fetch(json.audio_url, { method: 'HEAD' })
                if (!head.ok) throw new Error('Prefetch failed')
              } catch {
                await new Promise(r => setTimeout(r, 1000))
                await fetch(json.audio_url, { method: 'HEAD' })
              }
              setGeneratedTrack(json.audio_url)
              if (json.track_id) setTrackId(json.track_id)
              setRequestId(null)
              return
            } else if (json?.status === 'error') {
              setError('Generation failed. Please try again.')
              setRequestId(null)
              return
            }
          } catch (e) {
            // keep polling quietly
          }
          setTimeout(poll, 3000)
        }
        setTimeout(poll, 3000)
        return
      }
      // Immediate path (cache hit)
      const audioUrl = data.audio_url || data.result || null
      console.log('Response received', audioUrl)
      if (!audioUrl) throw new Error('No audio URL received')
      await new Promise(r => setTimeout(r, 2000))
      console.log('Playback ready')
      try {
        const head = await fetch(audioUrl, { method: 'HEAD' })
        if (!head.ok) throw new Error('Prefetch failed')
      } catch {
        await new Promise(r => setTimeout(r, 1000))
        await fetch(audioUrl, { method: 'HEAD' })
      }
      setGeneratedTrack(audioUrl)
      if (data.track_id) setTrackId(data.track_id)

      // Award upload credits (no UI dependency). User id is read from cookie/middleware.
      try {
        await fetch('/api/actions/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
      } catch {}
    } catch (err:any) {
      setError(err?.message || 'Failed to generate track. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const examplePrompts = [
    'Upbeat electronic dance track with synthesizers and a catchy melody',
    'Ambient chill-out music with soft piano and atmospheric sounds',
    'Jazz fusion with saxophone, electric guitar, and complex rhythms',
    'Epic orchestral soundtrack with dramatic strings and brass',
    'Lo-fi hip hop beat with vinyl crackle and smooth bass'
  ]

  return (
    <PageTransition>
      <div className="min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6 animate-in fade-in-0 slide-in-from-top-4 duration-700">
              Generate Your Music
            </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Describe the music you want to create and let our AI bring your vision to life with luxury-grade quality.
          </p>
        </div>

        {/* Generation Interface */}
        <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-8 mb-8">
          {/* Prompt Input */}
          <div className="mb-6">
            <label htmlFor="prompt" className="block text-lg font-semibold text-white mb-3">
              Describe your music
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter a detailed description of the music you want to create..."
              className="w-full h-32 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold resize-none"
              disabled={isGenerating}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-400">
                {prompt.length}/500 characters
              </span>
              <span className="text-sm text-gray-400">
                Be specific for better results
              </span>
            </div>
          </div>

          {/* Duration Input */}
          <div className="mb-6">
            <label htmlFor="duration" className="block text-sm font-medium text-white mb-2">Duration (seconds)</label>
            <input
              id="duration"
              type="number"
              min={5}
              max={300}
              value={duration}
              onChange={(e) => setDuration(Math.max(5, Math.min(300, Number(e.target.value) || 0)))}
              className="w-40 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
              disabled={isGenerating}
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Generate Button */}
          {isGenerating && !requestId && (
            <div className="mb-4 text-white/70 text-center">Generating music…</div>
          )}
          {requestId && (
            <div className="mb-4 text-white/70 text-center">Processing… We'll notify you when it’s ready.</div>
          )}
          <ButtonLoading
            loading={isGenerating}
            onClick={handleGenerate}
            className={`w-full py-4 rounded-lg font-semibold text-lg transition-all duration-200 ${
              !prompt.trim()
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'btn-primary hover:shadow-xl'
            }`}
            disabled={!prompt.trim()}
          >
            {isGenerating ? 'Generating your track...' : 'Generate Music'}
          </ButtonLoading>
        </div>

        {/* Generated Track */}
        {generatedTrack && (
          <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Your Generated Track</h2>
            <div className="bg-gray-800 rounded-lg p-6">
              <audio
                controls
                className="w-full mb-4"
                src={generatedTrack}
                autoPlay
              >
                Your browser does not support the audio element.
              </audio>
              <div className="mt-2">
                <a href={generatedTrack} download className="btn-secondary">Download Track</a>
              </div>
              <div className="flex flex-wrap gap-4">
                <button className="btn-primary" onClick={() => generatedTrack && window.open(generatedTrack, '_blank')}>Download Track</button>
                <button className="btn-secondary" onClick={async () => {
                  try {
                    const res = await fetch('/api/save-track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt, duration, audio_url: generatedTrack }) })
                    const json = await res.json()
                    if (!res.ok) throw new Error(json?.error || 'Save failed')
                    setTrackId(json.track_id)
                    alert('Saved to your library')
                  } catch (e:any) {
                    console.error('Save track error:', e?.message || e)
                    alert('Failed to save track')
                  }
                }}>Save to Library</button>
                <button className="btn-secondary" onClick={async () => {
                  try {
                    const id = trackId
                    if (!id) throw new Error('Please save the track first')
                    const res = await fetch('/api/submit-competition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ track_id: id, category: 'competition' }) })
                    const json = await res.json()
                    if (!res.ok) throw new Error(json?.error || 'Submit failed')
                    alert('Submitted to competition')
                  } catch (e:any) {
                    console.error('Submit competition error:', e?.message || e)
                    alert(e?.message || 'Failed to submit to competition')
                  }
                }}>Submit to Competition</button>
              </div>
            </div>
          </div>
        )}

        {/* Distribution Packages (neutral, no implied endorsements) */}
        <div id="release" className="bg-black/40 rounded-3xl border border-gold/20 p-8 md:p-10 mb-12">
          <h3 className="text-3xl font-bold text-white mb-2">Distribution Packages</h3>
          <p className="text-white/60 mb-6">We help you distribute to major platforms or premiere on Orinowo Video. No affiliation or endorsement by DSPs is implied.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Spotify ACTIVE */}
              <button onClick={() => setDistType('spotify')} title="Distribute to major DSPs (e.g., Spotify) — no affiliation implied" className="relative text-left rounded-3xl p-[2px] bg-gradient-to-br from-gold to-gold-dark hover:shadow-glow transition-all cursor-pointer">
              <div className="rounded-3xl h-full w-full bg-black p-6 flex items-center justify-between">
                <div>
                  <div className="text-white font-extrabold text-2xl mb-1">DSP Distribution — Spotify</div>
                  <div className="text-white/70 text-sm">Global reach via third-party delivery</div>
                  <div className="text-gold font-bold mt-2"><CurrencyClient amount={40} suffix="/year" /></div>
                  <div className="text-white/50 text-xs">60/40 revenue split in your favor • Prices shown in {mounted ? getCurrencyName() : 'USD'}. Billed in USD.</div>
                </div>
                <span aria-hidden className="text-gold text-3xl">⟲</span>
              </div>
            </button>
            {/* Apple DISABLED */}
            <button onClick={() => setDistType('apple')} title="Distribute to major DSPs (e.g., Apple Music) — no affiliation implied" className="relative text-left rounded-3xl p-[2px] bg-gradient-to-br from-gold to-gold-dark hover:shadow-glow transition-all cursor-pointer">
              <div className="rounded-3xl h-full w-full bg-black p-6 flex items-center justify-between">
                <div>
                  <div className="text-white font-extrabold text-2xl mb-1">DSP Distribution — Apple Music</div>
                  <div className="text-white/70 text-sm">Premium audience via third-party delivery</div>
                  <div className="text-gold font-bold mt-2"><CurrencyClient amount={40} suffix="/year" /></div>
                  <div className="text-white/50 text-xs">60/40 revenue split in your favor • Prices shown in {mounted ? getCurrencyName() : 'USD'}. Billed in USD.</div>
                </div>
                <span aria-hidden className="text-gold text-3xl">⟲</span>
              </div>
            </button>
          </div>
          <div className="mt-4 text-white/50 text-xs">DSP brand names are used for identification only. No affiliation or endorsement is implied. Delivery times are estimates and may vary.</div>

          <div className="mt-6">
            <Link href="/release" className="btn-secondary">View All Distribution Options</Link>
          </div>
          <div className="mt-8 flex items-center gap-3">
            <div className="rounded-full w-12 h-12 bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center text-black font-extrabold text-xl">✓</div>
            <div>
              <div className="text-gold font-semibold">Orinowo Certified</div>
              <div className="text-white/70 text-sm">Your track carries the mark of global creative excellence</div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-white/70">
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="accent-gold" /> Include Orinowo Certified badge on streaming services
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="accent-gold" /> {mounted ? convertPrice(15) : '$15.00'} - Orinowo AI Mastering
            </label>
          </div>

          {/* TODO: Implement modals for Spotify/Apple with full details, form, and payment stub */}
          <DistributionModal open={!!distType} onClose={() => setDistType(null)} type={(distType ?? 'spotify')} />
        </div>

        {/* Example Prompts */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Need Inspiration? Try These Examples
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {examplePrompts.map((example, index) => (
              <button
                key={index}
                onClick={() => setPrompt(example)}
                className="text-left p-4 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 hover:border-gold/40 rounded-lg transition-all duration-200"
                disabled={isGenerating}
              >
                <p className="text-gray-300 text-sm">{example}</p>
              </button>
            ))}
          </div>
        </div>
                <ComingSoonButton className="btn-secondary">Save to Library</ComingSoonButton>
                <ComingSoonButton className="btn-secondary">Share Track</ComingSoonButton>

        {/* Upgrade Prompt */}
        <div className="bg-gradient-to-r from-gold/10 to-gold-dark/10 rounded-2xl border border-gold/20 p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            Want More Creative Power?
          </h3>
          <p className="text-gray-300 mb-6">
            Upgrade to unlock unlimited generations, premium AI models, and studio-grade exports.
          </p>
          <Link href="/plans" className="btn-primary inline-block">
            View Plans & Upgrade
          </Link>
        </div>
        {ComingSoonModal}
        </div>
      </div>
    </PageTransition>
  )
}