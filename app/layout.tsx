import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { TrackingProvider } from '@/components/providers/TrackingProvider'
import { CookieConsent } from '@/components/CookieConsent'
import { CapacitorHardwareBack } from '@/components/CapacitorHardwareBack'
import { CapacitorNativeShell } from '@/components/CapacitorNativeShell'
import { NativePushEnabler } from '@/components/NativePushEnabler'
import { I18nProvider } from '@/lib/i18n/client'
import { getLocale, getT } from '@/lib/i18n/server'

const inter = Inter({ subsets: ['latin'] })

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://immocible.com'

export function generateMetadata(): Metadata {
  const t = getT()
  const locale = getLocale()
  const title = t('home.meta.title')
  const description = t('home.meta.description')
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      template: '%s | IMMOCIBLE',
    },
    description,
    applicationName: 'IMMOCIBLE',
    keywords: t('home.meta.keywords').split(','),
    authors: [{ name: 'IMMOCIBLE' }],
    creator: 'IMMOCIBLE',
    alternates: { canonical: '/' },
    openGraph: {
      type: 'website',
      locale: locale === 'en' ? 'en_GB' : 'fr_FR',
      url: siteUrl,
      siteName: 'IMMOCIBLE',
      title,
      description,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
  }
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
  const locale = getLocale()
  return (
    <html lang={locale}>
      <body className={inter.className}>
        <I18nProvider locale={locale}>
        <AuthProvider>
          <TrackingProvider />
          <CapacitorHardwareBack />
          <CapacitorNativeShell />
          <NativePushEnabler />
          {children}
          <CookieConsent />
        </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  )
}
