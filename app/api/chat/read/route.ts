import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
    try {
        const currentUser = await getCurrentUser()
        if (!currentUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { conversationId } = await request.json()

        if (!conversationId) {
            return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 })
        }

        // Mark all messages in this conversation sent by OTHER user as read
        await prisma.message.updateMany({
            where: {
                conversationId,
                senderId: { not: currentUser.id },
                isRead: false
            },
            data: {
                isRead: true
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error marking messages as read:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
