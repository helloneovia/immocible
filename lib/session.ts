import { cookies } from 'next/headers'
import { prisma } from './prisma'

const SESSION_COOKIE_NAME = 'immocible_session'
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export async function createSession(userId: string) {
  const sessionId = crypto.randomUUID()

  console.log('[createSession] 1. Creating session. UserId:', userId, 'SessionID:', sessionId)

  // Store session in database
  try {
    await prisma.session.create({
      data: {
        id: sessionId,
        userId,
        expiresAt: new Date(Date.now() + SESSION_MAX_AGE * 1000),
      },
    })
    console.log('[createSession] 2. DB session created.')
  } catch (e) {
    console.error('[createSession] ERROR creating DB session:', e)
    throw e
  }

  // Set cookie
  const cookieStore = cookies()

  // Only use secure cookies in production if the URL is HTTPS
  // This allows production builds to work on HTTP (e.g. internal testing) if NEXTAUTH_URL is set to http://...

  // LOGIC UPDATE: Default to FALSE if NEXTAUTH_URL is missing to avoid "Secure: true" on HTTP deployments (like Docker without proper ENV).
  // Ideally, users SHOULD set NEXTAUTH_URL, but this unblocks the issue.
  const isSecure = process.env.NODE_ENV === 'production' && (Boolean(process.env.NEXTAUTH_URL) && process.env.NEXTAUTH_URL!.startsWith('https'))

  console.log('[createSession] 3. Setting cookie. Secure:', isSecure, 'Env:', process.env.NODE_ENV, 'NEXTAUTH_URL:', process.env.NEXTAUTH_URL || '(not set)')

  cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  })

  return sessionId
}

export async function getSession() {
  const cookieStore = cookies()
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value

  console.log('[getSession] 1. Cookie retrieved:', sessionId ? sessionId.substring(0, 8) + '...' : 'UNDEFINED')

  if (!sessionId) {
    return null
  }

  try {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    })

    if (!session) {
      console.log('[getSession] 2. Session NOT found in DB. ID:', sessionId)
      return null
    }

    if (session.expiresAt < new Date()) {
      console.log('[getSession] 3. Session expired. ExpiresAt:', session.expiresAt, 'Now:', new Date())
      await deleteSession(sessionId)
      return null
    }

    console.log('[getSession] 4. Session valid. User:', session.user.id)
    return session
  } catch (e) {
    console.error('[getSession] ERROR retrieving session:', e)
    return null
  }
}

export async function deleteSession(sessionId?: string) {
  const cookieStore = cookies()
  const id = sessionId || cookieStore.get(SESSION_COOKIE_NAME)?.value

  console.log('[deleteSession] 1. Request to delete session. ID:', id || 'unknown')

  if (id) {
    try {
      await prisma.session.delete({
        where: { id },
      })
      console.log('[deleteSession] 2. DB session deleted.')
    } catch (e) {
      console.log('[deleteSession] 2. DB session deletion skipped (not found or error).')
    }
  }

  // AGGRESSIVE COOKIE CLEARING STRATEGY
  // We don't know if the browser holds a "Secure" or "Non-Secure" cookie (due to env changes).
  // We will attempt to clear both.

  const commonOptions = {
    httpOnly: true,
    sameSite: 'lax' as const,
    maxAge: 0,
    path: '/',
  }

  // 1. Clear with Secure: false (likely default for HTTP/local/broken env)
  cookieStore.set(SESSION_COOKIE_NAME, '', { ...commonOptions, secure: false })

  // 2. Clear with Secure: true (for HTTPS envs)
  // Note: One of these might be redundant or fail depending on connection, but it ensures coverage.
  if (process.env.NODE_ENV === 'production') {
    cookieStore.set(SESSION_COOKIE_NAME, '', { ...commonOptions, secure: true })
    console.log('[deleteSession] 3. Cleared cookie with Secure: false AND Secure: true')
  } else {
    console.log('[deleteSession] 3. Cleared cookie with Secure: false')
  }
}

export async function getCurrentUser() {
  const session = await getSession()
  if (!session) {
    return null
  }

  const { password: _, ...userWithoutPassword } = session.user
  return userWithoutPassword
}
