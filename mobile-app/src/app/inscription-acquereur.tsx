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
      if (!firstName.trim() || !lastName.trim()) return setError('Indiquez votre prénom et votre nom.')
      if (telephone.replace(/\D/g, '').length < 10) return setError('Indiquez un numéro de téléphone à 10 chiffres.')
      setStep(4)
    } else {
      await register()
    }
  }

  const register = async () => {
    if (password.length < 8) return setError('Choisissez un mot de passe d’au moins 8 caractères.')
    if (password !== confirmPassword) return setError('Les deux mots de passe ne correspondent pas.')
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
      const message = errorMessage(err, "L'inscription a échoué. Réessayez.")
      if (message.includes('existe déjà') || message.includes('already exists')) {
        setError('Un compte existe déjà avec cet e-mail. Connectez-vous.')
      } else {
        setError(message)
      }
      setSubmitting(false)
    }
  }

  const copy = {
    1: { title: settings.text_signup_buyer_title || 'Créer mon compte', subtitle: 'Commencez par votre e-mail. Le compte acquéreur est gratuit.' },
    2: { title: 'Code de vérification', subtitle: `Saisissez le code à 6 chiffres envoyé à ${verification.normalized}.` },
    3: { title: 'Faisons connaissance', subtitle: 'Les agences ne voient vos coordonnées que si elles les débloquent.' },
    4: { title: 'Sécurisez votre compte', subtitle: 'Choisissez un mot de passe d’au moins 8 caractères.' },
  }[step as 1 | 2 | 3 | 4]

  const cta = step === 4 ? 'Créer mon compte' : step === 2 ? 'Vérifier' : 'Continuer'
  const disabled = (step === 1 && !email.trim()) || (step === 2 && code.length < 6)

  return (
    <AuthScaffold
      eyebrow={`Étape ${step} sur ${STEPS}`}
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
                Déjà un compte ? <Text style={styles.link}>Se connecter</Text>
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
          label="E-mail"
          icon={Mail}
          value={email}
          onChangeText={setEmail}
          placeholder="prenom@exemple.fr"
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
          <View style={styles.row}>
            <View style={styles.flex}>
              <TextField label="Prénom" icon={User} value={firstName} onChangeText={setFirstName} placeholder="Camille" autoComplete="given-name" textContentType="givenName" autoFocus />
            </View>
            <View style={styles.flex}>
              <TextField label="Nom" value={lastName} onChangeText={setLastName} placeholder="Martin" autoComplete="family-name" textContentType="familyName" />
            </View>
          </View>
          <TextField
            label="Téléphone mobile"
            icon={Phone}
            value={telephone}
            onChangeText={setTelephone}
            placeholder="06 12 34 56 78"
            keyboardType="phone-pad"
            autoComplete="tel"
            textContentType="telephoneNumber"
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
