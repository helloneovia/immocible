import { useCallback, useEffect, useState } from 'react'
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { FileText } from 'lucide-react-native'
import { EmptyState, LoadingView } from '@/components/ui/Layout'
import { Text } from '@/components/ui/Text'
import { t } from '@/i18n'
import { api } from '@/lib/api'
import { useStatusBar } from '@/lib/hooks'
import { pushedScreenOptions } from '@/lib/navigation'
import { colors, fonts, radius, spacing } from '@/theme'

type Segment = { text: string; href?: string; missing?: boolean }
type Block = { kind: 'paragraph'; segments: Segment[] } | { kind: 'list'; items: Segment[][] }
interface LegalDocument {
  title: string
  lastUpdated: string
  notice: string | null
  sections: { title: string; blocks: Block[] }[]
}

/** Liens internes des pages légales (ex. « /confidentialite ») ouverts dans l'écran natif. */
function openLink(href: string) {
  router.push({ pathname: '/legal/[slug]', params: { slug: href.replace(/^\//, '') } })
}

function Segments({ segments }: { segments: Segment[] }) {
  return (
    <Text selectable style={styles.body}>
      {segments.map((segment, i) =>
        segment.missing ? (
          <Text key={i} style={styles.missing}>
            {segment.text}
          </Text>
        ) : segment.href ? (
          <Text key={i} style={styles.link} accessibilityRole="link" onPress={() => openLink(segment.href!)}>
            {segment.text}
          </Text>
        ) : (
          segment.text
        ),
      )}
    </Text>
  )
}

/**
 * Pages légales en natif : même contenu que le site, lu sur le serveur
 * (modifiable dans l'admin, Paramètres › Informations légales).
 */
export default function LegalScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const [document, setDocument] = useState<LegalDocument | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  useStatusBar('dark')

  const load = useCallback(async () => {
    try {
      setDocument(await api<LegalDocument>(`/api/public/legal/${encodeURIComponent(slug)}`))
    } catch {
      setDocument(null)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [slug])

  useEffect(() => {
    load()
  }, [load])

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ ...pushedScreenOptions, title: document?.title ?? '' }} />
      {loading ? (
        <LoadingView />
      ) : !document ? (
        <EmptyState
          icon={FileText}
          title={t('profile.legal.unavailable')}
          message={t('profile.legal.checkConnection')}
          actionLabel={t('profile.legal.retry')}
          onAction={() => {
            setLoading(true)
            load()
          }}
          style={{ margin: spacing.screen }}
        />
      ) : (
        <ScrollView
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
          <View style={{ gap: 6 }}>
            <Text variant="title1" accessibilityRole="header">
              {document.title}
            </Text>
            <Text variant="footnote">{t('profile.legal.lastUpdated', { date: document.lastUpdated })}</Text>
          </View>

          {document.notice ? (
            <View style={styles.notice}>
              <Text style={styles.noticeText}>{document.notice}</Text>
            </View>
          ) : null}

          {document.sections.map((section) => (
            <View key={section.title} style={styles.section}>
              <Text variant="headline" accessibilityRole="header">
                {section.title}
              </Text>
              {section.blocks.map((block, i) =>
                block.kind === 'paragraph' ? (
                  <Segments key={i} segments={block.segments} />
                ) : (
                  <View key={i} style={{ gap: 8 }}>
                    {block.items.map((item, j) => (
                      <View key={j} style={styles.bullet}>
                        <Text style={styles.body}>•</Text>
                        <View style={{ flex: 1 }}>
                          <Segments segments={item} />
                        </View>
                      </View>
                    ))}
                  </View>
                ),
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.screen, gap: 24, paddingBottom: 48 },
  notice: { backgroundColor: colors.goldSoft, borderRadius: radius.md, padding: 14 },
  noticeText: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 20, color: colors.goldDeep },
  section: { gap: 10 },
  body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24, color: colors.slate700 },
  missing: { fontFamily: fonts.semibold, color: colors.goldDeep, backgroundColor: colors.goldSoft },
  link: { color: colors.navy, textDecorationLine: 'underline' },
  bullet: { flexDirection: 'row', gap: 8 },
})
