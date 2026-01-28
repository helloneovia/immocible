import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'

export async function GET() {
    try {
        const user = await getCurrentUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const fullUser = await prisma.user.findUnique({
            where: { id: user.id },
            include: { profile: true }
        })

        if (!fullUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

        return NextResponse.json({
            nom: fullUser.profile?.nom || '',
            prenom: fullUser.profile?.prenom || '',
            email: fullUser.email,
            telephone: fullUser.profile?.telephone || '',
            nomAgence: fullUser.profile?.nomAgence || '', // Only for agencies
            role: fullUser.role
        })
    } catch (error) {
        console.error('[Profile API] Error fetching profile:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function PUT(request: Request) {
    try {
        const user = await getCurrentUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const body = await request.json()
        const { nom, prenom, email, telephone, password, nomAgence } = body

        if (!email) {
            return NextResponse.json({ error: 'Email est requis' }, { status: 400 })
        }

        // Prepare User update (Email & Password)
        const userUpdateData: any = { email }
        if (password && password.length > 0) {
            if (password.length < 6) {
                return NextResponse.json({ error: 'Le mot de passe doit contenir au moins 6 caractères' }, { status: 400 })
            }
            userUpdateData.password = await hash(password, 10)
        }

        // Update User
        await prisma.user.update({
            where: { id: user.id },
            data: userUpdateData
        })

        // Prepare Profile update fields
        // Only update provided fields (or allow clearing?)
        // Usually full form submission implies complete state, but we handle nulls.
        const profileUpdateData = {
            nom,
            prenom,
            telephone,
            nomAgence: user.role === 'agence' ? nomAgence : undefined
        }

        // Update or Create Profile
        await prisma.profile.upsert({
            where: { userId: user.id },
            create: {
                userId: user.id,
                ...profileUpdateData
            },
            update: profileUpdateData
        })

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('[Profile API] Error updating profile:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
