import { useRef, useState } from 'react'
import { Pressable, StyleSheet, TextInput, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { Building2, KeyRound, Lock, Mail } from 'lucide-react-native'
import { AuthScaffold } from '@/components/AuthScaffold'
import { RoleSheet } from '@/components/RoleSheet'
import { Banner } from '@/components/ui/Banner'
import { Button } from '@/components/ui/Button'
import { SegmentedControl } from '@/components/ui/Chips'
import { Text } from '@/components/ui/Text'
import { TextField } from '@/components/ui/TextField'
import { useAuth } from '@/contexts/AuthContext'
import { t } from '@/i18n'
import { errorMessage } from '@/lib/api'
import { colors, fonts } from '@/theme'
import { isValidEmail, normalizeEmail } from '@/lib/validation'

type LoginRole = 'acquereur' | 'agence'

export default function ConnexionScreen() {
  const params = useLocalSearchParams<{ role?: string }>()
  const [role, setRole] = useState<LoginRole>(params.role === 'agence' ? 'agence' : 'acquereur')
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [roleSheet, setRoleSheet] = useState(false)
  const passwordRef = useRef<TextInput>(null)

  const submit = async () => {
    const errors: typeof fieldErrors = {}
    if (!isValidEmail(email)) errors.email = t('auth.errors.invalidEmail')
    if (!password) errors.password = t('auth.errors.passwordRequired')
    setFieldErrors(errors)
    if (errors.email || errors.password) return

    setError(null)
    setLoading(true)
    try {
      await signIn(normalizeEmail(email), password, role)
      // La pile protégée bascule automatiquement vers l'espace du compte.
    } catch (err) {
      setError(errorMessage(err, t('auth.errors.badCredentials')))
      setLoading(false)
    }
  }

  return (
    <AuthScaffold
      title={t('auth.login.title')}
      subtitle={role === 'agence' ? t('auth.login.subtitleAgency') : t('auth.login.subtitleBuyer')}
      footer={
        <>
          <Button title={t('auth.login.submit')} size="lg" loading={loading} onPress={submit} />
          <Pressable accessibilityRole="button" onPress={() => setRoleSheet(true)} style={styles.signup} hitSlop={8}>
            <Text variant="subhead" center>
              {t('auth.login.noAccount')} <Text style={styles.signupLink}>{t('auth.login.createAccount')}</Text>
            </Text>
          </Pressable>
        </>
      }
    >
      <SegmentedControl
        options={[
          { value: 'acquereur', label: t('auth.login.roleBuyer'), icon: KeyRound },
          { value: 'agence', label: t('auth.login.roleAgency'), icon: Building2 },
        ]}
        value={role}
        onChange={(value) => {
          setRole(value)
          setError(null)
        }}
      />
      <Banner message={error} />
      <TextField
        label={t('auth.fields.email')}
        icon={Mail}
        value={email}
        onChangeText={setEmail}
        placeholder={role === 'agence' ? t('auth.fields.placeholderAgencyEmail') : t('auth.fields.placeholderEmail')}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
        error={fieldErrors.email}
      />
      <View style={{ gap: 10 }}>
        <TextField
          ref={passwordRef}
          label={t('auth.fields.password')}
          icon={Lock}
          secure
          value={password}
          onChangeText={setPassword}
          placeholder={t('auth.fields.placeholderPassword')}
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={submit}
          error={fieldErrors.password}
        />
        <Pressable accessibilityRole="link" onPress={() => router.push('/mot-de-passe-oublie')} hitSlop={8} style={{ alignSelf: 'flex-start' }}>
          <Text style={styles.forgot}>{t('auth.login.forgot')}</Text>
        </Pressable>
      </View>
      <RoleSheet visible={roleSheet} onClose={() => setRoleSheet(false)} />
    </AuthScaffold>
  )
}

const styles = StyleSheet.create({
  forgot: { fontFamily: fonts.semibold, fontSize: 14, color: colors.goldDeep },
  signup: { paddingVertical: 4 },
  signupLink: { fontFamily: fonts.semibold, color: colors.navy },
})
