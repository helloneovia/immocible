'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { 
  Home, 
  Settings, 
  LogOut, 
  Search, 
  Building2, 
  TrendingUp, 
  FileText,
  ArrowRight,
  MapPin,
  Euro,
  CheckCircle2,
  Filter,
  Plus,
  Star
} from 'lucide-react'

export default function DashboardAgence() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-100">
      {/* Navigation */}
      <nav className="border-b border-white/20 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Home className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                IMMOCIBLE
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="font-medium">
                <Settings className="h-5 w-5 mr-2" />
                Paramètres
              </Button>
              <Button variant="outline" className="font-medium">
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
            Recherches qualifiées
          </h1>
          <p className="text-lg text-gray-600 font-medium">
            Acquéreurs vérifiés correspondant à vos biens
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
            <CardHeader className="pb-3">
              <CardDescription className="text-indigo-100 flex items-center gap-2">
                <Search className="h-4 w-4" />
                Recherches actives
              </CardDescription>
              <CardTitle className="text-4xl font-extrabold text-white">24</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardHeader className="pb-3">
              <CardDescription className="text-purple-100 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Matches trouvés
              </CardDescription>
              <CardTitle className="text-4xl font-extrabold text-white">8</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-pink-500 to-rose-600 text-white">
            <CardHeader className="pb-3">
              <CardDescription className="text-pink-100 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Biens publiés
              </CardDescription>
              <CardTitle className="text-4xl font-extrabold text-white">12</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Actions */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <Link href="/agence/biens">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group"
            >
              <Plus className="mr-2 h-5 w-5" />
              Ajouter un bien
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Button 
            size="lg" 
            variant="outline" 
            className="border-2 bg-white/80 backdrop-blur-sm hover:bg-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            <Filter className="mr-2 h-5 w-5" />
            Filtrer les recherches
          </Button>
        </div>

        {/* Matches List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card 
              key={i} 
              className="group border-2 hover:border-purple-300 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer"
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-3">
                  <CardTitle className="text-xl font-bold">Recherche #{i}</CardTitle>
                  <span className="text-xs bg-green-500 text-white px-3 py-1.5 rounded-full font-bold flex items-center gap-1 shadow-lg">
                    <Star className="h-3 w-3 fill-white" />
                    {94 + i}%
                  </span>
                </div>
                <CardDescription className="flex items-center gap-2 text-base">
                  <Building2 className="h-4 w-4" />
                  Appartement • Paris 15e
                </CardDescription>
                <CardDescription className="flex items-center gap-1 mt-1">
                  <Euro className="h-3 w-3" />
                  Budget: {(600 + i * 50).toLocaleString('fr-FR')} - {(800 + i * 50).toLocaleString('fr-FR')}€
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="font-medium">Acquéreur vérifié</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="font-medium">Financement validé</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="font-medium">Dossier complet</span>
                  </div>
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 group-hover:shadow-lg transition-all duration-300"
                  variant="default"
                >
                  Contacter l&apos;acquéreur
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
