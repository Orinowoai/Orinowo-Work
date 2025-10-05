"use client"

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'

type DistType = 'spotify' | 'apple' | 'video'

export function DistributionModal({ open, onClose, type, userId }: { open: boolean; onClose: () => void; type: DistType; userId?: string }) {
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [audioUrl, setAudioUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const label = type === 'video' ? 'Orinowo Video Premiere' : type === 'spotify' ? 'DSP Distribution — Spotify' : 'DSP Distribution — Apple Music'

  async function submit() {
    setLoading(true)
    setMsg(null)
    try {
      const res = await fetch('/api/distribution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, title, artist, audioUrl, userId }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed')
      setMsg('Submitted. We will review and follow up by email.')
    } catch (e: any) {
      setMsg(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={label} footer={
      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="btn-secondary">Close</button>
        <button onClick={submit} disabled={loading || !title || !artist || !audioUrl} className="btn-primary">{loading ? 'Submitting…' : 'Submit'}</button>
      </div>
    }>
      <div className="space-y-4">
        <div>
          <label className="block text-white/80 text-sm mb-1">Track title</label>
          <input value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-white" placeholder="Song name" />
        </div>
        <div>
          <label className="block text-white/80 text-sm mb-1">Artist name</label>
          <input value={artist} onChange={e => setArtist(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-white" placeholder="Artist" />
        </div>
        <div>
          <label className="block text-white/80 text-sm mb-1">Audio URL</label>
          <input value={audioUrl} onChange={e => setAudioUrl(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-white" placeholder="https://... .mp3" />
        </div>
        <p className="text-white/50 text-xs">Submission implies agreement to our <a href="/terms" className="text-gold underline">Terms</a>. DSP names are used for identification only; distribution via third-party delivery.</p>
        {msg && <div className="text-white/80 text-sm">{msg}</div>}
      </div>
    </Modal>
  )
}
