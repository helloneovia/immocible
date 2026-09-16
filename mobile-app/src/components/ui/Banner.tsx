import { StyleSheet, View } from 'react-native'
import { AlertCircle, CheckCircle2, Info } from 'lucide-react-native'
import { Text } from './Text'
import { colors, radius } from '@/theme'

type Tone = 'error' | 'success' | 'info'

const tones = {
  error: { bg: colors.red50, border: colors.red200, fg: colors.red600, Icon: AlertCircle },
  success: { bg: colors.emerald50, border: '#A7F3D0', fg: colors.emerald700, Icon: CheckCircle2 },
  info: { bg: colors.amber50, border: colors.amber100, fg: colors.slate700, Icon: Info },
}

export function Banner({ tone = 'error', message }: { tone?: Tone; message?: string | null }) {
  if (!message) return null
  const t = tones[tone]
  return (
    <View
      accessibilityRole={tone === 'error' ? 'alert' : undefined}
      style={[styles.banner, { backgroundColor: t.bg, borderColor: t.border }]}
    >
      <t.Icon size={18} color={t.fg} />
      <Text variant="body" color={t.fg} style={styles.text}>
        {message}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  text: { flex: 1, fontSize: 14, lineHeight: 20 },
})
