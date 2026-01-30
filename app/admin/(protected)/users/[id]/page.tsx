
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
                <Card>
                    <CardHeader>
                        <CardTitle>Historique Paiements (10 derniers)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {user.Payment.length > 0 ? (
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="py-2 px-3">Date</th>
                                        <th className="py-2 px-3">Montant</th>
                                        <th className="py-2 px-3">Plan/Type</th>
                                        <th className="py-2 px-3">Statut</th>
                                        <th className="py-2 px-3">ID Session</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {user.Payment.map(p => (
                                        <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                                            <td className="py-2 px-3">{format(new Date(p.createdAt), 'dd/MM/yyyy HH:mm')}</td>
                                            <td className="py-2 px-3 font-medium">{p.amount} {p.currency}</td>
                                            <td className="py-2 px-3">{p.plan}</td>
                                            <td className="py-2 px-3">
                                                <span className={`px-2 py-0.5 rounded-full text-xs ${p.status === 'succeeded' ? 'bg-green-100 text-green-700' : 'bg-gray-200'}`}>
                                                    {p.status}
                                                </span>
                                            </td>
                                            <td className="py-2 px-3 font-mono text-xs text-gray-400">{p.stripeSessionId}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="text-center text-gray-500 py-4">Aucun paiement trouvé</div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
