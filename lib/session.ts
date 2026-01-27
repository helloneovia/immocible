import { cookies } from 'next/headers'
import { prisma } from './prisma'

const SESSION_COOKIE_NAME = 'immocible_session_v2'
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

  // LOGIC UPDATE: Force Secure: true in production for immocible.com (HTTPS).
  // Only downgrade to false if NEXTAUTH_URL is explicitly HTTP.
  const isSecure = process.env.NODE_ENV === 'production' && (!process.env.NEXTAUTH_URL || !process.env.NEXTAUTH_URL.startsWith('http://'))

  console.log('[createSession] 3. Setting cookie. Secure:', isSecure, 'Env:', process.env.NODE_ENV, 'NEXTAUTH_URL:', process.env.NEXTAUTH_URL || '(not set)')

  // Safety: If we are in secure mode, explicitly nuke any non-secure ghost cookie
  // that might be lingering from the previous "aggressive clearing" bug.
  if (isSecure) {
    cookieStore.set(SESSION_COOKIE_NAME, '', {
      httpOnly: true,
      sameSite: 'lax',
      secure: false, // Explicitly target non-secure
      maxAge: 0,
      path: '/',
    })
  }

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

  // Determine if we should use secure cookies, matching createSession logic
  const isSecure = process.env.NODE_ENV === 'production' && (!process.env.NEXTAUTH_URL || !process.env.NEXTAUTH_URL.startsWith('http://'))

  console.log('[deleteSession] 3. Clearing cookie. Secure:', isSecure)

  cookieStore.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: isSecure,
    maxAge: 0,
    path: '/',
  })
}

export async function getCurrentUser() {
  const session = await getSession()
  if (!session) {
    return null
  }

  const { password: _, ...userWithoutPassword } = session.user
  return userWithoutPassword
}
