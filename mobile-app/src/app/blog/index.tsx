import { useCallback, useEffect, useState } from 'react'
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native'
import { router, Stack } from 'expo-router'
import { Image } from 'expo-image'
import { ArrowRight, BookOpen } from 'lucide-react-native'
import { PhotoBackdrop, PHOTOS } from '@/components/brand/AuthBackground'
import { Card } from '@/components/ui/Card'
import { EmptyState, LoadingView } from '@/components/ui/Layout'
import { pushedScreenOptions } from '@/lib/navigation'
import { Text } from '@/components/ui/Text'
import { t } from '@/i18n'
import { fetchArticles } from '@/lib/blog'
import { useStatusBar } from '@/lib/hooks'
import { openInApp } from '@/lib/links'
import type { Article } from '@/lib/types'
import { colors, fonts, radius, spacing } from '@/theme'

export default function BlogScreen() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  useStatusBar('dark')

  const load = useCallback(async () => {
    try {
      setArticles(await fetchArticles())
    } catch {
      setArticles([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ ...pushedScreenOptions, title: t('profile.blog.title') }} />
      {loading ? (
        <LoadingView />
      ) : (
        <FlatList
          data={articles}
          keyExtractor={(item) => item.id}
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
          ListHeaderComponent={
            <View style={styles.hero}>
              <PhotoBackdrop uri={PHOTOS.blog} opacity={0.7} />
              <Text style={styles.heroTitle}>{t('profile.blog.heroTitle')}</Text>
              <Text style={styles.heroText}>{t('profile.blog.heroText')}</Text>
            </View>
          }
          ListEmptyComponent={
            <EmptyState
              icon={BookOpen}
              title={t('profile.blog.comingSoon')}
              message={t('profile.blog.comingSoonMessage')}
              style={styles.padded}
            />
          }
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
          renderItem={({ item }) => (
            <Card
              style={styles.card}
              accessibilityLabel={item.title}
              onPress={() =>
                item.url ? openInApp(item.url) : router.push({ pathname: '/blog/[slug]', params: { slug: item.slug } })
              }
            >
              {item.featuredImage ? (
                <Image source={{ uri: item.featuredImage }} style={styles.image} contentFit="cover" transition={200} />
              ) : null}
              <View style={styles.cardBody}>
                <Text variant="heading" numberOfLines={2}>
                  {item.title}
                </Text>
                {item.excerpt ? (
                  <Text variant="bodyLight" numberOfLines={3}>
                    {item.excerpt}
                  </Text>
                ) : null}
                <View style={styles.readMore}>
                  <Text style={styles.readText}>{t('profile.blog.readArticle')}</Text>
                  <ArrowRight size={16} color={colors.ink} />
                </View>
              </View>
            </Card>
          )}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 40 },
  hero: {
    overflow: 'hidden',
    paddingHorizontal: spacing.screen,
    paddingVertical: 36,
    gap: 8,
    marginBottom: 20,
    backgroundColor: colors.ink,
  },
  heroTitle: { fontFamily: fonts.bold, fontSize: 30, lineHeight: 36, color: colors.white },
  heroText: { fontFamily: fonts.light, fontSize: 16, lineHeight: 24, color: colors.slate200 },
  padded: { marginHorizontal: spacing.screen },
  card: { marginHorizontal: spacing.screen, padding: 0 },
  image: { height: 180, width: '100%', borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg },
  cardBody: { padding: 16, gap: 8 },
  readMore: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  readText: { fontFamily: fonts.semibold, fontSize: 14, color: colors.ink },
})
