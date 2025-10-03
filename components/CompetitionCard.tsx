'use client'

import { useState, useEffect } from 'react'

interface CompetitionCardProps {
  id: string
  title: string
  description: string
  endDate: string
  prizes: {
    position: number
    amount: string
    description: string
  }[]
  entryCount?: number
}

export default function CompetitionCard({ 
  id, 
  title, 
  description, 
  endDate, 
  prizes, 
  entryCount = 0 
}: CompetitionCardProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number
    hours: number
    minutes: number
    seconds: number
  } | null>(null)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(endDate) - +new Date()
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        })
      } else {
        setTimeLeft(null)
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [endDate])

  const isExpired = !timeLeft

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gold/20 hover:border-gold/40 transition-all duration-300 hover:shadow-lg hover:shadow-gold/10">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-white text-xl font-bold mb-2">{title}</h3>
          <p className="text-gray-400 text-sm">{description}</p>
        </div>
        <div className="text-right">
          <div className="text-gray-400 text-xs mb-1">Entries</div>
          <div className="text-gold font-bold text-lg">{entryCount}</div>
        </div>
      </div>

      {/* Countdown Timer */}
      <div className="mb-6">
        {isExpired ? (
          <div className="text-center py-4">
            <span className="text-red-400 font-semibold">Competition Ended</span>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="bg-black/30 rounded-lg p-2">
              <div className="text-gold text-lg font-bold">{timeLeft?.days || 0}</div>
              <div className="text-gray-400 text-xs">Days</div>
            </div>
            <div className="bg-black/30 rounded-lg p-2">
              <div className="text-gold text-lg font-bold">{timeLeft?.hours || 0}</div>
              <div className="text-gray-400 text-xs">Hours</div>
            </div>
            <div className="bg-black/30 rounded-lg p-2">
              <div className="text-gold text-lg font-bold">{timeLeft?.minutes || 0}</div>
              <div className="text-gray-400 text-xs">Minutes</div>
            </div>
            <div className="bg-black/30 rounded-lg p-2">
              <div className="text-gold text-lg font-bold">{timeLeft?.seconds || 0}</div>
              <div className="text-gray-400 text-xs">Seconds</div>
            </div>
          </div>
        )}
      </div>

      {/* Prizes */}
      <div className="space-y-2 mb-4">
        <h4 className="text-white font-semibold text-sm mb-3">Prize Pool</h4>
        {prizes.slice(0, 3).map((prize) => (
          <div key={prize.position} className="flex items-center justify-between bg-black/20 rounded-lg p-3">
            <div className="flex items-center space-x-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                prize.position === 1 ? 'bg-gold text-black' :
                prize.position === 2 ? 'bg-gray-400 text-black' :
                'bg-amber-600 text-white'
              }`}>
                {prize.position}
              </div>
              <span className="text-gray-300 text-sm">{prize.description}</span>
            </div>
            <span className="text-gold font-semibold">{prize.amount}</span>
          </div>
        ))}
      </div>

      {/* Action Button */}
      <button
        disabled={isExpired}
        className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 ${
          isExpired
            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-gold to-gold-dark text-black hover:from-gold-light hover:to-gold hover:shadow-lg hover:shadow-gold/25'
        }`}
      >
        {isExpired ? 'Competition Ended' : 'View Competition'}
      </button>
    </div>
  )
}