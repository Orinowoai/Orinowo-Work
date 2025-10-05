// Subscription and credits plans config for Orinowo growth engine
export type PlanId = 'free' | 'creator' | 'pro' | 'studio'

export interface Plan {
  id: PlanId
  name: string
  monthlyPriceGBP: number
  yearlyPriceGBP: number
  monthlyCredits: number
  features: string[]
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: 'free',
    name: 'Free',
    monthlyPriceGBP: 0,
    yearlyPriceGBP: 0,
    monthlyCredits: 25,
    features: [
      'Basic AI prompts',
      '2 Jam Rooms/week',
      'Watermarked exports',
      '720p previews',
    ],
  },
  creator: {
    id: 'creator',
    name: 'Creator',
    monthlyPriceGBP: 7,
    yearlyPriceGBP: 70,
    monthlyCredits: 200,
    features: [
      'No watermark',
      'Queue priority',
      'Basic mastering (2/mo)',
      'Spotlight eligibility',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    monthlyPriceGBP: 19,
    yearlyPriceGBP: 190,
    monthlyCredits: 800,
    features: [
      'Unlimited Jam Rooms',
      'Advanced vocal tools',
      'Mastering (8/mo)',
      'Marketplace fee reduced -2%',
    ],
  },
  studio: {
    id: 'studio',
    name: 'Studio',
    monthlyPriceGBP: 49,
    yearlyPriceGBP: 490,
    monthlyCredits: 2500,
    features: [
      'Team seats (3)',
      'Priority support',
      'Early AI access',
      'Marketplace fee reduced -5%',
    ],
  },
}

export const CREDIT_PACKS = [
  { credits: 200, priceGBP: 9 },
  { credits: 600, priceGBP: 24 },
  { credits: 1500, priceGBP: 55 },
]
