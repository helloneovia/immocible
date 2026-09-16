import { useRef, useState } from 'react'
import { Pressable, StyleSheet, TextInput, View } from 'react-native'
import { Text } from './Text'
import { colors, fonts, radius } from '@/theme'

/** Code à 6 chiffres affiché en cases, saisi via un champ natif invisible (autofill SMS/e-mail compris). */
export function OtpInput({
  value,
  onChange,
  onComplete,
  length = 6,
  autoFocus = true,
}: {
  value: string
  onChange: (value: string) => void
  onComplete?: (value: string) => void
  length?: number
  autoFocus?: boolean
}) {
  const inputRef = useRef<TextInput>(null)
  const [focused, setFocused] = useState(autoFocus)

  return (
    <Pressable
      accessibilityRole="none"
      onPress={() => inputRef.current?.focus()}
      style={styles.row}
    >
      {Array.from({ length }, (_, i) => {
        const char = value[i]
        const active = focused && (i === value.length || (i === length - 1 && value.length === length))
        return (
          <View key={i} style={[styles.box, char ? styles.boxFilled : null, active ? styles.boxActive : null]}>
            <Text style={styles.digit}>{char ?? ''}</Text>
          </View>
        )
      })}
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(text) => {
          const digits = text.replace(/\D/g, '').slice(0, length)
          onChange(digits)
          if (digits.length === length) onComplete?.(digits)
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        maxLength={length}
        autoFocus={autoFocus}
        caretHidden
        accessibilityLabel="Code de vérification à 6 chiffres"
        style={styles.hidden}
      />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  box: {
    flex: 1,
    aspectRatio: 0.82,
    maxHeight: 64,
    borderRadius: radius.md,
    backgroundColor: colors.fill,
    borderWidth: 1.5,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxFilled: { backgroundColor: colors.surface, borderColor: colors.separator },
  boxActive: { borderColor: colors.navy, backgroundColor: colors.surface },
  digit: { fontFamily: fonts.semibold, fontSize: 26, color: colors.ink },
  hidden: { position: 'absolute', width: 1, height: 1, opacity: 0 },
})
