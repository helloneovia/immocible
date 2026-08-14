import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Connexion acquéreur',
  description: 'Accédez à votre espace acquéreur IMMOCIBLE.',
  alternates: { canonical: '/acquereur/connexion' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
