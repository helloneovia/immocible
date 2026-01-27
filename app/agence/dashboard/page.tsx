'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import {
  Home,
  MessageSquare,
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

function DashboardContent() {
  const { signOut } = useAuth()

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
              <Button variant="ghost" className="font-medium" asChild>
                <Link href="/agence/messages">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Messagerie
                </Link>
              </Button>
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
              <CardTitle className="text-4xl font-extrabold text-white">0</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardHeader className="pb-3">
              <CardDescription className="text-purple-100 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Matches trouvés
              </CardDescription>
              <CardTitle className="text-4xl font-extrabold text-white">0</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-pink-500 to-rose-600 text-white">
            <CardHeader className="pb-3">
              <CardDescription className="text-pink-100 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Biens publiés
              </CardDescription>
              <CardTitle className="text-4xl font-extrabold text-white">0</CardTitle>
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
          {/* No searches yet */}
          <div className="md:col-span-2 lg:col-span-3 text-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border-2 border-dashed border-gray-200">
            <div className="mx-auto h-24 w-24 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
              <Search className="h-10 w-10 text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Aucune recherche active</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              Publiez vos biens pour voir apparaître les acquéreurs compatibles.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DashboardAgence() {
  return (
    <ProtectedRoute requiredRole="agence" redirectTo="/agence/connexion">
      <DashboardContent />
    </ProtectedRoute>
  )
}
