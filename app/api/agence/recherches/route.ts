import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET() {
    try {
        const session = await getSession()

        if (!session || !session.user || session.user.role !== 'agence') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Fetch all active searches (buyer profiles)
        // We include user logic to make sure we get real profiles
        const recherches = await prisma.recherche.findMany({
            where: {
                isActive: true,
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        email: true,
                        profile: {
                            select: {
                                nom: true,
                                prenom: true,
                                telephone: true,
                                ville: true,
                            }
                        }
                    }
                }
            },
            orderBy: {
                updatedAt: 'desc'
            }
        })

        return NextResponse.json({ success: true, count: recherches.length, data: recherches })
    } catch (error) {
        console.error('Error fetching recherches:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
