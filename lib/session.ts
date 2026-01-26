import { cookies } from 'next/headers'
import { prisma } from './prisma'

const SESSION_COOKIE_NAME = 'immocible_session'
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export async function createSession(userId: string) {
  const sessionId = crypto.randomUUID()

  // Store session in database
  await prisma.session.create({
    data: {
      id: sessionId,
      userId,
      expiresAt: new Date(Date.now() + SESSION_MAX_AGE * 1000),
    },
  })

  // Set cookie
  const cookieStore = cookies()

  // Only use secure cookies in production if the URL is HTTPS
  // This allows production builds to work on HTTP (e.g. internal testing) if NEXTAUTH_URL is set to http://...
  const isSecure = process.env.NODE_ENV === 'production' && (!process.env.NEXTAUTH_URL || process.env.NEXTAUTH_URL.startsWith('https'))

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

  if (!sessionId) {
    return null
  }

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

  if (!session || session.expiresAt < new Date()) {
    // Session expired
    await deleteSession(sessionId)
    return null
  }

  return session
}

export async function deleteSession(sessionId?: string) {
  const cookieStore = cookies()
  const id = sessionId || cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (id) {
    await prisma.session.delete({
      where: { id },
    }).catch(() => {
      // Session might not exist, ignore error
    })
  }

  cookieStore.delete(SESSION_COOKIE_NAME)
}

export async function getCurrentUser() {
  const session = await getSession()
  if (!session) {
    return null
  }

  const { password: _, ...userWithoutPassword } = session.user
  return userWithoutPassword
}
