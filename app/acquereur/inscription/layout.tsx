import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Inscription acquéreur — Gratuit',
  description:
    "Créez votre profil acquéreur en quelques minutes et recevez des opportunités immobilières off-market correspondant à vos critères. 100 % gratuit pour les acquéreurs.",
  alternates: { canonical: '/acquereur/inscription' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
