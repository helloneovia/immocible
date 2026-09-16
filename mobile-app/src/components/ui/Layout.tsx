import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { ChevronLeft, type LucideIcon } from 'lucide-react-native'
import { Text } from './Text'
import { Button } from './Button'
import { colors, fonts, radius, spacing } from '@/theme'

/** En-tête d'écran empilé : retour + titre centré + action optionnelle. */
export function ScreenHeader({
  title,
  onBack,
  right,
  dark,
}: {
  title?: string
  onBack?: () => void
  right?: React.ReactNode
  dark?: boolean
}) {
  const insets = useSafeAreaInsets()
  const fg = dark ? colors.white : colors.ink
  return (
    <View
      style={[
        styles.header,
        { paddingTop: insets.top + 6, backgroundColor: dark ? colors.ink : colors.background },
        dark ? null : styles.headerBorder,
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Retour"
        hitSlop={10}
        onPress={() => (onBack ? onBack() : router.canGoBack() ? router.back() : router.replace('/'))}
        style={[styles.headerButton, { backgroundColor: dark ? 'rgba(255,255,255,0.1)' : colors.white }]}
      >
        <ChevronLeft size={22} color={fg} />
      </Pressable>
      <Text numberOfLines={1} style={[styles.headerTitle, { color: fg }]}>
        {title}
      </Text>
      <View style={styles.headerRight}>{right}</View>
    </View>
  )
}

/** Titre de page des onglets (équivalent des gros titres Playfair du web). */
export function LargeTitle({ title, subtitle, right }: { title: string; subtitle?: string; right?: React.ReactNode }) {
  const insets = useSafeAreaInsets()
  return (
    <View style={[styles.largeTitle, { paddingTop: insets.top + 12 }]}>
      <View style={styles.flex}>
        <Text variant="display" accessibilityRole="header">
          {title}
        </Text>
        {subtitle ? (
          <Text variant="bodyLight" style={styles.subtitle}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right}
    </View>
  )
}

export function LoadingView({ label = 'Chargement...' }: { label?: string }) {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={colors.ink} />
      <Text variant="caption" style={{ marginTop: 12 }}>
        {label}
      </Text>
    </View>
  )
}

export function EmptyState({
  icon: Icon,
  title,
  message,
  actionLabel,
  onAction,
  style,
}: {
  icon: LucideIcon
  title: string
  message?: string
  actionLabel?: string
  onAction?: () => void
  style?: StyleProp<ViewStyle>
}) {
  return (
    <View style={[styles.empty, style]}>
      <View style={styles.emptyIcon}>
        <Icon size={34} color={colors.amber500} />
      </View>
      <Text variant="title" center style={{ fontSize: 20 }}>
        {title}
      </Text>
      {message ? (
        <Text variant="bodyLight" center>
          {message}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button title={actionLabel} onPress={onAction} fullWidth={false} style={{ marginTop: 8, alignSelf: 'center' }} />
      ) : null}
    </View>
  )
}

export function ProgressBar({ value, dark }: { value: number; dark?: boolean }) {
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(value) }}
      style={[styles.track, { backgroundColor: dark ? 'rgba(255,255,255,0.12)' : colors.slate100 }]}
    >
      <View style={[styles.fill, { width: `${Math.min(100, Math.max(0, value))}%` }]} />
    </View>
  )
}

/** Indicateur d'étapes des inscriptions (1 — 2 — 3). */
export function Stepper({ steps, current }: { steps: number; current: number }) {
  return (
    <View style={styles.stepper} accessibilityLabel={`Étape ${current} sur ${steps}`}>
      {Array.from({ length: steps }, (_, i) => i + 1).map((s) => (
        <View key={s} style={styles.stepRow}>
          <View style={[styles.stepDot, current >= s ? styles.stepDotActive : null]}>
            <Text style={[styles.stepText, { color: current >= s ? colors.white : 'rgba(255,255,255,0.6)' }]}>
              {current > s ? '✓' : s}
            </Text>
          </View>
          {s < steps ? <View style={[styles.stepLine, current > s ? { backgroundColor: colors.amber500 } : null]} /> : null}
        </View>
      ))}
    </View>
  )
}

export function OrDivider() {
  return (
    <View style={styles.divider}>
      <View style={styles.dividerLine} />
      <Text variant="overline">Ou</Text>
      <View style={styles.dividerLine} />
    </View>
  )
}

export function Section({ title, children, style }: { title?: string; children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.section, style]}>
      {title ? <Text variant="overline">{title}</Text> : null}
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: 10,
    gap: 10,
  },
  headerBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.slate200 },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { flex: 1, textAlign: 'center', fontFamily: fonts.semibold, fontSize: 17 },
  headerRight: { minWidth: 40, alignItems: 'flex-end' },
  largeTitle: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.lg,
    gap: 12,
  },
  subtitle: { marginTop: 4 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  empty: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 36,
    paddingHorizontal: 24,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.slate200,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.slate100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  track: { height: 8, borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4, backgroundColor: colors.amber400 },
  stepper: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  stepRow: { flexDirection: 'row', alignItems: 'center' },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: { backgroundColor: colors.amber500 },
  stepText: { fontFamily: fonts.bold, fontSize: 14 },
  stepLine: { width: 32, height: 2, marginHorizontal: 8, backgroundColor: 'rgba(255,255,255,0.2)' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 4 },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: colors.slate300 },
  section: { gap: 12 },
})
