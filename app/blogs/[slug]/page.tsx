import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { PublicNavbar } from '@/components/layout/PublicNavbar'
import { Footer } from '@/components/layout/Footer'

export const revalidate = 3600

const ADNEO_WEBSITE_ID = process.env.NEXT_PUBLIC_ADNEO_WEBSITE_ID || 'cmpxtvs0500003aleux4hn8nv'

interface Article {
  id: string
  slug: string
  title: string
  excerpt?: string
  featuredImage?: string
  content?: string
  url?: string
}

async function getArticle(slug: string): Promise<Article | null> {
  try {
    const res = await fetch(
      `https://adneo.cloud/api/widget/articles?websiteId=${ADNEO_WEBSITE_ID}`,
      { next: { revalidate: 3600 } },
    )
    if (!res.ok) return null
    const data = await res.json()
    const articles: Article[] = Array.isArray(data?.articles) ? data.articles : []
    return articles.find((a) => a.slug === slug) || null
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = await getArticle(params.slug)
  if (!article) return { title: 'Article introuvable', robots: { index: false, follow: false } }
  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: `/blogs/${article.slug}` },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: article.featuredImage ? [article.featuredImage] : undefined,
    },
  }
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await getArticle(params.slug)
  if (!article) notFound()

  // Le corps est affiché en texte brut (paragraphes) pour ne pas injecter de
  // HTML tiers non fiable. À enrichir quand la structure de l'API Adneo est connue.
  const paragraphs = (article.content || article.excerpt || '')
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      <PublicNavbar />

      <article className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-28 max-w-3xl">
        <Link href="/blogs" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" />
          Retour au blog
        </Link>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">{article.title}</h1>

        {article.featuredImage && (
          // eslint-disable-next-line @next/next/no-img-element -- image tierce (host dynamique Adneo)
          <img
            src={article.featuredImage}
            alt={article.title}
            className="w-full rounded-xl mb-10 object-cover"
          />
        )}

        <div className="prose prose-slate max-w-none space-y-5">
          {paragraphs.map((p, i) => (
            <p key={i} className="text-lg text-slate-700 leading-relaxed font-light">
              {p}
            </p>
          ))}
        </div>
      </article>

      <Footer />
    </div>
  )
}
