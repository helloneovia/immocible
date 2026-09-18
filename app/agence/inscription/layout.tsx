import type { Metadata } from 'next'
import { getT } from '@/lib/i18n/server'

export function generateMetadata(): Metadata {
  const t = getT()
  return {
    title: t('auth.agencySignup.metaTitle'),
    description: t('auth.agencySignup.metaDescription'),
    alternates: { canonical: '/agence/inscription' },
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
