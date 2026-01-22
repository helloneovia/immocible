'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Home, 
  Settings, 
  LogOut, 
  Search, 
  Heart, 
  TrendingUp, 
  FileText,
  ArrowRight,
  MapPin,
  Euro,
  Star,
  Filter
} from 'lucide-react'

function DashboardContent() {
  const { signOut } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="border-b border-white/20 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 shadow-sm sticky top-0 z-50">
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
              <Button variant="ghost" className="font-medium">
                <Settings className="h-5 w-5 mr-2" />
                Paramètres
              </Button>
              <Button variant="outline" className="font-medium" onClick={signOut}>
                <LogOut className="h-5 w-5 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-3 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Mes matches
          </h1>
          <p className="text-lg text-gray-600 font-medium">
            Opportunités immobilières correspondant à votre profil
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader className="pb-3">
              <CardDescription className="text-blue-100 flex items-center gap-2">
                <Search className="h-4 w-4" />
                Matches trouvés
              </CardDescription>
              <CardTitle className="text-4xl font-extrabold text-white">12</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
            <CardHeader className="pb-3">
              <CardDescription className="text-indigo-100 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Profil complété
              </CardDescription>
              <CardTitle className="text-4xl font-extrabold text-white">85%</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={85} className="h-3 bg-white/20" />
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-pink-500 to-rose-600 text-white">
            <CardHeader className="pb-3">
              <CardDescription className="text-pink-100 flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Biens favoris
              </CardDescription>
              <CardTitle className="text-4xl font-extrabold text-white">5</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Actions */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <Link href="/acquereur/questionnaire">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group"
            >
              <FileText className="mr-2 h-5 w-5" />
              Compléter mon profil
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Button 
            size="lg" 
            variant="outline" 
            className="border-2 bg-white/80 backdrop-blur-sm hover:bg-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            <Filter className="mr-2 h-5 w-5" />
            Filtrer les résultats
          </Button>
        </div>

        {/* Matches List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card 
              key={i} 
              className="group border-2 hover:border-indigo-300 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer overflow-hidden"
            >
              <CardHeader className="p-0">
                <div className="relative aspect-video bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 flex items-center justify-center overflow-hidden">
                  <Home className="h-20 w-20 text-indigo-300 group-hover:scale-110 transition-transform duration-300" />
                  <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                    <Star className="h-3 w-3 fill-white" />
                    {92 + i}%
                  </div>
                </div>
              </CardHeader>
              <CardHeader className="pt-6">
                <CardTitle className="text-xl font-bold mb-1">Appartement 4 pièces</CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  75014 Paris • 120m²
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground font-medium">Prix</span>
                    <span className="text-lg font-extrabold text-gray-900 flex items-center gap-1">
                      <Euro className="h-4 w-4" />
                      {(850 + i * 50).toLocaleString('fr-FR')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-sm text-muted-foreground font-medium">Score de match</span>
                    <span className="text-lg font-bold text-green-600 flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      {92 + i}%
                    </span>
                  </div>
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 group-hover:shadow-lg transition-all duration-300"
                  variant="default"
                >
                  Voir les détails
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function DashboardAcquereur() {
  return (
    <ProtectedRoute requiredRole="acquereur" redirectTo="/acquereur/connexion">
      <DashboardContent />
    </ProtectedRoute>
  )
}
