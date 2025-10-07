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
    let supabase: any = null
    try {
      supabase = getServiceSupabase()
    } catch (e: any) {
      console.warn('Supabase init warning:', e?.message || String(e))
    }
    const newPosts: any[] = []
    const feedErrors: Array<{ feed: string; error: string }> = []

    for (const feedUrl of RSS_FEEDS) {
      try {
        console.log(`Fetching: ${feedUrl}`)
        const feed = await parser.parseURL(feedUrl)
        for (const item of (feed.items || []).slice(0, 3)) {
          const link = item.link || ''
          if (!link) continue

          let existing: any = null
          if (supabase) {
            const res: any = await (supabase
              .from('blog_posts')
              .select('id')
              .eq('source_url', link)
              .maybeSingle?.() ?? { data: null })
            existing = res?.data ?? null
          }

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
        const message = error?.message || String(error)
        console.error(`Failed to fetch ${feedUrl}:`, message)
        feedErrors.push({ feed: feedUrl, error: message })
        // Continue to next feed instead of crashing
        continue
      }
    }

    let dbError: string | null = null
    if (supabase && newPosts.length) {
      try {
        const { error } = await supabase.from('blog_posts').insert(newPosts)
        if (error) dbError = error?.message || String(error)
      } catch (e: any) {
        dbError = e?.message || String(e)
      }
    }

    return NextResponse.json({ success: true, postsAdded: newPosts.length, feedErrors, dbError })
  } catch (error) {
    console.error('RSS fetch error (non-fatal):', error)
    // Non-fatal to avoid failing builds/crons; return summary
    return NextResponse.json({ success: false, error: 'RSS processing encountered an error but did not crash.' })
  }
}
