// Options du questionnaire : mêmes valeurs que app/acquereur/questionnaire/page.tsx.
export type Option = { value: string; label: string }

export const SITUATION_FAMILIALE: Option[] = [
  { value: 'celibataire', label: 'Célibataire' },
  { value: 'marie', label: 'Marié(e)' },
  { value: 'pacs', label: 'Pacsé(e)' },
  { value: 'concubinage', label: 'En concubinage' },
  { value: 'divorce', label: 'Divorcé(e)' },
  { value: 'veuf', label: 'Veuf(ve)' },
]

export const NOMBRE_ENFANTS: Option[] = [
  { value: '0', label: 'Aucun' },
  { value: '1', label: '1 enfant' },
  { value: '2', label: '2 enfants' },
  { value: '3', label: '3 enfants' },
  { value: '4+', label: '4 enfants ou plus' },
]

export const SITUATION_PRO: Option[] = [
  { value: 'cdi', label: 'CDI' },
  { value: 'cdd', label: 'CDD' },
  { value: 'freelance', label: 'Freelance / Indépendant' },
  { value: 'retraite', label: 'Retraité(e)' },
  { value: 'chomage', label: "En recherche d'emploi" },
  { value: 'etudiant', label: 'Étudiant(e)' },
  { value: 'autre', label: 'Autre' },
]

export const FINANCEMENT: Option[] = [
  { value: 'pret-bancaire', label: 'Prêt bancaire' },
  { value: 'pret-relais', label: 'Prêt relais' },
  { value: 'cash', label: 'Achat au comptant' },
  { value: 'mixte', label: 'Financement mixte' },
  { value: 'autre', label: 'Autre' },
]

export const DUREE_PRET: Option[] = ['10', '15', '20', '25', '30'].map((v) => ({ value: v, label: `${v} ans` }))

export const DELAI_RECHERCHE: Option[] = [
  { value: 'urgent', label: 'Urgent (moins de 1 mois)' },
  { value: '1-3', label: '1 à 3 mois' },
  { value: '3-6', label: '3 à 6 mois' },
  { value: '6-12', label: '6 à 12 mois' },
  { value: '12+', label: 'Plus de 12 mois' },
]

export const FLEXIBILITE: Option[] = [
  { value: 'strict', label: 'Strict (tous les critères doivent être respectés)' },
  { value: 'modere', label: 'Modéré (quelques ajustements possibles)' },
  { value: 'flexible', label: 'Flexible (ouvert aux opportunités)' },
]

export const TYPES_BIEN = ['Appartement', 'Maison', 'Terrain', 'Studio', 'Loft', 'Duplex', 'Penthouse']

export const NOMBRE_PIECES = ['1', '2', '3', '4', '5', '6+']

export const EXTRAS = [
  { key: 'balcon', label: 'Balcon' },
  { key: 'terrasse', label: 'Terrasse' },
  { key: 'jardin', label: 'Jardin' },
  { key: 'parking', label: 'Parking' },
  { key: 'cave', label: 'Cave' },
  { key: 'ascenseur', label: 'Ascenseur' },
] as const

export function labelFor(options: Option[], value?: string | null, fallback = 'Non spécifié') {
  if (!value) return fallback
  return options.find((o) => o.value === value)?.label ?? value
}

export function delaiShortLabel(value?: string | null) {
  switch (value) {
    case 'urgent':
      return 'Urgent (< 1 mois)'
    case '1-3':
      return '1 à 3 mois'
    case '3-6':
      return '3 à 6 mois'
    case '6-12':
      return '6 à 12 mois'
    case '12+':
      return '+ 12 mois'
    default:
      return value || 'Non défini'
  }
}

export function capitalize(value: string) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value
}
