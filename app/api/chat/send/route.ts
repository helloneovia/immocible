import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
    try {
        const currentUser = await getCurrentUser()
        if (!currentUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { conversationId, content } = await request.json()

        if (!conversationId || !content) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
        }

        // Verify participant
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
        })

        if (!conversation) {
            return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
        }

        if (conversation.agencyId !== currentUser.id && conversation.buyerId !== currentUser.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const message = await prisma.message.create({
            data: {
                conversationId,
                senderId: currentUser.id,
                content,
            },
        })

        // Update conversation updated_at
        await prisma.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() },
        })

        return NextResponse.json({ message })
    } catch (error) {
        console.error('Send message error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
