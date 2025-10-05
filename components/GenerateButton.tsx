'use client'

import { Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useRef, useState } from 'react'

type Props = {
  intenseParticles?: boolean
}

export default function GenerateButton({ intenseParticles = false }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [glowPos, setGlowPos] = useState({ x: 0.5, y: 0.5 })

  const onMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const rect = wrapRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    setGlowPos({ x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) })
  }

  return (
    <div className="flex flex-col items-center gap-6 my-16">
      {/* Magnetic Generate Button */}
      <div ref={wrapRef} onMouseMove={onMove} className="relative group">
  {/* Pulsing ring animation */}
  <div className="pointer-events-none absolute -inset-4 rounded-full bg-gold/20 animate-ping" />
  <div className="pointer-events-none absolute -inset-2 rounded-full bg-gold/30 animate-pulse" />

        {/* Cursor glow following mouse */}
        <div
          className="pointer-events-none absolute -inset-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 mix-blend-screen"
          style={{
            background: `radial-gradient(180px 180px at ${glowPos.x * 100}% ${glowPos.y * 100}%, rgba(212,175,55,0.35), transparent 60%)`,
            filter: 'blur(10px)'
          }}
          aria-hidden
        />

        {/* Main button */}
        <Link
          aria-label="Generate AI music now"
          href="/generate"
          className="relative w-[160px] h-[160px] md:w-[200px] md:h-[200px] rounded-full bg-gradient-to-br from-gold via-gold-light to-gold-dark
                     flex flex-col items-center justify-center gap-3
                     transform transition-all duration-500 ease-out
                     hover:scale-110 hover:rotate-2
                     shadow-[0_0_50px_rgba(212,175,55,0.5),inset_0_2px_20px_rgba(255,255,255,0.3),0_20px_60px_rgba(0,0,0,0.3)]
                     hover:shadow-[0_0_80px_rgba(212,175,55,0.8),inset_0_2px_20px_rgba(255,255,255,0.4),0_30px_80px_rgba(0,0,0,0.4)]
                     animate-pulse-gentle cursor-pointer group-hover:animate-none focus:outline-none focus:ring-4 focus:ring-gold/50 focus:ring-offset-2 focus:ring-offset-black
                     before:content-[''] before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-br before:from-white/40 before:to-transparent before:opacity-60
                     after:content-[''] after:absolute after:inset-0 after:rounded-full after:animate-spin-slow after:bg-gradient-to-r after:from-transparent after:via-white/30 after:to-transparent"
        >
          <Sparkles className="w-16 h-16 md:w-20 md:h-20 text-black animate-bounce-subtle relative z-10" />
          <div className="text-center relative z-10">
            <p className="text-black font-black text-2xl md:text-3xl tracking-widest">GENERATE</p>
            <p className="text-black/80 font-semibold text-sm tracking-wide">Start Creating</p>
          </div>
        </Link>

        {/* Subtle orbiting particles */}
        <div className="pointer-events-none" aria-hidden="true">
          {/* Base orbits */}
          <div className="absolute inset-0 rounded-full animate-orbit-slow">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-gold/80 blur-[1px] animate-twinkle" />
          </div>
          <div className="absolute inset-0 rounded-full animate-orbit-mid">
            <span className="absolute top-1/3 -right-3 w-1.5 h-1.5 rounded-full bg-gold/70 animate-twinkle" />
          </div>
          <div className="absolute inset-0 rounded-full animate-orbit-fast">
            <span className="absolute bottom-2 left-6 w-1.5 h-1.5 rounded-full bg-gold/60 animate-twinkle" />
          </div>

          {/* Intense mode: additional particles */}
          {intenseParticles && (
            <>
              <div className="absolute inset-0 rounded-full animate-orbit-mid">
                <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-gold/70 animate-twinkle" />
              </div>
              <div className="absolute inset-0 rounded-full animate-orbit-fast">
                <span className="absolute top-6 left-8 w-[6px] h-[6px] rounded-full bg-gold/60 blur-[0.5px] animate-twinkle" />
              </div>
              <div className="absolute inset-0 rounded-full animate-orbit-slow">
                <span className="absolute top-10 right-10 w-[5px] h-[5px] rounded-full bg-gold/70 animate-twinkle" />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Compelling micro-copy */}
      <p className="text-gold/70 text-sm font-light tracking-wide animate-fade-in">
        3 clicks away from your first masterpiece
      </p>
    </div>
  )
}
