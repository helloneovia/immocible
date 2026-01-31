
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/mail'

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        console.log("Checking for scheduled newsletters...")

        const dueNewsletters = await prisma.newsletter.findMany({
            where: {
                status: 'SCHEDULED',
                scheduledAt: { lte: new Date() }
            }
        })

        if (dueNewsletters.length === 0) {
            return NextResponse.json({ message: 'No newsletters to send' })
        }

        const results = []

        for (const newsletter of dueNewsletters) {
            console.log(`Processing newsletter: ${newsletter.subject}`)

            // Find recipients
            let whereCondition: any = {}
            if (newsletter.targetRole === 'ACQUEREUR') whereCondition = { role: 'acquereur' }
            else if (newsletter.targetRole === 'AGENCE') whereCondition = { role: 'agence' }
            else if (newsletter.targetRole === 'ALL') whereCondition = { role: { in: ['acquereur', 'agence'] } }

            const recipients = await prisma.user.findMany({
                where: {
                    ...whereCondition,
                    email: { not: undefined }
                },
                select: { email: true }
            })

            console.log(`Sending to ${recipients.length} recipients...`)

            let sentCount = 0
            for (const recipient of recipients) {
                try {
                    await sendEmail({
                        to: recipient.email,
                        subject: newsletter.subject,
                        html: newsletter.content,
                        text: newsletter.content.replace(/<[^>]*>?/gm, '')
                    })
                    sentCount++
                } catch (e) {
                    console.error(`Failed to send to ${recipient.email}`, e)
                }
            }

            const updated = await prisma.newsletter.update({
                where: { id: newsletter.id },
                data: {
                    status: 'SENT',
                    sentAt: new Date(),
                    sentCount
                }
            })
            results.push(updated)
        }

        return NextResponse.json({ success: true, processed: results.length, details: results })

    } catch (e) {
        console.error("Cron Error", e)
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
    }
}
