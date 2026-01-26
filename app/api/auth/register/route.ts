import { NextRequest, NextResponse } from 'next/server'
import { createUser } from '@/lib/auth'
import { createSession } from '@/lib/session'
import { UserRole } from '@prisma/client'
import { sendWelcomeEmail } from '@/lib/mail'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, role, nomAgence, plan } = body

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
      role === 'agence' ? plan : undefined
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
