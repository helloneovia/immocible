import Link from 'next/link'
import type { Metadata } from 'next'
import { PublicNavbar } from '@/components/layout/PublicNavbar'
import { Footer } from '@/components/layout/Footer'
import { getAppSettings } from '@/lib/settings'

export const metadata: Metadata = {
  title: 'Blog',
  description:
    "Actualités, conseils et analyses du marché de l'immobilier d'exception et off-market par IMMOCIBLE.",
  alternates: { canonical: '/blogs' },
}

export const revalidate = 3600

const ADNEO_WEBSITE_ID = process.env.NEXT_PUBLIC_ADNEO_WEBSITE_ID || 'cmpxtvs0500003aleux4hn8nv'

interface Article {
  id: string
  slug: string
  title: string
  excerpt?: string
  featuredImage?: string
  url?: string
}

async function getArticles(): Promise<Article[]> {
  try {
    const res = await fetch(
      `https://adneo.cloud/api/widget/articles?websiteId=${ADNEO_WEBSITE_ID}`,
      { next: { revalidate: 3600 } },
    )
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data?.articles) ? data.articles : []
  } catch {
    // Le blog ne doit jamais faire tomber la page si le service tiers est indisponible.
    return []
  }
}

export default async function BlogsPage() {
  const settings = await getAppSettings()
  const articles = await getArticles()

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
            Actualités, conseils et analyses du marché de l&apos;immobilier d&apos;exception.
          </p>
        </div>
      </section>

      {/* Blog List Section */}
      <section className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {articles.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-slate-500 font-light">
              Nos premiers articles arrivent très bientôt. Revenez prochainement !
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {articles.map((article) => {
              const cardClass =
                'border border-slate-200 bg-white rounded-xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group flex flex-col'
              const cardInner = (
                <>
                  <div className="overflow-hidden">
                    {article.featuredImage && (
                      // eslint-disable-next-line @next/next/no-img-element -- image tierce (host dynamique Adneo)
                      <img
                        src={article.featuredImage}
                        alt={article.title}
                        loading="lazy"
                        className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <div className="p-6 flex-grow flex flex-col">
                    <h2 className="font-semibold text-xl mb-3 text-slate-900 line-clamp-2">{article.title}</h2>
                    <p className="text-slate-500 font-light leading-relaxed line-clamp-3 mb-4">{article.excerpt}</p>
                    <span className="mt-auto text-sm font-semibold text-slate-900 group-hover:text-slate-700 transition-colors flex items-center">
                      Lire l&apos;article
                      <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </>
              )

              return article.url ? (
                <a key={article.id} href={article.url} target="_blank" rel="noopener noreferrer" className={cardClass}>
                  {cardInner}
                </a>
              ) : (
                <Link key={article.id} href={`/blogs/${article.slug}`} className={cardClass}>
                  {cardInner}
                </Link>
              )
            })}
          </div>
        )}
      </section>

      <Footer copyright={settings.text_footer_copyright} />
    </div>
  )
}
