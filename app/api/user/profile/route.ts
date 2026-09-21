import { NextResponse } from 'next/server'
import { getCurrentUser, getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { AGENCY_NAME_MAX_LENGTH, cleanText, isValidEmail, isValidPhone, NAME_MAX_LENGTH, normalizeEmail, passwordProblem } from '@/lib/validation'
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
        const { password, currentPassword } = body
        const email = normalizeEmail(body.email)
        const nom = cleanText(body.nom, NAME_MAX_LENGTH)
        const prenom = cleanText(body.prenom, NAME_MAX_LENGTH)
        const telephone = cleanText(body.telephone, 30)
        const nomAgence = cleanText(body.nomAgence, AGENCY_NAME_MAX_LENGTH)

        if (telephone && !isValidPhone(telephone)) {
            return NextResponse.json({ error: t('api.validation.invalidPhone') }, { status: 400 })
        }
        if (user.role === 'agence' && !nomAgence) {
            return NextResponse.json({ error: t('api.validation.agencyNameRequired') }, { status: 400 })
        }

        if (!email) {
            return NextResponse.json({ error: t('api.profile.emailRequired') }, { status: 400 })
        }

        const emailChanged = email !== user.email.toLowerCase()
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
            if (!isValidEmail(email)) {
                return NextResponse.json({ error: t('api.profile.invalidEmail') }, { status: 400 })
            }
            const existing = await prisma.user.findFirst({ where: { email: { equals: email, mode: 'insensitive' }, NOT: { id: user.id } } })
            if (existing) {
                return NextResponse.json({ error: t('api.profile.emailInUse') }, { status: 409 })
            }
        }
        if (passwordChanged) {
            // Mêmes règles que l'inscription.
            const passwordIssue = passwordProblem(password)
            if (passwordIssue) {
                return NextResponse.json({ error: passwordIssue === 'tooLong' ? t('api.validation.passwordTooLong') : t('api.profile.passwordTooShort') }, { status: 400 })
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
