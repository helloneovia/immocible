import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native'
import { colors, radius, shadow } from '@/theme'

interface Props {
  children: React.ReactNode
  onPress?: () => void
  dark?: boolean
  style?: StyleProp<ViewStyle>
  accessibilityLabel?: string
}

export function Card({ children, onPress, dark, style, accessibilityLabel }: Props) {
  const base = [styles.card, dark ? styles.dark : styles.light, style]
  if (!onPress) return <View style={base}>{children}</View>
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [base, pressed ? { opacity: 0.92, transform: [{ scale: 0.99 }] } : null]}
    >
      {children}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, padding: 18, overflow: 'hidden', ...shadow.card },
  light: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.slate200 },
  dark: { backgroundColor: colors.ink },
})
