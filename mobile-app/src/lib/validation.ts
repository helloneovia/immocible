/**
 * Règles de validation communes au site (formulaires) et à l'API (contrôle définitif).
 * Copie à l'identique de lib/validation.ts (site et API) : garder les deux fichiers synchronisés.
 */

export const EMAIL_MAX_LENGTH = 254
export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 128
export const NAME_MAX_LENGTH = 60
export const AGENCY_NAME_MAX_LENGTH = 100

// Sans lookbehind (anciens Safari, moteur Hermes). Partie locale sans point initial/final ni points consécutifs ; domaine en labels
// alphanumériques (tirets internes autorisés) et extension d'au moins 2 lettres.
const EMAIL_RE =
  /^(?!\.)(?!.*\.\.)(?![^@]*\.@)[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]{1,64}@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,63}$/

/** E-mail tel qu'il est enregistré : sans espaces, en minuscules ('' si absent). */
export function normalizeEmail(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

export function isValidEmail(value: unknown): boolean {
  const email = normalizeEmail(value)
  return email.length > 0 && email.length <= EMAIL_MAX_LENGTH && EMAIL_RE.test(email)
}

/** Mot de passe accepté à l'inscription, à la réinitialisation et au changement. */
export function passwordProblem(value: unknown): 'required' | 'tooShort' | 'tooLong' | null {
  if (typeof value !== 'string' || value.length === 0) return 'required'
  if (value.length < PASSWORD_MIN_LENGTH) return 'tooShort'
  if (value.length > PASSWORD_MAX_LENGTH) return 'tooLong'
  return null
}

/**
 * Téléphone facultatif : chiffres avec espaces, points, tirets, parenthèses et « + » initial,
 * 8 à 15 chiffres (format international E.164, numéros français à 10 chiffres inclus).
 */
export function isValidPhone(value: unknown): boolean {
  if (typeof value !== 'string') return false
  const phone = value.trim()
  if (!/^\+?[0-9 .()-]+$/.test(phone)) return false
  const digits = phone.replace(/\D/g, '')
  return digits.length >= 8 && digits.length <= 15
}

/** Texte libre nettoyé : chaîne sans espaces superflus, ou null si vide / invalide. */
export function cleanText(value: unknown, maxLength: number): string | null {
  if (typeof value !== 'string') return null
  const text = value.trim().replace(/\s+/g, ' ')
  if (!text) return null
  return text.slice(0, maxLength)
}

/** Code de vérification envoyé par e-mail (6 chiffres). */
export function isVerificationCode(value: unknown): value is string {
  return typeof value === 'string' && /^\d{6}$/.test(value.trim())
}

/** Identifiant (table verification_tokens) prouvant qu'une adresse a été vérifiée avant l'inscription. */
export function verifiedEmailIdentifier(email: string) {
  return `verified:${normalizeEmail(email)}`
}

export const MESSAGE_MAX_LENGTH = 5000

/**
 * Montant ou surface saisi (nombre ou texte, espaces acceptés) : null si vide,
 * undefined si invalide (texte non numérique, négatif, infini).
 */
export function parseNonNegativeNumber(value: unknown): number | null | undefined {
  if (value === null || value === undefined || value === '') return null
  const n = typeof value === 'number' ? value : typeof value === 'string' ? Number(value.replace(/[\s  ]/g, '').replace(',', '.')) : NaN
  return Number.isFinite(n) && n >= 0 ? n : undefined
}

/** Fourchette min / max cohérente (bornes facultatives). */
export function isValidRange(min: number | null | undefined, max: number | null | undefined) {
  if (min === undefined || max === undefined) return false
  return min === null || max === null || max === 0 || min <= max
}
