'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { ArrowLeft, MapPin, Euro, Home, Ruler, Lock, Unlock, BadgeEuro, CheckCircle2, BedDouble, LayoutGrid, Briefcase, Wallet, Banknote, Users, Clock, Calendar } from 'lucide-react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Navbar } from '@/components/layout/Navbar'
import { LocationMapDraw } from '@/components/ui/LocationMapDraw'

function BuyerProfileContent() {
    const params = useParams()
    const searchParams = useSearchParams()
    const id = params?.id as string
    const sessionId = searchParams.get('session_id')
    const router = useRouter()
    const [buyerData, setBuyerData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [unlocking, setUnlocking] = useState(false)
    const [verifying, setVerifying] = useState(false)

    useEffect(() => {
        if (!id) return
        const fetchBuyer = async () => {
            try {
                const res = await fetch(`/api/agence/buyer/${id}`)
                if (res.ok) {
                    const data = await res.json()
                    setBuyerData(data)
                }
            } catch (error) {
                console.error('Failed to fetch buyer', error)
            } finally {
                setLoading(false)
            }
        }
        fetchBuyer()
    }, [id])

    // Verify Payment Effect
    useEffect(() => {
        if (!sessionId || verifying) return

        const verifyPayment = async () => {
            setVerifying(true)
            try {
                const res = await fetch('/api/payment/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sessionId })
                })

                if (res.ok) {
                    alert('Paiement validé avec succès !')
                    // Clear query param
                    router.replace(`/agence/buyer/${id}`)
                    // Refresh data happens automatically via other useEffect if we trigger it? 
                    // Or we just reload location.
                    window.location.href = `/agence/buyer/${id}`
                } else {
                    const err = await res.json()
                    console.error('Verify failed', err)
                }
            } catch (e) {
                console.error('Verify error', e)
            } finally {
                setVerifying(false)
            }
        }

        verifyPayment()
    }, [sessionId])

    const handleUnlock = async () => {
        if (!confirm(`Confirmer le paiement de ${buyerData.price}€ pour débloquer ce contact ?`)) return

        setUnlocking(true)
        try {
            // For MVP/Demo: Direct unlock. In production, this would redirect to Stripe Checkout.
            const res = await fetch('/api/payment/unlock', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    buyerId: id,
                    amount: buyerData.price
                })
            })

            const responseData = await res.json().catch(() => ({}))

            if (res.ok) {
                if (responseData.url) {
                    // Redirect to Stripe
                    window.location.href = responseData.url
                    return
                }

                // Mock Success
                // Refresh data
                const refreshRes = await fetch(`/api/agence/buyer/${id}`)
                const refreshData = await refreshRes.json()
                setBuyerData(refreshData)
                alert('Contact débloqué avec succès !')
            } else {
                const msg = responseData.details || 'Erreur inconnue'
                alert(`Erreur lors du paiement: ${msg}\n\nSi le message indique que la table n'existe pas, veuillez redémarrer le serveur (npm run dev).`)
            }
        } catch (error) {
            console.error('Payment error', error)
            alert('Erreur de connexion.')
        } finally {
            setUnlocking(false)
        }
    }

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50">Chargement...</div>
    }

    if (!buyerData) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Profil introuvable</h2>
                <p className="text-gray-500">ID recherché: <code className="bg-gray-200 px-1 rounded">{id || 'undefined'}</code></p>
                <Button variant="outline" className="mt-4" onClick={() => router.back()}>
                    Retour
                </Button>
            </div>
        )
    }

    const { search, profile, unlocked, price } = buyerData

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar role="agence" />

            <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" className="gap-2" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                        Retour
                    </Button>
                    <h1 className="text-3xl font-bold text-gray-900">Profil Acquéreur</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Requirements Card */}
                    <Card className="border-none shadow-lg bg-white overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                            <CardTitle className="text-2xl flex items-center gap-2">
                                <Home className="h-6 w-6" />
                                Critères de recherche
                            </CardTitle>
                            <CardDescription className="text-blue-100">
                                Ce que recherche cet acquéreur
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                                        <BadgeEuro className="h-4 w-4" />
                                        <span className="text-sm font-medium">Budget</span>
                                    </div>
                                    <p className="text-lg font-bold text-gray-900 break-words">
                                        {search?.prixMin ? `${search.prixMin.toLocaleString()} - ` : ''}{search?.prixMax?.toLocaleString()} €
                                    </p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                                        <Ruler className="h-4 w-4" />
                                        <span className="text-sm font-medium">Surface</span>
                                    </div>
                                    <p className="text-lg font-bold text-gray-900">
                                        {search?.surfaceMin || 0}{search?.surfaceMax ? ` - ${search.surfaceMax}` : ''} m²
                                    </p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                                        <LayoutGrid className="h-4 w-4" />
                                        <span className="text-sm font-medium">Pièces</span>
                                    </div>
                                    <p className="text-lg font-bold text-gray-900">
                                        {search?.nombrePieces || 'Non spécifié'}
                                    </p>
                                </div>

                            </div>

                            <div className="space-y-4">
                                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="mt-1 bg-blue-100 p-2 rounded-full text-blue-600">
                                        <Home className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Type de bien</p>
                                        <p className="text-lg font-semibold text-gray-900 capitalize">
                                            {(search?.typeBien || []).join(', ') || 'Non spécifié'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="mt-1 bg-green-100 p-2 rounded-full text-green-600">
                                        <MapPin className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Secteur(s)</p>
                                        <div className="flex flex-wrap gap-2 mt-1 mb-3">
                                            {search?.localisation?.map((zone: string, i: number) => (
                                                <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    {zone}
                                                </span>
                                            )) || <span className="text-gray-900">Non spécifié</span>}
                                        </div>

                                        {/* Display Drawn Area if available */}
                                        {search?.caracteristiques?.drawnArea && (
                                            <div className="mt-4 rounded-lg overflow-hidden border border-gray-200">
                                                <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                                                    <p className="text-xs font-medium text-gray-500 flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" /> Zone de recherche précise
                                                    </p>
                                                </div>
                                                <div className="h-[300px] w-full relative">
                                                    <LocationMapDraw
                                                        value={search.caracteristiques.drawnArea}
                                                        onChange={() => { }}
                                                        height="300px"
                                                        readOnly={true}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Amenities Section */}
                                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="mt-1 bg-orange-100 p-2 rounded-full text-orange-600">
                                        <CheckCircle2 className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Critères supplémentaires</p>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {[
                                                { k: 'balcon', l: 'Balcon' },
                                                { k: 'terrasse', l: 'Terrasse' },
                                                { k: 'jardin', l: 'Jardin' },
                                                { k: 'parking', l: 'Parking' },
                                                { k: 'cave', l: 'Cave' },
                                                { k: 'ascenseur', l: 'Ascenseur' }
                                            ].filter(({ k }) => search?.caracteristiques?.[k]).map(({ k, l }) => (
                                                <span key={k} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                                                    {l}
                                                </span>
                                            )).length > 0
                                                ? [
                                                    { k: 'balcon', l: 'Balcon' },
                                                    { k: 'terrasse', l: 'Terrasse' },
                                                    { k: 'jardin', l: 'Jardin' },
                                                    { k: 'parking', l: 'Parking' },
                                                    { k: 'cave', l: 'Cave' },
                                                    { k: 'ascenseur', l: 'Ascenseur' }
                                                ].filter(({ k }) => search?.caracteristiques?.[k]).map(({ k, l }) => (
                                                    <span key={k} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                                                        {l}
                                                    </span>
                                                ))
                                                : <span className="text-gray-500 italic">Aucun critère spécifique</span>
                                            }
                                        </div>
                                    </div>
                                </div>

                                {/* Project Urgency Section */}
                                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="mt-1 bg-indigo-100 p-2 rounded-full text-indigo-600">
                                        <Clock className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Projet</p>
                                        <div className="grid grid-cols-2 gap-x-8 gap-y-1 mt-1">
                                            <div>
                                                <span className="text-xs text-gray-500 uppercase">Délai:</span>
                                                <p className="font-semibold text-gray-900">
                                                    {search?.caracteristiques?.delaiRecherche === 'urgent' ? 'Urgent (< 1 mois)' :
                                                        search?.caracteristiques?.delaiRecherche === '1-3' ? '1 à 3 mois' :
                                                            search?.caracteristiques?.delaiRecherche === '3-6' ? '3 à 6 mois' :
                                                                search?.caracteristiques?.delaiRecherche === '6-12' ? '6 à 12 mois' :
                                                                    search?.caracteristiques?.delaiRecherche === '12+' ? '+ 12 mois' : 'Non défini'}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-xs text-gray-500 uppercase">Flexibilité:</span>
                                                <p className="font-semibold text-gray-900 capitalize">
                                                    {search?.caracteristiques?.flexibilite || 'Non défini'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Financial & Professional Profile */}
                    <Card className="border-none shadow-lg bg-white overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-teal-500 to-green-600 text-white p-6">
                            <CardTitle className="text-2xl flex items-center gap-2">
                                <Briefcase className="h-6 w-6" />
                                Situation & Finance
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                                        <Briefcase className="h-4 w-4" /> Situation Professionnelle
                                    </p>
                                    <p className="text-lg font-semibold text-gray-900 capitalize">
                                        {search?.caracteristiques?.situationProfessionnelle || 'Non spécifié'}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                                        <Banknote className="h-4 w-4" /> Revenus Mensuels
                                    </p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {search?.caracteristiques?.salaire ? `${search.caracteristiques.salaire} €` : 'Non spécifié'}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                                        <Wallet className="h-4 w-4" /> Patrimoine
                                    </p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {search?.caracteristiques?.patrimoine ? `${search.caracteristiques.patrimoine} €` : 'Non spécifié'}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                                        <BadgeEuro className="h-4 w-4" /> Apport
                                    </p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {search?.caracteristiques?.apport ? `${search.caracteristiques.apport} €` : 'Non spécifié'}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                                        <Banknote className="h-4 w-4" /> Type de Financement
                                    </p>
                                    <p className="text-lg font-semibold text-gray-900 capitalize">
                                        {search?.financement ? search.financement.replace('-', ' ') : 'Non spécifié'}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                                        <Briefcase className="h-4 w-4" /> Durée du Prêt
                                    </p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {search?.caracteristiques?.dureePret ? `${search.caracteristiques.dureePret} ans` : 'Non spécifié'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Personal Situation Card (New) */}
                    <Card className="border-none shadow-lg bg-white overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6">
                            <CardTitle className="text-2xl flex items-center gap-2">
                                <Users className="h-6 w-6" />
                                Situation Personnelle
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-gray-500">Situation Familiale</p>
                                    <p className="text-lg font-semibold text-gray-900 capitalize">
                                        {search?.caracteristiques?.situationFamiliale || 'Non spécifié'}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-gray-500">Enfants</p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {search?.caracteristiques?.nombreEnfants ? `${search.caracteristiques.nombreEnfants} enfant(s)` : 'Aucun'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contact Info Card */}
                    <Card className={`border-none shadow-lg overflow-hidden ${unlocked ? 'bg-white' : 'bg-white'}`}>
                        <CardHeader className={`p-6 ${unlocked ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gray-800'} text-white`}>
                            <CardTitle className="text-2xl flex items-center gap-2">
                                {unlocked ? <Unlock className="h-6 w-6" /> : <Lock className="h-6 w-6" />}
                                Coordonnées
                            </CardTitle>
                            <CardDescription className={unlocked ? 'text-green-100' : 'text-gray-300'}>
                                {unlocked ? 'Informations de contact débloquées' : 'Informations masquées'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 relative">
                            <div className={`space-y-6 ${!unlocked ? 'filter blur-sm select-none opacity-50' : ''}`}>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Nom complet</p>
                                    <p className="text-xl font-bold text-gray-900">{profile.prenom} {profile.nom}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Email</p>
                                    <p className="text-lg text-gray-900">{profile.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Téléphone</p>
                                    <p className="text-lg text-gray-900">{profile.telephone}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Ville</p>
                                    <p className="text-lg text-gray-900">{profile.ville || 'Non renseignée'}</p>
                                </div>
                            </div>

                            {/* Overlay for Locked State */}
                            {!unlocked && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
                                    <Lock className="h-12 w-12 text-gray-800 mb-4" />
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Contact Verrouillé</h3>
                                    <p className="text-gray-600 mb-6 max-w-xs">
                                        Débloquez les coordonnées complètes de cet acquéreur pour entrer en contact direct.
                                    </p>
                                    <Button
                                        size="lg"
                                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-xl transform transition hover:-translate-y-1"
                                        onClick={handleUnlock}
                                        disabled={unlocking}
                                    >
                                        {unlocking ? 'Traitement...' : `Débloquer pour ${price} €`}
                                        {!unlocking && <Unlock className="ml-2 h-4 w-4" />}
                                    </Button>
                                    <p className="text-xs text-gray-400 mt-3">
                                        Paiement unique sécurisé. Accès illimité après déblocage.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                        {unlocked && (
                            <CardFooter className="bg-emerald-50 p-4 flex items-center justify-center text-emerald-700 font-medium">
                                <CheckCircle2 className="h-5 w-5 mr-2" />
                                Vous avez accès à ce contact
                            </CardFooter>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default function BuyerProfilePage() {
    return (
        <ProtectedRoute requiredRole="agence">
            <BuyerProfileContent />
        </ProtectedRoute>
    )
}
