import { NextRequest, NextResponse } from 'next/server'
import { createUser } from '@/lib/auth'
import { createSession } from '@/lib/session'
import { UserRole } from '@prisma/client'
import { sendWelcomeEmail } from '@/lib/mail'
import { prisma } from '@/lib/prisma'

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

    // Send automatic Welcome message from MBJ Immo to acquereurs
    if (role === 'acquereur') {
      try {
        const agencyEmail = 'mbjimmo@outlook.fr';
        const agencyUser = await prisma.user.findUnique({
          where: { email: agencyEmail }
        });

        if (agencyUser && agencyUser.role === 'agence') {
          // Check if conversation already exists (just in case)
          let conversation = await prisma.conversation.findUnique({
            where: {
              agencyId_buyerId: {
                agencyId: agencyUser.id,
                buyerId: user.id
              }
            }
          });

          // Create if it does not exist
          if (!conversation) {
            conversation = await prisma.conversation.create({
              data: {
                agencyId: agencyUser.id,
                buyerId: user.id
              }
            })
          }

          // Create the actual welcome message
          const welcomeMessageText = `Bonjour,\n\nNous sommes heureux de vous compter parmis nos acquéreurs off-market, \nn'hésitez pas à nous contacter ici pour toute question ou interrogation.\n\nDans l’attente de vous aider à trouver la perle rare,\nMBJ`;

          await prisma.message.create({
            data: {
              conversationId: conversation.id,
              senderId: agencyUser.id,
              content: welcomeMessageText,
              isRead: false
            }
          })
        }
      } catch (welcomeMsgError) {
        console.error('Failed to send MBJ welcome message:', welcomeMsgError);
        // Ensure it doesn't fail registration
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
