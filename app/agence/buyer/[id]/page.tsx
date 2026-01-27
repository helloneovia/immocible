'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { ArrowLeft, MapPin, Euro, Home, Ruler, Lock, Unlock, BadgeEuro, CheckCircle2 } from 'lucide-react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

function BuyerProfileContent({ params }: { params: { id: string } }) {
    const router = useRouter()
    const [buyerData, setBuyerData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [unlocking, setUnlocking] = useState(false)

    useEffect(() => {
        const fetchBuyer = async () => {
            try {
                const res = await fetch(`/api/agence/buyer/${params.id}`)
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
    }, [params.id])

    const handleUnlock = async () => {
        if (!confirm(`Confirmer le paiement de ${buyerData.price}€ pour débloquer ce contact ?`)) return

        setUnlocking(true)
        try {
            // For MVP/Demo: Direct unlock. In production, this would redirect to Stripe Checkout.
            const res = await fetch('/api/payment/unlock', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    buyerId: params.id,
                    amount: buyerData.price
                })
            })

            if (res.ok) {
                // Refresh data
                const refreshRes = await fetch(`/api/agence/buyer/${params.id}`)
                const refreshData = await refreshRes.json()
                setBuyerData(refreshData)
                alert('Contact débloqué avec succès !')
            } else {
                alert('Erreur lors du paiement.')
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
        return <div className="min-h-screen flex items-center justify-center bg-gray-50">Profil introuvable</div>
    }

    const { search, profile, unlocked, price } = buyerData

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
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
                                        <span className="text-sm font-medium">Budget Max</span>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {search?.prixMax?.toLocaleString()} €
                                    </p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                                        <Ruler className="h-4 w-4" />
                                        <span className="text-sm font-medium">Surface Min</span>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {search?.surfaceMin || 0} m²
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
                                        <p className="text-lg font-semibold text-gray-900 capitalize">{search?.typeBien || 'Non spécifié'}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="mt-1 bg-green-100 p-2 rounded-full text-green-600">
                                        <MapPin className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Secteur(s)</p>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {search?.zones?.map((zone: string, i: number) => (
                                                <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    {zone}
                                                </span>
                                            )) || <span className="text-gray-900">Non spécifié</span>}
                                        </div>
                                    </div>
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

export default function BuyerProfilePage({ params }: { params: { id: string } }) {
    return (
        <ProtectedRoute requiredRole="agence">
            <BuyerProfileContent params={params} />
        </ProtectedRoute>
    )
}
