
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { sendPaymentSuccessEmail } from '@/lib/mail'

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
            // Find user first
            const user = await prisma.user.findUnique({
                where: { email },
                include: { profile: true }
            })

            if (user) {
                // Calculate new subscription end date
                const planType = session.metadata?.plan || user.profile?.plan || 'mensuel'

                let startDate = new Date()
                let newEndDate = new Date()
                const currentEndDate = user.profile?.subscriptionEndDate

                if (currentEndDate && currentEndDate > new Date()) {
                    startDate = new Date(currentEndDate)
                    newEndDate = new Date(currentEndDate)
                }

                if (planType === 'yearly') {
                    newEndDate.setFullYear(newEndDate.getFullYear() + 1)
                } else {
                    newEndDate.setMonth(newEndDate.getMonth() + 1)
                }

                // Activate user in DB
                await prisma.profile.update({
                    where: { userId: user.id },
                    data: {
                        subscriptionStatus: 'ACTIVE',
                        stripeCustomerId: session.customer as string,
                        plan: planType,
                        subscriptionEndDate: newEndDate
                    }
                })

                // Save payment transaction
                await prisma.payment.create({
                    data: {
                        userId: user.id,
                        stripeSessionId: session.id,
                        stripePaymentIntentId: session.payment_intent as string | null,
                        amount: session.amount_total ? session.amount_total / 100 : 0,
                        currency: session.currency || 'eur',
                        status: session.payment_status,
                        plan: planType,
                    }
                })

                // Send success email
                try {
                    await sendPaymentSuccessEmail(
                        email,
                        (session.amount_total || 0) / 100,
                        planType as string,
                        startDate,
                        newEndDate,
                        user.profile?.nomAgence || user.profile?.prenom || undefined
                    )
                } catch (e) {
                    console.error('Failed to send payment email', e)
                }
            }
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
