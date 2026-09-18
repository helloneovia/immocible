'use client'

import { useI18n } from '@/lib/i18n/client'
import type { Locale } from '@/lib/i18n/core'

const OPTIONS: { value: Locale; label: string; name: string }[] = [
    { value: 'fr', label: 'FR', name: 'Français' },
    { value: 'en', label: 'EN', name: 'English' },
]

/** Sélecteur FR / EN (le français reste la langue par défaut). */
export function LanguageSwitcher({ className = '', dark = false }: { className?: string; dark?: boolean }) {
    const { locale, setLocale } = useI18n()
    return (
        <div role="group" aria-label="Langue / Language" className={`inline-flex items-center rounded-full border p-0.5 text-xs font-semibold ${dark ? 'border-white/20' : 'border-slate-200'} ${className}`}>
            {OPTIONS.map((option) => {
                const active = option.value === locale
                return (
                    <button
                        key={option.value}
                        type="button"
                        lang={option.value}
                        aria-label={option.name}
                        aria-pressed={active}
                        onClick={() => !active && setLocale(option.value)}
                        className={`rounded-full px-2.5 py-1 transition-colors ${active
                            ? dark ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'
                            : dark ? 'text-white/70 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                        {option.label}
                    </button>
                )
            })}
        </div>
    )
}
