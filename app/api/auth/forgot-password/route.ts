
import { NextRequest, NextResponse } from 'next/server'
import { sendPasswordResetEmail } from '@/lib/mail'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { enforceRateLimit } from '@/lib/rate-limit'
import { getT } from '@/lib/i18n/server'

export async function POST(request: NextRequest) {
    const t = getT()
    try {
        const limited = enforceRateLimit(request, 'forgot-password', 5, 15 * 60_000)
        if (limited) return limited

        const { email } = await request.json()

        if (!email) {
            return NextResponse.json(
                { error: t('api.auth.forgotPassword.emailRequired') },
                { status: 400 }
            )
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user) {
            // Don't reveal that user doesn't exist
            return NextResponse.json({ success: true })
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex')
        const expires = new Date(Date.now() + 3600 * 1000)

        await prisma.verificationToken.deleteMany({
            where: { identifier: email }
        })

        await prisma.verificationToken.create({
            data: {
                identifier: email,
                token: resetToken,
                expires
            }
        })

        await sendPasswordResetEmail(email, resetToken)

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Password reset error:', error)
        return NextResponse.json(
            { error: t('api.auth.forgotPassword.failed') },
            { status: 500 }
        )
    }
}
