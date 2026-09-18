import { createContext, useContext, useEffect, useState } from 'react'
import { useI18n } from '@/i18n'
import { api } from '@/lib/api'
import { defaultSettings, mergeSettings, type PublicSettings } from '@/lib/settings'

const SettingsContext = createContext<PublicSettings>(defaultSettings('fr'))

/** Textes marketing et tarifs administrables, rechargés à chaque changement de langue. */
export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { locale } = useI18n()
  const [settings, setSettings] = useState<PublicSettings>(() => defaultSettings(locale))

  useEffect(() => {
    setSettings(defaultSettings(locale))
    api<Partial<PublicSettings>>('/api/public/settings')
      .then((data) => setSettings(mergeSettings(data, locale)))
      .catch(() => {})
  }, [locale])

  return <SettingsContext.Provider value={settings}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  return useContext(SettingsContext)
}
