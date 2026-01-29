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
    nombrePieces: string
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
        const getVal = (key: string, def: any = '') => caracteristiques[key] !== undefined ? caracteristiques[key] : def

        console.log('[API GET] Raw Search Data:', {
            id: recherche.id,
            piecesMin: recherche.nombrePiecesMin,
            caracteristiquesType: typeof recherche?.caracteristiques,
            caracteristiques: caracteristiques
        })

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
            nombrePieces: getVal('nombrePieces') || (recherche.nombrePiecesMin ? (recherche.nombrePiecesMin >= 6 ? '6' : recherche.nombrePiecesMin.toString()) : ''),

            // Localisation
            localisation: recherche.zones || [],
            quartiers: getVal('quartiers', []),

            // Extra
            balcon: getVal('balcon', false),
            terrasse: getVal('terrasse', false),
            jardin: getVal('jardin', false),
            parking: getVal('parking', false),
            cave: getVal('cave', false),
            ascenseur: getVal('ascenseur', false),

            // Financement
            apport: getVal('apport'),
            financement: getVal('financement'),
            dureePret: getVal('dureePret'),

            // Urgence
            delaiRecherche: getVal('delaiRecherche'),
            flexibilite: getVal('flexibilite'),
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
        console.log('[API] Incoming pieces:', body.nombrePieces, 'Financement:', body.financement)

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
            financement: body.financement,
            dureePret: body.dureePret,
            delaiRecherche: body.delaiRecherche,
            flexibilite: body.flexibilite,
            nombrePieces: String(body.nombrePieces || ''), // Ensure string storage
        }

        // Sanitize object to remove undefined values and ensure pure JSON compatibility
        const cleanCaracteristiques = JSON.parse(JSON.stringify(caracteristiques))

        console.log('[API POST] Saving caracteristiques:', JSON.stringify(cleanCaracteristiques, null, 2))
        console.log('[API POST] nombrePiecesMin to save:', parseInt(body.nombrePieces) || null)

        // Check if an active search already exists
        const existingRecherche = await prisma.recherche.findFirst({
            where: {
                ownerId: user.id,
                isActive: true
            }
        })

        let recherche

        const commonData = {
            prixMin: parseFloat(body.budgetMin) || 0, // Should this be null? Schema says Float?
            prixMax: parseFloat(body.budgetMax) || 0,
            surfaceMin: parseFloat(body.surfaceMin) || null,
            surfaceMax: parseFloat(body.surfaceMax) || null,
            typeBien: mappedTypes,
            // Assuming body.localisation is a string array like ["Paris", "Lyon"]
            zones: body.localisation || [],
            // If "quartiers" are present, we could append them or store separate.
            // For standard "Recherche" model, zones usually means searchable areas.
            // Parse integers safely
            nombrePiecesMin: (body.nombrePieces && !isNaN(parseInt(body.nombrePieces))) ? parseInt(body.nombrePieces) : null,
            caracteristiques: cleanCaracteristiques
        }

        if (existingRecherche) {
            // Update
            recherche = await prisma.recherche.update({
                where: { id: existingRecherche.id },
                data: commonData
            })
        } else {
            // Create
            recherche = await prisma.recherche.create({
                data: {
                    ...commonData,
                    ownerId: user.id,
                    isActive: true
                }
            })
        }

        return NextResponse.json({ success: true, id: recherche.id })

    } catch (error) {
        console.error('[API] Error saving questionnaire:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
