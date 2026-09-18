import { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { useNavigation } from 'expo-router'
import { CheckCircle2 } from 'lucide-react-native'
import { Text } from '@/components/ui/Text'
import { t } from '@/i18n'
import { api, errorMessage } from '@/lib/api'
import { colors, fonts, radius } from '@/theme'

/** Envoi et vérification du code e-mail communs aux deux inscriptions. */
export function useEmailVerification(email: string) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const normalized = email.trim().toLowerCase()

  const sendCode = async (resend = false) => {
    if (loading || !normalized) return false
    setLoading(true)
    setError(null)
    setInfo(null)
    try {
      await api('/api/auth/verify-email/send', { method: 'POST', body: { email: normalized } })
      if (resend) setInfo(t('auth.signup.codeResent'))
      return true
    } catch (err) {
      setError(errorMessage(err))
      return false
    } finally {
      setLoading(false)
    }
  }

  const verifyCode = async (code: string) => {
    if (loading || code.length < 6) return false
    setLoading(true)
    setError(null)
    try {
      await api('/api/auth/verify-email/check', { method: 'POST', body: { email: normalized, code } })
      return true
    } catch (err) {
      setError(errorMessage(err))
      return false
    } finally {
      setLoading(false)
    }
  }

  return { normalized, loading, error, info, setError, sendCode, verifyCode }
}

/**
 * Le retour (bouton natif, geste Android) revient à l'étape précédente
 * plutôt que de quitter le parcours et perdre la saisie.
 */
export function useStepBack(step: number, setStep: (step: number) => void) {
  const navigation = useNavigation()
  useEffect(() => {
    return navigation.addListener('beforeRemove', (event) => {
      if (step <= 1) return
      event.preventDefault()
      setStep(step - 1)
    })
  }, [navigation, step, setStep])
}

export function VerifiedEmail({ email }: { email: string }) {
  return (
    <View style={styles.verified} accessibilityLabel={t('auth.signup.verifiedEmail', { email })}>
      <CheckCircle2 size={18} color={colors.success} />
      <Text numberOfLines={1} style={styles.verifiedText}>
        {email.trim().toLowerCase()}
      </Text>
      <Text style={styles.verifiedTag}>{t('auth.signup.verified')}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  verified: {
    minHeight: 50,
    borderRadius: radius.md,
    backgroundColor: colors.successSoft,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  verifiedText: { flex: 1, fontFamily: fonts.medium, fontSize: 15, color: colors.ink },
  verifiedTag: { fontFamily: fonts.semibold, fontSize: 13, color: colors.success },
})
