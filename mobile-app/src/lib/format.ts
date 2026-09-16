const euro = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 })

export function formatNumber(value?: number | string | null) {
  const n = typeof value === 'string' ? parseFloat(value) : value
  if (n === null || n === undefined || Number.isNaN(n)) return ''
  return euro.format(n)
}

export function formatEuro(value?: number | string | null) {
  const formatted = formatNumber(value)
  return formatted ? `${formatted} €` : ''
}

export function formatDate(value?: string | Date | null) {
  if (!value) return ''
  return new Date(value).toLocaleDateString('fr-FR')
}

export function formatTime(value: string | Date) {
  return new Date(value).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

export function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export function formatDayLabel(value: string | Date) {
  const date = new Date(value)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)
  if (isSameDay(date, today)) return "Aujourd'hui"
  if (isSameDay(date, yesterday)) return 'Hier'
  return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
}

/** Heure si aujourd'hui, sinon date courte — pour la liste des conversations. */
export function formatRelative(value: string | Date) {
  const date = new Date(value)
  if (isSameDay(date, new Date())) return formatTime(date)
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
}

/** Montant court pour les listes : « 450 k€ », « 1,2 M€ ». */
export function compactEuro(value?: number | null) {
  if (!value) return '—'
  if (value >= 1_000_000) return `${(value / 1_000_000).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} M€`
  return `${Math.round(value / 1000)} k€`
}

/** Tarif d'abonnement : « 49,90 » ou « 399 » (décimales seulement si nécessaires). */
export function formatPlanPrice(price: number) {
  const fixed = Number.isInteger(price) ? String(price) : price.toFixed(2)
  return fixed.replace('.', ',')
}

/** Aperçu sur une ligne : les retours à la ligne d'un message ne coupent pas la cellule. */
export function singleLine(text?: string | null) {
  return (text || '').replace(/\s+/g, ' ').trim()
}

export function initial(name?: string | null) {
  return (name || '?').trim().charAt(0).toUpperCase() || '?'
}
