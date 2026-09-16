import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { CheckCircle2, Lock } from 'lucide-react-native'
import { AuthScaffold } from '@/components/AuthScaffold'
import { Banner } from '@/components/ui/Banner'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { useAuth } from '@/contexts/AuthContext'
import { api, errorMessage } from '@/lib/api'
import { colors } from '@/theme'

/** Ouvert via immocible://reset-password?token=… */
export default function ResetPasswordScreen() {
  const { token } = useLocalSearchParams<{ token?: string }>()
  const { user, refresh } = useAuth()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(
    token ? null : 'Ce lien de réinitialisation est invalide ou a expiré. Demandez-en un nouveau.',
  )

  const submit = async () => {
    setError(null)
    if (password.length < 8) return setError('Choisissez un mot de passe d’au moins 8 caractères.')
    if (password !== confirmPassword) return setError('Les deux mots de passe ne correspondent pas.')
    setLoading(true)
    try {
      await api('/api/auth/reset-password', { method: 'POST', body: { token, password } })
      setSuccess(true)
      // Le serveur révoque toutes les sessions : on resynchronise l'état local.
      if (user) await refresh()
    } catch (err) {
      setError(errorMessage(err, 'Ce lien a expiré. Demandez un nouveau lien.'))
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <AuthScaffold
        title="Mot de passe modifié"
        subtitle="Vous pouvez vous connecter avec votre nouveau mot de passe."
        footer={<Button title="Se connecter" size="lg" onPress={() => router.replace('/connexion')} />}
      >
        <View style={styles.illustration}>
          <CheckCircle2 size={44} color={colors.success} />
        </View>
      </AuthScaffold>
    )
  }

  return (
    <AuthScaffold
      title="Nouveau mot de passe"
      subtitle="8 caractères minimum."
      footer={
        <Button title="Enregistrer le mot de passe" size="lg" loading={loading} disabled={!token} onPress={submit} />
      }
    >
      <Banner message={error} />
      <TextField
        label="Nouveau mot de passe"
        icon={Lock}
        secure
        value={password}
        onChangeText={setPassword}
        placeholder="Au moins 8 caractères"
        autoComplete="new-password"
        textContentType="newPassword"
        editable={!!token && !loading}
      />
      <TextField
        label="Confirmer"
        icon={Lock}
        secure
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Retapez le mot de passe"
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
