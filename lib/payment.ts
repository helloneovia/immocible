import type Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { sendPaymentSuccessEmail } from '@/lib/mail'

/**
 * Applique une session de paiement Stripe validée : active l'abonnement de
 * l'agence et enregistre le paiement.
 *
 * IDEMPOTENT : si une session Stripe donnée a déjà été traitée (un Payment
 * existe pour ce `stripeSessionId`), la fonction ne refait rien. Cela empêche :
 *  - la prolongation d'abonnement par rejeu du même `session_id` ;
 *  - la création de paiements en double.
 *
 * NB : pour une idempotence atomique face à des appels concurrents
 * (page de retour + webhook simultanés), ajouter à terme une contrainte
 * `@unique` sur `Payment.stripeSessionId` dans le schéma Prisma.
 */
export async function applyCheckoutSession(
  session: Stripe.Checkout.Session,
): Promise<{ applied: boolean; reason?: string }> {
  if (session.payment_status !== 'paid') {
    return { applied: false, reason: 'unpaid' }
  }

  const existing = await prisma.payment.findFirst({
    where: { stripeSessionId: session.id },
  })
  if (existing) {
    return { applied: false, reason: 'already_processed' }
  }

  const email = session.customer_details?.email || session.metadata?.email
  if (!email) {
    return { applied: false, reason: 'no_email' }
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: { profile: true },
  })
  if (!user) {
    return { applied: false, reason: 'no_user' }
  }

  const planType = session.metadata?.plan || user.profile?.plan || 'mensuel'
  const startDate = new Date()
  const newEndDate = new Date(startDate)
  if (planType === 'yearly') {
    newEndDate.setFullYear(newEndDate.getFullYear() + 1)
  } else {
    newEndDate.setDate(newEndDate.getDate() + 30)
  }

  await prisma.profile.update({
    where: { userId: user.id },
    data: {
      subscriptionStatus: 'ACTIVE',
      stripeCustomerId: (session.customer as string) || undefined,
      plan: planType,
      subscriptionStartDate: startDate,
      subscriptionEndDate: newEndDate,
    },
  })

  await prisma.payment.create({
    data: {
      userId: user.id,
      stripeSessionId: session.id,
      stripePaymentIntentId: (session.payment_intent as string) || null,
      amount: session.amount_total ? session.amount_total / 100 : 0,
      currency: session.currency || 'eur',
      status: session.payment_status,
      plan: planType,
    },
  })

  try {
    await sendPaymentSuccessEmail(
      email,
      (session.amount_total || 0) / 100,
      planType as string,
      startDate,
      newEndDate,
      user.profile?.nomAgence || user.profile?.prenom || undefined,
    )
  } catch (e) {
    console.error('Failed to send payment email', e)
  }

  return { applied: true }
}
