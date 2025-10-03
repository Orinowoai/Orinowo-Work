import Link from 'next/link'

interface BlogCardProps {
  slug: string
  title: string
  excerpt: string
  image?: string
  publishedAt: string
  author?: string
  readTime?: number
}

export default function BlogCard({ 
  slug, 
  title, 
  excerpt, 
  image, 
  publishedAt, 
  author = 'Orinowo Team',
  readTime = 5
}: BlogCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <Link href={`/blog/${slug}`} className="group block">
      <article className="card-glass overflow-hidden hover:shadow-glow-lg hover:scale-105 transition-all duration-500 hover:border-gold/60 relative">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
        
        {/* Image */}
        <div className="relative aspect-video overflow-hidden">
          <img
            src={image || '/blog/placeholder.jpg'}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          
          {/* Reading time badge */}
          <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 px-3 py-1 rounded-full text-xs text-slate-300 z-20">
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {readTime} min
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 relative z-20">
          {/* Meta */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-1">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center text-black font-bold text-xs">
                  {author?.charAt(0) || 'O'}
                </div>
                <span className="font-medium">{author}</span>
              </div>
              <span className="w-1 h-1 rounded-full bg-slate-600"></span>
              <time dateTime={publishedAt} className="font-medium">
                {formatDate(publishedAt)}
              </time>
            </div>
            
            <div className="px-2 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs font-medium">
              Blog
            </div>
          </div>

          {/* Title */}
          <h2 className="text-white text-xl font-bold mb-4 group-hover:text-gold transition-colors duration-300 line-clamp-2 text-shadow">
            {title}
          </h2>

          {/* Excerpt */}
          <p className="text-slate-400 text-sm line-clamp-3 mb-6 leading-relaxed">
            {excerpt}
          </p>

          {/* Read More */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-gold text-sm font-medium group-hover:text-gold-light transition-colors">
              <span>Read full article</span>
              <svg 
                className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M17 8l4 4m0 0l-4 4m4-4H3" 
                />
              </svg>
            </div>
            
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-2 h-2 rounded-full bg-gold animate-pulse"></div>
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}