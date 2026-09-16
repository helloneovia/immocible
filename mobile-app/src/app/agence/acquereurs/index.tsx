import { useCallback, useMemo, useState } from 'react'
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native'
import { router, Stack, useFocusEffect } from 'expo-router'
import { ChevronRight, Crown, MapPin, SearchX, TriangleAlert, Users } from 'lucide-react-native'
import { ScoreRing } from '@/components/brand/TargetRing'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { Chip, ChipRow } from '@/components/ui/Chips'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { Text } from '@/components/ui/Text'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { compactEuro, formatDate } from '@/lib/format'
import { useStatusBar } from '@/lib/hooks'
import { capitalize, delaiShortLabel } from '@/lib/labels'
import { largeTitleScrollProps } from '@/lib/navigation'
import { dossierCompletion } from '@/lib/projet'
import { parseCaracteristiques, typesLabel } from '@/lib/recherche'
import type { Recherche } from '@/lib/types'
import { colors, fonts, radius, spacing } from '@/theme'

type Filters = { location: string; type: 'all' | 'appartement' | 'maison'; budgetMin: number; surfaceMin: number; complete: boolean }
const NO_FILTERS: Filters = { location: '', type: 'all', budgetMin: 0, surfaceMin: 0, complete: false }

const BUDGET_PRESETS = [0, 200_000, 400_000, 600_000, 1_000_000]
const SURFACE_PRESETS = [0, 30, 50, 80, 120]

/** Mêmes règles que le tableau de bord agence web, plus le filtre « dossier complet ». */
function applyFilters(searches: Recherche[], f: Filters) {
  return searches.filter((search) => {
    if (f.location) {
      const q = f.location.toLowerCase()
      if (!search.localisation?.some((zone) => zone.toLowerCase().includes(q))) return false
    }
    if (f.budgetMin && (search.prixMax || 0) < f.budgetMin) return false
    if (f.surfaceMin && (search.surfaceMin || 0) < f.surfaceMin) return false
    if (f.type !== 'all' && !search.typeBien?.some((t) => t.toLowerCase() === f.type)) return false
    if (f.complete && dossierCompletion(search) < 0.75) return false
    return true
  })
}

function LeadCard({ search }: { search: Recherche }) {
  const c = parseCaracteristiques(search)
  const first = capitalize(search.owner?.profile?.prenom?.trim() || '') || 'Acquéreur'
  const initial = search.owner?.profile?.nom?.trim().charAt(0).toUpperCase()
  const name = initial ? `${first} ${initial}.` : first
  const completion = dossierCompletion(search)
  const urgent = c.delaiRecherche === 'urgent' || c.delaiRecherche === '1-3'

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${name}, budget ${compactEuro(search.prixMax)}, ${(search.localisation || []).join(', ')}`}
      onPress={() => search.owner?.id && router.push({ pathname: '/profil/[id]', params: { id: search.owner.id } })}
      style={({ pressed }) => [styles.card, pressed ? { transform: [{ scale: 0.985 }] } : null]}
    >
      <View style={styles.cardTop}>
        <ScoreRing value={completion} size={48} label="Dossier" />
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="headline" numberOfLines={1}>
            {name}
          </Text>
          <Text variant="footnote">Mis à jour le {formatDate(search.updatedAt)}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.budget}>{compactEuro(search.prixMax)}</Text>
          <Text variant="caption">budget max.</Text>
        </View>
      </View>
      <View style={styles.location}>
        <MapPin size={15} color={colors.text3} />
        <Text numberOfLines={1} style={styles.locationText}>
          {(search.localisation || []).join(', ') || (c.drawnArea ? 'Zone dessinée sur carte' : 'Secteur non précisé')}
        </Text>
      </View>
      <View style={styles.tags}>
        {search.typeBien?.length ? <Text style={styles.tag}>{typesLabel(search.typeBien)}</Text> : null}
        {search.nombrePieces?.length ? <Text style={styles.tag}>{search.nombrePieces.join(', ')} p.</Text> : null}
        {search.surfaceMin ? <Text style={styles.tag}>{search.surfaceMin} m²+</Text> : null}
        {c.delaiRecherche ? (
          <Text style={[styles.tag, urgent ? styles.tagUrgent : null]}>{delaiShortLabel(c.delaiRecherche)}</Text>
        ) : null}
        <View style={{ flex: 1 }} />
        <ChevronRight size={18} color={colors.slate300} />
      </View>
    </Pressable>
  )
}

export default function AcquereursScreen() {
  const { user } = useAuth()
  const [searches, setSearches] = useState<Recherche[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filters, setFilters] = useState<Filters>(NO_FILTERS)
  const [sheet, setSheet] = useState<'budget' | 'surface' | null>(null)
  useStatusBar('dark')

  const load = useCallback(async () => {
    try {
      const response = await api<{ data: Recherche[] }>('/api/agence/recherches')
      setSearches(response?.data || [])
    } catch {
      // liste précédente conservée
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      load()
    }, [load]),
  )

  const filtered = useMemo(() => applyFilters(searches, filters), [searches, filters])
  const active = filters.type !== 'all' || !!filters.budgetMin || !!filters.surfaceMin || filters.complete || !!filters.location

  const end = user?.profile?.subscriptionEndDate ? new Date(user.profile.subscriptionEndDate).getTime() : null
  const expiresSoon = end !== null && end > Date.now() && end - Date.now() < 7 * 24 * 60 * 60 * 1000
  const expired = end !== null && end <= Date.now()
  const yearly = user?.profile?.plan === 'yearly'

  const header = (
    <View style={styles.header}>
      {expired || expiresSoon ? (
        <Pressable accessibilityRole="button" onPress={() => router.navigate('/agence/profil/abonnement')} style={styles.alert}>
          <TriangleAlert size={18} color={colors.goldDeep} />
          <Text style={styles.alertText}>
            {expired ? 'Abonnement expiré : la messagerie est suspendue.' : 'Votre abonnement expire dans moins de 7 jours.'}
          </Text>
          <ChevronRight size={16} color={colors.goldDeep} />
        </Pressable>
      ) : null}

      {!yearly && !expired ? (
        <Pressable accessibilityRole="button" onPress={() => router.navigate('/agence/profil/abonnement')} style={styles.upsell}>
          <View style={styles.crown}>
            <Crown size={18} color={colors.navy} />
          </View>
          {/* Sans abonnement (paiement jamais finalisé), proposer l'activation plutôt que l'annuel. */}
          <View style={{ flex: 1 }}>
            <Text style={styles.upsellTitle}>{end === null ? 'Activez votre abonnement' : "Passez à l'annuel"}</Text>
            <Text style={styles.upsellText}>
              {end === null ? 'Contactez les acquéreurs qualifiés' : 'Contacts illimités · 2 mois offerts'}
            </Text>
          </View>
          <ChevronRight size={18} color="rgba(255,255,255,0.6)" />
        </Pressable>
      ) : null}

      <View style={styles.countRow}>
        <Text variant="title3">
          {loading ? 'Chargement…' : `${filtered.length} acquéreur${filtered.length > 1 ? 's' : ''}`}
        </Text>
        {active ? (
          <Pressable accessibilityRole="button" hitSlop={10} onPress={() => setFilters(NO_FILTERS)}>
            <Text style={styles.reset}>Réinitialiser</Text>
          </Pressable>
        ) : (
          <Text variant="footnote">Les plus récents d'abord</Text>
        )}
      </View>

      <View style={styles.chipsBleed}>
        <ChipRow>
          <Chip label="Tous types" selected={filters.type === 'all'} onPress={() => setFilters((f) => ({ ...f, type: 'all' }))} />
          <Chip label="Appartement" selected={filters.type === 'appartement'} onPress={() => setFilters((f) => ({ ...f, type: 'appartement' }))} />
          <Chip label="Maison" selected={filters.type === 'maison'} onPress={() => setFilters((f) => ({ ...f, type: 'maison' }))} />
          <Chip
            label={filters.budgetMin ? `Budget ${compactEuro(filters.budgetMin)}+` : 'Budget'}
            dropdown
            selected={!!filters.budgetMin}
            onPress={() => setSheet('budget')}
          />
          <Chip
            label={filters.surfaceMin ? `${filters.surfaceMin} m²+` : 'Surface'}
            dropdown
            selected={!!filters.surfaceMin}
            onPress={() => setSheet('surface')}
          />
          <Chip label="Dossier complet" selected={filters.complete} onPress={() => setFilters((f) => ({ ...f, complete: !f.complete }))} />
        </ChipRow>
      </View>

      {loading
        ? Array.from({ length: 3 }, (_, i) => <Skeleton key={i} height={132} rounded={radius.lg} />)
        : null}
    </View>
  )

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Acquéreurs',
          headerSearchBarOptions: {
            placeholder: 'Ville ou secteur',
            hideWhenScrolling: false,
            onChangeText: (event) => {
              // Lu tout de suite : l'événement natif est vidé avant l'exécution de la mise à jour différée.
              const location = event.nativeEvent.text
              setFilters((f) => ({ ...f, location }))
            },
            onCancelButtonPress: () => setFilters((f) => ({ ...f, location: '' })),
          },
        }}
      />
      <FlatList
        {...largeTitleScrollProps}
        style={styles.root}
        data={loading ? [] : filtered}
        keyExtractor={(item) => item.id}
        keyboardDismissMode="on-drag"
        ListHeaderComponent={header}
        contentContainerStyle={styles.content}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true)
              load()
            }}
          />
        }
        ListEmptyComponent={
          loading ? null : (
            <EmptyState
              icon={active ? SearchX : Users}
              title={active ? 'Aucun acquéreur ne correspond' : 'Aucune recherche active'}
              message={active ? 'Élargissez les filtres pour voir plus de dossiers.' : 'Les nouveaux projets des acquéreurs apparaîtront ici.'}
              actionLabel={active ? 'Réinitialiser les filtres' : undefined}
              onAction={active ? () => setFilters(NO_FILTERS) : undefined}
            />
          )
        }
        renderItem={({ item }) => <LeadCard search={item} />}
      />

      <BottomSheet visible={sheet !== null} onClose={() => setSheet(null)} title={sheet === 'budget' ? 'Budget minimum' : 'Surface minimum'}>
        <View style={styles.presets}>
          {(sheet === 'budget' ? BUDGET_PRESETS : SURFACE_PRESETS).map((value) => {
            const selected = sheet === 'budget' ? filters.budgetMin === value : filters.surfaceMin === value
            const label = value === 0 ? 'Indifférent' : sheet === 'budget' ? `${compactEuro(value)} et plus` : `${value} m² et plus`
            return (
              <Chip
                key={value}
                large
                label={label}
                selected={selected}
                onPress={() => {
                  setFilters((f) => (sheet === 'budget' ? { ...f, budgetMin: value } : { ...f, surfaceMin: value }))
                  setSheet(null)
                }}
              />
            )
          })}
        </View>
      </BottomSheet>
    </>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.screen, paddingBottom: 40 },
  header: { gap: 14, marginBottom: 14 },
  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: colors.goldSoft,
  },
  alertText: { flex: 1, fontFamily: fonts.medium, fontSize: 14, color: colors.goldDeep },
  upsell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: radius.lg,
    backgroundColor: colors.navy,
  },
  crown: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  upsellTitle: { fontFamily: fonts.semibold, fontSize: 15, color: colors.surface },
  upsellText: { fontFamily: fonts.regular, fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  countRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 4 },
  reset: { fontFamily: fonts.semibold, fontSize: 14, color: colors.goldDeep },
  chipsBleed: { marginHorizontal: -spacing.screen },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16, gap: 12 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  budget: { fontFamily: fonts.bold, fontSize: 20, color: colors.ink, letterSpacing: -0.4 },
  location: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  locationText: { flex: 1, fontFamily: fonts.medium, fontSize: 15, color: colors.ink },
  tags: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  tag: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.text2,
    backgroundColor: colors.bg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: 'hidden',
  },
  tagUrgent: { backgroundColor: colors.goldSoft, color: colors.goldDeep },
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
})
