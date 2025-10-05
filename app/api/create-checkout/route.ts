import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

// Initialize Stripe with error handling
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
})

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not set')
      return NextResponse.json(
        { error: 'Stripe is not configured. Please contact support.' },
        { status: 500 }
      )
    }

    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      console.error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set')
      return NextResponse.json(
        { error: 'Stripe is not configured. Please contact support.' },
        { status: 500 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { priceId, tier } = body

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      )
    }

    // Get the app URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 
                   process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
                   'http://localhost:3000'

    console.log('Creating checkout session with:', {
      priceId,
      tier,
      appUrl,
      hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
      hasPublishableKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    })

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/plans?canceled=true`,
      metadata: {
        tier: tier || 'unknown',
      },
    })

    console.log('Checkout session created successfully:', session.id)

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    })

  } catch (error: any) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create checkout session',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
