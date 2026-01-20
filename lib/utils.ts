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
  return ${surface} mÂ²
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
    raisons.push(Budget correspond)
  }

  if (recherche.zones.includes(bien.quartier || bien.ville)) {
    score += 25
    raisons.push(Zone recherchÃ©e)
  }

  if (recherche.typeBien.includes(bien.typeBien)) {
    score += 15
    raisons.push(Type de bien correspond)
  }

  return {
    score: Math.round(score),
    raisons,
    suggestions,
  }
}
