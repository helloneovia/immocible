import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { sanitizeContent } from '@/lib/utils'
import { sendNewMessageNotification } from '@/lib/mail'
import { hasActiveSubscription } from '@/lib/subscription'
import { getT } from '@/lib/i18n/server'

export async function POST(request: NextRequest) {
    const t = getT()
    try {
        const currentUser = await getCurrentUser()
        if (!currentUser) {
            return NextResponse.json({ error: t('api.common.unauthorized') }, { status: 401 })
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
            return NextResponse.json({ error: t('api.chat.conversationNotFound') }, { status: 404 })
        }

        if (conversation.agencyId !== currentUser.id && conversation.buyerId !== currentUser.id) {
            return NextResponse.json({ error: t('api.common.unauthorized') }, { status: 403 })
        }

        // Check subscription for agency
        // Statut et échéance : un abonnement remboursé (CANCELLED) ne permet plus d'écrire.
        if (currentUser.role === 'agence' && !hasActiveSubscription(currentUser.profile)) {
            return NextResponse.json({ error: t('api.chat.subscriptionInactive'), subscriptionRequired: true }, { status: 403 })
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
                content: filteredContent,
            },
        })

        // Update conversation updated_at
        await prisma.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() },
        })

        // Send email notification to recipient
        const recipientId = currentUser.id === conversation.agencyId ? conversation.buyerId : conversation.agencyId

        // Fetch recipient email
        const recipient = await prisma.user.findUnique({
            where: { id: recipientId },
            include: { profile: true }
        })

        const recipientRole = recipient?.role === 'admin' ? 'admin' : currentUser.id === conversation.agencyId ? 'acquereur' : 'agence'

        if (recipient?.email) {
            const senderName = currentUser.profile?.nomAgence || currentUser.profile?.prenom || 'Un utilisateur'
            const recipientName = recipient.profile?.nomAgence || recipient.profile?.prenom || undefined

            try {
                await sendNewMessageNotification(
                    recipient.email,
                    senderName,
                    filteredContent,
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
        return NextResponse.json({ error: t('api.common.serverError') }, { status: 500 })
    }
}
