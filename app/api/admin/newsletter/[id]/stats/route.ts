import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'
import Mailjet from 'node-mailjet'

const mailjet = new Mailjet({
    apiKey: process.env.MAILJET_API_KEY || '',
    apiSecret: process.env.MAILJET_SECRET_KEY || ''
})

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const user = await getCurrentUser()
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const newsletter = await prisma.newsletter.findUnique({ where: { id: params.id } })
        if (!newsletter) return NextResponse.json({ error: 'Not found' }, { status: 404 })

        if (newsletter.status !== 'SENT') {
            return NextResponse.json({ stats: null, message: "Campaign not sent yet" })
        }

        const customCampaignName = `Immocible_NL_${newsletter.id}`
        
        // Fetch all messages for this CustomCampaign
        const messageReq = await mailjet.get('message', { version: 'v3' }).request({
            CustomCampaign: customCampaignName,
            ShowSubject: true,
            ShowContactAlt: true
        })

        const messages = (messageReq.body as any).Data || []
        
        if (messages.length === 0) {
            return NextResponse.json({ stats: null, message: "No Mailjet data found yet. Please wait a few minutes." })
        }

        let deliveredCount = 0
        let openedCount = 0
        let clickedCount = 0
        let bouncedCount = 0
        let spamCount = 0

        for (const msg of messages) {
            const status = msg.Status
            if (status === 'sent') deliveredCount++
            else if (status === 'opened') { deliveredCount++; openedCount++ }
            else if (status === 'clicked') { deliveredCount++; openedCount++; clickedCount++ }
            else if (status === 'bounced') bouncedCount++
            else if (status === 'spam') spamCount++
        }
        
        const stats = {
            totalSent: messages.length,
            deliveredCount,
            openedCount,
            clickedCount,
            bouncedCount,
            spamCount,
        }

        return NextResponse.json({ stats })
    } catch (error: any) {
        console.error("Error fetching Mailjet stats:", error.statusCode || error)
        return NextResponse.json({ error: "Internal Error fetching stats", details: error.message }, { status: 500 })
    }
}
