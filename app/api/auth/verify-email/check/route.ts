
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
    try {
        const { email, code } = await req.json()

        if (!email || !code) {
            return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
        }

        const verificationToken = await prisma.verificationToken.findFirst({
            where: {
                identifier: email,
                token: code,
                expires: { gt: new Date() }
            }
        })

        if (!verificationToken) {
            return NextResponse.json({ error: 'Code invalide ou expiré' }, { status: 400 })
        }

        // Usually we would delete the token here, but we might want to keep it until registration is complete
        // Or we can delete it now and trust the client state?
        // Better to delete it on successful registration.
        // But then anyone can use it.
        // Let's delete it now and return a signed temporary token?
        // Or just trust the client flow for now since we are in a single session flow.

        // Deleting the token prevents replay attacks immediately.
        await prisma.verificationToken.delete({
            where: { identifier_token: { identifier: email, token: code } }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error verifying email:', error)
        return NextResponse.json({ error: 'Erreur lors de la vérification.' }, { status: 500 })
    }
}
