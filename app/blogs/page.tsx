import Link from 'next/link'
import { Home } from 'lucide-react'
import { PublicNavbar } from '@/components/layout/PublicNavbar'
import Script from 'next/script'
import { getAppSettings } from '@/lib/settings'

export const metadata = {
  title: 'Blog - IMMOCIBLE',
  description: 'Actualités et articles sur l\'immobilier d\'exception',
}

export const revalidate = 60

export default async function BlogsPage() {
  const settings = await getAppSettings()



  return (
    <div className="min-h-screen bg-slate-50 relative overflow-x-hidden font-sans text-slate-900 flex flex-col">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative min-h-[40vh] flex items-center justify-center">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')" }}
        >
          <div className="absolute inset-0 bg-slate-900/70 mix-blend-multiply"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center text-white mt-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 drop-shadow-lg">
            Le Blog IMMOCIBLE
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-slate-200 max-w-2xl mx-auto font-light drop-shadow-md">
            Actualités, conseils et analyses du marché de l'immobilier d'exception.
          </p>
        </div>
      </section>

      {/* Blog List Section */}
      <section className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div id="adneo-blog"></div>
        <Script src="https://adneo.cloud/api/embed/cmps3d10x00023anxj4lg22na?theme=dark" strategy="lazyOnload" />
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-16 mt-auto">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center space-y-8 text-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="h-10 w-10 bg-slate-900 rounded-lg flex items-center justify-center group-hover:bg-slate-800 transition-colors">
                <Home className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-semibold tracking-wide text-slate-900">
                IMMOCIBLE
              </span>
            </Link>
            <div className="flex space-x-6 text-sm text-slate-500 font-medium">
              <Link href="#" className="hover:text-slate-900 transition-colors">Mentions légales</Link>
              <Link href="#" className="hover:text-slate-900 transition-colors">Confidentialité</Link>
              <Link href="#" className="hover:text-slate-900 transition-colors">Contact</Link>
            </div>
            <p className="text-sm text-slate-400 font-light">
              {settings.text_footer_copyright || '© 2024 IMMOCIBLE. L\'immobilier repensé. Tous droits réservés.'}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
