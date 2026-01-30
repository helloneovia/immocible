import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Removing old price_unlock_profile setting...')

    const deleted = await prisma.systemSetting.deleteMany({
        where: {
            key: 'price_unlock_profile'
        }
    })

    console.log(`Deleted ${deleted.count} old settings`)

    console.log('Ensuring new setting exists...')
    await prisma.systemSetting.upsert({
        where: { key: 'price_unlock_profile_percentage' },
        update: {},
        create: {
            key: 'price_unlock_profile_percentage',
            value: '1',
            type: 'number',
            label: 'Prix Déblocage Profil (%)',
            description: 'Pourcentage du budget max de l\'acquéreur (ex: 1 = 1%, 0.5 = 0.5%).'
        }
    })

    console.log('Migration complete!')
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
