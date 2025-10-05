import { Metadata } from 'next'
import { convertPrice, getCurrencyName } from '@/lib/currency'
import Client from './plansClient'

export const metadata: Metadata = {
  title: "Pricing Plans | Orinowo - Premium AI Music Creation",
  description: "Choose the perfect plan for your music creation needs. From free to enterprise, find flexible pricing that scales with your creative ambitions.",
  keywords: ["music creation pricing", "AI music subscription", "professional music tools", "enterprise music solutions", "music production plans"],
  openGraph: {
    title: "Pricing Plans | Orinowo - Premium AI Music Creation",
    description: "Choose the perfect plan for your music creation needs. From free to enterprise solutions.",
    type: "website",
  },
}

const plans = [
  {
    name: 'Novice',
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
    name: 'Rising Star',
    price: 9.99,
    description: 'Great for hobbyists and beginners',
    features: [
      '25 tracks per month',
      'Advanced AI models',
      'High-quality exports',
      'Commercial licensing',
      'Priority support',
      'Custom templates'
    ],
  buttonText: 'Upgrade to Rising Star',
  buttonHref: '#',
    popular: false
  },
  {
    name: 'Master',
    price: 29.99,
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
  buttonText: 'Upgrade to Master',
  buttonHref: '#',
    popular: true
  },
  {
    name: 'Global Pioneer',
    price: 99.99,
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
  buttonText: 'Upgrade to Global Pioneer',
  buttonHref: '#',
    popular: false
  }
]

export default function PlansPage({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }) {
  const canceled = (searchParams?.canceled ?? '') === 'true'
  return <Client plans={plans} currency={getCurrencyName()} canceled={canceled} />
}