import { useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { Check, ChevronDown } from 'lucide-react-native'
import * as Haptics from 'expo-haptics'
import { BottomSheet } from './BottomSheet'
import { Text } from './Text'
import type { Option } from '@/lib/labels'
import { colors, fonts, radius } from '@/theme'

interface Props {
  label?: string
  placeholder?: string
  value?: string | null
  options: Option[]
  onChange: (value: string) => void
}

/** Remplace le <Select> Radix du web par une feuille de choix native. */
export function SelectField({ label, placeholder = 'Sélectionnez', value, options, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const selected = options.find((o) => o.value === value)

  return (
    <View style={styles.wrapper}>
      {label ? <Text variant="label">{label}</Text> : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label ? `${label} : ${selected?.label ?? placeholder}` : selected?.label ?? placeholder}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [styles.trigger, pressed ? { borderColor: colors.ink } : null]}
      >
        <Text
          numberOfLines={1}
          style={[styles.value, { color: selected ? colors.ink : colors.slate400 }]}
        >
          {selected?.label ?? placeholder}
        </Text>
        <ChevronDown size={18} color={colors.slate400} />
      </Pressable>

      <BottomSheet visible={open} onClose={() => setOpen(false)} title={label ?? placeholder}>
        {options.map((option) => {
          const isSelected = option.value === value
          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              onPress={() => {
                Haptics.selectionAsync().catch(() => {})
                onChange(option.value)
                setOpen(false)
              }}
              style={({ pressed }) => [
                styles.option,
                isSelected ? styles.optionSelected : null,
                pressed ? { opacity: 0.8 } : null,
              ]}
            >
              <Text style={[styles.optionLabel, isSelected ? { fontFamily: fonts.semibold, color: colors.ink } : null]}>
                {option.label}
              </Text>
              {isSelected ? <Check size={20} color={colors.amber600} /> : null}
            </Pressable>
          )
        })}
      </BottomSheet>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  trigger: {
    minHeight: 50,
    borderWidth: 1.5,
    borderColor: colors.slate200,
    backgroundColor: colors.slate50,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  value: { flex: 1, fontFamily: fonts.regular, fontSize: 16 },
  option: {
    minHeight: 54,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.slate200,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionSelected: { borderColor: colors.amber500, backgroundColor: colors.amber50 },
  optionLabel: { flex: 1, fontFamily: fonts.regular, fontSize: 15, color: colors.slate700 },
})
