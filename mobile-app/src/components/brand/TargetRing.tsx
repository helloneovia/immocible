import { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import Svg, { Circle, G } from 'react-native-svg'
import Animated, { useAnimatedProps, useReducedMotion, useSharedValue, withDelay, withTiming } from 'react-native-reanimated'
import { Text } from '@/components/ui/Text'
import { colors, fonts } from '@/theme'

const AnimatedCircle = Animated.createAnimatedComponent(Circle)

export interface RingValue {
  label: string
  /** Progression entre 0 et 1. */
  value: number
}

function Arc({
  radius,
  stroke,
  value,
  color,
  track,
  center,
  delay,
}: {
  radius: number
  stroke: number
  value: number
  color: string
  track: string
  center: number
  delay: number
}) {
  const reduceMotion = useReducedMotion()
  const circumference = 2 * Math.PI * radius
  const progress = useSharedValue(reduceMotion ? value : 0)

  useEffect(() => {
    progress.value = reduceMotion ? value : withDelay(delay, withTiming(value, { duration: 900 }))
  }, [value, delay, progress, reduceMotion])

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - Math.min(1, Math.max(0, progress.value))),
    // Sur Android, un tiret de longueur nulle laisse encore un trait visible : on masque l'arc vide.
    strokeOpacity: progress.value > 0.001 ? 1 : 0,
  }))

  return (
    <>
      <Circle cx={center} cy={center} r={radius} stroke={track} strokeWidth={stroke} fill="none" />
      <AnimatedCircle
        cx={center}
        cy={center}
        r={radius}
        stroke={color}
        strokeWidth={stroke}
        // À 0 %, un bout arrondi dessinerait quand même un point sur l'anneau.
        strokeLinecap={value > 0 ? 'round' : 'butt'}
        fill="none"
        strokeDasharray={`${circumference} ${circumference}`}
        animatedProps={animatedProps}
      />
    </>
  )
}

/**
 * Signature visuelle d'IMMOCIBLE : la cible du logo devient la jauge du projet.
 * Trois anneaux concentriques (le bien, le budget, le lieu) se remplissent au fil
 * du questionnaire ; le centre s'allume en or quand le projet est complet.
 */
export function TargetRing({ rings, size = 148, dark = true }: { rings: RingValue[]; size?: number; dark?: boolean }) {
  const stroke = Math.round(size * 0.075)
  const gap = Math.round(size * 0.045)
  const center = size / 2
  const complete = rings.length > 0 && rings.every((r) => r.value >= 1)
  const arcColors = dark ? [colors.gold, colors.goldLight, colors.surface] : [colors.gold, colors.goldDeep, colors.navy]
  const track = dark ? 'rgba(255,255,255,0.12)' : colors.fill
  const dot = size * 0.1

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={rings.map((r) => `${r.label} ${Math.round(r.value * 100)} %`).join(', ')}
      style={{ width: size, height: size }}
    >
      <Svg width={size} height={size}>
        <G rotation={-90} origin={`${center}, ${center}`}>
          {rings.map((ring, index) => (
            <Arc
              key={ring.label}
              radius={center - stroke / 2 - index * (stroke + gap)}
              stroke={stroke}
              value={ring.value}
              color={arcColors[index % arcColors.length]}
              track={track}
              center={center}
              delay={index * 140}
            />
          ))}
        </G>
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]} pointerEvents="none">
        <View
          style={{
            width: dot,
            height: dot,
            borderRadius: dot / 2,
            backgroundColor: complete ? colors.gold : 'transparent',
            borderWidth: complete ? 0 : 2,
            borderColor: dark ? 'rgba(255,255,255,0.35)' : colors.slate300,
          }}
        />
      </View>
    </View>
  )
}

/** Petite jauge circulaire avec pourcentage (complétude d'un dossier acquéreur). */
export function ScoreRing({ value, size = 46, label }: { value: number; size?: number; label?: string }) {
  const stroke = 4
  const r = (size - stroke) / 2
  const circumference = 2 * Math.PI * r
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100)
  const color = pct >= 75 ? colors.success : pct >= 40 ? colors.gold : colors.text3

  return (
    <View
      accessible
      accessibilityLabel={`${label ?? 'Dossier'} complet à ${pct} %`}
      style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}
    >
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <G rotation={-90} origin={`${size / 2}, ${size / 2}`}>
          <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.fill} strokeWidth={stroke} fill="none" />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={circumference * (1 - pct / 100)}
          />
        </G>
      </Svg>
      <Text style={[styles.score, { fontSize: size * 0.26 }]}>{pct}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  score: { fontFamily: fonts.bold, color: colors.ink },
})
