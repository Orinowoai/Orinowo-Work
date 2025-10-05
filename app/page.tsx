import Link from 'next/link'
import { convertPrice } from '@/lib/currency'
import { Suspense } from 'react'
import dynamic from 'next/dynamic'
const GenerateButton = dynamic(() => import('@/components/GenerateButton'), { ssr: false })
import SpotlightCard from '@/components/SpotlightCard'
import CurrencyClient from '@/components/CurrencyClient'

async function getSpotlightItems() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/spotlight`, {
      cache: 'no-store'
    })
    if (!response.ok) throw new Error('Failed to fetch')
    return await response.json()
  } catch (error) {
    // Fallback data
    return {
      artists: [
        { id: '1', title: 'Luna Rodriguez', type: 'artist', image: '/spotlight/artist-placeholder.jpg', votes: 234 },
        { id: '2', title: 'Marcus Chen', type: 'artist', image: '/spotlight/song-placeholder.jpg', votes: 187 },
        { id: '3', title: 'Aria Thompson', type: 'producer', image: '/spotlight/producer-placeholder.jpg', votes: 156 }
      ]
    }
  }
}

// Blog preview removed from homepage

export default async function Home() {
  const spotlightData = await getSpotlightItems()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 lg:py-40 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gold/8 via-transparent to-purple-600/5"></div>
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center page-transition">
            <div className="mb-8">
              <div className="inline-block px-6 py-3 rounded-full bg-gold/10 border border-gold/20 backdrop-blur-sm mb-8 animate-fade-in">
                <span className="text-gold font-semibold text-sm tracking-wide">🎵 AI-POWERED MUSIC CREATION</span>
              </div>
            </div>
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold mb-8 animate-slide-up text-shadow">
              Create{' '}
              <span className="text-gradient text-glow floating">luxury-grade</span>
              <br className="hidden sm:block" />
              {' '}tracks in seconds
            </h1>
            <p className="text-xl sm:text-2xl text-slate-300 mb-6 max-w-4xl mx-auto animate-slide-up leading-relaxed" style={{animationDelay: '0.2s'}}>
              Experience the future of music creation with AI-powered generation that delivers 
              <span className="text-gold font-semibold"> premium quality</span> every time.
            </p>
            {/* Magnetic Generate Button - center stage */}
            <div className="animate-fade-in" style={{animationDelay: '0.35s'}}>
              <GenerateButton intenseParticles />
            </div>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-slide-up" style={{animationDelay: '0.6s'}}>
              <Link href="/generate" className="btn-primary text-xl hover-glow">
                <span className="flex items-center gap-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                  Start Creating Now
                </span>
              </Link>
              <Link href="/plans" className="btn-secondary text-xl">
                <span className="flex items-center gap-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  View Plans
                </span>
              </Link>
            </div>
            
            {/* Trust indicator */}
            <div className="mt-8 animate-fade-in" style={{animationDelay: '0.5s'}}>
              <p className="text-gold/40 text-sm text-center font-medium tracking-wide">
                Trusted by 10,000+ creators worldwide
              </p>
            </div>
            
            {/* Stats */}
            <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto animate-fade-in" style={{animationDelay: '0.6s'}}>
              <div className="text-center">
                <div className="text-3xl font-bold text-gold mb-2">50K+</div>
                <div className="text-sm text-slate-400 uppercase tracking-wide">Tracks Created</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gold mb-2">10K+</div>
                <div className="text-sm text-slate-400 uppercase tracking-wide">Artists</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gold mb-2">99.9%</div>
                <div className="text-sm text-slate-400 uppercase tracking-wide">Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Global Jam Rooms Entry */}
      <section className="py-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="rounded-3xl p-8 md:p-12 border border-gold/20 bg-white/5 backdrop-blur-xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              <div className="md:col-span-2">
                <h2 className="text-3xl font-bold text-white mb-2">Global Jam Rooms</h2>
                <p className="text-white/70 mb-4">Collaborate in real-time with creators across continents</p>
                <div className="text-gold text-sm">24 active sessions worldwide</div>
              </div>
              <div className="text-center md:text-right">
                <Link href="/jam-rooms" className="btn-primary inline-flex items-center justify-center px-8 py-4">Enter Jam Rooms</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Spotlight Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/20 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-block px-4 py-2 rounded-full bg-gold/10 border border-gold/20 backdrop-blur-sm mb-6">
              <span className="text-gold font-semibold text-sm tracking-wide">⭐ FEATURED ARTISTS</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 text-gradient">
              This Month's Spotlight
            </h2>
            <p className="text-slate-300 text-xl max-w-3xl mx-auto leading-relaxed">
              Discover the most talented artists creating exceptional music with Orinowo's AI platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {spotlightData.artists?.slice(0, 3).map((item: any, index: number) => (
              <div key={item.id} className="animate-slide-up" style={{animationDelay: `${index * 0.1}s`}}>
                <SpotlightCard
                  id={item.id}
                  title={item.title}
                  type={item.type}
                  image={item.image}
                  votes={item.votes}
                />
              </div>
            ))}
          </div>
          
          <div className="text-center animate-fade-in">
            <Link
              href="/spotlight"
              className="inline-flex items-center gap-3 text-gold hover:text-gold-light transition-all duration-300 font-semibold text-lg group hover-glow px-6 py-3 rounded-2xl bg-gold/5 border border-gold/20 backdrop-blur-sm"
            >
              View All Spotlight Artists
              <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Competitions Strip */}
      <section className="py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gold/10 via-purple-600/5 to-gold/10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/5 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="card-glass p-8 md:p-12">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="text-center lg:text-left">
                <div className="inline-block px-4 py-2 rounded-full bg-gold/20 border border-gold/30 backdrop-blur-sm mb-4">
                  <span className="text-gold font-semibold text-sm tracking-wide">🏆 LIVE COMPETITION</span>
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 text-gradient">
                  Monthly Music Competition
                </h3>
                <p className="text-slate-300 text-lg mb-2">
                  Compete for a chance to win <CurrencyClient amount={10000} /> in prizes
                </p>
                <p className="text-slate-400 text-sm">
                  Deadline: January 31st • 847 participants
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/spotlight#competitions"
                  className="btn-primary text-lg hover-glow whitespace-nowrap"
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Enter Competition
                  </span>
                </Link>
                <Link
                  href="/spotlight"
                  className="btn-secondary text-lg whitespace-nowrap"
                >
                  View Leaderboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Teaser removed from homepage — visit /blog for articles */}
    </div>
  )
}