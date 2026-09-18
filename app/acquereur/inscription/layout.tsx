import type { Metadata } from 'next'
import { getT } from '@/lib/i18n/server'

export function generateMetadata(): Metadata {
  const t = getT()
  return {
    title: t('auth.buyerSignup.metaTitle'),
    description: t('auth.buyerSignup.metaDescription'),
    alternates: { canonical: '/acquereur/inscription' },
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
