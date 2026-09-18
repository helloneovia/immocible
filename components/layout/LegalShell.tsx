import { PublicNavbar } from '@/components/layout/PublicNavbar'
import { Footer } from '@/components/layout/Footer'
import { getT } from '@/lib/i18n/server'

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
  const t = getT()
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      <PublicNavbar />
      <header className="bg-slate-900 text-white pt-32 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{title}</h1>
          {lastUpdated && <p className="text-sm text-slate-400 mt-3">{t('common.legal.lastUpdated', { date: lastUpdated })}</p>}
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

type Segment = { text: string; href?: string; missing?: boolean }
type Block = { kind: 'paragraph'; segments: Segment[] } | { kind: 'list'; items: Segment[][] }

function Segments({ segments }: { segments: Segment[] }) {
  return (
    <>
      {segments.map((segment, i) =>
        segment.missing ? (
          <ToFill key={i}>{segment.text}</ToFill>
        ) : segment.href ? (
          <a key={i} href={segment.href} className="text-slate-900 underline">
            {segment.text}
          </a>
        ) : (
          <span key={i}>{segment.text}</span>
        ),
      )}
    </>
  )
}

/** Page légale complète à partir du contenu résolu (lib/legal.ts), identique à l'application mobile. */
export function LegalDocumentView({
  document,
}: {
  document: { title: string; lastUpdated: string; notice: string | null; sections: { title: string; blocks: Block[] }[] }
}) {
  return (
    <LegalShell title={document.title} lastUpdated={document.lastUpdated}>
      {document.notice && <p className="mb-8 text-sm text-slate-500">{document.notice}</p>}
      {document.sections.map((section) => (
        <LegalSection key={section.title} title={section.title}>
          {section.blocks.map((block, i) =>
            block.kind === 'paragraph' ? (
              <p key={i}>
                <Segments segments={block.segments} />
              </p>
            ) : (
              <ul key={i} className="list-disc pl-6 space-y-2">
                {block.items.map((item, j) => (
                  <li key={j}>
                    <Segments segments={item} />
                  </li>
                ))}
              </ul>
            ),
          )}
        </LegalSection>
      ))}
    </LegalShell>
  )
}
