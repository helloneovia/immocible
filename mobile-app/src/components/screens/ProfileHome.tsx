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
import { api } from '@/lib/api'
import { formatDate } from '@/lib/format'
import { useStatusBar } from '@/lib/hooks'
import { openInApp, SUPPORT_EMAIL } from '@/lib/links'
import { largeTitleScrollProps } from '@/lib/navigation'
import type { AccountProfile } from '@/lib/types'
import { colors, fonts, radius, spacing } from '@/theme'

export function subscriptionSummary(profile: AccountProfile | null) {
  if (!profile?.subscriptionEndDate) return 'Aucun abonnement actif'
  const end = new Date(profile.subscriptionEndDate)
  const plan = profile.plan === 'yearly' ? 'Annuel' : 'Mensuel'
  return end.getTime() < Date.now() ? `${plan} · expiré le ${formatDate(end)}` : `${plan} · jusqu'au ${formatDate(end)}`
}

export function ProfileHome({ role }: { role: 'acquereur' | 'agence' }) {
  const { signOut } = useAuth()
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
      ? profile?.nomAgence || 'Votre agence'
      : `${profile?.prenom ?? ''} ${profile?.nom ?? ''}`.trim() || profile?.email || ''

  const confirmSignOut = () =>
    Alert.alert('Se déconnecter ?', 'Vous pourrez vous reconnecter à tout moment.', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Se déconnecter', style: 'destructive', onPress: () => signOut() },
    ])

  const requestDeletion = () =>
    Alert.alert(
      'Supprimer le compte',
      "La suppression est traitée par notre équipe. Un e-mail pré-rempli va s'ouvrir.",
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Écrire au support',
          style: 'destructive',
          onPress: () =>
            Linking.openURL(
              `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Suppression de mon compte')}&body=${encodeURIComponent(
                `Bonjour,\n\nMerci de supprimer mon compte IMMOCIBLE (${profile?.email ?? ''}).`,
              )}`,
            ),
        },
      ],
    )

  return (
    <ScrollView {...largeTitleScrollProps} style={styles.root} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: 'Profil' }} />

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
                <Text style={styles.roleText}>{role === 'agence' ? 'Compte agence' : 'Compte acquéreur'}</Text>
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
        <ListSection title="Mon agence">
          <ListRow icon={Building2} title="Informations de l'agence" onPress={() => router.push(`${base}/informations` as never)} />
          <ListRow
            icon={CreditCard}
            iconBackground={colors.gold}
            iconColor={colors.navy}
            title="Abonnement"
            subtitle={subscriptionSummary(profile)}
            onPress={() => router.push('/agence/profil/abonnement')}
          />
          <ListRow icon={KeyRound} iconBackground={colors.slate600} title="Mot de passe" onPress={() => router.push(`${base}/securite` as never)} />
        </ListSection>
      ) : (
        <>
          <ListSection title="Mon compte">
            <ListRow icon={UserRound} title="Informations personnelles" onPress={() => router.push(`${base}/informations` as never)} />
            <ListRow icon={KeyRound} iconBackground={colors.slate600} title="Mot de passe" onPress={() => router.push(`${base}/securite` as never)} />
          </ListSection>
          <ListSection>
            <ListRow icon={Target} iconBackground={colors.gold} iconColor={colors.navy} title="Mon projet" onPress={() => router.navigate('/acquereur/projet')} />
          </ListSection>
        </>
      )}

      <ListSection title="Aide">
        <ListRow icon={BookOpen} iconBackground={colors.success} title="Conseils immobiliers" onPress={() => router.push('/blog')} />
        <ListRow icon={LifeBuoy} iconBackground="#3B6FD8" title="Contacter le support" value={SUPPORT_EMAIL} onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}`)} />
      </ListSection>

      <ListSection title="Informations légales">
        <ListRow icon={Scale} iconBackground={colors.slate500} title="Mentions légales" onPress={() => openInApp('/mentions-legales')} />
        <ListRow icon={Shield} iconBackground={colors.slate500} title="Confidentialité" onPress={() => openInApp('/confidentialite')} />
        <ListRow icon={FileText} iconBackground={colors.slate500} title="Conditions générales" onPress={() => openInApp('/cgu')} />
      </ListSection>

      <ListSection>
        <ListRow icon={LogOut} destructive title="Se déconnecter" onPress={confirmSignOut} />
        <ListRow icon={Trash2} destructive title="Supprimer mon compte" onPress={requestDeletion} />
      </ListSection>

      <Text variant="caption" center>
        IMMOCIBLE · version {Constants.expoConfig?.version ?? '1.0.0'}
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
