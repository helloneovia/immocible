import { Linking } from 'react-native'
import * as WebBrowser from 'expo-web-browser'
import { API_URL } from '@/lib/api'
import { colors } from '@/theme'

/** Ouvre une page du site (pages légales, articles externes) dans le navigateur intégré. */
export function openInApp(urlOrPath: string) {
  const url = urlOrPath.startsWith('http') ? urlOrPath : API_URL + urlOrPath
  return WebBrowser.openBrowserAsync(url, {
    controlsColor: colors.ink,
    toolbarColor: colors.white,
    presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
  }).catch(() => Linking.openURL(url))
}

export const LEGAL_LINKS = [
  { label: 'Mentions légales', path: '/mentions-legales' },
  { label: 'Confidentialité', path: '/confidentialite' },
  { label: 'CGU / CGV', path: '/cgu' },
]

export const SUPPORT_EMAIL = 'contact@immocible.com'
