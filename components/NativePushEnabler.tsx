'use client'

import { useEffect } from 'react'
import { Capacitor } from '@capacitor/core'
import { PushNotifications } from '@capacitor/push-notifications'
import { useAuth } from '@/contexts/AuthContext'

export function NativePushEnabler() {
  const { user } = useAuth()

  useEffect(() => {
    // We only attach push permissions if the app is running natively AND a user is logged in.
    if (!Capacitor.isNativePlatform() || !user?.id) return;

    const registerPushNotifications = async () => {
      // 1. Request permission
      let permStatus = await PushNotifications.checkPermissions();

      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== 'granted') {
        return; // User denied push notifications
      }

      // 2. Register with Apple/Google to get unique Device Token
      await PushNotifications.register();

      // 3. Setup Listeners
      PushNotifications.addListener('registration', async (token) => {
        // Send token to our Next.js backend
        try {
          await fetch('/api/notifications/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              token: token.value,
              userId: user.id,
              platform: Capacitor.getPlatform()
            }),
          });
        } catch (e) {
          console.error('Failed to save push token', e);
        }
      });

      PushNotifications.addListener('registrationError', (error: any) => {
        console.error('Error on registration: ' + JSON.stringify(error));
      });

      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push received: ', notification);
      });

      PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('Push action performed: ', notification);
        // Could routing here (e.g., router.push('/agence/messages'))
      });
    };

    registerPushNotifications();

    return () => {
      PushNotifications.removeAllListeners();
    };
  }, [user]);

  return null;
}
