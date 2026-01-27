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
    localisation: string
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
        const caracteristiques = (recherche.caracteristiques as any) || {}

        // Helper to get value from caracteristiques or default
        const getVal = (key: string, def: any = '') => caracteristiques[key] !== undefined ? caracteristiques[key] : def

        const data: QuestionnaireData = {
            // Personal Info (Stored in JSON)
            situationFamiliale: getVal('situationFamiliale'),
            nombreEnfants: getVal('nombreEnfants'),
            situationProfessionnelle: getVal('situationProfessionnelle'),

            // Search Criteria
            typeBien: recherche.typeBien.map((t: string) => t.toLowerCase().charAt(0).toUpperCase() + t.slice(1).toLowerCase()), // Capitalize first letter
            budgetMin: recherche.prixMin?.toString() || '',
            budgetMax: recherche.prixMax?.toString() || '',
            surfaceMin: recherche.surfaceMin?.toString() || '',
            surfaceMax: recherche.surfaceMax?.toString() || '',
            nombrePieces: recherche.nombrePiecesMin?.toString() || '',

            // Localisation
            localisation: recherche.zones && recherche.zones.length > 0 ? recherche.zones[0] : '', // Assuming first zone is the main city
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
        }

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
            // Assuming body.localisation is a single string like "Paris", we put it in zones array
            // If "quartiers" are present, we could append them or store separate.
            // For standard "Recherche" model, zones usually means searchable areas.
            zones: body.localisation ? [body.localisation] : [],
            nombrePiecesMin: parseInt(body.nombrePieces) || null,
            caracteristiques: caracteristiques
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
