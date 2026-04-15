'use client'

import { useEffect, useState } from 'react'
import { Capacitor } from '@capacitor/core'
import { Network } from '@capacitor/network'
import { SplashScreen } from '@capacitor/splash-screen'
import { StatusBar, Style } from '@capacitor/status-bar'
import { WifiOff } from 'lucide-react'

export function CapacitorNativeShell() {
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    // 1. Splash Screen: Hide natively once our React app has safely mounted.
    SplashScreen.hide().catch(console.error);

    // 2. Status Bar: Ensure it has an appropriate default.
    StatusBar.setStyle({ style: Style.Dark }).catch(console.error);

    // 3. Network Listener
    const initializeNetwork = async () => {
      const status = await Network.getStatus();
      setIsOffline(!status.connected);

      Network.addListener('networkStatusChange', (stat) => {
        setIsOffline(!stat.connected);
      });
    };

    initializeNetwork();

    return () => {
      Network.removeAllListeners();
    };
  }, []);

  if (isOffline && Capacitor.isNativePlatform()) {
    return (
      <div className="fixed inset-0 z-[99999] bg-slate-900 flex flex-col items-center justify-center text-white p-6 text-center">
        <WifiOff className="w-16 h-16 text-slate-500 mb-6 animate-pulse" />
        <h2 className="text-2xl font-bold mb-2">Vous êtes hors ligne</h2>
        <p className="text-slate-400">
          L'application IMMOCIBLE nécessite une connexion Internet active pour fonctionner. Veuillez vérifier vos paramètres Wi-Fi ou Données cellulaires.
        </p>
      </div>
    );
  }

  return null;
}
