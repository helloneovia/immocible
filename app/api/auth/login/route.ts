import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser } from '@/lib/auth'
import { createSession } from '@/lib/session'
import { enforceRateLimit } from '@/lib/rate-limit'
import { getT } from '@/lib/i18n/server'
import { normalizeEmail, PASSWORD_MAX_LENGTH } from '@/lib/validation'

export async function POST(request: NextRequest) {
  const t = getT()
  try {
    // Anti brute-force : au plus 10 tentatives par minute et par IP.
    const limited = enforceRateLimit(request, 'login', 10, 60_000)
    if (limited) return limited

    const body = await request.json()
    // Les comptes sont enregistrés en minuscules : « Nom@Exemple.fr » doit fonctionner.
    const email = normalizeEmail(body.email)
    const password = typeof body.password === 'string' ? body.password : ''
    const role = ['acquereur', 'agence', 'admin'].includes(body.role) ? body.role : undefined

    if (!email || !password || password.length > PASSWORD_MAX_LENGTH) {
      return NextResponse.json(
        { error: t('api.auth.emailPasswordRequired') },
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
      { error: error.message || t('api.auth.loginFailed') },
      { status: 401 }
    )
  }
}
