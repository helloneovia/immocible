import { useCallback, useState } from 'react'
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native'
import { router, Stack, useFocusEffect } from 'expo-router'
import { Image } from 'expo-image'
import { Check, Search } from 'lucide-react-native'
import { TargetRing } from '@/components/brand/TargetRing'
import { Avatar } from '@/components/ui/Avatar'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { Button } from '@/components/ui/Button'
import { ListRow, ListSection } from '@/components/ui/List'
import { Skeleton } from '@/components/ui/Skeleton'
import { Text } from '@/components/ui/Text'
import { useAuth } from '@/contexts/AuthContext'
import { useSettings } from '@/contexts/SettingsContext'
import { useUnread } from '@/contexts/UnreadContext'
import { t } from '@/i18n'
import { api } from '@/lib/api'
import { fetchArticles } from '@/lib/blog'
import { formatRelative, singleLine } from '@/lib/format'
import { useStatusBar } from '@/lib/hooks'
import { openInApp } from '@/lib/links'
import { largeTitleScrollProps } from '@/lib/navigation'
import { budgetLabel, consumeProjectSaved, normalizeProject, projectCompletion, projectHeadline, projectRings } from '@/lib/projet'
import type { Article, Conversation, QuestionnaireData } from '@/lib/types'
import { colors, fonts, radius, spacing } from '@/theme'

function Timeline({ steps }: { steps: { title: string; detail: string; state: 'done' | 'current' | 'upcoming' }[] }) {
  return (
    <View style={styles.timeline}>
      {steps.map((step, index) => {
        const last = index === steps.length - 1
        return (
          <View key={step.title} style={styles.timelineRow} accessible accessibilityLabel={`${step.title}. ${step.detail}`}>
            <View style={styles.timelineRail}>
              <View
                style={[
                  styles.timelineDot,
                  step.state === 'done' ? styles.dotDone : step.state === 'current' ? styles.dotCurrent : null,
                ]}
              >
                {step.state === 'done' ? (
                  <Check size={13} color={colors.surface} strokeWidth={3} />
                ) : (
                  <Text style={[styles.dotNumber, step.state === 'current' ? { color: colors.navy } : null]}>{index + 1}</Text>
                )}
              </View>
              {!last ? <View style={[styles.timelineLine, step.state === 'done' ? { backgroundColor: colors.success } : null]} /> : null}
            </View>
            <View style={[styles.timelineText, !last ? { paddingBottom: 18 } : null]}>
              <Text style={[styles.timelineTitle, step.state === 'upcoming' ? { color: colors.text3 } : null]}>{step.title}</Text>
              <Text variant="footnote">{step.detail}</Text>
            </View>
          </View>
        )
      })}
    </View>
  )
}

export default function AccueilScreen() {
  const { user } = useAuth()
  const settings = useSettings()
  const { refresh: refreshUnread } = useUnread()
  const [project, setProject] = useState<QuestionnaireData | null>(null)
  const [hasProject, setHasProject] = useState(false)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [articles, setArticles] = useState<Article[]>([])
  const [popupVisible, setPopupVisible] = useState(false)
  useStatusBar('dark')

  const load = useCallback(async () => {
    const [projectResult, conversationResult] = await Promise.allSettled([
      api<{ data: QuestionnaireData | null }>('/api/acquereur/questionnaire'),
      api<{ conversations: Conversation[] }>('/api/chat/conversations'),
    ])
    if (projectResult.status === 'fulfilled') {
      const saved = projectResult.value?.data
      setHasProject(!!saved)
      setProject(normalizeProject(saved))
      if (saved && consumeProjectSaved()) setPopupVisible(true)
    }
    if (conversationResult.status === 'fulfilled') setConversations(conversationResult.value?.conversations || [])
    setLoading(false)
    setRefreshing(false)
    refreshUnread()
    fetchArticles()
      .then((list) => setArticles(list.slice(0, 6)))
      .catch(() => {})
  }, [refreshUnread])

  useFocusEffect(
    useCallback(() => {
      load()
    }, [load]),
  )

  const firstName = user?.profile?.prenom
  const data = project ?? normalizeProject(null)
  const completion = projectCompletion(data)
  const complete = hasProject && completion >= 1
  const rings = projectRings(data)
  const recent = conversations.slice(0, 2)

  // Les étapes restent ordonnées ; le message de bienvenue d'IMMOCIBLE n'est pas une proposition d'agence.
  const proposed = hasProject && conversations.some((conv) => !conv.isPlatform)
  const timeline = [
    {
      title: t('project.home.stepSaved'),
      detail: hasProject ? t('project.home.stepSavedDone') : t('project.home.stepSavedTodo'),
      state: hasProject ? ('done' as const) : ('current' as const),
    },
    {
      title: t('project.home.stepAnalysis'),
      detail: t('project.home.stepAnalysisDetail'),
      state: proposed ? ('done' as const) : hasProject ? ('current' as const) : ('upcoming' as const),
    },
    {
      title: t('project.home.stepProposal'),
      detail: t('project.home.stepProposalDetail'),
      state: proposed ? ('done' as const) : ('upcoming' as const),
    },
  ]

  return (
    <>
      <Stack.Screen
        options={{
          title: firstName ? t('project.home.greeting', { name: firstName }) : t('project.home.title'),
          headerRight: () => (
            <Pressable accessibilityRole="button" accessibilityLabel={t('project.home.profile')} onPress={() => router.navigate('/acquereur/profil')}>
              <Avatar name={firstName || user?.email} size={34} />
            </Pressable>
          ),
        }}
      />
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
        {/* Carte projet : la cible se remplit avec le bien, le budget et le lieu. */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={hasProject ? t('project.home.viewProject') : t('project.home.defineProject')}
          onPress={() => (hasProject ? router.navigate('/acquereur/projet') : router.push('/questionnaire'))}
          style={({ pressed }) => [styles.hero, pressed ? { transform: [{ scale: 0.99 }] } : null]}
        >
          {loading ? (
            <View style={styles.heroRow}>
              <Skeleton width={128} height={128} rounded={64} style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
              <View style={{ flex: 1, gap: 10 }}>
                <Skeleton width="50%" height={12} style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
                <Skeleton width="90%" height={22} style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
              </View>
            </View>
          ) : (
            <>
              <View style={styles.heroRow}>
                <TargetRing rings={rings} size={128} />
                <View style={styles.heroText}>
                  <Text style={styles.heroEyebrow}>{t('project.home.eyebrow')}</Text>
                  <Text variant="serifTitle" numberOfLines={3} style={{ fontSize: 22, lineHeight: 27 }}>
                    {hasProject ? projectHeadline(data) : t('project.home.emptyHeadline')}
                  </Text>
                  {hasProject ? (
                    <Text style={styles.heroBudget}>{budgetLabel(data.budgetMin, data.budgetMax)}</Text>
                  ) : null}
                </View>
              </View>
              <View style={styles.legend}>
                {rings.map((ring, index) => (
                  <View key={ring.label} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: [colors.gold, colors.goldLight, colors.surface][index] }]} />
                    <Text style={styles.legendText}>{ring.label}</Text>
                    {ring.value >= 1 ? <Check size={13} color={colors.gold} strokeWidth={3} /> : null}
                  </View>
                ))}
              </View>
              <View style={styles.heroFooter}>
                <View style={[styles.status, complete ? styles.statusLive : null]}>
                  <View style={[styles.statusDot, { backgroundColor: complete ? '#4ADE80' : colors.gold }]} />
                  <Text style={styles.statusText}>
                    {complete ? t('project.home.statusVisible') : hasProject ? t('project.home.statusIncomplete') : t('project.home.statusStart')}
                  </Text>
                </View>
                <Button
                  title={hasProject ? (complete ? t('project.home.view') : t('project.home.complete')) : t('project.home.start')}
                  variant={complete ? 'glass' : 'accent'}
                  size="sm"
                  fullWidth={false}
                  onPress={() => (hasProject && complete ? router.navigate('/acquereur/projet') : router.push('/questionnaire'))}
                />
              </View>
            </>
          )}
        </Pressable>

        <ListSection title={t('project.home.timelineTitle')}>
          <View>
            <Timeline steps={timeline} />
          </View>
        </ListSection>

        <ListSection title={t('project.home.messages')} action={{ label: t('project.home.seeAll'), onPress: () => router.navigate('/acquereur/messages') }}>
          {recent.length === 0 ? (
            <ListRow
              title={t('project.home.noMessages')}
              subtitle={t('project.home.noMessagesDetail')}
              onPress={() => router.navigate('/acquereur/messages')}
            />
          ) : (
            recent.map((conv) => {
              const name = conv.agency?.profile?.nomAgence || conv.agency?.email || t('project.home.agency')
              const last = conv.messages?.[0]
              const unread = conv._count?.messages ?? 0
              return (
                <ListRow
                  key={conv.id}
                  left={<Avatar name={name} size={40} />}
                  title={name}
                  subtitle={last?.content ? singleLine(last.content) : t('project.home.newConversation')}
                  value={formatRelative(last?.createdAt ?? conv.updatedAt)}
                  badge={unread || undefined}
                  onPress={() => router.push({ pathname: '/conversation/[id]', params: { id: conv.id, name, role: conv.isPlatform ? t('project.home.platform') : t('project.home.agency') } })}
                />
              )
            })
          )}
        </ListSection>

        {articles.length > 0 ? (
          <View style={{ gap: 6 }}>
            <View style={styles.sectionHeader}>
              <Text variant="footnote" style={styles.sectionTitle}>
                {t('project.home.tips')}
              </Text>
              <Pressable accessibilityRole="link" hitSlop={10} onPress={() => router.push('/blog')}>
                <Text style={styles.sectionAction}>{t('project.home.blog')}</Text>
              </Pressable>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel} decelerationRate="fast" snapToInterval={252}>
              {articles.map((article) => (
                <Pressable
                  key={article.id}
                  accessibilityRole="link"
                  accessibilityLabel={article.title}
                  onPress={() =>
                    article.url ? openInApp(article.url) : router.push({ pathname: '/blog/[slug]', params: { slug: article.slug } })
                  }
                  style={({ pressed }) => [styles.article, pressed ? { opacity: 0.9 } : null]}
                >
                  {article.featuredImage ? (
                    <Image source={{ uri: article.featuredImage }} style={styles.articleImage} contentFit="cover" transition={200} />
                  ) : (
                    <View style={[styles.articleImage, { backgroundColor: colors.fill }]} />
                  )}
                  <Text numberOfLines={3} style={styles.articleTitle}>
                    {article.title}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        ) : null}
      </ScrollView>

      <BottomSheet
        visible={popupVisible}
        onClose={() => setPopupVisible(false)}
        footer={<Button title={t('project.home.gotIt')} size="lg" onPress={() => setPopupVisible(false)} />}
      >
        <View style={styles.popup}>
          <View style={styles.popupIcon}>
            <Search size={30} color={colors.gold} />
          </View>
          <Text variant="title2" center>
            {settings.text_buyer_dashboard_popup_title}
          </Text>
          <Text variant="subhead" center>
            {settings.text_buyer_dashboard_popup_description}
          </Text>
        </View>
      </BottomSheet>
    </>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.screen, gap: 26, paddingBottom: 40 },
  hero: { backgroundColor: colors.navy, borderRadius: radius.xxl, padding: 20, gap: 18 },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  heroText: { flex: 1, gap: 6 },
  heroEyebrow: { fontFamily: fonts.semibold, fontSize: 13, color: colors.gold },
  heroBudget: { fontFamily: fonts.medium, fontSize: 15, color: 'rgba(255,255,255,0.75)' },
  legend: { flexDirection: 'row', gap: 14 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontFamily: fonts.medium, fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  heroFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.16)',
  },
  status: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusLive: {},
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontFamily: fonts.medium, fontSize: 14, color: colors.surface },
  timeline: { paddingHorizontal: spacing.lg, paddingVertical: 16 },
  timelineRow: { flexDirection: 'row', gap: 14 },
  timelineRail: { alignItems: 'center' },
  timelineDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.fill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotDone: { backgroundColor: colors.success },
  dotCurrent: { backgroundColor: colors.goldSoft, borderWidth: 2, borderColor: colors.gold },
  dotNumber: { fontFamily: fonts.bold, fontSize: 12, color: colors.text3 },
  timelineLine: { flex: 1, width: 2, backgroundColor: colors.fill, marginVertical: 4 },
  timelineText: { flex: 1, gap: 2, paddingTop: 3 },
  timelineTitle: { fontFamily: fonts.semibold, fontSize: 16, color: colors.ink },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.lg },
  sectionTitle: { fontFamily: fonts.semibold, color: colors.text3 },
  sectionAction: { fontFamily: fonts.semibold, fontSize: 14, color: colors.goldDeep },
  carousel: { gap: 12, paddingRight: spacing.screen },
  article: { width: 240, backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden' },
  articleImage: { width: '100%', height: 124 },
  articleTitle: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 20, color: colors.ink, padding: 12 },
  popup: { alignItems: 'center', gap: 12, paddingVertical: 8 },
  popupIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
