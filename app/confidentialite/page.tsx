import type { Metadata } from 'next'
import { LegalDocumentView } from '@/components/layout/LegalShell'
import { getLegalDocument, LEGAL_DOCUMENTS } from '@/lib/legal'

// Contenu modifiable depuis l'admin (Paramètres › Informations légales) : rendu à chaque requête.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: LEGAL_DOCUMENTS['confidentialite'].title,
  description: LEGAL_DOCUMENTS['confidentialite'].description,
  alternates: { canonical: '/confidentialite' },
}

export default async function ConfidentialitePage() {
  return <LegalDocumentView document={await getLegalDocument('confidentialite')} />
}
