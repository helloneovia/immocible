import { cookies, headers } from 'next/headers'
import { createT, DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, LOCALE_HEADER, type Locale } from './core'

/**
 * Langue de la requête (composants serveur et routes API) :
 * en-tête X-Immocible-Lang (application mobile), sinon cookie du site, sinon français.
 */
export function getLocale(): Locale {
    try {
        const fromHeader = headers().get(LOCALE_HEADER)
        if (isLocale(fromHeader)) return fromHeader
        const fromCookie = cookies().get(LOCALE_COOKIE)?.value
        if (isLocale(fromCookie)) return fromCookie
    } catch {
        // Hors contexte de requête (génération statique) : langue par défaut.
    }
    return DEFAULT_LOCALE
}

/** Fonction de traduction liée à la langue de la requête. */
export function getT() {
    return createT(getLocale())
}
