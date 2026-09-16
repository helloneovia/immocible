import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import NetInfo from '@react-native-community/netinfo'
import { api, ApiError, setUnauthorizedHandler } from '@/lib/api'
import type { Role, User } from '@/lib/types'

interface AuthContextValue {
  user: User | null
  loading: boolean
  refresh: () => Promise<User | null>
  signIn: (email: string, password: string, role: Exclude<Role, 'admin'>) => Promise<void>
  signOut: () => Promise<void>
  /** Route à ouvrir juste après la bascule d'authentification (ex. questionnaire après inscription). */
  pendingHref: string | null
  setPendingHref: (href: string | null) => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [pendingHref, setPendingHref] = useState<string | null>(null)
  const userRef = useRef<User | null>(null)
  userRef.current = user

  const refresh = useCallback(async () => {
    try {
      const data = await api<{ user: User }>('/api/auth/me')
      // L'administration reste sur le web : un compte admin n'ouvre pas de session mobile.
      const next = data?.user && data.user.role !== 'admin' ? data.user : null
      setUser(next)
      return next
    } catch (error) {
      // Erreur réseau : on garde l'état courant plutôt que de déconnecter l'utilisateur.
      if (error instanceof ApiError && error.status !== 0) {
        setUser(null)
        return null
      }
      return userRef.current
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  // Session expirée côté serveur : retour à l'écran d'accueil.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      if (userRef.current) setUser(null)
    })
    return () => setUnauthorizedHandler(null)
  }, [])

  // Démarrage hors ligne : on revérifie la session au retour du réseau.
  useEffect(() => {
    let wasOffline = false
    return NetInfo.addEventListener((state) => {
      if (state.isConnected === false) wasOffline = true
      else if (wasOffline && state.isConnected) {
        wasOffline = false
        refresh()
      }
    })
  }, [refresh])

  const signIn = useCallback(
    async (email: string, password: string, role: Exclude<Role, 'admin'>) => {
      const result = await api<{ user: User }>('/api/auth/login', {
        method: 'POST',
        body: { email: email.trim().toLowerCase(), password, role },
      })
      if (result?.user?.role !== role) {
        throw new Error(role === 'agence' ? "Ce compte n'est pas un compte agence" : "Ce compte n'est pas un compte acquéreur")
      }
      await refresh()
    },
    [refresh],
  )

  const signOut = useCallback(async () => {
    try {
      await api('/api/auth/logout', { method: 'POST' })
    } catch {
      // La session locale est effacée quoi qu'il arrive.
    }
    setPendingHref(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, loading, refresh, signIn, signOut, pendingHref, setPendingHref }),
    [user, loading, refresh, signIn, signOut, pendingHref],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
