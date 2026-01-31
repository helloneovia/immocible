import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const currentUser = await getCurrentUser()
        if (!currentUser || currentUser.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const messages = await prisma.message.findMany({
            where: { conversationId: params.id },
            include: {
                sender: {
                    select: {
                        id: true,
                        role: true,
                        profile: {
                            select: {
                                prenom: true,
                                nom: true,
                                nomAgence: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'asc' }
        })

        return NextResponse.json(messages)
    } catch (e) {
        console.error("Error fetching messages:", e)
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
    }
}
