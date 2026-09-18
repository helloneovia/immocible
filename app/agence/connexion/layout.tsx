import type { Metadata } from 'next'
import { getT } from '@/lib/i18n/server'

export function generateMetadata(): Metadata {
  const t = getT()
  return {
    title: t('auth.agencyLogin.metaTitle'),
    description: t('auth.agencyLogin.metaDescription'),
    alternates: { canonical: '/agence/connexion' },
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
