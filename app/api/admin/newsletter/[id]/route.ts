import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const user = await getCurrentUser()
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const newsletter = await prisma.newsletter.findUnique({
            where: { id: params.id }
        })

        if (!newsletter) {
            return NextResponse.json({ error: 'Newsletter not found' }, { status: 404 })
        }

        if (newsletter.status === 'SENT') {
            return NextResponse.json({ error: 'Cannot delete a sent newsletter' }, { status: 400 })
        }

        await prisma.newsletter.delete({
            where: { id: params.id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error deleting newsletter:", error)
        return NextResponse.json({ error: "Internal Error" }, { status: 500 })
    }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
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

        const newsletter = await prisma.newsletter.findUnique({
            where: { id: params.id }
        })

        if (!newsletter) {
            return NextResponse.json({ error: 'Newsletter not found' }, { status: 404 })
        }

        if (newsletter.status === 'SENT') {
            return NextResponse.json({ error: 'Cannot edit a sent newsletter' }, { status: 400 })
        }

        const status = scheduledAt ? 'SCHEDULED' : 'DRAFT'
        
        let additionalEmailsArray: string[] = []
        if (additionalEmails) {
            additionalEmailsArray = typeof additionalEmails === 'string' 
                ? additionalEmails.split(',').map((e: string) => e.trim()).filter((e: string) => e !== '')
                : additionalEmails
        }

        const updatedNewsletter = await prisma.newsletter.update({
            where: { id: params.id },
            data: {
                subject,
                content,
                targetRole: targetRole || 'ALL',
                status: status as any,
                additionalEmails: additionalEmailsArray,
                scheduledAt: scheduledAt ? new Date(scheduledAt) : null
            }
        })

        return NextResponse.json(updatedNewsletter)
    } catch (error) {
        console.error("Error updating newsletter:", error)
        return NextResponse.json({ error: "Internal Error" }, { status: 500 })
    }
}
