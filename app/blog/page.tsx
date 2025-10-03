import BlogCard from '@/components/BlogCard'
import { supabase } from '@/lib/supabase'

async function getBlogPosts() {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('slug, title, excerpt, image_url, published_at, author, read_time')
      .eq('published', true)
      .order('published_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    
    // Fallback data
    return [
      {
        slug: 'ai-music-revolution',
        title: 'The AI Music Revolution: How Technology is Reshaping Sound',
        excerpt: 'Explore how artificial intelligence is transforming the music industry and creating new possibilities for artists and creators worldwide.',
        image_url: '/blog/ai-music-revolution.jpg',
        published_at: '2024-01-15T10:00:00Z',
        author: 'Sarah Mitchell',
        read_time: 8
      },
      {
        slug: 'premium-production-techniques',
        title: 'Premium Production Techniques Every Producer Should Know',
        excerpt: 'Discover the professional techniques that separate amateur productions from luxury-grade tracks that dominate the charts.',
        image_url: '/blog/production-techniques.jpg',
        published_at: '2024-01-12T14:30:00Z',
        author: 'David Park',
        read_time: 12
      },
      {
        slug: 'future-of-music-creation',
        title: 'The Future of Music Creation: Trends to Watch in 2024',
        excerpt: 'Get insights into the emerging trends that will shape the future of music production and distribution in the coming years.',
        image_url: '/blog/future-music.jpg',
        published_at: '2024-01-10T09:15:00Z',
        author: 'Maria Garcia',
        read_time: 6
      },
      {
        slug: 'mastering-ai-collaboration',
        title: 'Mastering AI Collaboration: A Producer\'s Guide',
        excerpt: 'Learn how to effectively collaborate with AI tools to enhance your creative process without losing your artistic vision.',
        image_url: '/blog/ai-collaboration.jpg',
        published_at: '2024-01-08T16:45:00Z',
        author: 'Alex Chen',
        read_time: 10
      },
      {
        slug: 'sound-design-fundamentals',
        title: 'Sound Design Fundamentals for Modern Music',
        excerpt: 'Master the art of sound design with these essential techniques that will elevate your tracks to professional standards.',
        image_url: '/blog/sound-design.jpg',
        published_at: '2024-01-05T11:20:00Z',
        author: 'Jordan Williams',
        read_time: 15
      },
      {
        slug: 'music-marketing-strategies',
        title: 'Effective Music Marketing Strategies for Independent Artists',
        excerpt: 'Discover proven marketing strategies that help independent artists build their audience and grow their music career.',
        image_url: '/blog/music-marketing.jpg',
        published_at: '2024-01-03T13:30:00Z',
        author: 'Taylor Swift',
        read_time: 9
      }
    ]
  }
}

export default async function BlogPage() {
  const posts = await getBlogPosts()

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Music Industry Insights
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Stay ahead of the curve with expert insights, tutorials, and industry trends from music professionals and AI specialists.
          </p>
        </div>

        {/* Featured Post */}
        {posts.length > 0 && (
          <div className="mb-16">
            <div className="bg-gradient-to-r from-gold/10 to-gold-dark/10 rounded-2xl border border-gold/20 p-2">
              <div className="bg-gray-900/80 rounded-xl p-8">
                <div className="flex items-center mb-4">
                  <span className="bg-gold text-black px-3 py-1 rounded-full text-sm font-bold mr-4">
                    Featured
                  </span>
                  <span className="text-gray-400 text-sm">Latest Post</span>
                </div>
                <BlogCard
                  slug={posts[0].slug}
                  title={posts[0].title}
                  excerpt={posts[0].excerpt}
                  image={posts[0].image_url}
                  publishedAt={posts[0].published_at}
                  author={posts[0].author}
                  readTime={posts[0].read_time}
                />
              </div>
            </div>
          </div>
        )}

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.slice(1).map((post: any) => (
            <BlogCard
              key={post.slug}
              slug={post.slug}
              title={post.title}
              excerpt={post.excerpt}
              image={post.image_url}
              publishedAt={post.published_at}
              author={post.author}
              readTime={post.read_time}
            />
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="mt-20">
          <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Stay Updated
            </h2>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Get the latest insights, tutorials, and industry news delivered directly to your inbox. Join thousands of music creators who trust our content.
            </p>
            <div className="max-w-md mx-auto flex gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
              />
              <button className="btn-primary whitespace-nowrap">
                Subscribe
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              No spam, unsubscribe at any time. We respect your privacy.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}