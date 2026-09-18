import { useCallback, useState } from 'react'
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native'
import { router, Stack, useFocusEffect } from 'expo-router'
import { ShieldCheck } from 'lucide-react-native'
import { TargetRing } from '@/components/brand/TargetRing'
import { MapZoneModal, MapZonePreview } from '@/components/MapZone'
import { Button } from '@/components/ui/Button'
import { ListRow, ListSection } from '@/components/ui/List'
import { Skeleton } from '@/components/ui/Skeleton'
import { Text } from '@/components/ui/Text'
import { api } from '@/lib/api'
import { t } from '@/i18n'
import { formatEuro } from '@/lib/format'
import { useStatusBar } from '@/lib/hooks'
import {
  DELAI_RECHERCHE,
  DUREE_PRET,
  EXTRAS,
  FINANCEMENT,
  FLEXIBILITE,
  labelFor,
  NOMBRE_ENFANTS,
  SITUATION_FAMILIALE,
  SITUATION_PRO,
  typeBienLabel,
} from '@/lib/labels'
import { largeTitleScrollProps } from '@/lib/navigation'
import {
  budgetLabel,
  normalizeProject,
  projectCompletion,
  projectHeadline,
  projectRings,
  type SectionKey,
} from '@/lib/projet'
import type { QuestionnaireData } from '@/lib/types'
import { colors, fonts, radius, spacing } from '@/theme'

export default function ProjetScreen() {
  const NOT_SET = t('project.summary.notSet')
  const [project, setProject] = useState<QuestionnaireData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [mapOpen, setMapOpen] = useState(false)
  useStatusBar('dark')

  const load = useCallback(async () => {
    try {
      const { data } = await api<{ data: QuestionnaireData | null }>('/api/acquereur/questionnaire')
      setProject(data ? normalizeProject(data) : null)
    } catch {
      // état précédent conservé
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

  const edit = (section?: SectionKey) =>
    router.push(section ? { pathname: '/questionnaire', params: { section } } : '/questionnaire')

  const header = (
    <Stack.Screen
      options={{
        title: t('project.summary.title'),
        headerRight: project
          ? () => (
              <Pressable accessibilityRole="button" onPress={() => edit()} hitSlop={10}>
                <Text style={styles.headerAction}>{t('project.summary.editAll')}</Text>
              </Pressable>
            )
          : undefined,
      }}
    />
  )

  if (loading) {
    return (
      <ScrollView {...largeTitleScrollProps} style={styles.root} contentContainerStyle={styles.content}>
        {header}
        <Skeleton height={140} rounded={radius.xl} />
        <Skeleton height={160} rounded={radius.lg} />
        <Skeleton height={160} rounded={radius.lg} />
      </ScrollView>
    )
  }

  if (!project) {
    return (
      <ScrollView {...largeTitleScrollProps} style={styles.root} contentContainerStyle={[styles.content, styles.empty]}>
        {header}
        <TargetRing rings={projectRings(normalizeProject(null))} size={168} dark={false} />
        <View style={{ gap: 8 }}>
          <Text variant="title2" center>
            {t('project.summary.emptyTitle')}
          </Text>
          <Text variant="subhead" center>
            {t('project.summary.emptyText')}
          </Text>
        </View>
        <Button title={t('project.summary.start')} size="lg" onPress={() => edit()} />
      </ScrollView>
    )
  }

  const p = project
  const extras = EXTRAS.filter(({ key }) => p[key]).map(({ label }) => label)
  const pct = Math.round(projectCompletion(p) * 100)

  return (
    <ScrollView
      {...largeTitleScrollProps}
      style={styles.root}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true)
            load()
          }}
        />
      }
    >
      {header}

      <View style={styles.summary}>
        <TargetRing rings={projectRings(p)} size={92} dark={false} />
        <View style={{ flex: 1, gap: 4 }}>
          <Text variant="headline" numberOfLines={2}>
            {projectHeadline(p)}
          </Text>
          <Text variant="subhead">{budgetLabel(p.budgetMin, p.budgetMax)}</Text>
          <Text style={[styles.pct, pct >= 100 ? { color: colors.success } : null]}>
            {pct >= 100 ? t('project.summary.complete') : t('project.summary.completePct', { pct })}
          </Text>
        </View>
      </View>

      <ListSection title={t('project.summary.property')} action={{ label: t('project.summary.edit'), onPress: () => edit('bien') }}>
        <ListRow title={t('project.summary.type')} value={p.typeBien.map(typeBienLabel).join(', ') || NOT_SET} />
        <ListRow title={t('project.summary.rooms')} value={p.nombrePieces.length ? p.nombrePieces.join(', ') : NOT_SET} />
        <ListRow
          title={t('project.summary.surface')}
          value={
            p.surfaceMin || p.surfaceMax
              ? t('project.summary.surfaceRange', { min: p.surfaceMin || '—', max: p.surfaceMax || '—' })
              : NOT_SET
          }
        />
      </ListSection>

      <ListSection title={t('project.summary.budgetSection')} action={{ label: t('project.summary.edit'), onPress: () => edit('budget') }}>
        <ListRow title={t('project.summary.budget')} value={budgetLabel(p.budgetMin, p.budgetMax)} />
        <ListRow title={t('project.summary.deposit')} value={p.apport ? formatEuro(p.apport) : NOT_SET} />
        <ListRow title={t('project.summary.financing')} value={labelFor(FINANCEMENT, p.financement, NOT_SET)} />
        {p.financement !== 'cash' ? <ListRow title={t('project.summary.loanDuration')} value={labelFor(DUREE_PRET, p.dureePret, NOT_SET)} /> : null}
      </ListSection>

      <ListSection title={t('project.summary.location')} action={{ label: t('project.summary.edit'), onPress: () => edit('lieu') }}>
        <ListRow title={t('project.summary.cities')} subtitle={p.localisation.join(' · ') || NOT_SET} multiline />
        <ListRow title={t('project.summary.drawnArea')} value={p.drawnArea ? t('project.summary.yes') : t('project.summary.none')} />
      </ListSection>
      {p.drawnArea ? (
        <>
          <MapZonePreview value={p.drawnArea} height={170} onPress={() => setMapOpen(true)} />
          <MapZoneModal visible={mapOpen} value={p.drawnArea} readOnly onClose={() => setMapOpen(false)} />
        </>
      ) : null}

      <ListSection title={t('project.summary.extrasSection')} action={{ label: t('project.summary.edit'), onPress: () => edit('criteres') }}>
        <ListRow title={t('project.summary.extras')} subtitle={extras.join(' · ') || t('project.summary.noExtras')} multiline />
        {p.commentaires ? <ListRow title={t('project.summary.details')} subtitle={p.commentaires} multiline /> : null}
      </ListSection>

      <ListSection title={t('project.summary.situationSection')} action={{ label: t('project.summary.edit'), onPress: () => edit('situation') }}>
        <ListRow title={t('project.summary.family')} value={labelFor(SITUATION_FAMILIALE, p.situationFamiliale, NOT_SET)} />
        <ListRow title={t('project.summary.children')} value={labelFor(NOMBRE_ENFANTS, p.nombreEnfants, NOT_SET)} />
        <ListRow title={t('project.summary.profession')} value={labelFor(SITUATION_PRO, p.situationProfessionnelle, NOT_SET)} />
        <ListRow title={t('project.summary.income')} value={p.salaire ? formatEuro(p.salaire) : NOT_SET} />
        <ListRow title={t('project.summary.assets')} value={p.patrimoine ? formatEuro(p.patrimoine) : NOT_SET} />
      </ListSection>

      <ListSection title={t('project.summary.timingSection')} action={{ label: t('project.summary.edit'), onPress: () => edit('calendrier') }}>
        <ListRow title={t('project.summary.delay')} value={labelFor(DELAI_RECHERCHE, p.delaiRecherche, NOT_SET)} />
        <ListRow title={t('project.summary.flexibility')} value={labelFor(FLEXIBILITE, p.flexibilite, NOT_SET).split(' (')[0]} />
      </ListSection>

      <View style={styles.privacy}>
        <ShieldCheck size={18} color={colors.success} />
        <Text variant="footnote" style={{ flex: 1 }}>
          {t('project.summary.privacy')}
        </Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.screen, gap: 24, paddingBottom: 48 },
  empty: { alignItems: 'center', paddingTop: 32, gap: 24 },
  headerAction: { fontFamily: fonts.semibold, fontSize: 16, color: colors.navy },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
  },
  pct: { fontFamily: fonts.semibold, fontSize: 13, color: colors.goldDeep },
  privacy: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: spacing.lg },
})
