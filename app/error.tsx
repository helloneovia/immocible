'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/ui/Logo'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Journalisation côté client ; à brancher sur un service de suivi d'erreurs.
    console.error(error)
  }, [error])

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-center px-6 py-20">
      <Link href="/" className="mb-10" aria-label="IMMOCIBLE — accueil">
        <Logo className="text-slate-900" iconClassName="h-12 w-12" wordmarkClassName="text-2xl" />
      </Link>
      <h1 className="text-2xl font-semibold text-slate-800">Une erreur est survenue</h1>
      <p className="mt-3 max-w-md text-slate-500">
        Nous n&apos;avons pas pu afficher cette page. Vous pouvez réessayer, ou revenir à l&apos;accueil.
      </p>
      <div className="mt-10 flex flex-col sm:flex-row gap-4">
        <Button
          onClick={reset}
          className="bg-slate-900 text-white hover:bg-slate-800 px-8 py-6 h-auto text-base"
        >
          Réessayer
        </Button>
        <Link href="/">
          <Button variant="outline" className="px-8 py-6 h-auto text-base border-slate-300">
            Retour à l&apos;accueil
          </Button>
        </Link>
      </div>
    </main>
  )
}
