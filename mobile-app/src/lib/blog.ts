import type { Article } from '@/lib/types'

const ADNEO_WEBSITE_ID = process.env.EXPO_PUBLIC_ADNEO_WEBSITE_ID || 'cmpxtvs0500003aleux4hn8nv'
const ARTICLES_URL = `https://adneo.cloud/api/widget/articles?websiteId=${ADNEO_WEBSITE_ID}`

/** Articles du widget Adneo — même source que app/blogs/page.tsx. La liste ne contient pas le corps. */
export async function fetchArticles(): Promise<Article[]> {
  const response = await fetch(ARTICLES_URL)
  if (!response.ok) throw new Error('Blog indisponible')
  const data = await response.json()
  return Array.isArray(data?.articles) ? data.articles : []
}

/** Article complet : le corps (HTML) n'est renvoyé qu'avec le paramètre `slug`. */
export async function fetchArticle(slug: string): Promise<Article | null> {
  const response = await fetch(`${ARTICLES_URL}&slug=${encodeURIComponent(slug)}`)
  if (!response.ok) throw new Error('Article indisponible')
  const data = await response.json()
  return data?.article ?? null
}

export type ArticleBlock = { kind: 'heading' | 'paragraph' | 'bullet'; text: string }

const ENTITIES: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”', laquo: '«', raquo: '»',
  hellip: '…', ndash: '–', mdash: '—', euro: '€', deg: '°',
  eacute: 'é', egrave: 'è', ecirc: 'ê', euml: 'ë', agrave: 'à', acirc: 'â',
  ccedil: 'ç', icirc: 'î', iuml: 'ï', ocirc: 'ô', ucirc: 'û', ugrave: 'ù',
}

function decodeEntities(text: string) {
  return text
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&([a-z]+);/gi, (match, name: string) => ENTITIES[name.toLowerCase()] ?? match)
}

/**
 * Corps affiché en texte natif (pas de HTML tiers injecté) : titres, paragraphes et puces.
 * Les images intégrées (base64) sont ignorées ; l'image de une reste affichée.
 */
export function articleBlocks(article: Article): ArticleBlock[] {
  const source = article.content || article.excerpt || ''
  if (!/<[a-z][\s\S]*>/i.test(source)) {
    return source
      .split(/\n{2,}/)
      .map((text) => text.trim())
      .filter(Boolean)
      .map((text) => ({ kind: 'paragraph', text }))
  }

  const html = source.replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, '').replace(/<img\b[^>]*>/gi, '')
  const blocks: ArticleBlock[] = []
  const pattern = /<(h[1-6]|p|li|blockquote)\b[^>]*>([\s\S]*?)<\/\1>/gi
  let match: RegExpExecArray | null
  while ((match = pattern.exec(html))) {
    const text = decodeEntities(match[2].replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, ''))
      .replace(/[ \t]+/g, ' ')
      .trim()
    if (!text) continue
    const tag = match[1].toLowerCase()
    blocks.push({ kind: tag.startsWith('h') ? 'heading' : tag === 'li' ? 'bullet' : 'paragraph', text })
  }
  return blocks
}
