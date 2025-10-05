import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Contact Us | Orinowo - Connect with Our Team",
  description: "Get in touch with Orinowo's team for partnerships, support, or business inquiries. We're here to help creators and enterprises succeed with AI music technology.",
  keywords: ["contact orinowo", "business inquiries", "partnership opportunities", "customer support", "enterprise solutions", "music tech support"],
  openGraph: {
    title: "Contact Us | Orinowo - Connect with Our Team",
    description: "Get in touch with Orinowo's team for partnerships, support, or business inquiries. We're here to help creators succeed.",
    type: "website",
  },
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}