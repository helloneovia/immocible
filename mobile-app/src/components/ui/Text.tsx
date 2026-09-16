import { StyleSheet, Text as RNText, type TextProps } from 'react-native'
import { colors, fonts } from '@/theme'

// Échelle typographique calquée sur les tailles natives (iOS Dynamic Type / Material).
type Variant =
  | 'largeTitle'
  | 'title1'
  | 'title2'
  | 'title3'
  | 'headline'
  | 'body'
  | 'callout'
  | 'subhead'
  | 'footnote'
  | 'caption'
  | 'serifDisplay'
  | 'serifTitle'
  // Alias historiques
  | 'display'
  | 'title'
  | 'heading'
  | 'subheading'
  | 'bodyLight'
  | 'label'
  | 'overline'

interface Props extends TextProps {
  variant?: Variant
  color?: string
  center?: boolean
}

export function Text({ variant = 'body', color, center, style, ...props }: Props) {
  // Une taille surchargée sans interligne hériterait de celui de la variante et
  // tronquerait le haut des glyphes (visible sur Android) : on le recalcule.
  const override = StyleSheet.flatten(style)
  const lineHeight =
    override?.fontSize && !override.lineHeight ? { lineHeight: Math.round(override.fontSize * 1.25) } : null

  return (
    <RNText
      {...props}
      style={[styles[variant], color ? { color } : null, center ? styles.center : null, style, lineHeight]}
    />
  )
}

const base = { color: colors.ink }

const styles = StyleSheet.create({
  largeTitle: { ...base, fontFamily: fonts.bold, fontSize: 34, lineHeight: 41, letterSpacing: -0.6 },
  title1: { ...base, fontFamily: fonts.bold, fontSize: 28, lineHeight: 34, letterSpacing: -0.5 },
  title2: { ...base, fontFamily: fonts.bold, fontSize: 22, lineHeight: 28, letterSpacing: -0.3 },
  title3: { ...base, fontFamily: fonts.semibold, fontSize: 20, lineHeight: 25, letterSpacing: -0.2 },
  headline: { ...base, fontFamily: fonts.semibold, fontSize: 17, lineHeight: 22, letterSpacing: -0.2 },
  body: { ...base, fontFamily: fonts.regular, fontSize: 16, lineHeight: 22 },
  callout: { ...base, fontFamily: fonts.regular, fontSize: 16, lineHeight: 21 },
  subhead: { ...base, fontFamily: fonts.regular, fontSize: 15, lineHeight: 20, color: colors.text2 },
  footnote: { ...base, fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, color: colors.text2 },
  caption: { ...base, fontFamily: fonts.medium, fontSize: 12, lineHeight: 16, color: colors.text3 },
  serifDisplay: { fontFamily: fonts.serif, fontSize: 36, lineHeight: 42, color: colors.surface, letterSpacing: -0.4 },
  serifTitle: { fontFamily: fonts.serif, fontSize: 26, lineHeight: 32, color: colors.surface },
  // Alias historiques
  display: { ...base, fontFamily: fonts.bold, fontSize: 28, lineHeight: 34, letterSpacing: -0.5 },
  title: { ...base, fontFamily: fonts.bold, fontSize: 22, lineHeight: 28, letterSpacing: -0.3 },
  heading: { ...base, fontFamily: fonts.semibold, fontSize: 17, lineHeight: 22 },
  subheading: { ...base, fontFamily: fonts.semibold, fontSize: 16, lineHeight: 21 },
  bodyLight: { ...base, fontFamily: fonts.regular, fontSize: 15, lineHeight: 21, color: colors.text2 },
  label: { ...base, fontFamily: fonts.medium, fontSize: 13, lineHeight: 18, color: colors.text2 },
  overline: { ...base, fontFamily: fonts.semibold, fontSize: 13, lineHeight: 18, color: colors.text3 },
  center: { textAlign: 'center' },
})
