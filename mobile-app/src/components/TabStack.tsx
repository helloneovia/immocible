import { Stack } from 'expo-router'
import { tabStackOptions } from '@/lib/navigation'

/** Pile native d'un onglet : grands titres, retour minimal, fond groupé. */
export function TabStack() {
  return <Stack screenOptions={tabStackOptions} />
}
