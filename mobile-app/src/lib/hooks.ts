import { useCallback, useEffect, useRef } from 'react'
import { AppState } from 'react-native'
import { useFocusEffect } from 'expo-router'
import { setStatusBarStyle } from 'expo-status-bar'

/** Style de la barre d'état appliqué quand l'écran a le focus. */
export function useStatusBar(style: 'light' | 'dark') {
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle(style)
    }, [style]),
  )
}

/** Exécute `callback` à intervalle régulier tant que l'écran a le focus et que l'app est au premier plan. */
export function useFocusedInterval(callback: () => void, intervalMs: number) {
  const saved = useRef(callback)
  useEffect(() => {
    saved.current = callback
  }, [callback])

  useFocusEffect(
    useCallback(() => {
      let timer: ReturnType<typeof setInterval> | null = setInterval(() => saved.current(), intervalMs)
      const subscription = AppState.addEventListener('change', (state) => {
        if (state === 'active') {
          saved.current()
          if (!timer) timer = setInterval(() => saved.current(), intervalMs)
        } else if (timer) {
          clearInterval(timer)
          timer = null
        }
      })
      return () => {
        if (timer) clearInterval(timer)
        subscription.remove()
      }
    }, [intervalMs]),
  )
}
