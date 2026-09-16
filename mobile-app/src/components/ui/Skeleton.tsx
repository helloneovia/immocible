import { useEffect } from 'react'
import { StyleSheet, View, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native'
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'
import { colors, radius, spacing } from '@/theme'

/** Bloc de chargement pulsé (remplace les indicateurs « Chargement... »). */
export function Skeleton({
  width = '100%',
  height = 16,
  rounded = 8,
  style,
}: {
  width?: DimensionValue
  height?: number
  rounded?: number
  style?: StyleProp<ViewStyle>
}) {
  const reduceMotion = useReducedMotion()
  const opacity = useSharedValue(0.55)

  useEffect(() => {
    if (reduceMotion) return
    opacity.value = withRepeat(withTiming(1, { duration: 750 }), -1, true)
    return () => cancelAnimation(opacity)
  }, [opacity, reduceMotion])

  const animated = useAnimatedStyle(() => ({ opacity: opacity.value }))

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[{ width, height, borderRadius: rounded, backgroundColor: colors.fill }, animated, style]}
    />
  )
}

/** Squelette d'une liste de lignes (avatar + deux lignes de texte). */
export function SkeletonRows({ count = 5 }: { count?: number }) {
  return (
    <View style={styles.group} accessibilityLabel="Chargement">
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={styles.row}>
          <Skeleton width={46} height={46} rounded={23} />
          <View style={{ flex: 1, gap: 8 }}>
            <Skeleton width="55%" height={14} />
            <Skeleton width="85%" height={12} />
          </View>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  group: {
    marginHorizontal: spacing.screen,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: 6,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: spacing.lg, paddingVertical: 12 },
})
