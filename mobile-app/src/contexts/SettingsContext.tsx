import { createContext, useContext, useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { DEFAULT_SETTINGS, mergeSettings, type PublicSettings } from '@/lib/settings'

const SettingsContext = createContext<PublicSettings>(DEFAULT_SETTINGS)

/** Textes marketing et tarifs administrables, chargés une fois au démarrage. */
export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<PublicSettings>(DEFAULT_SETTINGS)

  useEffect(() => {
    api<Partial<PublicSettings>>('/api/public/settings')
      .then((data) => setSettings(mergeSettings(data)))
      .catch(() => {})
  }, [])

  return <SettingsContext.Provider value={settings}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  return useContext(SettingsContext)
}
