
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

        let stripeDiscounts = [];

        // Database Coupon Logic
        if (body.couponCode) {
            const coupon = await prisma.coupon.findUnique({
                where: { code: body.couponCode }
            })

            if (!coupon || !coupon.isActive) {
                return NextResponse.json({ error: 'Code promo invalide' }, { status: 400 })
            }
            if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
                return NextResponse.json({ error: 'Ce code promo a atteint sa limite d\'utilisation' }, { status: 400 })
            }
            if (coupon.validUntil && new Date() > coupon.validUntil) {
                return NextResponse.json({ error: 'Ce code promo a expiré' }, { status: 400 })
            }
            if (coupon.planType && coupon.planType !== 'all' && coupon.planType !== plan) {
                return NextResponse.json({ error: `Ce code est valide uniquement pour le plan ${coupon.planType === 'monthly' ? 'Mensuel' : 'Annuel'}` }, { status: 400 })
            }

            // Handle FREE_TRIAL (Bypass Stripe)
            if (coupon.discountType === 'FREE_TRIAL') {
                const user = await prisma.user.findUnique({
                    where: { email },
                    include: { profile: true }
                })

                if (user) {
                    const days = Math.floor(coupon.discountValue);
                    const startDate = new Date()
                    const newEndDate = new Date(startDate)
                    newEndDate.setDate(newEndDate.getDate() + days)

                    await prisma.profile.update({
                        where: { userId: user.id },
                        data: {
                            subscriptionStatus: 'ACTIVE',
                            plan: plan,
                            subscriptionStartDate: startDate,
                            subscriptionEndDate: newEndDate
                        }
                    })

                    await prisma.payment.create({
                        data: {
                            userId: user.id,
                            stripeSessionId: `COUPON_${coupon.code}_${Math.random().toString(36).substring(7)}`,
                            amount: 0,
                            currency: 'eur',
                            status: 'succeeded',
                            plan: `${plan}_freetrial`,
                        }
                    })

                    // Increment usage
                    await prisma.coupon.update({
                        where: { id: coupon.id },
                        data: { usedCount: { increment: 1 } }
                    })

                    return NextResponse.json({ success: true, message: `Offre activée : ${days} jours offerts !` })
                }
            } else {
                // Handle Percentage/Fixed via Stripe
                try {
                    const stripeCoupon = await stripe.coupons.create({
                        name: coupon.code,
                        amount_off: coupon.discountType === 'FIXED' ? Math.round(coupon.discountValue * 100) : undefined,
                        percent_off: coupon.discountType === 'PERCENTAGE' ? coupon.discountValue : undefined,
                        currency: 'eur',
                        duration: 'once'
                    })
                    stripeDiscounts.push({ coupon: stripeCoupon.id });

                    // Increment usage
                    await prisma.coupon.update({
                        where: { id: coupon.id },
                        data: { usedCount: { increment: 1 } }
                    })
                } catch (e) {
                    console.error("Stripe coupon creation failed", e);
                    return NextResponse.json({ error: 'Erreur lors de l\'application de la réduction' }, { status: 400 })
                }
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
            discounts: stripeDiscounts.length > 0 ? stripeDiscounts : undefined,
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
