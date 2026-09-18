import { useCallback, useState } from 'react'
import { Alert, KeyboardAvoidingView, ScrollView, StyleSheet, View } from 'react-native'
import { router, Stack, useFocusEffect } from 'expo-router'
import { Check, Crown, Lock, Ticket } from 'lucide-react-native'
import { StoreSubscription, storeName } from '@/components/screens/StoreSubscription'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { Text } from '@/components/ui/Text'
import { TextField } from '@/components/ui/TextField'
import { useAuth } from '@/contexts/AuthContext'
import { useSettings } from '@/contexts/SettingsContext'
import { t } from '@/i18n'
import { api, errorMessage } from '@/lib/api'
import { createSubscriptionCheckout, paymentHref } from '@/lib/checkout'
import { formatDate, formatPlanPrice } from '@/lib/format'
import { useStatusBar } from '@/lib/hooks'
import { storeBillingEnabled } from '@/lib/iap'
import { largeTitleScrollProps, pushedScreenOptions, useTabScreenKeyboardOffset } from '@/lib/navigation'
import type { AccountProfile } from '@/lib/types'
import { colors, fonts, radius, spacing } from '@/theme'

const DAY = 24 * 60 * 60 * 1000

/** Abonnement agence : état de la période, passage à l'annuel, code promo. */
export function SubscriptionScreen() {
  const { refresh, user } = useAuth()
  const settings = useSettings()
  // Apps publiées sur les stores : abonnement via l'App Store / Google Play, sans Stripe ni code promo.
  const storeBilling = storeBillingEnabled(settings)
  const [profile, setProfile] = useState<AccountProfile | null>(null)
  const [coupon, setCoupon] = useState('')
  const [upgrading, setUpgrading] = useState(false)
  const [activating, setActivating] = useState(false)
  const keyboardOffset = useTabScreenKeyboardOffset()
  const [applying, setApplying] = useState(false)
  useStatusBar('dark')

  const load = useCallback(() => {
    api<AccountProfile>('/api/user/profile').then(setProfile).catch(() => {})
  }, [])

  useFocusEffect(
    useCallback(() => {
      load()
    }, [load]),
  )

  const checkout = async (withCoupon: boolean, plan: 'monthly' | 'yearly' = 'yearly') => {
    if (!profile) return
    const renewing = !withCoupon && (plan === 'monthly' || profile.plan === 'yearly')
    const setBusy = withCoupon ? setApplying : renewing ? setActivating : setUpgrading
    setBusy(true)
    try {
      const result = await createSubscriptionCheckout({
        email: profile.email,
        plan,
        nomAgence: profile.nomAgence,
        couponCode: withCoupon ? coupon : undefined,
      })
      if (result.success) {
        Alert.alert(t('agency.subscription.couponApplied'), result.message || t('agency.subscription.active'))
        setCoupon('')
        load()
        refresh()
      } else if (result.clientSecret) {
        router.push(paymentHref(result.clientSecret, 'subscription') as never)
      }
    } catch (err) {
      Alert.alert(withCoupon ? t('agency.subscription.couponRefused') : t('agency.subscription.paymentUnavailable'), errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const end = profile?.subscriptionEndDate ? new Date(profile.subscriptionEndDate) : null
  const start = profile?.subscriptionStartDate ? new Date(profile.subscriptionStartDate) : null
  const active = !!end && end.getTime() > Date.now()
  const yearly = profile?.plan === 'yearly'
  const total = end && start ? Math.max(1, end.getTime() - start.getTime()) : yearly ? 365 * DAY : 30 * DAY
  const remaining = end ? Math.max(0, end.getTime() - Date.now()) : 0
  const daysLeft = Math.ceil(remaining / DAY)

  return (
    <KeyboardAvoidingView style={styles.root} behavior="padding" keyboardVerticalOffset={keyboardOffset}>
      <Stack.Screen options={{ ...pushedScreenOptions, title: t('agency.subscription.title') }} />
      <ScrollView {...largeTitleScrollProps} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {!profile ? (
          <Skeleton height={190} rounded={radius.xxl} />
        ) : (
          <View style={styles.planCard}>
            <View style={styles.planHeader}>
              <Text style={styles.planEyebrow}>{t('agency.subscription.currentPlan')}</Text>
              <View style={[styles.status, active ? styles.statusActive : styles.statusInactive]}>
                <Text style={[styles.statusText, { color: active ? '#4ADE80' : colors.goldLight }]}>{active ? t('agency.subscription.statusActive') : t('agency.subscription.statusInactive')}</Text>
              </View>
            </View>
            <Text style={styles.planName}>{profile.plan ? (yearly ? t('agency.subscription.yearly') : t('agency.subscription.monthly')) : t('agency.subscription.noPlan')}</Text>
            {end ? (
              <>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${Math.round((remaining / total) * 100)}%` }]} />
                </View>
                <Text style={styles.planMeta}>
                  {active
                    ? t(daysLeft > 1 ? 'agency.subscription.daysLeftMany' : 'agency.subscription.daysLeftOne', { days: daysLeft, date: formatDate(end) })
                    : t('agency.subscription.expiredOn', { date: formatDate(end) })}
                </Text>
              </>
            ) : (
              <Text style={styles.planMeta}>{t('agency.subscription.subscribePrompt')}</Text>
            )}
          </View>
        )}

        {/* Offre choisie mais jamais payée, ou expirée : pouvoir la régler telle quelle. */}
        {profile && user && storeBilling ? (
          <StoreSubscription
            profile={profile}
            userId={user.id}
            active={active}
            onChanged={() => {
              load()
              refresh()
            }}
          />
        ) : null}

        {profile && !storeBilling && !active ? (
          <Button
            title={
              yearly
                ? t('agency.subscription.renewYearly', { price: formatPlanPrice(settings.price_yearly) })
                : t('agency.subscription.activateMonthly', { price: formatPlanPrice(settings.price_monthly) })
            }
            icon={Lock}
            size="lg"
            variant="accent"
            loading={activating}
            onPress={() => checkout(false, yearly ? 'yearly' : 'monthly')}
          />
        ) : null}

        {profile && !storeBilling && !yearly ? (
          <View style={styles.upgrade}>
            <View style={styles.upgradeHeader}>
              <View style={styles.crown}>
                <Crown size={20} color={colors.navy} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="headline">{t('agency.subscription.upgradeTitle')}</Text>
                <Text variant="footnote">{t('agency.subscription.upgradeText')}</Text>
              </View>
              <Text style={styles.price}>{t('agency.subscription.price', { price: formatPlanPrice(settings.price_yearly) })}</Text>
            </View>
            <View style={{ gap: 8 }}>
              {settings.feature_list_yearly.map((feature) => (
                <View key={feature} style={styles.feature}>
                  <Check size={16} color={colors.success} strokeWidth={2.6} />
                  <Text variant="subhead" style={{ color: colors.ink, flex: 1 }}>
                    {feature}
                  </Text>
                </View>
              ))}
            </View>
            <Button title={t('agency.subscription.upgradeButton', { price: formatPlanPrice(settings.price_yearly) })} icon={Lock} size="lg" loading={upgrading} onPress={() => checkout(false)} />
          </View>
        ) : null}

        {profile && !storeBilling && !yearly ? (
          <View style={{ gap: 10 }}>
            <Text variant="label">{t('agency.subscription.promoCode')}</Text>
            <View style={styles.couponRow}>
              <View style={{ flex: 1 }}>
                <TextField
                  tone="surface"
                  icon={Ticket}
                  value={coupon}
                  onChangeText={(v) => setCoupon(v.toUpperCase())}
                  placeholder={t('agency.subscription.codePlaceholder')}
                  autoCapitalize="characters"
                  autoCorrect={false}
                />
              </View>
              <Button title={t('agency.subscription.apply')} variant="secondary" fullWidth={false} disabled={!coupon} loading={applying} onPress={() => checkout(true)} />
            </View>
          </View>
        ) : null}

        <Text variant="footnote" center color={colors.text3}>
          {storeBilling ? t('agency.store.footer', { store: storeName() }) : t('agency.subscription.footer')}
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.screen, gap: 22, paddingBottom: 48 },
  planCard: { backgroundColor: colors.navy, borderRadius: radius.xxl, padding: 20, gap: 12 },
  planHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  planEyebrow: { fontFamily: fonts.semibold, fontSize: 13, color: colors.gold },
  status: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  statusActive: { backgroundColor: 'rgba(74, 222, 128, 0.14)' },
  statusInactive: { backgroundColor: 'rgba(224, 169, 59, 0.18)' },
  statusText: { fontFamily: fonts.semibold, fontSize: 12 },
  planName: { fontFamily: fonts.serif, fontSize: 32, lineHeight: 38, color: colors.surface },
  progressTrack: { height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.14)', overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3, backgroundColor: colors.gold },
  planMeta: { fontFamily: fonts.medium, fontSize: 14, color: 'rgba(255,255,255,0.75)' },
  upgrade: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: 18, gap: 16 },
  upgradeHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  crown: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  price: { fontFamily: fonts.bold, fontSize: 20, color: colors.ink },
  feature: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  couponRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
})
