import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { BienType } from '@prisma/client'
import { getT } from '@/lib/i18n/server'
import { isValidRange, parseNonNegativeNumber } from '@/lib/validation'

export const dynamic = 'force-dynamic';

// Drawn area: GeoJSON Polygon
interface DrawnAreaGeoJSON {
    type: 'Polygon'
    coordinates: [number, number][][]
}

// Interface matching the frontend state
interface QuestionnaireData {
    situationFamiliale: string
    nombreEnfants: string
    situationProfessionnelle: string
    typeBien: string[]
    budgetMin: string
    budgetMax: string
    surfaceMin: string
    surfaceMax: string
    nombrePieces: string[]
    localisation: string[]
    drawnArea: DrawnAreaGeoJSON | null
    quartiers: string[]

    balcon: boolean
    terrasse: boolean
    jardin: boolean
    parking: boolean
    cave: boolean
    ascenseur: boolean
    apport: string
    financement: string
    dureePret: string
    delaiRecherche: string
    flexibilite: string
    salaire: string

    patrimoine: string
    commentaires: string
}

export async function GET() {
    const t = getT()
    try {
        const user = await getCurrentUser()

        if (!user) {
            return NextResponse.json({ error: t('api.common.unauthorized') }, { status: 401 })
        }

        // Find the user's active search
        const recherche = await prisma.recherche.findFirst({
            where: {
                ownerId: user.id,
                isActive: true,
            },
            orderBy: {
                updatedAt: 'desc',
            },
        })

        if (!recherche) {
            return NextResponse.json({ data: null })
        }

        // Map Prisma data back to Frontend format
        let caracteristiques = (recherche.caracteristiques as any) || {}
        if (typeof caracteristiques === 'string') {
            try {
                caracteristiques = JSON.parse(caracteristiques)
            } catch (e) {
                console.error('[API] Failed to parse caracteristiques JSON', e)
                caracteristiques = {}
            }
        }

        // Helper to get value from caracteristiques or default
        const getVal = (key: string, def: any = '') => {
            if (caracteristiques && caracteristiques[key] !== undefined && caracteristiques[key] !== null) {
                return caracteristiques[key]
            }
            return def
        }

        const data: QuestionnaireData = {
            // Personal Info (Stored in JSON)
            situationFamiliale: getVal('situationFamiliale'),
            nombreEnfants: getVal('nombreEnfants'),
            situationProfessionnelle: getVal('situationProfessionnelle'),
            salaire: getVal('salaire'),
            patrimoine: getVal('patrimoine'),

            // Search Criteria
            typeBien: recherche.typeBien.map((t: string) => t.toLowerCase()), // Keep lowercase to match frontend values
            budgetMin: recherche.prixMin?.toString() || '',
            budgetMax: recherche.prixMax?.toString() || '',
            surfaceMin: recherche.surfaceMin?.toString() || '',
            surfaceMax: recherche.surfaceMax?.toString() || '',
            nombrePieces: recherche.nombrePieces || [],

            // Localisation
            localisation: recherche.localisation || [],
            drawnArea: getVal('drawnArea', null) as DrawnAreaGeoJSON | null,
            quartiers: getVal('quartiers', []) as string[],

            // Extra
            balcon: getVal('balcon', false),
            terrasse: getVal('terrasse', false),
            jardin: getVal('jardin', false),
            parking: getVal('parking', false),
            cave: getVal('cave', false),
            ascenseur: getVal('ascenseur', false),

            // Financement
            apport: getVal('apport'),
            financement: recherche.financement ?? getVal('financement'),
            dureePret: getVal('dureePret'),

            // Urgence
            delaiRecherche: getVal('delaiRecherche'),
            flexibilite: getVal('flexibilite'),
            commentaires: getVal('commentaires'),
        }

        return NextResponse.json({ data })
    } catch (error) {
        console.error('[API] Error fetching questionnaire:', error)
        return NextResponse.json({ error: t('api.common.serverError') }, { status: 500 })
    }
}

export async function POST(request: Request) {
    const t = getT()
    try {
        const user = await getCurrentUser()

        if (!user) {
            return NextResponse.json({ error: t('api.common.unauthorized') }, { status: 401 })
        }

        const body: QuestionnaireData = await request.json()

        // Budget et surface : nombres positifs, minimum inférieur ou égal au maximum.
        const budgetMin = parseNonNegativeNumber(body.budgetMin)
        const budgetMax = parseNonNegativeNumber(body.budgetMax)
        const surfaceMin = parseNonNegativeNumber(body.surfaceMin)
        const surfaceMax = parseNonNegativeNumber(body.surfaceMax)
        if (!isValidRange(budgetMin, budgetMax)) {
            return NextResponse.json({ error: t('api.validation.budgetRange') }, { status: 400 })
        }
        if (!isValidRange(surfaceMin, surfaceMax)) {
            return NextResponse.json({ error: t('api.validation.surfaceRange') }, { status: 400 })
        }
        const stringList = (value: unknown, max: number) =>
            Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string' && v.trim() !== '').slice(0, max) : []

        // Map Frontend data to Prisma format

        // Convert typeBien strings to Enum values
        // Frontend: 'Appartement', 'Maison' -> Backend: 'appartement', 'maison'
        const validTypes = Object.values(BienType) as string[]
        const mappedTypes = stringList(body.typeBien, 20)
            .map(t => t.toLowerCase())
            .filter(t => validTypes.includes(t)) as BienType[]

        // Prepare JSON for extra fields
        const caracteristiques = {
            situationFamiliale: body.situationFamiliale,
            nombreEnfants: body.nombreEnfants,
            situationProfessionnelle: body.situationProfessionnelle,
            salaire: body.salaire,
            patrimoine: body.patrimoine,
            drawnArea: body.drawnArea ?? null,
            quartiers: body.quartiers,
            balcon: body.balcon,
            terrasse: body.terrasse,
            jardin: body.jardin,
            parking: body.parking,
            cave: body.cave,
            ascenseur: body.ascenseur,
            apport: body.apport,
            dureePret: body.dureePret,
            delaiRecherche: body.delaiRecherche,
            flexibilite: body.flexibilite,
            commentaires: typeof body.commentaires === 'string' ? body.commentaires.slice(0, 2000) : body.commentaires,
        }

        // Sanitize object to remove undefined values and ensure pure JSON compatibility
        const cleanCaracteristiques = JSON.parse(JSON.stringify(caracteristiques))

        // Check if an active search already exists
        const existingRecherche = await prisma.recherche.findFirst({
            where: {
                ownerId: user.id,
                isActive: true
            }
        })

        let recherche

        const commonData = {
            prixMin: budgetMin || 0,
            prixMax: budgetMax || 0,
            surfaceMin: surfaceMin || null,
            surfaceMax: surfaceMax || null,
            typeBien: mappedTypes,
            localisation: stringList(body.localisation, 50),
            nombrePieces: stringList(body.nombrePieces, 20),
            financement: body.financement || null,
            caracteristiques: cleanCaracteristiques
        }

        if (existingRecherche) {
            // Update
            recherche = await prisma.recherche.update({
                where: { id: existingRecherche.id },
                data: commonData as any
            })
        } else {
            // Create
            recherche = await prisma.recherche.create({
                data: {
                    ...commonData,
                    ownerId: user.id,
                    isActive: true
                } as any
            })
        }

        return NextResponse.json({ success: true, id: recherche.id })

    } catch (error) {
        console.error('[API] Error saving questionnaire:', error)
        return NextResponse.json({ error: t('api.common.serverError') }, { status: 500 })
    }
}
