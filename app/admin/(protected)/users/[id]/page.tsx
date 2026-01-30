
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { UserEditForm } from './UserEditForm'
import { ArrowLeft } from 'lucide-react'

export default async function AdminUserDetailPage({ params }: { params: { id: string } }) {
    const user = await prisma.user.findUnique({
        where: { id: params.id },
        include: {
            profile: true,
            sessions: true,
            payments: {
                orderBy: { createdAt: 'desc' },
                take: 10
            }
        }
    })

    if (!user) {
        notFound()
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/users">
                    <Button variant="ghost" size="sm" className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Retour
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">Détail Utilisateur</h1>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Modification Utilisateur</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <UserEditForm user={user} />
                    </CardContent>
                </Card>

                {/* Recent Payments Details */}
                <Card className="border shadow-sm bg-white rounded-xl overflow-hidden">
                    <CardHeader className="border-b bg-gray-50/50 pb-4">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            </div>
                            <CardTitle className="text-lg font-semibold text-gray-900">Historique des Paiements</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {user.payments.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50/80 text-gray-500 font-medium border-b">
                                        <tr>
                                            <th className="py-3 px-4">Date</th>
                                            <th className="py-3 px-4">Montant</th>
                                            <th className="py-3 px-4">Plan / Type</th>
                                            <th className="py-3 px-4">Statut</th>
                                            <th className="py-3 px-4 text-right">ID Session</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {user.payments.map(p => (
                                            <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="py-3 px-4 text-gray-600">
                                                    {format(new Date(p.createdAt), 'dd MMM yyyy HH:mm', { locale: fr })}
                                                </td>
                                                <td className="py-3 px-4 font-semibold text-gray-900">
                                                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: p.currency }).format(p.amount)}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 capitalize">
                                                        {p.plan}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${p.status === 'succeeded' ? 'bg-green-50 text-green-700 ring-1 ring-green-600/20' :
                                                            'bg-gray-100 text-gray-700 ring-1 ring-gray-600/20'
                                                        }`}>
                                                        <span className={`h-1.5 w-1.5 rounded-full ${p.status === 'succeeded' ? 'bg-green-600' : 'bg-gray-500'}`}></span>
                                                        {p.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <span className="font-mono text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">
                                                        {p.stripeSessionId ? p.stripeSessionId.slice(0, 12) + '...' : '-'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center text-gray-500 py-12 flex flex-col items-center">
                                <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                </div>
                                <p>Aucun paiement trouvé pour cet utilisateur</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
