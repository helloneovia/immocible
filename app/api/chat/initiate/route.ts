import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
    try {
        const currentUser = await getCurrentUser()
        if (!currentUser || currentUser.role !== 'agence') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { buyerId } = await request.json()

        if (!buyerId) {
            return NextResponse.json({ error: 'Buyer ID required' }, { status: 400 })
        }

        // 1. Check if conversation already exists
        const existingConversation = await prisma.conversation.findUnique({
            where: {
                agencyId_buyerId: {
                    agencyId: currentUser.id,
                    buyerId: buyerId
                }
            }
        })

        if (existingConversation) {
            return NextResponse.json({ conversationId: existingConversation.id, status: 'existing' })
        }

        // 2. new conversation -> Check limits
        // Fetch agency profile/plan
        const agencyProfile = await prisma.profile.findUnique({
            where: { userId: currentUser.id }
        })

        const plan = agencyProfile?.plan || 'monthly' // Default to monthly if not set? Or restrictive?

        if (plan !== 'yearly') {
            // Check monthly usage
            const startOfMonth = new Date()
            startOfMonth.setDate(1)
            startOfMonth.setHours(0, 0, 0, 0)

            const activeContactsCount = await prisma.conversation.count({
                where: {
                    agencyId: currentUser.id,
                    createdAt: {
                        gte: startOfMonth
                    }
                }
            })

            const LIMIT = 100

            if (activeContactsCount >= LIMIT) {
                return NextResponse.json({
                    error: 'Monthly contact limit reached. Upgrade to annual plan for unlimited chats.',
                    limitReached: true
                }, { status: 403 })
            }
        }

        // 3. Create Conversation
        const conversation = await prisma.conversation.create({
            data: {
                agencyId: currentUser.id,
                buyerId: buyerId
            }
        })

        return NextResponse.json({ conversationId: conversation.id, status: 'created' })

    } catch (error) {
        console.error('[Chat Initiate] Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
