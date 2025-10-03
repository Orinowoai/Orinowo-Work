'use client'

import { useState } from 'react'

const periods = ['weekly', 'monthly', 'all-time']
const mockLeaderboardData = {
  weekly: [
    { rank: 1, name: 'Luna Rodriguez', type: 'Artist', votes: 234, change: '+12' },
    { rank: 2, name: 'Neon Dreams', type: 'Song', votes: 198, change: '+5' },
    { rank: 3, name: 'TechBeats Pro', type: 'Producer', votes: 187, change: '-1' },
    { rank: 4, name: 'Digital Sunrise', type: 'Song', votes: 156, change: '+8' },
    { rank: 5, name: 'Marcus Chen', type: 'Artist', votes: 142, change: '+3' },
  ],
  monthly: [
    { rank: 1, name: 'TechBeats Pro', type: 'Producer', votes: 1456, change: '+5' },
    { rank: 2, name: 'Neon Dreams', type: 'Song', votes: 1298, change: '+2' },
    { rank: 3, name: 'Luna Rodriguez', type: 'Artist', votes: 1187, change: '-1' },
    { rank: 4, name: 'Electric Pulse', type: 'Song', votes: 998, change: '+7' },
    { rank: 5, name: 'SoundCraft Studio', type: 'Producer', votes: 876, change: '+4' },
  ],
  'all-time': [
    { rank: 1, name: 'TechBeats Pro', type: 'Producer', votes: 15678, change: '—' },
    { rank: 2, name: 'Luna Rodriguez', type: 'Artist', votes: 14532, change: '—' },
    { rank: 3, name: 'Neon Dreams', type: 'Song', votes: 13789, change: '—' },
    { rank: 4, name: 'Marcus Chen', type: 'Artist', votes: 12456, change: '—' },
    { rank: 5, name: 'Digital Sunrise', type: 'Song', votes: 11234, change: '—' },
  ]
}

export default function LeaderboardPage() {
  const [activePeriod, setActivePeriod] = useState('monthly')
  const [showRules, setShowRules] = useState(false)

  const currentData = mockLeaderboardData[activePeriod as keyof typeof mockLeaderboardData]

  const getRankDisplay = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Artist': return 'text-blue-400'
      case 'Song': return 'text-purple-400'
      case 'Producer': return 'text-green-400'
      default: return 'text-gray-400'
    }
  }

  const getChangeColor = (change: string) => {
    if (change.startsWith('+')) return 'text-green-400'
    if (change.startsWith('-')) return 'text-red-400'
    return 'text-gray-400'
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Leaderboard
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            See who's leading the charts in votes and recognition across all categories.
          </p>
        </div>

        {/* Period Filter */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-900/50 rounded-xl p-2 border border-gray-800">
            {periods.map((period) => (
              <button
                key={period}
                onClick={() => setActivePeriod(period)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 capitalize ${
                  activePeriod === period
                    ? 'bg-gold text-black'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                {period.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                    Votes
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                    Change
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {currentData.map((entry, index) => (
                  <tr
                    key={entry.rank}
                    className={`hover:bg-gray-800/30 transition-colors ${
                      entry.rank <= 3 ? 'bg-gold/5' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-2xl font-bold text-white">
                        {getRankDisplay(entry.rank)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-lg font-semibold text-white">
                        {entry.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getTypeColor(entry.type)}`}>
                        {entry.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-lg font-bold text-gold">
                        {entry.votes.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getChangeColor(entry.change)}`}>
                        {entry.change}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Rules Accordion */}
        <div className="bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden">
          <button
            onClick={() => setShowRules(!showRules)}
            className="w-full px-6 py-4 text-left bg-gray-800/50 hover:bg-gray-800/70 transition-colors flex items-center justify-between"
          >
            <h3 className="text-lg font-semibold text-white">Voting Rules & Guidelines</h3>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${
                showRules ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showRules && (
            <div className="px-6 py-4 border-t border-gray-800">
              <div className="prose prose-gray prose-invert max-w-none">
                <ul className="space-y-2 text-gray-300">
                  <li>• Each user can vote once per entry per voting period</li>
                  <li>• Voting periods reset weekly for weekly rankings, monthly for monthly rankings</li>
                  <li>• All-time rankings are cumulative and never reset</li>
                  <li>• Winners are announced at the end of each voting period</li>
                  <li>• Voting manipulation or fraud will result in disqualification</li>
                  <li>• Only published, original content is eligible for voting</li>
                  <li>• Inappropriate content will be removed and votes nullified</li>
                  <li>• Rankings update in real-time as votes are cast</li>
                </ul>
                <div className="mt-6 p-4 bg-gold/10 rounded-lg border border-gold/20">
                  <h4 className="text-gold font-semibold mb-2">Prize Distribution</h4>
                  <p className="text-sm text-gray-300">
                    Weekly and monthly winners receive exclusive recognition, featured placement on the platform, 
                    and eligibility for special collaboration opportunities with premium artists and producers.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}