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
import { api, errorMessage } from '@/lib/api'
import { createSubscriptionCheckout, paymentHref } from '@/lib/checkout'
import { formatPlanPrice } from '@/lib/format'
import { colors, fonts, radius } from '@/theme'

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
      accessibilityLabel={`${title}, ${formatPlanPrice(price)} euros ${period}`}
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
      if (!nomAgence.trim()) return setError("Indiquez le nom de l'agence.")
      setStep(4)
    } else if (step === 4) {
      if (password.length < 8) return setError('Choisissez un mot de passe d’au moins 8 caractères.')
      if (password !== confirmPassword) return setError('Les deux mots de passe ne correspondent pas.')
      setStep(5)
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
      setError(errorMessage(err, "L'inscription a échoué. Réessayez."))
      setSubmitting(false)
      return
    }

    // Le compte existe et la session est ouverte : on initialise le paiement.
    try {
      const checkout = await createSubscriptionCheckout({
        email: verification.normalized,
        plan,
        nomAgence: nomAgence.trim(),
        couponCode,
      })
      if (checkout.clientSecret) setPendingHref(paymentHref(checkout.clientSecret, 'subscription'))
      else if (checkout.success) Alert.alert('Offre activée', checkout.message || 'Votre abonnement est actif.')
    } catch (err) {
      Alert.alert(
        'Compte créé',
        `Le paiement n'a pas pu démarrer : ${errorMessage(err)}\n\nVous pourrez souscrire depuis Profil › Abonnement.`,
      )
    }
    await refresh()
  }

  const copy = {
    1: { title: settings.text_signup_agency_title || 'Créer un compte agence', subtitle: 'Commencez par l’e-mail professionnel de l’agence.' },
    2: { title: 'Code de vérification', subtitle: `Saisissez le code à 6 chiffres envoyé à ${verification.normalized}.` },
    3: { title: 'Votre agence', subtitle: 'Ce nom est affiché aux acquéreurs dans la messagerie.' },
    4: { title: 'Sécurisez le compte', subtitle: 'Choisissez un mot de passe d’au moins 8 caractères.' },
    5: { title: 'Choisissez votre offre', subtitle: settings.text_signup_agency_subtitle },
  }[step as 1 | 2 | 3 | 4 | 5]

  const cta = step === 5 ? 'Continuer vers le paiement' : step === 2 ? 'Vérifier' : 'Continuer'
  const disabled = (step === 1 && !email.trim()) || (step === 2 && code.length < 6)

  return (
    <AuthScaffold
      eyebrow={`Espace agence · Étape ${step} sur ${STEPS}`}
      title={copy.title}
      subtitle={copy.subtitle}
      progress={step / STEPS}
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
                Déjà un compte ? <Text style={styles.link}>Se connecter</Text>
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
          label="E-mail professionnel"
          icon={Mail}
          value={email}
          onChangeText={setEmail}
          placeholder="contact@agence.fr"
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
              <Text style={styles.link}>Renvoyer le code</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={() => setStep(1)} hitSlop={8}>
              <Text style={styles.linkMuted}>Modifier l'e-mail</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {step === 3 ? (
        <>
          <VerifiedEmail email={email} />
          <TextField
            label="Nom de l'agence"
            icon={Building2}
            value={nomAgence}
            onChangeText={setNomAgence}
            placeholder="Agence du Centre"
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
            label="Mot de passe"
            icon={Lock}
            secure
            value={password}
            onChangeText={setPassword}
            placeholder="Au moins 8 caractères"
            autoComplete="new-password"
            textContentType="newPassword"
            autoFocus
          />
          <TextField
            label="Confirmer"
            icon={Lock}
            secure
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Retapez le mot de passe"
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
            title="Annuel"
            price={settings.price_yearly}
            period="/ an"
            badge="2 mois offerts"
            features={settings.feature_list_yearly}
            onPress={() => setPlan('yearly')}
          />
          <PlanCard
            selected={plan === 'monthly'}
            title="Mensuel"
            price={settings.price_monthly}
            period="/ mois"
            features={settings.feature_list_monthly}
            onPress={() => setPlan('monthly')}
          />
          <TextField
            label="Code promo"
            icon={Ticket}
            value={couponCode}
            onChangeText={(value) => setCouponCode(value.toUpperCase())}
            placeholder="Facultatif"
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
