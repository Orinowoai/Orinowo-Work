"use client"

import { Modal } from './Modal'
import { useState } from 'react'

export function useComingSoon() {
  const [open, setOpen] = useState(false)
  const Btn = ({ children = 'Coming soon', className = '', ...props }: any) => (
    <button {...props} onClick={() => setOpen(true)} className={className}>{children}</button>
  )
  const ModalEl = (
    <Modal open={open} onClose={() => setOpen(false)} title="Coming soon">
      <p className="text-white/80">This feature is not yet available. We’re polishing it for release. Check back shortly!</p>
    </Modal>
  )
  return { ComingSoonButton: Btn, ComingSoonModal: ModalEl, open, setOpen }
}
