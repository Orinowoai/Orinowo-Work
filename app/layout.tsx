import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Orinowo - Premium AI Music Platform",
  description: "Create luxury-grade tracks in seconds with AI-powered music generation. Join the premium music creation revolution.",
  keywords: ["AI music", "music generation", "luxury tracks", "premium music", "AI composition"],
  authors: [{ name: "Orinowo Team" }],
  creator: "Orinowo",
  publisher: "Orinowo",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://orinowo.com",
    title: "Orinowo - Premium AI Music Platform",
    description: "Create luxury-grade tracks in seconds with AI-powered music generation.",
    siteName: "Orinowo",
  },
  twitter: {
    card: "summary_large_image",
    title: "Orinowo - Premium AI Music Platform",
    description: "Create luxury-grade tracks in seconds with AI-powered music generation.",
  },
  icons: {
    icon: "/brand/logo-favicon.png",
    apple: "/brand/logo-favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} page-transition`}>
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
