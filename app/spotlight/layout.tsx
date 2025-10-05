import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Spotlight | Orinowo - Discover Top AI Music Creators",
  description: "Explore featured artists, producers, and tracks created with AI. Vote for your favorites and discover the next generation of music creators on Orinowo.",
  keywords: ["music spotlight", "AI music artists", "featured creators", "music competition", "trending tracks", "music voting"],
  openGraph: {
    title: "Spotlight | Orinowo - Discover Top AI Music Creators",
    description: "Explore featured artists, producers, and tracks created with AI. Vote for your favorites and discover the next generation of music creators.",
    type: "website",
  },
}

export default function SpotlightLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}