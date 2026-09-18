import { NextResponse } from 'next/server'
import { getLegalDocument, isLegalSlug } from '@/lib/legal'
import { getLocale, getT } from '@/lib/i18n/server'

export const dynamic = 'force-dynamic'

/** Page légale résolue, lue par l'application mobile pour un affichage natif. */
export async function GET(_request: Request, { params }: { params: { slug: string } }) {
    if (!isLegalSlug(params.slug)) {
        return NextResponse.json({ error: getT()('common.legal.notFound') }, { status: 404 })
    }
    const document = await getLegalDocument(params.slug, getLocale())
    return NextResponse.json(document, { headers: { 'Cache-Control': 'public, max-age=60', Vary: 'X-Immocible-Lang, Cookie' } })
}
