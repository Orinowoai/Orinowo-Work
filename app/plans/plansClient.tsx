"use client"

import { useEffect, useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { convertPrice, getCurrencyName } from '@/lib/currency'

type Plan = {
  name: string
  price: number
  description: string
  features: string[]
  buttonText: string
  buttonHref: string
  popular: boolean
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

// Hardcoded Stripe Price IDs (USD) per request
const STRIPE_PRICE_IDS = {
  starter: 'price_1SD7j9CbycES077rvYXSHBdJ',
  pro: 'price_1SD7rVCbycES077r6bZ4ggoP',
  elite: 'price_1SD81BCbycES077rCENKMudO',
}

if (typeof window !== 'undefined') {
  // eslint-disable-next-line no-console
  console.log('Stripe Price IDs (USD):', STRIPE_PRICE_IDS)
}

export default function Client({ plans, currency, canceled = false }: { plans: Plan[]; currency: string; canceled?: boolean }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const handleUpgrade = async (tier: string, priceId: string) => {
    try {
      setLoading(true)
      setError('')

      if (!priceId) {
        throw new Error('Price ID not configured for this plan. Please contact support.')
      }

      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, tier }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to create checkout session')
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL returned')
      }
    } catch (err: any) {
      console.error('Checkout error:', err)
      setError(err.message || 'Checkout temporarily unavailable. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">Choose Your Perfect Plan</h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">From hobbyists to professionals, we have the right plan to unleash your creative potential with AI-powered music generation.</p>
        </div>

        {(error || canceled) && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 mb-6">
            {canceled && <p className="text-red-500 text-sm mb-1">Checkout was canceled. No charges were made.</p>}
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan) => (
            <div key={plan.name} className={`relative bg-gray-900/50 rounded-2xl border transition-all duration-300 hover:scale-105 ${plan.popular ? 'border-gold shadow-lg shadow-gold/20' : 'border-gray-800 hover:border-gold/40'}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-gold to-gold-dark text-black px-4 py-1 rounded-full text-sm font-bold">Most Popular</span>
                </div>
              )}
              <div className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
                  <div className="mb-1">
                    <span className="text-5xl font-bold text-white">{mounted ? convertPrice(plan.price) : `$${plan.price.toFixed(2)}`}</span>
                    <span className="text-gray-400 text-lg">/month</span>
                  </div>
                  <div className="text-white/40 text-xs">Prices shown in {mounted ? getCurrencyName() : 'USD'}. Billed in USD.</div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start">
                      <svg className="w-5 h-5 text-gold mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                      <span className="text-gray-300 text-sm">{f}</span>
                    </li>
                  ))}
                </ul>
                {plan.price === 0 ? (
                  <a href="/generate" className={`w-full block text-center py-3 rounded-lg font-semibold transition-all duration-200 ${plan.popular ? 'btn-primary' : 'btn-secondary'}`}>{plan.buttonText}</a>
                ) : (
                  <button
                    disabled={loading}
                    onClick={() => {
                      const priceId =
                        plan.name === 'Rising Star'
                          ? STRIPE_PRICE_IDS.starter
                          : plan.name === 'Master'
                          ? STRIPE_PRICE_IDS.pro
                          : STRIPE_PRICE_IDS.elite
                      const tierLabel = plan.name
                      handleUpgrade(tierLabel, priceId)
                    }}
                    className={`w-full block text-center py-3 rounded-lg font-semibold transition-all duration-200 ${plan.popular ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    {loading ? 'Processing...' : plan.buttonText}
                  </button>
                )}
                {/* per-card error can be added if needed */}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Frequently Asked Questions</h2>
          </div>
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-gray-900/50 rounded-lg border border-gray-800 p-6"><h3 className="text-lg font-semibold text-white mb-3">Can I change plans anytime?</h3><p className="text-gray-400">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and you'll be charged or credited proportionally.</p></div>
            <div className="bg-gray-900/50 rounded-lg border border-gray-800 p-6"><h3 className="text-lg font-semibold text-white mb-3">What happens to my tracks if I downgrade?</h3><p className="text-gray-400">All previously created tracks remain accessible in your account. However, your monthly creation limit will adjust to your new plan's allowance.</p></div>
            <div className="bg-gray-900/50 rounded-lg border border-gray-800 p-6"><h3 className="text-lg font-semibold text-white mb-3">Do you offer refunds?</h3><p className="text-gray-400">We offer a 14-day money-back guarantee for all paid plans. If you're not completely satisfied, contact our support team for a full refund.</p></div>
            <div className="bg-gray-900/50 rounded-lg border border-gray-800 p-6"><h3 className="text-lg font-semibold text-white mb-3">Can I use the music commercially?</h3><p className="text-gray-400">Starter, Pro, and Elite plans include commercial licensing. Free plan tracks are for personal use only. Check your plan details for specific licensing terms.</p></div>
          </div>
        </div>
      </div>

      {/* No legacy modal; pure Stripe checkout. */}
    </div>
  )
}
