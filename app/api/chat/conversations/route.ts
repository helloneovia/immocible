import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        const currentUser = await getCurrentUser()
        if (!currentUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const conversations = await prisma.conversation.findMany({
            where: {
                OR: [
                    { agencyId: currentUser.id },
                    { buyerId: currentUser.id },
                ],
            },
            include: {
                agency: {
                    select: { id: true, email: true, profile: true },
                },
                buyer: {
                    select: { id: true, email: true, profile: true },
                },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                },
            },
            orderBy: { updatedAt: 'desc' },
        })

        return NextResponse.json({ conversations })
    } catch (error) {
        console.error('Get conversations error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
