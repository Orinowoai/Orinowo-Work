import Link from 'next/link'

const plans = [
  {
    name: 'Free',
    price: 0,
    description: 'Perfect for trying out Orinowo',
    features: [
      '3 tracks per month',
      'Basic AI models',
      'Standard quality exports',
      'Community forum access',
      'Basic customer support'
    ],
    buttonText: 'Start Creating',
    buttonHref: '/generate',
    popular: false
  },
  {
    name: 'Starter',
    price: 9,
    description: 'Great for hobbyists and beginners',
    features: [
      '25 tracks per month',
      'Advanced AI models',
      'High-quality exports',
      'Commercial licensing',
      'Priority support',
      'Custom templates'
    ],
    buttonText: 'Upgrade to Starter',
    buttonHref: process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_STARTER || '#',
    popular: false
  },
  {
    name: 'Pro',
    price: 29,
    description: 'Perfect for serious creators',
    features: [
      '100 tracks per month',
      'Premium AI models',
      'Luxury-grade exports',
      'Extended commercial licensing',
      'Dedicated support manager',
      'Custom AI training',
      'Collaboration tools',
      'Advanced mixing controls'
    ],
    buttonText: 'Upgrade to Pro',
    buttonHref: process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_PRO || '#',
    popular: true
  },
  {
    name: 'Elite',
    price: 59,
    description: 'For professionals and studios',
    features: [
      'Unlimited tracks',
      'Exclusive AI models',
      'Studio-grade exports',
      'Full commercial licensing',
      '24/7 premium support',
      'White-label options',
      'API access',
      'Custom integrations',
      'Team collaboration',
      'Priority feature requests'
    ],
    buttonText: 'Upgrade to Elite',
    buttonHref: process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_ELITE || '#',
    popular: false
  }
]

export default function PlansPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Choose Your Perfect Plan
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            From hobbyists to professionals, we have the right plan to unleash your creative potential with AI-powered music generation.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-gray-900/50 rounded-2xl border transition-all duration-300 hover:scale-105 ${
                plan.popular
                  ? 'border-gold shadow-lg shadow-gold/20'
                  : 'border-gray-800 hover:border-gold/40'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-gold to-gold-dark text-black px-4 py-1 rounded-full text-sm font-bold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="p-8">
                {/* Plan Header */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
                  <div className="mb-4">
                    <span className="text-5xl font-bold text-white">${plan.price}</span>
                    <span className="text-gray-400 text-lg">/month</span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg
                        className="w-5 h-5 text-gold mt-0.5 mr-3 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                {plan.name === 'Free' ? (
                  <Link
                    href={plan.buttonHref}
                    className={`w-full block text-center py-3 rounded-lg font-semibold transition-all duration-200 ${
                      plan.popular
                        ? 'btn-primary'
                        : 'btn-secondary'
                    }`}
                  >
                    {plan.buttonText}
                  </Link>
                ) : (
                  <a
                    href={plan.buttonHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full block text-center py-3 rounded-lg font-semibold transition-all duration-200 ${
                      plan.popular
                        ? 'btn-primary'
                        : 'btn-secondary'
                    }`}
                  >
                    {plan.buttonText}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-gray-900/50 rounded-lg border border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                Can I change plans anytime?
              </h3>
              <p className="text-gray-400">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, 
                and you'll be charged or credited proportionally.
              </p>
            </div>

            <div className="bg-gray-900/50 rounded-lg border border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                What happens to my tracks if I downgrade?
              </h3>
              <p className="text-gray-400">
                All previously created tracks remain accessible in your account. However, your monthly 
                creation limit will adjust to your new plan's allowance.
              </p>
            </div>

            <div className="bg-gray-900/50 rounded-lg border border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                Do you offer refunds?
              </h3>
              <p className="text-gray-400">
                We offer a 14-day money-back guarantee for all paid plans. If you're not completely 
                satisfied, contact our support team for a full refund.
              </p>
            </div>

            <div className="bg-gray-900/50 rounded-lg border border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                Can I use the music commercially?
              </h3>
              <p className="text-gray-400">
                Starter, Pro, and Elite plans include commercial licensing. Free plan tracks are for 
                personal use only. Check your plan details for specific licensing terms.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}