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
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedTrack, setGeneratedTrack] = useState<string | null>(null)
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
      // Simulate API call - replace with actual generation logic
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Mock generated track URL
      setGeneratedTrack('/audio/sample-track.mp3')

      // Award upload credits (no UI dependency). User id is read from cookie/middleware.
      try {
        await fetch('/api/actions/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
      } catch {}
    } catch (err) {
      setError('Failed to generate track. Please try again.')
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

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Generate Button */}
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
              >
                Your browser does not support the audio element.
              </audio>
              <div className="flex flex-wrap gap-4">
                <button className="btn-primary">
                  Download Track
                </button>
                <button className="btn-secondary">
                  Save to Library
                </button>
                <button className="btn-secondary">
                  Share Track
                </button>
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