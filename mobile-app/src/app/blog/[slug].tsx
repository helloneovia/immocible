import { useEffect, useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { Image } from 'expo-image'
import { BookOpen } from 'lucide-react-native'
import { EmptyState, LoadingView } from '@/components/ui/Layout'
import { pushedScreenOptions } from '@/lib/navigation'
import { Text } from '@/components/ui/Text'
import { articleBlocks, fetchArticle } from '@/lib/blog'
import { useStatusBar } from '@/lib/hooks'
import type { Article } from '@/lib/types'
import { colors, fonts, radius, spacing } from '@/theme'

export default function ArticleScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  useStatusBar('dark')

  useEffect(() => {
    fetchArticle(slug)
      .then(setArticle)
      .catch(() => setArticle(null))
      .finally(() => setLoading(false))
  }, [slug])

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ ...pushedScreenOptions, title: '' }} />
      {loading ? (
        <LoadingView />
      ) : !article ? (
        <EmptyState
          icon={BookOpen}
          title="Article introuvable"
          actionLabel="Retour au blog"
          onAction={() => router.back()}
          style={{ margin: spacing.screen }}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title} accessibilityRole="header">
            {article.title}
          </Text>
          {article.featuredImage ? (
            <Image source={{ uri: article.featuredImage }} style={styles.image} contentFit="cover" transition={200} />
          ) : null}
          {articleBlocks(article).map((block, index) => (
            <Text
              key={index}
              selectable
              accessibilityRole={block.kind === 'heading' ? 'header' : undefined}
              style={block.kind === 'heading' ? styles.heading : styles.paragraph}
            >
              {block.kind === 'bullet' ? `•  ${block.text}` : block.text}
            </Text>
          ))}
        </ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.screen, gap: 18, paddingBottom: 48 },
  title: { fontFamily: fonts.bold, fontSize: 28, lineHeight: 34, color: colors.ink },
  image: { width: '100%', aspectRatio: 16 / 10, borderRadius: radius.lg },
  paragraph: { fontFamily: fonts.light, fontSize: 17, lineHeight: 27, color: colors.slate700 },
  heading: { fontFamily: fonts.bold, fontSize: 21, lineHeight: 28, color: colors.ink, marginTop: 8 },
})
