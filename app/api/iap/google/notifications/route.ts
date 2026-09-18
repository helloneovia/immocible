import { NextRequest, NextResponse } from 'next/server'
import { getAppSettings } from '@/lib/settings'
import { refreshGooglePurchase } from '@/lib/iap'

export const dynamic = 'force-dynamic'

/**
 * Notifications Google Play en temps réel (Pub/Sub, abonnement « push ») : renouvellements,
 * annulations, remboursements. L'achat est relu auprès de Google avant toute mise à jour.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const encoded = body?.message?.data
        if (typeof encoded !== 'string') return NextResponse.json({ ok: true })
        const notification = JSON.parse(Buffer.from(encoded, 'base64').toString('utf8'))
        const settings = await getAppSettings()
        if (notification.packageName && notification.packageName !== settings.iap_google_package_name) {
            return NextResponse.json({ ok: true })
        }
        if (notification.subscriptionNotification?.purchaseToken) {
            await refreshGooglePurchase(settings, notification.subscriptionNotification.purchaseToken)
        } else if (notification.voidedPurchaseNotification?.purchaseToken) {
            await refreshGooglePurchase(settings, notification.voidedPurchaseNotification.purchaseToken, true)
        }
        return NextResponse.json({ ok: true })
    } catch (error) {
        console.error('[IAP] Notification Google :', error)
        // Erreur : Pub/Sub renverra le message plus tard.
        return NextResponse.json({ ok: false }, { status: 500 })
    }
}
