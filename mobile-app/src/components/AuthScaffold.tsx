import { KeyboardAvoidingView, ScrollView, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Stack } from 'expo-router'
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated'
import { StickyFooter } from '@/components/ui/StickyFooter'
import { Text } from '@/components/ui/Text'
import { useStatusBar } from '@/lib/hooks'
import { bareHeaderOptions } from '@/lib/navigation'
import { colors, spacing } from '@/theme'

/**
 * Gabarit des écrans d'authentification : fond blanc, bouton retour natif,
 * grand titre, contenu défilant et actions collées en bas (au-dessus du clavier).
 */
export function AuthScaffold({
  title,
  subtitle,
  eyebrow,
  progress,
  children,
  footer,
  gestureEnabled = true,
}: {
  title: string
  subtitle?: string
  eyebrow?: string
  /** Progression d'un parcours en plusieurs étapes (0 à 1). */
  progress?: number
  children: React.ReactNode
  footer?: React.ReactNode
  /** Désactive le glissement retour natif (le retour est alors géré étape par étape). */
  gestureEnabled?: boolean
}) {
  const insets = useSafeAreaInsets()
  useStatusBar('dark')

  const bar = useAnimatedStyle(() => ({ width: withTiming(`${Math.round((progress ?? 0) * 100)}%`, { duration: 300 }) }))

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ ...bareHeaderOptions, gestureEnabled }} />
      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.content, { paddingTop: insets.top + 60 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {progress !== undefined ? (
            <View style={styles.track} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}>
              <Animated.View style={[styles.bar, bar]} />
            </View>
          ) : null}
          <View style={styles.heading}>
            {eyebrow ? (
              <Text variant="footnote" style={styles.eyebrow}>
                {eyebrow}
              </Text>
            ) : null}
            <Text variant="largeTitle" accessibilityRole="header">
              {title}
            </Text>
            {subtitle ? <Text variant="subhead">{subtitle}</Text> : null}
          </View>
          <View style={styles.body}>{children}</View>
        </ScrollView>
        {footer ? (
          <StickyFooter style={styles.footer}>{footer}</StickyFooter>
        ) : null}
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  flex: { flex: 1 },
  content: { paddingHorizontal: spacing.xxl, paddingBottom: spacing.xxl, gap: spacing.xxl },
  track: { height: 4, borderRadius: 2, backgroundColor: colors.fill, overflow: 'hidden' },
  bar: { height: 4, borderRadius: 2, backgroundColor: colors.gold },
  heading: { gap: 8 },
  eyebrow: { color: colors.goldDeep, fontFamily: 'Inter_600SemiBold' },
  body: { gap: spacing.lg },
  footer: { backgroundColor: colors.surface, paddingHorizontal: spacing.xxl },
})
