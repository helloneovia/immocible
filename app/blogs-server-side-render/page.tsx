import Link from 'next/link'
import { Home } from 'lucide-react'
import { PublicNavbar } from '@/components/layout/PublicNavbar'
import { getAppSettings } from '@/lib/settings'

export const metadata = {
  title: 'Blog - IMMOCIBLE (SSR)',
  description: 'Actualités et articles sur l\'immobilier d\'exception',
}

export const revalidate = 60

export default async function BlogsSSRPage() {
  const settings = await getAppSettings()

  // Fetch articles on the server for perfect SEO
  const res = await fetch("https://adneo.cloud/api/widget/articles?websiteId=cmpxtvs0500003aleux4hn8nv", { 
    next: { revalidate: 3600 } 
  });
  const data = await res.json();
  const articles = data.articles || [];

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {articles.map((article: any) => (
            <a href={`/blogs/${article.slug}`} key={article.id} className="border border-slate-200 bg-white rounded-xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group flex flex-col">
              <div className="overflow-hidden">
                {article.featuredImage && (
                  <img 
                    src={article.featuredImage} 
                    alt={article.title} 
                    className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-105" 
                  />
                )}
              </div>
              <div className="p-6 flex-grow flex flex-col">
                <h3 className="font-semibold text-xl mb-3 text-slate-900 line-clamp-2">{article.title}</h3>
                <p className="text-slate-500 font-light leading-relaxed line-clamp-3 mb-4">{article.excerpt}</p>
                
                <span className="mt-auto text-sm font-semibold text-slate-900 group-hover:text-slate-700 transition-colors flex items-center">
                  Lire l'article
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </a>
          ))}
        </div>
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
