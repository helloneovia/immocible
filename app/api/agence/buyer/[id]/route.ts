import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { getAppSettings } from '@/lib/settings'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const buyerId = params.id
        const currentUser = await getCurrentUser()

        if (!currentUser || currentUser.role !== 'agence') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check unlock status
        let unlocked = null
        try {
            unlocked = await prisma.unlockedProfile.findUnique({
                where: {
                    agencyId_buyerId: {
                        agencyId: currentUser.id,
                        buyerId: buyerId
                    }
                }
            })
        } catch (e) {
            console.warn('Failed to check unlock status (possibly stale schema):', e)
            // Default to locked if schema mismatch
            unlocked = null
        }

        // Fetch Buyer & Search
        const buyer = await prisma.user.findUnique({
            where: { id: buyerId },
            include: {
                profile: true,
                recherches: {
                    where: { isActive: true },
                    orderBy: { updatedAt: 'desc' },
                    take: 1
                }
            }
        })

        if (!buyer) {
            return NextResponse.json({ error: 'Buyer not found' }, { status: 404 })
        }

        const search = buyer.recherches[0]

        // Calculate unlock price
        const settings = await getAppSettings()
        const price = search?.prixMax
            ? Math.max(1, Math.round(search.prixMax * settings.price_unlock_profile_percentage))
            : 0

        // Prepare response
        const data = {
            unlocked: !!unlocked,
            price,
            search: search || null,
            profile: {
                // Always show basic info (Name, City) so they know who they are unlocking
                nom: buyer.profile?.nom,
                prenom: buyer.profile?.prenom,
                ville: buyer.profile?.ville,
                // Hide sensitive info if locked
                email: unlocked ? buyer.email : '***@***.com',
                telephone: unlocked ? buyer.profile?.telephone : '+33 * ** ** **'
            }
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('Error fetching buyer details:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
