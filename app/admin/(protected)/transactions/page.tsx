import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'

import { PaginationControls } from '@/components/ui/pagination-controls'

export default async function TransactionsPage({
    searchParams
}: {
    searchParams: { [key: string]: string | string[] | undefined }
}) {
    const page = Number(searchParams?.page ?? '1')
    const limit = 10
    const skip = (page - 1) * limit

    const [transactions, totalCount] = await Promise.all([
        prisma.payment.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    include: { profile: true }
                }
            },
            skip,
            take: limit
        }),
        prisma.payment.count()
    ])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">Historique des Transactions</h1>
                <div className="bg-white px-4 py-2 rounded-lg border text-sm text-gray-500">
                    Total: {totalCount}
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Agence / Utilisateur</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Montant</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Reference</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                        Aucune transaction trouvée
                                    </TableCell>
                                </TableRow>
                            ) : (
                                transactions.map(tx => (
                                    <TableRow key={tx.id}>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{new Date(tx.createdAt).toLocaleDateString()}</span>
                                                <span className="text-xs text-gray-500">{new Date(tx.createdAt).toLocaleTimeString()}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">
                                                    {tx.user.profile?.nomAgence || tx.user.profile?.nom || 'Agence Inconnue'}
                                                </span>
                                                <span className="text-xs text-gray-500">{tx.user.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={tx.plan === 'unlock_contact' ? 'border-orange-200 bg-orange-50 text-orange-700' : 'border-blue-200 bg-blue-50 text-blue-700'}>
                                                {tx.plan === 'unlock_contact' ? 'Déblocage Contact' : tx.plan || 'Abonnement'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-bold">
                                            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: tx.currency }).format(tx.amount)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={
                                                tx.status === 'succeeded' || tx.status === 'paid' ? 'bg-green-100 text-green-800 hover:bg-green-100' :
                                                    tx.status === 'pending' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' : 'bg-red-100 text-red-800 hover:bg-red-100'
                                            }>
                                                {tx.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-xs font-mono text-gray-500">
                                            {tx.stripePaymentIntentId || tx.stripeSessionId || '-'}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    <PaginationControls totalCount={totalCount} pageSize={limit} />
                </CardContent>
            </Card>
        </div>
    )
}
