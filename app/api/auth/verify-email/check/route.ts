
import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { enforceRateLimit } from '@/lib/rate-limit'
import { getT } from '@/lib/i18n/server'
import { isValidEmail, isVerificationCode, normalizeEmail, verifiedEmailIdentifier } from '@/lib/validation'

export async function POST(req: Request) {
    const t = getT()
    try {
        // Empêche le brute-force du code à 6 chiffres : 10 essais / 10 min / IP.
        const limited = enforceRateLimit(req, 'otp-check', 10, 10 * 60_000)
        if (limited) return limited

        const body = await req.json()
        const email = normalizeEmail(body.email)
        const code = typeof body.code === 'string' ? body.code.trim() : ''

        if (!isValidEmail(email)) {
            return NextResponse.json({ error: t('api.validation.invalidEmail') }, { status: 400 })
        }
        if (!isVerificationCode(code)) {
            return NextResponse.json({ error: t('api.validation.invalidCode') }, { status: 400 })
        }

        const verificationToken = await prisma.verificationToken.findFirst({
            where: {
                identifier: email,
                token: code,
                expires: { gt: new Date() }
            }
        })

        if (!verificationToken) {
            return NextResponse.json({ error: t('api.auth.verifyEmail.invalidCode') }, { status: 400 })
        }

        // Le code est consommé (pas de rejeu) ; l'inscription exigera la preuve de vérification.
        await prisma.verificationToken.delete({
            where: { identifier_token: { identifier: email, token: code } }
        })

        // Preuve côté serveur que cette adresse a été vérifiée, valable 30 minutes :
        // /api/auth/register la consomme (la vérification ne repose plus sur le client).
        const marker = verifiedEmailIdentifier(email)
        await prisma.verificationToken.deleteMany({ where: { identifier: marker } })
        await prisma.verificationToken.create({
            data: { identifier: marker, token: crypto.randomBytes(24).toString('hex'), expires: new Date(Date.now() + 30 * 60 * 1000) },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error verifying email:', error)
        return NextResponse.json({ error: t('api.auth.verifyEmail.checkFailed') }, { status: 500 })
    }
}
