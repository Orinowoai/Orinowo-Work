export default function Forbidden() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center p-8 rounded-2xl border border-gold/20 bg-black/50">
        <h1 className="text-3xl font-bold text-gold mb-2">403 — Forbidden</h1>
        <p className="text-white/70">You do not have access to this page.</p>
      </div>
    </div>
  )
}
