import { NextRequest, NextResponse } from 'next/server'
import { createUser } from '@/lib/auth'
import { createSession } from '@/lib/session'
import { UserRole } from '@prisma/client'
import { sendWelcomeEmail } from '@/lib/mail'
import { prisma } from '@/lib/prisma'
import { getAppSettings, localizeSettings } from '@/lib/settings'
import { getLocale, getT } from '@/lib/i18n/server'
import {
  AGENCY_NAME_MAX_LENGTH,
  cleanText,
  isValidEmail,
  isValidPhone,
  NAME_MAX_LENGTH,
  normalizeEmail,
  passwordProblem,
  verifiedEmailIdentifier,
} from '@/lib/validation'

export async function POST(request: NextRequest) {
  const t = getT()
  try {
    const body = await request.json()
    const email = normalizeEmail(body.email)
    const { password, role } = body
    const nomAgence = cleanText(body.nomAgence, AGENCY_NAME_MAX_LENGTH)
    const firstName = cleanText(body.firstName, NAME_MAX_LENGTH)
    const lastName = cleanText(body.lastName, NAME_MAX_LENGTH)
    const telephone = cleanText(body.telephone, 30)
    const plan = body.plan === 'monthly' || body.plan === 'yearly' ? body.plan : undefined

    // Validation (le site et l'application font les mêmes contrôles ; celui-ci fait foi)
    if (!email || !password || !role) {
      return NextResponse.json(
        { error: t('api.auth.register.requiredFields') },
        { status: 400 }
      )
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: t('api.validation.invalidEmail') }, { status: 400 })
    }

    const passwordIssue = passwordProblem(password)
    if (passwordIssue) {
      return NextResponse.json(
        { error: passwordIssue === 'tooLong' ? t('api.validation.passwordTooLong') : t('api.auth.register.passwordTooShort') },
        { status: 400 }
      )
    }

    if (!['acquereur', 'agence'].includes(role)) {
      return NextResponse.json(
        { error: t('api.auth.register.invalidRole') },
        { status: 400 }
      )
    }

    if (role === 'agence' && !nomAgence) {
      return NextResponse.json({ error: t('api.validation.agencyNameRequired') }, { status: 400 })
    }

    if (role === 'agence' && body.plan !== undefined && body.plan !== null && !plan) {
      return NextResponse.json({ error: t('api.validation.invalidPlan') }, { status: 400 })
    }

    if (telephone && !isValidPhone(telephone)) {
      return NextResponse.json({ error: t('api.validation.invalidPhone') }, { status: 400 })
    }

    // L'adresse doit avoir été vérifiée par code (/api/auth/verify-email/check) dans les 30 dernières minutes.
    const verified = await prisma.verificationToken.findFirst({
      where: { identifier: verifiedEmailIdentifier(email), expires: { gt: new Date() } },
    })
    if (!verified) {
      return NextResponse.json({ error: t('api.validation.emailNotVerified') }, { status: 400 })
    }

    // Create user
    const user = await createUser(
      email,
      password,
      role as UserRole,
      role === 'agence' ? nomAgence ?? undefined : undefined,
      role === 'agence' ? plan : undefined,
      firstName ?? undefined,
      lastName ?? undefined,
      telephone ?? undefined
    )

    // Preuve de vérification consommée : elle ne sert qu'une fois.
    await prisma.verificationToken.deleteMany({ where: { identifier: verifiedEmailIdentifier(email) } }).catch(() => {})

    // Send welcome email
    try {
      await sendWelcomeEmail(email, role, role === 'agence' ? nomAgence ?? undefined : undefined)
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError)
      // Continue execution, don't fail registration
    }

    // Create session
    await createSession(user.id)

    // Message de bienvenue automatique d'IMMOCIBLE (compte administrateur de la plateforme).
    // Il n'est pas envoyé au nom d'une agence : aucune agence n'obtient ainsi de conversation
    // avec tous les acquéreurs. Texte modifiable dans l'admin (text_buyer_welcome_message).
    if (role === 'acquereur') {
      try {
        const platformUser = await prisma.user.findFirst({
          where: { role: 'admin' },
          orderBy: { createdAt: 'asc' },
        })

        if (platformUser) {
          const settings = localizeSettings(await getAppSettings(), getLocale())
          const conversation = await prisma.conversation.upsert({
            where: { agencyId_buyerId: { agencyId: platformUser.id, buyerId: user.id } },
            update: {},
            create: { agencyId: platformUser.id, buyerId: user.id },
          })

          await prisma.message.create({
            data: {
              conversationId: conversation.id,
              senderId: platformUser.id,
              content: settings.text_buyer_welcome_message,
              isRead: false,
            },
          })
        }
      } catch (welcomeMsgError) {
        console.error('Failed to send IMMOCIBLE welcome message:', welcomeMsgError)
        // Ne fait pas échouer l'inscription
      }
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(
      { user: userWithoutPassword },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: error.message || t('api.auth.register.failed') },
      { status: 400 }
    )
  }
}
