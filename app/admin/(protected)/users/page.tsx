
import { prisma } from '@/lib/prisma'
import { PaginationControls } from '@/components/ui/pagination-controls'
import { UsersTableClient } from './UsersTableClient'

export default async function AdminUsersPage({
    searchParams
}: {
    searchParams: { [key: string]: string | string[] | undefined }
}) {
    const page = Number(searchParams?.page ?? '1')
    const limit = 10
    const skip = (page - 1) * limit

    const [users, totalCount] = await Promise.all([
        prisma.user.findMany({
            where: {
                role: { not: 'admin' }
            },
            include: {
                profile: true
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip,
            take: limit
        }),
        prisma.user.count({
            where: { role: { not: 'admin' } }
        })
    ])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">Utilisateurs</h1>
                <div className="bg-white px-4 py-2 rounded-lg border text-sm text-gray-500">
                    Total: {totalCount}
                </div>
            </div>

            <UsersTableClient users={users} />

            <PaginationControls totalCount={totalCount} pageSize={limit} />
        </div>
    )
}
