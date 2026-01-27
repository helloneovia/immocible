import { cookies } from 'next/headers'
import { prisma } from './prisma'

const SESSION_COOKIE_NAME = 'immocible_session_v3' // Bump version to force fresh start
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export async function createSession(userId: string) {
  const sessionId = crypto.randomUUID()

  console.log('[Auth] Creating session for user:', userId)

  // 1. Create session in DB
  await prisma.session.create({
    data: {
      id: sessionId,
      userId,
      expiresAt: new Date(Date.now() + SESSION_MAX_AGE * 1000),
    },
  })

  // 2. Set Cookie
  const cookieStore = cookies()

  // Simple, robust cookie settings
  cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  })

  return sessionId
}

export async function getSession() {
  const cookieStore = cookies()
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!sessionId) return null

  try {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        user: {
          include: { profile: true }
        }
      }
    })

    if (!session) {
      // Cookie exists but invalid in DB -> Clear it
      await deleteSession()
      return null
    }

    if (session.expiresAt < new Date()) {
      await deleteSession()
      return null
    }

    return session
  } catch (error) {
    console.error('[Auth] Error getting session:', error)
    return null
  }
}

export async function deleteSession() {
  const cookieStore = cookies()
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (sessionId) {
    // Delete from DB
    try {
      await prisma.session.deleteMany({
        where: { id: sessionId }
      })
    } catch (e) {
      // Ignore if already deleted
    }
  }

  // Clear cookie
  cookieStore.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
}

export async function getCurrentUser() {
  const session = await getSession()
  if (!session) return null

  // Return user without password
  const { password: _, ...userWithoutPassword } = session.user
  return userWithoutPassword
}
