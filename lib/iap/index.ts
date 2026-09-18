import { prisma } from '@/lib/prisma'
import type { AppSettings } from '@/lib/settings'
import { getAppleTransaction, type AppleCredentials, type AppleTransaction } from './apple'
import {
    acknowledgeGoogleSubscription,
    getGoogleProductPurchase,
    getGoogleSubscription,
    type GoogleCredentials,
    type GoogleSubscription,
} from './google'

/**
 * Achats intégrés (App Store / Google Play) : correspondance produits ↔ formules, paliers
 * de déblocage et effets d'un achat vérifié (abonnement prolongé, contact débloqué).
 */
export type StorePlatform = 'apple' | 'google'
export type Plan = 'monthly' | 'yearly'

export class IapError extends Error {
    constructor(public code: 'notConfigured' | 'invalidPurchase' | 'wrongAccount' | 'alreadyUsed' | 'wrongProduct' | 'notFree', public status = 400) {
        super(code)
    }
}

export function appleCredentials(settings: AppSettings): AppleCredentials | null {
    const { iap_apple_bundle_id, iap_apple_issuer_id, iap_apple_key_id, iap_apple_private_key } = settings
    if (!iap_apple_bundle_id || !iap_apple_issuer_id || !iap_apple_key_id || !iap_apple_private_key) return null
    return { bundleId: iap_apple_bundle_id, issuerId: iap_apple_issuer_id, keyId: iap_apple_key_id, privateKey: iap_apple_private_key }
}

export function googleCredentials(settings: AppSettings): GoogleCredentials | null {
    if (!settings.iap_google_package_name || !settings.iap_google_service_account) return null
    return { packageName: settings.iap_google_package_name, serviceAccount: settings.iap_google_service_account }
}

/** Formule correspondant à un produit d'abonnement du store (null si inconnu). */
export function planForProduct(settings: AppSettings, platform: StorePlatform, productId: string, basePlanId?: string | null): Plan | null {
    const monthly = platform === 'apple' ? settings.iap_apple_product_monthly : settings.iap_google_product_monthly
    const yearly = platform === 'apple' ? settings.iap_apple_product_yearly : settings.iap_google_product_yearly
    // Google : un même abonnement peut porter les deux formules (une offre de base chacune).
    if (platform === 'google' && productId && monthly === yearly && productId === monthly) {
        if (basePlanId && basePlanId === settings.iap_google_base_plan_yearly) return 'yearly'
        if (basePlanId && basePlanId === settings.iap_google_base_plan_monthly) return 'monthly'
        return null
    }
    if (productId && productId === monthly) return 'monthly'
    if (productId && productId === yearly) return 'yearly'
    return null
}

/** Prix d'un déblocage sur le site (même règle que /api/payment/unlock) : 0 = gratuit. */
export function unlockPriceEur(settings: AppSettings, prixMax?: number | null) {
    if (!prixMax) return 1
    if (settings.price_unlock_profile_min_budget > 0 && prixMax < settings.price_unlock_profile_min_budget) return 0
    return Math.max(1, Math.round(prixMax * (settings.price_unlock_profile_percentage / 100)))
}

/** Produit du store à acheter pour débloquer un acquéreur, selon son budget (palier). */
export function unlockProductFor(settings: AppSettings, platform: StorePlatform, prixMax?: number | null): string | null {
    const tiers = [...(settings.iap_unlock_tiers || [])].sort((a, b) => (a.maxBudget ?? Infinity) - (b.maxBudget ?? Infinity))
    const budget = prixMax || 0
    const tier = tiers.find((t) => t.maxBudget === null || t.maxBudget === undefined || budget <= t.maxBudget)
    const product = tier ? (platform === 'apple' ? tier.apple : tier.google) : null
    return product || null
}

async function recordPayment(userId: string, platform: StorePlatform, plan: string | null, amount: number, currency: string) {
    await prisma.payment.create({
        data: { userId, amount, currency: (currency || 'eur').toLowerCase(), status: 'succeeded', plan, provider: platform },
    })
}

/**
 * Applique un abonnement vérifié : la date de fin suit l'échéance du store
 * (jamais raccourcie par un achat plus ancien), un remboursement coupe l'accès.
 */
async function applySubscription(input: {
    userId: string
    platform: StorePlatform
    productId: string
    plan: Plan
    transactionId: string
    originalTransactionId?: string | null
    purchaseToken?: string | null
    expiresAt: Date | null
    revoked: boolean
    environment?: string | null
    amount?: number
    currency?: string
}) {
    const existing = await prisma.storePurchase.findUnique({ where: { transactionId: input.transactionId } })
    const status = input.revoked ? 'revoked' : input.expiresAt && input.expiresAt.getTime() > Date.now() ? 'active' : 'expired'
    await prisma.storePurchase.upsert({
        where: { transactionId: input.transactionId },
        create: {
            userId: input.userId,
            platform: input.platform,
            kind: 'subscription',
            productId: input.productId,
            plan: input.plan,
            transactionId: input.transactionId,
            originalTransactionId: input.originalTransactionId ?? null,
            purchaseToken: input.purchaseToken ?? null,
            expiresAt: input.expiresAt,
            status,
            environment: input.environment ?? null,
        },
        update: { expiresAt: input.expiresAt, status },
    })

    const profile = await prisma.profile.findUnique({ where: { userId: input.userId } })
    if (input.revoked) {
        await prisma.profile.update({
            where: { userId: input.userId },
            data: { subscriptionStatus: 'CANCELLED', subscriptionEndDate: new Date() },
        })
        return null
    }
    if (!input.expiresAt) return profile?.subscriptionEndDate ?? null

    const currentEnd = profile?.subscriptionEndDate && profile.subscriptionStatus === 'ACTIVE' ? profile.subscriptionEndDate : null
    const endDate = currentEnd && currentEnd > input.expiresAt ? currentEnd : input.expiresAt
    const active = endDate.getTime() > Date.now()
    await prisma.profile.update({
        where: { userId: input.userId },
        data: {
            plan: input.plan,
            subscriptionStatus: active ? 'ACTIVE' : 'INACTIVE',
            subscriptionEndDate: endDate,
            ...(currentEnd ? {} : { subscriptionStartDate: new Date() }),
        },
    })
    if (!existing) await recordPayment(input.userId, input.platform, input.plan, input.amount ?? 0, input.currency ?? 'eur')
    return endDate
}

/** Refuse un achat déjà rattaché à un autre compte (même abonnement ou même jeton). */
async function assertOwnership(userId: string, accountToken: string | null | undefined, keys: { originalTransactionId?: string | null; purchaseToken?: string | null }) {
    if (accountToken && accountToken.toLowerCase() !== userId.toLowerCase()) throw new IapError('wrongAccount', 403)
    const or = [
        keys.originalTransactionId ? { originalTransactionId: keys.originalTransactionId } : null,
        keys.purchaseToken ? { purchaseToken: keys.purchaseToken } : null,
    ].filter(Boolean) as object[]
    if (!or.length) return
    const other = await prisma.storePurchase.findFirst({ where: { OR: or, NOT: { userId } } })
    if (other) throw new IapError('wrongAccount', 403)
}

function appleExpiry(transaction: AppleTransaction) {
    return transaction.expiresDate ? new Date(transaction.expiresDate) : null
}

function googleExpiry(subscription: GoogleSubscription, productId: string) {
    const item = subscription.lineItems?.find((line) => line.productId === productId) ?? subscription.lineItems?.[0]
    return item?.expiryTime ? new Date(item.expiryTime) : null
}

function googlePrice(subscription: GoogleSubscription) {
    const price = subscription.lineItems?.[0]?.autoRenewingPlan?.recurringPrice
    if (!price) return { amount: 0, currency: 'eur' }
    return { amount: Number(price.units || 0) + (price.nanos || 0) / 1e9, currency: price.currencyCode || 'eur' }
}

/** Abonnement acheté (ou restauré) dans l'app : vérifié auprès du store puis appliqué au compte. */
export async function verifySubscriptionPurchase(settings: AppSettings, userId: string, input: {
    platform: StorePlatform
    productId: string
    transactionId?: string
    purchaseToken?: string
}) {
    if (input.platform === 'apple') {
        const credentials = appleCredentials(settings)
        if (!credentials || !input.transactionId) throw new IapError('notConfigured', 503)
        const transaction = await getAppleTransaction(input.transactionId, credentials)
        if (!transaction || transaction.bundleId !== credentials.bundleId) throw new IapError('invalidPurchase')
        const plan = planForProduct(settings, 'apple', transaction.productId)
        if (!plan) throw new IapError('wrongProduct')
        await assertOwnership(userId, transaction.appAccountToken, { originalTransactionId: transaction.originalTransactionId })
        return applySubscription({
            userId,
            platform: 'apple',
            productId: transaction.productId,
            plan,
            transactionId: transaction.transactionId,
            originalTransactionId: transaction.originalTransactionId,
            expiresAt: appleExpiry(transaction),
            revoked: !!transaction.revocationDate,
            environment: transaction.environment,
            amount: transaction.price ? transaction.price / 1000 : 0,
            currency: transaction.currency,
        })
    }

    const credentials = googleCredentials(settings)
    if (!credentials || !input.purchaseToken) throw new IapError('notConfigured', 503)
    const subscription = await getGoogleSubscription(input.purchaseToken, credentials)
    if (!subscription) throw new IapError('invalidPurchase')
    const line = subscription.lineItems?.find((item) => planForProduct(settings, 'google', item.productId, item.offerDetails?.basePlanId))
    const productId = line?.productId
    const plan = line ? planForProduct(settings, 'google', line.productId, line.offerDetails?.basePlanId) : null
    if (!productId || !plan) throw new IapError('wrongProduct')
    await assertOwnership(userId, subscription.externalAccountIdentifiers?.obfuscatedExternalAccountId, { purchaseToken: input.purchaseToken })
    if (subscription.acknowledgementState === 'ACKNOWLEDGEMENT_STATE_PENDING') {
        await acknowledgeGoogleSubscription(productId, input.purchaseToken, credentials).catch(() => false)
    }
    const { amount, currency } = googlePrice(subscription)
    return applySubscription({
        userId,
        platform: 'google',
        productId,
        plan,
        transactionId: subscription.latestOrderId || input.purchaseToken,
        purchaseToken: input.purchaseToken,
        expiresAt: googleExpiry(subscription, productId),
        revoked: false,
        environment: subscription.testPurchase ? 'Sandbox' : 'Production',
        amount,
        currency,
    })
}

/** Déblocage payé dans l'app : produit du bon palier, achat valide et jamais utilisé. */
export async function verifyUnlockPurchase(settings: AppSettings, agencyId: string, input: {
    platform: StorePlatform
    productId: string
    buyerId: string
    transactionId?: string
    purchaseToken?: string
}) {
    const buyer = await prisma.user.findUnique({
        where: { id: input.buyerId },
        include: { recherches: { where: { isActive: true }, take: 1 } },
    })
    if (!buyer) throw new IapError('invalidPurchase', 404)
    const prixMax = buyer.recherches[0]?.prixMax ?? null
    if (unlockPriceEur(settings, prixMax) <= 0) throw new IapError('notFree')
    const expected = unlockProductFor(settings, input.platform, prixMax)
    if (!expected) throw new IapError('notConfigured', 503)

    let transactionId: string
    let amount = 0
    let currency = 'eur'
    let environment: string | null = null
    if (input.platform === 'apple') {
        const credentials = appleCredentials(settings)
        if (!credentials || !input.transactionId) throw new IapError('notConfigured', 503)
        const transaction = await getAppleTransaction(input.transactionId, credentials)
        if (!transaction || transaction.bundleId !== credentials.bundleId || transaction.revocationDate) throw new IapError('invalidPurchase')
        if (transaction.productId !== expected) throw new IapError('wrongProduct')
        if (transaction.appAccountToken && transaction.appAccountToken.toLowerCase() !== agencyId.toLowerCase()) throw new IapError('wrongAccount', 403)
        transactionId = transaction.transactionId
        amount = transaction.price ? transaction.price / 1000 : 0
        currency = transaction.currency || 'eur'
        environment = transaction.environment ?? null
    } else {
        const credentials = googleCredentials(settings)
        if (!credentials || !input.purchaseToken) throw new IapError('notConfigured', 503)
        if (input.productId !== expected) throw new IapError('wrongProduct')
        const purchase = await getGoogleProductPurchase(expected, input.purchaseToken, credentials)
        if (!purchase || purchase.purchaseState !== 0) throw new IapError('invalidPurchase')
        if (purchase.obfuscatedExternalAccountId && purchase.obfuscatedExternalAccountId !== agencyId) throw new IapError('wrongAccount', 403)
        transactionId = purchase.orderId || input.purchaseToken
        environment = purchase.purchaseType === 0 ? 'Sandbox' : 'Production'
    }

    // Un reçu ne débloque qu'un seul acquéreur, une seule fois.
    const used = await prisma.storePurchase.findUnique({ where: { transactionId } })
    if (used) {
        if (used.userId === agencyId && used.buyerId === input.buyerId) return true
        throw new IapError('alreadyUsed', 409)
    }
    await prisma.storePurchase.create({
        data: {
            userId: agencyId,
            platform: input.platform,
            kind: 'unlock',
            productId: expected,
            buyerId: input.buyerId,
            transactionId,
            purchaseToken: input.purchaseToken ?? null,
            environment,
        },
    })
    await prisma.unlockedProfile.upsert({
        where: { agencyId_buyerId: { agencyId, buyerId: input.buyerId } },
        create: { agencyId, buyerId: input.buyerId, amount },
        update: {},
    })
    await recordPayment(agencyId, input.platform, null, amount, currency)
    return true
}

/** Notification Apple (renouvellement, expiration, remboursement) : relit la transaction et met à jour. */
export async function refreshAppleTransaction(settings: AppSettings, transactionId: string) {
    const credentials = appleCredentials(settings)
    if (!credentials) return
    const transaction = await getAppleTransaction(transactionId, credentials)
    if (!transaction || transaction.bundleId !== credentials.bundleId) return
    const known = await prisma.storePurchase.findFirst({
        where: { OR: [{ transactionId: transaction.transactionId }, { originalTransactionId: transaction.originalTransactionId }] },
        orderBy: { createdAt: 'desc' },
    })
    if (!known) return
    if (known.kind === 'unlock') {
        // Remboursement d'un déblocage : l'accès aux coordonnées est retiré.
        if (transaction.revocationDate && known.buyerId) {
            await prisma.storePurchase.update({ where: { id: known.id }, data: { status: 'revoked' } })
            await prisma.unlockedProfile.deleteMany({ where: { agencyId: known.userId, buyerId: known.buyerId } })
        }
        return
    }
    const plan = planForProduct(settings, 'apple', transaction.productId) ?? (known.plan as Plan | null)
    if (!plan) return
    await applySubscription({
        userId: known.userId,
        platform: 'apple',
        productId: transaction.productId,
        plan,
        transactionId: transaction.transactionId,
        originalTransactionId: transaction.originalTransactionId,
        expiresAt: appleExpiry(transaction),
        revoked: !!transaction.revocationDate,
        environment: transaction.environment,
        amount: transaction.price ? transaction.price / 1000 : 0,
        currency: transaction.currency,
    })
}

/** Notification Google (Pub/Sub) : relit l'abonnement ou l'achat et met à jour. */
export async function refreshGooglePurchase(settings: AppSettings, purchaseToken: string, voided = false) {
    const credentials = googleCredentials(settings)
    if (!credentials) return
    const known = await prisma.storePurchase.findFirst({ where: { purchaseToken }, orderBy: { createdAt: 'desc' } })
    if (!known) return
    if (known.kind === 'unlock') {
        if (voided && known.buyerId) {
            await prisma.storePurchase.update({ where: { id: known.id }, data: { status: 'revoked' } })
            await prisma.unlockedProfile.deleteMany({ where: { agencyId: known.userId, buyerId: known.buyerId } })
        }
        return
    }
    const subscription = await getGoogleSubscription(purchaseToken, credentials)
    if (!subscription) return
    const line = subscription.lineItems?.[0]
    const productId = line?.productId || known.productId
    const plan = planForProduct(settings, 'google', productId, line?.offerDetails?.basePlanId) ?? (known.plan as Plan | null)
    if (!plan) return
    const revoked = voided || subscription.subscriptionState === 'SUBSCRIPTION_STATE_REVOKED'
    const { amount, currency } = googlePrice(subscription)
    await applySubscription({
        userId: known.userId,
        platform: 'google',
        productId,
        plan,
        transactionId: subscription.latestOrderId || purchaseToken,
        purchaseToken,
        expiresAt: googleExpiry(subscription, productId),
        revoked,
        environment: subscription.testPurchase ? 'Sandbox' : 'Production',
        amount,
        currency,
    })
}
