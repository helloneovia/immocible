import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getLocales } from 'expo-localization'
import { en } from './en'
import { fr } from './fr'

/**
 * Traductions de l'application. Le français est la langue par défaut et la référence :
 * chaque dictionnaire anglais (src/i18n/en/*) doit reprendre exactement les clés françaises.
 * La langue n'est jamais déduite de l'appareil : l'utilisateur choisit l'anglais dans l'app.
 */
export type Locale = 'fr' | 'en'
export const LOCALES: { value: Locale; label: string }[] = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
]
export const DEFAULT_LOCALE: Locale = 'fr'
const STORAGE_KEY = 'immocible.locale'

type Dictionary = typeof fr
const DICTIONARIES: Record<Locale, Dictionary> = { fr, en }

type Leaves<T, P extends string = ''> = {
  [K in keyof T & string]: T[K] extends string ? `${P}${K}` : Leaves<T[K], `${P}${K}.`>
}[keyof T & string]
/** Clé de traduction : « espace.cle » (ex. t('auth.login.title')). */
export type TKey = Leaves<Dictionary>
export type TParams = Record<string, string | number>

/**
 * Langue du téléphone : anglais si l'appareil est en anglais, français sinon (langue par défaut).
 * Un choix fait dans l'app (bouton FR / EN) reste prioritaire.
 */
function deviceLocale(): Locale {
  try {
    return getLocales()[0]?.languageCode === 'en' ? 'en' : DEFAULT_LOCALE
  } catch {
    return DEFAULT_LOCALE
  }
}

let current: Locale = deviceLocale()

/** Langue active, utilisable hors composants (API, formatage). */
export function getLocale(): Locale {
  return current
}

function lookup(dict: unknown, key: string): string | undefined {
  const value = key.split('.').reduce<unknown>((node, part) => (node && typeof node === 'object' ? (node as any)[part] : undefined), dict)
  return typeof value === 'string' ? value : undefined
}

/**
 * Traduit une clé. Les paramètres remplacent les « {nom} » du texte.
 * Utilisable pendant le rendu ou dans une fonction : l'arbre est remonté au changement de langue.
 */
export function t(key: TKey, params?: TParams): string {
  const value = lookup(DICTIONARIES[current], key) ?? lookup(fr, key) ?? key
  return params ? value.replace(/\{(\w+)\}/g, (match, name) => (name in params ? String(params[name]) : match)) : value
}

/** Locale Intl pour les dates et nombres. */
export function intlLocale(locale: Locale = current) {
  return locale === 'en' ? 'en-GB' : 'fr-FR'
}

interface I18nValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: typeof t
}

const I18nContext = createContext<I18nValue>({ locale: DEFAULT_LOCALE, setLocale: () => {}, t })

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(current)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (stored === 'en' || stored === 'fr') {
          current = stored
          setLocaleState(stored)
        }
      })
      .catch(() => {})
      .finally(() => setReady(true))
  }, [])

  const setLocale = useCallback((next: Locale) => {
    current = next
    setLocaleState(next)
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {})
  }, [])

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale])

  // L'écran de démarrage reste affiché le temps de lire la langue enregistrée.
  if (!ready) return null
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

/** Langue active et traduction ; un changement de langue re-rend les écrans. */
export function useI18n() {
  return useContext(I18nContext)
}
