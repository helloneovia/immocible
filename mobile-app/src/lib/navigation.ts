import { Platform } from 'react-native'
import { useHeaderHeight } from 'expo-router/react-navigation'
import type { NativeStackNavigationOptions } from 'expo-router'
import { colors, fonts } from '@/theme'

/** En-têtes natifs des piles d'onglets : grand titre qui se replie au défilement (iOS). */
export const tabStackOptions: NativeStackNavigationOptions = {
  headerLargeTitle: true,
  // iOS 26 : une couleur de fond d'en-tête dans une pile imbriquée sous NativeTabs rend le
  // grand titre invisible. Sur iOS, la barre vitrée prend déjà le fond de l'écran.
  ...Platform.select({ android: { headerStyle: { backgroundColor: colors.bg } }, default: {} }),
  headerShadowVisible: false,
  headerLargeTitleShadowVisible: false,
  headerLargeTitleStyle: { fontFamily: fonts.bold, color: colors.ink },
  headerTitleStyle: { fontFamily: fonts.semibold, color: colors.ink },
  headerTintColor: colors.navy,
  headerBackButtonDisplayMode: 'minimal',
  contentStyle: { backgroundColor: colors.bg },
}

/** En-tête natif simple pour les écrans empilés hors onglets. */
export const pushedScreenOptions: NativeStackNavigationOptions = {
  headerShown: true,
  headerShadowVisible: false,
  headerStyle: { backgroundColor: colors.bg },
  headerTitleStyle: { fontFamily: fonts.semibold, color: colors.ink },
  headerTintColor: colors.navy,
  headerBackButtonDisplayMode: 'minimal',
  contentStyle: { backgroundColor: colors.bg },
}

/** En-tête transparent (écrans d'authentification, bouton retour seul). */
export const bareHeaderOptions: NativeStackNavigationOptions = {
  headerShown: true,
  headerTitle: '',
  headerTransparent: true,
  headerShadowVisible: false,
  headerTintColor: colors.navy,
  headerBackButtonDisplayMode: 'minimal',
}

/**
 * Décalage clavier des écrans poussés dans une pile d'onglet (formulaires du profil).
 * iOS : le contenu démarre sous l'en-tête translucide, aucun décalage.
 * Android : l'en-tête occupe la mise en page, il faut retrancher sa hauteur.
 */
export function useTabScreenKeyboardOffset() {
  const headerHeight = useHeaderHeight()
  return Platform.OS === 'ios' ? 0 : headerHeight
}

/** Les ScrollView d'écrans à grand titre doivent ajuster leurs marges automatiquement sur iOS. */
export const largeTitleScrollProps = Platform.select({
  ios: { contentInsetAdjustmentBehavior: 'automatic' as const },
  default: {},
})
