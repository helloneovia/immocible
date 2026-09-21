import { useEffect, useState } from 'react'
import { Alert, KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import Animated, { FadeIn, FadeOut, SlideInLeft, SlideInRight } from 'react-native-reanimated'
import {
  ArrowLeft,
  ArrowLeftRight,
  ArrowUpDown,
  BedSingle,
  Building2,
  Car,
  Ellipsis,
  Fence,
  Flower2,
  Home,
  Landmark,
  Layers,
  Map as MapIcon,
  Sparkles,
  Sun,
  Trash2,
  Trees,
  Wallet,
  Warehouse,
  Wine,
  X,
  type LucideIcon,
} from 'lucide-react-native'
import { LocationAutocomplete } from '@/components/LocationAutocomplete'
import { LocationButton } from '@/components/LocationButton'
import { MapZoneModal, MapZonePreview } from '@/components/MapZone'
import { Button } from '@/components/ui/Button'
import { Chip } from '@/components/ui/Chips'
import { Tag } from '@/components/ui/ChoiceTile'
import { OptionCard } from '@/components/ui/OptionCard'
import { RangeSlider } from '@/components/ui/RangeSlider'
import { Skeleton } from '@/components/ui/Skeleton'
import { StickyFooter } from '@/components/ui/StickyFooter'
import { Text } from '@/components/ui/Text'
import { TextField } from '@/components/ui/TextField'
import { t, type TKey } from '@/i18n'
import { api, errorMessage } from '@/lib/api'
import { formatNumber } from '@/lib/format'
import { useStatusBar } from '@/lib/hooks'
import {
  DELAI_RECHERCHE,
  DUREE_PRET,
  FINANCEMENT,
  FLEXIBILITE,
  NOMBRE_ENFANTS,
  NOMBRE_PIECES,
  SITUATION_FAMILIALE,
  SITUATION_PRO,
  TYPES_BIEN,
} from '@/lib/labels'
import {
  flagProjectSaved,
  BUDGET_STEPS,
  EMPTY_PROJECT,
  normalizeProject,
  SECTION_STEPS,
  STEP_ORDER,
  type SectionKey,
  type StepKey,
} from '@/lib/projet'
import type { QuestionnaireData } from '@/lib/types'
import { colors, fonts, radius, spacing } from '@/theme'

const TYPE_ICONS: Record<string, LucideIcon> = {
  appartement: Building2,
  maison: Home,
  terrain: Trees,
  studio: BedSingle,
  loft: Warehouse,
  duplex: Layers,
  penthouse: Sparkles,
}

const FINANCEMENT_ICONS: Record<string, LucideIcon> = {
  'pret-bancaire': Landmark,
  'pret-relais': ArrowLeftRight,
  cash: Wallet,
  mixte: Layers,
  autre: Ellipsis,
}

type EquipementKey = 'balcon' | 'terrasse' | 'jardin' | 'parking' | 'cave' | 'ascenseur'

const EQUIPEMENTS: { key: EquipementKey; icon: LucideIcon }[] = [
  { key: 'balcon', icon: Fence },
  { key: 'terrasse', icon: Sun },
  { key: 'jardin', icon: Flower2 },
  { key: 'parking', icon: Car },
  { key: 'cave', icon: Wine },
  { key: 'ascenseur', icon: ArrowUpDown },
]

/** Question affichée pour chaque étape (traduite au rendu). */
const WITHOUT_HELP: StepKey[] = ['financement', 'calendrier']

function question(step: StepKey): { title: string; help?: string } {
  return {
    title: t(`questionnaire.steps.${step}.title`),
    help: WITHOUT_HELP.includes(step) ? undefined : t(`questionnaire.steps.${step}.help` as TKey),
  }
}

const digits = (value: string) => value.replace(/\D/g, '')

function Grid<T>({ items, columns = 2, render }: { items: T[]; columns?: number; render: (item: T) => React.ReactNode }) {
  const rows: T[][] = []
  for (let i = 0; i < items.length; i += columns) rows.push(items.slice(i, i + columns))
  return (
    <View style={{ gap: 10 }}>
      {rows.map((row, i) => (
        <View key={i} style={{ flexDirection: 'row', gap: 10 }}>
          {row.map(render)}
          {Array.from({ length: columns - row.length }, (_, k) => (
            <View key={`pad-${k}`} style={{ flex: 1 }} />
          ))}
        </View>
      ))}
    </View>
  )
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 10 }}>
      <Text variant="label">{label}</Text>
      <View style={styles.wrap}>{children}</View>
    </View>
  )
}

/** Questionnaire acquéreur : une question par écran, ou une seule section depuis « Mon projet ». */
export default function QuestionnaireScreen() {
  const insets = useSafeAreaInsets()
  const { section } = useLocalSearchParams<{ section?: SectionKey }>()
  const steps = section && SECTION_STEPS[section] ? SECTION_STEPS[section] : STEP_ORDER
  const singleSection = steps !== STEP_ORDER
  const [index, setIndex] = useState(0)
  const [forward, setForward] = useState(true)
  const [data, setData] = useState<QuestionnaireData>(EMPTY_PROJECT)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [mapOpen, setMapOpen] = useState(false)
  useStatusBar('dark')

  useEffect(() => {
    api<{ data: QuestionnaireData | null }>('/api/acquereur/questionnaire')
      .then(({ data: saved }) => setData(normalizeProject(saved)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const set = <K extends keyof QuestionnaireData>(key: K, value: QuestionnaireData[K]) =>
    setData((prev) => ({ ...prev, [key]: value }))

  const toggle = (key: 'typeBien' | 'nombrePieces' | 'localisation', value: string) =>
    setData((prev) => ({
      ...prev,
      [key]: prev[key].includes(value) ? prev[key].filter((v) => v !== value) : [...prev[key], value],
    }))

  const step = steps[index]
  const isLast = index === steps.length - 1
  // Erreur affichée seulement après une tentative de passage à l'étape suivante.
  const [attempted, setAttempted] = useState(false)

  const inverted = (min: string, max: string) => !!min && !!max && Number(max) > 0 && Number(min) > Number(max)
  const errorFor = (key: string): string | null => {
    if (key === 'budget' && inverted(data.budgetMin, data.budgetMax)) return t('questionnaire.errors.budgetRange')
    if (key === 'pieces' && inverted(data.surfaceMin, data.surfaceMax)) return t('questionnaire.errors.surfaceRange')
    return null
  }
  const stepError = attempted ? errorFor(step) : null

  const go = (next: number) => {
    if (next > index && errorFor(step)) {
      setAttempted(true)
      return
    }
    setAttempted(false)
    setForward(next > index)
    setIndex(next)
  }

  const save = async () => {
    // Une étape précédente peut avoir été passée avec une fourchette incohérente.
    const invalid = steps.findIndex((key) => errorFor(key))
    if (invalid !== -1) {
      setForward(invalid > index)
      setIndex(invalid)
      setAttempted(true)
      return
    }
    setSaving(true)
    try {
      await api('/api/acquereur/questionnaire', { method: 'POST', body: data })
      if (!section) flagProjectSaved()
      router.back()
    } catch (err) {
      Alert.alert(t('questionnaire.saveErrorTitle'), errorMessage(err, t('questionnaire.saveErrorMessage')))
      setSaving(false)
    }
  }

  const close = () => {
    Alert.alert(t('questionnaire.quitTitle'), t('questionnaire.quitMessage'), [
      { text: t('questionnaire.continue'), style: 'cancel' },
      { text: t('questionnaire.quit'), style: 'destructive', onPress: () => router.back() },
    ])
  }

  const renderStep = () => {
    switch (step) {
      case 'type':
        return (
          <Grid
            items={TYPES_BIEN}
            render={(option) => (
              <OptionCard
                key={option.value}
                layout="tile"
                multiple
                label={option.label}
                icon={TYPE_ICONS[option.value]}
                selected={data.typeBien.includes(option.value)}
                onPress={() => toggle('typeBien', option.value)}
              />
            )}
          />
        )
      case 'pieces':
        return (
          <>
            <Group label={t('questionnaire.roomsLabel')}>
              {NOMBRE_PIECES.map((pieces) => (
                <Chip
                  key={pieces}
                  large
                  label={pieces === '1' ? t('questionnaire.oneRoom') : t('questionnaire.rooms', { count: pieces })}
                  selected={data.nombrePieces.includes(pieces)}
                  onPress={() => toggle('nombrePieces', pieces)}
                />
              ))}
            </Group>
            <View style={styles.row}>
              <View style={styles.flex}>
                <TextField
                  tone="surface"
                  label={t('questionnaire.surfaceMin')}
                  value={data.surfaceMin}
                  onChangeText={(v) => set('surfaceMin', digits(v))}
                  placeholder="50"
                  keyboardType="number-pad"
                />
              </View>
              <View style={styles.flex}>
                <TextField
                  tone="surface"
                  label={t('questionnaire.surfaceMax')}
                  value={data.surfaceMax}
                  onChangeText={(v) => set('surfaceMax', digits(v))}
                  error={stepError}
                  placeholder="120"
                  keyboardType="number-pad"
                />
              </View>
            </View>
          </>
        )
      case 'budget': {
        const low = parseInt(data.budgetMin, 10) || 200_000
        const high = parseInt(data.budgetMax, 10) || 500_000
        const defined = !!data.budgetMax
        return (
          <>
            <View style={styles.budgetCard}>
              <Text style={styles.budgetValue} accessibilityLiveRegion="polite">
                {t('questionnaire.budgetValue', {
                  low: formatNumber(low),
                  high: formatNumber(high),
                  plus: high >= BUDGET_STEPS[BUDGET_STEPS.length - 1] ? '+' : '',
                })}
              </Text>
              <Text variant="footnote" color={defined ? colors.text2 : colors.goldDeep}>
                {defined ? t('questionnaire.dragToAdjust') : t('questionnaire.dragToDefine')}
              </Text>
              <RangeSlider
                steps={BUDGET_STEPS}
                low={low}
                high={high}
                accessibilityLabel={t('questionnaire.budgetRange')}
                formatValue={(v) => t('questionnaire.euros', { value: formatNumber(v) })}
                onChange={(l, h) => setData((prev) => ({ ...prev, budgetMin: String(l), budgetMax: String(h) }))}
              />
            </View>
            <View style={styles.row}>
              <View style={styles.flex}>
                <TextField
                  tone="surface"
                  label={t('questionnaire.minimum')}
                  value={data.budgetMin}
                  onChangeText={(v) => set('budgetMin', digits(v))}
                  placeholder="200000"
                  keyboardType="number-pad"
                />
              </View>
              <View style={styles.flex}>
                <TextField
                  tone="surface"
                  label={t('questionnaire.maximum')}
                  value={data.budgetMax}
                  onChangeText={(v) => set('budgetMax', digits(v))}
                  error={stepError}
                  placeholder="500000"
                  keyboardType="number-pad"
                />
              </View>
            </View>
            <TextField
              tone="surface"
              label={t('questionnaire.deposit')}
              value={data.apport}
              onChangeText={(v) => set('apport', digits(v))}
              placeholder="80000"
              keyboardType="number-pad"
            />
          </>
        )
      }
      case 'financement':
        return (
          <>
            <View style={{ gap: 10 }}>
              {FINANCEMENT.map((option) => (
                <OptionCard
                  key={option.value}
                  label={option.label}
                  icon={FINANCEMENT_ICONS[option.value]}
                  selected={data.financement === option.value}
                  onPress={() => set('financement', option.value)}
                />
              ))}
            </View>
            {data.financement && data.financement !== 'cash' ? (
              <Group label={t('questionnaire.loanDuration')}>
                {DUREE_PRET.map((option) => (
                  <Chip
                    key={option.value}
                    large
                    label={option.label}
                    selected={data.dureePret === option.value}
                    onPress={() => set('dureePret', option.value)}
                  />
                ))}
              </Group>
            ) : null}
          </>
        )
      case 'lieu':
        return (
          <>
            <View style={styles.rowCenter}>
              <Text variant="label" style={styles.flex}>
                {t('questionnaire.cities')}
              </Text>
              <LocationButton onCity={(city) => !data.localisation.includes(city) && set('localisation', [...data.localisation, city])} />
            </View>
            {data.localisation.length ? (
              <View style={styles.wrap}>
                {data.localisation.map((city) => (
                  <Tag key={city} label={city} onRemove={() => toggle('localisation', city)} />
                ))}
              </View>
            ) : null}
            <LocationAutocomplete
              placeholder={t('questionnaire.searchCity')}
              onSelect={(city) => !data.localisation.includes(city) && set('localisation', [...data.localisation, city])}
            />
            {data.drawnArea ? (
              <View style={{ gap: 10 }}>
                <MapZonePreview value={data.drawnArea} height={180} onPress={() => setMapOpen(true)} />
                <View style={styles.row}>
                  <Button title={t('questionnaire.editArea')} icon={MapIcon} variant="secondary" size="sm" onPress={() => setMapOpen(true)} style={styles.flex} />
                  <Button title={t('questionnaire.deleteArea')} icon={Trash2} variant="danger" size="sm" onPress={() => set('drawnArea', null)} style={styles.flex} />
                </View>
              </View>
            ) : (
              <OptionCard
                label={t('questionnaire.drawArea')}
                description={t('questionnaire.drawAreaDetail')}
                icon={MapIcon}
                selected={false}
                onPress={() => setMapOpen(true)}
              />
            )}
            <MapZoneModal
              visible={mapOpen}
              value={data.drawnArea}
              centerOn={data.localisation[0]}
              onClose={() => setMapOpen(false)}
              onChange={(value) => set('drawnArea', value)}
            />
          </>
        )
      case 'criteres':
        return (
          <>
            <Grid
              items={EQUIPEMENTS}
              columns={3}
              render={(option) => (
                <OptionCard
                  key={option.key}
                  layout="tile"
                  multiple
                  label={t(`labels.extras.${option.key}`)}
                  icon={option.icon}
                  selected={data[option.key]}
                  onPress={() => set(option.key, !data[option.key])}
                />
              )}
            />
            <TextField
              tone="surface"
              label={t('questionnaire.otherDetails')}
              value={data.commentaires}
              onChangeText={(v) => set('commentaires', v)}
              placeholder={t('questionnaire.otherDetailsPlaceholder')}
              multiline
            />
          </>
        )
      case 'situation':
        return (
          <>
            <Group label={t('questionnaire.family')}>
              {SITUATION_FAMILIALE.map((o) => (
                <Chip key={o.value} large label={o.label} selected={data.situationFamiliale === o.value} onPress={() => set('situationFamiliale', o.value)} />
              ))}
            </Group>
            <Group label={t('questionnaire.children')}>
              {NOMBRE_ENFANTS.map((o) => (
                <Chip key={o.value} large label={o.label} selected={data.nombreEnfants === o.value} onPress={() => set('nombreEnfants', o.value)} />
              ))}
            </Group>
            <Group label={t('questionnaire.professional')}>
              {SITUATION_PRO.map((o) => (
                <Chip key={o.value} large label={o.label} selected={data.situationProfessionnelle === o.value} onPress={() => set('situationProfessionnelle', o.value)} />
              ))}
            </Group>
          </>
        )
      case 'revenus':
        return (
          <>
            <TextField
              tone="surface"
              label={t('questionnaire.income')}
              value={data.salaire}
              onChangeText={(v) => set('salaire', digits(v))}
              placeholder="4500"
              keyboardType="number-pad"
            />
            <TextField
              tone="surface"
              label={t('questionnaire.assets')}
              value={data.patrimoine}
              onChangeText={(v) => set('patrimoine', digits(v))}
              placeholder="150000"
              keyboardType="number-pad"
            />
          </>
        )
      case 'calendrier':
        return (
          <>
            <View style={{ gap: 10 }}>
              {DELAI_RECHERCHE.map((option) => (
                <OptionCard
                  key={option.value}
                  label={option.label}
                  selected={data.delaiRecherche === option.value}
                  onPress={() => set('delaiRecherche', option.value)}
                />
              ))}
            </View>
            <Text variant="label" style={{ marginTop: 8 }}>
              {t('questionnaire.flexibility')}
            </Text>
            <View style={{ gap: 10 }}>
              {FLEXIBILITE.map((option) => {
                const [label, detail] = option.label.split(' (')
                return (
                  <OptionCard
                    key={option.value}
                    label={label}
                    description={detail?.replace(')', '')}
                    selected={data.flexibilite === option.value}
                    onPress={() => set('flexibilite', option.value)}
                  />
                )
              })}
            </View>
          </>
        )
    }
  }

  const current = question(step)

  return (
    <View style={styles.root}>
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Pressable accessibilityRole="button" accessibilityLabel={t('questionnaire.close')} onPress={close} hitSlop={8} style={styles.iconButton}>
          <X size={20} color={colors.ink} />
        </Pressable>
        <View style={styles.segments} accessibilityRole="progressbar" accessibilityValue={{ min: 1, max: steps.length, now: index + 1 }}>
          {steps.map((key, i) => (
            <View key={key} style={[styles.segment, i <= index ? styles.segmentOn : null]} />
          ))}
        </View>
        {!isLast ? (
          <Pressable accessibilityRole="button" onPress={() => go(index + 1)} hitSlop={8}>
            <Text style={styles.skip}>{t('questionnaire.skip')}</Text>
          </Pressable>
        ) : (
          <View style={{ width: 46 }} />
        )}
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        {loading ? (
          <View style={styles.content}>
            <Skeleton width="80%" height={30} />
            <Skeleton height={116} rounded={radius.lg} />
            <Skeleton height={116} rounded={radius.lg} />
          </View>
        ) : (
          <Animated.View
            key={step}
            entering={(forward ? SlideInRight : SlideInLeft).duration(260)}
            exiting={FadeOut.duration(100)}
            style={styles.flex}
          >
            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <Animated.View entering={FadeIn.delay(80)} style={{ gap: 8 }}>
                <Text variant="footnote" style={styles.counter}>
                  {singleSection ? t('questionnaire.edit') : t('questionnaire.counter', { current: index + 1, total: steps.length })}
                </Text>
                <Text variant="title1" accessibilityRole="header">
                  {current.title}
                </Text>
                {current.help ? <Text variant="subhead">{current.help}</Text> : null}
              </Animated.View>
              {renderStep()}
            </ScrollView>
          </Animated.View>
        )}

        <StickyFooter>
          <View style={styles.footerRow}>
            {index > 0 ? (
              <Pressable accessibilityRole="button" accessibilityLabel={t('questionnaire.previous')} onPress={() => go(index - 1)} style={styles.back}>
                <ArrowLeft size={22} color={colors.ink} />
              </Pressable>
            ) : null}
            <Button
              title={isLast ? (singleSection ? t('questionnaire.save') : t('questionnaire.saveProject')) : t('questionnaire.continue')}
              size="lg"
              loading={saving}
              disabled={loading}
              onPress={() => (isLast ? save() : go(index + 1))}
              style={styles.flex}
            />
          </View>
        </StickyFooter>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: spacing.screen, paddingBottom: 8 },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segments: { flex: 1, flexDirection: 'row', gap: 4 },
  segment: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.fill },
  segmentOn: { backgroundColor: colors.gold },
  skip: { fontFamily: fonts.semibold, fontSize: 15, color: colors.text2 },
  content: { padding: spacing.screen, paddingTop: 20, gap: 22, paddingBottom: 32 },
  counter: { fontFamily: fonts.semibold, color: colors.goldDeep },
  row: { flexDirection: 'row', gap: 10 },
  rowCenter: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  budgetCard: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: 18, gap: 10 },
  budgetValue: { fontFamily: fonts.bold, fontSize: 30, lineHeight: 36, color: colors.ink, letterSpacing: -0.6, fontVariant: ['tabular-nums'] },
  footerRow: { flexDirection: 'row', gap: 10 },
  back: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
