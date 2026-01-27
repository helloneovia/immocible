import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        const currentUser = await getCurrentUser()
        if (!currentUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const conversationId = searchParams.get('conversationId')

        if (!conversationId) {
            return NextResponse.json({ error: 'Conversation ID required' }, { status: 400 })
        }

        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
        })

        if (!conversation || (conversation.agencyId !== currentUser.id && conversation.buyerId !== currentUser.id)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const messages = await prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'asc' },
        })

        return NextResponse.json({ messages })
    } catch (error) {
        console.error('Get messages error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
