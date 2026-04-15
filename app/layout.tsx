import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { TrackingProvider } from '@/components/providers/TrackingProvider'
import { CapacitorHardwareBack } from '@/components/CapacitorHardwareBack'
import { CapacitorNativeShell } from '@/components/CapacitorNativeShell'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "IMMOCIBLE - Le moteur de recherche inverse de l'immobilier",
  description: 'Plateforme de matching acquéreurs → opportunités immobilières qualifiées',
}

export const dynamic = 'force-dynamic'

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
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
