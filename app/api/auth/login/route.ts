import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser } from '@/lib/auth'
import { createSession } from '@/lib/session'
import { enforceRateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    // Anti brute-force : au plus 10 tentatives par minute et par IP.
    const limited = enforceRateLimit(request, 'login', 10, 60_000)
    if (limited) return limited

    const body = await request.json()
    const { email, password, role } = body

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
