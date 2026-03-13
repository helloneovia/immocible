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
        
        // 1. Fetch Campaign ID by CustomCampaign name
        const campaignReq = await mailjet.get('campaign', { version: 'v3' }).request({
            CustomCampaign: customCampaignName
        })
        
        const campaigns = (campaignReq.body as any).Data || []
        if (campaigns.length === 0) {
            return NextResponse.json({ stats: null, message: "No Mailjet campaign found for this newsletter" })
        }
        
        // Take the latest if there are multiple (e.g. sent in chunks might create same or multiple)
        // Usually CustomCampaign groups them into one campaign ID
        const campaignId = campaigns[0].ID

        // 2. Fetch Stats
        const statsReq = await mailjet.get(`statcounters/campaign`, { version: 'v3' }).id(campaignId).request()
        
        const statsData = (statsReq.body as any).Data || []
        if (statsData.length === 0) {
            return NextResponse.json({ stats: null, message: "No stats available yet" })
        }

        const rawStats = statsData[0]
        
        const stats = {
            totalSent: rawStats.TotalMessageCount || 0,
            deliveredCount: rawStats.MessageSentCount || 0,
            openedCount: rawStats.MessageOpenedCount || 0,
            clickedCount: rawStats.MessageClickedCount || 0,
            bouncedCount: rawStats.MessageHardBouncedCount || 0,
            spamCount: rawStats.MessageSpamCount || 0,
        }

        return NextResponse.json({ stats })
    } catch (error: any) {
        console.error("Error fetching Mailjet stats:", error.statusCode || error)
        return NextResponse.json({ error: "Internal Error fetching stats", details: error.message }, { status: 500 })
    }
}
