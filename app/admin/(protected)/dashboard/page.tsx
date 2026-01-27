
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Building2, UserCircle, CreditCard, TrendingUp } from 'lucide-react'

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
    // Monthly: 29€, Yearly: 290€
    // Logic: Count active users by plan
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

    // Calculate MRR (Monthly Recurring Revenue)
    const mrr = (monthlyActive * 29) + ((yearlyActive * 290) / 12)

    // Unlock Revenue
    const unlockPayments = await prisma.payment.aggregate({
        where: { plan: 'unlock_contact' },
        _sum: { amount: true },
        _count: true
    })

    const unlockRevenue = unlockPayments._sum.amount || 0
    const totalRevenue = mrr + unlockRevenue // Approximation (MRR is monthly, unlock is total... maybe separate them)

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
        unlockNotionalRevenue: unlockPayments._sum.amount || 0, // Total lifetime
        recentPayments
    }
}

export default async function AdminDashboard() {
    const stats = await getStats()

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Utilisateurs Total</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalUsers}</div>
                        <p className="text-xs text-muted-foreground">Acquéreurs + Agences</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Agences</CardTitle>
                        <Building2 className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.agences}</div>
                        <p className="text-xs text-muted-foreground">{stats.monthlyActive + stats.yearlyActive} abonnements actifs</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">MRR (Abonnements)</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(stats.mrr)}</div>
                        <p className="text-xs text-muted-foreground">Revenu Récurrent Mensuel</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Déblocages (Total)</CardTitle>
                        <CreditCard className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(stats.unlockRevenue)}</div>
                        <p className="text-xs text-muted-foreground">Achats ponctuels de contacts</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Subscription Breakdown */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Répartition des Abonnements</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                                        <CreditCard className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="font-semibold">Mensuel (29€/mois)</div>
                                        <div className="text-sm text-gray-500">Agences actives</div>
                                    </div>
                                </div>
                                <div className="text-xl font-bold">{stats.monthlyActive}</div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                                        <CreditCard className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="font-semibold">Annuel (290€/an)</div>
                                        <div className="text-sm text-gray-500">Agences actives</div>
                                    </div>
                                </div>
                                <div className="text-xl font-bold">{stats.yearlyActive}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Transactions */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Dernières Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats.recentPayments.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-4">Aucune transaction récente</p>
                            ) : (
                                stats.recentPayments.map(payment => (
                                    <div key={payment.id} className="flex items-center justify-between p-3 border-b last:border-0">
                                        <div>
                                            <p className="font-medium text-sm">{payment.user.profile?.nomAgence || payment.user.email}</p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(payment.createdAt).toLocaleDateString()} -
                                                {payment.plan === 'unlock_contact' ? ' Déblocage Contact' : ' Abonnement'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-sm">
                                                +{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: payment.currency }).format(payment.amount)}
                                            </p>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${payment.status === 'succeeded' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {payment.status}
                                            </span>
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
