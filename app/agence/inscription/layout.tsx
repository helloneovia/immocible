import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Inscription agence partenaire',
  description:
    "Rejoignez le réseau IMMOCIBLE et accédez à une base d'acquéreurs qualifiés et sérieux pour vos biens off-market.",
  alternates: { canonical: '/agence/inscription' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
