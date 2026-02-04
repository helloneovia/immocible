
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function main() {
    console.log('Seeding test user...')

    const email = 'test_map_user@example.com'
    const password = 'Password123!'
    const hashedPassword = await bcrypt.hash(password, 10)

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
        where: { email }
    })

    if (existingUser) {
        console.log(`User ${email} already exists. Updating password...`)
        await prisma.user.update({
            where: { email },
            data: { password: hashedPassword }
        })
        console.log('Password updated.')
    } else {
        await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role: 'acquereur',
                profile: {
                    create: {
                        nom: 'Test',
                        prenom: 'User',
                        subscriptionStatus: 'ACTIVE'
                    }
                }
            }
        })
        console.log(`User ${email} created.`)
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
