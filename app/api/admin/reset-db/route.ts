import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

export async function POST(request: Request) {
    try {
        const currentUser = await getCurrentUser()
        if (!currentUser || currentUser.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { tables } = body

        if (!tables || !Array.isArray(tables)) {
            return NextResponse.json({ error: 'Invalid selection' }, { status: 400 })
        }

        // Logic to clear tables in correct order to avoid FK constraints

        // 1. Messages (Dependent on User and Conversation)
        // If we delete Users or Conversations, we must delete Messages first (unless cascade handles it, 
        // but User->Message usually doesn't cascade on senderId in some schemas, better safe)
        if (tables.includes('conversation') || tables.includes('user')) {
            await prisma.message.deleteMany({})
        }

        // 2. Conversations (Dependent on User)
        if (tables.includes('conversation') || tables.includes('user')) {
            await prisma.conversation.deleteMany({})
        }

        // 3. Relations (Match, Favorite, UnlockedProfile, Payment)
        if (tables.includes('match') || tables.includes('user')) {
            await prisma.match.deleteMany({})
        }

        if (tables.includes('match') || tables.includes('favorite') || tables.includes('user')) {
            // 'match' checkbox in UI covers 'Matchs & Favoris'
            await prisma.favorite.deleteMany({})
        }

        if (tables.includes('unlockedProfile') || tables.includes('user')) {
            await prisma.unlockedProfile.deleteMany({})
        }

        if (tables.includes('payment') || tables.includes('user')) {
            await prisma.payment.deleteMany({})
        }

        // 4. Content (Bien, Recherche)
        if (tables.includes('recherche') || tables.includes('user')) {
            await prisma.recherche.deleteMany({})
        }

        if (tables.includes('bien') || tables.includes('user')) {
            await prisma.bien.deleteMany({})
        }

        // 5. Standalone / Others
        if (tables.includes('coupon')) {
            await prisma.coupon.deleteMany({})
        }

        if (tables.includes('verificationToken')) {
            await prisma.verificationToken.deleteMany({})
        }

        // 6. Users (Last)
        if (tables.includes('user')) {
            await prisma.user.deleteMany({
                where: {
                    role: {
                        not: 'admin'
                    }
                }
            })
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Reset DB Error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to reset database' },
            { status: 500 }
        )
    }
}
