import { Pressable, StyleSheet, View } from 'react-native'
import { Check, X } from 'lucide-react-native'
import * as Haptics from 'expo-haptics'
import { Text } from './Text'
import { colors, fonts, radius } from '@/theme'

interface TileProps {
  label: string
  selected: boolean
  onPress: () => void
  centered?: boolean
}

/** Case à cocher « tuile » (types de bien, pièces, critères) — bordure ambre si sélectionnée, comme sur le web. */
export function ChoiceTile({ label, selected, onPress, centered }: TileProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
      onPress={() => {
        Haptics.selectionAsync().catch(() => {})
        onPress()
      }}
      style={({ pressed }) => [
        styles.tile,
        centered ? styles.centered : null,
        selected ? styles.selected : null,
        pressed ? { transform: [{ scale: 0.97 }] } : null,
      ]}
    >
      <View style={[styles.box, selected ? styles.boxSelected : null]}>
        {selected ? <Check size={14} color={colors.white} strokeWidth={3} /> : null}
      </View>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.8}
        style={[styles.label, selected ? { color: colors.ink } : null]}
      >
        {label}
      </Text>
    </Pressable>
  )
}

/** Étiquette (ville, critère). Supprimable si `onRemove` est fourni. */
export function Tag({ label, onRemove, tone = 'neutral' }: { label: string; onRemove?: () => void; tone?: 'neutral' | 'green' | 'amber' }) {
  const palette =
    tone === 'green'
      ? { bg: colors.emerald50, fg: colors.emerald700 }
      : tone === 'amber'
        ? { bg: colors.amber100, fg: '#92400E' }
        : { bg: colors.slate100, fg: colors.slate700 }
  const content = (
    <>
      <Text style={[styles.tagLabel, { color: palette.fg }]}>{label}</Text>
      {onRemove ? <X size={14} color={palette.fg} /> : null}
    </>
  )
  if (!onRemove) return <View style={[styles.tag, { backgroundColor: palette.bg }]}>{content}</View>
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Retirer ${label}`}
      onPress={onRemove}
      hitSlop={6}
      style={[styles.tag, { backgroundColor: palette.bg }]}
    >
      {content}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    minHeight: 54,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.slate200,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  centered: { justifyContent: 'center' },
  selected: { borderColor: colors.amber500, backgroundColor: colors.amber50 },
  box: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.slate300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxSelected: { backgroundColor: colors.amber500, borderColor: colors.amber500 },
  label: { fontFamily: fonts.medium, fontSize: 15, color: colors.slate700, flexShrink: 1 },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  tagLabel: { fontFamily: fonts.medium, fontSize: 13 },
})
