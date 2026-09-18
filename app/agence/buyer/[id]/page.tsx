'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { ArrowLeft, MapPin, Euro, Home, Ruler, Lock, Unlock, BadgeEuro, CheckCircle2, BedDouble, LayoutGrid, Briefcase, Wallet, Banknote, Users, Clock, Calendar } from 'lucide-react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Navbar } from '@/components/layout/Navbar'
import { LocationMapDraw } from '@/components/ui/LocationMapDraw'
import { useI18n } from '@/lib/i18n/client'
import { intlLocale } from '@/lib/i18n/core'

// Critères supplémentaires : la clé est le champ enregistré, le libellé vient du dictionnaire.
const AMENITY_KEYS = ['balcon', 'terrasse', 'jardin', 'parking', 'cave', 'ascenseur'] as const

function BuyerProfileContent() {
    const params = useParams()
    const searchParams = useSearchParams()
    const id = params?.id as string
    const sessionId = searchParams.get('session_id')
    const router = useRouter()
    const { t, locale } = useI18n()
    const amenities = AMENITY_KEYS.map((k) => ({ k, l: t(`buyer.amenities.${k}`) }))
    const [buyerData, setBuyerData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [unlocking, setUnlocking] = useState(false)
    const [verifying, setVerifying] = useState(false)
    const [subscriptionRequired, setSubscriptionRequired] = useState(false)

    useEffect(() => {
        if (!id) return
        const fetchBuyer = async () => {
            try {
                const res = await fetch(`/api/agence/buyer/${id}`)
                if (res.ok) {
                    const data = await res.json()
                    setBuyerData(data)
                } else if (res.status === 403) {
                    const body = await res.json().catch(() => null)
                    if (body?.subscriptionRequired) setSubscriptionRequired(true)
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
                    alert(t('agency.buyerProfile.paymentValidated'))
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
        if (!confirm(t('agency.buyerProfile.confirmUnlock', { price: buyerData.price }))) return

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
                if (responseData.clientSecret) {
                    // Redirect to Stripe Embedded Checkout
                    window.location.href = '/agence/paiement?client_secret=' + responseData.clientSecret
                    return
                }

                // Mock Success
                // Refresh data
                const refreshRes = await fetch(`/api/agence/buyer/${id}`)
                const refreshData = await refreshRes.json()
                setBuyerData(refreshData)
                alert(t('agency.buyerProfile.unlockSuccess'))
            } else {
                const msg = responseData.details || t('agency.buyerProfile.unknownError')
                alert(t('agency.buyerProfile.paymentError', { message: msg }))
            }
        } catch (error) {
            console.error('Payment error', error)
            alert(t('agency.buyerProfile.connectionError'))
        } finally {
            setUnlocking(false)
        }
    }

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50">{t('agency.buyerProfile.loading')}</div>
    }

    if (subscriptionRequired) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
                <Lock className="h-10 w-10 text-amber-600 mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">{t('agency.buyerProfile.subscriptionRequired')}</h2>
                <p className="text-gray-500 max-w-md">
                    {t('agency.buyerProfile.subscriptionRequiredDesc')}
                </p>
                <Button className="mt-6" onClick={() => router.push('/agence/dashboard')}>
                    {t('agency.buyerProfile.seeOffers')}
                </Button>
            </div>
        )
    }

    if (!buyerData) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                <h2 className="text-xl font-bold text-gray-900 mb-2">{t('agency.buyerProfile.notFound')}</h2>
                <p className="text-gray-500">{t('agency.buyerProfile.searchedId')} <code className="bg-gray-200 px-1 rounded">{id || 'undefined'}</code></p>
                <Button variant="outline" className="mt-4" onClick={() => router.back()}>
                    {t('agency.buyerProfile.back')}
                </Button>
            </div>
        )
    }

    const { profile, unlocked, price } = buyerData
    let { search } = buyerData
    
    // Parse caracteristiques if stringified JSON
    if (search && typeof search.caracteristiques === 'string') {
        try {
            search = {
                ...search,
                caracteristiques: JSON.parse(search.caracteristiques)
            }
        } catch (e) {
            console.error('Failed to parse caracteristiques', e)
        }
    }
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar role="agence" />

            <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" className="gap-2" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                        {t('agency.buyerProfile.back')}
                    </Button>
                    <h1 className="text-3xl font-bold text-gray-900">{t('agency.buyerProfile.title')}</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Requirements Card */}
                    <Card className="border-none shadow-lg bg-white overflow-hidden">
                        <CardHeader className="bg-slate-900 text-white p-6">
                            <CardTitle className="text-2xl flex items-center gap-2">
                                <Home className="h-6 w-6" />
                                {t('agency.buyerProfile.criteria')}
                            </CardTitle>
                            <CardDescription className="text-blue-100">
                                {t('agency.buyerProfile.criteriaDesc')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                                        <BadgeEuro className="h-4 w-4" />
                                        <span className="text-sm font-medium">{t('agency.buyerProfile.budget')}</span>
                                    </div>
                                    <p className="text-lg font-bold text-gray-900 break-words">
                                        {search?.prixMin ? `${search.prixMin.toLocaleString(intlLocale(locale))} - ` : ''}{search?.prixMax?.toLocaleString(intlLocale(locale))} €
                                    </p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                                        <Ruler className="h-4 w-4" />
                                        <span className="text-sm font-medium">{t('agency.buyerProfile.surface')}</span>
                                    </div>
                                    <p className="text-lg font-bold text-gray-900">
                                        {search?.surfaceMin || 0}{search?.surfaceMax ? ` - ${search.surfaceMax}` : ''} m²
                                    </p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                                        <LayoutGrid className="h-4 w-4" />
                                        <span className="text-sm font-medium">{t('agency.buyerProfile.rooms')}</span>
                                    </div>
                                    <p className="text-lg font-bold text-gray-900">
                                        {search?.nombrePieces && search.nombrePieces.length > 0 
                                            ? search.nombrePieces.join(', ') 
                                            : t('agency.buyerProfile.notSpecified')}
                                    </p>
                                </div>

                            </div>

                            <div className="space-y-4">
                                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="mt-1 bg-blue-100 p-2 rounded-full text-amber-500">
                                        <Home className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">{t('agency.buyerProfile.propertyType')}</p>
                                        <p className="text-lg font-semibold text-gray-900 capitalize">
                                            {(search?.typeBien || []).join(', ') || t('agency.buyerProfile.notSpecified')}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="mt-1 bg-green-100 p-2 rounded-full text-green-600">
                                        <MapPin className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">{t('agency.buyerProfile.sectors')}</p>
                                        <div className="flex flex-wrap gap-2 mt-1 mb-3">
                                            {search?.localisation?.map((zone: string, i: number) => (
                                                <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    {zone}
                                                </span>
                                            )) || <span className="text-gray-900">{t('agency.buyerProfile.notSpecified')}</span>}
                                        </div>

                                        {/* Display Drawn Area if available */}
                                        {search?.caracteristiques?.drawnArea && (
                                            <div className="mt-4 rounded-lg overflow-hidden border border-gray-200">
                                                <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                                                    <p className="text-xs font-medium text-gray-500 flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" /> {t('agency.buyerProfile.drawnArea')}
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
                                        <p className="text-sm font-medium text-gray-500">{t('agency.buyerProfile.extras')}</p>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {amenities.filter(({ k }) => search?.caracteristiques?.[k]).map(({ k, l }) => (
                                                <span key={k} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                                                    {l}
                                                </span>
                                            )).length > 0
                                                ? amenities.filter(({ k }) => search?.caracteristiques?.[k]).map(({ k, l }) => (
                                                    <span key={k} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                                                        {l}
                                                    </span>
                                                ))
                                                : <span className="text-gray-500 italic">{t('agency.buyerProfile.noExtras')}</span>
                                            }
                                        </div>
                                        {/* Commentaires libres */}
                                        {search?.caracteristiques?.commentaires && (
                                            <div className="mt-3 p-3 bg-orange-50 rounded-lg border border-orange-100">
                                                <p className="text-xs font-medium text-gray-500 uppercase mb-1">{t('agency.buyerProfile.comments')}</p>
                                                <p className="text-sm text-gray-800 italic">&ldquo;{search.caracteristiques.commentaires}&rdquo;</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Project Urgency Section */}
                                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="mt-1 bg-indigo-100 p-2 rounded-full text-amber-500">
                                        <Clock className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">{t('agency.buyerProfile.project')}</p>
                                        <div className="grid grid-cols-2 gap-x-8 gap-y-1 mt-1">
                                            <div>
                                                <span className="text-xs text-gray-500 uppercase">{t('agency.buyerProfile.delay')}</span>
                                                <p className="font-semibold text-gray-900">
                                                    {search?.caracteristiques?.delaiRecherche === 'urgent' ? t('agency.delays.urgent') :
                                                        search?.caracteristiques?.delaiRecherche === '1-3' ? t('agency.delays.m1to3') :
                                                            search?.caracteristiques?.delaiRecherche === '3-6' ? t('agency.delays.m3to6') :
                                                                search?.caracteristiques?.delaiRecherche === '6-12' ? t('agency.delays.m6to12') :
                                                                    search?.caracteristiques?.delaiRecherche === '12+' ? t('agency.delays.m12plus') : t('agency.buyerProfile.notDefined')}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-xs text-gray-500 uppercase">{t('agency.buyerProfile.flexibility')}</span>
                                                <p className="font-semibold text-gray-900 capitalize">
                                                    {search?.caracteristiques?.flexibilite || t('agency.buyerProfile.notDefined')}
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
                                {t('agency.buyerProfile.situationFinance')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                                        <Briefcase className="h-4 w-4" /> {t('agency.buyerProfile.professional')}
                                    </p>
                                    <p className="text-lg font-semibold text-gray-900 capitalize">
                                        {search?.caracteristiques?.situationProfessionnelle || t('agency.buyerProfile.notSpecified')}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                                        <Banknote className="h-4 w-4" /> {t('agency.buyerProfile.income')}
                                    </p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {search?.caracteristiques?.salaire ? `${search.caracteristiques.salaire} €` : t('agency.buyerProfile.notSpecified')}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                                        <Wallet className="h-4 w-4" /> {t('agency.buyerProfile.assets')}
                                    </p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {search?.caracteristiques?.patrimoine ? `${search.caracteristiques.patrimoine} €` : t('agency.buyerProfile.notSpecified')}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                                        <BadgeEuro className="h-4 w-4" /> {t('agency.buyerProfile.deposit')}
                                    </p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {search?.caracteristiques?.apport ? `${search.caracteristiques.apport} €` : t('agency.buyerProfile.notSpecified')}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                                        <Banknote className="h-4 w-4" /> {t('agency.buyerProfile.financing')}
                                    </p>
                                    <p className="text-lg font-semibold text-gray-900 capitalize">
                                        {search?.financement ? search.financement.replace('-', ' ') : t('agency.buyerProfile.notSpecified')}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                                        <Briefcase className="h-4 w-4" /> {t('agency.buyerProfile.loanDuration')}
                                    </p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {search?.caracteristiques?.dureePret ? t('agency.buyerProfile.years', { count: search.caracteristiques.dureePret }) : t('agency.buyerProfile.notSpecified')}
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
                                {t('agency.buyerProfile.personal')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-gray-500">{t('agency.buyerProfile.family')}</p>
                                    <p className="text-lg font-semibold text-gray-900 capitalize">
                                        {search?.caracteristiques?.situationFamiliale || t('agency.buyerProfile.notSpecified')}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-gray-500">{t('agency.buyerProfile.children')}</p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {search?.caracteristiques?.nombreEnfants ? t('agency.buyerProfile.childrenCount', { count: search.caracteristiques.nombreEnfants }) : t('agency.buyerProfile.none')}
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
                                {t('agency.buyerProfile.contact')}
                            </CardTitle>
                            <CardDescription className={unlocked ? 'text-green-100' : 'text-gray-300'}>
                                {unlocked ? t('agency.buyerProfile.contactUnlocked') : t('agency.buyerProfile.contactHidden')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 relative">
                            <div className={`space-y-6 ${!unlocked ? 'filter blur-sm select-none opacity-50' : ''}`}>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">{t('agency.buyerProfile.fullName')}</p>
                                    <p className="text-xl font-bold text-gray-900">{profile.prenom} {profile.nom}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">{t('agency.buyerProfile.email')}</p>
                                    <p className="text-lg text-gray-900">{profile.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">{t('agency.buyerProfile.phone')}</p>
                                    <p className="text-lg text-gray-900">{profile.telephone}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">{t('agency.buyerProfile.city')}</p>
                                    <p className="text-lg text-gray-900">{profile.ville || t('agency.buyerProfile.cityMissing')}</p>
                                </div>
                            </div>

                            {/* Overlay for Locked State */}
                            {!unlocked && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
                                    <Lock className="h-12 w-12 text-gray-800 mb-4" />
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{t('agency.buyerProfile.locked')}</h3>
                                    <p className="text-gray-600 mb-6 max-w-xs">
                                        {t('agency.buyerProfile.lockedDesc')}
                                    </p>
                                    <Button
                                        size="lg"
                                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-xl transform transition hover:-translate-y-1"
                                        onClick={handleUnlock}
                                        disabled={unlocking}
                                    >
                                        {unlocking ? t('agency.buyerProfile.processing') : t('agency.buyerProfile.unlockFor', { price })}
                                        {!unlocking && <Unlock className="ml-2 h-4 w-4" />}
                                    </Button>
                                    <p className="text-xs text-gray-400 mt-3">
                                        {t('agency.buyerProfile.oneTimePayment')}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                        {unlocked && (
                            <CardFooter className="bg-emerald-50 p-4 flex items-center justify-center text-emerald-700 font-medium">
                                <CheckCircle2 className="h-5 w-5 mr-2" />
                                {t('agency.buyerProfile.hasAccess')}
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
