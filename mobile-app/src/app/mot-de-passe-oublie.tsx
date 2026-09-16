import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { router } from 'expo-router'
import { MailCheck, Mail } from 'lucide-react-native'
import { AuthScaffold } from '@/components/AuthScaffold'
import { Banner } from '@/components/ui/Banner'
import { Button } from '@/components/ui/Button'
import { Text } from '@/components/ui/Text'
import { TextField } from '@/components/ui/TextField'
import { api } from '@/lib/api'
import { colors } from '@/theme'

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    if (!email.trim()) return
    setError(null)
    setLoading(true)
    try {
      await api('/api/auth/forgot-password', { method: 'POST', body: { email: email.trim().toLowerCase() } })
      setSubmitted(true)
    } catch {
      setError("L'envoi a échoué. Vérifiez votre connexion puis réessayez.")
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <AuthScaffold
        title="Vérifiez vos e-mails"
        subtitle={`Si un compte existe pour ${email.trim()}, un lien pour choisir un nouveau mot de passe vient d'être envoyé. Il est valable une heure.`}
        footer={<Button title="Retour à la connexion" size="lg" onPress={() => router.back()} />}
      >
        <View style={styles.illustration}>
          <MailCheck size={44} color={colors.success} />
        </View>
      </AuthScaffold>
    )
  }

  return (
    <AuthScaffold
      title="Mot de passe oublié"
      subtitle="Indiquez l'e-mail de votre compte : nous vous envoyons un lien pour en choisir un nouveau."
      footer={<Button title="Envoyer le lien" size="lg" loading={loading} disabled={!email.trim()} onPress={submit} />}
    >
      <Banner message={error} />
      <TextField
        label="E-mail"
        icon={Mail}
        value={email}
        onChangeText={setEmail}
        placeholder="prenom@exemple.fr"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        returnKeyType="send"
        onSubmitEditing={submit}
        autoFocus
      />
      <Text variant="footnote" color={colors.text3}>
        Le lien s'ouvre dans votre navigateur ou dans l'application.
      </Text>
    </AuthScaffold>
  )
}

const styles = StyleSheet.create({
  illustration: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.successSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
