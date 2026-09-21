import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { router } from 'expo-router'
import { MailCheck, Mail } from 'lucide-react-native'
import { AuthScaffold } from '@/components/AuthScaffold'
import { Banner } from '@/components/ui/Banner'
import { Button } from '@/components/ui/Button'
import { Text } from '@/components/ui/Text'
import { TextField } from '@/components/ui/TextField'
import { t } from '@/i18n'
import { api, errorMessage } from '@/lib/api'
import { colors } from '@/theme'
import { isValidEmail, normalizeEmail } from '@/lib/validation'

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    if (!email.trim()) return
    if (!isValidEmail(email)) return setError(t('auth.errors.invalidEmail'))
    setError(null)
    setLoading(true)
    try {
      await api('/api/auth/forgot-password', { method: 'POST', body: { email: normalizeEmail(email) } })
      setSubmitted(true)
    } catch (err) {
      setError(errorMessage(err, t('auth.forgot.sendFailed')))
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <AuthScaffold
        title={t('auth.forgot.sentTitle')}
        subtitle={t('auth.forgot.sentSubtitle', { email: email.trim() })}
        footer={<Button title={t('auth.forgot.backToLogin')} size="lg" onPress={() => router.back()} />}
      >
        <View style={styles.illustration}>
          <MailCheck size={44} color={colors.success} />
        </View>
      </AuthScaffold>
    )
  }

  return (
    <AuthScaffold
      title={t('auth.forgot.title')}
      subtitle={t('auth.forgot.subtitle')}
      footer={<Button title={t('auth.forgot.submit')} size="lg" loading={loading} disabled={!email.trim()} onPress={submit} />}
    >
      <Banner message={error} />
      <TextField
        label={t('auth.fields.email')}
        icon={Mail}
        value={email}
        onChangeText={setEmail}
        placeholder={t('auth.fields.placeholderEmail')}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        returnKeyType="send"
        onSubmitEditing={submit}
        autoFocus
      />
      <Text variant="footnote" color={colors.text3}>
        {t('auth.forgot.hint')}
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
