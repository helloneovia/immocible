import { useState } from 'react'
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Image } from 'expo-image'
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated'
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg'
import { Logo } from '@/components/brand/Logo'
import { PHOTOS } from '@/components/brand/AuthBackground'
import { RoleSheet } from '@/components/RoleSheet'
import { Button } from '@/components/ui/Button'
import { Text } from '@/components/ui/Text'
import { useSettings } from '@/contexts/SettingsContext'
import { LOCALES, t, useI18n } from '@/i18n'
import { capitalize } from '@/lib/labels'
import { useStatusBar } from '@/lib/hooks'
import { openLegal } from '@/lib/links'
import { colors, fonts, spacing } from '@/theme'

interface Slide {
  key: string
  photo: string
  title: string
  highlight?: string
  body: string
}

function Dot({ index, scrollX, width }: { index: number; scrollX: SharedValue<number>; width: number }) {
  const style = useAnimatedStyle(() => {
    const progress = interpolate(scrollX.value / width, [index - 1, index, index + 1], [0, 1, 0], 'clamp')
    return {
      width: 8 + progress * 18,
      backgroundColor: progress > 0.5 ? colors.gold : 'rgba(255,255,255,0.45)',
    }
  })
  return <Animated.View style={[styles.dot, style]} />
}

/** Accueil : pages plein écran à faire défiler, puis création de compte ou connexion. */
export default function OnboardingScreen() {
  const settings = useSettings()
  const { locale, setLocale } = useI18n()
  const insets = useSafeAreaInsets()
  const { width, height } = useWindowDimensions()
  const [roleOpen, setRoleOpen] = useState(false)
  const scrollX = useSharedValue(0)
  useStatusBar('light')

  const slides: Slide[] = [
    {
      key: 'buyer',
      photo: PHOTOS.home,
      title: settings.text_home_hero_title_1,
      highlight: settings.text_home_hero_title_highlight,
      body: `${capitalize(settings.text_home_hero_title_2 || '')}. ${t('auth.onboarding.buyerBody')}`,
    },
    {
      key: 'offmarket',
      photo: PHOTOS.cta,
      title: t('auth.onboarding.offmarketTitle'),
      highlight: t('auth.onboarding.offmarketHighlight'),
      body: t('auth.onboarding.offmarketBody'),
    },
    {
      key: 'agency',
      photo: PHOTOS.agence,
      title: t('auth.onboarding.agencyTitle'),
      highlight: t('auth.onboarding.agencyHighlight'),
      body: t('auth.onboarding.agencyBody'),
    },
  ]

  // Bascule vers l'autre langue (le français reste la langue par défaut).
  const nextLocale = LOCALES.find((item) => item.value !== locale) ?? LOCALES[0]

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x
  })

  return (
    <View style={styles.root}>
      <Animated.FlatList
        data={slides}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <View style={{ width, height }}>
            <Image source={{ uri: item.photo }} style={StyleSheet.absoluteFill} contentFit="cover" transition={400} />
            <Svg style={StyleSheet.absoluteFill} width={width} height={height}>
              <Defs>
                <LinearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={colors.navyDeep} stopOpacity="0.55" />
                  <Stop offset="0.35" stopColor={colors.navyDeep} stopOpacity="0.1" />
                  <Stop offset="0.62" stopColor={colors.navyDeep} stopOpacity="0.75" />
                  <Stop offset="1" stopColor={colors.navyDeep} stopOpacity="0.98" />
                </LinearGradient>
              </Defs>
              <Rect x="0" y="0" width={width} height={height} fill="url(#shade)" />
            </Svg>
            <View style={[styles.slideText, { bottom: insets.bottom + 248 }]}>
              <Text variant="serifDisplay" accessibilityRole="header">
                {item.title}
                {item.highlight ? (
                  <Text variant="serifDisplay" style={{ color: colors.gold }}>
                    {'\n'}
                    {item.highlight}
                  </Text>
                ) : null}
              </Text>
              <Text style={styles.body}>{item.body}</Text>
            </View>
          </View>
        )}
      />

      <View style={[styles.top, { paddingTop: insets.top + 8 }]} pointerEvents="none">
        <Logo size={34} color={colors.surface} />
      </View>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.dots} accessibilityElementsHidden>
          {slides.map((slide, index) => (
            <Dot key={slide.key} index={index} scrollX={scrollX} width={width} />
          ))}
        </View>
        <Button title={t('auth.onboarding.createAccount')} variant="accent" size="lg" onPress={() => setRoleOpen(true)} />
        <Button title={t('auth.onboarding.haveAccount')} variant="glass" size="lg" onPress={() => router.push('/connexion')} />
        <Text style={styles.legal}>
          {t('auth.onboarding.legalPrefix')}{' '}
          <Text style={styles.legalLink} onPress={() => openLegal('cgu')}>
            {t('auth.onboarding.legalTerms')}
          </Text>{' '}
          {t('auth.onboarding.legalAnd')}{' '}
          <Text style={styles.legalLink} onPress={() => openLegal('confidentialite')}>
            {t('auth.onboarding.legalPrivacy')}
          </Text>
          {t('auth.onboarding.legalSuffix')}
        </Text>
      </View>

      <View style={[styles.topActions, { top: insets.top + 12 }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={nextLocale.label}
          onPress={() => setLocale(nextLocale.value)}
          style={styles.blog}
        >
          <Text style={styles.blogText}>{nextLocale.value.toUpperCase()}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={t('auth.onboarding.readBlog')}
          onPress={() => router.push('/blog')}
          style={styles.blog}
        >
          <Text style={styles.blogText}>{t('auth.onboarding.blog')}</Text>
        </Pressable>
      </View>

      <RoleSheet visible={roleOpen} onClose={() => setRoleOpen(false)} />
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.navyDeep },
  top: { position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: spacing.xxl },
  topActions: { position: 'absolute', right: spacing.xxl, flexDirection: 'row', gap: 8 },
  blog: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  blogText: { color: colors.surface, fontFamily: fonts.semibold, fontSize: 14 },
  slideText: { position: 'absolute', left: spacing.xxl, right: spacing.xxl, gap: 14 },
  body: { fontFamily: fonts.regular, fontSize: 17, lineHeight: 24, color: 'rgba(255,255,255,0.82)' },
  bottom: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: spacing.xxl, gap: 12 },
  dots: { flexDirection: 'row', gap: 6, marginBottom: 10 },
  dot: { height: 8, borderRadius: 4 },
  legal: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 17,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginTop: 4,
  },
  legalLink: { color: 'rgba(255,255,255,0.9)', textDecorationLine: 'underline' },
})
