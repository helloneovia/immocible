import { useEffect } from 'react'
import { router, Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import * as Notifications from 'expo-notifications'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useFonts } from 'expo-font'
// Imports par graisse : seules les polices utilisées sont embarquées dans l'app.
import { Inter_300Light } from '@expo-google-fonts/inter/300Light'
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular'
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium'
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold'
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold'
import { PlayfairDisplay_600SemiBold } from '@expo-google-fonts/playfair-display/600SemiBold'
import { PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display/700Bold'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { I18nProvider, useI18n } from '@/i18n'
import { SettingsProvider } from '@/contexts/SettingsContext'
import { UnreadProvider } from '@/contexts/UnreadContext'
import { OfflineBanner } from '@/components/OfflineBanner'
import { registerPushToken, resetPushRegistration } from '@/lib/push'
import { colors } from '@/theme'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold,
  })

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <I18nProvider>
          <AuthProvider>
            <SettingsProvider>
              <UnreadProvider>
                <LocalizedNavigator fontsReady={fontsLoaded || !!fontError} />
              </UnreadProvider>
            </SettingsProvider>
          </AuthProvider>
        </I18nProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}

/** Changer de langue remonte la navigation : tous les écrans et en-têtes natifs sont retraduits. */
function LocalizedNavigator({ fontsReady }: { fontsReady: boolean }) {
  const { locale } = useI18n()
  return <RootNavigator key={locale} fontsReady={fontsReady} />
}

function RootNavigator({ fontsReady }: { fontsReady: boolean }) {
  const { user, loading, pendingHref, setPendingHref } = useAuth()
  const ready = fontsReady && !loading
  const role = user?.role

  useEffect(() => {
    if (ready) SplashScreen.hide()
  }, [ready])

  useEffect(() => {
    if (user?.id) registerPushToken(user.id)
    else resetPushRegistration()
  }, [user?.id])

  // Après une inscription : ouvrir l'écran demandé une fois la pile protégée basculée.
  useEffect(() => {
    if (!user || !pendingHref) return
    // pendingHref n'est vidé qu'au déclenchement : le vider avant relancerait l'effet,
    // dont le nettoyage annulerait le minuteur et donc la navigation.
    const timer = setTimeout(() => {
      setPendingHref(null)
      router.navigate(pendingHref as never)
    }, 100)
    return () => clearTimeout(timer)
  }, [user, pendingHref, setPendingHref])

  // Toucher une notification ouvre la messagerie.
  useEffect(() => {
    if (!role) return
    const subscription = Notifications.addNotificationResponseReceivedListener(() => {
      router.navigate(role === 'agence' ? '/agence/messages' : '/acquereur/messages')
    })
    return () => subscription.remove()
  }, [role])

  if (!ready) return null

  // L'ordre compte : quand une garde bascule, la pile revient au premier écran autorisé.
  // Pas de <StatusBar> global : chaque écran fixe son style au focus (useStatusBar).
  return (
    <>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Protected guard={role === 'acquereur'}>
          <Stack.Screen name="acquereur" />
          {/* Questionnaire : une question par écran, en modal plein écran pour ne pas perdre la saisie. */}
          <Stack.Screen name="questionnaire" options={{ presentation: 'fullScreenModal', gestureEnabled: false }} />
        </Stack.Protected>
        <Stack.Protected guard={role === 'agence'}>
          <Stack.Screen name="agence" />
          <Stack.Screen name="profil/[id]" />
        </Stack.Protected>
        <Stack.Protected guard={!user}>
          <Stack.Screen name="index" />
          <Stack.Screen name="connexion" />
          <Stack.Screen name="inscription-acquereur" />
          <Stack.Screen name="inscription-agence" />
          <Stack.Screen name="mot-de-passe-oublie" />
        </Stack.Protected>
        <Stack.Protected guard={!!user}>
          <Stack.Screen name="conversation/[id]" />
          <Stack.Screen name="paiement" options={{ presentation: 'modal', gestureEnabled: false }} />
        </Stack.Protected>
        <Stack.Screen name="reset-password" />
        <Stack.Screen name="blog/index" />
        <Stack.Screen name="blog/[slug]" />
        <Stack.Screen name="legal/[slug]" />
      </Stack>
      <OfflineBanner />
    </>
  )
}
