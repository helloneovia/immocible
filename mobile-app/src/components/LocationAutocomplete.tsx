import { useEffect, useState } from 'react'
import { ActivityIndicator, Keyboard, Pressable, StyleSheet, View } from 'react-native'
import { MapPin } from 'lucide-react-native'
import { TextField } from '@/components/ui/TextField'
import { t } from '@/i18n'
import { Text } from '@/components/ui/Text'
import { colors, radius } from '@/theme'

interface CityResult {
  properties: { label: string; context: string; citycode?: string }
  geometry?: { coordinates: [number, number] }
}

export async function searchCities(query: string, limit = 5): Promise<CityResult[]> {
  const response = await fetch(
    `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&type=municipality&limit=${limit}`,
  )
  const data = await response.json()
  return data.features || []
}

/** Recherche de communes (API Adresse du gouvernement), résultats affichés sous le champ. */
export function LocationAutocomplete({
  onSelect,
  placeholder = t('questionnaire.location.addCity'),
}: {
  onSelect: (label: string) => void
  placeholder?: string
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<CityResult[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (query.trim().length <= 2) {
      setResults([])
      return
    }
    let cancelled = false
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const found = await searchCities(query.trim())
        if (!cancelled) setResults(found)
      } catch {
        if (!cancelled) setResults([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, 300)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [query])

  return (
    <View style={styles.wrapper}>
      <TextField
        tone="surface"
        icon={MapPin}
        value={query}
        onChangeText={setQuery}
        placeholder={placeholder}
        autoCorrect={false}
        returnKeyType="search"
        rightSlot={loading ? <ActivityIndicator size="small" color={colors.ink} /> : null}
      />
      {results.length > 0 ? (
        <View style={styles.results}>
          {results.map((item, index) => (
            <Pressable
              key={`${item.properties.label}-${index}`}
              accessibilityRole="button"
              onPress={() => {
                Keyboard.dismiss()
                onSelect(item.properties.label)
                setQuery('')
                setResults([])
              }}
              style={({ pressed }) => [styles.row, index > 0 ? styles.rowBorder : null, pressed ? { backgroundColor: colors.slate50 } : null]}
            >
              <MapPin size={16} color={colors.slate400} />
              <View style={{ flex: 1 }}>
                <Text variant="subheading" style={{ fontSize: 15 }}>
                  {item.properties.label}
                </Text>
                <Text variant="caption">{item.properties.context}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: { gap: 8 },
  results: {
    borderWidth: 1,
    borderColor: colors.slate200,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 12 },
  rowBorder: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.slate200 },
})
