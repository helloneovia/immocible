import { Pressable, StyleSheet, View } from 'react-native'
import * as Haptics from 'expo-haptics'
import { Check, type LucideIcon } from 'lucide-react-native'
import { Text } from './Text'
import { colors, fonts, radius } from '@/theme'

/** Carte de choix (questionnaire) : `tile` en grille, `row` en liste pleine largeur. */
export function OptionCard({
  label,
  description,
  icon: Icon,
  selected,
  onPress,
  layout = 'row',
  multiple,
}: {
  label: string
  description?: string
  icon?: LucideIcon
  selected: boolean
  onPress: () => void
  layout?: 'row' | 'tile'
  multiple?: boolean
}) {
  const tile = layout === 'tile'
  return (
    <Pressable
      accessibilityRole={multiple ? 'checkbox' : 'radio'}
      accessibilityState={multiple ? { checked: selected } : { selected }}
      accessibilityLabel={description ? `${label}, ${description}` : label}
      onPress={() => {
        Haptics.selectionAsync().catch(() => {})
        onPress()
      }}
      style={({ pressed }) => [
        styles.card,
        tile ? styles.tile : styles.row,
        selected ? styles.selected : null,
        pressed ? { transform: [{ scale: 0.97 }] } : null,
      ]}
    >
      {Icon ? (
        <View style={[styles.icon, selected ? styles.iconSelected : null]}>
          <Icon size={tile ? 24 : 21} color={selected ? colors.gold : colors.navy} strokeWidth={2} />
        </View>
      ) : null}
      <View style={tile ? styles.tileText : styles.rowText}>
        <Text style={[styles.label, tile ? { textAlign: 'left' } : null]} numberOfLines={2}>
          {label}
        </Text>
        {description ? (
          <Text variant="footnote" numberOfLines={2}>
            {description}
          </Text>
        ) : null}
      </View>
      <View style={[styles.check, multiple ? styles.checkSquare : null, selected ? styles.checkOn : null, tile ? styles.checkTile : null]}>
        {selected ? <Check size={14} color={colors.navy} strokeWidth={3} /> : null}
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 14, minHeight: 64 },
  tile: { flex: 1, minHeight: 116, padding: 14, gap: 12, justifyContent: 'space-between' },
  selected: { borderColor: colors.navy },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSelected: { backgroundColor: colors.navy },
  rowText: { flex: 1, gap: 2 },
  tileText: { gap: 2 },
  label: { fontFamily: fonts.semibold, fontSize: 16, color: colors.ink },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.slate300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkSquare: { borderRadius: 7 },
  checkOn: { backgroundColor: colors.gold, borderColor: colors.gold },
  checkTile: { position: 'absolute', top: 12, right: 12 },
})
