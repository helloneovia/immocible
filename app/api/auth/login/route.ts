import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser } from '@/lib/auth'
import { createSession } from '@/lib/session'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, role } = body

    console.log(`[Login] Attempt for ${email} as ${role || 'unknown'}`)

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      )
    }

    // Authenticate (throws error if invalid)
    const user = await authenticateUser(email, password, role)

    // Create Session
    await createSession(user.id)

    console.log(`[Login] Success for user ${user.id}`)

    return NextResponse.json(
      { success: true, user },
      { status: 200 }
    )

  } catch (error: any) {
    console.error('[Login] Error:', error.message)
    return NextResponse.json(
      { error: error.message || 'Authentification échouée' },
      { status: 401 }
    )
  }
}
