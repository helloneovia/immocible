import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Home,
  Target,
  FileText,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Shield,
  Zap
} from 'lucide-react'
import { getAppSettings } from '@/lib/settings'
import { HomeAboutDialog } from '@/components/HomeAboutDialog'

export const revalidate = 60 // Revalidate page every 60 seconds

const heroImages = [
  {
    src: '/real-estate/estate.svg',
    alt: 'Villa contemporaine avec jardin'
  },
  {
    src: '/real-estate/house.svg',
    alt: 'Maison moderne de standing'
  },
  {
    src: '/real-estate/palm-house.svg',
    alt: 'Maison lumineuse en bord de palmier'
  }
]

const inspirationImages = [
  {
    src: '/real-estate/minimal-interior.svg',
    label: 'Intérieur minimaliste'
  },
  {
    src: '/real-estate/tiny-house.svg',
    label: 'Tiny house optimisée'
  },
  {
    src: '/real-estate/color-estate.svg',
    label: 'Propriété de caractère'
  },
  {
    src: '/real-estate/home-decor-1.svg',
    label: 'Salon chaleureux'
  },
  {
    src: '/real-estate/home-decor-2.svg',
    label: 'Cuisine premium'
  },
  {
    src: '/real-estate/home-decor-3.svg',
    label: 'Suite parentale élégante'
  }
]

export default async function HomePage() {
  const settings = await getAppSettings()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <nav className="relative border-b border-white/20 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Home className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                IMMOCIBLE
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/acquereur/connexion">
                <Button variant="ghost" className="hidden sm:inline-flex font-medium">Connexion</Button>
              </Link>
              <Link href="/acquereur/inscription">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300">
                  Commencer
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="text-center lg:text-left">
            <div className="mb-8 flex justify-center lg:justify-start">
              <div className="group relative rounded-full px-4 py-2 text-sm leading-6 bg-white/90 backdrop-blur-sm ring-1 ring-gray-900/10 hover:ring-gray-900/20 shadow-sm">
                <Sparkles className="inline h-4 w-4 mr-2 text-indigo-600 animate-pulse" />
                Nouveau : Recherche inversée pour l&apos;immobilier{' '}
                <HomeAboutDialog content={settings.text_home_about_content || ''} />
              </div>
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-8">
              <span className="block text-gray-900">{settings.text_home_hero_title_1 || 'Trouvez votre'}</span>
              <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent animate-gradient">
                {settings.text_home_hero_title_highlight || 'bien idéal'}
              </span>
              <span className="block text-gray-900">{settings.text_home_hero_title_2 || 'avant qu\'il ne soit sur le marché'}</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl leading-8 text-gray-600 max-w-2xl mx-auto lg:mx-0 font-medium">
              {settings.text_home_hero_subtitle || 'IMMOCIBLE connecte les acquéreurs qualifiés avec des opportunités immobilières off-market.'}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center lg:items-start gap-4">
              <Link href="/acquereur/inscription">
                <Button
                  size="lg"
                  className="w-full sm:w-auto text-lg px-8 py-6 h-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-2xl hover:scale-105 transition-all duration-300 group"
                >
                  Je suis acquéreur
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/agence/inscription">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto text-lg px-8 py-6 h-auto border-2 bg-white/80 backdrop-blur-sm hover:bg-white hover:scale-105 transition-all duration-300 shadow-lg"
                >
                  Je suis une agence
                </Button>
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-500" /><span className="font-medium">100% Gratuit</span></div>
              <div className="flex items-center gap-2"><Shield className="h-5 w-5 text-blue-600" /><span className="font-medium">Profils vérifiés</span></div>
              <div className="flex items-center gap-2"><Zap className="h-5 w-5 text-yellow-500" /><span className="font-medium">Mise en relation rapide</span></div>
              <div className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-indigo-500" /><span className="font-medium">Matching précis</span></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 relative h-64 sm:h-72 rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/60">
              <Image src={heroImages[0].src} alt={heroImages[0].alt} fill className="object-cover" priority />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent"></div>
              <p className="absolute bottom-4 left-4 text-white font-semibold text-sm sm:text-base">Coup de cœur de la semaine</p>
            </div>
            <div className="relative h-44 sm:h-52 rounded-3xl overflow-hidden shadow-xl ring-1 ring-white/70">
              <Image src={heroImages[1].src} alt={heroImages[1].alt} fill className="object-cover" />
            </div>
            <div className="relative h-44 sm:h-52 rounded-3xl overflow-hidden shadow-xl ring-1 ring-white/70">
              <Image src={heroImages[2].src} alt={heroImages[2].alt} fill className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section className="relative container mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="mx-auto max-w-3xl text-center mb-12">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900 mb-4">{settings.text_home_features_title || 'Comment ça fonctionne ?'}</h2>
          <p className="text-lg sm:text-xl text-gray-600 font-medium">{settings.text_home_features_subtitle || 'Une plateforme simple et efficace pour transformer votre recherche immobilière'}</p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 mt-12">
          <Card className="group border-2 border-transparent hover:border-indigo-200 bg-white/85 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
            <CardHeader className="text-center">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300"><FileText className="h-8 w-8 text-white" /></div>
              <CardTitle className="text-xl mb-3">Créez votre profil</CardTitle>
              <CardDescription className="text-base">Remplissez un questionnaire détaillé sur vos critères de recherche et votre profil financier.</CardDescription>
            </CardHeader>
          </Card>

          <Card className="group border-2 border-transparent hover:border-indigo-200 bg-white/85 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
            <CardHeader className="text-center">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300"><Target className="h-8 w-8 text-white" /></div>
              <CardTitle className="text-xl mb-3">Matching intelligent</CardTitle>
              <CardDescription className="text-base">Notre algorithme vous propose des biens réellement alignés à vos besoins et votre budget.</CardDescription>
            </CardHeader>
          </Card>

          <Card className="group border-2 border-transparent hover:border-indigo-200 bg-white/85 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 sm:col-span-2 lg:col-span-1">
            <CardHeader className="text-center">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300"><Home className="h-8 w-8 text-white" /></div>
              <CardTitle className="text-xl mb-3">Découvrez les biens</CardTitle>
              <CardDescription className="text-base">Accédez à des opportunités off-market exclusives et échangez directement avec les agences.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      <section className="relative container mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h3 className="text-2xl sm:text-4xl font-bold text-gray-900">Inspiration immobilière</h3>
            <p className="text-gray-600 mt-2">Explorez des ambiances variées pour affiner votre projet.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {inspirationImages.map((image) => (
            <div key={image.src} className="relative h-64 sm:h-72 rounded-2xl overflow-hidden shadow-lg group">
              <Image src={image.src} alt={image.label} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent"></div>
              <p className="absolute bottom-3 left-3 text-white font-semibold">{image.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 shadow-2xl">
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,transparent)]"></div>
          <CardHeader className="relative text-center pb-8">
            <CardTitle className="text-3xl sm:text-5xl font-extrabold text-white mb-6">{settings.text_home_cta_title || 'Prêt à trouver votre bien idéal ?'}</CardTitle>
            <CardDescription className="text-blue-100 text-lg sm:text-xl font-medium">{settings.text_home_cta_subtitle || 'Rejoignez des centaines d\'acquéreurs qui ont trouvé leur bien sur IMMOCIBLE'}</CardDescription>
          </CardHeader>
          <CardContent className="relative flex justify-center pb-8">
            <Link href="/acquereur/inscription">
              <Button
                size="lg"
                variant="secondary"
                className="w-full sm:w-auto text-base sm:text-lg px-8 sm:px-12 py-7 h-auto bg-white text-indigo-600 hover:bg-gray-50 shadow-2xl hover:scale-105 transition-all duration-300 font-bold group"
              >
                Créer mon compte gratuitement
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      <footer className="relative border-t border-gray-200 bg-white/80 backdrop-blur-sm py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center space-y-6 text-center">
            <Link href="/" className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
                <Home className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">IMMOCIBLE</span>
            </Link>
            <p className="text-sm text-gray-600">{settings.text_footer_copyright || '© 2024 IMMOCIBLE. Tous droits réservés.'}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
