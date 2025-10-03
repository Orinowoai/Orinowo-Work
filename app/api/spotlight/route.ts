import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Get current month's spotlight items
    const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM format

    const { data, error } = await supabase
      .from('spotlight')
      .select(`
        id,
        title,
        type,
        image_url,
        created_at,
        votes:votes(count)
      `)
      .eq('month', currentMonth)
      .eq('active', true)

    if (error) {
      console.error('Supabase error:', error)
      
      // Return fallback data
      return NextResponse.json({
        artists: [
          { id: '1', title: 'Luna Rodriguez', type: 'artist', image: '/spotlight/artist-1.jpg', votes: 234 },
          { id: '2', title: 'Marcus Chen', type: 'artist', image: '/spotlight/artist-2.jpg', votes: 187 },
          { id: '3', title: 'Aria Thompson', type: 'artist', image: '/spotlight/artist-3.jpg', votes: 156 }
        ],
        songs: [
          { id: '4', title: 'Neon Dreams', type: 'song', image: '/spotlight/song-1.jpg', votes: 345 },
          { id: '5', title: 'Digital Sunrise', type: 'song', image: '/spotlight/song-2.jpg', votes: 298 },
          { id: '6', title: 'Electric Pulse', type: 'song', image: '/spotlight/song-3.jpg', votes: 276 }
        ],
        producers: [
          { id: '7', title: 'TechBeats Pro', type: 'producer', image: '/spotlight/producer-1.jpg', votes: 456 },
          { id: '8', title: 'SoundCraft Studio', type: 'producer', image: '/spotlight/producer-2.jpg', votes: 387 },
          { id: '9', title: 'AudioWave Labs', type: 'producer', image: '/spotlight/producer-3.jpg', votes: 298 }
        ]
      })
    }

    // Group data by type
    const groupedData = {
      artists: data?.filter((item: any) => item.type === 'artist') || [],
      songs: data?.filter((item: any) => item.type === 'song') || [],
      producers: data?.filter((item: any) => item.type === 'producer') || []
    }

    // Transform data to match expected format
    const transformedData = {
      artists: groupedData.artists.map((item: any) => ({
        id: item.id,
        title: item.title,
        type: item.type,
        image: item.image_url,
        votes: Array.isArray(item.votes) ? item.votes.length : 0
      })),
      songs: groupedData.songs.map((item: any) => ({
        id: item.id,
        title: item.title,
        type: item.type,
        image: item.image_url,
        votes: Array.isArray(item.votes) ? item.votes.length : 0
      })),
      producers: groupedData.producers.map((item: any) => ({
        id: item.id,
        title: item.title,
        type: item.type,
        image: item.image_url,
        votes: Array.isArray(item.votes) ? item.votes.length : 0
      }))
    }

    return NextResponse.json(transformedData)
  } catch (error) {
    console.error('Spotlight API error:', error)
    
    // Return fallback data on error
    return NextResponse.json({
      artists: [
        { id: '1', title: 'Luna Rodriguez', type: 'artist', image: '/spotlight/artist-1.jpg', votes: 234 },
        { id: '2', title: 'Marcus Chen', type: 'artist', image: '/spotlight/artist-2.jpg', votes: 187 },
        { id: '3', title: 'Aria Thompson', type: 'artist', image: '/spotlight/artist-3.jpg', votes: 156 }
      ],
      songs: [
        { id: '4', title: 'Neon Dreams', type: 'song', image: '/spotlight/song-1.jpg', votes: 345 },
        { id: '5', title: 'Digital Sunrise', type: 'song', image: '/spotlight/song-2.jpg', votes: 298 },
        { id: '6', title: 'Electric Pulse', type: 'song', image: '/spotlight/song-3.jpg', votes: 276 }
      ],
      producers: [
        { id: '7', title: 'TechBeats Pro', type: 'producer', image: '/spotlight/producer-1.jpg', votes: 456 },
        { id: '8', title: 'SoundCraft Studio', type: 'producer', image: '/spotlight/producer-2.jpg', votes: 387 },
        { id: '9', title: 'AudioWave Labs', type: 'producer', image: '/spotlight/producer-3.jpg', votes: 298 }
      ]
    })
  }
}