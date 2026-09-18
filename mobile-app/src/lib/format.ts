import { getLocale, intlLocale, t } from '@/i18n'

// Formateur recréé à chaque appel : il suit la langue active.
const euro = () => new Intl.NumberFormat(intlLocale(), { maximumFractionDigits: 0 })

export function formatNumber(value?: number | string | null) {
  const n = typeof value === 'string' ? parseFloat(value) : value
  if (n === null || n === undefined || Number.isNaN(n)) return ''
  return euro().format(n)
}

/** Montant en euros : « 450 000 € » en français, « €450,000 » en anglais. */
export function formatEuro(value?: number | string | null) {
  const formatted = formatNumber(value)
  if (!formatted) return ''
  return getLocale() === 'en' ? `€${formatted}` : `${formatted} €`
}

export function formatDate(value?: string | Date | null) {
  if (!value) return ''
  return new Date(value).toLocaleDateString(intlLocale())
}

export function formatTime(value: string | Date) {
  return new Date(value).toLocaleTimeString(intlLocale(), { hour: '2-digit', minute: '2-digit' })
}

export function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export function formatDayLabel(value: string | Date) {
  const date = new Date(value)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)
  if (isSameDay(date, today)) return t('labels.format.today')
  if (isSameDay(date, yesterday)) return t('labels.format.yesterday')
  return date.toLocaleDateString(intlLocale(), { weekday: 'long', day: 'numeric', month: 'long' })
}

/** Heure si aujourd'hui, sinon date courte — pour la liste des conversations. */
export function formatRelative(value: string | Date) {
  const date = new Date(value)
  if (isSameDay(date, new Date())) return formatTime(date)
  return date.toLocaleDateString(intlLocale(), { day: '2-digit', month: '2-digit' })
}

/** Montant court pour les listes : « 450 k€ », « 1,2 M€ » (« €450k », « €1.2M » en anglais). */
export function compactEuro(value?: number | null) {
  if (!value) return '—'
  if (value >= 1_000_000) {
    const millions = (value / 1_000_000).toLocaleString(intlLocale(), { maximumFractionDigits: 1 })
    return t('labels.format.millions', { value: millions })
  }
  return t('labels.format.thousands', { value: Math.round(value / 1000) })
}

/** Tarif d'abonnement : « 49,90 » ou « 399 » (décimales seulement si nécessaires ; « 49.90 » en anglais). */
export function formatPlanPrice(price: number) {
  const fixed = Number.isInteger(price) ? String(price) : price.toFixed(2)
  return getLocale() === 'en' ? fixed : fixed.replace('.', ',')
}

/** Aperçu sur une ligne : les retours à la ligne d'un message ne coupent pas la cellule. */
export function singleLine(text?: string | null) {
  return (text || '').replace(/\s+/g, ' ').trim()
}

export function initial(name?: string | null) {
  return (name || '?').trim().charAt(0).toUpperCase() || '?'
}
