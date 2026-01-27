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

        // Check for Stripe
        if (process.env.STRIPE_SECRET_KEY) {
            try {
                const Stripe = require('stripe')
                const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })

                const session = await stripe.checkout.sessions.create({
                    payment_method_types: ['card'],
                    line_items: [
                        {
                            price_data: {
                                currency: 'eur',
                                product_data: {
                                    name: 'Déblocage Contact Acquéreur',
                                    description: `Accès aux coordonnées pour le dossier #${buyerId.slice(0, 8)}`,
                                },
                                unit_amount: Math.round((amount || 0) * 100), // Amount in cents
                            },
                            quantity: 1,
                        },
                    ],
                    mode: 'payment',
                    success_url: `${process.env.NEXTAUTH_URL || request.headers.get('origin')}/agence/buyer/${buyerId}?session_id={CHECKOUT_SESSION_ID}`,
                    cancel_url: `${process.env.NEXTAUTH_URL || request.headers.get('origin')}/agence/buyer/${buyerId}`,
                    metadata: {
                        agencyId: currentUser.id,
                        buyerId: buyerId,
                        type: 'unlock_contact'
                    },
                })

                return NextResponse.json({ url: session.url })
            } catch (stripeError) {
                console.error('Stripe Error:', stripeError)
                return NextResponse.json({
                    error: 'Payment Init Error',
                    details: stripeError instanceof Error ? stripeError.message : String(stripeError)
                }, { status: 500 })
            }
        }

        // Fallback: Mock Unlock (Immediate) - Only if no Stripe Key
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
        return NextResponse.json({
            error: 'Internal Error',
            details: e instanceof Error ? e.message : String(e)
        }, { status: 500 })
    }
}
