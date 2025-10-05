"use client"

import { ReactNode, useEffect } from 'react'

export function Modal({ open, onClose, title, children, footer }: { open: boolean; onClose: () => void; title?: string; children: ReactNode; footer?: ReactNode }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (open) {
      document.addEventListener('keydown', onKey)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full max-w-xl mx-4 rounded-2xl bg-black border border-gold/20 shadow-2xl">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="text-white font-semibold">{title}</div>
          <button aria-label="Close" onClick={onClose} className="text-white/60 hover:text-white">✕</button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-white/10">{footer}</div>}
      </div>
    </div>
  )
}
