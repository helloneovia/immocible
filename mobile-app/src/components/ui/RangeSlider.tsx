import { useMemo, useRef, useState } from 'react'
import { PanResponder, StyleSheet, View, type LayoutChangeEvent } from 'react-native'
import * as Haptics from 'expo-haptics'
import { colors } from '@/theme'

const THUMB = 30

/**
 * Curseur à deux poignées sur une liste de paliers (ex. budgets non linéaires).
 * Implémenté avec PanResponder : il capture le geste pour ne pas lutter avec le défilement.
 */
export function RangeSlider({
  steps,
  low,
  high,
  onChange,
  accessibilityLabel,
  formatValue,
}: {
  steps: number[]
  low: number
  high: number
  onChange: (low: number, high: number) => void
  accessibilityLabel: string
  formatValue: (value: number) => string
}) {
  const [width, setWidth] = useState(0)
  const track = Math.max(1, width - THUMB)
  const last = steps.length - 1

  const nearestIndex = (value: number) => {
    let best = 0
    for (let i = 0; i < steps.length; i++) if (Math.abs(steps[i] - value) < Math.abs(steps[best] - value)) best = i
    return best
  }
  const lowIndex = nearestIndex(low)
  const highIndex = Math.max(lowIndex, nearestIndex(high))

  const state = useRef({ lowIndex, highIndex, active: null as 'low' | 'high' | null, startX: 0 })
  state.current.lowIndex = lowIndex
  state.current.highIndex = highIndex

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponderCapture: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (event) => {
          const x = event.nativeEvent.locationX - THUMB / 2
          const lowX = (state.current.lowIndex / last) * track
          const highX = (state.current.highIndex / last) * track
          state.current.active = Math.abs(x - lowX) <= Math.abs(x - highX) ? 'low' : 'high'
          // Poignées superposées : on choisit selon le côté touché.
          if (lowX === highX) state.current.active = x > highX ? 'high' : 'low'
          state.current.startX = state.current.active === 'low' ? lowX : highX
        },
        onPanResponderMove: (_, gesture) => {
          const x = Math.min(track, Math.max(0, state.current.startX + gesture.dx))
          const index = Math.round((x / track) * last)
          const { lowIndex: li, highIndex: hi, active } = state.current
          if (active === 'low' && index !== li && index <= hi) {
            Haptics.selectionAsync().catch(() => {})
            onChange(steps[index], steps[hi])
          } else if (active === 'high' && index !== hi && index >= li) {
            Haptics.selectionAsync().catch(() => {})
            onChange(steps[li], steps[index])
          }
        },
        onPanResponderRelease: () => {
          state.current.active = null
        },
      }),
    [last, track, steps, onChange],
  )

  const lowX = (lowIndex / last) * track
  const highX = (highIndex / last) * track

  return (
    <View
      onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
      style={styles.container}
      {...responder.panHandlers}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ text: `${formatValue(steps[lowIndex])} à ${formatValue(steps[highIndex])}` }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(event) => {
        if (event.nativeEvent.actionName === 'increment' && highIndex < last) onChange(steps[lowIndex], steps[highIndex + 1])
        if (event.nativeEvent.actionName === 'decrement' && highIndex > lowIndex) onChange(steps[lowIndex], steps[highIndex - 1])
      }}
    >
      <View style={styles.track} pointerEvents="none" />
      {width > 0 ? (
        <>
          <View
            pointerEvents="none"
            style={[styles.fill, { left: lowX + THUMB / 2, width: Math.max(0, highX - lowX) }]}
          />
          <View pointerEvents="none" style={[styles.thumb, { left: lowX }]} />
          <View pointerEvents="none" style={[styles.thumb, { left: highX }]} />
        </>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { height: 44, justifyContent: 'center' },
  track: {
    position: 'absolute',
    left: THUMB / 2,
    right: THUMB / 2,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.fill,
  },
  fill: { position: 'absolute', height: 6, borderRadius: 3, backgroundColor: colors.gold },
  thumb: {
    position: 'absolute',
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.navy,
    shadowColor: '#0B1F38',
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
})
