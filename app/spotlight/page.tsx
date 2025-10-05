'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import Link from 'next/link'
import SpotlightCard from '@/components/SpotlightCard'
import CompetitionCard from '@/components/CompetitionCard'
import { convertPrice } from '@/lib/currency'

// Metadata is exported from layout.tsx for client components

const tabs = [
  { id: 'songs', label: 'Songs' },
  { id: 'artists', label: 'Artists' },
  { id: 'producers', label: 'Producers' },
  { id: 'competition', label: 'Competition' },
]

const mockData = {
  artists: [
    { id: '1', title: 'Luna Rodriguez', type: 'artist' as const, image: '/spotlight/artist-1.jpg', votes: 234, isWinner: false },
    { id: '2', title: 'Marcus Chen', type: 'artist' as const, image: '/spotlight/artist-2.jpg', votes: 187, isWinner: true },
    { id: '3', title: 'Aria Thompson', type: 'artist' as const, image: '/spotlight/artist-3.jpg', votes: 156, isWinner: false },
    { id: '4', title: 'Jordan Blake', type: 'artist' as const, image: '/spotlight/artist-4.jpg', votes: 142, isWinner: false },
    { id: '5', title: 'Sam Rivera', type: 'artist' as const, image: '/spotlight/artist-5.jpg', votes: 98, isWinner: false },
    { id: '6', title: 'Alex Morgan', type: 'artist' as const, image: '/spotlight/artist-6.jpg', votes: 87, isWinner: false },
  ],
  songs: [
    { id: '7', title: 'Neon Dreams', type: 'song' as const, image: '/spotlight/song-1.jpg', votes: 345, isWinner: true },
    { id: '8', title: 'Digital Sunrise', type: 'song' as const, image: '/spotlight/song-2.jpg', votes: 298, isWinner: false },
    { id: '9', title: 'Electric Pulse', type: 'song' as const, image: '/spotlight/song-3.jpg', votes: 276, isWinner: false },
    { id: '10', title: 'Quantum Beat', type: 'song' as const, image: '/spotlight/song-4.jpg', votes: 234, isWinner: false },
    { id: '11', title: 'Stellar Harmony', type: 'song' as const, image: '/spotlight/song-5.jpg', votes: 189, isWinner: false },
    { id: '12', title: 'Cyber Symphony', type: 'song' as const, image: '/spotlight/song-6.jpg', votes: 156, isWinner: false },
  ],
  producers: [
    { id: '13', title: 'TechBeats Pro', type: 'producer' as const, image: '/spotlight/producer-1.jpg', votes: 456, isWinner: true },
    { id: '14', title: 'SoundCraft Studio', type: 'producer' as const, image: '/spotlight/producer-2.jpg', votes: 387, isWinner: false },
    { id: '15', title: 'AudioWave Labs', type: 'producer' as const, image: '/spotlight/producer-3.jpg', votes: 298, isWinner: false },
    { id: '16', title: 'MixMaster Elite', type: 'producer' as const, image: '/spotlight/producer-4.jpg', votes: 234, isWinner: false },
    { id: '17', title: 'Digital Sound Co', type: 'producer' as const, image: '/spotlight/producer-5.jpg', votes: 189, isWinner: false },
    { id: '18', title: 'Beat Factory', type: 'producer' as const, image: '/spotlight/producer-6.jpg', votes: 145, isWinner: false },
  ],
  competitions: [
    {
      id: 'comp-1',
      title: 'October Beat Battle',
      description: 'Create the most innovative electronic track',
      endDate: '2024-10-31T23:59:59Z',
      entryCount: 87,
      prizes: [
        { position: 1, amount: convertPrice(5000), description: 'First Place Winner' },
        { position: 2, amount: convertPrice(3000), description: 'Runner Up' },
        { position: 3, amount: convertPrice(2000), description: 'Third Place' }
      ]
    },
    {
      id: 'comp-2',
      title: 'AI Collaboration Contest',
      description: 'Best human-AI music collaboration',
      endDate: '2024-11-15T23:59:59Z',
      entryCount: 54,
      prizes: [
        { position: 1, amount: convertPrice(7500), description: 'Grand Prize' },
        { position: 2, amount: convertPrice(4500), description: 'Second Place' },
        { position: 3, amount: convertPrice(3000), description: 'Third Place' }
      ]
    },
    {
      id: 'comp-3',
      title: 'Producer Showcase',
      description: 'Showcase your production skills',
      endDate: '2024-12-01T23:59:59Z',
      entryCount: 32,
      prizes: [
        { position: 1, amount: convertPrice(4000), description: 'Best Producer' },
        { position: 2, amount: convertPrice(2500), description: 'Rising Star' },
        { position: 3, amount: convertPrice(1500), description: 'Honorable Mention' }
      ]
    }
  ]
}

export default function SpotlightPage() {
  const [activeTab, setActiveTab] = useState('songs')

  const handleVote = async (entryId: string) => {
    try {
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entry_id: entryId })
      })
      if (response.ok) {
        // Handle successful vote - could show toast or update UI
        console.log('Vote recorded successfully')
      }
    } catch (error) {
      console.error('Error voting:', error)
    }
  }

  const renderTabContent = () => {
    if (activeTab === 'competition') {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {mockData.competitions.map((competition) => (
            <CompetitionCard
              key={competition.id}
              id={competition.id}
              title={competition.title}
              description={competition.description}
              endDate={competition.endDate}
              prizes={competition.prizes}
              entryCount={competition.entryCount}
            />
          ))}
        </div>
      )
    }

    const items = mockData[activeTab as keyof typeof mockData] as Array<{
      id: string
      title: string
      type: 'artist' | 'song' | 'producer'
      image: string
      votes: number
      isWinner: boolean
    }>

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((item) => (
          <div key={item.id} className="relative">
            <SpotlightCard
              id={item.id}
              title={item.title}
              type={item.type}
              image={item.image}
              votes={item.votes}
              isWinner={item.isWinner}
            />
            {activeTab !== 'competition' && (
              <button
                onClick={() => handleVote(item.id)}
                className="absolute bottom-4 right-4 bg-gold hover:bg-gold-light text-black px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                Vote
              </button>
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Artist Spotlight
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Discover and vote for the most talented creators in our community. Winners receive recognition and exclusive opportunities.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center mb-12">
          <div className="bg-gray-900/50 rounded-xl p-2 border border-gray-800">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 inline-flex items-center cursor-pointer border ${
                  activeTab === tab.id
                    ? 'border-gold text-gold bg-gold/10'
                    : 'border-transparent text-white/60 hover:text-white hover:bg-gray-800'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="mb-12">
          {renderTabContent()}
        </div>

        {/* Leaderboard Link */}
        <div className="text-center">
          <Link
            href="/leaderboard"
            className="inline-flex items-center btn-secondary"
          >
            View Full Leaderboard
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
}