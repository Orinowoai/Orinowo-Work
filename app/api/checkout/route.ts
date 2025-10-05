import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'

function envOrThrow(name: string) {
  const v = process.env[name]
  if (!v) throw new Error(`${name} is not set`)
  return v
}

export async function POST(req: NextRequest) {
  try {
    const { plan, email }: { plan: 'Starter' | 'Pro' | 'Elite'; email?: string } = await req.json()
    if (!plan) return NextResponse.json({ error: 'Missing plan' }, { status: 400 })

    const stripe = getStripe()
    const priceId = {
      Starter: envOrThrow('STRIPE_PRICE_ID_STARTER'),
      Pro: envOrThrow('STRIPE_PRICE_ID_PRO'),
      Elite: envOrThrow('STRIPE_PRICE_ID_ELITE'),
    }[plan]

    const successUrl = envOrThrow('STRIPE_SUCCESS_URL')
    const cancelUrl = envOrThrow('STRIPE_CANCEL_URL')

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: email || undefined,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
    })

    return NextResponse.json({ url: session.url })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Checkout failed' }, { status: 500 })
  }
}
