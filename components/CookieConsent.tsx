'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n/client'

const CONSENT_KEY = 'immocible_cookie_consent'
export const CONSENT_EVENT = 'immocible-consent-changed'

/** Renvoie true si l'utilisateur a accepté la mesure d'audience. */
export function hasAnalyticsConsent(): boolean {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(CONSENT_KEY) === 'accepted'
}

export function CookieConsent() {
  const { t } = useI18n()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const choice = window.localStorage.getItem(CONSENT_KEY)
    if (!choice) setVisible(true)
  }, [])

  const decide = (value: 'accepted' | 'refused') => {
    window.localStorage.setItem(CONSENT_KEY, value)
    window.dispatchEvent(new Event(CONSENT_EVENT))
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label={t('common.cookies.aria')}
      className="fixed bottom-0 inset-x-0 z-[9998] p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]"
    >
      <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white shadow-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <p className="text-sm text-slate-600 flex-1">
          {t('common.cookies.textBefore')}{' '}
          <Link href="/confidentialite" className="underline text-slate-900 font-medium">
            {t('common.cookies.privacyLink')}
          </Link>
          .
        </p>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={() => decide('refused')}
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 border border-slate-300 hover:bg-slate-50 transition-colors"
          >
            {t('common.cookies.refuse')}
          </button>
          <button
            onClick={() => decide('accepted')}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 transition-colors"
          >
            {t('common.cookies.accept')}
          </button>
        </div>
      </div>
    </div>
  )
}
