
import { NextRequest, NextResponse } from 'next/server'
import { sendPasswordResetEmail } from '@/lib/mail'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json()

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
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
            { error: 'Failed to process request' },
            { status: 500 }
        )
    }
}
