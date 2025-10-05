export const dynamic = 'force-static'

export default function LegacyPartnersPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-6">
          <h1 className="text-5xl sm:text-7xl font-black bg-clip-text text-transparent bg-gradient-to-br from-gold to-gold-dark">Orinowo is Inevitable</h1>
          <p className="text-xl text-white/80">This is not funding. This is legacy partnership.</p>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-5xl mx-auto px-6 space-y-6">
          <h2 className="text-2xl font-bold text-gradient">Where Global Music Begins</h2>
          <p className="text-white/80 leading-relaxed text-lg">
            100+ countries. 20+ languages. 1M+ creators. The global cultural standard. Every track, every collaboration, every breakthrough—begins here.
          </p>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[{k:'$142B',d:'Creator Economy'},{k:'12%',d:'Annual Market Growth'},{k:'50M+',d:'Global Music Creators'},{k:'Moat',d:'Network Effects + Cultural Identity'}].map(i => (
            <div key={i.k} className="rounded-2xl p-[2px] bg-gradient-to-br from-gold/60 to-gold-dark/30">
              <div className="rounded-2xl h-full w-full bg-black p-6 border border-gold/20">
                <div className="text-3xl font-black text-gold">{i.k}</div>
                <div className="text-white/70">{i.d}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-5xl mx-auto px-6 space-y-6">
          <h3 className="text-xl font-bold text-white/90">The Position</h3>
          <p className="text-white/80 leading-relaxed text-lg">
            We don&apos;t compete with DSPs. We control what they fight over. Spotify and Apple Music distribute. Orinowo creates. Whoever owns creation controls the future. DSPs will pay for access. They have no choice.
          </p>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 space-y-4 text-center">
          <p className="text-white/80">Legacy partnerships are invitation-only.</p>
          <p className="text-white/80">If you recognize inevitability, you know how to reach us.</p>
          <p className="text-gold">partnerships@orinowo.com</p>
          <div className="h-px w-32 bg-gold/60 mx-auto my-6" />
          <div className="text-white/60 text-sm">Orinowo © 2025 ✧</div>
        </div>
      </section>
    </main>
  )
}
