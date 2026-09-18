import { useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { router } from 'expo-router'
import { Lock, Mail, Phone, User } from 'lucide-react-native'
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
import { colors, fonts } from '@/theme'

const STEPS = 4

export default function InscriptionAcquereurScreen() {
  const settings = useSettings()
  const { refresh, setPendingHref } = useAuth()
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [telephone, setTelephone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const verification = useEmailVerification(email)
  useStepBack(step, setStep)

  const shownError = error ?? verification.error

  const next = async () => {
    setError(null)
    if (step === 1) {
      if (await verification.sendCode()) setStep(2)
    } else if (step === 2) {
      if (await verification.verifyCode(code)) setStep(3)
    } else if (step === 3) {
      if (!firstName.trim() || !lastName.trim()) return setError(t('auth.errors.nameRequired'))
      if (telephone.replace(/\D/g, '').length < 10) return setError(t('auth.errors.phoneInvalid'))
      setStep(4)
    } else {
      await register()
    }
  }

  const register = async () => {
    if (password.length < 8) return setError(t('auth.errors.passwordTooShort'))
    if (password !== confirmPassword) return setError(t('auth.errors.passwordMismatch'))
    setSubmitting(true)
    try {
      await api('/api/auth/register', {
        method: 'POST',
        body: {
          email: verification.normalized,
          password,
          role: 'acquereur',
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          telephone: telephone.trim(),
        },
      })
      // Juste après l'inscription : on ouvre le questionnaire, comme sur le site.
      setPendingHref('/questionnaire')
      await refresh()
    } catch (err) {
      const message = errorMessage(err, t('auth.errors.signupFailed'))
      if (message.includes('existe déjà') || message.includes('already exists')) {
        setError(t('auth.errors.accountExists'))
      } else {
        setError(message)
      }
      setSubmitting(false)
    }
  }

  const copy = {
    1: { title: settings.text_signup_buyer_title || t('auth.signup.buyer.title'), subtitle: t('auth.signup.buyer.subtitle') },
    2: { title: t('auth.signup.codeTitle'), subtitle: t('auth.signup.codeSubtitle', { email: verification.normalized }) },
    3: { title: t('auth.signup.buyer.aboutTitle'), subtitle: t('auth.signup.buyer.aboutSubtitle') },
    4: { title: t('auth.signup.buyer.securityTitle'), subtitle: t('auth.signup.buyer.securitySubtitle') },
  }[step as 1 | 2 | 3 | 4]

  const cta = step === 4 ? t('auth.signup.buyer.submit') : step === 2 ? t('auth.signup.verify') : t('auth.signup.continue')
  const disabled = (step === 1 && !email.trim()) || (step === 2 && code.length < 6)

  return (
    <AuthScaffold
      eyebrow={t('auth.signup.stepOf', { step, total: STEPS })}
      title={copy.title}
      subtitle={copy.subtitle}
      progress={step / STEPS}
      gestureEnabled={step === 1}
      footer={
        <>
          <Button title={cta} size="lg" loading={verification.loading || submitting} disabled={disabled} onPress={next} />
          {step === 1 ? (
            <Pressable accessibilityRole="link" onPress={() => router.replace('/connexion?role=acquereur')} hitSlop={8}>
              <Text variant="subhead" center>
                {t('auth.signup.alreadyAccount')} <Text style={styles.link}>{t('auth.signup.signIn')}</Text>
              </Text>
            </Pressable>
          ) : null}
        </>
      }
    >
      <Banner message={shownError} />
      <Banner tone="success" message={step === 2 ? verification.info : null} />

      {step === 1 ? (
        <TextField
          label={t('auth.fields.email')}
          icon={Mail}
          value={email}
          onChangeText={setEmail}
          placeholder={t('auth.fields.placeholderEmail')}
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
          <View style={styles.row}>
            <View style={styles.flex}>
              <TextField label={t('auth.fields.firstName')} icon={User} value={firstName} onChangeText={setFirstName} placeholder={t('auth.fields.placeholderFirstName')} autoComplete="given-name" textContentType="givenName" autoFocus />
            </View>
            <View style={styles.flex}>
              <TextField label={t('auth.fields.lastName')} value={lastName} onChangeText={setLastName} placeholder={t('auth.fields.placeholderLastName')} autoComplete="family-name" textContentType="familyName" />
            </View>
          </View>
          <TextField
            label={t('auth.fields.mobilePhone')}
            icon={Phone}
            value={telephone}
            onChangeText={setTelephone}
            placeholder={t('auth.fields.placeholderPhone')}
            keyboardType="phone-pad"
            autoComplete="tel"
            textContentType="telephoneNumber"
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
            returnKeyType="go"
            onSubmitEditing={next}
          />
        </>
      ) : null}
    </AuthScaffold>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', gap: 12 },
  codeActions: { flexDirection: 'row', justifyContent: 'space-between' },
  link: { fontFamily: fonts.semibold, fontSize: 15, color: colors.navy },
  linkMuted: { fontFamily: fonts.medium, fontSize: 15, color: colors.text2 },
})
