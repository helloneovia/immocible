import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'

type AuthOk = { user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>; error: null }
type AuthErr = { user: null; error: NextResponse }

/**
 * Exige un utilisateur authentifié. À utiliser en tête de route :
 *   const { user, error } = await requireAuth()
 *   if (error) return error
 */
export async function requireAuth(): Promise<AuthOk | AuthErr> {
  const user = await getCurrentUser()
  if (!user) {
    return { user: null, error: NextResponse.json({ error: 'Non authentifié' }, { status: 401 }) }
  }
  return { user, error: null }
}

/** Exige un utilisateur authentifié ayant le rôle admin. */
export async function requireAdmin(): Promise<AuthOk | AuthErr> {
  const user = await getCurrentUser()
  if (!user || user.role !== 'admin') {
    return { user: null, error: NextResponse.json({ error: 'Accès refusé' }, { status: 403 }) }
  }
  return { user, error: null }
}

/** Exige un utilisateur authentifié ayant le rôle agence. */
export async function requireAgence(): Promise<AuthOk | AuthErr> {
  const user = await getCurrentUser()
  if (!user || user.role !== 'agence') {
    return { user: null, error: NextResponse.json({ error: 'Accès refusé' }, { status: 403 }) }
  }
  return { user, error: null }
}
