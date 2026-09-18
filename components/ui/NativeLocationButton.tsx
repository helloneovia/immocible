'use client'

import { useState } from 'react'
import { Capacitor } from '@capacitor/core'
import { Geolocation } from '@capacitor/geolocation'
import { MapPin, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n/client'

interface NativeLocationButtonProps {
  onLocationFound: (location: string) => void;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export function NativeLocationButton({ onLocationFound, className, variant = "secondary" }: NativeLocationButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useI18n();

  const fetchLocation = async () => {
    setIsLoading(true);
    try {
      if (Capacitor.isNativePlatform()) {
        const permissions = await Geolocation.checkPermissions();
        if (permissions.location !== 'granted') {
          const req = await Geolocation.requestPermissions();
          if (req.location !== 'granted') {
            alert(t('common.location.denied'));
            setIsLoading(false);
            return;
          }
        }
      }

      const position = await Geolocation.getCurrentPosition();
      
      // Reverse Geocoding with Nominatim (OpenStreetMap)
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}&zoom=10`);
      if (res.ok) {
        const data = await res.json();
        const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county;
        if (city) {
          onLocationFound(city);
        } else {
          alert(t('common.location.cityUnknown'));
        }
      }
    } catch (error) {
      console.error("Geolocation error:", error);
      alert(t('common.location.error'));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button 
      type="button"
      variant={variant}
      className={className}
      onClick={fetchLocation}
      disabled={isLoading}
      title={t('common.location.title')}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <MapPin className="h-4 w-4 mr-2" />
      )}
      {t('common.location.button')}
    </Button>
  )
}
