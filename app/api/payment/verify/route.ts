import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { getAppSettings } from '@/lib/settings'

export async function POST(request: NextRequest) {
    try {
        const currentUser = await getCurrentUser()
        if (!currentUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { sessionId } = await request.json()

        if (!sessionId) {
            return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })
        }

        const settings = await getAppSettings()
        const apiKey = settings.stripe_secret_key || process.env.STRIPE_SECRET_KEY

        if (!apiKey) {
            return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
        }

        const Stripe = require('stripe')
        const stripe = new Stripe(apiKey, { apiVersion: '2023-10-16' as any })

        const session = await stripe.checkout.sessions.retrieve(sessionId)

        if (session.payment_status !== 'paid') {
            return NextResponse.json({ error: 'Payment not completed', status: session.payment_status })
        }

        const { buyerId, agencyId } = session.metadata || {}

        if (!buyerId || !agencyId) {
            return NextResponse.json({ error: 'Invalid session metadata' }, { status: 400 })
        }

        // Check if already unlocked
        const existing = await prisma.unlockedProfile.findUnique({
            where: {
                agencyId_buyerId: {
                    agencyId: agencyId,
                    buyerId: buyerId
                }
            }
        })

        if (existing) {
            return NextResponse.json({ success: true, message: 'Already unlocked' })
        }

        // Unlock
        await prisma.unlockedProfile.create({
            data: {
                agencyId: agencyId,
                buyerId: buyerId,
                amount: session.amount_total ? session.amount_total / 100 : 0
            }
        })

        // Record Payment
        await prisma.payment.create({
            data: {
                userId: agencyId,
                status: session.payment_status,
                currency: session.currency || 'eur',
                amount: session.amount_total ? session.amount_total / 100 : 0,
                stripeSessionId: session.id,
                stripePaymentIntentId: session.payment_intent as string,
                plan: 'unlock_contact'
            }
        })

        return NextResponse.json({ success: true })

    } catch (e) {
        console.error('Verify error', e)
        return NextResponse.json({
            error: 'Verification Error',
            details: e instanceof Error ? e.message : String(e)
        }, { status: 500 })
    }
}
