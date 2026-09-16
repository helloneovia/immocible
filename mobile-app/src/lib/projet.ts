import type { RingValue } from '@/components/brand/TargetRing'
import { formatNumber } from '@/lib/format'
import { capitalize } from '@/lib/labels'
import { parseCaracteristiques } from '@/lib/recherche'
import type { QuestionnaireData, Recherche } from '@/lib/types'

export const EMPTY_PROJECT: QuestionnaireData = {
  situationFamiliale: '',
  nombreEnfants: '',
  situationProfessionnelle: '',
  typeBien: [],
  budgetMin: '',
  budgetMax: '',
  surfaceMin: '',
  surfaceMax: '',
  nombrePieces: [],
  localisation: [],
  drawnArea: null,
  balcon: false,
  terrasse: false,
  jardin: false,
  parking: false,
  cave: false,
  ascenseur: false,
  apport: '',
  financement: '',
  dureePret: '',
  delaiRecherche: '',
  flexibilite: '',
  salaire: '',
  patrimoine: '',
  commentaires: '',
}

/** Données renvoyées par GET /api/acquereur/questionnaire, complétées et normalisées. */
// Confirmation « Recherche de biens en cours » : affichée une fois, juste après
// l'enregistrement complet du projet (et non à chaque lancement de l'application).
let confirmationPending = false

export function flagProjectSaved() {
  confirmationPending = true
}

export function consumeProjectSaved() {
  const pending = confirmationPending
  confirmationPending = false
  return pending
}

export function normalizeProject(saved: Partial<QuestionnaireData> | null | undefined): QuestionnaireData {
  if (!saved) return EMPTY_PROJECT
  return {
    ...EMPTY_PROJECT,
    ...saved,
    typeBien: saved.typeBien || [],
    localisation: saved.localisation || [],
    drawnArea: saved.drawnArea ?? null,
    nombrePieces: Array.isArray(saved.nombrePieces) ? saved.nombrePieces : saved.nombrePieces ? [saved.nombrePieces] : [],
  } as QuestionnaireData
}

/** Questions du parcours, une par écran, dans l'ordre. */
export type StepKey = 'type' | 'pieces' | 'budget' | 'financement' | 'lieu' | 'criteres' | 'situation' | 'revenus' | 'calendrier'

export const STEP_ORDER: StepKey[] = ['type', 'pieces', 'budget', 'financement', 'lieu', 'criteres', 'situation', 'revenus', 'calendrier']

/** Sections du récapitulatif « Mon projet », chacune modifiable séparément. */
export type SectionKey = 'bien' | 'budget' | 'lieu' | 'criteres' | 'situation' | 'calendrier'

export const SECTION_STEPS: Record<SectionKey, StepKey[]> = {
  bien: ['type', 'pieces'],
  budget: ['budget', 'financement'],
  lieu: ['lieu'],
  criteres: ['criteres'],
  situation: ['situation', 'revenus'],
  calendrier: ['calendrier'],
}

const filled = (value?: string | null) => !!value && `${value}`.trim() !== '' && `${value}` !== '0'

/** Les trois anneaux de la cible : le bien, le budget, le lieu. */
export function projectRings(data: QuestionnaireData): RingValue[] {
  const bien = (data.typeBien.length ? 0.6 : 0) + (data.nombrePieces.length || filled(data.surfaceMin) ? 0.4 : 0)
  const budget = (filled(data.budgetMax) ? 0.6 : 0) + (filled(data.financement) ? 0.4 : 0)
  const lieu = data.localisation.length || data.drawnArea ? 1 : 0
  return [
    { label: 'Le bien', value: bien },
    { label: 'Le budget', value: budget },
    { label: 'Le lieu', value: lieu },
  ]
}

export function projectCompletion(data: QuestionnaireData) {
  const rings = projectRings(data)
  return rings.reduce((sum, r) => sum + r.value, 0) / rings.length
}

/** Titre court du projet : « Appartement ou maison · Lyon ». */
export function projectHeadline(data: QuestionnaireData) {
  const types = data.typeBien.map(capitalize)
  const what = types.length === 0 ? 'Votre futur bien' : types.length === 1 ? types[0] : `${types.slice(0, -1).join(', ')} ou ${types[types.length - 1].toLowerCase()}`
  const where = data.localisation[0] ?? (data.drawnArea ? 'Zone sur mesure' : null)
  return where ? `${what} · ${where}` : what
}

export function budgetLabel(min?: string | number | null, max?: string | number | null) {
  const hasMin = filled(min != null ? `${min}` : '')
  const hasMax = filled(max != null ? `${max}` : '')
  if (hasMin && hasMax) return `${formatNumber(min)} – ${formatNumber(max)} €`
  if (hasMax) return `Jusqu'à ${formatNumber(max)} €`
  if (hasMin) return `À partir de ${formatNumber(min)} €`
  return 'Non renseigné'
}

/** Paliers du curseur de budget : fins en dessous d'un million, plus larges au-delà. */
export const BUDGET_STEPS = (() => {
  const steps: number[] = []
  for (let v = 50_000; v < 1_000_000; v += 25_000) steps.push(v)
  for (let v = 1_000_000; v <= 3_000_000; v += 100_000) steps.push(v)
  return steps
})()

/**
 * Complétude d'un dossier acquéreur vue par une agence : les informations qui
 * permettent de qualifier un projet avant de contacter l'acquéreur.
 */
export function dossierCompletion(search: Recherche) {
  const c = parseCaracteristiques(search)
  const checks = [
    search.typeBien?.length > 0,
    (search.prixMax || 0) > 0,
    search.localisation?.length > 0 || !!c.drawnArea,
    search.nombrePieces?.length > 0 || (search.surfaceMin || 0) > 0,
    filled(search.financement),
    filled(c.apport),
    filled(c.delaiRecherche),
    filled(c.situationProfessionnelle),
  ]
  return checks.filter(Boolean).length / checks.length
}
