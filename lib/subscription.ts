import { NextResponse } from 'next/server'

type SubscriptionFields = {
    subscriptionStatus?: string | null
    subscriptionEndDate?: Date | string | null
} | null | undefined

/**
 * Abonnement agence réellement actif : payé (statut ACTIVE) et non expiré.
 * Le statut seul ne suffit pas : rien ne le repasse à INACTIVE à l'échéance.
 */
export function hasActiveSubscription(profile: SubscriptionFields) {
    if (!profile || profile.subscriptionStatus !== 'ACTIVE' || !profile.subscriptionEndDate) return false
    return new Date(profile.subscriptionEndDate).getTime() > Date.now()
}

/** Réponse commune quand une agence sans abonnement actif tente d'accéder aux acquéreurs. */
export function subscriptionRequiredResponse() {
    return NextResponse.json(
        {
            error: 'Un abonnement actif est nécessaire pour consulter et contacter les acquéreurs.',
            subscriptionRequired: true,
        },
        { status: 403 },
    )
}
