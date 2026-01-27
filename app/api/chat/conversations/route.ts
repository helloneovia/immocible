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

        // Sanitize data: Hide buyer contact info if user is an agency
        const sanitizedConversations = conversations.map(conv => {
            if (currentUser.role === 'agence') {
                if (conv.buyer) {
                    // Create a shallow copy of buyer object (or modify it if mutable, but copy is safer)
                    // Note: Prisma objects are plain objects here
                    const { email, profile, ...buyerRest } = conv.buyer

                    let sanitizedProfile = profile
                    if (profile) {
                        const { telephone, ...profileRest } = profile as any
                        sanitizedProfile = profileRest
                    }

                    return {
                        ...conv,
                        buyer: {
                            ...buyerRest,
                            // email: undefined/removed
                            profile: sanitizedProfile
                        }
                    }
                }
            }
            return conv
        })

        return NextResponse.json({ conversations: sanitizedConversations })
    } catch (error) {
        console.error('Get conversations error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
