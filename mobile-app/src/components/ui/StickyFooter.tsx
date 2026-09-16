import { Keyboard, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native'
import { useEffect, useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, spacing } from '@/theme'

/** Zone d'actions collée en bas de l'écran, au-dessus de l'indicateur d'accueil (et du clavier). */
export function StickyFooter({
  children,
  style,
  transparent,
  inTabs,
}: {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
  transparent?: boolean
  /** Écran dans une barre d'onglets : l'inset bas est déjà pris en charge. */
  inTabs?: boolean
}) {
  const insets = useSafeAreaInsets()
  const [keyboard, setKeyboard] = useState(false)

  useEffect(() => {
    const show = Keyboard.addListener('keyboardWillShow', () => setKeyboard(true))
    const showAndroid = Keyboard.addListener('keyboardDidShow', () => setKeyboard(true))
    const hide = Keyboard.addListener('keyboardWillHide', () => setKeyboard(false))
    const hideAndroid = Keyboard.addListener('keyboardDidHide', () => setKeyboard(false))
    return () => {
      show.remove()
      showAndroid.remove()
      hide.remove()
      hideAndroid.remove()
    }
  }, [])

  const bottom = keyboard || inTabs ? spacing.md : Math.max(insets.bottom, spacing.lg)

  return (
    <View style={[styles.footer, transparent ? styles.transparent : null, { paddingBottom: bottom }, style]}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  footer: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.md,
    gap: 10,
    backgroundColor: colors.bg,
  },
  transparent: { backgroundColor: 'transparent' },
})
