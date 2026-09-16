import { Platform } from 'react-native'
import type { NativeStackNavigationOptions } from 'expo-router'
import { colors, fonts } from '@/theme'

/** En-têtes natifs des piles d'onglets : grand titre qui se replie au défilement (iOS). */
export const tabStackOptions: NativeStackNavigationOptions = {
  headerLargeTitle: true,
  headerShadowVisible: false,
  headerLargeTitleShadowVisible: false,
  headerStyle: { backgroundColor: colors.bg },
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

/** Les ScrollView d'écrans à grand titre doivent ajuster leurs marges automatiquement sur iOS. */
export const largeTitleScrollProps = Platform.select({
  ios: { contentInsetAdjustmentBehavior: 'automatic' as const },
  default: {},
})
