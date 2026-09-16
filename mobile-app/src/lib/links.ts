import { Linking } from 'react-native'
import { router } from 'expo-router'
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

/** Pages légales affichées en natif (contenu lu sur le serveur, modifiable dans l'admin). */
export function openLegal(slug: 'mentions-legales' | 'confidentialite' | 'cgu') {
  router.push({ pathname: '/legal/[slug]', params: { slug } })
}

export const SUPPORT_EMAIL = 'contact@immocible.com'
