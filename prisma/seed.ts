
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('Seeding database...')

    // Seed FREETRIAL Coupon
    const freeTrialCode = 'FREETRIAL'
    const freeTrial = await prisma.coupon.findUnique({
        where: { code: freeTrialCode }
    })

    if (!freeTrial) {
        await prisma.coupon.create({
            data: {
                code: freeTrialCode,
                discountType: 'FREE_TRIAL',
                discountValue: 30, // 30 days
                planType: 'monthly',
                isActive: true,
                maxUses: null // Unlimited
            }
        })
        console.log(`Created coupon: ${freeTrialCode}`)
    } else {
        console.log(`Coupon ${freeTrialCode} already exists.`)
    }

    // Add other seeds here if needed
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
