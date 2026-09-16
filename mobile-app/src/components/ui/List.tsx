import { Children, cloneElement, isValidElement, type ReactElement } from 'react'
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native'
import { ChevronRight, type LucideIcon } from 'lucide-react-native'
import * as Haptics from 'expo-haptics'
import { Text } from './Text'
import { colors, fonts, radius, spacing } from '@/theme'

/**
 * Section de liste « groupée » (réglages iOS / Material list) : un titre discret,
 * des lignes dans une surface arrondie, des séparateurs alignés sur le texte.
 */
export function ListSection({
  title,
  action,
  footer,
  children,
  style,
}: {
  title?: string
  action?: { label: string; onPress: () => void }
  footer?: string
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
}) {
  const rows = Children.toArray(children).filter(isValidElement) as ReactElement<RowProps>[]
  return (
    <View style={[styles.section, style]}>
      {title || action ? (
        <View style={styles.header}>
          {title ? (
            <Text variant="footnote" style={styles.headerText} accessibilityRole="header">
              {title}
            </Text>
          ) : (
            <View />
          )}
          {action ? (
            <Pressable accessibilityRole="button" hitSlop={10} onPress={action.onPress}>
              <Text style={styles.action}>{action.label}</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
      <View style={styles.group}>
        {rows.map((row, index) => cloneElement(row, { key: row.key ?? index, isLast: index === rows.length - 1 }))}
      </View>
      {footer ? (
        <Text variant="footnote" style={styles.footer}>
          {footer}
        </Text>
      ) : null}
    </View>
  )
}

interface RowProps {
  title: string
  subtitle?: string
  value?: string
  icon?: LucideIcon
  iconColor?: string
  iconBackground?: string
  onPress?: () => void
  destructive?: boolean
  badge?: number | string
  right?: React.ReactNode
  left?: React.ReactNode
  chevron?: boolean
  multiline?: boolean
  accessibilityLabel?: string
  /** Géré par ListSection. */
  isLast?: boolean
}

export function ListRow({
  title,
  subtitle,
  value,
  icon: Icon,
  iconColor = colors.surface,
  iconBackground = colors.navy,
  onPress,
  destructive,
  badge,
  right,
  left,
  chevron,
  multiline,
  accessibilityLabel,
  isLast,
}: RowProps) {
  const hasLeading = !!Icon || !!left
  const showChevron = chevron ?? (!!onPress && !destructive)

  const content = (
    <>
      {Icon ? (
        <View style={[styles.iconTile, { backgroundColor: destructive ? colors.dangerSoft : iconBackground }]}>
          <Icon size={17} color={destructive ? colors.danger : iconColor} strokeWidth={2.2} />
        </View>
      ) : (
        left
      )}
      <View style={[styles.rowBody, !isLast ? [styles.separator, { marginLeft: 0 }] : null]}>
        <View style={styles.texts}>
          <Text
            numberOfLines={multiline ? undefined : 1}
            style={[styles.title, destructive ? { color: colors.danger } : null]}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text variant="footnote" numberOfLines={multiline ? undefined : 2}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {value ? (
          <Text numberOfLines={1} style={styles.value}>
            {value}
          </Text>
        ) : null}
        {badge !== undefined && badge !== 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ) : null}
        {right}
        {showChevron ? <ChevronRight size={18} color={colors.slate300} /> : null}
      </View>
    </>
  )

  if (!onPress) {
    return <View style={[styles.row, hasLeading ? styles.rowWithIcon : null]}>{content}</View>
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? [title, value, subtitle].filter(Boolean).join(', ')}
      onPress={() => {
        Haptics.selectionAsync().catch(() => {})
        onPress()
      }}
      style={({ pressed }) => [styles.row, hasLeading ? styles.rowWithIcon : null, pressed ? styles.pressed : null]}
    >
      {content}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  section: { gap: 6 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  headerText: { fontFamily: fonts.semibold, color: colors.text3 },
  action: { fontFamily: fonts.semibold, fontSize: 14, color: colors.goldDeep },
  group: { backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden' },
  footer: { paddingHorizontal: spacing.lg, color: colors.text3 },
  row: { flexDirection: 'row', alignItems: 'center', paddingLeft: spacing.lg, minHeight: 50 },
  rowWithIcon: { gap: 12 },
  pressed: { backgroundColor: colors.slate50 },
  iconTile: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  rowBody: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingRight: spacing.lg,
    minHeight: 50,
  },
  separator: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.separator },
  texts: { flex: 1, gap: 2 },
  title: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 21, color: colors.ink },
  value: { fontFamily: fonts.regular, fontSize: 16, color: colors.text3, maxWidth: '55%', textAlign: 'right' },
  badge: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: 11,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: colors.surface, fontFamily: fonts.bold, fontSize: 12 },
})
