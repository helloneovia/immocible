import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">I</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                IMMOCIBLE
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/acquereur/inscription">
                <Button variant="ghost">Connexion</Button>
              </Link>
              <Link href="/acquereur/inscription">
                <Button>Commencer</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-8 flex justify-center">
            <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-muted-foreground ring-1 ring-ring/10 hover:ring-ring/20">
              Nouveau : Recherche inversée pour l&apos;immobilier{' '}
              <a href="#" className="font-semibold text-primary">
                <span className="absolute inset-0" aria-hidden="true" />
                En savoir plus <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl mb-6">
            Trouvez votre{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              bien idéal
            </span>{' '}
            avant qu&apos;il ne soit sur le marché
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
            IMMOCIBLE connecte les acquéreurs qualifiés avec des opportunités immobilières
            off-market. Fini les recherches interminables, découvrez les meilleurs biens
            correspondant à votre profil.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/acquereur/inscription">
              <Button size="lg" className="text-base px-8 py-6 h-auto">
                Je suis acquéreur
              </Button>
            </Link>
            <Link href="/agence/inscription">
              <Button size="lg" variant="outline" className="text-base px-8 py-6 h-auto">
                Je suis une agence
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Comment ça fonctionne ?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Une plateforme simple et efficace pour transformer votre recherche immobilière
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 mt-12">
          <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4">
                <span className="text-2xl">📋</span>
              </div>
              <CardTitle>Créez votre profil</CardTitle>
              <CardDescription>
                Remplissez un questionnaire détaillé sur vos critères de recherche et votre profil
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <CardTitle>Matching intelligent</CardTitle>
              <CardDescription>
                Notre algorithme vous propose des biens parfaitement adaptés à vos besoins
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg sm:col-span-2 lg:col-span-1">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-4">
                <span className="text-2xl">🏠</span>
              </div>
              <CardTitle>Découvrez les biens</CardTitle>
              <CardDescription>
                Accédez à des opportunités off-market et négociez directement avec les agences
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 border-0 text-white">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl sm:text-4xl text-white mb-4">
              Prêt à trouver votre bien idéal ?
            </CardTitle>
            <CardDescription className="text-blue-100 text-lg">
              Rejoignez des centaines d&apos;acquéreurs qui ont trouvé leur bien sur IMMOCIBLE
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Link href="/acquereur/inscription">
              <Button size="lg" variant="secondary" className="text-base px-8 py-6 h-auto">
                Créer mon compte gratuitement
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/50 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 rounded bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">I</span>
              </div>
              <span className="text-lg font-bold">IMMOCIBLE</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 IMMOCIBLE. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
