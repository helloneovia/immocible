import { forwardRef, useState } from 'react'
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native'
import { Eye, EyeOff, type LucideIcon } from 'lucide-react-native'
import { Text } from './Text'
import { colors, fonts, radius } from '@/theme'

interface Props extends TextInputProps {
  label?: string
  error?: string | null
  hint?: string
  icon?: LucideIcon
  secure?: boolean
  rightSlot?: React.ReactNode
  large?: boolean
  /** `surface` : champ blanc posé sur le fond gris groupé. */
  tone?: 'filled' | 'surface'
}

export const TextField = forwardRef<TextInput, Props>(function TextField(
  { label, error, hint, icon: Icon, secure, rightSlot, large, tone = 'filled', style, multiline, editable = true, ...props },
  ref,
) {
  const [focused, setFocused] = useState(false)
  const [hidden, setHidden] = useState(true)

  const borderColor = error ? colors.danger : focused ? colors.navy : 'transparent'
  const backgroundColor = tone === 'surface' ? colors.surface : colors.fill

  return (
    <View style={styles.wrapper}>
      {label ? <Text variant="label">{label}</Text> : null}
      <View
        style={[
          styles.field,
          { borderColor, backgroundColor },
          multiline ? styles.multiline : null,
          !editable ? styles.readOnly : null,
        ]}
      >
        {Icon ? <Icon size={19} color={focused ? colors.navy : colors.text3} /> : null}
        <TextInput
          ref={ref}
          {...props}
          editable={editable}
          multiline={multiline}
          secureTextEntry={secure ? hidden : false}
          placeholderTextColor={colors.text3}
          selectionColor={colors.gold}
          cursorColor={colors.navy}
          onFocus={(e) => {
            setFocused(true)
            props.onFocus?.(e)
          }}
          onBlur={(e) => {
            setFocused(false)
            props.onBlur?.(e)
          }}
          style={[styles.input, large ? styles.large : null, multiline ? styles.inputMultiline : null, style]}
        />
        {secure ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Afficher le mot de passe' : 'Masquer le mot de passe'}
            hitSlop={10}
            onPress={() => setHidden((h) => !h)}
          >
            {hidden ? <Eye size={19} color={colors.text3} /> : <EyeOff size={19} color={colors.text3} />}
          </Pressable>
        ) : null}
        {rightSlot}
      </View>
      {error ? (
        <Text variant="footnote" color={colors.danger}>
          {error}
        </Text>
      ) : hint ? (
        <Text variant="footnote" color={colors.text3}>
          {hint}
        </Text>
      ) : null}
    </View>
  )
})

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  field: {
    minHeight: 54,
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  multiline: { alignItems: 'flex-start', paddingVertical: 12 },
  readOnly: { opacity: 0.6 },
  input: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 17,
    color: colors.ink,
    paddingVertical: 14,
  },
  inputMultiline: { minHeight: 110, textAlignVertical: 'top', paddingVertical: 2 },
  large: { fontFamily: fonts.semibold, fontSize: 26, letterSpacing: 8, textAlign: 'center' },
})
