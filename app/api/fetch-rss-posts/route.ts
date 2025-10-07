import Parser from 'rss-parser'
import { NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

const RSS_FEEDS = [
  'https://cdm.link/feed/',
  'https://www.attackmagazine.com/feed/',
  'https://www.musicradar.com/news/feed',
]

const parser = new Parser()

export async function GET() {
  try {
    const supabase = getServiceSupabase()
    const newPosts: any[] = []

    for (const feedUrl of RSS_FEEDS) {
      try {
        console.log(`Fetching: ${feedUrl}`)
        const feed = await parser.parseURL(feedUrl)
        for (const item of (feed.items || []).slice(0, 3)) {
          const link = item.link || ''
          if (!link) continue

          const { data: existing } = await supabase
            .from('blog_posts')
            .select('id')
            .eq('source_url', link)
            .maybeSingle?.() ?? { data: null }

          if (!existing) {
            const rawTitle = item.title || 'Untitled'
            const slugBase = rawTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'untitled'
            const imageMatch = (item.content || '').match(/<img[^>]+src="([^"]+)"/)
            const image = imageMatch ? imageMatch[1] : '/blog/placeholder.jpg'

            newPosts.push({
              title: rawTitle,
              slug: `${slugBase}-${Date.now()}`,
              excerpt: (item.contentSnippet || '').slice(0, 200),
              content: item.content || item.contentSnippet || '',
              image_url: image,
              category: 'Industry News',
              published: true,
              source_url: link,
              source_name: feed.title || 'Music Tech News',
              created_at: item.pubDate || new Date().toISOString(),
            })
          }
        }
      } catch (error: any) {
        console.error(`Failed to fetch ${feedUrl}:`, error?.message || String(error))
        // Continue to next feed instead of crashing
        continue
      }
    }

    if (newPosts.length) {
      const { error } = await supabase.from('blog_posts').insert(newPosts)
      if (error) throw error
    }

    return NextResponse.json({ success: true, postsAdded: newPosts.length })
  } catch (error) {
    console.error('RSS fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch RSS feeds' }, { status: 500 })
  }
}
