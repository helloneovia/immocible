import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { getAppSettings } from '@/lib/settings'
import { getT } from '@/lib/i18n/server'
import { IapError, verifySubscriptionPurchase, verifyUnlockPurchase, type StorePlatform } from '@/lib/iap'

export const dynamic = 'force-dynamic'

/**
 * Achat effectué dans l'application (abonnement ou déblocage) : le serveur le vérifie
 * auprès d'Apple ou de Google avant d'en appliquer l'effet. Sert aussi à la restauration.
 */
export async function POST(request: NextRequest) {
    const t = getT()
    try {
        const user = await getCurrentUser()
        if (!user) return NextResponse.json({ error: t('api.common.unauthorized') }, { status: 401 })
        if (user.role !== 'agence') return NextResponse.json({ error: t('api.iap.agencyOnly') }, { status: 403 })

        const settings = await getAppSettings()
        if (!settings.iap_enabled) return NextResponse.json({ error: t('api.iap.disabled') }, { status: 403 })

        const body = await request.json()
        const platform: StorePlatform | null = body.platform === 'ios' ? 'apple' : body.platform === 'android' ? 'google' : null
        const productId = typeof body.productId === 'string' ? body.productId : ''
        const transactionId = typeof body.transactionId === 'string' ? body.transactionId : undefined
        const purchaseToken = typeof body.purchaseToken === 'string' ? body.purchaseToken : undefined
        if (!platform || !productId || (!transactionId && !purchaseToken)) {
            return NextResponse.json({ error: t('api.iap.invalidPurchase') }, { status: 400 })
        }

        if (body.kind === 'unlock') {
            if (typeof body.buyerId !== 'string' || !body.buyerId) {
                return NextResponse.json({ error: t('api.iap.invalidPurchase') }, { status: 400 })
            }
            await verifyUnlockPurchase(settings, user.id, { platform, productId, buyerId: body.buyerId, transactionId, purchaseToken })
            return NextResponse.json({ success: true })
        }

        const subscriptionEndDate = await verifySubscriptionPurchase(settings, user.id, { platform, productId, transactionId, purchaseToken })
        return NextResponse.json({ success: true, subscriptionEndDate })
    } catch (error) {
        if (error instanceof IapError) {
            return NextResponse.json({ error: t(`api.iap.${error.code}`), code: error.code }, { status: error.status })
        }
        console.error('[IAP] Vérification impossible :', error)
        return NextResponse.json({ error: t('api.iap.invalidPurchase') }, { status: 502 })
    }
}
