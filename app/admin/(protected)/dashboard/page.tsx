import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Building2, CreditCard, TrendingUp, ArrowRight, PieChart } from 'lucide-react'
import { getAppSettings } from '@/lib/settings'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

// Helper to fetch stats
async function getStats() {
    const totalUsers = await prisma.user.count({
        where: { role: { not: 'admin' } }
    })

    const acquereurs = await prisma.user.count({
        where: { role: 'acquereur' }
    })

    const agences = await prisma.user.count({
        where: { role: 'agence' }
    })

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
    const mrr = (monthlyActive * settings.price_monthly) + ((yearlyActive * settings.price_yearly) / 12)

    const unlockPayments = await prisma.payment.aggregate({
        where: { plan: 'unlock_contact' },
        _sum: { amount: true },
        _count: true
    })
    const unlockRevenue = unlockPayments._sum.amount || 0

    const recentPayments = await prisma.payment.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
            user: {
                include: { profile: true }
            }
        }
    })

    // Just count for the CTA card
    const totalRecherches = await prisma.recherche.count({
        where: { isActive: true }
    })

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
        questionnaireStats: { totalRecherches }
    }
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

            {/* --- LINK TO DEDICATED STATISTICS PAGE --- */}
            <div className="mt-10">
                <Link href="/admin/statistiques" className="block group">
                    <Card className="shadow-lg border-slate-200 rounded-2xl bg-gradient-to-r from-amber-50 via-white to-slate-50 overflow-hidden hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
                        <CardContent className="p-8 flex items-center justify-between">
                            <div className="flex items-center gap-5">
                                <div className="h-14 w-14 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform">
                                    <PieChart className="h-7 w-7" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 tracking-tight group-hover:text-amber-600 transition-colors">Intelligence Acquéreurs</h2>
                                    <p className="text-slate-500 font-medium text-sm mt-1">
                                        Analyse 360° avec graphiques • {stats.questionnaireStats.totalRecherches} recherches actives
                                    </p>
                                </div>
                            </div>
                            <ArrowRight className="h-6 w-6 text-slate-400 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    )
}
