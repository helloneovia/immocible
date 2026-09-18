import { useCallback, useState } from 'react'
import { Alert, Linking, ScrollView, StyleSheet, View } from 'react-native'
import { router, Stack, useFocusEffect } from 'expo-router'
import Constants from 'expo-constants'
import {
  BookOpen,
  Building2,
  CreditCard,
  FileText,
  KeyRound,
  Languages,
  LifeBuoy,
  LogOut,
  Scale,
  Shield,
  Target,
  Trash2,
  UserRound,
} from 'lucide-react-native'
import { Avatar } from '@/components/ui/Avatar'
import { ListRow, ListSection } from '@/components/ui/List'
import { Skeleton } from '@/components/ui/Skeleton'
import { Text } from '@/components/ui/Text'
import { useAuth } from '@/contexts/AuthContext'
import { LOCALES, t, useI18n } from '@/i18n'
import { api } from '@/lib/api'
import { formatDate } from '@/lib/format'
import { useStatusBar } from '@/lib/hooks'
import { openLegal, SUPPORT_EMAIL } from '@/lib/links'
import { largeTitleScrollProps } from '@/lib/navigation'
import type { AccountProfile } from '@/lib/types'
import { colors, fonts, radius, spacing } from '@/theme'

export function subscriptionSummary(profile: AccountProfile | null) {
  if (!profile?.subscriptionEndDate) return t('profile.summary.none')
  const end = new Date(profile.subscriptionEndDate)
  const plan = profile.plan === 'yearly' ? t('profile.summary.yearly') : t('profile.summary.monthly')
  return end.getTime() < Date.now()
    ? t('profile.summary.expired', { plan, date: formatDate(end) })
    : t('profile.summary.until', { plan, date: formatDate(end) })
}

export function ProfileHome({ role }: { role: 'acquereur' | 'agence' }) {
  const { signOut } = useAuth()
  const { locale, setLocale } = useI18n()
  const [profile, setProfile] = useState<AccountProfile | null>(null)
  useStatusBar('dark')

  useFocusEffect(
    useCallback(() => {
      api<AccountProfile>('/api/user/profile').then(setProfile).catch(() => {})
    }, []),
  )

  const base = role === 'agence' ? '/agence/profil' : '/acquereur/profil'
  const displayName =
    role === 'agence'
      ? profile?.nomAgence || t('profile.home.yourAgency')
      : `${profile?.prenom ?? ''} ${profile?.nom ?? ''}`.trim() || profile?.email || ''

  const confirmSignOut = () =>
    Alert.alert(t('profile.home.signOutTitle'), t('profile.home.signOutMessage'), [
      { text: t('profile.home.cancel'), style: 'cancel' },
      { text: t('profile.home.signOut'), style: 'destructive', onPress: () => signOut() },
    ])

  // Choix de la langue : le changement remonte toute la navigation.
  const chooseLanguage = () =>
    Alert.alert(t('profile.home.languageTitle'), t('profile.home.languageMessage'), [
      ...LOCALES.map((option) => ({
        text: option.label,
        onPress: () => {
          if (option.value !== locale) setLocale(option.value)
        },
      })),
      { text: t('profile.home.cancel'), style: 'cancel' as const },
    ])
  const languageLabel = LOCALES.find((option) => option.value === locale)?.label

  const requestDeletion = () =>
    Alert.alert(
      t('profile.home.deleteTitle'),
      t('profile.home.deleteMessage'),
      [
        { text: t('profile.home.cancel'), style: 'cancel' },
        {
          text: t('profile.home.writeSupport'),
          style: 'destructive',
          onPress: () =>
            Linking.openURL(
              `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(t('profile.home.deleteSubject'))}&body=${encodeURIComponent(
                t('profile.home.deleteBody', { email: profile?.email ?? '' }),
              )}`,
            ),
        },
      ],
    )

  return (
    <ScrollView {...largeTitleScrollProps} style={styles.root} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: t('profile.home.title') }} />

      <View style={styles.identity}>
        {profile ? (
          <>
            <Avatar name={displayName} size={64} />
            <View style={{ flex: 1, gap: 3 }}>
              <Text variant="title3" numberOfLines={1}>
                {displayName}
              </Text>
              <Text variant="footnote" numberOfLines={1}>
                {profile.email}
              </Text>
              <View style={styles.rolePill}>
                <Text style={styles.roleText}>{role === 'agence' ? t('profile.home.agencyAccount') : t('profile.home.buyerAccount')}</Text>
              </View>
            </View>
          </>
        ) : (
          <>
            <Skeleton width={64} height={64} rounded={32} />
            <View style={{ flex: 1, gap: 8 }}>
              <Skeleton width="60%" height={18} />
              <Skeleton width="80%" height={13} />
            </View>
          </>
        )}
      </View>

      {role === 'agence' ? (
        <ListSection title={t('profile.home.myAgency')}>
          <ListRow icon={Building2} title={t('profile.home.agencyInfo')} onPress={() => router.push(`${base}/informations` as never)} />
          <ListRow
            icon={CreditCard}
            iconBackground={colors.gold}
            iconColor={colors.navy}
            title={t('profile.home.subscription')}
            subtitle={subscriptionSummary(profile)}
            onPress={() => router.push('/agence/profil/abonnement')}
          />
          <ListRow icon={KeyRound} iconBackground={colors.slate600} title={t('profile.home.password')} onPress={() => router.push(`${base}/securite` as never)} />
          <ListRow icon={Languages} iconBackground="#3B6FD8" title={t('profile.home.language')} value={languageLabel} onPress={chooseLanguage} />
        </ListSection>
      ) : (
        <>
          <ListSection title={t('profile.home.myAccount')}>
            <ListRow icon={UserRound} title={t('profile.home.personalInfo')} onPress={() => router.push(`${base}/informations` as never)} />
            <ListRow icon={KeyRound} iconBackground={colors.slate600} title={t('profile.home.password')} onPress={() => router.push(`${base}/securite` as never)} />
            <ListRow icon={Languages} iconBackground="#3B6FD8" title={t('profile.home.language')} value={languageLabel} onPress={chooseLanguage} />
          </ListSection>
          <ListSection>
            <ListRow icon={Target} iconBackground={colors.gold} iconColor={colors.navy} title={t('profile.home.myProject')} onPress={() => router.navigate('/acquereur/projet')} />
          </ListSection>
        </>
      )}

      <ListSection title={t('profile.home.help')}>
        <ListRow icon={BookOpen} iconBackground={colors.success} title={t('profile.home.tips')} onPress={() => router.push('/blog')} />
        <ListRow icon={LifeBuoy} iconBackground="#3B6FD8" title={t('profile.home.contactSupport')} value={SUPPORT_EMAIL} onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}`)} />
      </ListSection>

      <ListSection title={t('profile.home.legalInfo')}>
        <ListRow icon={Scale} iconBackground={colors.slate500} title={t('profile.home.legalNotice')} onPress={() => openLegal('mentions-legales')} />
        <ListRow icon={Shield} iconBackground={colors.slate500} title={t('profile.home.privacy')} onPress={() => openLegal('confidentialite')} />
        <ListRow icon={FileText} iconBackground={colors.slate500} title={t('profile.home.terms')} onPress={() => openLegal('cgu')} />
      </ListSection>

      <ListSection>
        <ListRow icon={LogOut} destructive title={t('profile.home.signOut')} onPress={confirmSignOut} />
        <ListRow icon={Trash2} destructive title={t('profile.home.deleteAccount')} onPress={requestDeletion} />
      </ListSection>

      <Text variant="caption" center>
        {t('profile.home.version', { version: Constants.expoConfig?.version ?? '1.0.0' })}
      </Text>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.screen, gap: 26, paddingBottom: 48 },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
  },
  rolePill: {
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: colors.goldSoft,
  },
  roleText: { fontFamily: fonts.semibold, fontSize: 12, color: colors.goldDeep },
})
