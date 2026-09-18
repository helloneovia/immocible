import crypto from 'crypto'

/**
 * Vérification des achats Google Play via l'API Google Play Developer, avec un compte de
 * service (données authentifiées récupérées chez Google).
 * https://developers.google.com/android-publisher
 */
export interface GoogleCredentials {
    packageName: string
    serviceAccount: string // JSON du compte de service
}

export interface GoogleSubscription {
    subscriptionState?: string // SUBSCRIPTION_STATE_ACTIVE, …_CANCELED (actif jusqu'à l'échéance), …_EXPIRED…
    latestOrderId?: string
    linkedPurchaseToken?: string
    acknowledgementState?: string
    testPurchase?: object
    externalAccountIdentifiers?: { obfuscatedExternalAccountId?: string }
    lineItems?: {
        productId: string
        expiryTime?: string
        offerDetails?: { basePlanId?: string; offerId?: string }
        autoRenewingPlan?: { recurringPrice?: { currencyCode?: string; units?: string; nanos?: number } }
    }[]
}

export interface GoogleProductPurchase {
    purchaseState?: number // 0 acheté, 1 annulé, 2 en attente
    consumptionState?: number
    acknowledgementState?: number
    orderId?: string
    purchaseType?: number // 0 : achat de test
    obfuscatedExternalAccountId?: string
}

const API = 'https://androidpublisher.googleapis.com/androidpublisher/v3/applications'
let cachedToken: { value: string; expiresAt: number; email: string } | null = null

/** Jeton OAuth du compte de service (JWT RS256 échangé contre un jeton d'accès, mis en cache). */
async function accessToken(credentials: GoogleCredentials) {
    const account = JSON.parse(credentials.serviceAccount)
    if (cachedToken && cachedToken.email === account.client_email && cachedToken.expiresAt > Date.now() + 60_000) {
        return cachedToken.value
    }
    const now = Math.floor(Date.now() / 1000)
    const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url')
    const claims = Buffer.from(JSON.stringify({
        iss: account.client_email,
        scope: 'https://www.googleapis.com/auth/androidpublisher',
        aud: account.token_uri || 'https://oauth2.googleapis.com/token',
        iat: now,
        exp: now + 3600,
    })).toString('base64url')
    const signature = crypto.sign('RSA-SHA256', Buffer.from(`${header}.${claims}`), account.private_key).toString('base64url')
    const response = await fetch(account.token_uri || 'https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion: `${header}.${claims}.${signature}`,
        }),
        cache: 'no-store',
    })
    if (!response.ok) throw new Error(`Google OAuth ${response.status}`)
    const data = await response.json()
    cachedToken = { value: data.access_token, expiresAt: Date.now() + (data.expires_in || 3600) * 1000, email: account.client_email }
    return cachedToken.value
}

async function googleFetch(url: string, credentials: GoogleCredentials, init: RequestInit = {}) {
    return fetch(url, {
        ...init,
        headers: { ...(init.headers || {}), Authorization: `Bearer ${await accessToken(credentials)}` },
        cache: 'no-store',
    })
}

/** Abonnement authentique à partir de son jeton d'achat (API subscriptionsv2). */
export async function getGoogleSubscription(purchaseToken: string, credentials: GoogleCredentials): Promise<GoogleSubscription | null> {
    const url = `${API}/${encodeURIComponent(credentials.packageName)}/purchases/subscriptionsv2/tokens/${encodeURIComponent(purchaseToken)}`
    const response = await googleFetch(url, credentials)
    if (response.status === 404 || response.status === 410) return null
    if (!response.ok) throw new Error(`Google Play Developer API ${response.status}`)
    return response.json()
}

/** Achat ponctuel (produit consommable) authentique. */
export async function getGoogleProductPurchase(productId: string, purchaseToken: string, credentials: GoogleCredentials): Promise<GoogleProductPurchase | null> {
    const url = `${API}/${encodeURIComponent(credentials.packageName)}/purchases/products/${encodeURIComponent(productId)}/tokens/${encodeURIComponent(purchaseToken)}`
    const response = await googleFetch(url, credentials)
    if (response.status === 404 || response.status === 410) return null
    if (!response.ok) throw new Error(`Google Play Developer API ${response.status}`)
    return response.json()
}

/**
 * Accusé de réception d'un abonnement (sinon Google le rembourse au bout de 3 jours).
 * L'application le fait aussi en terminant la transaction ; le serveur le fait par sécurité.
 */
export async function acknowledgeGoogleSubscription(productId: string, purchaseToken: string, credentials: GoogleCredentials) {
    const url = `${API}/${encodeURIComponent(credentials.packageName)}/purchases/subscriptions/${encodeURIComponent(productId)}/tokens/${encodeURIComponent(purchaseToken)}:acknowledge`
    const response = await googleFetch(url, credentials, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
    // 400 si déjà acquitté : sans conséquence.
    return response.ok || response.status === 400
}
