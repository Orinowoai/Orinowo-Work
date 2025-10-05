'use client'

import { useEffect, useState } from 'react'
import { convertPrice } from '@/lib/currency'

export default function CurrencyClient({ amount, suffix }: { amount: number; suffix?: string }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return (
    <span className="text-gold font-bold">
      {mounted ? convertPrice(amount) : `$${amount.toFixed(2)}`}
      {suffix ? <span className="text-white/60 text-sm">{suffix}</span> : null}
    </span>
  )
}
