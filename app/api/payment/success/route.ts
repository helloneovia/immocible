
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_keys', {
    apiVersion: '2023-10-16',
})

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const sessionId = searchParams.get('session_id')

        if (!sessionId) {
            return NextResponse.json(
                { error: 'Session ID is required' },
                { status: 400 }
            )
        }

        // Retreive session from Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId)

        if (session.payment_status !== 'paid') {
            return NextResponse.json(
                { valid: false, message: 'Payment not completed' },
                { status: 400 }
            )
        }

        const email = session.customer_details?.email || session.metadata?.email

        if (email) {
            // Activate user in DB
            await prisma.profile.updateMany({
                where: {
                    user: {
                        email: email
                    }
                },
                data: {
                    subscriptionStatus: 'ACTIVE',
                    stripeCustomerId: session.customer as string
                }
            })
        }

        return NextResponse.json({ valid: true })
    } catch (error: any) {
        console.error('Payment verification error:', error)
        return NextResponse.json(
            { error: 'Verification failed' },
            { status: 500 }
        )
    }
}
