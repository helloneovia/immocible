
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
