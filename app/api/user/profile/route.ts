import { NextResponse } from 'next/server'
import { getCurrentUser, getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { validateEmail } from '@/lib/mail'
import { compare, hash } from 'bcryptjs'
import { getT } from '@/lib/i18n/server'

export async function GET() {
    const t = getT()
    try {
        const user = await getCurrentUser()
        if (!user) return NextResponse.json({ error: t('api.common.unauthorized') }, { status: 401 })

        const fullUser = await prisma.user.findUnique({
            where: { id: user.id },
            include: { profile: true }
        })

        if (!fullUser) return NextResponse.json({ error: t('api.profile.userNotFound') }, { status: 404 })

        return NextResponse.json({
            nom: fullUser.profile?.nom || '',
            prenom: fullUser.profile?.prenom || '',
            email: fullUser.email,
            telephone: fullUser.profile?.telephone || '',
            nomAgence: fullUser.profile?.nomAgence || '', // Only for agencies
            role: fullUser.role,
            plan: fullUser.profile?.plan,
            subscriptionEndDate: fullUser.profile?.subscriptionEndDate,
            subscriptionStartDate: fullUser.profile?.subscriptionStartDate
        })
    } catch (error) {
        console.error('[Profile API] Error fetching profile:', error)
        return NextResponse.json({ error: t('api.common.serverError') }, { status: 500 })
    }
}

export async function PUT(request: Request) {
    const t = getT()
    try {
        const session = await getSession()
        if (!session) return NextResponse.json({ error: t('api.common.unauthorized') }, { status: 401 })
        const user = session.user

        const body = await request.json()
        const { nom, prenom, telephone, password, nomAgence, currentPassword } = body
        const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''

        if (!email) {
            return NextResponse.json({ error: t('api.profile.emailRequired') }, { status: 400 })
        }

        const emailChanged = email !== user.email
        const passwordChanged = typeof password === 'string' && password.length > 0

        // Changer l'e-mail ou le mot de passe exige le mot de passe actuel :
        // une session volée ne doit pas suffire à s'approprier le compte.
        if (emailChanged || passwordChanged) {
            const valid = typeof currentPassword === 'string' && currentPassword.length > 0
                && await compare(currentPassword, user.password)
            if (!valid) {
                return NextResponse.json({ error: t('api.profile.wrongCurrentPassword') }, { status: 403 })
            }
        }

        // Prepare User update (Email & Password)
        const userUpdateData: any = { email }
        if (emailChanged) {
            if (!validateEmail(email)) {
                return NextResponse.json({ error: t('api.profile.invalidEmail') }, { status: 400 })
            }
            const existing = await prisma.user.findUnique({ where: { email } })
            if (existing) {
                return NextResponse.json({ error: t('api.profile.emailInUse') }, { status: 409 })
            }
        }
        if (passwordChanged) {
            // Même minimum que l'inscription.
            if (password.length < 8) {
                return NextResponse.json({ error: t('api.profile.passwordTooShort') }, { status: 400 })
            }
            userUpdateData.password = await hash(password, 10)
        }

        // Update User
        await prisma.user.update({
            where: { id: user.id },
            data: userUpdateData
        })

        // Nouveau mot de passe : les autres sessions ouvertes sont fermées.
        if (passwordChanged) {
            await prisma.session.deleteMany({ where: { userId: user.id, id: { not: session.id } } })
        }

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
        return NextResponse.json({ error: t('api.common.serverError') }, { status: 500 })
    }
}
