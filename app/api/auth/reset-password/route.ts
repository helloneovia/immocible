import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { enforceRateLimit } from '@/lib/rate-limit'
import { getT } from '@/lib/i18n/server'

export async function POST(request: NextRequest) {
    const t = getT()
    try {
        const limited = enforceRateLimit(request, 'reset-password', 10, 15 * 60_000)
        if (limited) return limited

        const { token, password } = await request.json()

        if (!token || !password) {
            return NextResponse.json(
                { error: t('api.auth.resetPassword.tokenPasswordRequired') },
                { status: 400 }
            )
        }

        if (password.length < 8) {
            return NextResponse.json(
                { error: t('api.auth.resetPassword.passwordTooShort') },
                { status: 400 }
            )
        }

        // Find token
        const verificationToken = await prisma.verificationToken.findFirst({
            where: { token }
        })

        if (!verificationToken) {
            return NextResponse.json(
                { error: t('api.auth.resetPassword.invalidLink') },
                { status: 400 }
            )
        }

        // Check if expired
        if (verificationToken.expires < new Date()) {
            await prisma.verificationToken.delete({ 
                where: { identifier_token: { identifier: verificationToken.identifier, token: verificationToken.token } } 
            })
            return NextResponse.json(
                { error: t('api.auth.resetPassword.linkExpired') },
                { status: 400 }
            )
        }

        // Hash new password
        const hashedPassword = await hashPassword(password)

        // Update user
        const updatedUser = await prisma.user.update({
            where: { email: verificationToken.identifier },
            data: { password: hashedPassword }
        })

        // Invalide toutes les sessions existantes : un mot de passe changé doit
        // déconnecter les sessions actives (y compris une session volée).
        await prisma.session.deleteMany({
            where: { userId: updatedUser.id }
        })

        // Delete token
        await prisma.verificationToken.delete({
            where: { 
                identifier_token: { 
                    identifier: verificationToken.identifier, 
                    token: verificationToken.token 
                } 
            } 
        })

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Password reset error:', error)
        return NextResponse.json(
            { error: t('api.auth.resetPassword.failed') },
            { status: 500 }
        )
    }
}
