
import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../lib/auth'

const prisma = new PrismaClient()

async function main() {
    const email = 'admin@immocible.com'
    const password = 'adminpassword' // Change this in production

    const existingAdmin = await prisma.user.findUnique({
        where: { email }
    })

    if (existingAdmin) {
        console.log('Admin user already exists')
        return
    }

    const hashedPassword = await hashPassword(password)

    const admin = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            role: 'admin',
            profile: {
                create: {
                    nom: 'Admin',
                    prenom: 'System',
                }
            }
        }
    })

    console.log(`Admin created: ${admin.email}`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
