'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function GeneratePage() {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedTrack, setGeneratedTrack] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

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
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
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
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className={`w-full py-4 rounded-lg font-semibold text-lg transition-all duration-200 ${
              isGenerating || !prompt.trim()
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'btn-primary hover:shadow-xl'
            }`}
          >
            {isGenerating ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating your track...
              </div>
            ) : (
              'Generate Music'
            )}
          </button>
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
      </div>
    </div>
  )
}