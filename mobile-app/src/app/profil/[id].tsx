import { useCallback, useState } from 'react'
import { Alert, Linking, ScrollView, StyleSheet, View } from 'react-native'
import { router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router'
import { Lock, Mail, MapPin, MessageSquare, Phone, Unlock, UserX } from 'lucide-react-native'
import { ScoreRing } from '@/components/brand/TargetRing'
import { MapZoneModal, MapZonePreview } from '@/components/MapZone'
import { openConversation } from '@/components/screens/MessagesList'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ListRow, ListSection } from '@/components/ui/List'
import { Skeleton } from '@/components/ui/Skeleton'
import { StickyFooter } from '@/components/ui/StickyFooter'
import { Text } from '@/components/ui/Text'
import { api, ApiError, errorMessage } from '@/lib/api'
import { compactEuro, formatEuro } from '@/lib/format'
import { useStatusBar } from '@/lib/hooks'
import {
  DUREE_PRET,
  EXTRAS,
  FINANCEMENT,
  FLEXIBILITE,
  labelFor,
  NOMBRE_ENFANTS,
  SITUATION_FAMILIALE,
  SITUATION_PRO,
  delaiShortLabel,
} from '@/lib/labels'
import { pushedScreenOptions } from '@/lib/navigation'
import { budgetLabel, dossierCompletion } from '@/lib/projet'
import { parseCaracteristiques, typesLabel } from '@/lib/recherche'
import type { BuyerDetails } from '@/lib/types'
import { colors, fonts, radius, spacing } from '@/theme'

const NOT_SET = 'Non renseigné'

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fact}>
      <Text numberOfLines={1} style={styles.factValue}>
        {value}
      </Text>
      <Text variant="caption">{label}</Text>
    </View>
  )
}

/** Dossier acquéreur vu par une agence. */
export default function BuyerDossierScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [buyer, setBuyer] = useState<BuyerDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [unlocking, setUnlocking] = useState(false)
  const [chatting, setChatting] = useState(false)
  const [mapOpen, setMapOpen] = useState(false)
  useStatusBar('dark')

  const load = useCallback(async () => {
    try {
      setBuyer(await api<BuyerDetails>(`/api/agence/buyer/${encodeURIComponent(id)}`))
    } catch {
      setBuyer(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  // Rechargé au retour de l'écran de paiement.
  useFocusEffect(
    useCallback(() => {
      load()
    }, [load]),
  )

  const screen = <Stack.Screen options={{ ...pushedScreenOptions, title: 'Dossier acquéreur' }} />

  if (loading) {
    return (
      <ScrollView style={styles.root} contentContainerStyle={styles.content}>
        {screen}
        <Skeleton height={200} rounded={radius.xxl} />
        <Skeleton height={80} rounded={radius.lg} />
        <Skeleton height={220} rounded={radius.lg} />
      </ScrollView>
    )
  }

  if (!buyer) {
    return (
      <View style={[styles.root, { justifyContent: 'center' }]}>
        {screen}
        <EmptyState
          icon={UserX}
          title="Dossier introuvable"
          message="Cet acquéreur a peut-être désactivé sa recherche."
          actionLabel="Retour"
          onAction={() => router.back()}
        />
      </View>
    )
  }

  const { profile, unlocked, price, search } = buyer
  const c = parseCaracteristiques(search)
  const fullName = `${profile.prenom || ''} ${profile.nom || ''}`.replace(/\s+/g, ' ').trim() || 'Acquéreur'
  const extras = EXTRAS.filter(({ key }) => c[key]).map(({ label }) => label)
  const completion = search ? dossierCompletion(search) : 0

  const unlock = () =>
    Alert.alert(
      'Débloquer les coordonnées',
      price > 0 ? `Paiement unique de ${price} € pour afficher l'e-mail et le téléphone.` : 'Ce dossier est gratuit à débloquer.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: price > 0 ? `Payer ${price} €` : 'Débloquer',
          onPress: async () => {
            setUnlocking(true)
            try {
              const result = await api<{ clientSecret?: string }>('/api/payment/unlock', {
                method: 'POST',
                body: { buyerId: id, amount: price },
              })
              if (result?.clientSecret) router.push(`/paiement?clientSecret=${encodeURIComponent(result.clientSecret)}&kind=unlock&buyerId=${encodeURIComponent(id)}` as never)
              else await load()
            } catch (err) {
              Alert.alert('Déblocage impossible', errorMessage(err))
            } finally {
              setUnlocking(false)
            }
          },
        },
      ],
    )

  const chat = async () => {
    setChatting(true)
    try {
      const data = await api<{ conversationId: string }>('/api/chat/initiate', { method: 'POST', body: { buyerId: id } })
      openConversation(data.conversationId, fullName, 'Acquéreur')
    } catch (err) {
      const limit = err instanceof ApiError && err.data?.limitReached
      Alert.alert(
        'Discussion impossible',
        limit ? 'Limite mensuelle de contacts atteinte. Passez à l’annuel pour des échanges illimités.' : errorMessage(err),
      )
    } finally {
      setChatting(false)
    }
  }

  return (
    <View style={styles.root}>
      {screen}
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Avatar name={fullName} size={76} />
          <View style={{ alignItems: 'center', gap: 4 }}>
            <Text variant="title2" center>
              {fullName}
            </Text>
            <View style={styles.city}>
              <MapPin size={14} color={colors.text3} />
              {/* L'inscription ne demande pas de ville : on retombe sur les secteurs recherchés. */}
              <Text variant="footnote" numberOfLines={1}>
                {profile.ville || search?.localisation?.join(', ') || 'Ville non renseignée'}
              </Text>
            </View>
          </View>
          <View style={styles.heroPills}>
            <View style={styles.pill}>
              <ScoreRing value={completion} size={30} label="Dossier" />
              <Text style={styles.pillText}>Dossier complet à {Math.round(completion * 100)} %</Text>
            </View>
            <View style={[styles.pill, unlocked ? { backgroundColor: colors.successSoft } : null]}>
              {unlocked ? <Unlock size={15} color={colors.success} /> : <Lock size={15} color={colors.text2} />}
              <Text style={[styles.pillText, unlocked ? { color: colors.success } : null]}>
                {unlocked ? 'Débloqué' : 'Coordonnées masquées'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.facts}>
          <Fact label="Budget max." value={compactEuro(search?.prixMax)} />
          <View style={styles.factDivider} />
          <Fact label="Pièces" value={search?.nombrePieces?.length ? search.nombrePieces.join(', ') : '—'} />
          <View style={styles.factDivider} />
          <Fact label="Délai" value={c.delaiRecherche ? delaiShortLabel(c.delaiRecherche) : '—'} />
        </View>

        {c.drawnArea ? (
          <View style={{ gap: 6 }}>
            <Text variant="footnote" style={styles.sectionLabel}>
              Zone de recherche
            </Text>
            <MapZonePreview value={c.drawnArea} height={180} onPress={() => setMapOpen(true)} />
            <MapZoneModal visible={mapOpen} value={c.drawnArea} readOnly onClose={() => setMapOpen(false)} />
          </View>
        ) : null}

        <ListSection title="Recherche">
          <ListRow title="Type de bien" value={typesLabel(search?.typeBien) || NOT_SET} />
          <ListRow title="Secteurs" subtitle={search?.localisation?.join(' · ') || NOT_SET} multiline />
          <ListRow
            title="Surface"
            value={search?.surfaceMin || search?.surfaceMax ? `${search?.surfaceMin || '—'} à ${search?.surfaceMax || '—'} m²` : NOT_SET}
          />
          <ListRow title="Équipements" subtitle={extras.join(' · ') || 'Aucun en particulier'} multiline />
          <ListRow title="Flexibilité" value={labelFor(FLEXIBILITE, c.flexibilite, NOT_SET).split(' (')[0]} />
          {c.commentaires ? <ListRow title="Précisions" subtitle={`« ${c.commentaires} »`} multiline /> : null}
        </ListSection>

        <ListSection title="Financement">
          <ListRow title="Budget" value={budgetLabel(search?.prixMin, search?.prixMax)} />
          <ListRow title="Apport" value={c.apport ? formatEuro(c.apport) : NOT_SET} />
          <ListRow title="Financement" value={labelFor(FINANCEMENT, search?.financement, NOT_SET)} />
          <ListRow title="Durée du prêt" value={labelFor(DUREE_PRET, c.dureePret, NOT_SET)} />
        </ListSection>

        <ListSection title="Situation">
          <ListRow title="Profession" value={labelFor(SITUATION_PRO, c.situationProfessionnelle, NOT_SET)} />
          <ListRow title="Revenus nets / mois" value={c.salaire ? formatEuro(c.salaire) : NOT_SET} />
          <ListRow title="Patrimoine" value={c.patrimoine ? formatEuro(c.patrimoine) : NOT_SET} />
          <ListRow title="Situation familiale" value={labelFor(SITUATION_FAMILIALE, c.situationFamiliale, NOT_SET)} />
          <ListRow title="Enfants" value={labelFor(NOMBRE_ENFANTS, c.nombreEnfants, 'Aucun')} />
        </ListSection>

        <ListSection
          title="Coordonnées"
          footer={unlocked ? undefined : "Débloquez le dossier pour afficher l'e-mail et le téléphone de l'acquéreur."}
        >
          <ListRow
            icon={Mail}
            iconBackground={unlocked ? colors.navy : colors.slate300}
            title={unlocked ? profile.email : 'E-mail masqué'}
            onPress={unlocked ? () => Linking.openURL(`mailto:${profile.email}`) : undefined}
          />
          <ListRow
            icon={Phone}
            iconBackground={unlocked ? colors.success : colors.slate300}
            title={unlocked ? profile.telephone || NOT_SET : 'Téléphone masqué'}
            onPress={unlocked && profile.telephone ? () => Linking.openURL(`tel:${profile.telephone!.replace(/\s/g, '')}`) : undefined}
          />
        </ListSection>
      </ScrollView>

      <StickyFooter>
        <View style={styles.actions}>
          <Button
            title="Discuter"
            icon={MessageSquare}
            variant={unlocked ? 'primary' : 'secondary'}
            size="lg"
            loading={chatting}
            onPress={chat}
            style={{ flex: 1 }}
          />
          {!unlocked ? (
            <Button
              title={price > 0 ? `Débloquer · ${price} €` : 'Débloquer'}
              icon={Unlock}
              variant="accent"
              size="lg"
              loading={unlocking}
              onPress={unlock}
              style={{ flex: 1.2 }}
            />
          ) : profile.telephone ? (
            <Button
              title="Appeler"
              icon={Phone}
              variant="secondary"
              size="lg"
              onPress={() => Linking.openURL(`tel:${profile.telephone!.replace(/\s/g, '')}`)}
              style={{ flex: 1 }}
            />
          ) : null}
        </View>
      </StickyFooter>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.screen, gap: 22, paddingBottom: 32 },
  hero: { alignItems: 'center', gap: 12, padding: 20, borderRadius: radius.xxl, backgroundColor: colors.surface },
  city: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  heroPills: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 6,
    paddingRight: 12,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: colors.bg,
  },
  pillText: { fontFamily: fonts.medium, fontSize: 13, color: colors.text2 },
  facts: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: 14,
  },
  fact: { flex: 1, alignItems: 'center', gap: 2, paddingHorizontal: 6 },
  factValue: { fontFamily: fonts.bold, fontSize: 18, color: colors.ink },
  factDivider: { width: StyleSheet.hairlineWidth, alignSelf: 'stretch', backgroundColor: colors.separator },
  sectionLabel: { fontFamily: fonts.semibold, color: colors.text3, paddingHorizontal: spacing.lg },
  actions: { flexDirection: 'row', gap: 10 },
})
