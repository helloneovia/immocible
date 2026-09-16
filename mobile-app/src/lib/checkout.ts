import { api, API_URL } from '@/lib/api'

export type CheckoutKind = 'subscription' | 'unlock'

/** Route de l'écran de paiement Stripe (modal). */
export function paymentHref(clientSecret: string, kind: CheckoutKind, buyerId?: string) {
  let href = `/paiement?clientSecret=${encodeURIComponent(clientSecret)}&kind=${kind}`
  if (buyerId) href += `&buyerId=${encodeURIComponent(buyerId)}`
  return href
}

export interface CheckoutResponse {
  clientSecret?: string
  success?: boolean
  message?: string
}

/**
 * Crée une session Stripe Embedded Checkout pour l'abonnement agence.
 * Un coupon FREE_TRIAL active l'abonnement sans paiement (`success: true`).
 * Le return_url n'est jamais chargé : l'écran de paiement intercepte la redirection.
 */
export function createSubscriptionCheckout(input: {
  email: string
  plan: 'monthly' | 'yearly'
  nomAgence?: string
  couponCode?: string
}) {
  return api<CheckoutResponse>('/api/payment/create-checkout-session', {
    method: 'POST',
    body: {
      email: input.email,
      plan: input.plan,
      nomAgence: input.nomAgence || 'Agence',
      couponCode: input.couponCode || undefined,
      returnUrl: `${API_URL}/agence/inscription/success`,
    },
  })
}
