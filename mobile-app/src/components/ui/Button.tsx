import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native'
import * as Haptics from 'expo-haptics'
import type { LucideIcon } from 'lucide-react-native'
import { Text } from './Text'
import { colors, fonts } from '@/theme'

type Variant = 'primary' | 'accent' | 'secondary' | 'outline' | 'ghost' | 'light' | 'glass' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface Props {
  title: string
  onPress?: () => void
  variant?: Variant
  size?: Size
  loading?: boolean
  disabled?: boolean
  icon?: LucideIcon
  iconRight?: LucideIcon
  fullWidth?: boolean
  style?: StyleProp<ViewStyle>
  accessibilityHint?: string
}

const palette: Record<Variant, { bg: string; fg: string; border?: string }> = {
  primary: { bg: colors.navy, fg: colors.surface },
  accent: { bg: colors.gold, fg: colors.navy },
  secondary: { bg: colors.fill, fg: colors.ink },
  outline: { bg: colors.fill, fg: colors.ink },
  ghost: { bg: 'transparent', fg: colors.navy },
  light: { bg: colors.surface, fg: colors.navy },
  glass: { bg: 'rgba(255,255,255,0.16)', fg: colors.surface, border: 'rgba(255,255,255,0.28)' },
  danger: { bg: colors.dangerSoft, fg: colors.danger },
}

const heights: Record<Size, number> = { sm: 38, md: 50, lg: 56 }

/** Bouton « capsule » : forme et retours haptiques des apps natives récentes. */
export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  icon: Icon,
  iconRight: IconRight,
  fullWidth = true,
  style,
  accessibilityHint,
}: Props) {
  const p = palette[variant]
  const inactive = disabled || loading
  const iconSize = size === 'sm' ? 16 : 19

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      disabled={inactive}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
        onPress?.()
      }}
      style={({ pressed }) => [
        styles.base,
        {
          height: heights[size],
          backgroundColor: p.bg,
          borderColor: p.border ?? 'transparent',
          borderWidth: p.border ? StyleSheet.hairlineWidth * 2 : 0,
          paddingHorizontal: size === 'sm' ? 16 : 22,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          opacity: inactive ? 0.45 : 1,
          transform: [{ scale: pressed ? 0.97 : 1 }],
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={p.fg} />
      ) : (
        <View style={styles.row}>
          {Icon ? <Icon size={iconSize} color={p.fg} strokeWidth={2.3} /> : null}
          <Text
            numberOfLines={1}
            style={[styles.label, { color: p.fg, fontSize: size === 'lg' ? 17 : size === 'sm' ? 14 : 16 }]}
          >
            {title}
          </Text>
          {IconRight ? <IconRight size={iconSize} color={p.fg} strokeWidth={2.3} /> : null}
        </View>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: { borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { fontFamily: fonts.semibold, letterSpacing: -0.1 },
})
