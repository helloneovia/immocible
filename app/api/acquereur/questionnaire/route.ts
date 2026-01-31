import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { BienType } from '@prisma/client'

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
    try {
        const user = await getCurrentUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const user = await getCurrentUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body: QuestionnaireData = await request.json()

        console.log('[API] Saving questionnaire for user:', user.id)

        // Map Frontend data to Prisma format

        // Convert typeBien strings to Enum values
        // Frontend: 'Appartement', 'Maison' -> Backend: 'appartement', 'maison'
        const validTypes = Object.values(BienType) as string[]
        const mappedTypes = body.typeBien
            .map(t => t.toLowerCase())
            .filter(t => validTypes.includes(t)) as BienType[]

        // Prepare JSON for extra fields
        const caracteristiques = {
            situationFamiliale: body.situationFamiliale,
            nombreEnfants: body.nombreEnfants,
            situationProfessionnelle: body.situationProfessionnelle,
            salaire: body.salaire,
            patrimoine: body.patrimoine,
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
            commentaires: body.commentaires,
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
            prixMin: parseFloat(body.budgetMin) || 0,
            prixMax: parseFloat(body.budgetMax) || 0,
            surfaceMin: parseFloat(body.surfaceMin) || null,
            surfaceMax: parseFloat(body.surfaceMax) || null,
            typeBien: mappedTypes,
            localisation: body.localisation || [],
            nombrePieces: body.nombrePieces || [],
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
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
