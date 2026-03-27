import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

export async function POST(req: Request) {
    try {
        const currentUser = await getCurrentUser()
        if (!currentUser || currentUser.role !== 'admin') {
            return new NextResponse('Unauthorized', { status: 403 })
        }

        const body = await req.json()
        const { action, userIds } = body as { action: string; userIds: string[] }

        if (!Array.isArray(userIds) || userIds.length === 0) {
            return NextResponse.json({ error: 'No users selected' }, { status: 400 })
        }

        if (action === 'delete') {
            await prisma.$transaction(async (tx) => {
                // Filter out admins
                const usersToDelete = await tx.user.findMany({
                    where: { id: { in: userIds }, role: { not: 'admin' } },
                    select: { id: true }
                })
                const ids = usersToDelete.map(u => u.id)

                if (ids.length === 0) return

                await tx.unlockedProfile.deleteMany({
                    where: { OR: [{ agencyId: { in: ids } }, { buyerId: { in: ids } }] }
                })
                await tx.message.deleteMany({
                    where: { senderId: { in: ids } }
                })
                await tx.user.deleteMany({ where: { id: { in: ids } } })
            })

            return NextResponse.json({ success: true, action: 'delete' })
        }

        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    } catch (error) {
        console.error('[Admin Bulk Action]', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
