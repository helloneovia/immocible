import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { TrackingProvider } from '@/components/providers/TrackingProvider'
import { CookieConsent } from '@/components/CookieConsent'
import { CapacitorHardwareBack } from '@/components/CapacitorHardwareBack'
import { CapacitorNativeShell } from '@/components/CapacitorNativeShell'
import { NativePushEnabler } from '@/components/NativePushEnabler'

const inter = Inter({ subsets: ['latin'] })

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://immocible.com'

const description =
  "IMMOCIBLE connecte les acquéreurs qualifiés avec des opportunités immobilières off-market exclusives. Définissez votre projet, notre réseau d'agences partenaires vous propose les biens qui correspondent — avant tout le monde."

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "IMMOCIBLE — Le moteur de recherche inversé de l'immobilier",
    template: '%s | IMMOCIBLE',
  },
  description,
  applicationName: 'IMMOCIBLE',
  keywords: [
    'immobilier',
    'off-market',
    'recherche inversée',
    'acquéreur',
    'agence immobilière',
    'bien immobilier',
    'matching immobilier',
  ],
  authors: [{ name: 'IMMOCIBLE' }],
  creator: 'IMMOCIBLE',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: siteUrl,
    siteName: 'IMMOCIBLE',
    title: "IMMOCIBLE — Le moteur de recherche inversé de l'immobilier",
    description,
  },
  twitter: {
    card: 'summary_large_image',
    title: "IMMOCIBLE — Le moteur de recherche inversé de l'immobilier",
    description,
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  themeColor: '#0B1F38',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <AuthProvider>
          <TrackingProvider />
          <CapacitorHardwareBack />
          <CapacitorNativeShell />
          <NativePushEnabler />
          {children}
          <CookieConsent />
        </AuthProvider>
      </body>
    </html>
  )
}
