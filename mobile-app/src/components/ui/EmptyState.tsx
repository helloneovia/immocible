import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native'
import type { LucideIcon } from 'lucide-react-native'
import { Button } from './Button'
import { Text } from './Text'
import { colors, spacing } from '@/theme'

/** État vide : une invitation à agir, pas un simple constat. */
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
    <View style={[styles.root, style]}>
      <View style={styles.rings}>
        <View style={styles.ringOuter}>
          <View style={styles.ringInner}>
            <Icon size={28} color={colors.navy} strokeWidth={2} />
          </View>
        </View>
      </View>
      <Text variant="title3" center>
        {title}
      </Text>
      {message ? (
        <Text variant="subhead" center style={styles.message}>
          {message}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button title={actionLabel} onPress={onAction} fullWidth={false} style={styles.action} />
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', gap: 10, paddingHorizontal: spacing.xxl * 1.5, paddingVertical: 32 },
  rings: { marginBottom: 8 },
  ringOuter: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 1.5,
    borderColor: colors.separator,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.goldSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: { maxWidth: 320 },
  action: { marginTop: 10, alignSelf: 'center' },
})
