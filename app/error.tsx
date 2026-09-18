'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/ui/Logo'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n/client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { t } = useI18n()

  useEffect(() => {
    // Journalisation côté client ; à brancher sur un service de suivi d'erreurs.
    console.error(error)
  }, [error])

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-center px-6 py-20">
      <Link href="/" className="mb-10" aria-label={t('common.brand.homeAria')}>
        <Logo className="text-slate-900" iconClassName="h-12 w-12" wordmarkClassName="text-2xl" />
      </Link>
      <h1 className="text-2xl font-semibold text-slate-800">{t('common.error.title')}</h1>
      <p className="mt-3 max-w-md text-slate-500">
        {t('common.error.text')}
      </p>
      <div className="mt-10 flex flex-col sm:flex-row gap-4">
        <Button
          onClick={reset}
          className="bg-slate-900 text-white hover:bg-slate-800 px-8 py-6 h-auto text-base"
        >
          {t('common.error.retry')}
        </Button>
        <Link href="/">
          <Button variant="outline" className="px-8 py-6 h-auto text-base border-slate-300">
            {t('common.error.backHome')}
          </Button>
        </Link>
      </div>
    </main>
  )
}
