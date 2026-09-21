
import { NextRequest, NextResponse } from 'next/server'
import { sendPasswordResetEmail } from '@/lib/mail'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { enforceRateLimit } from '@/lib/rate-limit'
import { getT } from '@/lib/i18n/server'
import { isValidEmail, normalizeEmail } from '@/lib/validation'

export async function POST(request: NextRequest) {
    const t = getT()
    try {
        const limited = enforceRateLimit(request, 'forgot-password', 5, 15 * 60_000)
        if (limited) return limited

        const body = await request.json()
        const email = normalizeEmail(body.email)

        if (!email) {
            return NextResponse.json(
                { error: t('api.auth.forgotPassword.emailRequired') },
                { status: 400 }
            )
        }
        if (!isValidEmail(email)) {
            return NextResponse.json({ error: t('api.validation.invalidEmail') }, { status: 400 })
        }

        // Find user
        const user = await prisma.user.findFirst({
            where: { email: { equals: email, mode: 'insensitive' } }
        })

        if (!user) {
            // Don't reveal that user doesn't exist
            return NextResponse.json({ success: true })
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex')
        const expires = new Date(Date.now() + 3600 * 1000)

        await prisma.verificationToken.deleteMany({
            where: { identifier: user.email }
        })

        await prisma.verificationToken.create({
            data: {
                identifier: user.email,
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
