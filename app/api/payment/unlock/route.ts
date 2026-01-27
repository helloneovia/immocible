import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
    try {
        const currentUser = await getCurrentUser()
        if (!currentUser || currentUser.role !== 'agence') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { buyerId, amount } = body

        if (!buyerId) {
            return NextResponse.json({ error: 'Missing buyerId' }, { status: 400 })
        }

        // Check if already unlocked
        const existing = await prisma.unlockedProfile.findUnique({
            where: {
                agencyId_buyerId: {
                    agencyId: currentUser.id,
                    buyerId: buyerId
                }
            }
        })

        if (existing) {
            return NextResponse.json({ success: true, message: 'Already unlocked' })
        }

        // 1. Create Unlock Record
        await prisma.unlockedProfile.create({
            data: {
                agencyId: currentUser.id,
                buyerId: buyerId,
                amount: amount || 0
            }
        })

        // 2. Record Payment (Mock)
        await prisma.payment.create({
            data: {
                userId: currentUser.id,
                amount: amount || 0,
                status: 'succeeded',
                currency: 'eur',
                plan: 'unlock_contact', // Using plan field to store type
                stripeSessionId: `mock_unlock_${Date.now()}`
            }
        })

        return NextResponse.json({ success: true })

    } catch (e) {
        console.error('Unlock error', e)
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
    }
}
