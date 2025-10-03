'use client'

import { useState } from 'react'
import Image from 'next/image'

const products = [
  {
    id: 1,
    name: 'Orinowo Premium Hoodie',
    category: 'Apparel',
    price: '$89',
    image: '/merch/hoodie.jpg',
    description: 'Premium black hoodie with golden Buddha logo embroidered on chest'
  },
  {
    id: 2,
    name: 'Orinowo Signature Tee',
    category: 'Apparel',
    price: '$49',
    image: '/merch/tee.jpg',
    description: 'Comfortable cotton tee with gold Buddha design'
  },
  {
    id: 3,
    name: 'Orinowo Coffee Mug',
    category: 'Accessories',
    price: '$29',
    image: '/merch/mug.jpg',
    description: 'Premium ceramic mug with golden Buddha logo'
  },
  {
    id: 4,
    name: 'Orinowo Snapback Hat',
    category: 'Accessories',
    price: '$39',
    image: '/merch/hat.jpg',
    description: 'Black snapback with embroidered golden Buddha logo'
  },
  {
    id: 5,
    name: 'Orinowo Art Poster',
    category: 'Art',
    price: '$59',
    image: '/merch/poster.jpg',
    description: 'Framed art print featuring Buddha and Orinowo branding'
  },
  {
    id: 6,
    name: 'Orinowo Tote Bag',
    category: 'Accessories',
    price: '$45',
    image: '/merch/tote.jpg',
    description: 'Eco-friendly tote bag with golden Buddha print'
  }
]

export default function MerchPage() {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIsSubmitted(true)
    } catch (error) {
      console.error('Error joining waitlist:', error)
    }
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Orinowo Merchandise
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Elevate your studio and style with premium merchandise designed for the modern music creator. Coming soon.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-gray-900/50 rounded-xl border border-gray-800 hover:border-gold/40 transition-all duration-300 overflow-hidden group"
            >
              {/* Product Image */}
              <div className="relative aspect-square bg-gray-800">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-gray-600 text-center">
                    <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm">Product Image</span>
                  </div>
                </div>
                
                {/* Coming Soon Badge */}
                <div className="absolute top-4 right-4 bg-gold text-black px-3 py-1 rounded-full text-sm font-bold">
                  Coming Soon
                </div>
              </div>

              {/* Product Info */}
              <div className="p-6">
                <div className="mb-2">
                  <span className="text-xs text-gold uppercase tracking-wide font-semibold">
                    {product.category}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {product.name}
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gold">
                    {product.price}
                  </span>
                  <button
                    disabled
                    className="bg-gray-700 text-gray-400 px-4 py-2 rounded-lg font-semibold cursor-not-allowed"
                  >
                    Notify Me
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Waitlist Section */}
        <div className="bg-gradient-to-r from-gold/10 to-gold-dark/10 rounded-2xl border border-gold/20 p-8 md:p-12 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Be the First to Know
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join our exclusive waitlist to get early access to limited-edition merchandise and special member pricing.
          </p>

          {!isSubmitted ? (
            <form onSubmit={handleWaitlistSubmit} className="max-w-md mx-auto">
              <div className="flex gap-4 mb-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                  required
                />
                <button
                  type="submit"
                  className="btn-primary whitespace-nowrap"
                >
                  Join Waitlist
                </button>
              </div>
              <p className="text-sm text-gray-400">
                We'll notify you when merchandise becomes available. No spam, ever.
              </p>
            </form>
          ) : (
            <div className="max-w-md mx-auto">
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6 mb-4">
                <svg className="w-12 h-12 text-green-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <h3 className="text-xl font-bold text-white mb-2">You're In!</h3>
                <p className="text-gray-300">
                  Thanks for joining our waitlist. We'll send you an email as soon as merchandise becomes available.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Why Choose Orinowo Merchandise?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Premium Quality</h3>
              <p className="text-gray-400">
                Every product is carefully crafted with attention to detail and premium materials.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Limited Edition</h3>
              <p className="text-gray-400">
                Exclusive designs and limited quantities make each piece special and collectible.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Creator-Inspired</h3>
              <p className="text-gray-400">
                Designed by and for music creators who understand the needs of modern producers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}