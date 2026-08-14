import Link from 'next/link'
import { Logo } from '@/components/ui/Logo'

/**
 * Pied de page public unique, partagé par la landing et les pages blog.
 * Remplace les trois footers dupliqués qui pointaient tous vers `href="#"`.
 */
export function Footer({ copyright }: { copyright?: string }) {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-white border-t border-slate-200 py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center space-y-8 text-center">
          <Link href="/" className="group" aria-label="IMMOCIBLE — accueil">
            <Logo
              className="text-slate-900"
              iconClassName="h-10 w-10 transition-transform duration-300 group-hover:scale-105"
            />
          </Link>
          <nav
            aria-label="Liens légaux"
            className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-slate-500 font-medium"
          >
            <Link href="/mentions-legales" className="hover:text-slate-900 transition-colors">Mentions légales</Link>
            <Link href="/confidentialite" className="hover:text-slate-900 transition-colors">Confidentialité</Link>
            <Link href="/cgu" className="hover:text-slate-900 transition-colors">CGU / CGV</Link>
            <Link href="/blogs" className="hover:text-slate-900 transition-colors">Blog</Link>
          </nav>
          <p className="text-sm text-slate-500 font-light">
            {copyright || `© ${year} IMMOCIBLE. L'immobilier repensé. Tous droits réservés.`}
          </p>
        </div>
      </div>
    </footer>
  )
}
