
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'
import { sendEmail } from '@/lib/mail'

export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const user = await getCurrentUser()
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const newsletter = await prisma.newsletter.findUnique({ where: { id: params.id } })
        if (!newsletter) return NextResponse.json({ error: 'Not found' }, { status: 404 })

        if (newsletter.status === 'SENT') {
            return NextResponse.json({ error: 'Already sent' }, { status: 400 })
        }

        // Fetch targets
        let whereCondition: any = {}
        if (newsletter.targetRole === 'ACQUEREUR') whereCondition = { role: 'acquereur' }
        else if (newsletter.targetRole === 'AGENCE') whereCondition = { role: 'agence' }
        else if (newsletter.targetRole === 'ALL') whereCondition = { role: { in: ['acquereur', 'agence'] } } // Exclude admins

        const recipients = await prisma.user.findMany({
            where: {
                ...whereCondition,
                email: { not: undefined }
            },
            select: { email: true }
        })

        console.log(`Sending newsletter to ${recipients.length} users...`)

        // Send logic
        let sentCount = 0
        for (const recipient of recipients) {
            try {
                // Wrap in try/catch to continue if one fails
                const success = await sendEmail({
                    to: recipient.email,
                    subject: newsletter.subject,
                    html: newsletter.content,
                    text: newsletter.content.replace(/<[^>]*>?/gm, '') // simple strip tags for text version
                })
                if (success) sentCount++
            } catch (e) {
                console.error(`Failed to send to ${recipient.email}`, e)
            }
        }

        // Update status
        await prisma.newsletter.update({
            where: { id: params.id },
            data: {
                status: 'SENT',
                sentAt: new Date(),
                sentCount
            }
        })

        return NextResponse.json({ success: true, sentCount })
    } catch (error) {
        console.error("Error sending newsletter:", error)
        return NextResponse.json({ error: "Internal Error" }, { status: 500 })
    }
}
