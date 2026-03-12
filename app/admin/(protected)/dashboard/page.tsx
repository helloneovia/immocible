import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Users, Building2, CreditCard, TrendingUp, ArrowRight, Home, MapPin, Wallet, PieChart, Briefcase, Heart, Banknote, Car, Euro, Clock, HelpCircle } from 'lucide-react'
import { getAppSettings } from '@/lib/settings'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

// Helper to process JSON characteristics safely
const parseCaracteristiques = (data: any) => {
    if (typeof data === 'string') {
        try {
            return JSON.parse(data)
        } catch {
            return {}
        }
    }
    return data || {}
}

// Helper to fetch stats
async function getStats() {
    const totalUsers = await prisma.user.count({
        where: { role: { not: 'admin' } } // Exclude admins
    })

    const acquereurs = await prisma.user.count({
        where: { role: 'acquereur' }
    })

    const agences = await prisma.user.count({
        where: { role: 'agence' }
    })

    // Estimate revenue from active subscriptions
    const monthlyActive = await prisma.profile.count({
        where: {
            plan: 'monthly',
            subscriptionStatus: 'ACTIVE'
        }
    })

    const yearlyActive = await prisma.profile.count({
        where: {
            plan: 'yearly',
            subscriptionStatus: 'ACTIVE'
        }
    })

    const settings = await getAppSettings()

    // Calculate MRR (Monthly Recurring Revenue)
    const mrr = (monthlyActive * settings.price_monthly) + ((yearlyActive * settings.price_yearly) / 12)

    // Unlock Revenue
    const unlockPayments = await prisma.payment.aggregate({
        where: { plan: 'unlock_contact' },
        _sum: { amount: true },
        _count: true
    })

    const unlockRevenue = unlockPayments._sum.amount || 0

    // Recent Payments
    const recentPayments = await prisma.payment.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
            user: {
                include: { profile: true }
            }
        }
    })

    // --- Comprehensive Questionnaire Statistics ---
    const recherches = await prisma.recherche.findMany({
        where: { isActive: true },
        select: {
            typeBien: true,
            localisation: true,
            financement: true,
            prixMax: true,
            caracteristiques: true,
        }
    })

    const totalRecherches = recherches.length

    // Aggregators
    const typeBienCounts: Record<string, number> = {}
    const localisationCounts: Record<string, number> = {}
    const financementCounts: Record<string, number> = {}

    // Demographics
    const situationFamilialeCounts: Record<string, number> = {}
    const situationProCounts: Record<string, number> = {}

    // Finances
    const salaireCounts: Record<string, number> = {}
    const patrimoineCounts: Record<string, number> = {}
    const apportCounts: Record<string, number> = {}
    let totalPrixMax = 0
    let prixMaxCount = 0

    // Features
    const ammenities = {
        balcon: 0,
        terrasse: 0,
        jardin: 0,
        parking: 0,
        cave: 0,
        ascenseur: 0
    }

    // Urgency
    const delaiCounts: Record<string, number> = {}

    // Process all active searches
    recherches.forEach(r => {
        // Core Criteria
        r.typeBien.forEach(type => {
            typeBienCounts[type] = (typeBienCounts[type] || 0) + 1
        })

        r.localisation.forEach(loc => {
            localisationCounts[loc] = (localisationCounts[loc] || 0) + 1
        })

        if (r.financement) {
            financementCounts[r.financement] = (financementCounts[r.financement] || 0) + 1
        }

        if (r.prixMax && r.prixMax > 0) {
            totalPrixMax += r.prixMax
            prixMaxCount++
        }

        // Characteristics (JSON parsing)
        const car = parseCaracteristiques(r.caracteristiques)

        // Demographics
        if (car.situationFamiliale) situationFamilialeCounts[car.situationFamiliale] = (situationFamilialeCounts[car.situationFamiliale] || 0) + 1
        if (car.situationProfessionnelle) situationProCounts[car.situationProfessionnelle] = (situationProCounts[car.situationProfessionnelle] || 0) + 1

        // Finances
        if (car.salaire) salaireCounts[car.salaire] = (salaireCounts[car.salaire] || 0) + 1
        if (car.patrimoine) patrimoineCounts[car.patrimoine] = (patrimoineCounts[car.patrimoine] || 0) + 1
        if (car.apport) apportCounts[car.apport] = (apportCounts[car.apport] || 0) + 1

        // Features
        if (car.balcon) ammenities.balcon++
        if (car.terrasse) ammenities.terrasse++
        if (car.jardin) ammenities.jardin++
        if (car.parking) ammenities.parking++
        if (car.cave) ammenities.cave++
        if (car.ascenseur) ammenities.ascenseur++

        // Urgency
        if (car.delaiRecherche) delaiCounts[car.delaiRecherche] = (delaiCounts[car.delaiRecherche] || 0) + 1
    })

    // Sorters
    const sortObject = (obj: Record<string, number>, limit = 5) =>
        Object.entries(obj).sort((a, b) => b[1] - a[1]).slice(0, limit)

    const topTypesBien = sortObject(typeBienCounts)
    const topLocalisations = sortObject(localisationCounts)
    const topFinancements = sortObject(financementCounts)

    const topSituationsFam = sortObject(situationFamilialeCounts)
    const topSituationsPro = sortObject(situationProCounts)

    const topSalaires = sortObject(salaireCounts)
    const topPatrimoines = sortObject(patrimoineCounts)
    const topApports = sortObject(apportCounts)

    const topDelais = sortObject(delaiCounts)

    const avgBudget = prixMaxCount > 0 ? Math.round(totalPrixMax / prixMaxCount) : 0

    // Feature array for progress bars
    const topFeatures = Object.entries(ammenities)
        .sort((a, b) => b[1] - a[1])

    const questionnaireStats = {
        totalRecherches,
        topTypesBien,
        topLocalisations,
        topFinancements,
        topSituationsFam,
        topSituationsPro,
        topSalaires,
        topPatrimoines,
        topApports,
        avgBudget,
        topFeatures,
        topDelais
    }

    return {
        totalUsers,
        acquereurs,
        agences,
        monthlyActive,
        yearlyActive,
        mrr,
        unlockRevenue,
        recentPayments,
        settings,
        questionnaireStats
    }
}

// Progress Bar Shared Component
function StatBar({ label, count, total }: { label: string, count: number, total: number }) {
    if (!label || count === 0) return null
    const percentage = ((count / total) * 100).toFixed(0)

    // Clean up label if it contains underscores or dashes
    const cleanLabel = label.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

    return (
        <div className="space-y-1">
            <div className="flex justify-between text-xs sm:text-sm">
                <span className="font-medium text-gray-700 truncate pr-2" title={cleanLabel}>{cleanLabel}</span>
                <span className="text-gray-500 shrink-0 font-mono">{percentage}% ({count})</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    )
}

export default async function AdminDashboard() {
    const stats = await getStats()

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

            {/* Overview Cards with Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Link href="/admin/users?role=all" className="block group">
                    <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-indigo-500 h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600 group-hover:text-amber-500 transition-colors">Utilisateurs Total</CardTitle>
                            <Users className="h-4 w-4 text-indigo-200 group-hover:text-indigo-500 transition-colors" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{stats.totalUsers}</div>
                            <p className="text-xs text-gray-500 mt-1">{stats.acquereurs} Acquéreurs, {stats.agences} Agences</p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/admin/subscriptions" className="block group">
                    <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-purple-500 h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600 group-hover:text-purple-600 transition-colors">Abonnements Actifs</CardTitle>
                            <Building2 className="h-4 w-4 text-purple-200 group-hover:text-purple-500 transition-colors" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{stats.monthlyActive + stats.yearlyActive}</div>
                            <p className="text-xs text-gray-500 mt-1">Agences souscrites</p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/admin/transactions" className="block group">
                    <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-emerald-500 h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600 group-hover:text-emerald-600 transition-colors">MRR (Revenu Récurrent)</CardTitle>
                            <TrendingUp className="h-4 w-4 text-emerald-200 group-hover:text-emerald-500 transition-colors" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(stats.mrr)}</div>
                            <p className="text-xs text-gray-500 mt-1">Estimé mensuel</p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/admin/transactions?type=unlock" className="block group">
                    <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-amber-500 h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600 group-hover:text-amber-600 transition-colors">Revenu Déblocages</CardTitle>
                            <CreditCard className="h-4 w-4 text-amber-200 group-hover:text-amber-500 transition-colors" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(stats.unlockRevenue)}</div>
                            <p className="text-xs text-gray-500 mt-1">Total à vie</p>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Subscription Breakdown */}
                <Card className="col-span-1 shadow-sm border bg-white/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Répartition des Abonnements</CardTitle>
                        <Button variant="ghost" size="sm" asChild className="text-amber-500 hover:text-indigo-700 hover:bg-indigo-50">
                            <Link href="/admin/subscriptions">
                                Voir détails <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-indigo-100 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 bg-indigo-50 rounded-full flex items-center justify-center text-amber-500 ring-4 ring-indigo-50/50">
                                        <CreditCard className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900">Mensuel</div>
                                        <div className="text-sm text-gray-500">{stats.settings.price_monthly}€ / mois</div>
                                    </div>
                                </div>
                                <div className="text-2xl font-bold text-indigo-900">{stats.monthlyActive}</div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-purple-100 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 ring-4 ring-purple-50/50">
                                        <CreditCard className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900">Annuel</div>
                                        <div className="text-sm text-gray-500">{stats.settings.price_yearly}€ / an</div>
                                    </div>
                                </div>
                                <div className="text-2xl font-bold text-purple-900">{stats.yearlyActive}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Transactions */}
                <Card className="col-span-1 shadow-sm border bg-white/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Dernières Transactions</CardTitle>
                        <Button variant="ghost" size="sm" asChild className="text-amber-500 hover:text-indigo-700 hover:bg-indigo-50">
                            <Link href="/admin/transactions">
                                Voir tout <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {stats.recentPayments.length === 0 ? (
                                <div className="text-center py-10 bg-white rounded-xl border border-dashed text-gray-400">
                                    Aucune transaction récente
                                </div>
                            ) : (
                                stats.recentPayments.map(payment => (
                                    <div key={payment.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:border-indigo-100 hover:shadow-sm transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className={`h-10 w-10 number-mono rounded-full flex items-center justify-center text-xs font-bold ${payment.status === 'succeeded' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-500'}`}>
                                                {payment.currency.toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm text-gray-900">{payment.user.profile?.nomAgence || payment.user.email}</p>
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <span>{new Date(payment.createdAt).toLocaleDateString()}</span>
                                                    <span>•</span>
                                                    <span className="capitalize">{payment.plan === 'unlock_contact' ? 'Déblocage' : payment.plan}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900">
                                                +{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: payment.currency }).format(payment.amount)}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* --- COMPREHENSIVE INTELLIGENCE ACQUEREURS --- */}
            <div className="mt-12 space-y-8 border-t pt-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <PieChart className="h-8 w-8 text-amber-500" />
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Intelligence Globale Acquéreurs</h2>
                            <p className="text-gray-500 text-sm mt-1">Analyse détaillée de l'ensemble de la base de données ({stats.questionnaireStats.totalRecherches} recherches actives)</p>
                        </div>
                    </div>
                </div>

                {stats.questionnaireStats.totalRecherches === 0 ? (
                    <Card className="bg-white/50 backdrop-blur-sm border-dashed">
                        <CardContent className="py-12 text-center text-muted-foreground">
                            Aucune donnée de recherche encore disponible.
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">

                        {/* Row 1: Finances & Budget */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Budget summary block */}
                            <Card className="shadow-sm border border-amber-100 bg-amber-50/30">
                                <CardHeader className="pb-2">
                                    <CardTitle className="flex items-center gap-2 text-lg text-amber-700">
                                        <Euro className="h-5 w-5" /> Budgets
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-gray-900 mt-2">
                                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(stats.questionnaireStats.avgBudget)}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">Budget moyen maximum</p>
                                    <div className="mt-4 pt-4 border-t border-amber-100 space-y-3">
                                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Sources de Financement</h4>
                                        {stats.questionnaireStats.topFinancements.map(([fin, count]) => (
                                            <StatBar key={fin} label={fin} count={count} total={stats.questionnaireStats.totalRecherches} />
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-sm border bg-white/50 backdrop-blur-sm">
                                <CardHeader className="pb-2">
                                    <CardTitle className="flex items-center gap-2 text-md">
                                        <Banknote className="h-4 w-4 text-emerald-600" /> Salaires
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 mt-2">
                                    {stats.questionnaireStats.topSalaires.length > 0
                                        ? stats.questionnaireStats.topSalaires.map(([val, count]) => <StatBar key={val} label={val} count={count} total={stats.questionnaireStats.totalRecherches} />)
                                        : <p className="text-sm text-gray-400">Non renseigné</p>}
                                </CardContent>
                            </Card>

                            <Card className="shadow-sm border bg-white/50 backdrop-blur-sm">
                                <CardHeader className="pb-2">
                                    <CardTitle className="flex items-center gap-2 text-md">
                                        <Wallet className="h-4 w-4 text-purple-600" /> Apports Personnels
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 mt-2">
                                    {stats.questionnaireStats.topApports.length > 0
                                        ? stats.questionnaireStats.topApports.map(([val, count]) => <StatBar key={val} label={val} count={count} total={stats.questionnaireStats.totalRecherches} />)
                                        : <p className="text-sm text-gray-400">Non renseigné</p>}
                                </CardContent>
                            </Card>

                            <Card className="shadow-sm border bg-white/50 backdrop-blur-sm">
                                <CardHeader className="pb-2">
                                    <CardTitle className="flex items-center gap-2 text-md">
                                        <Building2 className="h-4 w-4 text-indigo-600" /> Patrimoine
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 mt-2">
                                    {stats.questionnaireStats.topPatrimoines.length > 0
                                        ? stats.questionnaireStats.topPatrimoines.map(([val, count]) => <StatBar key={val} label={val} count={count} total={stats.questionnaireStats.totalRecherches} />)
                                        : <p className="text-sm text-gray-400">Non renseigné</p>}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Row 2: Demographics, Localisations, Types */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                            {/* Démographie */}
                            <Card className="shadow-sm border bg-white/50 backdrop-blur-sm h-full">
                                <CardHeader className="pb-2">
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <Users className="h-5 w-5 text-blue-500" />
                                        Profils Démographiques
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6 mt-2">
                                    <div>
                                        <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                                            <Heart className="h-4 w-4 text-rose-500" /> Situation Familiale
                                        </h4>
                                        <div className="space-y-3">
                                            {stats.questionnaireStats.topSituationsFam.length > 0
                                                ? stats.questionnaireStats.topSituationsFam.map(([val, count]) => <StatBar key={val} label={val} count={count} total={stats.questionnaireStats.totalRecherches} />)
                                                : <p className="text-sm text-gray-400">Non renseigné</p>}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                                            <Briefcase className="h-4 w-4 text-blue-700" /> Profession
                                        </h4>
                                        <div className="space-y-3">
                                            {stats.questionnaireStats.topSituationsPro.length > 0
                                                ? stats.questionnaireStats.topSituationsPro.map(([val, count]) => <StatBar key={val} label={val} count={count} total={stats.questionnaireStats.totalRecherches} />)
                                                : <p className="text-sm text-gray-400">Non renseigné</p>}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Core Search Criteria */}
                            <Card className="shadow-sm border bg-white/50 backdrop-blur-sm h-full">
                                <CardHeader className="pb-2">
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <Home className="h-5 w-5 text-indigo-500" />
                                        Critères Phares
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6 mt-2">
                                    <div>
                                        <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                                            <Building2 className="h-4 w-4 text-gray-500" /> Types de Biens
                                        </h4>
                                        <div className="space-y-3">
                                            {stats.questionnaireStats.topTypesBien.map(([type, count]) => (
                                                <StatBar key={type} label={type} count={count} total={stats.questionnaireStats.totalRecherches} />
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                                            <MapPin className="h-4 w-4 text-emerald-500" /> Localisations
                                        </h4>
                                        <div className="space-y-3">
                                            {stats.questionnaireStats.topLocalisations.map(([loc, count]) => (
                                                <StatBar key={loc} label={loc} count={count} total={stats.questionnaireStats.totalRecherches} />
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Features & Urgency */}
                            <Card className="shadow-sm border bg-white/50 backdrop-blur-sm h-full">
                                <CardHeader className="pb-2">
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <HelpCircle className="h-5 w-5 text-slate-500" />
                                        Besoins Spécifiques
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6 mt-2">
                                    <div>
                                        <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                                            <Car className="h-4 w-4 text-gray-500" /> Prestations
                                        </h4>
                                        <div className="space-y-3">
                                            {stats.questionnaireStats.topFeatures
                                                .filter(([_, count]) => count > 0)
                                                .map(([feat, count]) => (
                                                    <StatBar key={feat} label={feat} count={count} total={stats.questionnaireStats.totalRecherches} />
                                                ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                                            <Clock className="h-4 w-4 text-orange-500" /> Urgence de la recherche
                                        </h4>
                                        <div className="space-y-3">
                                            {stats.questionnaireStats.topDelais.length > 0
                                                ? stats.questionnaireStats.topDelais.map(([val, count]) => <StatBar key={val} label={val} count={count} total={stats.questionnaireStats.totalRecherches} />)
                                                : <p className="text-sm text-gray-400">Non renseigné</p>}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
