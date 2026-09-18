import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { PublicNavbar } from '@/components/layout/PublicNavbar'
import { Footer } from '@/components/layout/Footer'
import { articleBlocks } from '@/lib/blog-content'
import { getT } from '@/lib/i18n/server'

export const revalidate = 3600

const ADNEO_WEBSITE_ID = process.env.NEXT_PUBLIC_ADNEO_WEBSITE_ID || 'cmpxtvs0500003aleux4hn8nv'

interface Article {
  id: string
  slug: string
  title: string
  excerpt?: string
  metaDescription?: string
  featuredImage?: string
  content?: string
  url?: string
}

async function getArticle(slug: string): Promise<Article | null> {
  try {
    // La liste Adneo ne contient pas le corps : il n'est renvoyé qu'avec le paramètre `slug`.
    const res = await fetch(
      `https://adneo.cloud/api/widget/articles?websiteId=${ADNEO_WEBSITE_ID}&slug=${encodeURIComponent(slug)}`,
      { next: { revalidate: 3600 } },
    )
    if (!res.ok) return null
    const data = await res.json()
    return data?.article ?? null
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = await getArticle(params.slug)
  if (!article) return { title: getT()('home.blog.articleNotFound'), robots: { index: false, follow: false } }
  return {
    title: article.title,
    description: article.metaDescription || article.excerpt,
    alternates: { canonical: `/blogs/${article.slug}` },
    openGraph: {
      title: article.title,
      description: article.metaDescription || article.excerpt,
      images: article.featuredImage ? [article.featuredImage] : undefined,
    },
  }
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await getArticle(params.slug)
  if (!article) notFound()
  const t = getT()

  // Corps converti en blocs texte : le HTML tiers n'est pas injecté tel quel.
  const blocks = articleBlocks(article.content || article.excerpt || '')

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      <PublicNavbar />

      <article className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-28 max-w-3xl">
        <Link href="/blogs" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" />
          {t('home.blog.backToBlog')}
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
          {blocks.map((block, i) =>
            block.kind === 'heading' ? (
              <h2 key={i} className="text-2xl font-bold text-slate-900 pt-4">
                {block.text}
              </h2>
            ) : block.kind === 'bullet' ? (
              <p key={i} className="text-lg text-slate-700 leading-relaxed font-light pl-5 relative">
                <span className="absolute left-0" aria-hidden="true">•</span>
                {block.text}
              </p>
            ) : (
              <p key={i} className="text-lg text-slate-700 leading-relaxed font-light">
                {block.text}
              </p>
            ),
          )}
        </div>
      </article>

      <Footer />
    </div>
  )
}
