import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(price)
}

export function formatSurface(surface: number): string {
  return `${surface} m²`
}

/** Normalise une zone (minuscules, sans accents, sans espaces superflus). */
function normalizeZone(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
}

interface MatchRecherche {
  prixMin?: number | null
  prixMax: number
  surfaceMin?: number | null
  surfaceMax?: number | null
  typeBien?: string[] | null
  localisation?: string[] | null
  nombrePieces?: string[] | null
}

interface MatchBien {
  prix: number
  surface?: number | null
  nombrePieces?: number | null
  typeBien: string
  ville?: string | null
  quartier?: string | null
}

/**
 * Calcule un score de correspondance sur 100 entre une recherche et un bien.
 * Pondération : budget 30, localisation 30, type 20, surface 15, pièces 5.
 */
export function calculateMatchScore(
  recherche: MatchRecherche,
  bien: MatchBien
): { score: number; raisons: string[]; suggestions: string[] } {
  let score = 0
  const raisons: string[] = []
  const suggestions: string[] = []

  // Budget — 30 points
  const withinMax = bien.prix <= recherche.prixMax
  const withinMin = recherche.prixMin == null || bien.prix >= recherche.prixMin
  if (withinMax && withinMin) {
    score += 30
    raisons.push('Budget correspond')
  } else if (!withinMax) {
    suggestions.push('Le prix dépasse le budget maximum')
  }

  // Localisation — 30 points (comparaison normalisée : casse/accents ignorés)
  const zones = (recherche.localisation ?? []).map(normalizeZone)
  const bienZone = normalizeZone(bien.quartier || bien.ville || '')
  if (bienZone && zones.includes(bienZone)) {
    score += 30
    raisons.push('Zone recherchée')
  } else if (zones.length > 0) {
    suggestions.push('Le bien est hors des zones recherchées')
  }

  // Type de bien — 20 points
  const types = recherche.typeBien ?? []
  if (types.length === 0 || types.includes(bien.typeBien)) {
    score += 20
    raisons.push('Type de bien correspond')
  }

  // Surface — 15 points
  if (bien.surface != null) {
    const okMin = recherche.surfaceMin == null || bien.surface >= recherche.surfaceMin
    const okMax = recherche.surfaceMax == null || bien.surface <= recherche.surfaceMax
    if (okMin && okMax) {
      score += 15
      raisons.push('Surface adaptée')
    }
  }

  // Nombre de pièces — 5 points
  const piecesWanted = recherche.nombrePieces ?? []
  if (piecesWanted.length > 0 && bien.nombrePieces != null) {
    const bienPieces = String(bien.nombrePieces)
    const match = piecesWanted.some((p) => {
      const digits = String(p).replace(/\D/g, '')
      if (String(p).includes('+')) return bien.nombrePieces! >= Number(digits || 0)
      return digits === bienPieces
    })
    if (match) {
      score += 5
      raisons.push('Nombre de pièces correspond')
    }
  }

  return {
    score: Math.min(100, Math.round(score)),
    raisons,
    suggestions,
  }
}

export function sanitizeContent(content: string): string {
  // Regex for Email
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g

  // Regex for French Phone Numbers (various formats: 06 12 34 56 78, 06.12.34.56.78, 0612345678, +33 6...)
  const phoneRegex = /(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}/g

  // Generic 10 digit loose match (5 paires de chiffres) — filet complémentaire
  const genericPhoneRegex = /\b\d{2}[\s.-]?\d{2}[\s.-]?\d{2}[\s.-]?\d{2}[\s.-]?\d{2}\b/g

  let sanitized = content.replace(emailRegex, '[EMAIL MASQUÉ]')
  sanitized = sanitized.replace(phoneRegex, '[TÉLÉPHONE MASQUÉ]')
  // Filet complémentaire : masque les numéros que la regex française raterait.
  sanitized = sanitized.replace(genericPhoneRegex, '[TÉLÉPHONE MASQUÉ]')

  return sanitized
}
