import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { hasActiveSubscription, subscriptionRequiredResponse } from '@/lib/subscription'
import { getT } from '@/lib/i18n/server'

export async function GET() {
    const t = getT()
    try {
        const session = await getSession()

        if (!session || !session.user || session.user.role !== 'agence') {
            return NextResponse.json({ error: t('api.common.unauthorized') }, { status: 401 })
        }

        // Seules les agences abonnées (paiement validé, période en cours) accèdent aux acquéreurs.
        if (!hasActiveSubscription(session.user.profile)) {
            return subscriptionRequiredResponse()
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
                        // email: false, // Hidden
                        profile: {
                            select: {
                                nom: true,
                                prenom: true,
                                // telephone: false, // Hidden
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
            { error: t('api.common.serverError') },
            { status: 500 }
        )
    }
}
