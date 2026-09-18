import { useState } from 'react'
import { Alert, Linking } from 'react-native'
import * as Location from 'expo-location'
import { LocateFixed } from 'lucide-react-native'
import { Button } from '@/components/ui/Button'
import { t } from '@/i18n'

async function cityFromCoords(latitude: number, longitude: number): Promise<string | null> {
  try {
    const [place] = await Location.reverseGeocodeAsync({ latitude, longitude })
    const city = place?.city || place?.subregion || place?.district
    if (city) return city
  } catch {
    // Géocodeur natif indisponible : repli sur Nominatim, comme la version web.
  }
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`,
    { headers: { 'User-Agent': 'IMMOCIBLE-Mobile/1.0 (contact@immocible.com)' } },
  )
  if (!response.ok) return null
  const data = await response.json()
  return data.address?.city || data.address?.town || data.address?.village || data.address?.county || null
}

export async function getCurrentCoords() {
  const permission = await Location.requestForegroundPermissionsAsync()
  if (permission.status !== 'granted') {
    Alert.alert(
      t('questionnaire.location.disabledTitle'),
      t('questionnaire.location.disabledMessage'),
      [
        { text: t('questionnaire.location.cancel'), style: 'cancel' },
        { text: t('questionnaire.location.settings'), onPress: () => Linking.openSettings() },
      ],
    )
    return null
  }
  const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
  return position.coords
}

/** Bouton « Ma position » : renvoie la ville correspondant à la position GPS. */
export function LocationButton({ onCity, compact }: { onCity: (city: string) => void; compact?: boolean }) {
  const [loading, setLoading] = useState(false)

  const locate = async () => {
    setLoading(true)
    try {
      const coords = await getCurrentCoords()
      if (!coords) return
      const city = await cityFromCoords(coords.latitude, coords.longitude)
      if (city) onCity(city)
      else Alert.alert(t('questionnaire.location.alertTitle'), t('questionnaire.location.cityNotFound'))
    } catch {
      Alert.alert(t('questionnaire.location.alertTitle'), t('questionnaire.location.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      title={compact ? t('questionnaire.location.short') : t('questionnaire.location.myPosition')}
      icon={LocateFixed}
      variant="outline"
      size="sm"
      fullWidth={false}
      loading={loading}
      onPress={locate}
    />
  )
}
