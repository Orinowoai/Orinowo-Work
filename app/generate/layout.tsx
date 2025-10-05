import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "AI Music Generator | Orinowo - Create Music Instantly",
  description: "Transform your ideas into professional music with AI. Generate tracks, melodies, and beats in seconds using our advanced music creation platform.",
  keywords: ["AI music generator", "create music online", "music composition AI", "instant music creation", "AI beats", "music generation tool"],
  openGraph: {
    title: "AI Music Generator | Orinowo - Create Music Instantly",
    description: "Transform your ideas into professional music with AI. Generate tracks, melodies, and beats in seconds.",
    type: "website",
  },
}

export default function GenerateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}