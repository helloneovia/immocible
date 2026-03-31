import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { UAParser } from 'ua-parser-js'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { path, referrer, sessionId, role, userId } = body

        // Extract headers
        const userAgentRaw = request.headers.get('user-agent') || ''
        const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
        const country = request.headers.get('x-vercel-ip-country') || 'Unknown'

        // Parse UA
        const parser = new UAParser(userAgentRaw)
        const browser = parser.getBrowser().name || 'Unknown'
        const os = parser.getOS().name || 'Unknown'
        const deviceType = parser.getDevice().type || 'desktop' // desktop is undefined by default in ua-parser, let's map it

        // Hash IP for privacy
        const ipHash = crypto.createHash('sha256').update(ip).digest('hex').substring(0, 16)

        // Find or structure data
        await prisma.visitorLog.create({
            data: {
                sessionId: sessionId || null,
                userId: userId || null,
                role: role || 'visitor',
                path: path || '/',
                referrer: referrer || null,
                userAgent: userAgentRaw,
                device: deviceType,
                browser: browser,
                os: os,
                country: country,
                ipHash: ipHash,
            }
        })

        return NextResponse.json({ success: true })
    } catch (e) {
        console.error('Tracking Error:', e)
        return NextResponse.json({ success: false }, { status: 500 })
    }
}
