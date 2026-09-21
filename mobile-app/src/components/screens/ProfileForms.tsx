import { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { router, Stack } from 'expo-router'
import { Building2, Lock, Mail, Phone, UserRound } from 'lucide-react-native'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { StickyFooter } from '@/components/ui/StickyFooter'
import { Text } from '@/components/ui/Text'
import { TextField } from '@/components/ui/TextField'
import { useAuth } from '@/contexts/AuthContext'
import { t } from '@/i18n'
import { api, errorMessage } from '@/lib/api'
import { useStatusBar } from '@/lib/hooks'
import { largeTitleScrollProps, pushedScreenOptions, useTabScreenKeyboardOffset } from '@/lib/navigation'
import type { AccountProfile } from '@/lib/types'
import { colors, fonts, radius, spacing } from '@/theme'
import { isValidEmail, isValidPhone, passwordProblem } from '@/lib/validation'

type Form = { prenom: string; nom: string; email: string; telephone: string; nomAgence: string }

function useProfileForm() {
  const [form, setForm] = useState<Form | null>(null)
  const [role, setRole] = useState<AccountProfile['role'] | null>(null)
  const [savedEmail, setSavedEmail] = useState('')

  useEffect(() => {
    api<AccountProfile>('/api/user/profile')
      .then((data) => {
        setRole(data.role)
        setSavedEmail((data.email || '').toLowerCase())
        setForm({
          prenom: data.prenom || '',
          nom: data.nom || '',
          email: data.email || '',
          telephone: data.telephone || '',
          nomAgence: data.nomAgence || '',
        })
      })
      .catch((err) => Alert.alert(t('profile.info.profileError'), errorMessage(err)))
  }, [])

  return { form, setForm, role, savedEmail }
}

/** Informations personnelles (et nom d'agence) — « Enregistrer » dans l'en-tête natif. */
export function ProfileInfoScreen() {
  const { refresh } = useAuth()
  const { form, setForm, role, savedEmail } = useProfileForm()
  const [currentPassword, setCurrentPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const keyboardOffset = useTabScreenKeyboardOffset()
  useStatusBar('dark')

  // Changer d'e-mail exige le mot de passe actuel (vérifié par le serveur).
  const emailChanged = !!form && form.email.trim().toLowerCase() !== savedEmail

  const update = (key: keyof Form) => (value: string) => setForm((prev) => (prev ? { ...prev, [key]: value } : prev))

  const save = async () => {
    if (!form) return
    if (!isValidEmail(form.email)) return Alert.alert(t('profile.info.email'), t('profile.info.invalidEmail'))
    if (form.telephone.trim() && !isValidPhone(form.telephone)) return Alert.alert(t('profile.info.phone'), t('auth.errors.phoneInvalid'))
    if (role === 'agence' && !form.nomAgence.trim()) return Alert.alert(t('profile.info.agencyName'), t('auth.errors.agencyNameRequired'))
    if (emailChanged && !currentPassword) return Alert.alert(t('profile.info.email'), t('profile.info.passwordForEmail'))
    setSaving(true)
    try {
      await api('/api/user/profile', {
        method: 'PUT',
        body: { ...form, email: form.email.trim().toLowerCase(), password: '', currentPassword: emailChanged ? currentPassword : undefined },
      })
      await refresh()
      router.back()
    } catch (err) {
      Alert.alert(t('profile.info.saveFailed'), errorMessage(err))
      setSaving(false)
    }
  }

  return (
    <KeyboardAvoidingView style={styles.root} behavior="padding" keyboardVerticalOffset={keyboardOffset}>
      <Stack.Screen
        options={{
          ...pushedScreenOptions,
          title: role === 'agence' ? t('profile.info.agencyTitle') : t('profile.info.personalTitle'),
          headerRight: () =>
            saving ? (
              <ActivityIndicator color={colors.navy} />
            ) : (
              <Pressable accessibilityRole="button" onPress={save} disabled={!form} hitSlop={10}>
                <Text style={styles.headerAction}>{t('profile.info.save')}</Text>
              </Pressable>
            ),
        }}
      />
      {/* Écran poussé sous un grand titre (iOS) : le contenu ne doit pas passer sous l'en-tête. */}
      <ScrollView {...largeTitleScrollProps} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {!form ? (
          <>
            <Skeleton height={80} rounded={radius.md} />
            <Skeleton height={80} rounded={radius.md} />
            <Skeleton height={80} rounded={radius.md} />
          </>
        ) : (
          <>
            {role === 'agence' ? (
              <TextField tone="surface" label={t('profile.info.agencyName')} icon={Building2} value={form.nomAgence} onChangeText={update('nomAgence')} placeholder={t('profile.info.agencyPlaceholder')} autoCorrect={false} />
            ) : null}
            <View style={styles.row}>
              <View style={styles.flex}>
                <TextField tone="surface" label={t('profile.info.firstName')} icon={UserRound} value={form.prenom} onChangeText={update('prenom')} placeholder={t('profile.info.firstNamePlaceholder')} autoComplete="given-name" />
              </View>
              <View style={styles.flex}>
                <TextField tone="surface" label={t('profile.info.lastName')} value={form.nom} onChangeText={update('nom')} placeholder={t('profile.info.lastNamePlaceholder')} autoComplete="family-name" />
              </View>
            </View>
            <TextField
              tone="surface"
              label={t('profile.info.email')}
              icon={Mail}
              value={form.email}
              onChangeText={update('email')}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            {emailChanged ? (
              <TextField
                tone="surface"
                label={t('profile.info.currentPassword')}
                icon={Lock}
                secure
                value={currentPassword}
                onChangeText={setCurrentPassword}
                autoComplete="current-password"
                textContentType="password"
              />
            ) : null}
            <TextField
              tone="surface"
              label={t('profile.info.phone')}
              icon={Phone}
              value={form.telephone}
              onChangeText={update('telephone')}
              keyboardType="phone-pad"
              autoComplete="tel"
              placeholder={t('profile.info.phonePlaceholder')}
            />
            {role === 'acquereur' ? (
              <Text variant="footnote" color={colors.text3}>
                {t('profile.info.privacyNote')}
              </Text>
            ) : null}
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

/** Changement de mot de passe. */
export function ProfilePasswordScreen() {
  const { form } = useProfileForm()
  const [currentPassword, setCurrentPassword] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const keyboardOffset = useTabScreenKeyboardOffset()
  useStatusBar('dark')

  const save = async () => {
    if (!form) return
    if (!currentPassword) return Alert.alert(t('profile.password.title'), t('profile.password.enterCurrent'))
    if (passwordProblem(password)) return Alert.alert(t('profile.password.title'), passwordProblem(password) === 'tooLong' ? t('auth.errors.passwordTooLong') : t('profile.password.tooShort'))
    if (password !== confirmPassword) return Alert.alert(t('profile.password.title'), t('profile.password.mismatch'))
    setSaving(true)
    try {
      await api('/api/user/profile', { method: 'PUT', body: { ...form, password, currentPassword } })
      Alert.alert(t('profile.password.changed'), t('profile.password.changedMessage'))
      router.back()
    } catch (err) {
      Alert.alert(t('profile.password.changeFailed'), errorMessage(err))
      setSaving(false)
    }
  }

  return (
    <KeyboardAvoidingView style={styles.root} behavior="padding" keyboardVerticalOffset={keyboardOffset}>
      <Stack.Screen options={{ ...pushedScreenOptions, title: t('profile.password.title') }} />
      {/* Écran poussé sous un grand titre (iOS) : le contenu ne doit pas passer sous l'en-tête. */}
      <ScrollView {...largeTitleScrollProps} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text variant="subhead">{t('profile.password.intro')}</Text>
        <TextField
          tone="surface"
          label={t('profile.password.current')}
          icon={Lock}
          secure
          value={currentPassword}
          onChangeText={setCurrentPassword}
          autoComplete="current-password"
          textContentType="password"
          autoFocus
        />
        <TextField
          tone="surface"
          label={t('profile.password.new')}
          icon={Lock}
          secure
          value={password}
          onChangeText={setPassword}
          autoComplete="new-password"
          textContentType="newPassword"
        />
        <TextField
          tone="surface"
          label={t('profile.password.confirm')}
          icon={Lock}
          secure
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          autoComplete="new-password"
          returnKeyType="go"
          onSubmitEditing={save}
        />
      </ScrollView>
      <StickyFooter>
        <Button title={t('profile.password.submit')} size="lg" loading={saving} disabled={!form || !password || !currentPassword} onPress={save} />
      </StickyFooter>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  content: { padding: spacing.screen, gap: 18, paddingBottom: 40 },
  row: { flexDirection: 'row', gap: 10 },
  headerAction: { fontFamily: fonts.semibold, fontSize: 16, color: colors.navy },
})
