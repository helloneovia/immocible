'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { NotificationBell } from '@/components/ui/NotificationBell'
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
  Star,
  X,
  Zap,
  Crown
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Navbar } from '@/components/layout/Navbar'
import { DEFAULT_SETTINGS, type AppSettings } from '@/lib/settings'

function DashboardContent() {
  const router = useRouter()
  const { signOut, user } = useAuth() // Get user for email

  const subscriptionEndDate = (user?.profile as any)?.subscriptionEndDate
  const showExpiryWarning = subscriptionEndDate && (new Date(subscriptionEndDate).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000) && (new Date(subscriptionEndDate).getTime() > new Date().getTime())
  const [activeSearches, setActiveSearches] = useState([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    location: '',
    budgetMin: '',
    surfaceMin: '',
    typeBien: 'all'
  })
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)

  useEffect(() => {
    fetch('/api/public/settings').then(r => r.json()).then(d => { if (d && !d.error) setSettings(d) }).catch(console.error)
  }, [])

  // ... (useEffect remains same) ...

  useEffect(() => {
    const fetchSearches = async () => {
      try {
        const response = await fetch('/api/agence/recherches')
        if (response.ok) {
          const { data } = await response.json()
          setActiveSearches(data || [])
        }
      } catch (error) {
        console.error('Error fetching searches:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSearches()
  }, [])

  const filteredSearches = activeSearches.filter((search: any) => {
    if (filters.location) {
      const match = search.localisation?.some((z: string) => z.toLowerCase().includes(filters.location.toLowerCase()))
      if (!match) return false
    }
    if (filters.budgetMin) {
      if ((search.prixMax || 0) < parseInt(filters.budgetMin)) return false
    }
    if (filters.surfaceMin) {
      if ((search.surfaceMin || 0) < parseInt(filters.surfaceMin)) return false
    }
    if (filters.typeBien !== 'all') {
      const type = filters.typeBien.toLowerCase()
      if (!search.typeBien?.some((t: string) => t.toLowerCase() === type)) return false
    }
    return true
  })

  // Clear filters
  const clearFilters = () => {
    setFilters({
      location: '',
      budgetMin: '',
      surfaceMin: '',
      typeBien: 'all'
    })
  }

  const handleChat = async (buyerId: string) => {
    try {
      const response = await fetch('/api/chat/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buyerId })
      })
      const data = await response.json()

      if (response.ok) {
        router.push(`/agence/messages?conversation=${data.conversationId}`)
      } else {
        alert(data.error || "Une erreur est survenue")
      }
    } catch (error) {
      console.error('Error initiating chat:', error)
      alert("Impossible de contacter ce profil pour le moment.")
    }
  }

  const handleUpgrade = async () => {
    if (!user) return
    try {
      const response = await fetch('/api/payment/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          plan: 'yearly', // Annual Plan
          nomAgence: user.profile?.nomAgence || 'Agence'
        })
      })

      const data = await response.json()

      if (response.ok && data.url) {
        window.location.href = data.url
      } else {
        alert("Erreur lors de l'initialisation du paiement.")
      }
    } catch (error) {
      console.error("Payment init error", error)
      alert("Erreur de connexion.")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-100">
      {/* Navigation */}
      <Navbar role="agence" />

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

        {/* Subscription Expiry Warning */}
        {showExpiryWarning && (
          <Card className="mb-10 border-l-4 border-yellow-500 shadow-md bg-yellow-50">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap className="h-6 w-6 text-yellow-600 fill-yellow-100" />
                <div>
                  <p className="font-bold text-yellow-800">Votre abonnement expire dans moins de 7 jours !</p>
                  <p className="text-sm text-yellow-700">Renouvelez maintenant pour éviter toute interruption de service.</p>
                </div>
              </div>
              <Button variant="outline" className="border-yellow-600 text-yellow-800 hover:bg-yellow-100" onClick={() => router.push('/settings')}>
                Gérer mon abonnement
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Subscription Plan Banner */}
        {/* Subscription Plan Banner - Show for anyone NOT on Yearly plan */}
        {((user?.profile as any)?.plan !== 'yearly') && (
          <Card className="mb-10 border-0 shadow-lg bg-gradient-to-r from-gray-900 to-slate-800 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-32 bg-indigo-500/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
            <CardContent className="p-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-4 max-w-2xl">
                <div className="flex items-center gap-3">
                  <Badge className="bg-indigo-500 hover:bg-indigo-600 text-white border-0 px-3 py-1 text-sm">
                    Offre Actuelle : Mensuel
                  </Badge>
                  <span className="text-gray-400 text-sm">Renouvellement Mensuel</span>
                </div>
                <h2 className="text-3xl font-bold flex items-center gap-3">
                  Passez à la vitesse supérieure <Zap className="h-8 w-8 text-yellow-400 fill-yellow-400" />
                </h2>
                <p className="text-gray-300 text-lg">
                  Débloquez l'accès illimité à tous les acquéreurs qualifiés et boostez la visibilité de vos biens avec l'offre Annuelle.
                </p>
                <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                  <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-green-400" /> Contacts illimités</span>
                  <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-green-400" /> Badge Agence Vérifiée</span>
                  <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-green-400" /> Support Prioritaire</span>
                </div>
              </div>

              <div className="flex-shrink-0 bg-white/5 p-6 rounded-2xl backdrop-blur-sm border border-white/10 text-center min-w-[280px]">
                <p className="text-sm text-gray-400 uppercase tracking-wider font-semibold mb-2">Offre Annuelle</p>
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <span className="text-5xl font-extrabold text-white">{settings.price_yearly}€</span>
                  <span className="text-gray-400">/an</span>
                </div>
                <p className="text-sm text-indigo-200 mb-6 font-medium">Validité : 1 an</p>
                <Button
                  size="lg"
                  onClick={handleUpgrade}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold shadow-lg shadow-indigo-500/25 border-0 scale-100 hover:scale-105 transition-all"
                >
                  <Crown className="mr-2 h-5 w-5 fill-yellow-200 text-yellow-100" />
                  Passer Premium
                </Button>
                <p className="mt-3 text-xs text-center text-gray-500">Paiement sécurisé via Stripe</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
            <CardHeader className="pb-3">
              <CardDescription className="text-indigo-100 flex items-center gap-2">
                <Search className="h-4 w-4" />
                Recherches actives
              </CardDescription>
              <CardTitle className="text-4xl font-extrabold text-white">{activeSearches.length}</CardTitle>
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
        </div>

        {/* Actions */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <Button
            size="lg"
            variant="outline"
            className="border-2 bg-white/80 backdrop-blur-sm hover:bg-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="mr-2 h-5 w-5" />
            {showFilters ? 'Masquer les filtres' : 'Filtrer les recherches'}
          </Button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <Card className="mb-8 border-none shadow-md bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4 border-b border-gray-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold">Filtres</CardTitle>
                <CardDescription>Affinez les résultats selon vos critères</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                <X className="mr-2 h-4 w-4" /> Réinitialiser
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <Label>Localisation (Ville)</Label>
                  <Input
                    placeholder="Ex: Paris"
                    value={filters.location}
                    onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Budget Min (Acquéreur)</Label>
                  <Input
                    type="number"
                    placeholder="Min €"
                    value={filters.budgetMin}
                    onChange={(e) => setFilters(prev => ({ ...prev, budgetMin: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Surface Min (Recherchée)</Label>
                  <Input
                    type="number"
                    placeholder="Min m²"
                    value={filters.surfaceMin}
                    onChange={(e) => setFilters(prev => ({ ...prev, surfaceMin: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type de bien</Label>
                  <Select
                    value={filters.typeBien}
                    onValueChange={(val) => setFilters(prev => ({ ...prev, typeBien: val }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tous" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="appartement">Appartement</SelectItem>
                      <SelectItem value="maison">Maison</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Matches List / Active Searches */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full py-20 text-center text-gray-500">
              Chargement des recherches...
            </div>
          ) : filteredSearches.length > 0 ? (
            filteredSearches.map((search: any) => (
              <Card key={search.id} className="border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm overflow-hidden group">
                <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-600 w-full" />
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="bg-indigo-50 p-2 rounded-lg">
                      <Search className="h-5 w-5 text-indigo-600" />
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-700 rounded-full">
                      {search.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                  <CardTitle className="mt-4 text-lg font-bold text-gray-900">
                    Recherche {(search.typeBien || []).join(', ')}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {(search.localisation || []).join(', ')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Euro className="h-4 w-4 mr-2 text-gray-400" />
                      {(search.prixMax || 0).toLocaleString()} € max
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <TrendingUp className="h-4 w-4 mr-2 text-gray-400" />
                      {search.surfaceMin} m² min
                    </div>
                    {search.caracteristiques?.salaire && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Euro className="h-4 w-4 mr-2 text-gray-400" />
                        {search.caracteristiques.salaire} €/mois revenu
                      </div>
                    )}
                    {search.caracteristiques?.delaiRecherche && (
                      <div className="flex items-center text-sm text-gray-600">
                        <div className="h-4 w-4 mr-2 text-gray-400 flex items-center justify-center">
                          <span className="text-[10px] font-bold">⏱</span>
                        </div>
                        {search.caracteristiques.delaiRecherche === 'urgent' ? 'Urgent (< 1 mois)' :
                          search.caracteristiques.delaiRecherche === '1-3' ? '1 à 3 mois' :
                            search.caracteristiques.delaiRecherche === '3-6' ? '3 à 6 mois' :
                              search.caracteristiques.delaiRecherche}
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                        {search.owner?.profile?.prenom?.charAt(0) || 'A'}
                      </div>
                      <div className="ml-2 text-xs">
                        <p className="font-semibold text-gray-900">{search.owner?.profile?.prenom || 'Acquéreur'}</p>
                        <p className="text-gray-500">Il y a {new Date(search.updatedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                        onClick={() => handleChat(search.owner.id)}
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Discuter
                      </Button>
                      <Link href={`/agence/buyer/${search.owner.id}`}>
                        <Button size="sm" variant="ghost" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 p-2">
                          Voir <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            /* No searches yet */
            <div className="md:col-span-2 lg:col-span-3 text-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border-2 border-dashed border-gray-200">
              <div className="mx-auto h-24 w-24 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
                <Search className="h-10 w-10 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Aucune recherche active</h3>
              <p className="text-gray-500 max-w-sm mx-auto">
                Les recherches des acquéreurs apparaîtront ici.
              </p>
            </div>
          )}
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
