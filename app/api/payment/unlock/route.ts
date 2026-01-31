import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { getAppSettings } from '@/lib/settings'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
    try {
        const currentUser = await getCurrentUser()
        if (!currentUser || currentUser.role !== 'agence') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { buyerId } = body

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

        // Get unlock price from settings and buyer search data
        const settings = await getAppSettings()

        // Initialize Stripe
        if (!settings.stripe_secret_key) {
            console.error("Stripe key missing");
            return NextResponse.json({ error: 'Configuration error: Missing Stripe Key' }, { status: 500 })
        }

        const stripe = new Stripe(settings.stripe_secret_key, {
            apiVersion: '2023-10-16' as any,
        })

        // Fetch buyer search to calculate price
        const buyer = await prisma.user.findUnique({
            where: { id: buyerId },
            include: {
                recherches: {
                    where: { isActive: true },
                    take: 1
                },
                profile: true
            }
        })

        if (!buyer) {
            return NextResponse.json({ error: 'Buyer not found' }, { status: 404 })
        }

        const search = buyer.recherches[0]
        // Calculate price: Max(1€, prixMax * percentage)
        // Note: Percentage is like 0.01 (meaning 0.01%). Example: 300,000 * 0.0001 = 30€
        const priceEur = search?.prixMax
            ? Math.max(1, Math.round(search.prixMax * (settings.price_unlock_profile_percentage / 100)))
            : 1 // Default 1€ if no budget

        const priceCents = Math.round(priceEur * 100)

        // URL construction
        const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
        const host = request.headers.get('host') || 'localhost:3000'
        const baseUrl = `${protocol}://${host}`

        // Create Stripe Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: `Déblocage Contact: ${buyer.profile?.prenom || 'Acquéreur'}`,
                            description: `Accès aux coordonnées complètes (Réf: ${buyerId.substring(0, 8)})`,
                        },
                        unit_amount: priceCents,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${baseUrl}/agence/buyer/${buyerId}?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseUrl}/agence/buyer/${buyerId}`,
            customer_email: currentUser.email, // Agency email
            metadata: {
                type: 'unlock_contact',
                agencyId: currentUser.id,
                buyerId: buyerId
            }
        })

        return NextResponse.json({ url: session.url })

    } catch (e) {
        console.error('Unlock payment init error', e)
        return NextResponse.json({
            error: 'Internal Error',
            details: e instanceof Error ? e.message : String(e)
        }, { status: 500 })
    }
}
