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

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Navigation */}
      <nav className="relative border-b border-white/20 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Home className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                IMMOCIBLE
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/acquereur/inscription">
                <Button variant="ghost" className="font-medium">Connexion</Button>
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

      {/* Hero Section */}
      <section className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-8 flex justify-center">
            <div className="group relative rounded-full px-4 py-2 text-sm leading-6 bg-white/90 backdrop-blur-sm ring-1 ring-gray-900/10 hover:ring-gray-900/20 shadow-sm">
              <Sparkles className="inline h-4 w-4 mr-2 text-indigo-600 animate-pulse" />
              Nouveau : Recherche inversée pour l&apos;immobilier{' '}
              <a href="#" className="font-semibold text-indigo-600">
                <span className="absolute inset-0" aria-hidden="true" />
                En savoir plus <ArrowRight className="inline h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </a>
            </div>
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-8">
            <span className="block text-gray-900">Trouvez votre</span>
            <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent animate-gradient">
              bien idéal
            </span>
            <span className="block text-gray-900">avant qu&apos;il ne soit sur le marché</span>
          </h1>
          <p className="mt-6 text-xl sm:text-2xl leading-8 text-gray-600 max-w-3xl mx-auto font-medium">
            IMMOCIBLE connecte les acquéreurs qualifiés avec des opportunités immobilières
            <span className="text-indigo-600 font-semibold"> off-market</span>. Fini les recherches interminables, découvrez les meilleurs biens correspondant à votre profil.
          </p>
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/acquereur/inscription">
              <Button 
                size="lg" 
                className="text-lg px-10 py-7 h-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 group"
              >
                Je suis acquéreur
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/agence/inscription">
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-10 py-7 h-auto border-2 bg-white/80 backdrop-blur-sm hover:bg-white hover:scale-105 transition-all duration-300 shadow-lg"
              >
                Je suis une agence
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span className="font-medium">100% Gratuit</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-500" />
              <span className="font-medium">Sécurisé</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              <span className="font-medium">Matching en 24h</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <span className="font-medium">+500 biens disponibles</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 mb-6">
            Comment ça fonctionne ?
          </h2>
          <p className="text-xl text-gray-600 font-medium">
            Une plateforme simple et efficace pour transformer votre recherche immobilière
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 mt-12">
          <Card className="group border-2 border-transparent hover:border-indigo-200 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
            <CardHeader className="text-center">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl mb-3">Créez votre profil</CardTitle>
              <CardDescription className="text-base">
                Remplissez un questionnaire détaillé sur vos critères de recherche et votre profil financier
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group border-2 border-transparent hover:border-indigo-200 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
            <CardHeader className="text-center">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Target className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl mb-3">Matching intelligent</CardTitle>
              <CardDescription className="text-base">
                Notre algorithme avancé vous propose des biens parfaitement adaptés à vos besoins et votre budget
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group border-2 border-transparent hover:border-indigo-200 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 sm:col-span-2 lg:col-span-1">
            <CardHeader className="text-center">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Home className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl mb-3">Découvrez les biens</CardTitle>
              <CardDescription className="text-base">
                Accédez à des opportunités off-market exclusives et négociez directement avec les agences
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 shadow-2xl">
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,transparent)]"></div>
          <CardHeader className="relative text-center pb-8">
            <CardTitle className="text-4xl sm:text-5xl font-extrabold text-white mb-6">
              Prêt à trouver votre bien idéal ?
            </CardTitle>
            <CardDescription className="text-blue-100 text-xl font-medium">
              Rejoignez des centaines d&apos;acquéreurs qui ont trouvé leur bien sur IMMOCIBLE
            </CardDescription>
          </CardHeader>
          <CardContent className="relative flex justify-center pb-8">
            <Link href="/acquereur/inscription">
              <Button 
                size="lg" 
                variant="secondary" 
                className="text-lg px-12 py-7 h-auto bg-white text-indigo-600 hover:bg-gray-50 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 font-bold group"
              >
                Créer mon compte gratuitement
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-gray-200 bg-white/80 backdrop-blur-sm py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center space-y-6 text-center">
            <Link href="/" className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
                <Home className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                IMMOCIBLE
              </span>
            </Link>
            <p className="text-sm text-gray-600">
              © 2024 IMMOCIBLE. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
