const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('Dumping DB content for Verification...')

    // Find the user used in the test
    const user = await prisma.user.findUnique({
        where: { email: 'test_persist@example.com' }
    })

    if (!user) {
        console.log('User test_persist@example.com not found.')
        return
    }

    console.log(`Found User: ${user.email} (${user.id})`)
    const search = await prisma.recherche.findFirst({
        where: { ownerId: user.id },
        orderBy: { updatedAt: 'desc' }
    })

    if (search) {
        console.log(`Active Search ID: ${search.id}`)
        console.log(`--- COLUMN VALUES ---`)
        console.log(`nombrePieces (Column):`, search.nombrePieces)
        console.log(`financement (Column):`, search.financement)

        console.log(`--- JSON VALUES ---`)
        let c = search.caracteristiques
        if (typeof c === 'string') c = JSON.parse(c)
        console.log(`nombrePieces (JSON):`, c ? c.nombrePieces : 'undefined')
        console.log(`financement (JSON):`, c ? c.financement : 'undefined')
    } else {
        console.log('No active search found for this user.')
    }
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect())
