import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { applyCheckoutSession } from '@/lib/payment'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })
  : null

/**
 * Webhook Stripe SIGNÉ — source de vérité pour l'activation d'abonnement.
 *
 * Configuration requise :
 *  1. Créer un endpoint webhook dans le dashboard Stripe pointant vers
 *     https://<domaine>/api/payment/webhook (événement `checkout.session.completed`).
 *  2. Renseigner la variable d'environnement STRIPE_WEBHOOK_SECRET (whsec_...).
 *
 * La signature est vérifiée : un tiers ne peut pas activer un abonnement en
 * appelant cette route sans la clé de signature Stripe.
 */
export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!stripe || !webhookSecret) {
    console.error('Stripe webhook non configuré (STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET manquants)')
    return NextResponse.json({ error: 'Webhook non configuré' }, { status: 500 })
  }

  const signature = request.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Signature manquante' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    const rawBody = await request.text()
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (err: any) {
    console.error('Échec de vérification de la signature du webhook:', err?.message)
    return NextResponse.json({ error: 'Signature invalide' }, { status: 400 })
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      await applyCheckoutSession(session)
    }
  } catch (e) {
    console.error('Erreur de traitement du webhook Stripe:', e)
    return NextResponse.json({ error: 'Erreur de traitement' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
