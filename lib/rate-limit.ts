import { NextResponse } from 'next/server'

/**
 * Limiteur de débit en mémoire (fenêtre fixe). Simple et sans dépendance.
 *
 * ⚠️ Limite : l'état vit dans le processus. En déploiement multi-instances
 * (serverless, plusieurs répliques), utiliser un store partagé (Redis/Upstash)
 * pour une garantie globale. En conteneur unique (Dokploy), c'est efficace.
 */
const buckets = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { ok: boolean; retryAfter: number } {
  const now = Date.now()
  const bucket = buckets.get(key)

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, retryAfter: 0 }
  }

  if (bucket.count >= limit) {
    return { ok: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) }
  }

  bucket.count += 1
  return { ok: true, retryAfter: 0 }
}

/** Récupère une IP cliente exploitable pour la clé de limitation. */
export function getClientIp(request: Request): string {
  const xff = request.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  return request.headers.get('x-real-ip') || 'unknown'
}

/**
 * Applique une limite et renvoie une réponse 429 si dépassée, sinon null.
 *   const limited = enforceRateLimit(request, 'login', 10, 60_000)
 *   if (limited) return limited
 */
export function enforceRateLimit(
  request: Request,
  scope: string,
  limit: number,
  windowMs: number,
): NextResponse | null {
  const ip = getClientIp(request)
  const { ok, retryAfter } = rateLimit(`${scope}:${ip}`, limit, windowMs)
  if (ok) return null
  return NextResponse.json(
    { error: 'Trop de tentatives. Veuillez réessayer plus tard.' },
    { status: 429, headers: { 'Retry-After': String(retryAfter) } },
  )
}
