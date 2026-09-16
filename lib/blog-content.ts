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
 * Corps d'un article Adneo converti en blocs texte (titres, paragraphes, puces).
 * Le HTML tiers n'est jamais injecté tel quel ; les images intégrées (base64) sont ignorées.
 * Même logique que mobile-app/src/lib/blog.ts.
 */
export function articleBlocks(source: string): ArticleBlock[] {
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
