import { NextRequest, NextResponse } from 'next/server'
import { getAppSettings } from '@/lib/settings'
import { appleNotificationTransactionId } from '@/lib/iap/apple'
import { refreshAppleTransaction } from '@/lib/iap'

export const dynamic = 'force-dynamic'

/**
 * Notifications serveur App Store (version 2) : renouvellements, expirations, remboursements.
 * La transaction est relue auprès d'Apple : le contenu de la notification n'est pas cru sur parole.
 */
export async function POST(request: NextRequest) {
    try {
        const { signedPayload } = await request.json()
        if (typeof signedPayload !== 'string') return NextResponse.json({ ok: false }, { status: 400 })
        const { transactionId, notificationType } = appleNotificationTransactionId(signedPayload)
        if (transactionId) {
            await refreshAppleTransaction(await getAppSettings(), transactionId)
        }
        console.log(`[IAP] Notification Apple ${notificationType || '?'} traitée`)
        return NextResponse.json({ ok: true })
    } catch (error) {
        console.error('[IAP] Notification Apple :', error)
        // 500 : Apple renverra la notification plus tard.
        return NextResponse.json({ ok: false }, { status: 500 })
    }
}
