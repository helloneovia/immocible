'use client'

import { useState } from 'react'
import { Capacitor } from '@capacitor/core'
import { Geolocation } from '@capacitor/geolocation'
import { MapPin, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface NativeLocationButtonProps {
  onLocationFound: (location: string) => void;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export function NativeLocationButton({ onLocationFound, className, variant = "secondary" }: NativeLocationButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const fetchLocation = async () => {
    setIsLoading(true);
    try {
      if (Capacitor.isNativePlatform()) {
        const permissions = await Geolocation.checkPermissions();
        if (permissions.location !== 'granted') {
          const req = await Geolocation.requestPermissions();
          if (req.location !== 'granted') {
            alert("Autorisation de localisation refusée.");
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
          alert('Impossible de déterminer votre ville.');
        }
      }
    } catch (error) {
      console.error("Geolocation error:", error);
      alert("Erreur lors de la récupération de la position.");
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
      title="Utiliser ma position"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <MapPin className="h-4 w-4 mr-2" />
      )}
      Ma position
    </Button>
  )
}
