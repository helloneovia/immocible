
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Building2, CreditCard, TrendingUp, ArrowRight, UserCheck } from 'lucide-react'
import { getAppSettings } from '@/lib/settings'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

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

    return {
        totalUsers,
        acquereurs,
        agences,
        monthlyActive,
        yearlyActive,
        mrr,
        unlockRevenue,
        recentPayments,
        settings
    }
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
                            <CardTitle className="text-sm font-medium text-gray-600 group-hover:text-indigo-600 transition-colors">Utilisateurs Total</CardTitle>
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
                        <Button variant="ghost" size="sm" asChild className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                            <Link href="/admin/subscriptions">
                                Voir détails <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-indigo-100 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 ring-4 ring-indigo-50/50">
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
                        <Button variant="ghost" size="sm" asChild className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
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
        </div>
    )
}
