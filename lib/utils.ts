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

export function calculateMatchScore(
  recherche: any,
  bien: any
): { score: number; raisons: string[]; suggestions: string[] } {
  let score = 0
  const raisons: string[] = []
  const suggestions: string[] = []

  if (bien.prix <= recherche.prixMax) {
    score += 30
    raisons.push(`Budget correspond`)
  }

  if (recherche.zones.includes(bien.quartier || bien.ville)) {
    score += 25
    raisons.push(`Zone recherchée`)
  }

  if (recherche.typeBien.includes(bien.typeBien)) {
    score += 15
    raisons.push(`Type de bien correspond`)
  }

  return {
    score: Math.round(score),
    raisons,
    suggestions,
  }
}

export function sanitizeContent(content: string): string {
  // Regex for Email
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g

  // Regex for French Phone Numbers (various formats: 06 12 34 56 78, 06.12.34.56.78, 0612345678, +33 6...)
  const phoneRegex = /(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}/g

  // Generic 10 digit loose match
  const genericPhoneRegex = /\b\d{2}[\s.-]?\d{2}[\s.-]?\d{2}[\s.-]?\d{2}[\s.-]?\d{2}\b/g

  let sanitized = content.replace(emailRegex, '[EMAIL MASQUÉ]')
  sanitized = sanitized.replace(phoneRegex, '[TÉLÉPHONE MASQUÉ]')
  // Apply generic phone check if not already caught (simple overlap check might be needed or just sequential)
  // To avoid double masking, we can just run it. The above regex might already catch most.
  // The generic one is safer if strictly 10 digits or pairs.

  return sanitized
}
