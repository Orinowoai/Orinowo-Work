import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-black border-t border-gold/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-gold to-gold-dark rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-lg">O</span>
              </div>
              <span className="text-white font-bold text-xl tracking-tight">
                Orinowo
              </span>
            </Link>
            <p className="text-slate-300 text-sm max-w-md leading-relaxed font-light">
              Create luxury-grade tracks in seconds with AI-powered music generation. 
              Join the premium music creation revolution.
            </p>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <div className="space-y-2">
              <Link
                href="/privacy"
                className="block text-slate-400 hover:text-gold transition-colors duration-300 text-sm font-medium"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="block text-slate-400 hover:text-gold transition-colors duration-300 text-sm font-medium"
              >
                Terms of Service
              </Link>
              <Link
                href="/terms"
                className="block text-slate-400 hover:text-gold transition-colors duration-300 text-sm font-medium"
              >
                Terms of Service
              </Link>
            </div>
          </div>

          {/* Contact Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Connect</h3>
            <div className="space-y-2">
              <Link
                href="/contact"
                className="block text-slate-400 hover:text-gold transition-colors duration-300 text-sm font-medium"
              >
                Contact Us
              </Link>
              <Link
                href="/press"
                className="block text-slate-400 hover:text-gold transition-colors duration-300 text-sm font-medium"
              >
                Press Kit
              </Link>
            </div>
          </div>

          {/* Language Selector (placeholder) */}
          <div>
            <h3 className="text-white font-semibold mb-4">Language</h3>
            <div className="space-y-2">
              <button className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-gold hover:border-gold/40 transition-all">English ▼</button>
            </div>
          </div>
        </div>

        <div className="border-t border-gold/20 mt-10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-slate-400 text-sm font-medium">
              © {currentYear} Orinowo. All rights reserved.
            </p>
            <div>
              <p className="text-slate-400 text-sm font-light tracking-wide">
                Crafted with precision for premium music creation
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}