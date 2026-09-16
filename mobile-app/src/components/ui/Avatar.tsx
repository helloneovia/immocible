import { StyleSheet, View } from 'react-native'
import { Text } from './Text'
import { initial } from '@/lib/format'
import { colors, fonts } from '@/theme'

export function Avatar({ name, size = 44, dark = true }: { name?: string | null; size?: number; dark?: boolean }) {
  return (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: dark ? colors.ink : colors.slate200 },
      ]}
    >
      <Text style={{ fontFamily: fonts.bold, fontSize: size * 0.4, color: dark ? colors.amber400 : colors.slate600 }}>
        {initial(name)}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  avatar: { alignItems: 'center', justifyContent: 'center' },
})
