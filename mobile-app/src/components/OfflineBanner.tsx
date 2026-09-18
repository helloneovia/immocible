import { StyleSheet, View } from 'react-native'
import { useNetInfo } from '@react-native-community/netinfo'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { WifiOff } from 'lucide-react-native'
import { Text } from '@/components/ui/Text'
import { t } from '@/i18n'
import { colors, fonts } from '@/theme'

export function OfflineBanner() {
  const { isConnected } = useNetInfo()
  const insets = useSafeAreaInsets()
  if (isConnected !== false) return null
  return (
    <View
      accessibilityRole="alert"
      pointerEvents="none"
      style={[styles.banner, { paddingTop: insets.top + 6 }]}
    >
      <WifiOff size={16} color={colors.white} />
      <Text style={styles.text}>{t('common.offline')}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: colors.slate800,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingBottom: 8,
  },
  text: { color: colors.white, fontFamily: fonts.medium, fontSize: 13 },
})
