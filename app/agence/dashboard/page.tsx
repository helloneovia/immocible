'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import {
  Search,
  TrendingUp,
  FileText,
  ArrowRight,
  MapPin,
  Euro,
  CheckCircle2,
  Filter,
  MessageSquare,
  Zap,
  Crown,
  X
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Navbar } from '@/components/layout/Navbar'
import { DEFAULT_SETTINGS, type AppSettings } from '@/lib/settings'

function DashboardContent() {
  const router = useRouter()
  const { signOut, user } = useAuth()

  const subscriptionEndDate = (user?.profile as any)?.subscriptionEndDate
  const showExpiryWarning = subscriptionEndDate &&
    (new Date(subscriptionEndDate).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000) &&
    (new Date(subscriptionEndDate).getTime() > new Date().getTime())

  const [activeSearches, setActiveSearches] = useState([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({ location: '', budgetMin: '', surfaceMin: '', typeBien: 'all' })
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)

  useEffect(() => {
    fetch('/api/public/settings').then(r => r.json()).then(d => { if (d && !d.error) setSettings(d) }).catch(console.error)
  }, [])

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
    if (filters.budgetMin && (search.prixMax || 0) < parseInt(filters.budgetMin)) return false
    if (filters.surfaceMin && (search.surfaceMin || 0) < parseInt(filters.surfaceMin)) return false
    if (filters.typeBien !== 'all' && !search.typeBien?.some((t: string) => t.toLowerCase() === filters.typeBien.toLowerCase())) return false
    return true
  })

  const clearFilters = () => setFilters({ location: '', budgetMin: '', surfaceMin: '', typeBien: 'all' })

  const handleChat = async (buyerId: string) => {
    try {
      const response = await fetch('/api/chat/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buyerId })
      })
      const data = await response.json()
      if (response.ok) { router.push(`/agence/messages?conversation=${data.conversationId}`) }
      else { alert(data.error || 'Une erreur est survenue') }
    } catch { alert('Impossible de contacter ce profil pour le moment.') }
  }

  const handleUpgrade = async () => {
    if (!user) return
    try {
      const response = await fetch('/api/payment/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, plan: 'yearly', nomAgence: user.profile?.nomAgence || 'Agence' })
      })
      const data = await response.json()
      if (response.ok && data.url) { window.location.href = data.url }
      else { alert('Erreur lors de l\'initialisation du paiement.') }
    } catch { alert('Erreur de connexion.') }
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar role="agence" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3 text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
            Recherches qualifiées
          </h1>
          <p className="text-lg text-slate-500 font-light">Acquéreurs vérifiés correspondant à vos biens</p>
        </div>

        {/* Subscription Expiry Warning */}
        {showExpiryWarning && (
          <Card className="mb-8 border-l-4 border-amber-500 shadow-sm bg-amber-50 rounded-xl">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap className="h-6 w-6 text-amber-600 fill-amber-200" />
                <div>
                  <p className="font-bold text-amber-900">Votre abonnement expire dans moins de 7 jours !</p>
                  <p className="text-sm text-amber-700">Renouvelez maintenant pour éviter toute interruption de service.</p>
                </div>
              </div>
              <Button variant="outline" className="border-amber-600 text-amber-800 hover:bg-amber-100" onClick={() => router.push('/settings')}>
                Gérer mon abonnement
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Subscription Plan Banner */}
        {((user?.profile as any)?.plan !== 'yearly') && (
          <Card className="mb-10 border-0 shadow-lg bg-slate-900 text-white overflow-hidden relative rounded-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/8 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/3 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3" />
            <CardContent className="p-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-4 max-w-2xl">
                <div className="flex items-center gap-3">
                  <Badge className="bg-amber-500/20 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 text-sm">
                    Offre Actuelle : Mensuel
                  </Badge>
                </div>
                <h2 className="text-3xl font-bold flex items-center gap-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Passez à la vitesse supérieure <Zap className="h-7 w-7 text-amber-400 fill-amber-400" />
                </h2>
                <p className="text-slate-300 text-lg font-light">
                  Débloquez l&apos;accès illimité à tous les acquéreurs qualifiés et boostez la visibilité de vos biens.
                </p>
                <div className="flex flex-wrap gap-4 text-sm text-slate-300">
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Contacts illimités</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Badge Agence Vérifiée</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Support Prioritaire</span>
                </div>
              </div>

              <div className="flex-shrink-0 bg-white/5 p-6 rounded-2xl backdrop-blur-sm border border-white/10 text-center min-w-[260px]">
                <p className="text-sm text-slate-400 uppercase tracking-wider font-semibold mb-2">Offre Annuelle</p>
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <span className="text-5xl font-extrabold text-white">{settings.price_yearly}€</span>
                  <span className="text-slate-400">/an</span>
                </div>
                <p className="text-sm text-amber-300 mb-6 font-medium">2 mois offerts</p>
                <Button size="lg" onClick={handleUpgrade}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold shadow-lg shadow-amber-500/25 border-0 hover:scale-105 transition-all">
                  <Crown className="mr-2 h-5 w-5" />
                  Passer Premium
                </Button>
                <p className="mt-3 text-xs text-center text-slate-500">Paiement sécurisé via Stripe</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <Card className="border-0 shadow-lg bg-slate-900 text-white rounded-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full -translate-y-6 translate-x-6" />
            <CardHeader className="pb-3">
              <CardDescription className="text-slate-400 flex items-center gap-2">
                <Search className="h-4 w-4" /> Recherches actives
              </CardDescription>
              <CardTitle className="text-4xl font-bold text-white">{activeSearches.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border border-slate-200 shadow-sm bg-white rounded-2xl">
            <CardHeader className="pb-3">
              <CardDescription className="text-slate-500 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" /> Matches trouvés
              </CardDescription>
              <CardTitle className="text-4xl font-bold text-slate-900">0</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Filter Toggle */}
        <div className="mb-8">
          <Button size="lg" variant="outline"
            className="border-2 border-slate-200 bg-white hover:bg-slate-900 hover:text-white hover:border-slate-900 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl font-semibold"
            onClick={() => setShowFilters(!showFilters)}>
            <Filter className="mr-2 h-5 w-5" />
            {showFilters ? 'Masquer les filtres' : 'Filtrer les recherches'}
          </Button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <Card className="mb-8 border border-slate-200 shadow-sm bg-white rounded-2xl">
            <CardHeader className="pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-slate-900">Filtres</CardTitle>
                <CardDescription>Affinez les résultats selon vos critères</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-slate-400 hover:text-red-500 hover:bg-red-50">
                <X className="mr-2 h-4 w-4" /> Réinitialiser
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Localisation</Label>
                  <Input placeholder="Ex: Paris" value={filters.location}
                    onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                    className="border-slate-200 focus:border-slate-900 rounded-lg" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Budget Min</Label>
                  <Input type="number" placeholder="Min €" value={filters.budgetMin}
                    onChange={(e) => setFilters(prev => ({ ...prev, budgetMin: e.target.value }))}
                    className="border-slate-200 focus:border-slate-900 rounded-lg" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Surface Min</Label>
                  <Input type="number" placeholder="Min m²" value={filters.surfaceMin}
                    onChange={(e) => setFilters(prev => ({ ...prev, surfaceMin: e.target.value }))}
                    className="border-slate-200 focus:border-slate-900 rounded-lg" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Type de bien</Label>
                  <Select value={filters.typeBien} onValueChange={(val) => setFilters(prev => ({ ...prev, typeBien: val }))}>
                    <SelectTrigger className="border-slate-200 focus:border-slate-900 rounded-lg"><SelectValue placeholder="Tous" /></SelectTrigger>
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

        {/* Searches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full py-20 text-center text-slate-400 font-light">
              Chargement des recherches...
            </div>
          ) : filteredSearches.length > 0 ? (
            filteredSearches.map((search: any) => (
              <Card key={search.id} className="border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 bg-white rounded-2xl overflow-hidden group">
                <div className="h-1 bg-gradient-to-r from-slate-700 via-amber-500 to-slate-700 w-full" />
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="bg-slate-100 p-2 rounded-lg group-hover:bg-slate-900 transition-colors duration-300">
                      <Search className="h-5 w-5 text-slate-600 group-hover:text-amber-400 transition-colors duration-300" />
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${search.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {search.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                  <CardTitle className="mt-4 text-lg font-bold text-slate-900">
                    Recherche {(search.typeBien || []).join(', ')}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {(search.localisation || []).join(', ')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2.5">
                    <div className="flex items-center text-sm text-slate-600">
                      <Euro className="h-4 w-4 mr-2 text-slate-400" />
                      {(search.prixMax || 0).toLocaleString()} € max
                    </div>
                    <div className="flex items-center text-sm text-slate-600">
                      <TrendingUp className="h-4 w-4 mr-2 text-slate-400" />
                      {search.surfaceMin} m² min
                    </div>
                    {search.caracteristiques?.delaiRecherche && (
                      <div className="flex items-center text-sm text-slate-600">
                        <span className="mr-2 text-slate-400 text-xs font-bold">⏱</span>
                        {search.caracteristiques.delaiRecherche === 'urgent' ? 'Urgent (< 1 mois)' :
                          search.caracteristiques.delaiRecherche === '1-3' ? '1 à 3 mois' :
                            search.caracteristiques.delaiRecherche === '3-6' ? '3 à 6 mois' :
                              search.caracteristiques.delaiRecherche}
                      </div>
                    )}
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                        {search.owner?.profile?.prenom?.charAt(0) || 'A'}
                      </div>
                      <div className="ml-2 text-xs">
                        <p className="font-semibold text-slate-900">{search.owner?.profile?.prenom || 'Acquéreur'}</p>
                        <p className="text-slate-400">{new Date(search.updatedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline"
                        className="text-slate-700 border-slate-200 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all duration-200 rounded-lg"
                        onClick={() => handleChat(search.owner.id)}>
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Discuter
                      </Button>
                      <Link href={`/agence/buyer/${search.owner.id}`}>
                        <Button size="sm" variant="ghost"
                          className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-2 rounded-lg">
                          Voir <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="md:col-span-2 lg:col-span-3 text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="mx-auto h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <Search className="h-9 w-9 text-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                Aucune recherche active
              </h3>
              <p className="text-slate-400 max-w-sm mx-auto font-light">
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
