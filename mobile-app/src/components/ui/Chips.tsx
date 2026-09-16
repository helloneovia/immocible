import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native'
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { ChevronDown, type LucideIcon } from 'lucide-react-native'
import { Text } from './Text'
import { colors, fonts, spacing } from '@/theme'

export function Chip({
  label,
  selected,
  onPress,
  icon: Icon,
  dropdown,
  large,
}: {
  label: string
  selected?: boolean
  onPress?: () => void
  icon?: LucideIcon
  dropdown?: boolean
  large?: boolean
}) {
  const fg = selected ? colors.surface : colors.ink
  return (
    <Pressable
      accessibilityRole={dropdown ? 'button' : 'togglebutton'}
      accessibilityState={{ selected: !!selected }}
      accessibilityLabel={label}
      onPress={() => {
        Haptics.selectionAsync().catch(() => {})
        onPress?.()
      }}
      style={({ pressed }) => [
        styles.chip,
        large ? styles.chipLarge : null,
        selected ? styles.chipSelected : null,
        pressed ? { transform: [{ scale: 0.96 }] } : null,
      ]}
    >
      {Icon ? <Icon size={large ? 18 : 15} color={selected ? colors.gold : colors.text2} strokeWidth={2.2} /> : null}
      <Text style={[styles.chipText, large ? { fontSize: 16 } : null, { color: fg }]}>{label}</Text>
      {dropdown ? <ChevronDown size={14} color={selected ? colors.surface : colors.text2} /> : null}
    </Pressable>
  )
}

/** Rangée de filtres défilant horizontalement, collée aux bords de l'écran. */
export function ChipRow({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.row, style]}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  )
}

/** Contrôle segmenté avec pastille glissante. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  dark,
}: {
  options: { value: T; label: string; icon?: LucideIcon }[]
  value: T
  onChange: (value: T) => void
  dark?: boolean
}) {
  const [width, setWidth] = useState(0)
  const index = Math.max(0, options.findIndex((o) => o.value === value))
  const segment = width > 0 ? (width - 8) / options.length : 0

  const indicator = useAnimatedStyle(() => ({
    width: segment,
    transform: [{ translateX: withSpring(index * segment, { damping: 20, stiffness: 220 }) }],
  }))

  return (
    <View
      accessibilityRole="tablist"
      onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
      style={[styles.segment, dark ? styles.segmentDark : null]}
    >
      {segment > 0 ? <Animated.View style={[styles.indicator, dark ? styles.indicatorDark : null, indicator]} /> : null}
      {options.map((option) => {
        const active = option.value === value
        const Icon = option.icon
        const fg = dark ? (active ? colors.navy : 'rgba(255,255,255,0.8)') : active ? colors.ink : colors.text2
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => {
              if (!active) Haptics.selectionAsync().catch(() => {})
              onChange(option.value)
            }}
            style={styles.segmentItem}
          >
            {Icon ? <Icon size={16} color={fg} /> : null}
            <Text style={[styles.segmentText, { color: fg }]}>{option.label}</Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: spacing.screen, gap: 8 },
  chip: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: colors.separator,
  },
  chipLarge: { height: 46, paddingHorizontal: 18 },
  chipSelected: { backgroundColor: colors.navy, borderColor: colors.navy },
  chipText: { fontFamily: fonts.medium, fontSize: 14 },
  segment: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 999,
    backgroundColor: colors.fill,
  },
  segmentDark: { backgroundColor: 'rgba(255,255,255,0.14)' },
  indicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 4,
    borderRadius: 999,
    backgroundColor: colors.surface,
    shadowColor: '#0B1F38',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  indicatorDark: { backgroundColor: colors.surface },
  segmentItem: {
    flex: 1,
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  segmentText: { fontFamily: fonts.semibold, fontSize: 14 },
})
