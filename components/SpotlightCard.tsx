import Link from 'next/link'

interface SpotlightCardProps {
  id: string
  title: string
  type: 'artist' | 'song' | 'producer'
  image?: string
  votes?: number
  isWinner?: boolean
}

export default function SpotlightCard({ 
  id, 
  title, 
  type, 
  image, 
  votes = 0, 
  isWinner = false 
}: SpotlightCardProps) {
  const typeColors = {
    artist: 'text-cyan-400',
    song: 'text-purple-400',
    producer: 'text-emerald-400'
  }

  const typeBadgeColors = {
    artist: 'bg-cyan-500/20 border-cyan-500/30',
    song: 'bg-purple-500/20 border-purple-500/30',
    producer: 'bg-emerald-500/20 border-emerald-500/30'
  }

  const fallbackImages = {
    artist: '/spotlight/artist-placeholder.jpg',
    song: '/spotlight/song-placeholder.jpg',
    producer: '/spotlight/producer-placeholder.jpg'
  }

  return (
    <Link 
      href={`/spotlight?tab=${type}s`}
      className="group block"
    >
      <div className="card-glass overflow-hidden hover:shadow-glow-lg hover:scale-105 transition-all duration-500 hover:border-gold/60 relative">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
        
        {/* Image */}
        <div className="relative aspect-square overflow-hidden rounded-xl">
          <img
            src={image || fallbackImages[type]}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          
          {/* Floating badges */}
          <div className="absolute top-4 left-4 z-20">
            <div className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm border ${typeBadgeColors[type]} ${typeColors[type]} uppercase tracking-wide`}>
              {type}
            </div>
          </div>
          
          {isWinner && (
            <div className="absolute top-4 right-4 bg-gradient-to-r from-gold to-gold-light text-black px-3 py-1 rounded-full text-xs font-bold shadow-glow animate-pulse z-20">
              ✨ WINNER
            </div>
          )}
          
          {/* Vote count overlay */}
          {votes > 0 && (
            <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 px-3 py-1 rounded-full text-xs text-slate-300 z-20">
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3 text-gold" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {votes.toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 relative z-20">
          <h3 className="text-white font-bold text-xl group-hover:text-gold transition-colors duration-300 line-clamp-2 mb-2 text-shadow">
            {title}
          </h3>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gold animate-pulse"></div>
              <span className="text-slate-400 text-sm">
                Featured {type.charAt(0).toUpperCase() + type.slice(1)}
              </span>
            </div>
            
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <svg className="w-5 h-5 text-gold transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}