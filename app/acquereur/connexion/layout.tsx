import type { Metadata } from 'next'
import { getT } from '@/lib/i18n/server'

export function generateMetadata(): Metadata {
  const t = getT()
  return {
    title: t('auth.buyerLogin.metaTitle'),
    description: t('auth.buyerLogin.metaDescription'),
    alternates: { canonical: '/acquereur/connexion' },
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
