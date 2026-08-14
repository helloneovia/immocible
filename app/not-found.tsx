import Link from 'next/link'
import { Logo } from '@/components/ui/Logo'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Page introuvable',
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-center px-6 py-20">
      <Link href="/" className="mb-10" aria-label="IMMOCIBLE — accueil">
        <Logo className="text-slate-900" iconClassName="h-12 w-12" wordmarkClassName="text-2xl" />
      </Link>
      <p className="text-6xl font-bold text-slate-900">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-slate-800">Cette page n&apos;existe pas (ou plus)</h1>
      <p className="mt-3 max-w-md text-slate-500">
        Le lien que vous avez suivi est peut-être rompu, ou la page a été déplacée.
      </p>
      <div className="mt-10 flex flex-col sm:flex-row gap-4">
        <Link href="/">
          <Button className="bg-slate-900 text-white hover:bg-slate-800 px-8 py-6 h-auto text-base">
            Retour à l&apos;accueil
          </Button>
        </Link>
        <Link href="/blogs">
          <Button variant="outline" className="px-8 py-6 h-auto text-base border-slate-300">
            Voir le blog
          </Button>
        </Link>
      </div>
    </main>
  )
}
