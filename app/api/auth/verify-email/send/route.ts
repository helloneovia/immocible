
import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { sendVerificationEmail } from '@/lib/mail'
import { enforceRateLimit } from '@/lib/rate-limit'
import { getT } from '@/lib/i18n/server'
import { isValidEmail, normalizeEmail } from '@/lib/validation'

// Code à 6 chiffres généré via un PRNG cryptographique (non prédictible).
function generateToken() {
    return crypto.randomInt(100000, 1000000).toString()
}

export async function POST(req: Request) {
    const t = getT()
    try {
        // Limite l'envoi d'OTP : 5 par 10 minutes et par IP.
        const limited = enforceRateLimit(req, 'otp-send', 5, 10 * 60_000)
        if (limited) return limited

        const body = await req.json()
        const email = normalizeEmail(body.email)

        if (!isValidEmail(email)) {
            return NextResponse.json({ error: t('api.auth.verifyEmail.invalidEmail') }, { status: 400 })
        }

        // Check if user already exists
        const existingUser = await prisma.user.findFirst({
            where: { email: { equals: email, mode: 'insensitive' } },
        })

        if (existingUser) {
            return NextResponse.json({ error: t('api.auth.verifyEmail.emailInUse') }, { status: 400 })
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
            if (process.env.NODE_ENV !== 'production') {
                // Fallback de développement uniquement (jamais en production).
                console.log(`[DEV MODE] Verification Code for ${email}: ${token}`)
            } else {
                // Le code n'est jamais arrivé : on le dit plutôt que de laisser attendre l'utilisateur.
                await prisma.verificationToken.deleteMany({ where: { identifier: email } })
                return NextResponse.json({ error: t('api.auth.verifyEmail.sendFailed') }, { status: 502 })
            }
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error sending verification email:', error)
        return NextResponse.json({ error: t('api.auth.verifyEmail.sendFailed') }, { status: 500 })
    }
}
