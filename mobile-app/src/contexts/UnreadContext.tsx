import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { AppState } from 'react-native'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

interface UnreadContextValue {
  count: number
  refresh: () => void
}

const UnreadContext = createContext<UnreadContextValue>({ count: 0, refresh: () => {} })

const POLL_MS = 15_000

/** Nombre de messages non lus (badge de l'onglet Messages), rafraîchi toutes les 15 s au premier plan. */
export function UnreadProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [count, setCount] = useState(0)

  const refresh = useCallback(() => {
    if (!user) return
    api<{ count: number }>('/api/notifications/unread')
      .then((data) => setCount(data?.count ?? 0))
      .catch(() => {})
  }, [user])

  useEffect(() => {
    if (!user) {
      setCount(0)
      return
    }
    refresh()
    let timer: ReturnType<typeof setInterval> | null = setInterval(refresh, POLL_MS)
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        refresh()
        if (!timer) timer = setInterval(refresh, POLL_MS)
      } else if (timer) {
        clearInterval(timer)
        timer = null
      }
    })
    return () => {
      if (timer) clearInterval(timer)
      subscription.remove()
    }
  }, [user, refresh])

  return <UnreadContext.Provider value={{ count, refresh }}>{children}</UnreadContext.Provider>
}

export function useUnread() {
  return useContext(UnreadContext)
}
