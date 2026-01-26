
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

export default async function AdminUsersPage() {
    const users = await prisma.user.findMany({
        where: {
            role: { not: 'admin' }
        },
        include: {
            profile: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">Utilisateurs</h1>
                <div className="bg-white px-4 py-2 rounded-lg border text-sm text-gray-500">
                    Total: {users.length}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Utilisateur</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Statut Abonn.</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Date d'inscription</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-gray-900">
                                            {user.role === 'agence' ? user.profile?.nomAgence : `${user.profile?.prenom || ''} ${user.profile?.nom || ''}`}
                                        </span>
                                        <span className="text-sm text-gray-500">{user.email}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={user.role === 'agence' ? 'default' : 'secondary'} className={user.role === 'agence' ? 'bg-purple-100 text-purple-700 hover:bg-purple-100' : 'bg-blue-100 text-blue-700 hover:bg-blue-100'}>
                                        {user.role === 'agence' ? 'Agence' : 'Acquéreur'}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {user.role === 'agence' ? (
                                        <Badge
                                            className={
                                                user.profile?.subscriptionStatus === 'ACTIVE' ? 'bg-green-100 text-green-700 hover:bg-green-100' :
                                                    user.profile?.subscriptionStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' :
                                                        'bg-gray-100 text-gray-700 hover:bg-gray-100'
                                            }
                                        >
                                            {user.profile?.subscriptionStatus || 'N/A'}
                                        </Badge>
                                    ) : (
                                        <span className="text-gray-400 text-sm">-</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {user.profile?.plan ? (
                                        <span className="capitalize text-sm font-medium text-gray-700">{user.profile.plan}</span>
                                    ) : (
                                        <span className="text-gray-400 text-sm">-</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-gray-500 text-sm">
                                    {format(new Date(user.createdAt), 'dd MMM yyyy', { locale: fr })}
                                </TableCell>
                                <TableCell className="text-right">
                                    <button className="text-indigo-600 hover:underline text-sm font-medium">Gérer</button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
