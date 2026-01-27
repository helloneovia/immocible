import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        const currentUser = await getCurrentUser()
        if (!currentUser) {
            return NextResponse.json({ count: 0 }, { status: 401 })
        }

        const count = await prisma.message.count({
            where: {
                isRead: false,
                senderId: { not: currentUser.id },
                conversation: {
                    OR: [
                        { agencyId: currentUser.id },
                        { buyerId: currentUser.id }
                    ]
                }
            }
        })

        return NextResponse.json({ count })
    } catch (error) {
        console.error('Error fetching unread count:', error)
        return NextResponse.json({ count: 0 }, { status: 500 })
    }
}
