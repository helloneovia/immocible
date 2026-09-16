import { capitalize } from '@/lib/labels'
import type { Caracteristiques, Recherche } from '@/lib/types'

/** `caracteristiques` peut arriver sérialisé en chaîne JSON (anciennes données). */
export function parseCaracteristiques(search?: Recherche | null): Caracteristiques {
  const raw = search?.caracteristiques
  if (!raw) return {}
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as Caracteristiques
    } catch {
      return {}
    }
  }
  return raw
}

export function typesLabel(types?: string[] | null) {
  return (types || []).map(capitalize).join(', ')
}

export function buyerName(search: Recherche) {
  return search.owner?.profile?.prenom || 'Acquéreur'
}

export function buyerFullName(search: Recherche) {
  const profile = search.owner?.profile
  if (profile?.prenom) return `${profile.prenom} ${profile.nom || ''}`.trim()
  return profile?.nom || 'Acquéreur'
}
