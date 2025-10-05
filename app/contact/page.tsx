'use client'

import { useState } from 'react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Option 1: Use mailto link
      const mailtoLink = `mailto:support@orinowo.com?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(`From: ${formData.email}\n\n${formData.message}`)}`
      window.location.href = mailtoLink

      // Option 2: API post (uncomment when API is ready)
      /*
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Failed to send message')
      */

      setIsSubmitted(true)
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const contactMethods = [
    {
      title: 'General Support',
      description: 'Get help with your account, billing, or technical issues',
      email: 'support@orinowo.com',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: 'Business Inquiries',
      description: 'Partnerships, licensing, and business opportunities',
      email: 'business@orinowo.com',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
        </svg>
      )
    },
    {
      title: 'Press & Media',
      description: 'Media inquiries, press releases, and interviews',
      email: 'press@orinowo.com',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15" />
        </svg>
      )
    }
  ]

  if (isSubmitted) {
    return (
      <div className="min-h-screen py-12 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-8">
            <svg className="w-16 h-16 text-green-400 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <h2 className="text-2xl font-bold text-white mb-4">Message Sent!</h2>
            <p className="text-gray-300 mb-6">
              Thank you for contacting us. We'll get back to you as soon as possible.
            </p>
            <button
              onClick={() => {
                setIsSubmitted(false)
                setFormData({ email: '', subject: '', message: '' })
              }}
              className="btn-primary"
            >
              Send Another Message
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Get in Touch
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Have questions, feedback, or need support? We're here to help you make the most of your Orinowo experience.
          </p>
        </div>

        {/* How it works (moved from dedicated page) */}
        <section className="mb-16 rounded-2xl border border-gold/20 bg-black/40 p-6">
          <h2 className="text-2xl font-bold text-white mb-4">How it works</h2>
          <ol className="list-decimal list-inside space-y-2 text-white/80">
            <li><span className="font-semibold text-white">Create:</span> Use the golden Generate button on the homepage to craft ideas fast.</li>
            <li><span className="font-semibold text-white">Collaborate:</span> Jam Rooms and Collab tools bring creators together.</li>
            <li><span className="font-semibold text-white">Release:</span> Premiere on Orinowo Video or distribute to DSPs via third‑party delivery.</li>
            <li><span className="font-semibold text-white">Compete:</span> Join challenges and competitions to win credits and exposure.</li>
          </ol>
          <p className="text-white/60 text-sm mt-3">Questions on any step? Send us a message below and we’ll help.</p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Send us a Message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-white mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-semibold text-white mb-2">
                  Subject
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                  required
                >
                  <option value="">Select a subject</option>
                  <option value="Technical Support">Technical Support</option>
                  <option value="Billing Question">Billing Question</option>
                  <option value="Feature Request">Feature Request</option>
                  <option value="Bug Report">Bug Report</option>
                  <option value="Business Inquiry">Business Inquiry</option>
                  <option value="Press Inquiry">Press Inquiry</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-white mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold resize-none"
                  placeholder="Tell us how we can help you..."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 ${
                  isSubmitting
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'btn-primary'
                }`}
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Contact Information</h2>
              <div className="space-y-6">
                {contactMethods.map((method, index) => (
                  <div key={index} className="bg-gray-900/50 rounded-xl border border-gray-800 p-6">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center text-gold mr-4">
                        {method.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">
                          {method.title}
                        </h3>
                        <p className="text-gray-400 text-sm mb-3">
                          {method.description}
                        </p>
                        <a
                          href={`mailto:${method.email}`}
                          className="text-gold hover:text-gold-light transition-colors font-medium"
                        >
                          {method.email}
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ Link */}
            <div className="bg-gradient-to-r from-gold/10 to-gold-dark/10 rounded-xl border border-gold/20 p-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                Looking for Quick Answers?
              </h3>
              <p className="text-gray-300 text-sm mb-4">
                Check out our comprehensive FAQ section for instant answers to common questions.
              </p>
              <button className="btn-secondary text-sm">
                Visit FAQ Section
              </button>
            </div>

            {/* Response Time */}
            <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                Response Times
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">General Support</span>
                  <span className="text-white">24-48 hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Technical Issues</span>
                  <span className="text-white">12-24 hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Business Inquiries</span>
                  <span className="text-white">2-3 business days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Press Inquiries</span>
                  <span className="text-white">1-2 business days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}