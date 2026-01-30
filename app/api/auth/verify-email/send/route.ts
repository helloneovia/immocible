
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendVerificationEmail } from '@/lib/mail'

// Helper to generate 6-digit numeric token
function generateToken() {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const email = body.email?.trim().toLowerCase()

        console.log(`[Verify Email] Sending OTP to: ${email}`)

        if (!email) {
            return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            return NextResponse.json({ error: 'Cet email est déjà utilisé.' }, { status: 400 })
        }

        const token = generateToken()
        const expires = new Date(new Date().getTime() + 15 * 60 * 1000) // 15 minutes

        // Delete existing tokens for this email
        await prisma.verificationToken.deleteMany({
            where: { identifier: email }
        })

        // Create new token
        await prisma.verificationToken.create({
            data: {
                identifier: email,
                token,
                expires,
            }
        })

        // Send email
        const sent = await sendVerificationEmail(email, token)

        if (!sent) {
            // Fallback for dev environment without SMTP
            console.log(`[DEV MODE] Verification Code for ${email}: ${token}`)
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error sending verification email:', error)
        return NextResponse.json({ error: 'Erreur lors de l\'envoi du code.' }, { status: 500 })
    }
}
