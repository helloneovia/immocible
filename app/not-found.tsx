import Link from 'next/link'
import { Logo } from '@/components/ui/Logo'
import { Button } from '@/components/ui/button'
import { getT } from '@/lib/i18n/server'

export function generateMetadata() {
  return {
    title: getT()('common.notFound.metaTitle'),
    robots: { index: false, follow: false },
  }
}

export default function NotFound() {
  const t = getT()
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-center px-6 py-20">
      <Link href="/" className="mb-10" aria-label={t('common.brand.homeAria')}>
        <Logo className="text-slate-900" iconClassName="h-12 w-12" wordmarkClassName="text-2xl" />
      </Link>
      <p className="text-6xl font-bold text-slate-900">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-slate-800">{t('common.notFound.title')}</h1>
      <p className="mt-3 max-w-md text-slate-500">
        {t('common.notFound.text')}
      </p>
      <div className="mt-10 flex flex-col sm:flex-row gap-4">
        <Link href="/">
          <Button className="bg-slate-900 text-white hover:bg-slate-800 px-8 py-6 h-auto text-base">
            {t('common.notFound.backHome')}
          </Button>
        </Link>
        <Link href="/blogs">
          <Button variant="outline" className="px-8 py-6 h-auto text-base border-slate-300">
            {t('common.notFound.seeBlog')}
          </Button>
        </Link>
      </div>
    </main>
  )
}
