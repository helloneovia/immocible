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
                <span className="font-medium text-slate-700 truncate pr-2" title={cleanLabel}>{cleanLabel}</span>
                <span className="text-slate-500 shrink-0 font-mono">{percentage}% ({count})</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
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
        <div className="space-y-8 font-sans">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>

            {/* Overview Cards with Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Link href="/admin/users?role=all" className="block group">
                    <Card className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-slate-800 h-full rounded-2xl overflow-hidden group-hover:-translate-y-1 bg-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500 group-hover:text-amber-500 transition-colors">Utilisateurs Total</CardTitle>
                            <div className="h-8 w-8 bg-slate-50 rounded-full flex items-center justify-center group-hover:bg-amber-50 transition-colors">
                                <Users className="h-4 w-4 text-slate-400 group-hover:text-amber-500 transition-colors" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-slate-900 tracking-tight">{stats.totalUsers}</div>
                            <p className="text-xs text-slate-500 mt-1 font-medium">{stats.acquereurs} Acquéreurs, {stats.agences} Agences</p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/admin/subscriptions" className="block group">
                    <Card className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-amber-500 h-full rounded-2xl overflow-hidden group-hover:-translate-y-1 bg-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500 group-hover:text-amber-600 transition-colors">Abonnements Actifs</CardTitle>
                            <div className="h-8 w-8 bg-amber-50 rounded-full flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                                <Building2 className="h-4 w-4 text-amber-500 group-hover:text-amber-600 transition-colors" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-slate-900 tracking-tight">{stats.monthlyActive + stats.yearlyActive}</div>
                            <p className="text-xs text-slate-500 mt-1 font-medium">Agences souscrites</p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/admin/transactions" className="block group">
                    <Card className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-emerald-500 h-full rounded-2xl overflow-hidden group-hover:-translate-y-1 bg-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500 group-hover:text-emerald-600 transition-colors">MRR (Revenu Récurrent)</CardTitle>
                            <div className="h-8 w-8 bg-emerald-50 rounded-full flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                                <TrendingUp className="h-4 w-4 text-emerald-500 group-hover:text-emerald-600 transition-colors" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-slate-900 tracking-tight">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(stats.mrr)}</div>
                            <p className="text-xs text-slate-500 mt-1 font-medium">Estimé mensuel</p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/admin/transactions?type=unlock" className="block group">
                    <Card className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500 h-full rounded-2xl overflow-hidden group-hover:-translate-y-1 bg-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500 group-hover:text-blue-600 transition-colors">Revenu Déblocages</CardTitle>
                            <div className="h-8 w-8 bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                <CreditCard className="h-4 w-4 text-blue-500 group-hover:text-blue-600 transition-colors" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-slate-900 tracking-tight">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(stats.unlockRevenue)}</div>
                            <p className="text-xs text-slate-500 mt-1 font-medium">Total à vie</p>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Subscription Breakdown */}
                <Card className="col-span-1 shadow-lg border-slate-200 rounded-2xl bg-white overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 bg-slate-50/50 pb-4">
                        <CardTitle className="text-lg font-semibold text-slate-800 tracking-tight">Répartition des Abonnements</CardTitle>
                        <Button variant="ghost" size="sm" asChild className="text-amber-500 hover:text-amber-600 hover:bg-amber-50/50">
                            <Link href="/admin/subscriptions">
                                Voir détails <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:border-slate-300 transition-all">
                                <div className="flex items-center gap-5">
                                    <div className="h-14 w-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-md">
                                        <CreditCard className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900 text-lg">Mensuel</div>
                                        <div className="text-sm text-slate-500 font-medium">{stats.settings.price_monthly}€ / mois</div>
                                    </div>
                                </div>
                                <div className="text-3xl font-bold text-slate-900 tracking-tight">{stats.monthlyActive}</div>
                            </div>

                            <div className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:border-slate-300 transition-all">
                                <div className="flex items-center gap-5">
                                    <div className="h-14 w-14 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-md">
                                        <CreditCard className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900 text-lg">Annuel</div>
                                        <div className="text-sm text-slate-500 font-medium">{stats.settings.price_yearly}€ / an</div>
                                    </div>
                                </div>
                                <div className="text-3xl font-bold text-slate-900 tracking-tight">{stats.yearlyActive}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Transactions */}
                <Card className="col-span-1 shadow-lg border-slate-200 rounded-2xl bg-white overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 bg-slate-50/50 pb-4">
                        <CardTitle className="text-lg font-semibold text-slate-800 tracking-tight">Dernières Transactions</CardTitle>
                        <Button variant="ghost" size="sm" asChild className="text-amber-500 hover:text-amber-600 hover:bg-amber-50/50">
                            <Link href="/admin/transactions">
                                Voir tout <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-100">
                            {stats.recentPayments.length === 0 ? (
                                <div className="text-center py-10 bg-white text-slate-400">
                                    Aucune transaction récente
                                </div>
                            ) : (
                                stats.recentPayments.map(payment => (
                                    <div key={payment.id} className="flex items-center justify-between p-5 bg-white hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-bold tracking-tight shadow-sm ${payment.status === 'succeeded' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                                {payment.currency.toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-slate-900">{payment.user.profile?.nomAgence || payment.user.email}</p>
                                                <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mt-1">
                                                    <span>{new Date(payment.createdAt).toLocaleDateString()}</span>
                                                    <span className="h-1 w-1 bg-slate-300 rounded-full"></span>
                                                    <span className="capitalize">{payment.plan === 'unlock_contact' ? 'Déblocage' : payment.plan}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-slate-900 text-lg">
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
            <div className="mt-16 space-y-8 border-t border-slate-200 pt-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 bg-amber-50 rounded-2xl flex items-center justify-center border border-amber-100/50 shadow-sm">
                            <PieChart className="h-7 w-7 text-amber-500" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Intelligence Globale Acquéreurs</h2>
                            <p className="text-slate-500 font-medium text-sm mt-1">Analyse détaillée de l'ensemble de la base de données ({stats.questionnaireStats.totalRecherches} recherches actives)</p>
                        </div>
                    </div>
                </div>

                {stats.questionnaireStats.totalRecherches === 0 ? (
                    <Card className="bg-white/50 backdrop-blur-sm border-dashed border-2 rounded-2xl">
                        <CardContent className="py-16 text-center text-slate-500 font-medium">
                            Aucune donnée de recherche encore disponible.
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-8">

                        {/* Row 1: Finances & Budget */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Budget summary block */}
                            <Card className="shadow-lg border-amber-200 bg-amber-50/50 rounded-2xl overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-4 opacity-5">
                                    <Euro className="h-24 w-24 text-amber-900" />
                                </div>
                                <CardHeader className="pb-2 relative z-10">
                                    <CardTitle className="flex items-center gap-2 text-lg text-amber-800 tracking-tight font-bold">
                                        <Euro className="h-5 w-5" /> Budgets
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="relative z-10">
                                    <div className="text-4xl font-bold text-slate-900 mt-2 tracking-tight">
                                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(stats.questionnaireStats.avgBudget)}
                                    </div>
                                    <p className="text-sm font-medium text-amber-700/80 mt-1">Budget moyen maximum</p>
                                    <div className="mt-6 pt-5 border-t border-amber-200/50 space-y-4">
                                        <h4 className="text-xs font-bold text-amber-800 uppercase tracking-widest mb-3">Sources de Financement</h4>
                                        {stats.questionnaireStats.topFinancements.map(([fin, count]) => (
                                            <StatBar key={fin} label={fin} count={count} total={stats.questionnaireStats.totalRecherches} />
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-md border-slate-200 bg-white rounded-2xl">
                                <CardHeader className="pb-2">
                                    <CardTitle className="flex items-center gap-2 text-md font-bold text-slate-800">
                                        <Banknote className="h-5 w-5 text-slate-400" /> Salaires
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 mt-2">
                                    {stats.questionnaireStats.topSalaires.length > 0
                                        ? stats.questionnaireStats.topSalaires.map(([val, count]) => <StatBar key={val} label={val} count={count} total={stats.questionnaireStats.totalRecherches} />)
                                        : <p className="text-sm font-medium text-slate-400">Non renseigné</p>}
                                </CardContent>
                            </Card>

                            <Card className="shadow-md border-slate-200 bg-white rounded-2xl">
                                <CardHeader className="pb-2">
                                    <CardTitle className="flex items-center gap-2 text-md font-bold text-slate-800">
                                        <Wallet className="h-5 w-5 text-slate-400" /> Apports Personnels
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 mt-2">
                                    {stats.questionnaireStats.topApports.length > 0
                                        ? stats.questionnaireStats.topApports.map(([val, count]) => <StatBar key={val} label={val} count={count} total={stats.questionnaireStats.totalRecherches} />)
                                        : <p className="text-sm font-medium text-slate-400">Non renseigné</p>}
                                </CardContent>
                            </Card>

                            <Card className="shadow-md border-slate-200 bg-white rounded-2xl">
                                <CardHeader className="pb-2">
                                    <CardTitle className="flex items-center gap-2 text-md font-bold text-slate-800">
                                        <Building2 className="h-5 w-5 text-slate-400" /> Patrimoine
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 mt-2">
                                    {stats.questionnaireStats.topPatrimoines.length > 0
                                        ? stats.questionnaireStats.topPatrimoines.map(([val, count]) => <StatBar key={val} label={val} count={count} total={stats.questionnaireStats.totalRecherches} />)
                                        : <p className="text-sm font-medium text-slate-400">Non renseigné</p>}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Row 2: Demographics, Localisations, Types */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                            {/* Démographie */}
                            <Card className="shadow-md border-slate-200 bg-white rounded-2xl h-full">
                                <CardHeader className="pb-2">
                                    <CardTitle className="flex items-center gap-3 text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">
                                        <span className="p-2 bg-slate-50 rounded-lg"><Users className="h-5 w-5 text-slate-600" /></span>
                                        Profils Démographiques
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-8 mt-2 pt-2">
                                    <div>
                                        <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 tracking-tight mb-4">
                                            <Heart className="h-4 w-4 text-amber-500" /> Situation Familiale
                                        </h4>
                                        <div className="space-y-4">
                                            {stats.questionnaireStats.topSituationsFam.length > 0
                                                ? stats.questionnaireStats.topSituationsFam.map(([val, count]) => <StatBar key={val} label={val} count={count} total={stats.questionnaireStats.totalRecherches} />)
                                                : <p className="text-sm font-medium text-slate-400">Non renseigné</p>}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 tracking-tight mb-4">
                                            <Briefcase className="h-4 w-4 text-slate-500" /> Profession
                                        </h4>
                                        <div className="space-y-4">
                                            {stats.questionnaireStats.topSituationsPro.length > 0
                                                ? stats.questionnaireStats.topSituationsPro.map(([val, count]) => <StatBar key={val} label={val} count={count} total={stats.questionnaireStats.totalRecherches} />)
                                                : <p className="text-sm font-medium text-slate-400">Non renseigné</p>}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Core Search Criteria */}
                            <Card className="shadow-md border-slate-200 bg-white rounded-2xl h-full">
                                <CardHeader className="pb-2">
                                    <CardTitle className="flex items-center gap-3 text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">
                                        <span className="p-2 bg-slate-50 rounded-lg"><Home className="h-5 w-5 text-slate-600" /></span>
                                        Critères Phares
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-8 mt-2 pt-2">
                                    <div>
                                        <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 tracking-tight mb-4">
                                            <Building2 className="h-4 w-4 text-amber-500" /> Types de Biens
                                        </h4>
                                        <div className="space-y-4">
                                            {stats.questionnaireStats.topTypesBien.map(([type, count]) => (
                                                <StatBar key={type} label={type} count={count} total={stats.questionnaireStats.totalRecherches} />
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 tracking-tight mb-4">
                                            <MapPin className="h-4 w-4 text-slate-500" /> Localisations
                                        </h4>
                                        <div className="space-y-4">
                                            {stats.questionnaireStats.topLocalisations.map(([loc, count]) => (
                                                <StatBar key={loc} label={loc} count={count} total={stats.questionnaireStats.totalRecherches} />
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Features & Urgency */}
                            <Card className="shadow-md border-slate-200 bg-white rounded-2xl h-full">
                                <CardHeader className="pb-2">
                                    <CardTitle className="flex items-center gap-3 text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">
                                        <span className="p-2 bg-slate-50 rounded-lg"><HelpCircle className="h-5 w-5 text-slate-600" /></span>
                                        Besoins Spécifiques
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-8 mt-2 pt-2">
                                    <div>
                                        <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 tracking-tight mb-4">
                                            <Car className="h-4 w-4 text-amber-500" /> Prestations
                                        </h4>
                                        <div className="space-y-4">
                                            {stats.questionnaireStats.topFeatures
                                                .filter(([_, count]) => count > 0)
                                                .map(([feat, count]) => (
                                                    <StatBar key={feat} label={feat} count={count} total={stats.questionnaireStats.totalRecherches} />
                                                ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 tracking-tight mb-4">
                                            <Clock className="h-4 w-4 text-slate-500" /> Urgence de la recherche
                                        </h4>
                                        <div className="space-y-4">
                                            {stats.questionnaireStats.topDelais.length > 0
                                                ? stats.questionnaireStats.topDelais.map(([val, count]) => <StatBar key={val} label={val} count={count} total={stats.questionnaireStats.totalRecherches} />)
                                                : <p className="text-sm font-medium text-slate-400">Non renseigné</p>}
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
