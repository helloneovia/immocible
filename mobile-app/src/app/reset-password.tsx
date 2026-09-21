import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { CheckCircle2, Lock } from 'lucide-react-native'
import { AuthScaffold } from '@/components/AuthScaffold'
import { Banner } from '@/components/ui/Banner'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { useAuth } from '@/contexts/AuthContext'
import { t } from '@/i18n'
import { api, errorMessage } from '@/lib/api'
import { colors } from '@/theme'
import { passwordProblem } from '@/lib/validation'

/** Ouvert via immocible://reset-password?token=… */
export default function ResetPasswordScreen() {
  const { token } = useLocalSearchParams<{ token?: string }>()
  const { user, refresh } = useAuth()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(
    token ? null : t('auth.reset.invalidLink'),
  )

  const submit = async () => {
    setError(null)
    if (passwordProblem(password)) return setError(passwordProblem(password) === 'tooLong' ? t('auth.errors.passwordTooLong') : t('auth.errors.passwordTooShort'))
    if (password !== confirmPassword) return setError(t('auth.errors.passwordMismatch'))
    setLoading(true)
    try {
      await api('/api/auth/reset-password', { method: 'POST', body: { token, password } })
      setSuccess(true)
      // Le serveur révoque toutes les sessions : on resynchronise l'état local.
      if (user) await refresh()
    } catch (err) {
      setError(errorMessage(err, t('auth.reset.expired')))
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <AuthScaffold
        title={t('auth.reset.successTitle')}
        subtitle={t('auth.reset.successSubtitle')}
        footer={<Button title={t('auth.reset.signIn')} size="lg" onPress={() => router.replace('/connexion')} />}
      >
        <View style={styles.illustration}>
          <CheckCircle2 size={44} color={colors.success} />
        </View>
      </AuthScaffold>
    )
  }

  return (
    <AuthScaffold
      title={t('auth.reset.title')}
      subtitle={t('auth.reset.subtitle')}
      footer={
        <Button title={t('auth.reset.submit')} size="lg" loading={loading} disabled={!token} onPress={submit} />
      }
    >
      <Banner message={error} />
      <TextField
        label={t('auth.fields.newPassword')}
        icon={Lock}
        secure
        value={password}
        onChangeText={setPassword}
        placeholder={t('auth.fields.placeholderNewPassword')}
        autoComplete="new-password"
        textContentType="newPassword"
        editable={!!token && !loading}
      />
      <TextField
        label={t('auth.fields.confirm')}
        icon={Lock}
        secure
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder={t('auth.fields.placeholderConfirm')}
        autoComplete="new-password"
        editable={!!token && !loading}
        returnKeyType="go"
        onSubmitEditing={submit}
      />
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
