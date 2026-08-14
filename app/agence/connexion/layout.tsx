import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Connexion agence',
  description: 'Accédez à votre espace agence partenaire IMMOCIBLE.',
  alternates: { canonical: '/agence/connexion' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
