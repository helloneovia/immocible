import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
    try {
        const { token, password } = await request.json()

        if (!token || !password) {
            return NextResponse.json(
                { error: 'Token et mot de passe requis' },
                { status: 400 }
            )
        }

        // Find token
        const verificationToken = await prisma.verificationToken.findFirst({
            where: { token }
        })

        if (!verificationToken) {
            return NextResponse.json(
                { error: 'Lien invalide ou expiré' },
                { status: 400 }
            )
        }

        // Check if expired
        if (verificationToken.expires < new Date()) {
            await prisma.verificationToken.delete({ 
                where: { identifier_token: { identifier: verificationToken.identifier, token: verificationToken.token } } 
            })
            return NextResponse.json(
                { error: 'Lien expiré' },
                { status: 400 }
            )
        }

        // Hash new password
        const hashedPassword = await hashPassword(password)

        // Update user
        await prisma.user.update({
            where: { email: verificationToken.identifier },
            data: { password: hashedPassword }
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
            { error: 'Erreur lors de la réinitialisation' },
            { status: 500 }
        )
    }
}
