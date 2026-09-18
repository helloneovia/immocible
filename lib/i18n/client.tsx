'use client'

import { createContext, useCallback, useContext, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createT, DEFAULT_LOCALE, LOCALE_COOKIE, type Locale, type TFunction } from './core'

interface I18nValue {
    locale: Locale
    t: TFunction
    setLocale: (locale: Locale) => void
}

const I18nContext = createContext<I18nValue>({ locale: DEFAULT_LOCALE, t: createT(DEFAULT_LOCALE), setLocale: () => {} })

/** Fournit la langue lue côté serveur (cookie) aux composants client. */
export function I18nProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
    const router = useRouter()

    const setLocale = useCallback(
        (next: Locale) => {
            // Un an ; le rendu serveur relit le cookie au rafraîchissement.
            document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`
            router.refresh()
        },
        [router],
    )

    const value = useMemo(() => ({ locale, t: createT(locale), setLocale }), [locale, setLocale])
    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

/** Langue active et traduction dans un composant client. */
export function useI18n() {
    return useContext(I18nContext)
}
