import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { sanitizeContent } from '@/lib/utils'
import { sendNewMessageNotification } from '@/lib/mail'

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

        // Check subscription for agency
        if (currentUser.role === 'agence') {
            const endDate = currentUser.profile?.subscriptionEndDate
            if (!endDate || new Date(endDate) < new Date()) {
                return NextResponse.json({ error: 'Abonnement expiré ou inactif.' }, { status: 403 })
            }
        }

        const sanitizedContent = sanitizeContent(content)

        // Filter Sensitive Words
        let filteredContent = sanitizedContent
        try {
            const setting = await prisma.systemSetting.findUnique({ where: { key: 'chat_sensitive_words' } })
            if (setting && setting.value) {
                const words = JSON.parse(setting.value) as string[]
                if (Array.isArray(words)) {
                    words.forEach(word => {
                        if (word && word.trim()) {
                            const escapedWord = word.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
                            const regex = new RegExp(escapedWord, 'gi')
                            filteredContent = filteredContent.replace(regex, '*'.repeat(word.trim().length))
                        }
                    })
                }
            }
        } catch (e) {
            console.error("Error filtering content:", e)
        }

        const message = await prisma.message.create({
            data: {
                conversationId,
                senderId: currentUser.id,
                content: sanitizedContent,
            },
        })

        // Update conversation updated_at
        await prisma.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() },
        })

        // Send email notification to recipient
        const recipientId = currentUser.id === conversation.agencyId ? conversation.buyerId : conversation.agencyId
        const recipientRole = currentUser.id === conversation.agencyId ? 'acquereur' : 'agence'

        // Fetch recipient email
        const recipient = await prisma.user.findUnique({
            where: { id: recipientId },
            include: { profile: true }
        })

        if (recipient?.email) {
            const senderName = currentUser.profile?.nomAgence || currentUser.profile?.prenom || 'Un utilisateur'
            const recipientName = recipient.profile?.nomAgence || recipient.profile?.prenom || undefined

            try {
                await sendNewMessageNotification(
                    recipient.email,
                    senderName,
                    sanitizedContent,
                    conversationId,
                    recipientRole,
                    recipientName
                )
            } catch (emailError) {
                console.error('Failed to send message notification:', emailError)
            }
        }

        return NextResponse.json({ message })
    } catch (error) {
        console.error('Send message error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
