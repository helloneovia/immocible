import { NextRequest, NextResponse } from 'next/server'
import { createUser } from '@/lib/auth'
import { createSession } from '@/lib/session'
import { UserRole } from '@prisma/client'
import { sendWelcomeEmail } from '@/lib/mail'
import { prisma } from '@/lib/prisma'
import { getAppSettings } from '@/lib/settings'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('[Register] Attempt for:', body.email)
    const email = body.email?.trim().toLowerCase()
    const { password, role, nomAgence, plan, firstName, lastName, telephone } = body

    // Validation
    if (!email || !password || !role) {
      return NextResponse.json(
        { error: 'Email, password, and role are required' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    if (!['acquereur', 'agence'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      )
    }

    // Create user
    const user = await createUser(
      email,
      password,
      role as UserRole,
      role === 'agence' ? nomAgence : undefined,
      role === 'agence' ? plan : undefined,
      firstName,
      lastName,
      telephone
    )

    // Send welcome email
    try {
      await sendWelcomeEmail(email, role, role === 'agence' ? nomAgence : undefined)
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
          const settings = await getAppSettings()
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
      { error: error.message || 'Registration failed' },
      { status: 400 }
    )
  }
}
