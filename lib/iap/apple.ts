import crypto from 'crypto'

/**
 * Vérification des achats Apple via l'API App Store Server (données authentifiées
 * récupérées directement chez Apple : aucune donnée envoyée par l'app n'est crue sur parole).
 * https://developer.apple.com/documentation/appstoreserverapi
 */
export interface AppleCredentials {
    bundleId: string
    issuerId: string
    keyId: string
    privateKey: string
}

export interface AppleTransaction {
    transactionId: string
    originalTransactionId: string
    bundleId: string
    productId: string
    type: string // « Auto-Renewable Subscription », « Consumable »…
    purchaseDate?: number
    expiresDate?: number
    revocationDate?: number
    appAccountToken?: string
    environment?: string // Production, Sandbox
    price?: number // millièmes de la devise
    currency?: string
}

const HOSTS = {
    Production: 'https://api.storekit.itunes.apple.com',
    Sandbox: 'https://api.storekit-sandbox.itunes.apple.com',
} as const

const base64url = (input: Buffer | string) => Buffer.from(input).toString('base64url')

/** Jeton ES256 exigé par l'API App Store Server (valable 20 minutes). */
function appleToken(credentials: AppleCredentials) {
    const header = base64url(JSON.stringify({ alg: 'ES256', kid: credentials.keyId, typ: 'JWT' }))
    const now = Math.floor(Date.now() / 1000)
    const payload = base64url(JSON.stringify({
        iss: credentials.issuerId,
        iat: now,
        exp: now + 20 * 60,
        aud: 'appstoreconnect-v1',
        bid: credentials.bundleId,
    }))
    const signature = crypto.sign('sha256', Buffer.from(`${header}.${payload}`), {
        key: credentials.privateKey.replace(/\\n/g, '\n'),
        dsaEncoding: 'ieee-p1363',
    })
    return `${header}.${payload}.${base64url(signature)}`
}

/** Charge utile d'un JWS Apple (la signature n'est pas nécessaire : la donnée vient de l'API Apple). */
export function decodeJws<T = any>(jws: string): T {
    const part = jws.split('.')[1]
    if (!part) throw new Error('JWS invalide')
    return JSON.parse(Buffer.from(part, 'base64url').toString('utf8'))
}

async function getFrom(host: string, path: string, credentials: AppleCredentials) {
    return fetch(host + path, {
        headers: { Authorization: `Bearer ${appleToken(credentials)}` },
        cache: 'no-store',
    })
}

/**
 * Transaction authentique par son identifiant. Essaie la production puis le bac à sable
 * (TestFlight et comptes de test utilisent l'environnement Sandbox).
 */
export async function getAppleTransaction(transactionId: string, credentials: AppleCredentials): Promise<AppleTransaction | null> {
    const path = `/inApps/v1/transactions/${encodeURIComponent(transactionId)}`
    for (const host of [HOSTS.Production, HOSTS.Sandbox]) {
        const response = await getFrom(host, path, credentials)
        if (response.status === 404) continue
        if (!response.ok) throw new Error(`App Store Server API ${response.status}`)
        const data = await response.json()
        if (!data?.signedTransactionInfo) return null
        return decodeJws<AppleTransaction>(data.signedTransactionInfo)
    }
    return null
}

/**
 * Notification serveur Apple (version 2) : on n'en retient que l'identifiant de transaction,
 * la transaction elle-même est ensuite relue auprès d'Apple (une notification forgée n'a aucun effet).
 */
export function appleNotificationTransactionId(signedPayload: string): { notificationType?: string; transactionId?: string } {
    const payload = decodeJws<any>(signedPayload)
    const signedTransactionInfo = payload?.data?.signedTransactionInfo
    const transaction = signedTransactionInfo ? decodeJws<AppleTransaction>(signedTransactionInfo) : null
    return { notificationType: payload?.notificationType, transactionId: transaction?.transactionId }
}
