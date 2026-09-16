import { StyleSheet, View } from 'react-native'
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop } from 'react-native-svg'
import { Text } from '@/components/ui/Text'
import { colors, fonts } from '@/theme'

/** Icône de marque (maison + cible + épingle dorée), tracé identique à components/ui/Logo.tsx. */
export function LogoIcon({ size = 40, color = colors.ink }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none" accessibilityLabel="IMMOCIBLE">
      <Defs>
        <LinearGradient id="immocible-gold" x1="26" y1="24" x2="38" y2="50" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F4D480" />
          <Stop offset="0.55" stopColor="#E0A93B" />
          <Stop offset="1" stopColor="#C8912E" />
        </LinearGradient>
      </Defs>
      <Path
        d="M26 55 L13 55 L13 25 L32 7 L43 17.4 L43 11 L48 11 L48 22.1 L51 25 L51 55 L38 55"
        stroke={color}
        strokeWidth={4}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <Path d="M21 40 A13 13 0 1 1 43 40" stroke={color} strokeWidth={3.4} strokeLinecap="round" />
      <Line x1="32" y1="30" x2="32" y2="48" stroke="url(#immocible-gold)" strokeWidth={4} strokeLinecap="round" />
      <Circle cx="32" cy="28.5" r="5.6" fill="url(#immocible-gold)" />
    </Svg>
  )
}

export function Logo({ size = 40, color = colors.ink, wordmark = true }: { size?: number; color?: string; wordmark?: boolean }) {
  return (
    <View style={styles.row} accessibilityRole="image" accessibilityLabel="IMMOCIBLE">
      <LogoIcon size={size} color={color} />
      {wordmark ? (
        <Text style={[styles.wordmark, { color, fontSize: Math.round(size * 0.48) }]}>IMMOCIBLE</Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  wordmark: { fontFamily: fonts.bold, letterSpacing: 2.5 },
})
