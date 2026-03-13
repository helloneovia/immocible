import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'
import Mailjet from 'node-mailjet'

const mailjet = new Mailjet({
    apiKey: process.env.MAILJET_API_KEY || '',
    apiSecret: process.env.MAILJET_SECRET_KEY || ''
})

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

        const dbEmails = recipients.map(r => r.email)
        const additionalEmails = newsletter.additionalEmails || []
        
        // Remove duplicates
        const allEmails = Array.from(new Set([...dbEmails, ...additionalEmails]))

        if (allEmails.length === 0) {
            return NextResponse.json({ error: 'No recipients found' }, { status: 400 })
        }

        console.log(`Sending newsletter to ${allEmails.length} users...`)

        // Construct simple text copy
        const textContent = newsletter.content.replace(/<[^>]*>?/gm, '')
        const senderEmail = process.env.MAILJET_SENDER_EMAIL || "contact@immocible.com"

        const messages = allEmails.map(email => ({
            From: {
                Email: senderEmail,
                Name: "Immocible"
            },
            To: [
                {
                    Email: email
                }
            ],
            Subject: newsletter.subject,
            TextPart: textContent,
            HTMLPart: newsletter.content,
            CustomCampaign: `Immocible_NL_${newsletter.id}`
        }))

        // Mailjet v3.1 Send allows max 50 Messages per request
        let sentCount = 0
        const chunkSize = 50

        for (let i = 0; i < messages.length; i += chunkSize) {
            const chunk = messages.slice(i, i + chunkSize)
            try {
                await mailjet.post("send", { version: "v3.1" }).request({
                    Messages: chunk
                })
                sentCount += chunk.length
            } catch (e: any) {
                console.error(`Failed to send chunk ${i/chunkSize}`, e.statusCode || e)
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

        return NextResponse.json({ success: true, sentCount, totalFailed: allEmails.length - sentCount })
    } catch (error) {
        console.error("Error sending newsletter:", error)
        return NextResponse.json({ error: "Internal Error" }, { status: 500 })
    }
}
