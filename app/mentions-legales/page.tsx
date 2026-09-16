import type { Metadata } from 'next'
import { LegalDocumentView } from '@/components/layout/LegalShell'
import { getLegalDocument, LEGAL_DOCUMENTS } from '@/lib/legal'

// Contenu modifiable depuis l'admin (Paramètres › Informations légales) : rendu à chaque requête.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: LEGAL_DOCUMENTS['mentions-legales'].title,
  description: LEGAL_DOCUMENTS['mentions-legales'].description,
  alternates: { canonical: '/mentions-legales' },
}

export default async function MentionsLegalesPage() {
  return <LegalDocumentView document={await getLegalDocument('mentions-legales')} />
}
