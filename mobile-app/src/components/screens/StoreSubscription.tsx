import { useCallback, useEffect, useState } from 'react'
import { Alert, Platform, Pressable, StyleSheet, View } from 'react-native'
import { Check } from 'lucide-react-native'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { Text } from '@/components/ui/Text'
import { useSettings } from '@/contexts/SettingsContext'
import { t } from '@/i18n'
import { errorMessage } from '@/lib/api'
import { formatDate } from '@/lib/format'
import {
  buySubscription,
  loadSubscriptionProducts,
  manageSubscriptions,
  PurchaseCancelled,
  restoreSubscription,
  type Plan,
  type StoreProduct,
} from '@/lib/iap'
import { openLegal } from '@/lib/links'
import type { AccountProfile } from '@/lib/types'
import { colors, fonts, radius } from '@/theme'

export function storeName() {
  return Platform.OS === 'ios' ? t('agency.store.appStore') : t('agency.store.googlePlay')
}

/**
 * Abonnement acheté via l'App Store / Google Play (paiements Stripe masqués dans l'app).
 * Les prix viennent du store, dans la devise de l'utilisateur.
 */
export function StoreSubscription({
  profile,
  userId,
  active,
  onChanged,
}: {
  profile: AccountProfile
  userId: string
  active: boolean
  onChanged: () => void
}) {
  const settings = useSettings()
  const store = storeName()
  const [products, setProducts] = useState<Partial<Record<Plan, StoreProduct>> | null>(null)
  const [failed, setFailed] = useState(false)
  const [selected, setSelected] = useState<Plan>(profile.plan === 'monthly' ? 'monthly' : 'yearly')
  const [buying, setBuying] = useState(false)
  const [restoring, setRestoring] = useState(false)

  const load = useCallback(() => {
    setFailed(false)
    setProducts(null)
    loadSubscriptionProducts(settings)
      .then((result) => {
        setProducts(result)
        setFailed(!result.monthly && !result.yearly)
      })
      .catch(() => setFailed(true))
  }, [settings])

  useEffect(() => {
    load()
  }, [load])

  const currentPlan: Plan | null = active && profile.plan ? (profile.plan === 'yearly' ? 'yearly' : 'monthly') : null
  // Abonné à l'annuel : rien à acheter. Abonné au mensuel : seul l'annuel est proposé.
  const offered: Plan[] = currentPlan === 'yearly' ? [] : currentPlan === 'monthly' ? ['yearly'] : ['yearly', 'monthly']
  const choice: Plan = offered.includes(selected) ? selected : offered[0]
  const product = choice ? products?.[choice] : undefined

  const done = (endDate?: string) => {
    onChanged()
    Alert.alert(
      t('agency.store.success'),
      endDate ? t('agency.store.successMessage', { date: formatDate(new Date(endDate)) }) : t('agency.subscription.active'),
    )
  }

  const buy = async () => {
    if (!product) return
    setBuying(true)
    try {
      const result = await buySubscription(settings, userId, product)
      done(result.subscriptionEndDate)
    } catch (err) {
      if (!(err instanceof PurchaseCancelled)) Alert.alert(t('agency.store.purchaseFailed'), errorMessage(err))
    } finally {
      setBuying(false)
    }
  }

  const restore = async () => {
    setRestoring(true)
    try {
      const result = await restoreSubscription(settings)
      if (result) {
        onChanged()
        Alert.alert(
          t('agency.store.restored'),
          result.subscriptionEndDate ? t('agency.store.successMessage', { date: formatDate(new Date(result.subscriptionEndDate)) }) : undefined,
        )
      } else {
        Alert.alert(t('agency.store.restore'), t('agency.store.nothingToRestore', { store }))
      }
    } catch (err) {
      Alert.alert(t('agency.store.purchaseFailed'), errorMessage(err))
    } finally {
      setRestoring(false)
    }
  }

  return (
    <View style={{ gap: 18 }}>
      {offered.length > 0 ? (
        <View style={styles.card}>
          <Text variant="headline">{t('agency.store.choosePlan')}</Text>
          {failed ? (
            <View style={{ gap: 12 }}>
              <Text variant="footnote">{t('agency.store.unavailable', { store })}</Text>
              <Button title={t('agency.store.retry')} variant="secondary" onPress={load} />
            </View>
          ) : !products ? (
            <View style={{ gap: 10 }}>
              <Skeleton height={64} rounded={radius.lg} />
              <Skeleton height={64} rounded={radius.lg} />
            </View>
          ) : (
            <>
              {offered.map((plan) => {
                const item = products[plan]
                if (!item) return null
                const isSelected = plan === choice
                const title = plan === 'yearly' ? t('agency.store.yearly') : t('agency.store.monthly')
                const price = plan === 'yearly' ? t('agency.store.perYear', { price: item.displayPrice }) : t('agency.store.perMonth', { price: item.displayPrice })
                return (
                  <Pressable
                    key={plan}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                    accessibilityLabel={`${title}, ${price}`}
                    onPress={() => setSelected(plan)}
                    style={[styles.option, isSelected ? styles.optionSelected : null]}
                  >
                    <View style={[styles.radio, isSelected ? styles.radioSelected : null]}>{isSelected ? <View style={styles.radioDot} /> : null}</View>
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text variant="headline">{title}</Text>
                      {plan === 'yearly' ? <Text variant="footnote">{t('agency.store.yearlyNote')}</Text> : null}
                    </View>
                    <Text style={styles.price}>{price}</Text>
                  </Pressable>
                )
              })}
              <View style={{ gap: 8 }}>
                {(choice === 'yearly' ? settings.feature_list_yearly : settings.feature_list_monthly).map((feature) => (
                  <View key={feature} style={styles.feature}>
                    <Check size={16} color={colors.success} strokeWidth={2.6} />
                    <Text variant="subhead" style={{ color: colors.ink, flex: 1 }}>
                      {feature}
                    </Text>
                  </View>
                ))}
              </View>
              {product ? (
                <Button
                  title={
                    currentPlan === 'monthly'
                      ? t('agency.store.switchTo', { price: product.displayPrice })
                      : t('agency.store.subscribe', { price: product.displayPrice })
                  }
                  size="lg"
                  variant="accent"
                  loading={buying}
                  onPress={buy}
                />
              ) : null}
            </>
          )}
        </View>
      ) : null}

      <View style={styles.links}>
        <Button title={t('agency.store.restore')} variant="secondary" loading={restoring} onPress={restore} />
        {currentPlan ? (
          <Button title={t('agency.store.manage')} variant="outline" onPress={() => manageSubscriptions(settings, currentPlan).catch(() => {})} />
        ) : null}
      </View>

      {/* Mentions exigées par Apple et Google pour les abonnements à renouvellement automatique. */}
      <Text variant="footnote" color={colors.text3}>
        {t('agency.store.disclosure', { store })}
      </Text>
      <View style={styles.legal}>
        <Text variant="footnote" style={styles.legalLink} accessibilityRole="link" onPress={() => openLegal('cgu')}>
          {t('agency.store.terms')}
        </Text>
        <Text variant="footnote" color={colors.text3}>
          ·
        </Text>
        <Text variant="footnote" style={styles.legalLink} accessibilityRole="link" onPress={() => openLegal('confidentialite')}>
          {t('agency.store.privacy')}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: 18, gap: 14 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.slate200,
  },
  optionSelected: { borderColor: colors.ink, backgroundColor: colors.slate50 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.slate300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: colors.ink },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.ink },
  price: { fontFamily: fonts.bold, fontSize: 16, color: colors.ink },
  feature: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  links: { gap: 10 },
  legal: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  legalLink: { color: colors.ink, textDecorationLine: 'underline' },
})
