import { t, type TKey, type TParams } from '@/i18n'

// Options du questionnaire : mêmes valeurs que app/acquereur/questionnaire/page.tsx.
// Les valeurs sont envoyées à l'API telles quelles ; seuls les libellés sont traduits.
export type Option = { value: string; label: string }

/**
 * Option dont le libellé est traduit à la lecture (getter) : les listes restent des
 * constantes de module sans appeler t() au chargement, et suivent la langue active.
 */
function option(value: string, key: TKey, params?: TParams): Option {
  return {
    value,
    get label() {
      return t(key, params)
    },
  }
}

export const SITUATION_FAMILIALE: Option[] = [
  option('celibataire', 'labels.situationFamiliale.celibataire'),
  option('marie', 'labels.situationFamiliale.marie'),
  option('pacs', 'labels.situationFamiliale.pacs'),
  option('concubinage', 'labels.situationFamiliale.concubinage'),
  option('divorce', 'labels.situationFamiliale.divorce'),
  option('veuf', 'labels.situationFamiliale.veuf'),
]

export const NOMBRE_ENFANTS: Option[] = [
  option('0', 'labels.nombreEnfants.none'),
  option('1', 'labels.nombreEnfants.one'),
  option('2', 'labels.nombreEnfants.many', { count: 2 }),
  option('3', 'labels.nombreEnfants.many', { count: 3 }),
  option('4+', 'labels.nombreEnfants.fourPlus'),
]

export const SITUATION_PRO: Option[] = [
  option('cdi', 'labels.situationPro.cdi'),
  option('cdd', 'labels.situationPro.cdd'),
  option('freelance', 'labels.situationPro.freelance'),
  option('retraite', 'labels.situationPro.retraite'),
  option('chomage', 'labels.situationPro.chomage'),
  option('etudiant', 'labels.situationPro.etudiant'),
  option('autre', 'labels.situationPro.autre'),
]

export const FINANCEMENT: Option[] = [
  option('pret-bancaire', 'labels.financement.pretBancaire'),
  option('pret-relais', 'labels.financement.pretRelais'),
  option('cash', 'labels.financement.cash'),
  option('mixte', 'labels.financement.mixte'),
  option('autre', 'labels.financement.autre'),
]

export const DUREE_PRET: Option[] = ['10', '15', '20', '25', '30'].map((v) => option(v, 'labels.dureePret', { years: v }))

export const DELAI_RECHERCHE: Option[] = [
  option('urgent', 'labels.delaiRecherche.urgent'),
  option('1-3', 'labels.delaiRecherche.oneToThree'),
  option('3-6', 'labels.delaiRecherche.threeToSix'),
  option('6-12', 'labels.delaiRecherche.sixToTwelve'),
  option('12+', 'labels.delaiRecherche.twelvePlus'),
]

export const FLEXIBILITE: Option[] = [
  option('strict', 'labels.flexibilite.strict'),
  option('modere', 'labels.flexibilite.modere'),
  option('flexible', 'labels.flexibilite.flexible'),
]

/** Types de bien : valeurs en minuscules, comme enregistrées par l'API. */
export const TYPES_BIEN: Option[] = [
  option('appartement', 'labels.typeBien.appartement'),
  option('maison', 'labels.typeBien.maison'),
  option('terrain', 'labels.typeBien.terrain'),
  option('studio', 'labels.typeBien.studio'),
  option('loft', 'labels.typeBien.loft'),
  option('duplex', 'labels.typeBien.duplex'),
  option('penthouse', 'labels.typeBien.penthouse'),
]

/** Libellé d'un type de bien enregistré (« appartement » → « Appartement » / « Apartment »). */
export function typeBienLabel(value: string) {
  return TYPES_BIEN.find((o) => o.value === value?.toLowerCase())?.label ?? capitalize(value)
}

export const NOMBRE_PIECES = ['1', '2', '3', '4', '5', '6+']

type ExtraKey = 'balcon' | 'terrasse' | 'jardin' | 'parking' | 'cave' | 'ascenseur'

function extra(key: ExtraKey) {
  return {
    key,
    get label() {
      return t(`labels.extras.${key}`)
    },
  }
}

export const EXTRAS = [extra('balcon'), extra('terrasse'), extra('jardin'), extra('parking'), extra('cave'), extra('ascenseur')] as const

export function labelFor(options: Option[], value?: string | null, fallback = t('labels.notSpecified')) {
  if (!value) return fallback
  return options.find((o) => o.value === value)?.label ?? value
}

export function delaiShortLabel(value?: string | null) {
  switch (value) {
    case 'urgent':
      return t('labels.delaiShort.urgent')
    case '1-3':
      return t('labels.delaiShort.oneToThree')
    case '3-6':
      return t('labels.delaiShort.threeToSix')
    case '6-12':
      return t('labels.delaiShort.sixToTwelve')
    case '12+':
      return t('labels.delaiShort.twelvePlus')
    default:
      return value || t('labels.delaiShort.undefined')
  }
}

export function capitalize(value: string) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value
}
