import Link from 'next/link'
import SpotlightCard from '@/components/SpotlightCard'
import BlogCard from '@/components/BlogCard'
import { supabase } from '@/lib/supabase'

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

async function getBlogPosts() {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('slug, title, excerpt, image_url, published_at, author')
      .eq('published', true)
      .order('published_at', { ascending: false })
      .limit(3)

    if (error) throw error
    return data || []
  } catch (error) {
    // Fallback data
    return [
      {
        slug: 'ai-music-revolution',
        title: 'The AI Music Revolution: How Technology is Reshaping Sound',
        excerpt: 'Explore how artificial intelligence is transforming the music industry and creating new possibilities for artists and creators.',
        image_url: '/blog/placeholder.jpg',
        published_at: '2024-01-15T10:00:00Z',
        author: 'Sarah Mitchell'
      },
      {
        slug: 'premium-production-techniques',
        title: 'Premium Production Techniques Every Producer Should Know',
        excerpt: 'Discover the professional techniques that separate amateur productions from luxury-grade tracks.',
        image_url: '/blog/placeholder.jpg',
        published_at: '2024-01-12T14:30:00Z',
        author: 'David Park'
      },
      {
        slug: 'future-of-music-creation',
        title: 'The Future of Music Creation: Trends to Watch in 2024',
        excerpt: 'Get insights into the emerging trends that will shape the future of music production and distribution.',
        image_url: '/blog/placeholder.jpg',
        published_at: '2024-01-10T09:15:00Z',
        author: 'Maria Garcia'
      }
    ]
  }
}

export default async function Home() {
  const [spotlightData, blogPosts] = await Promise.all([
    getSpotlightItems(),
    getBlogPosts()
  ])

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
            <p className="text-xl sm:text-2xl text-slate-300 mb-12 max-w-4xl mx-auto animate-slide-up leading-relaxed" style={{animationDelay: '0.2s'}}>
              Experience the future of music creation with AI-powered generation that delivers 
              <span className="text-gold font-semibold"> premium quality</span> every time.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-slide-up" style={{animationDelay: '0.4s'}}>
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
            
            {/* Stats */}
            <div className="mt-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto animate-fade-in" style={{animationDelay: '0.6s'}}>
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
                  Compete for a chance to win <span className="text-gold font-bold">$10,000</span> in prizes
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

      {/* Blog Teaser */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/10 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-block px-4 py-2 rounded-full bg-gold/10 border border-gold/20 backdrop-blur-sm mb-6">
              <span className="text-gold font-semibold text-sm tracking-wide">📚 INDUSTRY INSIGHTS</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 text-gradient">
              Latest Insights
            </h2>
            <p className="text-slate-300 text-xl max-w-3xl mx-auto leading-relaxed">
              Stay updated with the latest trends, techniques, and insights from the music industry
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {blogPosts.slice(0, 3).map((post: any, index: number) => (
              <div key={post.slug} className="animate-slide-up" style={{animationDelay: `${index * 0.1}s`}}>
                <BlogCard
                  slug={post.slug}
                  title={post.title}
                  excerpt={post.excerpt}
                  image={post.image_url}
                  publishedAt={post.published_at}
                  author={post.author}
                />
              </div>
            ))}
          </div>
          
          <div className="text-center animate-fade-in">
            <Link
              href="/blog"
              className="inline-flex items-center gap-3 text-gold hover:text-gold-light transition-all duration-300 font-semibold text-lg group hover-glow px-6 py-3 rounded-2xl bg-gold/5 border border-gold/20 backdrop-blur-sm"
            >
              Read All Articles
              <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}