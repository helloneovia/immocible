
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { RefundButton } from './refund-button'

export default async function AdminSubscriptionsPage() {
    const payments = await prisma.payment.findMany({
        include: {
            user: {
                include: { profile: true }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">Abonnements & Paiements</h1>
                <div className="bg-white px-4 py-2 rounded-lg border text-sm text-gray-500">
                    Total: {payments.length}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Utilisateur</TableHead>
                            <TableHead>Montant</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {payments.map((payment) => (
                            <TableRow key={payment.id}>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-gray-900">
                                            {payment.user.profile?.nomAgence || payment.user.email}
                                        </span>
                                        <span className="text-sm text-gray-500">{payment.user.email}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="font-medium">
                                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: payment.currency }).format(payment.amount)}
                                </TableCell>
                                <TableCell>
                                    <span className="capitalize text-sm text-gray-700">{payment.plan || 'Standard'}</span>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        className={
                                            payment.status === 'paid' || payment.status === 'succeeded' ? 'bg-green-100 text-green-700 hover:bg-green-100' :
                                                payment.status === 'refunded' ? 'bg-orange-100 text-orange-700 hover:bg-orange-100' :
                                                    'bg-gray-100 text-gray-700 hover:bg-gray-100'
                                        }
                                    >
                                        {payment.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-gray-500 text-sm">
                                    {format(new Date(payment.createdAt), 'dd MMM yyyy HH:mm', { locale: fr })}
                                </TableCell>
                                <TableCell className="text-right">
                                    {payment.status !== 'refunded' && (
                                        <RefundButton paymentId={payment.id} />
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                        {payments.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                    Aucun paiement enregistré
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
