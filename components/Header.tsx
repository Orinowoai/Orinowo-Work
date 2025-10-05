'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navItems = [
    { href: '/spotlight', label: 'Spotlight', icon: '⭐' },
    { href: '/blog', label: 'Blog', icon: '📚' },
    { href: '/competitions', label: 'Competitions', icon: '🏆' },
    { href: '/merch', label: 'Merch', icon: '🛍️' },
  ]

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-deep-black/80 backdrop-blur-xl border-b border-gold/30 shadow-2xl shadow-black/50' : 'bg-transparent border-b border-gold/10'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className={`w-14 h-14 bg-gradient-to-br from-gold via-gold-light to-gold-dark rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-500 shadow-glow hover:shadow-lg ${scrolled ? 'animate-glow' : ''}`}>
              <span className="text-black font-bold text-2xl group-hover:rotate-12 transition-transform duration-300">✧</span>
            </div>
            <div>
              <span className="text-white font-bold text-3xl tracking-tight text-gradient group-hover:text-glow transition-all duration-500">Orinowo</span>
              <div className="text-xs text-gold/70 tracking-widest uppercase font-semibold">Premium AI Music</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="group relative px-5 py-3 text-slate-300 hover:text-white transition-all duration-500 font-semibold tracking-wide hover:scale-105">
                <span className="flex items-center gap-2.5">
                  <span className="text-sm group-hover:scale-110 transition-transform duration-300">{item.icon}</span>
                  {item.label}
                </span>
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-gold to-gold-light group-hover:w-full transition-all duration-500 shadow-glow"></div>
              </Link>
            ))}
            <div className="ml-8 flex items-center gap-4">
              <Link href="/plans" className="btn-primary text-sm px-6 py-2.5 hover-glow hover:scale-105 transition-all duration-300">✨ Upgrade</Link>
            </div>
          </nav>

          {/* Mobile menu button */}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden p-2 rounded-2xl bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 text-slate-300 hover:text-gold hover:border-gold/40 focus:outline-none transition-all duration-300 hover-glow">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className={`lg:hidden transition-all duration-300 overflow-hidden ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-4 py-6 space-y-2 border-t border-gold/20 bg-slate-900/80 backdrop-blur-xl rounded-b-2xl mt-4">
            {[...navItems, { href: '/profile/loyalty', label: 'Loyalty', icon: '💠' }].map((item) => (
              <Link key={item.href} href={item.href} className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-gold hover:bg-gold/10 rounded-xl transition-all duration-500 font-semibold tracking-wide hover:scale-105 transform" onClick={() => setIsMenuOpen(false)}>
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            ))}
            <div className="pt-4 space-y-3">
              <Link href="/plans" className="block btn-primary text-center hover-glow" onClick={() => setIsMenuOpen(false)}>
                ✨ Upgrade to Pro
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}