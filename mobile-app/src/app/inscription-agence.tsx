import { useState } from 'react'
import { Alert, Pressable, StyleSheet, View } from 'react-native'
import { router } from 'expo-router'
import { Building2, Check, Crown, Lock, Mail, Ticket } from 'lucide-react-native'
import { AuthScaffold } from '@/components/AuthScaffold'
import { useEmailVerification, useStepBack, VerifiedEmail } from '@/components/SignupSteps'
import { Banner } from '@/components/ui/Banner'
import { Button } from '@/components/ui/Button'
import { OtpInput } from '@/components/ui/OtpInput'
import { Text } from '@/components/ui/Text'
import { TextField } from '@/components/ui/TextField'
import { useAuth } from '@/contexts/AuthContext'
import { useSettings } from '@/contexts/SettingsContext'
import { t } from '@/i18n'
import { api, errorMessage } from '@/lib/api'
import { createSubscriptionCheckout, paymentHref } from '@/lib/checkout'
import { formatPlanPrice } from '@/lib/format'
import { storeBillingEnabled } from '@/lib/iap'
import { colors, fonts, radius } from '@/theme'
import { passwordProblem } from '@/lib/validation'

type Plan = 'monthly' | 'yearly'
const STEPS = 5

function PlanCard({
  selected,
  title,
  price,
  period,
  badge,
  features,
  onPress,
}: {
  selected: boolean
  title: string
  price: number
  period: string
  badge?: string
  features: string[]
  onPress: () => void
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={t('auth.signup.agency.planA11y', { title, price: formatPlanPrice(price), period })}
      onPress={onPress}
      style={[styles.plan, selected ? styles.planSelected : null]}
    >
      <View style={styles.planTop}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={[styles.planTitle, selected ? { color: colors.surface } : null]}>{title}</Text>
          <Text style={[styles.planPrice, selected ? { color: colors.surface } : null]}>
            {formatPlanPrice(price)} €<Text style={[styles.planPeriod, selected ? { color: 'rgba(255,255,255,0.7)' } : null]}> {period}</Text>
          </Text>
        </View>
        {badge ? (
          <View style={styles.planBadge}>
            <Text style={styles.planBadgeText}>{badge}</Text>
          </View>
        ) : null}
        <View style={[styles.radio, selected ? styles.radioOn : null]}>{selected ? <Check size={14} color={colors.navy} strokeWidth={3} /> : null}</View>
      </View>
      <View style={styles.features}>
        {features.map((feature) => (
          <Text key={feature} style={[styles.feature, selected ? { color: 'rgba(255,255,255,0.85)' } : null]}>
            · {feature}
          </Text>
        ))}
      </View>
    </Pressable>
  )
}

export default function InscriptionAgenceScreen() {
  const settings = useSettings()
  const { refresh, setPendingHref } = useAuth()
  // Apps des stores : pas de formule ni de paiement ici, l'abonnement se prend ensuite via le store.
  const storeBilling = storeBillingEnabled(settings)
  const totalSteps = storeBilling ? 4 : STEPS
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [nomAgence, setNomAgence] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [plan, setPlan] = useState<Plan>('yearly')
  const [couponCode, setCouponCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const verification = useEmailVerification(email)
  useStepBack(step, setStep)

  const next = async () => {
    setError(null)
    if (step === 1) {
      if (await verification.sendCode()) setStep(2)
    } else if (step === 2) {
      if (await verification.verifyCode(code)) setStep(3)
    } else if (step === 3) {
      if (!nomAgence.trim()) return setError(t('auth.errors.agencyNameRequired'))
      setStep(4)
    } else if (step === 4) {
      if (passwordProblem(password)) return setError(passwordProblem(password) === 'tooLong' ? t('auth.errors.passwordTooLong') : t('auth.errors.passwordTooShort'))
      if (password !== confirmPassword) return setError(t('auth.errors.passwordMismatch'))
      if (storeBilling) await register()
      else setStep(5)
    } else {
      await register()
    }
  }

  const register = async () => {
    setSubmitting(true)
    try {
      await api('/api/auth/register', {
        method: 'POST',
        body: { email: verification.normalized, password, role: 'agence', nomAgence: nomAgence.trim(), plan },
      })
    } catch (err) {
      setError(errorMessage(err, t('auth.errors.signupFailed')))
      setSubmitting(false)
      return
    }

    // Le compte existe et la session est ouverte : on initialise le paiement.
    if (storeBilling) {
      setPendingHref('/agence/profil/abonnement')
      await refresh()
      return
    }
    try {
      const checkout = await createSubscriptionCheckout({
        email: verification.normalized,
        plan,
        nomAgence: nomAgence.trim(),
        couponCode,
      })
      if (checkout.clientSecret) setPendingHref(paymentHref(checkout.clientSecret, 'subscription'))
      else if (checkout.success) Alert.alert(t('auth.signup.agency.offerActivated'), checkout.message || t('auth.signup.agency.subscriptionActive'))
    } catch (err) {
      Alert.alert(
        t('auth.signup.agency.accountCreated'),
        t('auth.signup.agency.paymentFailed', { error: errorMessage(err) }),
      )
    }
    await refresh()
  }

  const copy = {
    1: { title: settings.text_signup_agency_title || t('auth.signup.agency.title'), subtitle: t('auth.signup.agency.subtitle') },
    2: { title: t('auth.signup.codeTitle'), subtitle: t('auth.signup.codeSubtitle', { email: verification.normalized }) },
    3: { title: t('auth.signup.agency.agencyTitle'), subtitle: t('auth.signup.agency.agencySubtitle') },
    4: { title: t('auth.signup.agency.securityTitle'), subtitle: t('auth.signup.agency.securitySubtitle') },
    5: { title: t('auth.signup.agency.planTitle'), subtitle: settings.text_signup_agency_subtitle },
  }[step as 1 | 2 | 3 | 4 | 5]

  const cta = step === 5 ? t('auth.signup.agency.submit') : step === totalSteps ? t('auth.signup.agency.submitStore') : step === 2 ? t('auth.signup.verify') : t('auth.signup.continue')
  const disabled = (step === 1 && !email.trim()) || (step === 2 && code.length < 6)

  return (
    <AuthScaffold
      eyebrow={t('auth.signup.agencyStepOf', { step, total: totalSteps })}
      title={copy.title}
      subtitle={copy.subtitle}
      progress={step / totalSteps}
      gestureEnabled={step === 1}
      footer={
        <>
          <Button
            title={cta}
            icon={step === 5 ? Lock : undefined}
            size="lg"
            loading={verification.loading || submitting}
            disabled={disabled}
            onPress={next}
          />
          {step === 1 ? (
            <Pressable accessibilityRole="link" onPress={() => router.replace('/connexion?role=agence')} hitSlop={8}>
              <Text variant="subhead" center>
                {t('auth.signup.alreadyAccount')} <Text style={styles.link}>{t('auth.signup.signIn')}</Text>
              </Text>
            </Pressable>
          ) : step === 5 ? (
            <Text variant="footnote" center color={colors.text3}>
              {settings.text_trust_payment} · Stripe
            </Text>
          ) : null}
        </>
      }
    >
      <Banner message={error ?? verification.error} />
      <Banner tone="success" message={step === 2 ? verification.info : null} />

      {step === 1 ? (
        <TextField
          label={t('auth.fields.emailPro')}
          icon={Mail}
          value={email}
          onChangeText={setEmail}
          placeholder={t('auth.fields.placeholderAgencyEmail')}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
          onSubmitEditing={next}
          autoFocus
        />
      ) : null}

      {step === 2 ? (
        <View style={{ gap: 18 }}>
          <OtpInput
            value={code}
            onChange={setCode}
            onComplete={async (value) => {
              if (await verification.verifyCode(value)) setStep(3)
            }}
          />
          <View style={styles.codeActions}>
            <Pressable accessibilityRole="button" onPress={() => verification.sendCode(true)} hitSlop={8}>
              <Text style={styles.link}>{t('auth.signup.resendCode')}</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={() => setStep(1)} hitSlop={8}>
              <Text style={styles.linkMuted}>{t('auth.signup.changeEmail')}</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {step === 3 ? (
        <>
          <VerifiedEmail email={email} />
          <TextField
            label={t('auth.fields.agencyName')}
            icon={Building2}
            value={nomAgence}
            onChangeText={setNomAgence}
            placeholder={t('auth.fields.placeholderAgencyName')}
            autoComplete="organization"
            textContentType="organizationName"
            autoCorrect={false}
            returnKeyType="next"
            onSubmitEditing={next}
            autoFocus
          />
        </>
      ) : null}

      {step === 4 ? (
        <>
          <TextField
            label={t('auth.fields.password')}
            icon={Lock}
            secure
            value={password}
            onChangeText={setPassword}
            placeholder={t('auth.fields.placeholderNewPassword')}
            autoComplete="new-password"
            textContentType="newPassword"
            autoFocus
          />
          <TextField
            label={t('auth.fields.confirm')}
            icon={Lock}
            secure
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder={t('auth.fields.placeholderConfirm')}
            autoComplete="new-password"
            returnKeyType="next"
            onSubmitEditing={next}
          />
        </>
      ) : null}

      {step === 5 ? (
        <>
          <PlanCard
            selected={plan === 'yearly'}
            title={t('auth.signup.agency.yearly')}
            price={settings.price_yearly}
            period={t('auth.signup.agency.perYear')}
            badge={t('auth.signup.agency.yearlyBadge')}
            features={settings.feature_list_yearly}
            onPress={() => setPlan('yearly')}
          />
          <PlanCard
            selected={plan === 'monthly'}
            title={t('auth.signup.agency.monthly')}
            price={settings.price_monthly}
            period={t('auth.signup.agency.perMonth')}
            features={settings.feature_list_monthly}
            onPress={() => setPlan('monthly')}
          />
          <TextField
            label={t('auth.fields.promoCode')}
            icon={Ticket}
            value={couponCode}
            onChangeText={(value) => setCouponCode(value.toUpperCase())}
            placeholder={t('auth.fields.placeholderOptional')}
            autoCapitalize="characters"
            autoCorrect={false}
          />
          <View style={styles.trial}>
            <Crown size={16} color={colors.goldDeep} />
            <Text variant="footnote" color={colors.goldDeep}>
              {settings.text_trust_trial}
            </Text>
          </View>
        </>
      ) : null}
    </AuthScaffold>
  )
}

const styles = StyleSheet.create({
  codeActions: { flexDirection: 'row', justifyContent: 'space-between' },
  link: { fontFamily: fonts.semibold, fontSize: 15, color: colors.navy },
  linkMuted: { fontFamily: fonts.medium, fontSize: 15, color: colors.text2 },
  plan: {
    borderRadius: radius.xl,
    padding: 18,
    gap: 12,
    backgroundColor: colors.fill,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  planSelected: { backgroundColor: colors.navy, borderColor: colors.navy },
  planTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  planTitle: { fontFamily: fonts.semibold, fontSize: 15, color: colors.text2 },
  planPrice: { fontFamily: fonts.bold, fontSize: 28, color: colors.ink, letterSpacing: -0.5 },
  planPeriod: { fontFamily: fonts.medium, fontSize: 15, color: colors.text2 },
  planBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: colors.gold },
  planBadgeText: { fontFamily: fonts.semibold, fontSize: 12, color: colors.navy },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.slate300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { backgroundColor: colors.gold, borderColor: colors.gold },
  features: { gap: 4 },
  feature: { fontFamily: fonts.regular, fontSize: 14, color: colors.text2 },
  trial: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center' },
})
