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

export default async function HomePage() {
  const settings = await getAppSettings()

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans text-slate-900">

      {/* Navigation */}
      <nav className="absolute top-0 w-full z-50 bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="h-10 w-10 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center border border-white/30 transition-all duration-300 group-hover:bg-white/30">
                <Home className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl sm:text-2xl font-semibold tracking-wide text-white">
                IMMOCIBLE
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/acquereur/connexion">
                <Button variant="ghost" className="hidden sm:inline-flex font-medium text-white hover:bg-white/20 hover:text-white">Connexion</Button>
              </Link>
              <Link href="/acquereur/inscription">
                <Button className="bg-slate-900 text-white hover:bg-slate-800 shadow-md transition-all duration-300 border border-slate-700">
                  Commencer
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center">
        {/* Architecture Background Image */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2075&q=80')" }}
        >
          <div className="absolute inset-0 bg-slate-900/60 mix-blend-multiply"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center text-white">
          <div className="mb-8 flex justify-center">
            <div className="group relative rounded-full px-4 py-2 text-sm leading-6 bg-white/10 backdrop-blur-md border border-white/20 text-white/90 shadow-sm hover:bg-white/20 transition-all">
              <Sparkles className="inline h-4 w-4 mr-2 text-amber-400" />
              Nouveau : Recherche inversée premium{' '}
              <HomeAboutDialog content={settings.text_home_about_content || ''} />
            </div>
          </div>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-8 drop-shadow-lg">
            <span className="block text-white/90">{settings.text_home_hero_title_1 || 'L\'immobilier d\'exception,'}</span>
            <span className="block text-white mt-2">
              {settings.text_home_hero_title_highlight || 'avant tout le monde.'}
            </span>
            {settings.text_home_hero_title_2 && <span className="block text-white/80 text-3xl mt-2">{settings.text_home_hero_title_2}</span>}
          </h1>
          <p className="mt-6 text-lg sm:text-2xl leading-8 text-slate-200 max-w-3xl mx-auto font-light drop-shadow-md">
            {settings.text_home_hero_subtitle || 'IMMOCIBLE connecte les acquéreurs qualifiés avec des opportunités immobilières off-market. Adoptez une nouvelle approche pour trouver votre bien idéal.'}
          </p>
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/acquereur/inscription">
              <Button
                size="lg"
                className="w-full sm:w-auto text-lg px-10 py-7 h-auto bg-slate-900 text-white hover:bg-slate-800 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group border border-slate-700"
              >
                Je suis acquéreur
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/agence/inscription">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto text-lg px-10 py-7 h-auto bg-white/10 text-white border-white/30 backdrop-blur-md hover:bg-white/20 hover:text-white hover:-translate-y-1 transition-all duration-300 shadow-lg"
              >
                Je suis une agence
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-20 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-sm text-slate-200 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              <span>Service Exclusif</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-400" />
              <span>{settings.text_trust_payment || 'Transactions Sécurisées'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-400" />
              <span>Matching Instantané</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-400" />
              <span>Réseau Premium</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 bg-slate-50">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 mb-6 font-serif">
            {settings.text_home_features_title || 'L\'excellence à chaque étape'}
          </h2>
          <p className="text-lg sm:text-xl text-slate-600 font-light">
            {settings.text_home_features_subtitle || 'Une approche sur-mesure pour concrétiser votre projet immobilier dans les meilleures conditions.'}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 mt-12">
          <Card className="group border border-slate-200 bg-white hover:border-slate-300 transition-all duration-500 hover:shadow-xl hover:-translate-y-1 rounded-xl overflow-hidden">
            <CardHeader className="text-center pt-10 pb-8 px-6">
              <div className="mx-auto h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-6 group-hover:bg-slate-900 transition-colors duration-500">
                <FileText className="h-7 w-7 text-slate-600 group-hover:text-white transition-colors duration-500" />
              </div>
              <CardTitle className="text-xl mb-3 font-semibold text-slate-900">Cadrage de Projet</CardTitle>
              <CardDescription className="text-base text-slate-500 leading-relaxed font-light">
                Définition précise de vos critères architecturaux, géographiques et financiers pour un ciblage parfait.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group border border-slate-200 bg-white hover:border-slate-300 transition-all duration-500 hover:shadow-xl hover:-translate-y-1 rounded-xl overflow-hidden">
            <CardHeader className="text-center pt-10 pb-8 px-6">
              <div className="mx-auto h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-6 group-hover:bg-slate-900 transition-colors duration-500">
                <Target className="h-7 w-7 text-slate-600 group-hover:text-white transition-colors duration-500" />
              </div>
              <CardTitle className="text-xl mb-3 font-semibold text-slate-900">Sourcing Off-Market</CardTitle>
              <CardDescription className="text-base text-slate-500 leading-relaxed font-light">
                Notre technologie croise votre profil avec les biens exclusifs de notre réseau d&apos;agences partenaires.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group border border-slate-200 bg-white hover:border-slate-300 transition-all duration-500 hover:shadow-xl hover:-translate-y-1 rounded-xl overflow-hidden sm:col-span-2 lg:col-span-1">
            <CardHeader className="text-center pt-10 pb-8 px-6">
              <div className="mx-auto h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-6 group-hover:bg-slate-900 transition-colors duration-500">
                <Home className="h-7 w-7 text-slate-600 group-hover:text-white transition-colors duration-500" />
              </div>
              <CardTitle className="text-xl mb-3 font-semibold text-slate-900">Acquisition Sereine</CardTitle>
              <CardDescription className="text-base text-slate-500 leading-relaxed font-light">
                Accédez à des opportunités rares avant leur commercialisation publique et visitez en exclusivité.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Modern Split CTA Section */}
      <section className="relative">
        <div className="flex flex-col lg:flex-row min-h-[60vh]">
          <div className="lg:w-1/2 bg-slate-900 flex items-center justify-center p-12 lg:p-24 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'60\\' height=\\'60\\' viewBox=\\'0 0 60 60\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'none\\' fill-rule=\\'evenodd\\'%3E%3Cg fill=\\'%23ffffff\\' fill-opacity=\\'1\\'%3E%3Cpath d=\\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }}></div>
            <div className="relative z-10 max-w-lg">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                {settings.text_home_cta_title || 'L\'immobilier à votre image.'}
              </h2>
              <p className="text-slate-300 text-lg mb-10 font-light">
                {settings.text_home_cta_subtitle || 'Rejoignez le réseau fermé de la recherche inversée. Définissez vos envies, nous trouvons l\'adresse.'}
              </p>
              <Link href="/acquereur/inscription">
                <Button
                  size="lg"
                  className="w-full sm:w-auto text-base sm:text-lg px-8 py-6 h-auto bg-white text-slate-900 hover:bg-slate-100 shadow-xl transition-all duration-300 font-semibold group"
                >
                  Définir ma recherche
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
          <div
            className="lg:w-1/2 min-h-[400px] lg:min-h-full bg-cover bg-center"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')" }}
          >
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-16">
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
