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

        // Subscription & Quota Check
        const plan = currentUser.profile?.plan
        const subEndDate = currentUser.profile?.subscriptionEndDate
        const subStartDate = currentUser.profile?.subscriptionStartDate

        // 1. Check Subscription Status
        if (!subEndDate || new Date(subEndDate) < new Date()) {
            return NextResponse.json({ error: 'Abonnement requis ou expiré pour accéder aux contacts.' }, { status: 403 })
        }

        // 2. Check Monthly Quota
        if (plan === 'mensuel') {
            const effectiveStartDate = subStartDate || new Date(new Date().setDate(new Date().getDate() - 30))

            const count = await prisma.unlockedProfile.count({
                where: {
                    agencyId: currentUser.id,
                    createdAt: { gte: effectiveStartDate }
                }
            })

            if (count >= 100) {
                return NextResponse.json({ error: 'Limite mensuelle de 100 profils atteinte.' }, { status: 403 })
            }
        }

        // 3. Unlock (Plan Benefit)
        await prisma.unlockedProfile.create({
            data: {
                agencyId: currentUser.id,
                buyerId: buyerId,
                amount: 0
            }
        })

        return NextResponse.json({ success: true })

    } catch (e) {
        console.error('Unlock error', e)
        return NextResponse.json({
            error: 'Internal Error',
            details: e instanceof Error ? e.message : String(e)
        }, { status: 500 })
    }
}
