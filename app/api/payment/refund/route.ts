
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is missing in environment variables')
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
})

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { paymentId } = body

        if (!paymentId) {
            return NextResponse.json({ error: 'Payment ID required' }, { status: 400 })
        }

        // 1. Get payment from DB
        const payment = await prisma.payment.findUnique({
            where: { id: paymentId },
            include: { user: true }
        })

        if (!payment || !payment.stripePaymentIntentId) {
            return NextResponse.json({ error: 'Payment not found or not refundable (no intent ID)' }, { status: 404 })
        }

        if (payment.status === 'refunded') {
            return NextResponse.json({ error: 'Payment already refunded' }, { status: 400 })
        }

        // 2. Process refund with Stripe
        const refund = await stripe.refunds.create({
            payment_intent: payment.stripePaymentIntentId,
        })

        // 3. Update DB
        await prisma.payment.update({
            where: { id: paymentId },
            data: {
                status: 'refunded'
            }
        })

        // 4. Optionally downgrade user? 
        // For now we just mark payment as refunded. Managing access revocation is a business decision.
        // We will set subscription status to CANCELLED to be safe.
        await prisma.profile.update({
            where: { userId: payment.userId },
            data: {
                subscriptionStatus: 'CANCELLED'
            }
        })

        return NextResponse.json({ success: true, refundId: refund.id })
    } catch (error: any) {
        console.error('Refund Error:', error)
        return NextResponse.json(
            { error: error.message || 'Refund failed' },
            { status: 500 }
        )
    }
}
