import { Platform } from 'react-native'
import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'
import { api } from '@/lib/api'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

let registeredForUser: string | null = null

/**
 * Demande l'autorisation et enregistre le jeton natif (APNs / FCM) auprès de
 * /api/notifications/register — même format que l'ancienne coque Capacitor.
 * Sans configuration Firebase/APNs, l'échec est silencieux.
 */
export async function registerPushToken(userId: string) {
  if (registeredForUser === userId || !Device.isDevice) return
  registeredForUser = userId
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Messages',
        importance: Notifications.AndroidImportance.HIGH,
      })
    }
    let { status } = await Notifications.getPermissionsAsync()
    if (status !== 'granted') {
      status = (await Notifications.requestPermissionsAsync()).status
    }
    if (status !== 'granted') return

    const token = await Notifications.getDevicePushTokenAsync()
    await api('/api/notifications/register', {
      method: 'POST',
      body: { token: token.data, platform: Platform.OS },
    })
  } catch (error) {
    console.warn('[push] Enregistrement impossible :', error)
  }
}

export function resetPushRegistration() {
  registeredForUser = null
}
