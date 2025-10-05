'use client'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-32 pb-20"><div className="container-custom max-w-2xl"><div className="card-glass p-12 text-center text-white/60">Loading…</div></div></div>}>
      <SuccessInner />
    </Suspense>
  )
}

function SuccessInner() {
  const searchParams = useSearchParams()
  const sessionId = searchParams ? searchParams.get('session_id') : null
  const [showBanner, setShowBanner] = useState(true)

  useEffect(() => {
    if (sessionId) {
      const t = setTimeout(() => setShowBanner(false), 5000)
      return () => clearTimeout(t)
    }
  }, [sessionId])

  return (
    <div className="min-h-screen pt-32 pb-20">
      {sessionId && showBanner && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 shadow-lg backdrop-blur">
            <p className="text-emerald-400 text-sm font-medium">Payment successful — your subscription is now active.</p>
          </div>
        </div>
      )}
      <div className="container-custom max-w-2xl">
        <div className="card-glass p-12 text-center">
          <div className="w-20 h-20 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-4">
            Welcome to Orinowo Premium!
          </h1>
          
          <p className="text-xl text-white/60 mb-8">
            Your subscription is now active. Start creating with unlimited AI tools.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Link href="/generate" className="btn-primary">
              Start Creating
            </Link>
            <Link href="/profile/loyalty" className="btn-secondary">
              View Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
