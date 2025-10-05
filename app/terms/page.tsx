'use client'

const sections = [
  { id: 'services', title: '1. Platform Services' },
  { id: 'distribution', title: '2. Distribution Services' },
  { id: 'competitions', title: '3. Competitions & Challenges' },
  { id: 'payments', title: '4. Subscription & Payments' },
  { id: 'ip', title: '5. Intellectual Property' },
  { id: 'liability', title: '6. Liability & Disclaimers' },
  { id: 'content', title: '7. Content Policy' },
  { id: 'disputes', title: '8. Dispute Resolution' },
  { id: 'changes', title: '9. Changes to Terms' },
  { id: 'termination', title: '10. Account Termination' },
  { id: 'transparency', title: '11. Transparency & Fairness' },
]

export default function TermsPage() {
  const today = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
  return (
    <main className="min-h-screen py-16">
      <div className="max-w-6xl mx-auto px-6">
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-gradient mb-2">Orinowo Terms of Service</h1>
          <p className="text-white/60">Last Updated: {today}</p>
        </header>

        <aside className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-10">
          <h2 className="text-white font-semibold mb-3">Table of Contents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            {sections.map(s => (
              <a key={s.id} href={`#${s.id}`} className="text-white/70 hover:text-gold transition-colors">{s.title}</a>
            ))}
          </div>
        </aside>

        <article className="prose prose-invert max-w-none">
          <section id="intro" className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-2">Introduction</h2>
            <p className="text-white/80">Welcome to Orinowo. These Terms of Service govern your use of our platform. By accessing or using Orinowo, you agree to these terms in full. Orinowo is a global music creation, collaboration, and distribution platform. We provide tools, community, and services to empower creators worldwide.</p>
          </section>

          <section id="services" className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-2">1. Platform Services</h2>
            <p className="text-white/80">We provide AI-powered music creation tools. All generated content is your intellectual property. Jam Rooms and collaboration features connect creators worldwide. Marketplace features enable creators to monetize their work. See our pricing page for commissions and fees.</p>
          </section>

          <section id="distribution" className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-2">2. Distribution Services</h2>
            <ul className="text-white/80 list-disc pl-5 space-y-1">
              <li>Annual distribution fee: approximately $40/year (2x standard industry rate), billed in USD (or local equivalent shown)</li>
              <li>Revenue split: 60% to you, 40% to Orinowo (streams on Orinowo-distributed releases)</li>
              <li>Orinowo Certified badge on approved releases</li>
              <li>Distribution time: 5-7 business days</li>
              <li>You must own all rights to submitted music; we may reject violating content</li>
            </ul>
          </section>

          <section id="competitions" className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-2">3. Competitions & Challenges</h2>
            <div className="text-white/80 space-y-2">
              <p>Entry fee is $5 per submission (localized equivalent). Prize pools are funded by entry fees.</p>
              <p className="font-semibold">3.2 Prize Structure</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>70% of total entry fees distributed among winners</li>
                <li>30% allocated to platform operations (judging, infrastructure, marketing, administration)</li>
              </ul>
              <p className="font-semibold">Winner distribution:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Grand Prize: 40% of total pool</li>
                <li>Second Place: 15% of total pool</li>
                <li>Third Place: 8% of total pool</li>
                <li>4th-5th Place: 3.5% each of total pool</li>
                <li>6th-10th Place: 1% each of total pool</li>
              </ul>
              <p className="font-semibold">Example:</p>
              <p>1,000 entries at $5 each = $5,000 total pool</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>$3,500 to winners (70%)</li>
                <li>$1,500 to operations (30%)</li>
              </ul>
              <p>Orinowo's operational allocation covers expert curation and judging, technical platform maintenance, competition marketing and promotion, prize distribution administration, and community support features.</p>
              <p>Judging: 50% curators, 50% community.</p>
              <div className="pt-3">
                <p className="font-semibold">3.5 Judging & Voting Process</p>
                <p className="mt-1">Competition winners are determined through a three-tier evaluation process:</p>
                <ul className="list-disc pl-5 space-y-1 mt-1">
                  <li><strong>Tier 1: Subscriber Voting (40%)</strong> — Only active paid subscribers (Rising Star tier and above) may vote; one vote per subscriber per competition.</li>
                  <li><strong>Tier 2: Expert Panel Review (40%)</strong> — Industry professionals evaluate originality, technical quality, theme adherence, and artistic merit.</li>
                  <li><strong>Tier 3: AI-Assisted Analysis (20%)</strong> — AI evaluates technical elements (production quality, mix balance, mastering, composition structure) to supplement human judgment.</li>
                </ul>
                <p className="mt-1">Final scoring: (Subscriber Votes × 40%) + (Expert Panel × 40%) + (AI Analysis × 20%).</p>
                <p className="mt-2 font-semibold">Tie-Breaking Authority</p>
                <p>In the event of tied final scores, Orinowo reserves the right to make a final determination based on brand alignment, content policy compliance, technical review, and community impact potential. Tie-breaking decisions are final and not subject to appeal. Orinowo may select co-winners or adjust prize distribution at its discretion.</p>
                <p className="mt-2 font-semibold">Anti-Manipulation Measures</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Vote manipulation, bot voting, or coordinated schemes may result in disqualification</li>
                  <li>Suspicious voting patterns may trigger manual review</li>
                  <li>Orinowo reserves the right to invalidate fraudulent votes</li>
                  <li>Multiple accounts per person are prohibited</li>
                </ul>
                <p className="mt-2 font-semibold">Reserved Rights</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Disqualify entries that violate content policy regardless of votes</li>
                  <li>Invalidate votes deemed fraudulent or manipulated</li>
                  <li>Adjust competition timelines or rules with notice</li>
                  <li>Cancel competitions and refund entries if circumstances require</li>
                  <li>Make final determinations in disputed situations</li>
                  <li>Withhold prizes from winners who violate Terms of Service</li>
                </ul>
                <p className="mt-2 font-semibold">Transparency Commitment</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Winning entries and scores published after competition close</li>
                  <li>General voting statistics shared (not individual votes)</li>
                  <li>Expert panel composition disclosed</li>
                  <li>AI evaluation criteria documented</li>
                </ul>
                <p className="mt-2 font-semibold">Disputes & Appeals</p>
                <p>Participants may request score clarification within 7 days of results. Orinowo will provide general feedback but detailed scores remain confidential. Final decisions are binding and not subject to external appeal. No refunds for entry fees based on disagreement with results.</p>
                <p className="mt-2">By entering a competition, you acknowledge and accept this judging process and Orinowo's final authority in all competition matters.</p>
              </div>
            </div>
          </section>

          <section id="payments" className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-2">4. Subscription & Payments</h2>
            <p className="text-white/80">Membership tiers and payment terms are described on our Plans page. Prices are shown in local currency and billed in USD. Automatic renewal unless cancelled. No refunds for partial periods.</p>
          </section>

          <section id="ip" className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-2">5. Intellectual Property</h2>
            <p className="text-white/80">You retain all rights to your creations. You grant Orinowo a license to host, display, and distribute content as needed to provide services. Orinowo branding and platform designs are our IP.</p>
          </section>

          <section id="liability" className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-2">6. Liability & Disclaimers</h2>
            <p className="text-white/80">We strive for high availability but do not guarantee uninterrupted service. We are not liable for third-party service changes, or indirect damages. Our total liability will not exceed the amount you paid in the past 12 months or $100, whichever is greater.</p>
          </section>

          <section id="content" className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-2">7. Content Policy</h2>
            <p className="text-white/80">Prohibited content includes copyright-infringing material, hate speech, or illegal activity. We reserve the right to remove violating content and suspend repeat offenders.</p>
          </section>

          <section id="disputes" className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-2">8. Dispute Resolution</h2>
            <p className="text-white/80">Governing law: England and Wales. Disputes proceed from negotiation to mediation to arbitration. Class actions are waived.</p>
          </section>

          <section id="changes" className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-2">9. Changes to Terms</h2>
            <p className="text-white/80">We may update these Terms. Material changes will be notified via email or in-product notification. Continued use implies acceptance.</p>
          </section>

          <section id="termination" className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-2">10. Account Termination</h2>
            <p className="text-white/80">You may close your account anytime. We may suspend or terminate accounts that violate these Terms.</p>
          </section>

          <section id="transparency" className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-2">11. Transparency & Fairness</h2>
            <p className="text-white/80">We believe in clear revenue splits, visible prize structures, and upfront pricing. Our goal is to empower creators globally.</p>
          </section>

          <section id="contact" className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-2">Contact</h2>
            <p className="text-white/80">Questions? Email legal@orinowo.com. For support: support@orinowo.com.</p>
          </section>
        </article>

        <div className="mt-10 flex items-center gap-3">
          <button className="btn-secondary" onClick={() => window.print()}>Print</button>
          <a href="#intro" className="btn-primary">Accept & Continue</a>
        </div>
      </div>
    </main>
  )
}
