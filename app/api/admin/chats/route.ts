import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        const currentUser = await getCurrentUser()
        if (!currentUser || currentUser.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const conversations = await prisma.conversation.findMany({
            include: {
                agency: {
                    select: {
                        id: true,
                        email: true,
                        profile: {
                            select: {
                                nomAgence: true,
                                prenom: true,
                                nom: true
                            }
                        }
                    }
                },
                buyer: {
                    select: {
                        id: true,
                        email: true,
                        profile: {
                            select: {
                                prenom: true,
                                nom: true
                            }
                        }
                    }
                },
                messages: {
                    take: 1,
                    orderBy: { createdAt: 'desc' }
                }
            },
            orderBy: { updatedAt: 'desc' },
            take: 50
        })

        return NextResponse.json(conversations)
    } catch (e) {
        console.error("Error fetching conversations:", e)
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
    }
}
