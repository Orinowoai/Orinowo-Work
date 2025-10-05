import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PerformanceMonitor } from "@/components/performance";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://orinowo.com'),
  title: {
    default: 'Orinowo - Premium AI Music Generation Platform',
    template: '%s | Orinowo'
  },
  description: "Where global music begins. Create, collaborate, and innovate with AI-powered tools trusted by thousands of creators worldwide.",
  keywords: [
    "AI music creation", "premium music platform", "artificial intelligence music", 
    "music generation", "professional music tools", "AI composition", "music technology",
    "creative collaboration", "music innovation", "digital audio workstation", "music production",
    "audio creation", "music startup", "venture capital music tech", "enterprise music solutions"
  ],
  authors: [{ name: "Orinowo Team" }],
  creator: "Orinowo",
  publisher: "Orinowo",
  category: "Music Technology",
  classification: "Business",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://orinowo.com",
    title: "Orinowo | Premium AI Music Creation Platform",
    description: "Where global music begins. Create, collaborate, and innovate with AI-powered tools trusted by thousands of creators worldwide.",
    siteName: "Orinowo",
    images: [
      {
        url: "/brand/logo-full.png",
        width: 500,
        height: 500,
        alt: "Orinowo - Premium AI Music Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@orinowo",
    creator: "@orinowo",
    title: "Orinowo | Premium AI Music Creation Platform",
    description: "Where global music begins. Create, collaborate, and innovate with AI-powered tools trusted by thousands of creators worldwide.",
    images: ["/brand/logo-full.png"],
  },
  icons: {
    icon: "/brand/logo-favicon.png",
    apple: "/brand/logo-favicon.png",
    shortcut: "/brand/logo-favicon.png",
  },
  manifest: "/site.webmanifest",
  alternates: {
    canonical: "https://orinowo.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://orinowo.com/#organization",
        "name": "Orinowo",
        "description": "Premium AI Music Creation Platform where global music begins",
        "url": "https://orinowo.com",
        "logo": {
          "@type": "ImageObject",
          "url": "https://orinowo.com/brand/logo-full.png",
          "width": 500,
          "height": 500
        },
        "foundingDate": "2024",
        "industry": "Music Technology",
        "numberOfEmployees": "11-50",
        "sameAs": [
          "https://twitter.com/orinowo",
          "https://linkedin.com/company/orinowo"
        ]
      },
      {
        "@type": "WebSite",
        "@id": "https://orinowo.com/#website",
        "url": "https://orinowo.com",
        "name": "Orinowo",
        "description": "Where global music begins. Create, collaborate, and innovate with AI-powered tools.",
        "publisher": {
          "@id": "https://orinowo.com/#organization"
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://orinowo.com/search?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "SoftwareApplication",
        "@id": "https://orinowo.com/#software",
        "name": "Orinowo AI Music Platform",
        "description": "Professional AI-powered music creation and collaboration platform",
        "url": "https://orinowo.com",
        "applicationCategory": "MultimediaApplication",
        "operatingSystem": "Web Browser",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
          "category": "SaaS"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "ratingCount": "1200",
          "bestRating": "5"
        }
      }
    ]
  };

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className={`${inter.className} page-transition`}>
        <PerformanceMonitor />
        <div className="min-h-screen flex flex-col relative overflow-x-hidden">
          {/* Background effects */}
          <div className="fixed inset-0 -z-10">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-600/5 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
          </div>
          
          <Header />
          <main className="flex-grow relative z-10">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
