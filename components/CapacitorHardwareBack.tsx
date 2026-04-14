'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { App } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'

export function CapacitorHardwareBack() {
  const router = useRouter()

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const backListener = App.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
      } else {
        App.exitApp();
      }
    });

    return () => {
      backListener.then(listener => listener.remove());
    };
  }, []);

  return null;
}
