
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is missing in environment variables')
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
})

const PLANS = {
    monthly: {
        price: 2900, // 29.00 EUR
        name: 'Formule Mensuelle (Agence)',
    },
    yearly: {
        price: 29000, // 290.00 EUR
        name: 'Formule Annuelle (Agence)',
    },
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, plan, nomAgence } = body

        if (!email || !plan) {
            return NextResponse.json(
                { error: 'Email and plan are required' },
                { status: 400 }
            )
        }

        const selectedPlan = PLANS[plan as keyof typeof PLANS]
        if (!selectedPlan) {
            return NextResponse.json(
                { error: 'Invalid plan' },
                { status: 400 }
            )
        }

        // Coupon Logic for 100% Off (Bypass Stripe)
        // Only applies to monthly plan for now
        const VALID_COUPON = "IMMO_START";
        if (body.couponCode === VALID_COUPON && plan === 'monthly') {
            const user = await prisma.user.findUnique({
                where: { email },
                include: { profile: true }
            })

            if (user) {
                // Activate 30 days
                const startDate = new Date()
                const newEndDate = new Date(startDate)
                newEndDate.setDate(newEndDate.getDate() + 30)

                await prisma.profile.update({
                    where: { userId: user.id },
                    data: {
                        subscriptionStatus: 'ACTIVE',
                        plan: 'monthly',
                        subscriptionStartDate: startDate,
                        subscriptionEndDate: newEndDate
                    }
                })

                await prisma.payment.create({
                    data: {
                        userId: user.id,
                        stripeSessionId: `COUPON_${Math.random().toString(36).substring(7)}`,
                        amount: 0,
                        currency: 'eur',
                        status: 'succeeded',
                        plan: 'monthly_free_coupon',
                    }
                })

                return NextResponse.json({ success: true, message: 'Free month applied!' })
            }
        }

        // Create Stripe Session
        // We pass the email to pre-fill content.
        // Metadata helps us identify the user later if needed, though we rely on client success for now or webhook using email.
        // For "pending" activation flow, we might want to store the user ID if they already exist, or just email.

        // URL construction
        const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
        const host = request.headers.get('host') || 'localhost:3000'
        const baseUrl = `${protocol}://${host}`

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: selectedPlan.name,
                            description: `Accès IMMOCIBLE pour l'agence ${nomAgence || ''}`,
                        },
                        unit_amount: selectedPlan.price,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${baseUrl}/agence/inscription/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseUrl}/agence/inscription`,
            customer_email: email,
            metadata: {
                email,
                plan,
                nomAgence
            }
        })

        return NextResponse.json({ url: session.url })
    } catch (error: any) {
        console.error('Stripe error:', error)
        return NextResponse.json(
            { error: error.message || 'Payment initiation failed' },
            { status: 500 }
        )
    }
}
