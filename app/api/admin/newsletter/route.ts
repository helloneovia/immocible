
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

export async function GET() {
    try {
        const user = await getCurrentUser()
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const newsletters = await prisma.newsletter.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(newsletters)
    } catch (error) {
        console.error("Error fetching newsletters:", error)
        return NextResponse.json({ error: "Internal Error" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser()
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { subject, content, targetRole, scheduledAt, additionalEmails } = body

        if (!subject || !content) {
            return NextResponse.json({ error: "Subject and content are required" }, { status: 400 })
        }

        const status = scheduledAt ? 'SCHEDULED' : 'DRAFT'
        
        let additionalEmailsArray: string[] = []
        if (additionalEmails) {
            additionalEmailsArray = additionalEmails.split(',').map((e: string) => e.trim()).filter((e: string) => e !== '')
        }

        const newsletter = await prisma.newsletter.create({
            data: {
                subject,
                content,
                targetRole: targetRole || 'ALL',
                status: status as any,
                additionalEmails: additionalEmailsArray,
                scheduledAt: scheduledAt ? new Date(scheduledAt) : null
            }
        })

        return NextResponse.json(newsletter)
    } catch (error) {
        console.error("Error creating newsletter:", error)
        return NextResponse.json({ error: "Internal Error" }, { status: 500 })
    }
}
