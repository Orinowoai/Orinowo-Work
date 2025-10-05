import { Metadata } from 'next'
import BlogCard from '@/components/BlogCard'
import { supabase } from '@/lib/supabase'

export const metadata: Metadata = {
  title: 'Blog | Orinowo',
  description: 'Insights on AI music creation, production techniques, and the future of music.',
}

interface BlogPost {
  slug: string
  title: string
  excerpt: string
  image_url: string
  created_at: string
  author?: string
  read_time?: number
  category?: string
}

export default async function BlogPage() {
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 text-gradient">
            Insights & Innovation
          </h1>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            Explore the future of music creation, AI innovation, and creative excellence
          </p>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts?.map((post, index) => (
            <div 
              key={post.slug}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <BlogCard
                slug={post.slug}
                title={post.title}
                excerpt={post.excerpt}
                image={post.image_url}
                publishedAt={post.created_at}
                author={post.author || 'Orinowo Team'}
                readTime={post.read_time || 5}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}