import type { MetadataRoute } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://immocible.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const routes: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
    { path: '', priority: 1, changeFrequency: 'weekly' },
    { path: '/acquereur/inscription', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/acquereur/connexion', priority: 0.5, changeFrequency: 'yearly' },
    { path: '/agence/inscription', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/agence/connexion', priority: 0.5, changeFrequency: 'yearly' },
    { path: '/blogs', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/mentions-legales', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/confidentialite', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/cgu', priority: 0.3, changeFrequency: 'yearly' },
  ]

  return routes.map(({ path, priority, changeFrequency }) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }))
}
