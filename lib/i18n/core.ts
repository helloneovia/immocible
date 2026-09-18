import { en } from './en'
import { fr } from './fr'

/**
 * Traductions du site. Le français est la langue par défaut et la référence : chaque
 * dictionnaire anglais (lib/i18n/en/*) reprend exactement les clés françaises.
 * La langue n'est jamais déduite du navigateur : l'utilisateur choisit l'anglais
 * (cookie immocible_lang) ; l'application mobile l'envoie dans l'en-tête X-Immocible-Lang.
 */
export type Locale = 'fr' | 'en'
export const DEFAULT_LOCALE: Locale = 'fr'
export const LOCALE_COOKIE = 'immocible_lang'
export const LOCALE_HEADER = 'x-immocible-lang'

export function isLocale(value: unknown): value is Locale {
    return value === 'fr' || value === 'en'
}

type Dictionary = typeof fr
const DICTIONARIES: Record<Locale, Dictionary> = { fr, en }

type Leaves<T, P extends string = ''> = {
    [K in keyof T & string]: T[K] extends string ? `${P}${K}` : Leaves<T[K], `${P}${K}.`>
}[keyof T & string]
/** Clé de traduction : « espace.cle » (ex. t('auth.login.title')). */
export type TKey = Leaves<Dictionary>
export type TParams = Record<string, string | number>
export type TFunction = (key: TKey, params?: TParams) => string

function lookup(dict: unknown, key: string): string | undefined {
    const value = key.split('.').reduce<unknown>((node, part) => (node && typeof node === 'object' ? (node as any)[part] : undefined), dict)
    return typeof value === 'string' ? value : undefined
}

/** Traduction pour une langue donnée ; les « {nom} » du texte sont remplacés par les paramètres. */
export function translate(locale: Locale, key: TKey, params?: TParams): string {
    const value = lookup(DICTIONARIES[locale], key) ?? lookup(fr, key) ?? key
    return params ? value.replace(/\{(\w+)\}/g, (match, name) => (name in params ? String(params[name]) : match)) : value
}

export function createT(locale: Locale): TFunction {
    return (key, params) => translate(locale, key, params)
}

/** Locale Intl pour les dates et nombres. */
export function intlLocale(locale: Locale) {
    return locale === 'en' ? 'en-GB' : 'fr-FR'
}
