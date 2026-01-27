import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
    try {
        const currentUser = await getCurrentUser()
        if (!currentUser || currentUser.role !== 'agence') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { buyerId } = await request.json()
        if (!buyerId) {
            return NextResponse.json({ error: 'Buyer ID required' }, { status: 400 })
        }

        // 1. Check if conversation already exists
        const existingConv = await prisma.conversation.findUnique({
            where: {
                agencyId_buyerId: {
                    agencyId: currentUser.id,
                    buyerId,
                },
            },
        })

        if (existingConv) {
            return NextResponse.json({ conversation: existingConv })
        }

        // 2. Check limits if new conversation
        const profile = await prisma.profile.findUnique({
            where: { userId: currentUser.id },
        })

        const plan = profile?.plan || 'free'
        // Assuming simple plan names for now. Updates might be needed based on Stripe integration.
        const isUnlimited = plan === 'annual' || plan === 'unlimited'
        const limit = 100

        // Check if we need to reset the counter (monthly reset logic)
        // This is a simplified check. Ideally, this runs via cron or webhook.
        // For now, we'll just check the count.

        if (!isUnlimited && (profile?.chatUsageCount || 0) >= limit) {
            return NextResponse.json({
                error: 'Limite de conversations atteinte. Passez au plan annuel pour l\'illimité.',
                code: 'LIMIT_REACHED'
            }, { status: 403 })
        }

        // 3. Create conversation
        const conversation = await prisma.conversation.create({
            data: {
                agencyId: currentUser.id,
                buyerId,
            },
        })

        // 4. Increment usage
        if (!isUnlimited) {
            await prisma.profile.update({
                where: { userId: currentUser.id },
                data: {
                    chatUsageCount: {
                        increment: 1
                    }
                }
            })
        }

        return NextResponse.json({ conversation })
    } catch (error) {
        console.error('Initiate chat error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
