const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('Dumping DB content...')

    // Find the user used in the test
    const user = await prisma.user.findUnique({
        where: { email: 'test_persist_02@example.com' }
    })

    if (!user) {
        console.log('User test_persist_02@example.com not found. Trying to find any user with active search.')
        const users = await prisma.user.findMany({ include: { recherches: true }, take: 5 })
        users.forEach(u => {
            console.log(`User: ${u.email}`)
            u.recherches.forEach(r => {
                console.log(`  Recherche ${r.id}:`)
                console.log(`    nombrePiecesMin (Col):`, r.nombrePiecesMin)
                console.log(`    caracteristiques (Json):`, JSON.stringify(r.caracteristiques, null, 2))
            })
        })
        return
    }

    console.log(`Found User: ${user.email} (${user.id})`)
    const search = await prisma.recherche.findFirst({
        where: { ownerId: user.id },
        orderBy: { updatedAt: 'desc' }
    })

    if (search) {
        console.log(`Active Search ID: ${search.id}`)
        console.log(`nombrePiecesMin (Column):`, search.nombrePiecesMin)
        console.log(`caracteristiques (JSON):`, JSON.stringify(search.caracteristiques, null, 2))

        let c = search.caracteristiques
        if (typeof c === 'string') c = JSON.parse(c)

        console.log('--- Value Check ---')
        console.log('nombrePieces in JSON:', c.nombrePieces)
        console.log('financement in JSON:', c.financement)
    } else {
        console.log('No active search found for this user.')
    }
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect())
