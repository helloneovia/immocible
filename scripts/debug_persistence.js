const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('Running persistence debug test...')

    // 1. Setup Data similar to what frontend sends
    const body = {
        nombrePieces: "3", // String "3" sent from frontend
        financement: "pret-bancaire",
        budgetMin: "200000",
        budgetMax: "300000",
        surfaceMin: "40",
        typeBien: ["appartement"]
    }

    console.log('Input Body:', body)

    // 2. Simulate POST Logic (copied from new explicit-columns route.ts)
    const caracteristiques = {
        // ... (other fields only)
    }

    // Clean
    const cleanCaracteristiques = JSON.parse(JSON.stringify(caracteristiques))

    console.log('Logic: Saving caracteristiques (should be empty of core fields):', cleanCaracteristiques)

    // Create dummy user
    const email = `debug_${Date.now()}@test.com`
    const user = await prisma.user.create({
        data: {
            email,
            password: 'hashedpassword',
            role: 'acquereur'
        }
    })

    // Create Recherche with logic from route.ts
    const commonData = {
        prixMin: parseFloat(body.budgetMin) || 0,
        prixMax: parseFloat(body.budgetMax) || 0,
        surfaceMin: parseFloat(body.surfaceMin) || null,
        // nombrePiecesMin IS GONE.
        nombrePieces: body.nombrePieces, // Direct column
        financement: body.financement,   // Direct column
        caracteristiques: cleanCaracteristiques,
        typeBien: ['appartement'],
        localisation: []
    }

    const recherche = await prisma.recherche.create({
        data: {
            ...commonData,
            ownerId: user.id,
            isActive: true
        }
    })

    console.log('Saved Recherche ID:', recherche.id)
    console.log('Saved DB nombrePieces:', recherche.nombrePieces)
    console.log('Saved DB financement:', recherche.financement)
    console.log('Saved DB caracteristiques:', JSON.stringify(recherche.caracteristiques, null, 2))


    // 3. Simulate GET Logic (copied from new explicit-columns route.ts)
    // Fetch fresh from DB
    const fetchedRecherche = await prisma.recherche.findUnique({ where: { id: recherche.id } })

    const mappedData = {
        nombrePieces: fetchedRecherche.nombrePieces,
        financement: fetchedRecherche.financement,
    }

    console.log('--------------------------------')
    console.log('MAPPED DATA RESULTS:')
    console.log('nombrePieces (Expected "3"):', mappedData.nombrePieces)
    console.log('financement (Expected "pret-bancaire"):', mappedData.financement)

    if (mappedData.nombrePieces === "3" && mappedData.financement === "pret-bancaire") {
        console.log('SUCCESS: Values persisted and retrieved correctly.')
    } else {
        console.log('FAILURE: Values did not match.')
    }
}

main()
    .catch(e => {
        console.error(e)
        // process.exit(1) // Don't exit process in tool call if possible, or handle gracefully
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
