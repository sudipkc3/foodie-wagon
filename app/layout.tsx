import type React from "react"
import type { Metadata, Viewport } from "next"
import { Oswald, Playfair_Display } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "sonner"
import "./globals.css"

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
})

export const metadata: Metadata = {
  metadataBase: new URL('https://foodiewagon.de'),
  title: {
    default: 'Bloom & Batter | Cakes made for your moments',
    template: '%s | Bloom & Batter'
  },
  description:
    "Freshly crafted cakes, custom designs, and delicious treats made to order in Ingolstadt.",
  keywords: [
    "cakes ingolstadt",
    "custom cakes",
    "birthday cakes",
    "bakery ingolstadt",
    "same day cake",
    "cake delivery"
  ],
  authors: [{ name: 'Bloom & Batter' }],
  creator: 'Bloom & Batter',
  publisher: 'Bloom & Batter',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'Bloom & Batter | Cakes made for your moments',
    description: 'Freshly crafted cakes and custom designs made to order in Ingolstadt.',
    url: 'https://foodiewagon.de',
    siteName: 'The Foodie Wagon',
    locale: 'de_DE',
    type: 'website',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1200&h=630&q=80',
        width: 1200,
        height: 630,
        alt: 'Bloom & Batter celebration cake',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bloom & Batter | Cakes made for your moments',
    description: 'Freshly crafted cakes and custom designs made to order in Ingolstadt.',
    images: ['https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1200&h=630&q=80'],
  },
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
  icons: {
    icon: '/icon.svg',
    apple: '/apple-icon.png',
  },
  manifest: '/site.webmanifest',
    generator: 'v0.app'
}

export const viewport: Viewport = {
  themeColor: "#fbf8f3",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="canonical" href="https://foodiewagon.de" />
      </head>
      <body className={`${oswald.variable} ${playfair.variable} font-sans antialiased`}>
        {children}
        <Toaster position="bottom-right" richColors closeButton duration={3500} />
        <Analytics />
      </body>
    </html>
  )
}
