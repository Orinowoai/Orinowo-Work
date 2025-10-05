import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Merchandise | Orinowo - Premium Music Creator Apparel",
  description: "Express your creativity with exclusive Orinowo merchandise. Premium quality apparel and accessories for music creators and AI enthusiasts.",
  keywords: ["music merchandise", "creator apparel", "AI music gear", "premium hoodies", "music tech accessories", "orinowo merch"],
  openGraph: {
    title: "Merchandise | Orinowo - Premium Music Creator Apparel",
    description: "Express your creativity with exclusive Orinowo merchandise. Premium quality apparel and accessories for music creators.",
    type: "website",
  },
}

export default function MerchLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}