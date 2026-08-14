import { PublicNavbar } from '@/components/layout/PublicNavbar'
import { Footer } from '@/components/layout/Footer'

/** Coque commune aux pages légales : navbar, en-tête sombre, contenu, footer. */
export function LegalShell({
  title,
  lastUpdated,
  children,
}: {
  title: string
  lastUpdated?: string
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      <PublicNavbar />
      <header className="bg-slate-900 text-white pt-32 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{title}</h1>
          {lastUpdated && <p className="text-sm text-slate-400 mt-3">Dernière mise à jour : {lastUpdated}</p>}
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-3xl">
        <div className="text-slate-700 leading-relaxed">{children}</div>
      </main>
      <Footer />
    </div>
  )
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold text-slate-900 mb-3">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

/** Marqueur visuel pour les informations que l'exploitant doit renseigner. */
export function ToFill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline rounded bg-amber-100 px-1.5 py-0.5 text-amber-900 font-medium">
      {children}
    </span>
  )
}
