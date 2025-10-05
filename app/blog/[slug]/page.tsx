import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import { Metadata } from 'next'
import { supabase } from '@/lib/supabase'

interface BlogPost {
  slug: string
  title: string
  content: string
  excerpt: string
  image_url: string | null
  published_at: string
  author: string
  read_time: number
  tags: string[]
}

export async function generateMetadata({ 
  params 
}: { 
  params: { slug: string } 
}): Promise<Metadata> {
  const post = await getBlogPost(params.slug)

  if (!post) {
    return {
      title: 'Blog Post Not Found - Orinowo',
      description: 'The requested blog post could not be found on our AI music platform.',
    }
  }

  const publishedDate = new Date(post.published_at).toISOString()
  const tagKeywords = post.tags?.join(', ') || ''
  
  return {
    title: `${post.title} - Orinowo Blog`,
    description: post.excerpt || `Read ${post.title} on Orinowo's blog - insights about AI music generation, industry trends, and creative technology.`,
    keywords: [
      'AI music generation',
      'music technology blog',
      'artificial intelligence music',
      'creative technology insights',
      'Orinowo blog',
      'music industry trends',
      'professional music tools',
      'enterprise music solutions',
      'thought leadership',
      'music innovation',
      tagKeywords,
      post.title.toLowerCase().split(' ').slice(0, 3).join(', ')
    ].filter(Boolean).join(', '),
    authors: [{ name: post.author }],
    openGraph: {
      title: `${post.title} - Orinowo Blog`,
      description: post.excerpt || `Read ${post.title} on Orinowo's blog - insights about AI music generation and creative technology.`,
      type: 'article',
      publishedTime: publishedDate,
      authors: [post.author],
      images: [
        {
          url: post.image_url || '/og-blog-default.jpg',
          width: 1200,
          height: 630,
          alt: post.title,
        }
      ],
      siteName: 'Orinowo',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${post.title} - Orinowo Blog`,
      description: post.excerpt || `Read ${post.title} on Orinowo's blog - insights about AI music generation and creative technology.`,
      images: [post.image_url || '/og-blog-default.jpg'],
      creator: '@orinowo',
    },
    alternates: {
      canonical: `https://orinowo.com/blog/${post.slug}`,
    },
    other: {
      'article:author': post.author,
      'article:published_time': publishedDate,
      'article:section': 'Technology',
      'article:tag': post.tags?.join(', ') || 'AI Music, Music Technology, Creative Tools',
    }
  }
}

async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single()

    if (error || !data) return null
    return data
  } catch (error) {
    console.error('Error fetching blog post:', error)
    
    // Fallback data for demo
    const fallbackPosts: Record<string, BlogPost> = {
      'ai-music-revolution': {
        slug: 'ai-music-revolution',
        title: 'The AI Music Revolution: How Technology is Reshaping Sound',
        content: `# The AI Music Revolution: How Technology is Reshaping Sound

The music industry is experiencing a profound transformation, driven by artificial intelligence technologies that are redefining how we create, produce, and experience music. This revolution isn't just about automation—it's about expanding the boundaries of human creativity.

## The Current Landscape

Artificial intelligence has already made significant inroads into music creation. From AI-powered composition tools to intelligent mixing and mastering software, technology is becoming an integral part of the creative process. Platforms like Orinowo are at the forefront of this movement, offering creators unprecedented access to sophisticated AI models that can generate luxury-grade tracks in seconds.

## Key Technological Advances

### Machine Learning Models
Modern AI music systems utilize advanced neural networks trained on vast datasets of musical compositions. These models can understand complex musical patterns, harmonies, and structures, enabling them to generate original compositions that rival human creativity.

### Real-time Generation
The latest AI systems can generate music in real-time, allowing for interactive composition sessions where human creators can guide and refine the AI's output as it's being created.

### Style Transfer and Fusion
AI can now seamlessly blend different musical styles and genres, creating unique fusion compositions that might never have been conceived by human artists alone.

## Impact on Artists and Creators

Rather than replacing human creativity, AI is augmenting it. Artists are finding new ways to:

- **Overcome creative blocks** by using AI as a collaborative partner
- **Explore new genres** and styles with AI assistance
- **Accelerate the production process** while maintaining artistic vision
- **Democratize music creation** by making professional-quality tools accessible to everyone

## The Future of AI Music

As we look ahead, several trends are emerging:

1. **Personalized Music Creation**: AI will enable highly personalized music experiences tailored to individual preferences
2. **Enhanced Live Performances**: Real-time AI integration will transform live music experiences
3. **New Creative Workflows**: Artists will develop entirely new approaches to composition and production
4. **Educational Applications**: AI tutors will help aspiring musicians learn and improve their skills

## Ethical Considerations

With great power comes great responsibility. The music industry must address important questions about:

- **Copyright and ownership** of AI-generated content
- **Attribution and credit** for human vs. AI contributions
- **Economic impact** on traditional music careers
- **Preservation of human artistry** in an AI-driven world

## Conclusion

The AI music revolution is not a distant future—it's happening now. As technology continues to evolve, the most successful artists and creators will be those who embrace AI as a powerful creative tool while maintaining their unique human perspective and artistic vision.

The key is finding the right balance between technological innovation and human creativity, using AI to enhance rather than replace the fundamental human elements that make music meaningful and emotionally resonant.`,
        excerpt: 'Explore how artificial intelligence is transforming the music industry and creating new possibilities for artists and creators worldwide.',
        image_url: '/blog/ai-music-revolution.jpg',
        published_at: '2024-01-15T10:00:00Z',
        author: 'Sarah Mitchell',
        read_time: 8,
        tags: ['AI', 'Technology', 'Music Production', 'Innovation']
      }
    }
    
    return fallbackPosts[slug] || null
  }
}

export default async function BlogPostPage({ 
  params 
}: { 
  params: { slug: string } 
}) {
  const post = await getBlogPost(params.slug)

  if (!post) {
    notFound()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center text-gold hover:text-gold-light transition-colors"
          >
            <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Blog
          </Link>
        </div>

        <article>
          {/* Header */}
          <header className="mb-12">
            {post.image_url && (
              <div className="relative aspect-video rounded-2xl overflow-hidden mb-8">
                <Image
                  src={post.image_url}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}

            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center justify-center gap-4 text-gray-400 mb-6">
                <span>{formatDate(post.published_at)}</span>
                <span>•</span>
                <span>{post.author}</span>
                <span>•</span>
                <span>{post.read_time} min read</span>
              </div>

              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2">
                  {post.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gold/10 text-gold text-sm rounded-full border border-gold/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </header>

          {/* Content */}
          <div className="prose prose-lg prose-invert max-w-none">
            <div className="bg-gray-900/30 rounded-2xl p-8 border border-gray-800">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-3xl font-bold text-white mb-6 mt-8 first:mt-0">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-2xl font-bold text-white mb-4 mt-8">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-xl font-bold text-white mb-3 mt-6">{children}</h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-gray-300 mb-4 leading-relaxed">{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside text-gray-300 mb-4 space-y-2">{children}</ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-gray-300">{children}</li>
                  ),
                  strong: ({ children }) => (
                    <strong className="text-gold font-semibold">{children}</strong>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-gold pl-4 italic text-gray-400 my-6">
                      {children}
                    </blockquote>
                  ),
                  code: ({ children }) => (
                    <code className="bg-gray-800 text-gold px-2 py-1 rounded text-sm">{children}</code>
                  ),
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>
          </div>
        </article>

        {/* Share Section */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="text-center">
            <h3 className="text-xl font-bold text-white mb-4">Share This Article</h3>
            <div className="flex justify-center space-x-4">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                Twitter
              </button>
              <button className="bg-blue-800 hover:bg-blue-900 text-white px-4 py-2 rounded-lg transition-colors">
                LinkedIn
              </button>
              <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors">
                Copy Link
              </button>
            </div>
          </div>
        </div>

        {/* Related Articles */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">More Articles</h3>
          <div className="text-center">
            <Link
              href="/blog"
              className="btn-secondary inline-flex items-center"
            >
              Browse All Articles
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}