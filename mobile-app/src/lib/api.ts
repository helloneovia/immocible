/**
 * Client HTTP vers l'API Next.js d'IMMOCIBLE.
 *
 * L'authentification repose sur le cookie de session httpOnly posé par
 * /api/auth/login et /api/auth/register. Le fetch natif (NSURLSession sur iOS,
 * OkHttp + CookieManager sur Android) conserve ce cookie entre les lancements :
 * il suffit d'envoyer `credentials: 'include'`.
 */
import { getLocale, t } from '@/i18n'

export const API_URL = (process.env.EXPO_PUBLIC_API_URL || 'https://immocible.com').replace(/\/$/, '')

export class ApiError extends Error {
  status: number
  data: any

  constructor(message: string, status: number, data: any) {
    super(message)
    this.status = status
    this.data = data
  }
}

let unauthorizedHandler: (() => void) | null = null

/** Appelé quand une route protégée répond 401 (session expirée ou révoquée). */
export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler
}

type Options = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
  signal?: AbortSignal
}

// Le fetch natif n'a pas de délai d'expiration : une connexion réseau figée
// (changement Wi-Fi / 4G) laisserait un chargement tourner indéfiniment.
const REQUEST_TIMEOUT_MS = 20_000

export async function api<T = any>(path: string, { method = 'GET', body, signal }: Options = {}): Promise<T> {
  const controller = new AbortController()
  let timedOut = false
  const timer = setTimeout(() => {
    timedOut = true
    controller.abort()
  }, REQUEST_TIMEOUT_MS)
  signal?.addEventListener('abort', () => controller.abort())

  let response: Response
  try {
    response = await fetch(API_URL + path, {
      method,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        // Langue choisie dans l'app : le serveur renvoie ses messages dans cette langue.
        'X-Immocible-Lang': getLocale(),
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })
  } catch (error: any) {
    if (error?.name === 'AbortError' && !timedOut) throw error
    throw new ApiError(
      timedOut
        ? t('common.errors.timeout')
        : t('common.errors.network'),
      0,
      null,
    )
  } finally {
    clearTimeout(timer)
  }

  const text = await response.text()
  let data: any = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = null
  }

  if (!response.ok) {
    if (response.status === 401 && !path.startsWith('/api/auth/')) {
      unauthorizedHandler?.()
    }
    const message =
      data?.error || data?.message || (response.status === 429
        ? t('common.errors.tooManyAttempts')
        : t('common.errors.generic'))
    throw new ApiError(message, response.status, data)
  }

  return data as T
}

export function errorMessage(error: unknown, fallback = t('common.errors.generic')) {
  if (error instanceof Error && error.message) return error.message
  return fallback
}
