
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { applyCheckoutSession } from '@/lib/payment'

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is missing in environment variables')
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
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

        // On récupère la session directement auprès de Stripe : impossible de
        // forger un session_id « payé » sans avoir réellement payé.
        const session = await stripe.checkout.sessions.retrieve(sessionId)

        if (session.payment_status !== 'paid') {
            return NextResponse.json(
                { valid: false, message: 'Payment not completed' },
                { status: 400 }
            )
        }

        // Activation idempotente : rejouer le même session_id n'accorde rien de plus.
        const result = await applyCheckoutSession(session)

        return NextResponse.json({
            valid: true,
            alreadyProcessed: result.reason === 'already_processed',
        })
    } catch (error: any) {
        console.error('Payment verification error:', error)
        return NextResponse.json(
            { error: 'Verification failed' },
            { status: 500 }
        )
    }
}
