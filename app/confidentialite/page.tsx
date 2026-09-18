import type { Metadata } from 'next'
import { LegalDocumentView } from '@/components/layout/LegalShell'
import { getLegalDocument, getLegalMeta } from '@/lib/legal'
import { getLocale } from '@/lib/i18n/server'

// Contenu modifiable depuis l'admin (Paramètres › Informations légales) : rendu à chaque requête.
export const dynamic = 'force-dynamic'

export function generateMetadata(): Metadata {
  const { title, description } = getLegalMeta('confidentialite', getLocale())
  return {
    title,
    description,
    alternates: { canonical: '/confidentialite' },
  }
}

export default async function ConfidentialitePage() {
  return <LegalDocumentView document={await getLegalDocument('confidentialite', getLocale())} />
}
