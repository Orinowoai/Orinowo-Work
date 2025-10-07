import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { entry_id } = await request.json()

    if (!entry_id) {
      return NextResponse.json(
        { error: 'Entry ID is required' },
        { status: 400 }
      )
    }

    // Check for duplicate votes (basic implementation)
    // In production, you'd want to track user sessions or require authentication
    const userIP = request.ip || 'unknown'
    
    const supabase = getServiceSupabase()
    const { data: existingVote } = await supabase
      .from('votes')
      .select('id')
      .eq('entry_id', entry_id)
      .eq('user_ip', userIP)
      .single()

    if (existingVote) {
      return NextResponse.json(
        { error: 'You have already voted for this entry' },
        { status: 409 }
      )
    }

    // Insert new vote
    const { data, error } = await supabase
      .from('votes')
      .insert([
        {
          entry_id,
          user_ip: userIP,
          created_at: new Date().toISOString()
        }
      ])
      .select()

    if (error) {
      if (error) console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to record vote' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Vote API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}